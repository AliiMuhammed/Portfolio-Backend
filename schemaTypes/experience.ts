import { defineField, defineType } from 'sanity';

export const experienceType = defineType({
  name: 'experience',
  title: 'Experience',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
    }),
    defineField({
      name: 'company',
      type: 'string',
      title: 'Company',
    }),
    defineField({
      name: 'startDate',
      type: 'date',
      title: 'Start Date',
      options: {
        dateFormat: 'MMM yyyy', 
      },
    }),
    defineField({
      name: 'endDate',
      type: 'date',
      title: 'End Date',
      options: {
        dateFormat: 'MMM yyyy', 
      },
    }),
  ],
});
