const {test}=require('node:test')
const assert=require('node:assert/strict')
const {URL}=require('node:url')
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript')
const exportsObject={}
vm.runInNewContext(ts.transpileModule(fs.readFileSync('schemaTypes/article.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:exportsObject,URL,require:()=>({defineType:v=>v,defineField:v=>v})})
const schema=exportsObject.articleType
const field=name=>schema.fields.find(f=>f.name===name)
const ruleFor=definition=>{const recorded={};const rule={required(){recorded.required=true;return rule},max(v){recorded.max=v;return rule},min(v){recorded.min=v;return rule},unique(){return rule},valid(...v){recorded.valid=v;return rule},custom(fn){recorded.custom=fn;return rule}};definition.validation?.(rule);return recorded}
test('one Writing collection registers both formats and preserves existing schema registrations',()=>{
 assert.equal(schema.name,'article');assert.equal(schema.title,'Writing & Engineering Notes')
 const index=fs.readFileSync('schemaTypes/index.ts','utf8');for(const name of ['articleType','workType','experienceType','coursesType','skillType','resumeSettingsType'])assert.ok(index.includes(name))
 for(const name of ['title','slug','entryType','excerpt','topic','publishedAt','body'])assert.equal(ruleFor(field(name)).required,true)
 assert.deepEqual(Array.from(field('entryType').options.list,v=>v.value),['article','note']);assert.equal(typeof ruleFor(field('entryType')).custom('saved'),'string');assert.equal(field('featured').initialValue,false)
 for(const name of ['title','excerpt','topic'])assert.equal(typeof ruleFor(field(name)).custom('  '),'string')
 assert.equal(ruleFor(field('title')).max,140);assert.equal(ruleFor(field('excerpt')).max,300)
})
test('slug syntax and published URL immutability; new draft still uses normal Sanity uniqueness',async()=>{
 const validate=ruleFor(field('slug')).custom
 const ctx=current=>({document:{_id:'drafts.existing'},getClient:()=>({fetch:async(q,params,options)=>{assert.equal(params.id,'existing');assert.equal(options.perspective,'published');return current}})})
 assert.equal(await validate({current:'safe-slug'},ctx(null)),true)
 assert.equal(await validate({current:'safe-slug'},ctx('safe-slug')),true)
 assert.equal(typeof await validate({current:'changed'},ctx('original')),'string')
 for(const current of ['../bad','Bad','with space','x'.repeat(97),''])assert.equal(typeof await validate({current},ctx(null)),'string')
 assert.equal(field('slug').options.isUnique,undefined)
})
test('Portable Text preserves headings/lists/marks, escaped code, image alt and callout authoring',()=>{
 const of=field('body').of,block=of.find(v=>v.type==='block')
 assert.deepEqual(Array.from(block.styles,v=>v.value),['normal','h2','h3'])
 assert.deepEqual(Array.from(block.lists,v=>v.value),['bullet','number'])
 for(const name of ['articleCode','articleImage','articleCallout'])assert.ok(of.find(v=>v.name===name))
 const code=of.find(v=>v.name==='articleCode');assert.equal(code.fields[0].name,'code');assert.equal(ruleFor(code.fields[0]).custom('line one\nline two'),true)
 for(const name of ['coverImage','socialImage']){const validate=ruleFor(field(name)).custom;assert.equal(validate(undefined),true);assert.equal(typeof validate({asset:{_ref:'image-test'}}),'string');assert.equal(validate({asset:{_ref:'image-test'},alt:'Actual screenshot'}),true)}
 const links=ruleFor(block.marks.annotations[0].fields[0]).custom
 for(const href of ['https://example.com','mailto:public@example.com','/writing/test'])assert.equal(links(href),true)
 for(const href of ['javascript:alert(1)','data:text/html,x','https://user:password@example.com'])assert.equal(typeof links(href),'string')
})
