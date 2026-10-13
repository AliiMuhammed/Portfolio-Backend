const {URL} = require('node:url')
const {test} = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs'), vm = require('node:vm'), ts = require('typescript')
const load = name => {
  const exports = {}
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(`schemaTypes/${name}.ts`, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText, {exports, URL, require:spec => spec === 'sanity' ? {defineField:v=>v, defineType:v=>v} : load('richContent')})
  return exports
}
const {workType:schema, meaningfulCaseStudy} = load('work')
const field = name => schema.fields.find(f=>f.name === name)
const validate = name => {let fn;field(name).validation({custom:value=>{fn=value}});return fn}
const paragraph = value => [{_type:'block', children:[{_type:'span', text:value}]}]
const context = (document={}, published=null) => ({document, getClient:()=>({fetch:async(q,p,o)=>{assert.ok(q.includes('_type == "work"'));assert.equal(o.perspective,'published');return published}})})
test('Work extends optional fields without removing legacy data or enabling visibility', () => {
  for (const name of ['title','description','shortDescription','longDescription','imageurl','link','github','techStack','video','showOnHomePage']) assert.ok(field(name))
  assert.equal(field('caseStudyPublished').initialValue,false)
  assert.equal(field('slug').type,'slug');assert.equal(field('slug').options.maxLength,96)
  assert.equal(field('slug').initialValue,undefined)
  assert.equal(field('slug').options.isUnique,undefined) // Studio's default document-type uniqueness.
  assert.equal(validate('caseStudyPublished')(undefined,context()),true)
  assert.equal(validate('caseStudy')(undefined,context()),true)
})
test('slug validates syntax, permits old records and freezes published URLs including removal', async()=>{
  const fn=validate('slug')
  assert.equal(await fn(undefined,context({_id:'old'})),true)
  assert.equal(await fn({current:'project-one'},context({_id:'drafts.old'},'project-one')),true)
  for (const current of ['Bad','with space','../path','x'.repeat(97)]) assert.equal(typeof await fn({current},context()),'string')
  assert.equal(typeof await fn({current:'new-name'},context({_id:'old'},'old-name')),'string')
  assert.equal(typeof await fn(undefined,context({_id:'old'},'old-name')),'string')
  assert.equal(typeof await fn(undefined,context({caseStudyPublished:true})),'string')
})
test('enabling visibility needs a title, safe slug and real narrative; images alone are not a story',()=>{
  const doc={title:'Actual project',slug:{current:'actual-project'},caseStudy:paragraph('Actual owner-authored context.')}
  assert.equal(validate('caseStudyPublished')(true,context(doc)),true)
  for (const patch of [{title:' '},{slug:null},{slug:{current:'Bad'}},{caseStudy:[]},{caseStudy:paragraph(' \n\t ')},{caseStudy:[{_type:'articleImage',asset:{_ref:'image-test'}}]}]) assert.equal(typeof validate('caseStudyPublished')(true,context({...doc,...patch})),'string')
  assert.equal(validate('caseStudy')(doc.caseStudy,context({caseStudyPublished:true})),true)
  assert.equal(typeof validate('caseStudy')(null,context({caseStudyPublished:true})),'string')
  assert.equal(meaningfulCaseStudy([{_type:'articleCode',code:'const answer = 42;'}]),true)
  assert.equal(meaningfulCaseStudy([{_type:'articleCallout',text:'Verified lesson.'}]),true)
})
test('public URL check failure blocks unsafe slug changes without writes',async()=>{
  assert.equal(typeof await validate('slug')({current:'project'},{document:{_id:'drafts.old'},getClient:()=>({fetch:async()=>{throw Error('offline')}})}),'string')
})
test('Work and Writing share exact rich-content types and retain all six registrations',()=>{
  const article=load('article').articleType
  assert.deepEqual(Array.from(field('caseStudy').of,v=>v.name||v.type),Array.from(article.fields.find(f=>f.name==='body').of,v=>v.name||v.type))
  const block=field('caseStudy').of[0]
  assert.deepEqual(Array.from(block.styles,v=>v.value),['normal','h2','h3'])
  assert.deepEqual(Array.from(block.lists,v=>v.value),['bullet','number'])
  for(const type of ['workType','experienceType','coursesType','skillType','resumeSettingsType','articleType']) assert.ok(fs.readFileSync('schemaTypes/index.ts','utf8').includes(type))
})
