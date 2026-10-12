import {defineField, defineType} from 'sanity'

export const skillType = defineType({
  name: 'skill',
  title: 'Skills',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'category', title: 'Category', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'icon', title: 'Icon', type: 'image',
      description: 'Upload a PNG or WebP icon; transparent backgrounds are supported.',
      options: {accept: 'image/png,image/webp'},
      validation: (Rule) => Rule.required().assetRequired(),
    }),
    defineField({name: 'order', title: 'Display Order', type: 'number', validation: (Rule) => Rule.integer().min(0)}),
  ],
  preview: {select: {title: 'name', subtitle: 'category', media: 'icon'}},
  orderings: [{title: 'Display order', name: 'displayOrder', by: [{field: 'order', direction: 'asc'}, {field: 'name', direction: 'asc'}]}],
})
