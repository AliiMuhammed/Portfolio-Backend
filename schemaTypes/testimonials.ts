import { defineField, defineType } from 'sanity';

export const testimonialsType = defineType({
  name: 'testimonials',
  title: 'Testimonials',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'Name',
      description: 'Name of the person leaving the comment',
    }),
    defineField({
      name: 'company',
      type: 'string',
      title: 'Company',
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
      name: 'feedback',
      type: 'string',
      title: 'Feedback',
    }),
  ],
});
