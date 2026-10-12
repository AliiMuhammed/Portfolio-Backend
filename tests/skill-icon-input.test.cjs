const {test, beforeEach, afterEach} = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const {JSDOM} = require('jsdom')
const {URLSearchParams, AbortController, setTimeout, clearTimeout, queueMicrotask} = global
const React = require('react')
const {act} = React
const dom = new JSDOM('<!doctype html><html><body></body></html>', {url: 'http://localhost'})
const window = dom.window, document = window.document
global.window = window; global.document = document; global.navigator = window.navigator
global.IS_REACT_ACT_ENVIRONMENT = true
global.ResizeObserver = class {observe() {return undefined} unobserve() {return undefined} disconnect() {return undefined}}
window.matchMedia = () => ({matches: false, addListener() {return undefined}, removeListener() {return undefined}, addEventListener() {return undefined}, removeEventListener() {return undefined}})
const {createRoot} = require('react-dom/client')
const {ThemeProvider, studioTheme} = require('@sanity/ui')
const originalFetch = global.fetch
const fixture = {body: '<path d="M0 0h24v24H0z"/>', width: 24, height: 24}
const cache = new Map()
let iconAvailable = true
const load = file => {
  const exports = {}
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, esModuleInterop: true}}).outputText
  vm.runInNewContext(source, {exports, URLSearchParams, AbortController, setTimeout, clearTimeout, fetch: (...args) => global.fetch(...args), require: spec => {
    if (spec === 'sanity') return {set: value => ({type: 'set', value}), unset: () => ({type: 'unset'})}
    if (spec === '@iconify/react') return {Icon: () => React.createElement('svg', {'aria-hidden': true, 'data-testid': 'remote-icon', width: 32}), getIcon: () => iconAvailable ? fixture : undefined, loadIcons: (ids, cb) => {queueMicrotask(() => cb(ids, [], [])); return () => undefined}}
    if (spec.startsWith('.')) {const target = path.resolve(path.dirname(file), spec + '.ts'); if (!cache.has(target)) cache.set(target, load(target)); return cache.get(target)}
    return require(spec)
  }})
  return exports
}
const {SkillIconInput} = load('schemaTypes/inputs/SkillIconInput.tsx')
const {searchIcons} = cache.get(path.resolve('schemaTypes/inputs/iconSearch.ts'))
let root, container, patches
const render = async (props = {}) => {await act(async () => root.render(React.createElement(ThemeProvider, {theme: studioTheme}, React.createElement(SkillIconInput, {elementProps: {id: 'icon-picker'}, onChange: patch => patches.push(patch), ...props}))))}
const fill = async (selector, value) => act(async () => {
  const input = container.querySelector(selector)
  Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, value)
  input.dispatchEvent(new window.Event('input', {bubbles: true}))
})
const settleSearch = () => act(() => new Promise(resolve => setTimeout(resolve, 400)))
beforeEach(() => {iconAvailable = true; container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container); patches = []})
afterEach(async () => {await act(async () => root.unmount()); container.remove(); global.fetch = originalFetch})
test('all exact local favorites issue field-only Sanity set patches and clear uses unset', async () => {
  await render({value: 'local:html5'})
  const buttons = [...container.querySelectorAll('button[aria-label*="local icon"]')]
  assert.equal(buttons.length, 8)
  for (const button of buttons) await act(async () => button.click())
  assert.deepEqual(patches.map(p => p.value), ['local:html5','local:css3','local:javascript','local:react','local:figma','local:mui','local:git','local:redux'])
  await act(async () => [...container.querySelectorAll('button')].find(b => b.textContent === 'Clear').click())
  assert.equal(patches.at(-1).type, 'unset')
})
test('read-only inputs never patch a collaborative document', async () => {
  await render({readOnly: true, value: 'local:react'})
  for (const button of container.querySelectorAll('button')) button.click()
  assert.equal(patches.length, 0)
})
test('debounced search displays real-shaped results and selecting a future icon patches its ID', async () => {
  let calls = 0
  global.fetch = async url => {calls++; assert.ok(url.includes('limit=32')); return {ok: true, json: async () => ({icons: ['simple-icons:typescript', 'evil/path', 'simple-icons:typescript']})}}
  await render(); await fill('#icon-picker', 'TypeScript'); assert.equal(calls, 0); await settleSearch()
  assert.equal(calls, 1)
  const button = container.querySelector('button[aria-label="Select simple-icons:typescript"]')
  assert.ok(button); await act(async () => button.click()); assert.equal(patches[0].value, 'simple-icons:typescript')
  const results = await searchIcons(' typescript ', new AbortController().signal)
  assert.equal(results.length, 1); assert.equal(calls, 1)
})
test('errors and empty results preserve the saved selection', async () => {
  global.fetch = async () => {throw new Error('offline')}
  await render({value: 'local:react'}); await fill('#icon-picker', 'offline-test'); await settleSearch()
  assert.ok(container.textContent.includes('unavailable')); assert.equal(patches.length, 0)
  global.fetch = async () => ({ok: true, json: async () => ({icons: []})})
  await fill('#icon-picker', 'empty-test'); await settleSearch(); assert.ok(container.textContent.includes('No matching icons'))
})
test('changing search aborts previous reads and ignores stale responses', async () => {
  let firstResolve, firstSignal
  global.fetch = (url, {signal}) => url.includes('first-test') ? new Promise(resolve => {firstResolve = resolve; firstSignal = signal}) : Promise.resolve({ok: true, json: async () => ({icons: ['simple-icons:docker']})})
  await render(); await fill('#icon-picker', 'first-test'); await settleSearch()
  await fill('#icon-picker', 'second-test'); assert.equal(firstSignal.aborted, true); await settleSearch()
  await act(async () => firstResolve({ok: true, json: async () => ({icons: ['simple-icons:python']})}))
  assert.ok(container.querySelector('button[aria-label="Select simple-icons:docker"]'))
  assert.equal(container.querySelector('button[aria-label="Select simple-icons:python"]'), null)
})
test('manual IDs preview before selection; invalid IDs never emit patches', async () => {
  await render(); await fill('#icon-picker-manual', '<svg onload="alert(1)"/>')
  let button = [...container.querySelectorAll('button')].find(b => b.textContent === 'Use this icon')
  assert.equal(button.disabled, true)
  await fill('#icon-picker-manual', 'simple-icons:python'); await act(async () => undefined)
  button = [...container.querySelectorAll('button')].find(b => b.textContent === 'Use this icon')
  assert.equal(button.disabled, false); await act(async () => button.click()); assert.equal(patches[0].value, 'simple-icons:python')
})
test('search validates response shape, limits results, forwards cancellation and does not query short terms', async () => {
  let calls = 0; const signal = new AbortController().signal
  assert.equal((await searchIcons('x', signal, () => {calls++; throw Error()})).length, 0)
  assert.equal(calls, 0)
  await assert.rejects(searchIcons('bad-shape', signal, async () => ({ok: true, json: async () => ({icons: null})})))
  await assert.rejects(searchIcons('http-error', signal, async () => ({ok: false})))
  const results = await searchIcons('bounded-results', signal, async (url, options) => {assert.equal(options.signal, signal); return {ok: true, json: async () => ({icons: Array.from({length: 50}, (_, i) => `test:icon-${i}`)})}})
  assert.equal(results.length, 32)
})

test('unavailable remote previews keep selection intact and prevent accepting unverified manual IDs', async () => {
  iconAvailable = false
  await render({value: 'simple-icons:removed'})
  await fill('#icon-picker-manual', 'simple-icons:unavailable')
  const button = [...container.querySelectorAll('button')].find(b => b.textContent === 'Use this icon')
  assert.equal(button.disabled, true)
  assert.ok(container.textContent.includes('Unavailable'))
  assert.ok(container.textContent.includes('simple-icons:removed'))
  assert.equal(patches.length, 0)
})
