const {test} = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
// Evaluate schema definitions without connecting to a dataset.
const load = (name) => {
  const exports = {}
  const js = ts.transpileModule(fs.readFileSync(`schemaTypes/${name}.ts`, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS}}).outputText
  vm.runInNewContext(js, {exports, require: spec => {
    if (spec === 'sanity') return {defineType: value => value, defineField: value => value}
    if (spec.endsWith('SkillIconInput')) return {SkillIconInput: () => null}
    const helpers = {}
    const source = ts.transpileModule(fs.readFileSync('schemaTypes/inputs/iconIdentifiers.ts', 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS}}).outputText
    vm.runInNewContext(source, {exports: helpers})
    return helpers
  }})
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
test('Skills use the custom icon picker, required metadata and hidden optional legacy fields', () => {
  const skill = load('skill')
  assert.equal(skill.name, 'skill')
  for (const name of ['name','category']) {
    let required = false
    const rule = {required: () => {required = true; return rule}}
    field(skill, name).validation(rule)
    assert.equal(required, true)
  }
  assert.equal(field(skill, 'iconId').title, 'Skill Icon')
  assert.equal(typeof field(skill, 'iconId').components.input, 'function')
  for (const name of ['icon','iconPath','iconPackage']) {
    assert.equal(field(skill, name).hidden, true)
    assert.equal(field(skill, name).readOnly, true)
    assert.equal(field(skill, name).validation, undefined)
  }
  assert.equal(field(skill, 'order').type, 'number')
  assert.equal(skill.preview.select.title, 'name')
})
const iconValidator = () => {
  let validate
  field(load('skill'), 'iconId').validation({custom: fn => {validate = fn}})
  return validate
}
test('local and future Iconify IDs validate without third-party requests or uploads', async () => {
  const validate = iconValidator()
  for (const id of ['local:html5','local:css3','local:javascript','local:react','local:figma','local:mui','local:git','local:redux','simple-icons:typescript','simple-icons:python','devicon:postgresql']) {
    assert.equal(await validate(id, {document: {_id: 'drafts.new'}}), true)
  }
  for (const id of [undefined,'','local:unknown','https://evil/icon','@evil:icon','<svg/>','simple-icons:../python','Simple:React',{},42,'simple-icons:' + 'x'.repeat(161)]) {
    assert.equal(typeof await validate(id, {document: {_id: 'drafts.new'}}), 'string')
  }
})
test('only existing published skills may retain recognized legacy references', async () => {
  const validate = iconValidator()
  const paths = ['fa/FaHtml5','fa/FaCss3','io5/IoLogoJavascript','fa/FaReact','fa/FaFigma','si/SiMui','fa/FaGitAlt','si/SiRedux']
  for (const path of paths) {
    const context = published => ({document: {_id: 'drafts.existing', iconPath: `react-icons/${path}`, iconPackage: path.split('/')[0]}, getClient: () => ({fetch: async (q, params) => {assert.equal(params.id, 'existing'); return published}})})
    assert.equal(await validate(undefined, context(true)), true)
    assert.equal(typeof await validate(undefined, context(false)), 'string')
  }
  for (const path of ['react-icons/fa/Unknown','__proto__',{}]) assert.equal(typeof await validate(undefined, {document: {iconPath: path}}), 'string')
  assert.equal(typeof await validate(undefined, {document: {_id: 'existing', iconPath: 'react-icons/fa/FaReact', iconPackage: 'si'}}), 'string')
  assert.equal(typeof await validate(undefined, {document: {_id: 'existing', iconPath: 'react-icons/fa/FaReact'}, getClient: () => ({fetch: () => Promise.reject(new Error('offline'))})}), 'string')
})
test('all five schema registrations and activation settings are preserved', () => {
  const source = fs.readFileSync('schemaTypes/index.ts', 'utf8')
  for (const type of ['workType','experienceType','coursesType','skillType','resumeSettingsType']) assert.ok(source.includes(type))
  assert.equal(field(load('resumeSettings'), 'skillsManaged').initialValue, false)
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
