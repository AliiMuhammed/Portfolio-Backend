import {defineField} from 'sanity'

export const nonblank = (value: unknown) => typeof value === 'string' && value.trim().length > 0 || 'Enter nonblank text.'
const image = (name: string, title: string) => defineField({
  name, title, type: 'image', options: {hotspot: true},
  fields: [{name: 'alt', title: 'Alternative text', type: 'string'}, {name: 'caption', title: 'Caption', type: 'string'}],
  validation: (Rule) => Rule.custom(value => !value || value.asset?._ref && typeof value.alt === 'string' && value.alt.trim() ? true : 'Select an image and describe it with alternative text.'),
})
const safeHref = (value: unknown) => {
  if (typeof value !== 'string') return 'Enter a safe link.'
  if (/^\/(?!\/)/.test(value) && !/[\\\s]/.test(value)) return true
  try {const url = new URL(value); return ['https:', 'http:', 'mailto:'].includes(url.protocol) && !url.username && !url.password || 'Use HTTP, HTTPS, email or a local path.'} catch {return 'Enter a valid URL.'}
}
export const richContent = defineField({name: 'richContent', type: 'array', of: [
      {type: 'block', styles: [{title: 'Paragraph', value: 'normal'}, {title: 'Heading 2', value: 'h2'}, {title: 'Heading 3', value: 'h3'}], lists: [{title: 'Bulleted', value: 'bullet'}, {title: 'Numbered', value: 'number'}], marks: {decorators: [{title: 'Bold', value: 'strong'}, {title: 'Emphasis', value: 'em'}, {title: 'Inline code', value: 'code'}], annotations: [{name: 'link', type: 'object', fields: [{name: 'href', title: 'Link', type: 'string', validation: Rule => Rule.required().custom(safeHref)}]}]}},
      {name: 'articleCode', title: 'Code block', type: 'object', fields: [
        {name: 'code', type: 'text', validation: Rule => Rule.required().custom(nonblank)},
        {name: 'language', type: 'string', options: {list: ['text', 'javascript', 'typescript', 'jsx', 'html', 'css', 'json', 'bash', 'python']}},
        {name: 'caption', type: 'string'},
      ]},
      {...image('articleImage', 'Embedded image'), validation: Rule => Rule.required().custom(value => {const item = value as {asset?: {_ref?: string}; alt?: string} | undefined; return item?.asset?._ref && typeof item.alt === 'string' && item.alt.trim() ? true : 'Select an image and enter alternative text.'})},
      {name: 'articleCallout', title: 'Callout', type: 'object', fields: [{name: 'text', type: 'text', validation: Rule => Rule.required().custom(nonblank)}]},
    ]}).of
