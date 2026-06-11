const w = require(process.argv[2])[0]
const out = { name: w.name, active: w.active, hasGetConfig: !!w.nodes.find(n => n.name === 'Get Config') }
const live = []
for (const n of w.nodes) {
  const qp = n.parameters?.queryParameters?.parameters
  if (qp) for (const p of qp) if (String(p.value).includes('keywords')) live.push(n.name + '.' + p.name + ' = ' + p.value)
  if (n.parameters?.url && String(n.parameters.url).includes('keywords')) live.push(n.name + '.url = ' + n.parameters.url)
  if (n.parameters?.jsonBody && String(n.parameters.jsonBody).includes('$json.keywords')) live.push(n.name + '.body uses keywords')
}
out.liveSearch = live
// trigger -> ? chain (first two hops)
const trig = w.nodes.find(n => n.type === 'n8n-nodes-base.scheduleTrigger')
out.triggerChain = trig ? JSON.stringify(w.connections[trig.name]) + ' | GetConfig->' + JSON.stringify(w.connections['Get Config']) : 'no trigger'
console.log(JSON.stringify(out, null, 2))
