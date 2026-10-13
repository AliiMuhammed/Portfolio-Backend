import {defineField, defineType} from 'sanity'
import {richContent} from './richContent'

export const meaningfulCaseStudy = (value: unknown) => Array.isArray(value) && value.some(block => {
  if (block?._type === 'block') return Array.isArray(block.children) && block.children.some((child: {text?: unknown}) => (child as { _type?: string })?._type === 'span' && typeof child?.text === 'string' && child.text.trim())
  return ['articleCode', 'articleCallout'].includes(block?._type) && typeof block[block._type === 'articleCode' ? 'code' : 'text'] === 'string' && block[block._type === 'articleCode' ? 'code' : 'text'].trim()
})

export const workType = defineType({
  name: 'work',
  title: 'Work',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
    }),
    defineField({
      name: 'description',
      type: 'string',
      title: 'Description',
    }),
    defineField({
      name: 'showOnHomePage',
      title: 'Show on Home Page',
      type: 'boolean',
      description: "Enable this option to feature the project in the portfolio Home page's Selected Work section.",
      initialValue: false,
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      description: 'Card summary. Cards use the legacy Description until this is supplied.',
      validation: (Rule) => Rule.max(300),
    }),
    defineField({
      name: 'longDescription',
      title: 'Long Description',
      type: 'text',
      description: 'Factual project details. Leave blank to use the legacy Description.',
    }),
    defineField({
      name: 'slug', title: 'Case Study URL', type: 'slug',
      options: {source: 'title', maxLength: 96},
      description: 'Optional permanent URL. Generate deliberately; never change a published slug.',
      validation: Rule => Rule.custom(async (value, context) => {
        if (!value?.current) {
          if (context.document?.caseStudyPublished === true) return 'Select a slug before enabling the case study.'
        } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current) || value.current.length > 96) return 'Use a lowercase, hyphen-separated slug (up to 96 characters).'
        const id = context.document?._id?.replace(/^drafts\./, '')
        if (!id) return true
        try {
          const published = await context.getClient({apiVersion: '2024-01-01'}).fetch<string | null>('*[_id == $id && _type == "work"][0].slug.current', {id}, {perspective: 'published'})
          return !published || published === value?.current || 'Published URLs are permanent. Keep the original slug; redirects require review.'
        } catch {return 'Unable to verify the permanent URL. Retry before publishing.'}
      }),
    }),
    defineField({
      name: 'caseStudyPublished', title: 'Publish Case Study', type: 'boolean', initialValue: false,
      description: 'Keep off while preparing the narrative. Enable only after reviewing the complete case study, then publish the Work document.',
      validation: Rule => Rule.custom((value, context) => {
        if (value !== true) return true
        const document = context.document
        const slug = (document?.slug as {current?: string} | undefined)?.current
        return typeof document?.title === 'string' && document.title.trim()
          && typeof slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 96
          && meaningfulCaseStudy(document.caseStudy)
          || 'A case study needs a title, valid slug and meaningful narrative before it can be visible.'
      }),
    }),
    defineField({
      name: 'caseStudy', title: 'Engineering Case Study', type: 'array', of: richContent,
      description: 'Owner-authored context, decisions and lessons. Only include verified information; legacy descriptions remain separate.',
      validation: Rule => Rule.custom((value, context) => context.document?.caseStudyPublished !== true || meaningfulCaseStudy(value) || 'Add meaningful case-study content before enabling visibility.'),
    }),
    defineField({
      name: 'imageurl',
      type: 'image',
      title: 'ImgUrl',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'link',
      type: 'url',
      title: 'Link',
    }),
    defineField({
      name: 'github',
      type: 'url',
      title: 'Github',
    }),
    defineField({
      name: 'techStack',
      type: 'array',
      title: 'Tech Stack',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'video',
      type: 'url',
      title: 'Video',
    }),
  ],
})
