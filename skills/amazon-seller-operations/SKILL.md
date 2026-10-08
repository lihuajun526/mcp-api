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

---

## 快速场景选择器（用户意图 → Playbook）

| 用户说什么 | 触发 Playbook |
|-----------|--------------|
| 找蓝海 / 找机会 / 什么品值得做 | **P1 蓝海选品** |
| 这个类目竞争怎么样 / 能进吗 | **P2 市场结构体检** + **P8 进入决策** |
| 分析竞品 / 拆解对手 / 对标 | **P3 竞品拆解** |
| 做关键词 / 优化 Listing / 标题五点 | **P4 关键词调研与 Listing 优化** |
| 广告 ACOS 太高 / 投哪些词 / 出价多少 | **P5 广告投放优化** + **P16 ACOS 深度诊断** |
| 竞品差评在哪 / 用户痛点 | **P6 评论与口碑洞察** |
| 竞品在打价格战 / 历史最低价 | **P7 促销与价格监控** |
| 这个品现在做来得及吗 / 什么时候备货 | **P9 趋势与时点判断** |
| 最近有什么爆款 | **P10 新品/爆款验证** |
| 这个 ASIN 流量从哪来 / 自然流量多少 | **P11 流量来源诊断** |
| 商标/品牌名有没有侵权风险 | **P12 品牌与商标合规** |
| 哪个国际站更值得进入 / 站点选择 | **P13 跨站市场选择** |
| 新品怎么 Launch / 上新计划 | **P14 新品上线 Launch 策略** |
| 做捆绑 / 变体组合 / 套装 | **P15 捆绑/变体/组合品策略** |
| 备货多少 / 目标 BSR 对应销量 | **P17 库存规划与 BSR 目标** |

---

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

---

## 交互确认协议（开始任何分析前必须执行）

> **核心原则**：46 个工具中有 42 个强制要求 `marketplace`，29 个有时间维度参数 `month`。任何一个传错，返回的都是错误市场或错误时间的数据，后续分析全部作废。**在调用第一个工具前，必须完成以下参数确认，不允许静默假设任何默认值。**

### 第一优先级：marketplace（每次必问）

**触发条件**：用户问题中未明确给出亚马逊站点代码（US / JP / UK / DE 等）时，**必须先问，不得调用任何工具**。

> 即使用户说了"美国站"、"我是美国卖家"、"查一下亚马逊的数据"——这些都不足以确认。因为：
> - 美国卖家可能在分析德国站的机会
> - ASIN 以 B0 开头不代表是美国站商品
> - 不同站点数据完全独立，混用会导致严重误导

**标准问法（选其一，言简意赅）**：
```
请问是哪个亚马逊站点？支持：US / JP / UK / DE / FR / IT / ES / CA / IN / MX（及部分工具支持 BR / AU / AE / SA）
```
```
需要先确认一下站点，是美国（US）还是其他站点？
```

**用户若给出中文站点名，按以下映射转换**：

| 用户说 | marketplace 代码 |
|--------|-----------------|
| 美国 / 亚马逊美国 | US |
| 日本 / 日亚 | JP |
| 英国 / 英亚 | UK |
| 德国 / 德亚 | DE |
| 法国 | FR |
| 意大利 | IT |
| 西班牙 | ES |
| 加拿大 | CA |
| 印度 | IN |
| 墨西哥 | MX |
| 巴西 | BR |
| 澳大利亚 / 澳亚 | AU |
| 阿联酋 / 中东 | AE |
| 沙特 | SA |

> **4 个商标工具例外**（`ss_trademark_list` / `ss_trademark_stats` / `ss_trademark_detail` / `ss_trademark_country_list`）：这 4 个工具不使用 `marketplace`，而是用 `office`（知识产权局代码）。询问时改问"要查哪个国家/地区的商标注册信息？"，再用 `ss_trademark_country_list` 获取对应的 `office` 代码。

---

### 第二优先级：时间范围（按场景判断）

**29 个工具**有 `month` / `date` / `historyDate` 参数。以下情形**必须确认**：

| 用户表达 | 处理方式 |
|---------|---------|
| "最近的" / "现在" / "当前" | 使用 API 默认（最近月份），**但需提示**"最近月份数据可能尚未完整，如需完整数据请指定上月（如 202509）" |
| "上个月" / "上季度" | 换算成具体 yyyyMM，**向用户确认**是否正确（如"上个月指 202509，对吗？"） |
| "今年" / "最近半年" | 问清具体起止月份，或说明"趋势分析建议用 asin_sales_trend，无需手动指定月份" |
| 用户已给出具体月份（如"8月"） | 换算成 yyyyMM 后**复述确认**（"8月即 202508，对吗？"） |
| 跨月对比分析 | 每次调用保持相同 month，避免混用不同月份的数据 |

