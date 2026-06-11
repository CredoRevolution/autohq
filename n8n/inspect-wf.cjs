const w = require(process.argv[2])[0]
console.log('### ' + w.name + '  (active=' + w.active + ')')
for (const n of w.nodes) {
  if (n.type !== 'n8n-nodes-base.httpRequest') continue
  const url = n.parameters?.url ?? ''
  // skip our own/openai/telegram endpoints — we want the SOURCE fetch node
  const tag = /openai\.com/.test(url) ? '[openai]'
    : /telegram\.org/.test(url) ? '[telegram]'
    : /credorevolution\.space/.test(url) ? '[autohq]'
    : '[SOURCE?]'
  console.log('  - node="' + n.name + '" ' + tag)
  console.log('    url=' + url)
  const qp = n.parameters?.queryParameters?.parameters
  if (qp) for (const p of qp) console.log('      q:' + p.name + ' = ' + p.value)
  if (n.parameters?.jsonBody && tag === '[SOURCE?]') console.log('    body=' + String(n.parameters.jsonBody).slice(0, 300))
}
