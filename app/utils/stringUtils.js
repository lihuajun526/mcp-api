'use strict';

/**
 * 判断字符串是否为空
 * 类似 Java 的 StringUtils.isEmpty
 * 以下情况均视为空：null、undefined、''、纯空白字符串（如 ' '）
 *
 * @param {*} value
 * @returns {boolean}
 */
function isEmpty(value) {
  if (value == null) return true;
  if (typeof value !== 'string') return false;
  return value.trim() === '';
}

/**
 * 判断字符串是否不为空（isEmpty 的反义）
 *
 * @param {*} value
 * @returns {boolean}
 */
function isNotEmpty(value) {
  return !isEmpty(value);
}

/**
 * 如果值为空（isEmpty 判定），则返回 defaultValue，否则返回原值
 *
 * @param {*} value
 * @param {*} defaultValue
 * @returns {*}
 */
function defaultIfEmpty(value, defaultValue) {
  return isEmpty(value) ? defaultValue : value;
}

module.exports = { isEmpty, isNotEmpty, defaultIfEmpty };
