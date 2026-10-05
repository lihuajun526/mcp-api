'use strict';
const fs = require('fs');
const path = require('path');
const official = JSON.parse(fs.readFileSync(path.join(__dirname, 'official_tools.json'), 'utf8'));
const local = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'app', 'tools.json'), 'utf8'));
const offMap = Object.fromEntries(official.map((t) => [t.name, t]));
const locMap = Object.fromEntries(local.map((t) => [t.name, t]));
const overlap = Object.keys(locMap).filter((n) => offMap[n]);

// unwrap official 'request'
function offProps(schema) {
  const p = (schema && schema.properties) || {};
  if (p.request && p.request.type === 'object') {
    return { props: p.request.properties || {}, required: (p.request.required) || [], wrapper: 'request' };
  }
  return { props: p, required: (schema && schema.required) || [], wrapper: null };
}

const lines = [];
function p(str) { lines.push(str); }

for (const name of overlap) {
  const o = offMap[name];
  const l = locMap[name];
  const off = offProps(o.inputSchema);
  const lop = (l.inputSchema && l.inputSchema.properties) || {};
  const lreq = (l.inputSchema && l.inputSchema.required) || [];
  const oNames = new Set(Object.keys(off.props));
  const lNames = new Set(Object.keys(lop));

  p('##### ' + name + (off.wrapper ? '   [官方入参包裹: request]' : ''));
  p('  官方required: ' + off.required.join(',') + '  ||  本地required: ' + lreq.join(','));
  const onlyOff = [...oNames].filter((x) => !lNames.has(x));
  const onlyLoc = [...lNames].filter((x) => !oNames.has(x));
  p('  官方有 / 本地缺 (' + onlyOff.length + '): ' + onlyOff.join(', '));
  p('  本地有 / 官方无 (' + onlyLoc.length + '): ' + onlyLoc.join(', '));
  // per-param compare
  const diffs = [];
  for (const k of Object.keys(off.props)) {
    if (!lNames.has(k)) continue;
    const op = off.props[k];
    const lp = lop[k];
    const ot = op.type || '?';
    const lt = lp.type || '?';
    const oenum = op.enum ? JSON.stringify(op.enum) : '';
    const lenum = lp.enum ? JSON.stringify(lp.enum) : '';
    const typeMismatch = (ot !== lt) && !(ot === 'integer' && lt === 'number');
    if (typeMismatch || (oenum && lenum && oenum !== lenum) || (!!op.enum !== !!lp.enum)) {
      diffs.push('    - ' + k + ': 官方' + ot + (oenum ? oenum : '') + ' vs 本地' + lt + (lenum ? lenum : '') + '  [官方desc: ' + String(op.description || '').replace(/\s+/g, ' ').slice(0, 120) + ']');
    }
  }
  if (diffs.length) { p('  参数类型/枚举差异:'); diffs.forEach((d) => p(d)); }
  p('');
}
fs.writeFileSync(path.join(__dirname, 'param_diff.txt'), lines.join('\n'));
console.log(lines.join('\n'));
