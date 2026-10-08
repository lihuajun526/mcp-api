---
name: amazon-seller-operations
description: Amazon 卖家运营助手，基于 SellerDex MCP 数据服务完成选品、选市场、市场结构与竞争分析、竞品拆解、关键词挖掘与流量反查、广告转化优化、评论与商标洞察、销量与趋势预测。当运营需要选品、选市场、查竞品、挖词、反查流量词、分析类目结构或预测销量时使用。不用于非亚马逊业务。
---

# Amazon 卖家运营助手（SellerDex MCP）

面向亚马逊卖家的一站式数据运营技能。把运营问题翻译成对 **SellerDex MCP 46 个数据工具**的调用序列，再按资深运营的选品 / 竞品 / 关键词 / 广告方法论给出结论与可执行建议。

## 使用前提
- 所有工具由服务端鉴权，**调用参数里绝不要传 API Key**。
- 工具与参数的权威定义见 `references/tools-reference.md`；场景化作业流见 `references/playbooks.md`。
- 站点代码因工具而异，**每个工具的支持站点与分页大小都不完全一致**，调用前务必对照下表。

## 站点与分页差异（重要，调用前必看）
站点分 5 档（越靠前的工具越通用）：

| 档 | 站点 | 涉及工具 |
|----|------|----------|
| 14 站 | US/JP/UK/DE/FR/IT/ES/CA/IN/MX + BR/AU/SA/AE | `keyword_research`、`aba_research_weekly`、`aba_research_monthly`、`first_category` |
| 13 站 | 10 站 + BR/AU/AE | `traffic_keyword`、`traffic_extend`、`google_trend`、`traffic_keyword_stat`、`keyword_miner`、`ss_review`、`ss_asin_coupon_trend`、`ss_asin_detail_with_coupon_trend`、`ss_keyword_order`、`ss_keyword_research_trends`、`ss_aba_research_trend`、`ss_keepa_info`、`ss_traffic_source`、全部 `ss_market_*` |
| 12 站 | 10 站 + BR/AU（无 AE） | `traffic_listing`、`traffic_listing_stat` |
| 10 站 | US/JP/UK/DE/FR/IT/ES/CA/IN/MX | `competitor_lookup`、`asin_competitor`、`product_research`、`asin_detail`、`asin_prediction`、`bsr_prediction`、`market_research`、`product_node`、`asin_sales_trend` |
| 9 站 | 10 站去掉 MX | `keyword_conversion` |

分页大小（`size`）：

| 取值 | 涉及工具 |
|------|----------|
| 20 / 60 / 100 | `competitor_lookup`、`asin_competitor`、`product_research` |
| 20 / 50 / 100 | `traffic_keyword`、`keyword_research`、`traffic_extend`、`aba_research_weekly`、`aba_research_monthly`、`traffic_listing`、`keyword_miner`、`keyword_conversion`、`market_research` |
| 自由整数 | `ss_review`、`ss_keyword_order`、`ss_traffic_source`、`ss_trademark_list` |

> 站点越界的后果是参数校验失败（JSON-RPC `-32602`），不是返回空数据。

## 黄金规则（每次调用都遵守）
1. **站点必填且必须在该工具支持范围内**：先确认 `marketplace`，缺失就向用户追问，不要默认 US。
2. **日期口径**：`month` / `date` / `historyDate` 一律 `yyyyMM`（如 202507）；不填 = 最近月份 / 最近30天。数据存在滞后，最近月份常不完整，下结论优先用上一个完整月份。
3. **两种调用形态**：
   - 常规工具：参数**平铺**在 `arguments`（如 `marketplace`、`asin`、`size` 直接传）。
   - `ss_market_*` 等「request 包裹型」工具：业务参数要放进 **`request` 对象**内（如 `{"request":{"marketplace":"US","nodeIdPath":"...","topN":10}}`）。
