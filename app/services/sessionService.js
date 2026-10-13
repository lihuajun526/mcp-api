const redis = require('../redis');
const { BusinessError } = require('../errors');

async function pickSession(provider) {
  const hashKey = `mcp:session:${provider}`;
  const cursorKey = `mcp:session:cursor:${provider}`;
  const [cursor, fields] = await Promise.all([
    redis.incr(cursorKey),
    redis.hkeys(hashKey)
  ]);
  if (!fields.length) {
    throw new BusinessError(`未找到可用第三方会话: ${provider}`, 500);
  }
  const field = fields[(Number(cursor) - 1) % fields.length];
  const raw = await redis.hget(hashKey, field);
  if (!raw) {
    throw new BusinessError(`第三方会话数据为空: ${provider}`, 500);
  }
  try {
    const data = JSON.parse(raw);
    // 将 field 注入到 session 对象，供调用方回写 cookie 时定位 Redis hash 字段
    data.field = field;
    return data;
  } catch (e) {
    throw new BusinessError(`第三方会话配置格式错误: ${provider}`, 500);
  }
}

/**
 * 将响应头 Set-Cookie 数组合并到现有 cookie 字符串中。
 *
 * 规则：
 * - 解析 Set-Cookie 中每条的 name=value（取第一个 ; 前的部分）
 * - 若 Max-Age=0 或 Max-Age 为负数，视为删除该 cookie
 * - 其余情况用新值覆盖/新增
 *
 * @param {string} existingCookieStr  现有 HTTP Cookie 请求头字符串，如 "a=1; b=2"
 * @param {string[]} setCookieHeaders  响应头 Set-Cookie 数组
 * @returns {string}  合并后的 cookie 字符串
 */
function mergeSetCookies(existingCookieStr, setCookieHeaders) {
  // 解析现有 cookie 字符串为有序 Map，保留顺序
  const cookieMap = new Map();
  for (const pair of (existingCookieStr || '').split(';')) {
    const trimmed = pair.trim();
    if (!trimmed) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) {
      cookieMap.set(trimmed, '');
    } else {
      cookieMap.set(trimmed.slice(0, eqIdx).trim(), trimmed.slice(eqIdx + 1));
    }
  }

  for (const header of setCookieHeaders) {
    // Set-Cookie: name=value; Path=/; HttpOnly; Max-Age=3600
    const firstPart = header.split(';')[0].trim();
    const eqIdx = firstPart.indexOf('=');
    if (eqIdx === -1) continue;
    const name = firstPart.slice(0, eqIdx).trim();
    const value = firstPart.slice(eqIdx + 1);
    if (!name) continue;

    // 检测是否为删除指令（Max-Age=0 或负数）
    const maxAgeMatch = header.match(/max-age=(-?\d+)/i);
    if (maxAgeMatch && parseInt(maxAgeMatch[1], 10) <= 0) {
      cookieMap.delete(name);
    } else {
      cookieMap.set(name, value);
    }
  }

  return Array.from(cookieMap.entries())
    .map(([k, v]) => (v ? `${k}=${v}` : k))
    .join('; ');
}

/**
 * 将响应中的 Set-Cookie 合并后回写到 Redis，保持 Redis 中的 cookie 始终最新。
 * 以 fire-and-forget 方式调用，不阻塞主请求链路；写入失败只打印告警，不抛错。
 *
 * @param {string}   provider          会话 provider 名称，如 "SELLERSPRITE"
 * @param {string}   field             Redis hash 字段名（由 pickSession 注入到 session.field）
 * @param {string}   existingCookie    请求发出时使用的 cookie 字符串
 * @param {string[]} setCookieHeaders  响应头 Set-Cookie 数组
 */
async function syncSessionCookie(provider, field, existingCookie, setCookieHeaders) {
  if (!setCookieHeaders || !setCookieHeaders.length) return;

  const newCookie = mergeSetCookies(existingCookie, setCookieHeaders);
  if (newCookie === existingCookie) return; // 无变化，跳过写入

  const hashKey = `mcp:session:${provider}`;
  const raw = await redis.hget(hashKey, field);
  if (!raw) return;

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return;
  }
  data.cookie = newCookie;
  await redis.hset(hashKey, field, JSON.stringify(data));
}

module.exports = { pickSession, mergeSetCookies, syncSessionCookie };
