import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Ali-portfolio',

  projectId: 'yv2hgb0y',
  dataset: 'production',

  plugins: [structureTool({
    structure: (S) => S.list().title('Content').items([
      ...S.documentTypeListItems().filter((item) => item.getId() !== 'resumeSettings'),
      S.listItem().title('Résumé Settings').id('resumeSettings').child(
        S.document().schemaType('resumeSettings').documentId('resumeSettings'),
      ),
    ]),
  }), visionTool()],

  document: {
    newDocumentOptions: (options) => options.filter((option) => option.templateId !== 'resumeSettings'),
    actions: (actions, context) => context.schemaType === 'resumeSettings'
      ? actions.filter(({action}) => action && ['publish', 'discardChanges', 'restore'].includes(action))
      : actions,
  },

  schema: {
    types: schemaTypes,
  },
})
