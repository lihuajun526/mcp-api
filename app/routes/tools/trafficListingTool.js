const { queryTrafficListing } = require('../../services/queries/trafficListingQuery');
const { buildSuccess } = require('../../toolResponse');
const { BusinessError } = require('../../errors');
const { MARKET_ID_MAP } = require('../../utils/validation');

// 分页大小取值枚举项为 20/50/100，默认 50
const SIZE_ENUM = [20, 50, 100];
const DEFAULT_SIZE = 50;

// 排序字段枚举：relationCount（关联Asin数，默认）、createdTime（引流时间）
const ORDER_FIELDS = ['relationCount', 'createdTime'];
const DEFAULT_ORDER_FIELD = 'relationCount';

// 关联类型枚举
const RELATIONS = [
  'VAV', // 看了又看
  'CSI', // 相似产品
  'AVP', // 看了还看
  'BAV', // 看了却买
  'MIB', // 捆绑销售
  'FBT', // 组合购买
  'MIE', // 更多相关
  'BAB', // 买了又买
  'COB', // 品牌推荐
  'SP',  // 商品广告
  'FSA', // 四星产品
  'BCA'  // 品牌广告
];

function paramError(message) {
  const err = new Error(message);
  err.code = -32602;
  return err;
}

/** 校验 size 枚举（20/50/100），缺省为 50 */
function resolveSize(value) {
  if (value == null || value === '') return DEFAULT_SIZE;
  const size = Number(value);
  if (!SIZE_ENUM.includes(size)) {
    throw paramError('size must be one of: 20, 50, 100');
  }
  return size;
}

/** 校验排序字段枚举（relationCount/createdTime），缺省为 relationCount */
function resolveOrderField(field) {
  if (field == null || field === '') return DEFAULT_ORDER_FIELD;
  const value = String(field);
  if (!ORDER_FIELDS.includes(value)) {
    throw paramError(`order.field must be one of: ${ORDER_FIELDS.join(', ')}`);
  }
  return value;
}

/** 校验关联类型枚举；未传或空数组返回 []（表示查询全部类型） */
function resolveRelations(values) {
  if (values == null) return [];
  const list = Array.isArray(values) ? values : [String(values)];
  if (list.length === 0) return [];
  const invalid = list.filter((v) => !RELATIONS.includes(v));
  if (invalid.length > 0) {
    throw paramError(`relations only supports: ${RELATIONS.join(', ')}`);
  }
  return list.map(String);
}

module.exports = {
  name: 'traffic_listing',

  async handle(args, user) {
    if (!args.marketplace) {
      const err = new Error('marketplace is required');
      err.code = -32602;
      throw err;
    }
    if (!args.asinList || (Array.isArray(args.asinList) && args.asinList.length === 0)) {
      const err = new Error('asinList is required');
      err.code = -32602;
      throw err;
    }
    const asinList = Array.isArray(args.asinList) ? args.asinList : [String(args.asinList)];
    if (asinList.length > 20) {
      throw new BusinessError('单次查询 ASIN 数量不能超过 20 个', 400);
    }

    const marketplace = String(args.marketplace);
    const orderField = resolveOrderField(args.order && args.order.field !== undefined ? args.order.field : args.orderField);
    const orderDesc = args.order && args.order.desc !== undefined ? args.order.desc !== false : (args.orderDesc !== false);

    const params = {
      marketplace, // 供 transformer 使用，不发往上游
      market: MARKET_ID_MAP[marketplace] || 1,
      pageNum: (args.page && !isNaN(Number(args.page))) ? Number(args.page) : 1,
      pageSize: resolveSize(args.size),
      desc: orderDesc,
      orderField,
      relations: resolveRelations(args.relations),
      queryVariations: args.variations !== false,
      asinList
    };

    const data = await queryTrafficListing(user, params);
    return buildSuccess(args, data);
  }
};
