import {defineField, defineType} from 'sanity'

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
