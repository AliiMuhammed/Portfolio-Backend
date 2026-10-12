import {defineField, defineType} from 'sanity'
import {SkillIconInput} from './inputs/SkillIconInput'
import {isIconId, legacyIconId} from './inputs/iconIdentifiers'

export const skillType = defineType({
  name: 'skill',
  title: 'Skills',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'category', title: 'Category', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'iconId', title: 'Skill Icon', type: 'string',
      components: {input: SkillIconInput},
      description: 'Select an original portfolio icon or search the Iconify catalog. No image upload is required.',
      validation: (Rule) => Rule.custom(async (value, context) => {
        if (isIconId(value)) return true
        if (value) return 'Select a valid local icon or Iconify collection:name.'
        const doc = context.document
        if (!legacyIconId(doc?.iconPath, doc?.iconPackage)) return 'Select a skill icon.'
        const id = doc?._id?.replace(/^drafts\./, '')
        if (!id) return 'Select a skill icon.'
        // Existing published legacy records may migrate without an icon-service dependency.
        try {
          const published = await context.getClient({apiVersion: '2024-01-01'}).fetch<boolean>(
            'defined(*[_id == $id && _type == "skill"][0]._id)', {id}, {perspective: 'published'},
          )
          return published || 'New skills must select an icon.'
        } catch {return 'Unable to verify the legacy record. Select an icon or retry.'}
      }),
    }),
    defineField({name: 'iconPackage', title: 'Legacy package', type: 'string', hidden: true, readOnly: true}),
    defineField({name: 'iconPath', title: 'Legacy path', type: 'string', hidden: true, readOnly: true}),
    defineField({name: 'icon', title: 'Legacy uploaded icon', type: 'image', hidden: true, readOnly: true}),
    defineField({name: 'order', title: 'Display Order', type: 'number', validation: (Rule) => Rule.integer().min(0)}),
  ],
  preview: {select: {title: 'name', subtitle: 'category'}},
  orderings: [{title: 'Display order', name: 'displayOrder', by: [{field: 'order', direction: 'asc'}, {field: 'name', direction: 'asc'}]}],
})
