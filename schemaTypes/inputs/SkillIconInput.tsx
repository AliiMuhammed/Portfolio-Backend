import React, {useEffect, useState} from 'react'
import {Box, Button, Card, Flex, Stack, Text, TextInput} from '@sanity/ui'
import {set, unset, type StringInputProps} from 'sanity'
import {Icon, getIcon, loadIcons} from '@iconify/react'
import {FaHtml5, FaCss3, FaReact, FaFigma, FaGitAlt} from 'react-icons/fa'
import {IoLogoJavascript} from 'react-icons/io5'
import {SiMui, SiRedux} from 'react-icons/si'
import {isIconId} from './iconIdentifiers'
import {searchIcons} from './iconSearch'

const favorites = [
  {id: 'local:html5', name: 'HTML5', icon: FaHtml5}, {id: 'local:css3', name: 'CSS3', icon: FaCss3},
  {id: 'local:javascript', name: 'JavaScript', icon: IoLogoJavascript}, {id: 'local:react', name: 'React', icon: FaReact},
  {id: 'local:figma', name: 'Figma', icon: FaFigma}, {id: 'local:mui', name: 'Material UI', icon: SiMui},
  {id: 'local:git', name: 'Git', icon: FaGitAlt}, {id: 'local:redux', name: 'Redux', icon: SiRedux},
]
function Preview({id, onReady}: {id: string; onReady?: (id: string) => void}) {
  const local = favorites.find(item => item.id === id)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  useEffect(() => {
    if (local || !isIconId(id)) return
    let active = true
    const timer = setTimeout(() => {if (active) setState('error')}, 8000)
    const cancel = loadIcons([id], (loaded, missing, pending) => {
      if (!active || pending.length) return
      clearTimeout(timer)
      const ready = !!getIcon(id)
      setState(ready ? 'ready' : 'error')
      if (ready) onReady?.(id)
    })
    return () => {active = false; clearTimeout(timer); cancel()}
  }, [id, local, onReady])
  if (local) {const Local = local.icon; return <Local size={32} aria-hidden="true" focusable="false" />}
  return <span style={{display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4}} title={state === 'error' ? 'Icon unavailable' : undefined}>
    <span style={{display: 'inline-grid', placeItems: 'center', width: 32, height: 32}}>{state === 'ready' ? <Icon icon={id} width={32} height={32} aria-hidden="true" /> : <span aria-hidden="true">◇</span>}</span>
    {state === 'error' && <span style={{fontSize: 10}}>Unavailable</span>}
  </span>
}
export function SkillIconInput({value, onChange, readOnly, elementProps}: StringInputProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<string[]>([])
  const [status, setStatus] = useState('Search the catalog with at least two characters.')
  const [manual, setManual] = useState('')
  const [readyId, setReadyId] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    setResults([])
    if (query.trim().length < 2) {setStatus('Search the catalog with at least two characters.'); return () => controller.abort()}
    setStatus('Searching icons…')
    let requestTimer: ReturnType<typeof setTimeout>
    const timer = setTimeout(() => {
      requestTimer = setTimeout(() => {controller.abort(); setStatus('Icon search timed out. Try again or choose a local favorite.')}, 10000)
      searchIcons(query, controller.signal).then(icons => {
        clearTimeout(requestTimer)
        if (controller.signal.aborted) return
        setResults(icons); setStatus(icons.length ? `${icons.length} matches. Select an icon below.` : 'No matching icons. Try another search.')
      }).catch(() => {clearTimeout(requestTimer); if (!controller.signal.aborted) setStatus('Icon search is unavailable. Try again or choose a local favorite.')})
    }, 350)
    return () => {clearTimeout(timer); clearTimeout(requestTimer); controller.abort()}
  }, [query])
  const choose = (id: string) => {if (!readOnly && isIconId(id)) onChange(set(id))}
  const grid = {display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 115px), 1fr))', gap: 8}
  const candidate = manual.trim()
  const manualValid = isIconId(candidate)
  return <Stack space={4}>
    <Card padding={3} border radius={2}>
      <Flex align="center" gap={3}><Box>{value && isIconId(value) ? <Preview key={value} id={value} /> : '◇'}</Box>
        <Stack space={2} style={{minWidth: 0}}><Text size={1} weight="semibold">Selected icon</Text><Text size={1} style={{overflowWrap: 'anywhere'}}>{value || 'Choose an icon below'}</Text></Stack>
        {value && <Button style={{minHeight: 44}} type="button" text="Clear" mode="ghost" disabled={readOnly} onClick={() => !readOnly && onChange(unset())} />}
      </Flex>
    </Card>
    <Stack space={3}><Text size={1} weight="semibold">Local favorites · exact portfolio icons</Text>
      <div style={grid}>{favorites.map(item => <Button key={item.id} type="button" mode="ghost" tone={value === item.id ? 'primary' : 'default'} aria-label={`Select ${item.name} local icon`} aria-pressed={value === item.id} disabled={readOnly} onClick={() => choose(item.id)}>
        <Stack space={3} padding={2}><Box aria-hidden="true"><item.icon size={28} focusable="false" /></Box><Text size={1}>{item.name}</Text></Stack>
      </Button>)}</div>
    </Stack>
    <Stack space={3}><label htmlFor={elementProps.id}><Text size={1} weight="semibold">Search Iconify catalog</Text></label>
      <TextInput {...elementProps} value={query} type="search" maxLength={100} placeholder="Python, Docker, TypeScript…" readOnly={readOnly} onChange={event => setQuery(event.currentTarget.value)} />
      <Text size={1} role="status" aria-live="polite">{status}</Text>
      <div style={grid}>{results.map(id => <Button key={id} type="button" mode="ghost" tone={value === id ? 'primary' : 'default'} aria-label={`Select ${id}`} aria-pressed={value === id} disabled={readOnly} onClick={() => choose(id)}>
        <Stack space={3} padding={2}><Box aria-hidden="true"><Preview id={id} /></Box><Text size={1} style={{overflowWrap: 'anywhere'}}>{id.split(':')[1].replace(/-/g, ' ')}</Text><Text size={0} muted style={{overflowWrap: 'anywhere'}}>{id.split(':')[0]}</Text></Stack>
      </Button>)}</div>
    </Stack>
    <Card padding={3} border radius={2}><Stack space={3}>
      <label htmlFor={`${elementProps.id}-manual`}><Text size={1} weight="semibold">Advanced: icon identifier</Text></label>
      <TextInput id={`${elementProps.id}-manual`} value={manual} maxLength={160} placeholder="simple-icons:typescript" readOnly={readOnly} onChange={event => {setManual(event.currentTarget.value); setReadyId('')}} />
      {candidate && <><Text size={1}>{manualValid ? 'Preview before selecting. Your saved icon is unchanged.' : 'Use a supported local ID or collection:name (lowercase letters, digits and hyphens).'}</Text>
        {manualValid && <Box><Preview key={candidate} id={candidate} onReady={setReadyId} /></Box>}</>}
      <Button style={{minHeight: 44}} type="button" text="Use this icon" disabled={readOnly || !manualValid || (!candidate.startsWith('local:') && readyId !== candidate)} onClick={() => choose(candidate)} />
    </Stack></Card>
    <Text size={0} muted>Catalog searches and remote previews contact Iconify. Local favorites work offline.</Text>
  </Stack>
}
