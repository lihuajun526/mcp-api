'use strict';
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const local = JSON.parse(fs.readFileSync(path.join(dir, 'local_test.json'), 'utf8'));
const official = JSON.parse(fs.readFileSync(path.join(dir, 'official_test.json'), 'utf8'));

function parseKeys(s) {
  if (!s || typeof s !== 'string') return null;
  const m = s.match(/keys=\[([^\]]*)\]/);
  if (!m) return null;
  try { return JSON.parse('[' + m[1] + ']'); } catch (e) { return null; }
}

const offMap = {};
for (const o of official) offMap[o.name] = o;

const lines = [];
lines.push('# 输出字段（itemKeys）逐接口差集：以【官方】为基准\n');
for (const l of local) {
  const o = offMap[l.name];
  if (!o) { lines.push(`## ${l.name}\n  (官方无同名工具/本次未测)\n`); continue; }
  const lk = l.itemKeys || parseKeys(l.result) || [];
  const ok = o.s.itemKeys || o.s.keys || [];
  if (!lk.length || !ok.length || (o.s.shape && o.s.shape.indexOf('array') >= 0)) {
    if (o.s.shape && o.s.shape.indexOf('array') >= 0) {
      // asin_competitor / product_node: 官方 keys 即元素字段
      const missing = ok.filter(k => !lk.includes(k));
      const extra = lk.filter(k => !ok.includes(k));
      lines.push(`## ${l.name}  (数组返回)`);
      lines.push(`  官方元素字段缺失于本地 (${missing.length}): ${missing.join(', ') || '-'}`);
      lines.push(`  本地额外字段 (${extra.length}): ${extra.join(', ') || '-'}`);
      lines.push('');
      continue;
    }
    lines.push(`## ${l.name}`);
    lines.push(`  本地 keys: ${JSON.stringify(lk)}`);
    lines.push(`  官方 keys: ${JSON.stringify(ok)}`);
    lines.push('');
    continue;
  }
  const missing = ok.filter(k => !lk.includes(k));
  const extra = lk.filter(k => !ok.includes(k));
  lines.push(`## ${l.name}  (本地 ${lk.length} / 官方 ${ok.length} 字段)`);
  lines.push(`  官方有·本地缺 (${missing.length}): ${missing.join(', ') || '-'}`);
  lines.push(`  本地有·官方无 (${extra.length}): ${extra.join(', ') || '-'}`);
  lines.push('');
}
fs.writeFileSync(path.join(dir, 'output_key_diff.md'), lines.join('\n'));
console.log(lines.join('\n'));
