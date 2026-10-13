import {defineField, defineType} from 'sanity'

import {nonblank, richContent} from './richContent'

const image = (name: string, title: string) => defineField({
  name, title, type: 'image', options: {hotspot: true},
  fields: [{name: 'alt', title: 'Alternative text', type: 'string'}, {name: 'caption', title: 'Caption', type: 'string'}],
  validation: (Rule) => Rule.custom(value => !value || value.asset?._ref && typeof value.alt === 'string' && value.alt.trim() ? true : 'Select an image and describe it with alternative text.'),
})
export const articleType = defineType({
  name: 'article', title: 'Writing & Engineering Notes', type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: Rule => Rule.required().max(140).custom(nonblank)}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title', maxLength: 96}, description: 'Permanent public URL. Keep it unchanged after publishing.',
      validation: Rule => Rule.required().custom(async (value, context) => {
        if (!value?.current || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current) || value.current.length > 96) return 'Use a lowercase, hyphen-separated slug (up to 96 characters).'
        const id = context.document?._id?.replace(/^drafts\./, '')
        if (!id) return true
        try {
          const published = await context.getClient({apiVersion: '2024-01-01'}).fetch<string | null>('*[_id == $id && _type == "article"][0].slug.current', {id}, {perspective: 'published'})
          return !published || published === value.current || 'Published URLs are permanent. Keep the original slug; a URL migration needs a reviewed redirect.'
        } catch {return 'Unable to verify the permanent URL. Retry before publishing.'}
      }),
    }),
    defineField({name: 'entryType', title: 'Format', type: 'string', options: {list: [{title: 'Article', value: 'article'}, {title: 'Field note', value: 'note'}]}, initialValue: 'article', validation: Rule => Rule.required().custom(value => ['article', 'note'].includes(value || '') || 'Choose Article or Field note.')}),
    defineField({name: 'excerpt', type: 'text', rows: 3, validation: Rule => Rule.required().max(300).custom(nonblank)}),
    defineField({name: 'topic', type: 'string', validation: Rule => Rule.required().max(80).custom(nonblank)}),
    defineField({name: 'tags', type: 'array', of: [{type: 'string', validation: Rule => Rule.custom(nonblank)}], validation: Rule => Rule.unique().max(5)}),
    defineField({name: 'publishedAt', title: 'Publication date', type: 'datetime', validation: Rule => Rule.required()}),
    defineField({name: 'featured', type: 'boolean', initialValue: false}),
    image('coverImage', 'Cover image'), image('socialImage', 'Social preview image'),
    defineField({name: 'seoTitle', title: 'SEO title (optional)', type: 'string', validation: Rule => Rule.max(70)}),
    defineField({name: 'seoDescription', title: 'SEO description (optional)', type: 'text', rows: 2, validation: Rule => Rule.max(160)}),
    defineField({name: 'body', type: 'array', validation: Rule => Rule.required().min(1), of: richContent}),
  ],
  preview: {select: {title: 'title', subtitle: 'entryType', media: 'coverImage'}},
  orderings: [{title: 'Newest first', name: 'newest', by: [{field: 'publishedAt', direction: 'desc'}]}],
})