4. **省 Token**：用 `returnFields` 只取分析所需字段。注意其类型不一致——常规工具是**数组** `["asin","price"]`，而 `ss_*` request 型工具是**逗号字符串** `"asin,price"`。
5. **先概览后明细**：`traffic_keyword_stat` → `traffic_keyword`；`traffic_listing_stat` → `traffic_listing`。
6. **类目取值链路**：`first_category`（站点一级类目，ABA 的 `departments` 用它）→ `product_node`（逐层取 `nodeIdPath`）→ 传给 `product_research` / `competitor_lookup` / `market_research` / `bsr_prediction` / 全部 `ss_market_*`。
7. **不要编造**：只引用工具返回的数字；缺失或为空要明说，不得用经验值冒充数据。
8. **失败处理**：业务失败返回 `{code,message,data}`，按 `data.hint` 决定重试 / 降频 / 联系管理员。
9. **口径一致**：对比时保证同站点、同月份、同变体口径（`variation`）、同排序口径。

## 工具地图（46 个，按运营任务分 5 组）

### A. 选品与市场发现（9）
| 工具 | 用于 | 站点 |
|------|------|------|
| `first_category` | 取站点全部一级类目（匹配 `category_value`） | 14 |
| `product_node` | 浏览/搜索类目树，拿 `nodeIdPath` | 10 |
| `market_research` | 类目级市场概况（是否值得进入） | 10 |
| `product_research` | 多维度选品，返回 ASIN 级商品 | 10 |
| `keyword_research` | 由关键词挖细分赛道 | 14 |
| `aba_research_weekly` | ABA 周数据，追短期爆款 | 14 |
| `aba_research_monthly` | ABA 月数据，看中长期规律 | 14 |
| `bsr_prediction` | 由类目ID+BSR 预测销量 | 10 |
| `google_trend` | 谷歌趋势，判季节性/长期增减 | 13 |

### B. 竞品与商品分析（9）
| 工具 | 用于 | 站点 |
|------|------|------|
| `competitor_lookup` | 已知目标→查这批商品数据 | 10 |
| `asin_competitor` | 某 ASIN 的直接竞品是谁 | 10 |
| `asin_detail` | 单 ASIN 完整详情 | 10 |
| `asin_prediction` | 日粒度 BSR+预估销量（短期） | 10 |
| `asin_sales_trend` | 月度历史销量趋势（长期/季节性） | 10 |
| `ss_asin_detail_with_coupon_trend` | ASIN 详情 + 优惠价格趋势 | 13 |
| `ss_asin_coupon_trend` | ASIN 原价/优惠类型/优惠额/成交价 | 13 |
| `ss_review` | 评论列表（星级/类型/时间过滤） | 13 |
| `ss_keepa_info` | Keepa 历史（价格/BSR 时间序列） | 13 |

### C. 关键词与流量（11）
| 工具 | 用于 | 站点 |
|------|------|------|
| `keyword_miner` | 以种子词扩词，建词库 | 13 |
| `keyword_conversion` | 关键词转化率与广告数据（PPC/ACOS/CPA） | 9 |
| `traffic_keyword_stat` | 某 ASIN 流量词规模概览 | 13 |
| `traffic_keyword` | 某 ASIN 流量词反查 | 13 |
| `traffic_extend` | 多 ASIN（≤20）联合拓展流量词 | 13 |
| `traffic_listing_stat` | 一组 ASIN 关联流量概览 | 12 |
| `traffic_listing` | 关联流量来源商品明细 | 12 |
| `ss_keyword_order` | 多 ASIN 出单/流量词反查（按周/月，含转化类型） | 13 |
| `ss_keyword_research_trends` | 关键词研究趋势 | 13 |
| `ss_aba_research_trend` | ABA 趋势（周/月粒度） | 13 |
| `ss_traffic_source` | 流量来源（输入 ASIN 或关键词） | 13 |

