import {defineField, defineType} from 'sanity'

export const resumeSettingsType = defineType({
  name: 'resumeSettings',
  title: 'Résumé Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'skillsManaged', title: 'Use CMS Skills', type: 'boolean', initialValue: false,
      description: 'Enable only after verifying the published Skills inventory. Once enabled, zero published skills means an empty section, not the legacy list.',
    }),
    defineField({
      name: 'cvFile', title: 'Current Résumé (PDF)', type: 'file',
      options: {accept: 'application/pdf'},
      description: 'Publish a PDF to replace the frontend download. Without one, the bundled résumé remains available.',
      validation: (Rule) => Rule.custom(async (value, context) => {
        if (!value) return true
        const ref = value.asset?._ref
        if (!ref) return 'Select a PDF asset.'
        const asset = await context.getClient({apiVersion: '2024-01-01'}).fetch<{mimeType?: string; extension?: string} | null>(
          '*[_id == $id][0]{mimeType, extension}', {id: ref},
        )
        return asset?.mimeType === 'application/pdf' && asset?.extension === 'pdf' || 'Only PDF assets are accepted.'
      }),
    }),
  ],
  preview: {prepare: () => ({title: 'Current Résumé & Skills Settings'})},
})