> **滞后风险提示**：SellerDex 数据通常有 1~2 个月的统计滞后。最近月份（如当月）数据常不完整，下结论时优先引用**上一个完整月份**的数据，并标注月份。

---

### 第三优先级：变体口径（竞品/选品分析时确认）

**触发条件**：调用 `competitor_lookup` / `product_research` / `asin_competitor` / `ss_keyword_order` 时，涉及"销量排名"等聚合指标，`variation` 参数会显著影响数据。

| 场景 | 推荐 variation | 说明 |
|------|---------------|------|
| 看整体市场规模（父ASIN视角） | N（默认，含变体） | 父ASIN销量 = 所有变体之和，市场总量准确 |
| 对比单个 SKU 竞争力 | Y（不含变体） | 只看主ASIN，排除变体干扰 |
| 不确定时 | 先用 N，再用 Y 对比 | 两个数字差异大说明变体多、差异小说明单一SKU |

> 无需每次都问用户，大多数分析默认 N 即可。**只在用户明确问"单个 SKU 的排名"或"去掉变体后的销量"时才切换 Y**。

---

### 第四优先级：商标查询的 office 确认

**触发条件**：调用任何 `ss_trademark_*` 工具前。

**标准问法**：
```
请问要查哪个国家/地区的商标？例如美国（USPTO）、欧盟（EUIPO）、中国（CNIPA）、英国（UKIPO）、日本（JPO）等。
可以先调用 ss_trademark_country_list 获取全部支持的 office 代码。
```

---

## 黄金规则（每次调用都遵守）
1. **交互确认优先**：每次对话开始时，按上方"交互确认协议"核查 marketplace / month / variation / office，**确认完毕再调用工具，不允许静默默认**。
2. **日期口径**：`month` / `date` / `historyDate` 一律 `yyyyMM`（如 202507）；不填 = 最近月份 / 最近30天。数据存在滞后，最近月份常不完整，下结论优先用上一个完整月份。
3. **两种调用形态**：
   - **常规工具**：参数**平铺**在 `arguments`（如 `marketplace`、`asin`、`size` 直接传）。
   - **request 包裹型**：业务参数要放进 **`request` 对象**内。包裹型工具：`ss_market_*`（13个）、`ss_trademark_list`、`ss_trademark_stats`、**`ss_traffic_source`**（注意这个！）。
4. **省 Token**：用 `returnFields` 只取分析所需字段。**类型不一致**——常规工具是**数组** `["asin","price"]`，`ss_*` request 型工具是**逗号字符串** `"asin,price"`。
5. **先概览后明细**：`traffic_keyword_stat` → `traffic_keyword`；`traffic_listing_stat` → `traffic_listing`。
6. **类目取值链路**：`first_category`（站点一级类目，ABA 的 `departments` 用它）→ `product_node`（逐层取 `nodeIdPath`）→ 传给 `product_research` / `competitor_lookup` / `market_research` / `bsr_prediction` / 全部 `ss_market_*`。
7. **不要编造**：只引用工具返回的数字；缺失或为空要明说，不得用经验值冒充数据。
8. **失败处理**：业务失败返回 `{code,message,data}`，按 `data.hint` 决定重试 / 降频 / 联系管理员。
9. **口径一致**：对比时保证同站点、同月份、同变体口径（`variation`）、同排序口径。
10. **并行调用优先**：无数据依赖的工具同时发起（如市场结构体检的 `ss_market_*` 13个工具）。

---

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
| `ss_traffic_source` | 流量来源（输入 ASIN 或关键词，**request 包裹型**） | 13 |

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
| `ss_trademark_list` | 商标列表（品牌名/申请人/尼斯分类/状态等） | `request`，`text` 必填 |
| `ss_trademark_stats` | 商标统计（`office`+`text` 必填） | `request` |
| `ss_trademark_detail` | 商标详情（`office`+`brandId` 必填） | 平铺 |

---

## 标准作业流（问题 → 工具序列）
> 完整步骤、参数示例与判读阈值见 `references/playbooks.md`。

