/**
 * Wire the live "keywords" field into a source workflow.
 * Inserts a "Get Config" node (GET /api/config) between the schedule trigger
 * and the fetch node, then rewrites the source's search to read keywords from
 * Supabase — adapting the syntax per source.
 *
 * Keywords are stored as plain space-separated terms ("vue nuxt typescript").
 *
 * Usage: node wire-all.cjs <in.json> <out.json>
 */
const fs = require('fs')
const [file, out] = process.argv.slice(2)
const CONFIG_URL = 'https://credorevolution.space/api/config'

const data = JSON.parse(fs.readFileSync(file, 'utf8'))
const wf = Array.isArray(data) ? data[0] : data

function setQuery(f, key, expr) {
  const p = f.parameters.queryParameters.parameters.find(x => x.name === key)
  if (!p) throw new Error('query param not found: ' + key)
  p.value = expr
}
function setBody(f, expr) {
  f.parameters.specifyBody = 'json'
  f.parameters.sendBody = true
  f.parameters.jsonBody = expr
}

// Per-workflow injection rules.
const RULES = {
  'AutoHQ - Remotive Job Search': {
    fetch: 'Fetch Remotive',
    apply: f => setQuery(f, 'search', '={{ $json.keywords }}'),
  },
  'AutoHQ - HH.ru Jobs': {
    fetch: 'Search HH Vacancies',
    apply: f => setQuery(f, 'text', "={{ $json.keywords.split(' ').join(' OR ') }}"),
  },
  'AutoHQ - rabota.by Jobs': {
    fetch: 'Search rabota.by Vacancies',
    apply: f => setQuery(f, 'text', "={{ $json.keywords.split(' ').join(' OR ') }}"),
  },
  'AutoHQ - HH.ru via Apify': {
    fetch: 'Fetch HH.ru via Apify',
    apply: f => setBody(f, "={{ JSON.stringify({ text: $json.keywords.split(' ').join(' OR '), schedule: 'remote' }) }}"),
  },
  'AutoHQ - Djinni.co Job Search': {
    fetch: 'Fetch Djinni RSS',
    apply: f => { f.parameters.url = "={{ 'https://djinni.co/jobs/rss/?keywords=' + $json.keywords.split(' ').join('+') + '&employment=remote' }}" },
  },
}

const rule = RULES[wf.name]
if (!rule) { console.log('SKIP (no rule): ' + wf.name); process.exit(0) }

const trigger = wf.nodes.find(n => n.type === 'n8n-nodes-base.scheduleTrigger')
if (!trigger) throw new Error('no schedule trigger in ' + wf.name)
const fn = wf.nodes.find(n => n.name === rule.fetch)
if (!fn) throw new Error('fetch node not found: ' + rule.fetch)

let cfg = wf.nodes.find(n => n.name === 'Get Config')
if (!cfg) {
  cfg = {
    id: 'get-config-' + Math.random().toString(36).slice(2, 8),
    name: 'Get Config',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [trigger.position[0] + 110, trigger.position[1] - 140],
    parameters: { url: CONFIG_URL, options: {} },
  }
  wf.nodes.push(cfg)
}

wf.connections = wf.connections || {}
wf.connections[trigger.name] = { main: [[{ node: 'Get Config', type: 'main', index: 0 }]] }
wf.connections['Get Config'] = { main: [[{ node: rule.fetch, type: 'main', index: 0 }]] }
rule.apply(fn)

fs.writeFileSync(out, JSON.stringify([wf]))
console.log('WIRED: ' + wf.name + ' via ' + rule.fetch)