### D. 市场结构与竞争分布（13，request 包裹型）
> 统一入参：`request{marketplace, nodeIdPath(必填), month, topN, newProduct, returnFields}`。用于类目深度体检。

| 工具 | 用于 |
|------|------|
| `ss_market_research_statistics` | 市场调研统计汇总 |
| `ss_market_product_concentration` | 商品集中度（头部销量占样本比） |
| `ss_market_brand_concentration` | 品牌集中度（含同级类目对比） |
| `ss_market_seller_concentration` | 卖家集中度 |
| `ss_market_seller_type_concentration` | 卖家类型集中度（AMZ/FBA/FBM） |
| `ss_market_seller_country_distribution` | 卖家国籍分布 |
| `ss_market_price_distribution` | 价格区间分布与定价结构 |
| `ss_market_rating_distribution` | 评分（星级）分布 |
| `ss_market_ratings_count_distribution` | 评分数区间分布（新品进入难度） |
| `ss_market_listing_date_distribution` | 上架时长分布（新品接受度） |
| `ss_market_listing_trend_distribution` | 上架时间分布（生命周期） |
| `ss_market_ebc_distribution` | A+ 页面 / 视频内容配置分布 |
| `ss_market_product_demand_trend` | 需求趋势（浏览量、退货率、搜索购买比） |

### E. 商标与品牌合规（4）
| 工具 | 用于 | 站点/参数 |
|------|------|-----------|
| `ss_trademark_country_list` | 商标知识产权局代码列表 | 无参 |
| `ss_trademark_list` | 商标列表（品牌名/申请人/尼斯分类/状态等） | `request` |
| `ss_trademark_stats` | 商标统计（office + text 必填） | `request` |
| `ss_trademark_detail` | 商标详情（office + brandId） | 平铺 |

## 标准作业流（问题 → 工具序列）
> 完整步骤、参数示例与判读阈值见 `references/playbooks.md`。

- **蓝海选品**：`first_category`/`product_node` 定类目 → `market_research` 看类目健康度 → `ss_market_*` 做结构体检 → `keyword_research`/`aba_research_*` 找需求词 → `product_research` 筛 ASIN → `google_trend` 验季节性。
- **市场结构体检**：`product_node` → 并行 `ss_market_product_concentration` + `ss_market_brand_concentration` + `ss_market_seller_concentration` + `ss_market_price_distribution` + `ss_market_ratings_count_distribution` + `ss_market_listing_date_distribution` → 汇总判断竞争度、定价带、进入门槛。
- **竞品拆解**：`asin_competitor`/`competitor_lookup` 定竞品 → `asin_detail` 看详情 → `asin_sales_trend`+`asin_prediction` 看销量 → `traffic_keyword_stat`→`traffic_keyword` 看流量结构 → `traffic_listing_stat`→`traffic_listing` 看关联流量 → `ss_keepa_info` 看价格/BSR 历史。
- **关键词调研 / Listing 优化**：`keyword_miner` 扩词 → `keyword_research` 拿市场数据 → `keyword_conversion` 定投放价值 → `traffic_keyword`/`ss_keyword_order` 反查竞品词并对照自身收录。
- **广告优化**：`keyword_conversion`（PPC/ACOS/CPA/预算）→ `traffic_keyword`（自然/广告词占比、`latest7daysAds`、`conversionKeywordTypes`）→ `ss_keyword_order`（按周/月看转化类型）→ 给出投词与出价建议。
- **评论与口碑洞察**：`ss_review` 拉取评论（星级/图片/视频/VP/Vine 过滤）→ 归纳差评痛点与卖点 → 反哺 Listing 与产品迭代。
- **促销与价格监控**：`ss_asin_coupon_trend`（优惠幅度/成交价）→ `ss_asin_detail_with_coupon_trend`（详情+优惠趋势）→ `ss_keepa_info`（价格/BSR 历史曲线）。
- **流量来源诊断**：`ss_traffic_source`（输入 ASIN 或关键词）→ 结合 `traffic_keyword` 拆解自然/广告/关联流量占比。
- **趋势与时点**：`google_trend` → `aba_research_weekly`/`ss_aba_research_trend` → `asin_sales_trend`。
- **品牌与合规前置**：`ss_trademark_country_list` → `ss_trademark_list`/`ss_trademark_stats` 查重 → `ss_trademark_detail` 看详情，规避商标侵权风险。