- **蓝海选品（P1）**：`first_category`/`product_node` 定类目 → `market_research` 看类目健康度 → `ss_market_*` 做结构体检 → `keyword_research`/`aba_research_*` 找需求词 → `product_research` 筛 ASIN → `google_trend` 验季节性。
- **市场结构体检（P2）**：`product_node` → 并行 `ss_market_product_concentration` + `ss_market_brand_concentration` + `ss_market_seller_concentration` + `ss_market_price_distribution` + `ss_market_ratings_count_distribution` + `ss_market_listing_date_distribution` → 汇总判断竞争度、定价带、进入门槛。
- **竞品拆解（P3）**：`asin_competitor`/`competitor_lookup` 定竞品 → `asin_detail` 看详情 → `asin_sales_trend`+`asin_prediction` 看销量 → `traffic_keyword_stat`→`traffic_keyword` 看流量结构 → `traffic_listing_stat`→`traffic_listing` 看关联流量 → `ss_keepa_info` 看价格/BSR 历史。
- **关键词调研 / Listing 优化（P4）**：`keyword_miner` 扩词 → `keyword_research` 拿市场数据 → `keyword_conversion` 定投放价值 → `traffic_keyword`/`ss_keyword_order` 反查竞品词并对照自身收录。
- **广告优化（P5/P16）**：`keyword_conversion`（PPC/ACOS/CPA/预算）→ `traffic_keyword`（自然/广告词占比、`latest7daysAds`、`conversionKeywordTypes`）→ `ss_keyword_order`（按周/月看转化类型）→ 给出投词与出价建议。
- **评论与口碑洞察（P6）**：`ss_review` 拉取评论（星级/图片/视频/VP/Vine 过滤）→ 归纳差评痛点与卖点 → 反哺 Listing 与产品迭代。
- **促销与价格监控（P7）**：`ss_asin_coupon_trend`（优惠幅度/成交价）→ `ss_asin_detail_with_coupon_trend`（详情+优惠趋势）→ `ss_keepa_info`（价格/BSR 历史曲线）。
- **流量来源诊断（P11）**：`ss_traffic_source`（**request 包裹**，输入 ASIN 或关键词）→ 结合 `traffic_keyword` 拆解自然/广告/关联流量占比。
- **趋势与时点（P9）**：`google_trend` → `aba_research_weekly`/`ss_aba_research_trend` → `asin_sales_trend`。
- **品牌与合规前置（P12）**：`ss_trademark_country_list` → `ss_trademark_list`/`ss_trademark_stats` 查重 → `ss_trademark_detail` 看详情，规避商标侵权风险。
- **跨站市场选择（P13）**：各站点同类目 `market_research` 横向对比 → `ss_market_*` 结构差异 → `keyword_research`（14站）需求验证。
- **新品 Launch（P14）**：词库建立（`keyword_miner`/`keyword_research`）→ 竞品门槛（`asin_detail`+`keyword_conversion`）→ 流量规划 → 节点追踪。
- **库存规划（P17）**：`bsr_prediction` 估算目标销量 → `asin_sales_trend` 看季节系数 → `google_trend` 验旺季时点。

---

## 数据判读：资深运营的常用经验阈值
> 阈值为**方向性经验值**，须结合站点、类目基线对比使用，不可当作硬标准。

### 需求与竞争
- `searches` 月搜索量：细分赛道一般看 ≥ 3000；旗舰词看 ≥ 30000。
- `supplyDemandRatio` 供需比：越高越蓝海，优先与同类目均值比较。
- `products` / `adProducts`：越多竞争越激烈；`adProducts/products` > 50% = 广告依赖型市场。
- `monopolyClickRate`、`top3ClickingRate`：越低说明头部未垄断；< 40% 相对友好。
- `spr`：越低，上首页所需销量越少，越易推；< 10 属于低门槛。
- `bid` PPC 竞价：越低获客成本越低；与自身利润对比判断广告是否划算。
- `purchaseRate`（购买转化率）：> 15% 属于高转化词；< 5% 慎重投放。

### 结构分布（ss_market_*）
- **商品/品牌/卖家集中度**（= 头部T / 样本A）：> 50% 头部垄断强；< 30% 新玩家机会多。
- **价格分布**：找「销量有支撑但平均评分偏低」的价格带 = 可用产品力/定价切入的差异化空间。
- **评分数分布**：高评分数区间占比大 = 新品评价门槛高；低评分数区间仍有销量 = 进入友好。
- **上架时长/时间分布**：近6个月上架商品销量占比 > 20% = 买家接受新品；老品长销比高 = 打法成熟。
- **A+/视频分布**：有A++有视频的销量占比明显高于无A+无视频 = 内容投入边际回报大，应优先补齐。
- **卖家类型**：`amazonSelfProportion` > 30% = 自营强势，需拼价格/品质；FBM 占比高 = 物流门槛低，易进入。
- **卖家国籍**：中国卖家占比高 = 竞争打法同质化，需靠产品/品牌差异。

