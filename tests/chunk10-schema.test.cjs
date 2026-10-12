const {test} = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
// Evaluate schema definitions without connecting to a dataset.
const load = (name) => {
  const exports = {}
  const js = ts.transpileModule(fs.readFileSync(`schemaTypes/${name}.ts`, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS}}).outputText
  vm.runInNewContext(js, {exports, require: () => ({defineType: value => value, defineField: value => value})})
  return Object.values(exports)[0]
}
const field = (schema, name) => schema.fields.find(f => f.name === name)
test('Work keeps every original field and adds an opt-in flag and optional descriptions', () => {
  const work = load('work')
  assert.equal(work.name, 'work')
  for (const name of ['title','description','imageurl','link','github','techStack','video']) assert.ok(field(work, name))
  assert.equal(field(work, 'description').type, 'string')
  assert.equal(field(work, 'showOnHomePage').initialValue, false)
  assert.equal(field(work, 'shortDescription').type, 'text')
  assert.equal(field(work, 'longDescription').type, 'text')
  let max
  field(work, 'shortDescription').validation({max: value => {max = value}})
  assert.equal(max, 300)
})
test('Skills support named categorized uploaded icons and optional ordering', () => {
  const skill = load('skill')
  assert.equal(skill.name, 'skill')
  for (const name of ['name','category','icon']) {
    let required = false
    const rule = {required: () => {required = true; return rule}, assetRequired: () => rule}
    field(skill, name).validation(rule)
    assert.equal(required, true)
  }
  assert.equal(field(skill, 'icon').options.accept, 'image/png,image/webp')
  assert.equal(field(skill, 'order').type, 'number')
  assert.equal(skill.preview.select.title, 'name')
})
test('PDF validation rejects missing references and non-PDF asset metadata, without live requests', async () => {
  const settings = load('resumeSettings')
  assert.equal(field(settings, 'skillsManaged').initialValue, false)
  assert.equal(field(settings, 'cvFile').options.accept, 'application/pdf')
  let validate
  field(settings, 'cvFile').validation({custom: fn => {validate = fn}})
  const context = asset => ({getClient: () => ({fetch: async (query, params) => {assert.equal(params.id, 'file-test'); return asset}})})
  assert.equal(await validate(undefined, context(null)), true)
  assert.equal(typeof await validate({}, context(null)), 'string')
  assert.equal(await validate({asset: {_ref: 'file-test'}}, context({mimeType: 'application/pdf', extension: 'pdf'})), true)
  for (const asset of [null, {mimeType: 'text/html', extension: 'pdf'}, {mimeType: 'application/pdf', extension: 'exe'}]) {
    assert.equal(typeof await validate({asset: {_ref: 'file-test'}}, context(asset)), 'string')
  }
})
