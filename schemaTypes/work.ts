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
