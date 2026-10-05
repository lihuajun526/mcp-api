'use strict';
const fs = require('fs');
const path = require('path');
const official = JSON.parse(fs.readFileSync(path.join(__dirname, 'official_tools.json'), 'utf8'));
const local = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'app', 'tools.json'), 'utf8'));
const offMap = Object.fromEntries(official.map((t) => [t.name, t]));
const locMap = Object.fromEntries(local.map((t) => [t.name, t]));

const overlap = Object.keys(locMap).filter((n) => offMap[n]);
const localOnly = Object.keys(locMap).filter((n) => !offMap[n]);
const offOnly = Object.keys(offMap).filter((n) => !locMap[n]);

console.log('=== 本地工具总数:', local.length, '| 官方工具总数:', official.length);
console.log('=== 重叠(同名):', overlap.length, overlap.join(', '));
console.log('=== 本地独有:', localOnly.join(', '));
console.log('=== 官方独有:', offOnly.join(', '));
console.log('');

const summarize = (sch) => {
  const props = (sch && sch.properties) || {};
  const req = (sch && sch.required) || [];
  return Object.keys(props).map((k) => {
    const p = props[k];
    const t = p.type || (p.anyOf ? 'anyOf' : '?');
    let extra = '';
    if (p.enum) extra += ' enum=[' + p.enum.join(',') + ']';
    if (req.includes(k)) extra += ' REQ';
    return k + ':' + t + extra;
  });
};

const out = [];
for (const name of overlap) {
  const o = offMap[name];
  const l = locMap[name];
  const oNames = new Set(Object.keys((o.inputSchema || {}).properties || {}));
  const lNames = new Set(Object.keys((l.inputSchema || {}).properties || {}));
  const onlyOff = [...oNames].filter((x) => !lNames.has(x));
  const onlyLoc = [...lNames].filter((x) => !oNames.has(x));
  const oReq = (o.inputSchema && o.inputSchema.required) || [];
  const lReq = (l.inputSchema && l.inputSchema.required) || [];
  out.push('##### ' + name);
  out.push('  官方参数: ' + summarize(o.inputSchema).join(' | '));
  out.push('  本地参数: ' + summarize(l.inputSchema).join(' | '));
  if (onlyOff.length) out.push('  官方有本地无: ' + onlyOff.join(', '));
  if (onlyLoc.length) out.push('  本地有官方无: ' + onlyLoc.join(', '));
  out.push('  官方required: ' + oReq.join(',') + ' | 本地required: ' + lReq.join(','));
  out.push('  官方工具描述: ' + String(o.description || '').replace(/\s+/g, ' ').slice(0, 400));
  out.push('  官方schema名: ' + (o.inputSchema ? o.inputSchema.title || '' : '') + ' | ' + (o.inputSchema ? JSON.stringify(o.inputSchema).slice(0, 0) : ''));
  out.push('');
}
fs.writeFileSync(path.join(__dirname, 'schema_diff.txt'), out.join('\n'));
console.log(out.join('\n'));
