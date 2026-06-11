/**
 * Wire a live "keywords" field into an exported n8n workflow.
 *
 * Inserts a "Get Config" HTTP node (GET /api/config) between the schedule
 * trigger and the fetch node, then points the source's search parameter at
 * {{ $json.keywords }} so every run reads the keywords from Supabase.
 *
 * Usage:
 *   node wire-keywords.cjs <in.json> <out.json> <fetchNodeName> <where> <searchKey>
 *     where   = "query"  -> parameters.queryParameters.parameters[name=searchKey]
 *             = "url"    -> replace {KW} token in parameters.url
 *             = "body"   -> replace {KW} token in parameters.jsonBody
 */
const fs = require('fs')
const [file, out, fetchNode, where, searchKey] = process.argv.slice(2)
const CONFIG_URL = 'https://credorevolution.space/api/config'

const data = JSON.parse(fs.readFileSync(file, 'utf8'))
const wf = Array.isArray(data) ? data[0] : data

const trigger = wf.nodes.find(n => n.type === 'n8n-nodes-base.scheduleTrigger')
if (!trigger) throw new Error('no schedule trigger')
const fn = wf.nodes.find(n => n.name === fetchNode)
if (!fn) throw new Error('fetch node not found: ' + fetchNode)

// Add Get Config node (idempotent)
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

// Rewire: trigger -> Get Config -> fetch
wf.connections = wf.connections || {}
wf.connections[trigger.name] = { main: [[{ node: 'Get Config', type: 'main', index: 0 }]] }
wf.connections['Get Config'] = { main: [[{ node: fetchNode, type: 'main', index: 0 }]] }

// Point the search at the live keywords
const EXPR = '={{ $json.keywords }}'
if (where === 'query') {
  const qp = fn.parameters?.queryParameters?.parameters
  if (!qp) throw new Error('no queryParameters on ' + fetchNode)
  const p = qp.find(x => x.name === searchKey)
  if (!p) throw new Error('search param not found: ' + searchKey)
  p.value = EXPR
} else if (where === 'url') {
  if (!fn.parameters.url.includes('{KW}')) throw new Error('no {KW} token in url')
  fn.parameters.url = '=' + fn.parameters.url.replace('{KW}', "{{ $json.keywords }}")
} else if (where === 'body') {
  if (!fn.parameters.jsonBody.includes('{KW}')) throw new Error('no {KW} token in body')
  fn.parameters.jsonBody = fn.parameters.jsonBody.replace('{KW}', "{{ $json.keywords }}")
} else {
  throw new Error('unknown where: ' + where)
}

fs.writeFileSync(out, JSON.stringify([wf]))
console.log('OK ' + fetchNode + ' | nodes=' + wf.nodes.length)