### 转化与评论门槛
- `searchConvRate`/`clickConvRate`：越高越好，高 = 词与商品高度相关。
- `avgRating` 均值星级：> 4.2 为正常水位；< 3.8 说明改善空间大或产品质量风险。
- `ratings` 评价数：头部商品评价数 > 1000 = 门槛高，需大预算测评。
- `lqs`（Listing 质量分）：越高竞品 Listing 越完善；自己 < 竞品则需优先补齐 A+/视频/五点。

### 类目健康度（market_research）
- `newProportion` > 30%：新品快速涌入，赛道可能存在短期爆款或被洗牌风险。
- 集中度（`top3ProductSales`）> 60%：头部垄断显著，进入成本高。
- `avgProfit` 毛利率：< 15% 属于薄利赛道，需极高销量支撑。
- `returnRatio` 退货率：> 5% 属于高风险类目（服装除外）。
- `amazonSelfProportion` > 20%：自营进入，竞争激烈。

### 趋势
- `growth`（月环比增长）> 0 + `withYearlyGrowth`（同比增长）> 0 = 双维度向上，强需求。
- ABA `w1/w4/w12SearchRank`：排名持续上升（数值减小） = 需求走强。
- `google_trend` 曲线：旺季前 2~3 个月备货/测款；年同比持续下降 = 衰退市场。

### 广告指标
- `exactAcos` < 30%（对于 15%~25% 毛利品）= 可接受，可加预算。
- `exactAcos` > 毛利率 = 亏损，需降价/换词/提转化。
- `latest7daysAds / total_traffic`：广告词占比 > 70% = 严重依赖广告，自然词少、风险高。
- `conversionKeywordType=LOST`：转化流失词 → 查 Listing/价格/库存后降竞价止损。

---

## 常见反模式（这些做法会浪费 Token 或导致错误）
| 反模式 | 正确做法 |
|--------|---------|
| **用户没说站点，直接默认 US 调用** | 必须先问"请问是哪个站点？"，未确认不得调用任何工具 |
| **用户说"美国站"，不再二次确认** | 仍需确认——用户可能在分析其他市场机会，"美国卖家"≠"美国站数据" |
| **用户说 ASIN，直接猜是 US 站** | ASIN 与站点无关，必须问清楚站点 |
| **时间不明就使用默认最近月份** | 告知用户最近月份数据可能不完整，询问是否用上月完整数据 |
| **在 10 站工具里传 AE/BR/AU** | 会报 -32602，10 站仅 US/JP/UK/DE/FR/IT/ES/CA/IN/MX |
| 对比时用不同月份数据 | 保证口径一致：同站点、同月份、同变体口径 |
| 不传 `returnFields` 直接拉全字段 | 按需传 `returnFields`，节省 Token |
| 先拉 `traffic_keyword` 再看规模 | 先 `traffic_keyword_stat` 评估规模，再决定是否翻页 |
| `ss_traffic_source` 参数平铺 | 参数放进 `request` 对象，这是 request 包裹型工具 |
| `keyword_miner` 用 `minSearches` | 字段名是 `minSearch`/`maxSearch` |
| `ss_keyword_order` 忘传 year/month | year+month+reverseType 三者必填 |
| `aba_research_weekly` 自己算周六日期 | 只传 year+month+week，系统自动换算 |
| 把 returnFields 字符串传给常规工具 | 常规工具的 returnFields 是数组格式 |
| 数据为空就说「没有市场」 | 说明不确定性，可能是配额/权限问题 |
| **商标工具也传 marketplace** | 商标工具用 `office`（如 US/EUIPO），不是 marketplace |

---

## 输出规范（写报告时）
- **结论先行**：先给「做/不做、重点是什么」的判断，再附数据支撑。
- **结构化**：对比多 ASIN/类目/关键词时用表格，保留英文指标口径。
- **标注口径**：站点、月份、变体口径、排序方式、数据来源工具名。
- **可执行**：给出下一步动作（选哪几个 ASIN、投哪些词、出价区间、备货时点）。
- **区分事实与推断**：工具返回 = 事实；经验判断 = 推断，需明确标注。
- **量化**：建议尽量带数字（如「spr = 8，建议推词 XX」），不要只说「竞争不大」。

---

## 错误与边界
- 缺少 `marketplace` 等必填项 → 先追问，不要默认 US。
- 站点超出该工具支持范围 / 分页大小非法 → JSON-RPC `-32602`，按 message 修正后重试一次。
- `UPSTREAM_ERROR` 按 `data.hint`：会话失效/配额耗尽→提示联系管理员；限流/超时/不可用→稍后重试或降频。
- 数据为空不等同于「没市场」，可能是配额或权限问题，需说明不确定性。
- `ss_keyword_order` `reverseType=W` 时 `week` 必填，否则报错。