## 数据判读：资深运营的常用经验阈值
> 阈值为**方向性经验值**，须结合站点、类目基线对比使用，不可当作硬标准。

**需求与竞争**
- `searches` 月搜索量：细分赛道一般看 ≥ 3000；越大需求越硬。
- `supplyDemandRatio` 供需比：越高越蓝海，优先与同类目均值比较。
- `products` / `adProducts`：越多竞争越激烈。
- `monopolyClickRate`、`top3ClickingRate`：越低说明头部未垄断。
- `spr`：越低，上首页所需销量越少，越易推。
- `bid` PPC 竞价：越低获客成本越低。

**结构分布（ss_market_*）**
- **商品/品牌/卖家集中度**（`=T/A`）：头部占比越高，垄断越强、进入越难；集中度低更利于新玩家。
- **价格分布**：找「销量有支撑但平均评分偏低」的价格带 = 可用产品力/定价切入的差异化空间。
- **评分数分布**：高评分数区间占比大 = 新品评价门槛高；低评分数区间仍有销量 = 进入友好。
- **上架时长/时间分布**：新品区间销量占比高 = 买家接受新品；老品长销占比高 = 类目稳固、打法成熟。
- **A+/视频分布**：四象限中「有 A+/有视频」销量占比高 = 内容配置对转化边际贡献大，应优先补齐。
- **卖家类型**：`amazonSelfProportion` 高 = 自营强势；FBM 占比异常高可能代表低门槛/低客单。
- **卖家国籍**：中国卖家占比高 = 竞争打法同质化，需靠产品差异。

**转化与评论门槛**
- `purchaseRate`、`searchConvRate`/`clickConvRate`：越高越好。
- `avgRating` 均值星级、`ratings` 评价数：星级低说明有改进空间；评价数高说明门槛高。
- `lqs`（Listing 质量分）：越高竞品 Listing 越完善。

**类目健康度（market_research）**
- `newProportion`/`newProduct`：过高易被洗牌，或存在短期爆款。
- 集中度（`brands`/`sellers` 数、`top3ProductSales`/`top5ProductSales` 占比）：占比高=头部垄断。
- `avgProfit` 利润率、`returnRatio` 退货率、`amazonSelfProportion` 自营占比：谨慎评估。

**趋势**
- `growth`、`withYearlyGrowth`、ABA `w1/w4/w12 SearchRank` 与 `searchRankGrowthRate`：排名持续上升=需求走强。
- `google_trend` 曲线判季节性：旺季前 2–3 个月备货/测款。

## 输出规范（写报告时）
- **结论先行**：先给「做/不做、重点是什么」的判断，再附数据支撑。
- **结构化**：对比多 ASIN/类目/关键词时用表格，保留英文指标口径。
- **标注口径**：站点、月份、变体口径、排序方式、数据来源工具名。
- **可执行**：给出下一步动作（选哪几个 ASIN、投哪些词、出价区间、备货时点）。
- **区分事实与推断**：工具返回=事实；经验判断=推断，需明确标注。

## 错误与边界
- 缺少 `marketplace` 等必填项 → 先追问，不要默认 US。
- 站点超出该工具支持范围 / 分页大小非法 → JSON-RPC `-32602`，按 message 修正后重试一次。
- `UPSTREAM_ERROR` 按 `data.hint`：会话失效/配额耗尽→提示联系管理员；限流/超时/不可用→稍后重试或降频。
- 数据为空不等同于「没市场」，可能是配额或权限问题，需说明不确定性。
