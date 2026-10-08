# 运营场景作业流（Playbooks）

> 每个 Playbook = 业务问题 → 工具调用序列 → 判读逻辑 → 输出物。工具名后括号内为关键入参。
> 通用纪律：**先完成下方前置确认，再执行任何步骤**；默认带 `returnFields` 收敛字段；不编造数据。
> `ss_market_*` 等 request 包裹型工具（含 `ss_traffic_source`）的入参需放进 `request` 对象。
> 无数据依赖的工具调用应**并行发起**，减少等待时间。

---

## 前置参数确认（所有 Playbook 通用，执行任何步骤前必须完成）

> **每次对话开始时必须执行此检查，42 个工具依赖 marketplace，传错即数据错配，所有分析作废。**

### Step 0-A：确认 marketplace（必问，无一例外）

**触发**：用户未在问题中明确给出站点代码（US/JP/UK/DE 等）时。

**动作**：立即向用户提问，**不得假设，不得默认 US**，在获得答复前不调用任何工具。

**推荐话术**：
> 请问需要查哪个亚马逊站点的数据？支持：US（美国）/ JP（日本）/ UK（英国）/ DE（德国）/ FR（法国）/ IT（意大利）/ ES（西班牙）/ CA（加拿大）/ IN（印度）/ MX（墨西哥），部分工具还支持 BR / AU / AE / SA。

**常见陷阱**：
- 用户说"帮我查亚马逊……" → 未指定站点，必须问
- 用户说"我在美国做" → 不等于分析 US 站，可能在研究 DE 机会，必须问
- 用户提供了 ASIN（如 B07Z82895W）→ ASIN 不绑定站点，必须问
- 用户说"查美国的" → 可以推断 US，**但仍需用"美国 US 站，对吗？"二次复述确认**，防止歧义

**例外**：`ss_trademark_country_list`、`ss_trademark_list`、`ss_trademark_stats`、`ss_trademark_detail` 这 4 个商标工具不使用 `marketplace`，改问"要查哪个国家/地区的商标注册？"并用 `office` 参数。

---

### Step 0-B：确认时间范围（按场景判断）

**触发**：分析明确涉及时间维度，或用户给出了模糊时间表达时。

| 用户表达 | 处理方式 |
|---------|---------|
| "最近的" / "现在" / "当前" | 使用 API 默认，**明确告知**"最近月份数据可能不完整，若需完整数据可指定上月（如 202509）" |
| "上个月" | 换算成 yyyyMM 并**复述确认**："上个月即 202509，对吗？" |
| "今年 X 月" / "X 月份" | 换算后复述，如"8 月即 202508，对吗？" |
| 跨月对比 | 要求用户确认起止月份，同一分析内保持相同 month |
| 未提及时间 | 默认最近完整月份，**在输出结论时标注所用月份** |

> 数据滞后提醒：SellerDex 数据有约 1~2 个月统计滞后，下结论时优先引用**上一个完整月份**，并在报告中标注。

---

### Step 0-C：确认变体口径（选品/竞品/市场分析时）

**触发**：调用 `competitor_lookup` / `product_research` / `asin_competitor` / `ss_keyword_order` 时，默认使用 `variation=N`（含变体）。

- 大多数场景无需询问，直接用默认值 `N`（含变体，销量为父ASIN总量）。
- 仅当用户明确说"排除变体"/"只看主款"时，切换为 `variation=Y`。
- 输出时标注"数据口径：含变体（N）"，便于用户知晓。

---

### Step 0-D：确认 topN（ss_market_* 类目体检时）

**触发**：调用任何 `ss_market_*` 工具前。

- 默认 `topN=10`（取头部前10商品做集中度对比），适用于大多数场景。
- 若用户说"看头部前20名"或"更大样本"，调整为 `topN=20`。
- 输出时标注"头部样本：topN=10"。

---

**完成 Step 0-A 至 0-D 后，方可执行以下各 Playbook 的具体步骤。**

---

## P1. 蓝海选品（从 0 找机会赛道）

**触发**：帮我找 XX 站点的蓝海类目 / 有什么值得做的新品。

**步骤**
1. `first_category(marketplace)` — 取站点一级类目；若用户已给类目名，语义匹配出 `category_value`。
2. `product_node(marketplace, keyword=类目名)` 或 `product_node(nodeIdPath=顶层路径)` — 逐层向下拿到目标 `nodeIdPath`。
3. `market_research(marketplace, month, nodeIdPath, topNum, newProduct=3, order={field:"avgProfit",desc:true})` — 看子类目健康度（规模/利润率/集中度/新品占比/退货率/自营占比）。
4. 结构体检（见 P2）— 需要更细的竞争结构时，串联 `ss_market_*`。
5. `keyword_research(marketplace, keywords=核心词, month, order={field:"supplyDemandRatio",desc:true})` — 从需求词验证需求与竞争。
6. `aba_research_monthly(marketplace, date, departments=[category_value], searchModel=3)`（持续增长）或 `5`（潜力）— 交叉验证潜力词。
7. `product_research(marketplace, month, nodeIdPaths=[nodeIdPath], keyword, ...区间, order={field:"total_units",desc:true})` — 落到 ASIN 机会商品。
8. `google_trend(marketplace, keyword, intervalYear=5, monthly=false)` — 验季节性，判切入时点。

**判读**：需求（searches/purchases）↑ + 竞争（products/adProducts/monopolyClickRate）↓ + 利润（avgProfit/price）合理 + 趋势（growth/yearlyGrowth）↑ + 退货率低 = 优先赛道。

**筛选参考值**（结合类目均值使用）：
- 月均销量 `avgUnits` ≥ 300；均价 `avgPrice` ≥ $20（高客单）
- 毛利率 `avgProfit` ≥ 20%；退货率 `returnRatio` < 5%
- 集中度 `top3ProductSales` < 50%；自营占比 `amazonSelfProportion` < 20%

**输出**：候选赛道排序表 + Top 候选 ASIN + 建议切入词与备货时点。

---

## P2. 市场结构体检（类目深度分析）

**触发**：这个类目竞争激烈吗 / 头部垄断程度如何 / 定价带怎么定。

**步骤**（先 `product_node` 拿 `nodeIdPath`，再**并行**调用以下工具）
1. `ss_market_research_statistics(request{marketplace, nodeIdPath, month, topN=10})` — 汇总。
2. 集中度三件套（并行）：
   - `ss_market_product_concentration`：商品集中度 = 头部销量 T / 样本销量 A。
   - `ss_market_brand_concentration`：品牌集中度（含同级类目对比）。
   - `ss_market_seller_concentration` / `ss_market_seller_type_concentration`：卖家（及 AMZ/FBA/FBM）集中度。
3. `ss_market_price_distribution` — 价格区间分布、销量占比、平均销量占比、区间评分 → 找差异化定价带。
4. `ss_market_ratings_count_distribution` + `ss_market_rating_distribution` — 评分数/星级分布 → 判断评价门槛。
5. `ss_market_listing_date_distribution` + `ss_market_listing_trend_distribution` — 上架时长/时间分布 → 新品接受度与生命周期。
6. `ss_market_ebc_distribution` — A+/视频内容配置四象限 → 内容投入优先级。
7. `ss_market_product_demand_trend` — 浏览量、退货率、搜索购买比（与同类目对比）。
8. `ss_market_seller_country_distribution` — 卖家国籍分布。

**判读**
- 集中度越高→头部垄断越强、新品生存空间越小；越低越适合新玩家切入。
- 价格分布中「销量有支撑 + 平均评分偏低」的区间=差异化机会带。
- 高评分数区间占比大→评价门槛高，需预留测评/广告预算。
- 新品区间销量占比高→买家接受新品；老品长销占比高→类目稳固、打法成熟。
- A+/视频配置越全的区间销量占比越高→内容边际回报越大，应优先补齐。

**输出**：类目竞争结构报告（集中度、价格带、评价门槛、生命周期、内容配置、卖家画像）+ 进入建议。

---

## P3. 竞品拆解（对标与差异分析）

**触发**：分析某 ASIN / 帮我拆解这几个竞品。

**步骤**
1. 定竞品：`asin_competitor(marketplace, asin, size=60)` 自动找直接竞品；或 `competitor_lookup(marketplace, keyword=.../brand=..., order={field:"total_units",desc:true})`。
2. `asin_detail(marketplace, asin)` — 品牌、价格、`bsrId`、`nodeIdPath`、评价、变体、`lqs`（一次一个，多个并行）。
3. 销量（并行）：`asin_sales_trend`（月度长期、父/子体）+ `asin_prediction`（日粒度短期）。
4. 流量结构：`traffic_keyword_stat(marketplace, asin)` → `traffic_keyword(marketplace, asin, order={field:"trafficPercentage",desc:true})` 看主力词、自然/广告占比（`naturalRatio`/`adRatio`）。
5. 关联流量：`traffic_listing_stat(marketplace, asinList=[自己,竞品...])` → `traffic_listing(relations=[数量最大的类型])`。
6. 词矩阵：`traffic_extend(marketplace, asinList=[多个竞品])` 找多竞品共同争夺的高价值词。
7. 价格/BSR 历史：`ss_keepa_info(marketplace, asin, dailyLatest=true)` 看历史曲线，识别价格战与排名波动。

**判读**：
- 竞品靠自然词多（`naturalRatio` > 60%）、广告词少→品牌自然流量强，硬拼广告难；
- 广告词多（`latest7daysAds` 高）→依赖广告拉流，可打差异化占自然流量。
- `FBT`/`VAV` 关联多→有捆绑/互补机会。
- `lqs` 低（< 6）→竞品 Listing 不完善，内容优化可超越。

**输出**：竞品对比表（价格、销量、BSR、评价、利润、流量结构、历史价格）+ 差异化切入点。

---

## P4. 关键词调研与 Listing 优化

**触发**：给 XX 产品做关键词规划 / 优化标题五点。

**步骤**
1. `keyword_miner(marketplace, keywordList=[种子词...], filterRootWord=0, matchType=1)` — 扩长尾词库；用 `minRelevancy=60` 过滤相关性，`minSupplyDemandRatio` 和低 `minProducts` 判竞争，`maxSPR=15` 筛上首页易打词。
2. `keyword_research(marketplace, keywords=核心词, month)` — 拿核心词市场量级、趋势、关联 ASIN、TOP3 品牌/类目。
3. `keyword_conversion(marketplace, keyword=核心词, timeType=90D, keywordBidMatchType=exact)` — 转化率、PPC、ACOS，评估商业价值。
4. `ss_keyword_research_trends(marketplace, keyword)` — 看词的历史趋势，避开衰退词。
5. 反查对标：`traffic_keyword(marketplace, asin=竞品)` / `ss_keyword_order(marketplace, asins=[竞品], reverseType=M, year=..., month=..., conversionType=E,S)` — 看竞品靠哪些词拿量，对照自己是否收录。

**判读与分层**
- **标题核心词**：`searches` ≥ 5000 + `purchaseRate`/`searchConvRate` 高 + `spr` 低 + 竞争可控。
- **广告词**：`conversionRate`（click-to-buy）高 + `bid` 低于产品利润的 15%。
- **铺词/长尾**：`wordCount` ≥ 3、`products` 少、`supplyDemandRatio` 高。
- **埋词优先级**：核心高转化词放标题/五点/A+；长尾词放 Search Terms / 后台。
- **季节词**：用 `marketPeriod=S11,S12` 等筛旺季词，在旺季前 1 个月上词。

**输出**：分层关键词表（标题/五点/Search Terms/后台）+ 埋词位置建议 + 「竞品已收录而自己缺失」的词清单。

---

## P5. 广告投放优化

**触发**：这个词值不值得投 / ACOS 太高怎么办 / 广告词怎么出价。

**步骤**
1. `keyword_conversion(marketplace, keyword/包含词, timeType=WEEK|90D, keywordBidMatchType=exact|phrase|broad)` — `searchConvRate`/`clickConvRate`、`exactPpc/broadPpc/phrasePpc`、`exactAcos`、`exactBudget`、`top3Asins`/`top10Asins`。
2. `traffic_keyword(marketplace, asin=自己, conversionKeywordTypes=[LOST])` — 转化流失词；`[INVALID]` 找否词候选；`[EXCELLENT]` 找优质词加投。
3. `ss_keyword_order(marketplace, asins=[自己], reverseType=W, year=..., month=..., week=..., conversionType=L,I)` — 按周看转化流失/无效曝光词。
4. `traffic_keyword(marketplace, asin=自己, order={field:"latest7daysAds",desc:true}, badges=[ADS])` — 看广告依赖度，`latest7daysAds` 高的词需确认转化。
5. `keyword_miner(marketplace, keywordList=[现有词...])` / `traffic_extend(marketplace, asinList=[自己,竞品...])` — 拓低 `bid` + 高 `purchaseRate` 的新投放词。

**判读**：
- `exactAcos` < 毛利率 → 可维持或加预算、提竞价。
- `exactAcos` > 毛利率 → 亏损，降竞价或加否词。
- 词的 `conversionKeywordType=LOST` → 查 Listing/价格/库存后降竞价止损，不要盲目提价。
- 广告词比例（`adRatio`）持续 > 70% → 说明自然流量严重不足，优先优化 Listing 而非加预算。
- 新拓词优选：`spr` < 10 + `bid` < $1 + `purchaseRate` > 10%。

**输出**：投放词分层（加投/维持/降价/否词）+ 建议竞价区间（参考 `exactPpc.min~max`）+ 否词清单。

---

## P6. 评论与口碑洞察

**触发**：竞品差评在哪 / 用户最在意什么 / 怎么优化产品。

**步骤**
1. `ss_review(marketplace, asin, starList=[1,2,3])` — 拉中差评，归纳痛点。
2. `ss_review(marketplace, asin, typeList=[1,2])` — 看图片/视频评论，了解真实使用场景。
3. `ss_review(marketplace, asin, typeList=[4])` — 看 Vine 评论（早期口碑，代表产品初上市质量）。
4. `ss_review(marketplace, asin, startTimestamp=近3月起点ms, endTimestamp=now_ms)` — 按时间窗看近期口碑变化（如改版后/节假日后）。
5. 结合 `asin_detail` 的 `rating`/`ratings` 与 `ss_market_rating_distribution` 判断类目整体口碑水位。

**判读**：
- 差评集中的功能点 = 产品迭代优先级；出现频率最高的问题必须改。
- 高频「没有 XX 功能/尺寸不对」= 差异化卖点来源。
- 若差评来自物流/包装 → 属可快速修正项（不涉及产品开模）。
- Vine 评论差 = 产品质量问题，须在大批货前解决。
- 竞品 `rating` < 3.8 = 进入机会，做好产品力可快速超越。

**输出**：差评痛点清单（按频次）+ Listing 卖点/五点改写建议 + 产品迭代清单（优先级排序）。

---

## P7. 促销与价格监控

**触发**：竞品在打价格战吗 / 优惠力度多大 / 历史最低价是多少。

**步骤**
1. `ss_asin_coupon_trend(marketplace, asin)` — 原价、优惠类型（金额/百分比）、优惠金额、成交价。
2. `ss_asin_detail_with_coupon_trend(marketplace, asin)` — 详情 + 优惠趋势一起看（效率更高）。
3. `ss_keepa_info(marketplace, asin, dailyLatest=true)` — 价格/BSR 历史曲线，识别涨价/降价节点与排名联动。
4. `asin_sales_trend(marketplace, asin)` / `asin_prediction(marketplace, asin)` — 验证价格变动对销量的影响。

**判读**：
- 优惠期（coupon）销量明显上行 → 价格弹性高，可计划促销节点。
- `ss_keepa_info` 显示长期低价 + BSR 稳定 → 低成本壁垒高，慎入；低价 + BSR 波动 → 价格战消耗，不可持续。
- 竞品节假日/Prime Day 前降价 20%+ → 提前布局促销，不跟则丢流量。
- 成交价长期低于产品标价的 60% → 竞品可能亏损清库，机会期或陷阱。

**输出**：竞品价格/促销节奏表 + 自身定价与促销时点建议 + 历史最低价参考。

---

## P8. 市场/类目评估（进入决策）

**触发**：XX 类目能做吗 / 这个市场值不值得进入。

**步骤**
1. `product_node(marketplace, keyword=类目)` → `nodeIdPath`。
2. `market_research(marketplace, month, nodeIdPath, topNum=10, newProduct=3)` — 类目整体规模/均价/利润率/集中度/新品占比/退货率/自营占比。
3. 结构体检（P2）— `ss_market_*` 深挖集中度与分布。
4. `product_research(marketplace, month, nodeIdPaths=[...], order={field:"total_units",desc:true})` — 看头部实际商品，验证垄断情况。
5. `bsr_prediction(marketplace, categoryId, bsr=目标排名)` — 估算目标 BSR 对应销量，判断投入产出。

**决策框架**
| 维度 | 绿灯 | 黄灯 | 红灯 |
|------|------|------|------|
| 月均销量 avgUnits | ≥ 500 | 200~500 | < 200 |
| 毛利率 avgProfit | ≥ 25% | 15~25% | < 15% |
| 头部集中度 top3ProductSales | < 40% | 40~60% | > 60% |
| 退货率 returnRatio | < 3% | 3~7% | > 7% |
| 自营占比 amazonSelfProportion | < 10% | 10~25% | > 25% |
| 新品接受度 newProportion | ≥ 15% | 8~15% | < 8% |

**输出**：类目评估结论 + 进入门槛（评价数/SPR/广告成本）+ 目标 BSR 与预估销量。

---

## P9. 趋势与时点判断

**触发**：这个品现在做来得及吗 / 什么时候备货 / 旺季是什么时候。

**步骤**
1. `google_trend(marketplace, keyword, intervalYear=5, monthly=true)` — 5年月度曲线，找季节峰值与长期趋势方向（上升/平稳/衰退）。
2. `aba_research_weekly(marketplace, year/month/week, includeKeywords=词, searchModel=4)` — 短期飙升词，判断近期需求急升。
3. `ss_aba_research_trend(marketplace, keyword, timeGranularity=M)` — ABA 排名/搜索量趋势（月粒度）。
4. `ss_keyword_research_trends(marketplace, keyword)` — 关键词趋势佐证，与 ABA 交叉验证。
5. `asin_sales_trend(marketplace, asin=竞品)` — 竞品月度销量验证季节性（多个竞品并行）。

**判读**：
- Google Trend 值 > 75（峰值）+ ABA 排名上升 = 旺季确认；备货节点 = 峰值前 2.5~3 个月（含海运周期）。
- 5年趋势整体斜向上 = 长期增长市场，值得布局；斜向下 = 衰退，谨慎进入。
- ABA `searchRankGrowthRate` > 50% 连续3周 = 爆款信号，可考虑快速跟品。
- 词的 `marketPeriod` 返回 S11/S12 = 强季节性，必须提前备货，错过旺季流量损失惨重。

**输出**：季节曲线要点 + 备货/上架时点建议 + 趋势结论（上升/平稳/衰退）。

---

## P10. 新品/爆款验证

**触发**：最近有什么爆款 / 谁在做得好但门槛低 / 跟品还是独立开发。

**步骤**
1. `aba_research_weekly(marketplace, year/month/week, searchModel=4, order={field:"searchRankGrowthRate",desc:true})` — 找近期上升词。
2. `product_research(marketplace, month, keyword=该词, availableMonth=6, order={field:"total_units",desc:true})` — 筛近 6 个月上架商品，找快速起量新品。
3. `asin_detail(marketplace, asin)` + `asin_sales_trend`/`asin_prediction`（并行）— 验证单品销量与上架时间。
4. `traffic_keyword(marketplace, asin=爆品, conversionKeywordTypes=[EXCELLENT])` + `ss_keyword_order(marketplace, asins=[爆品], reverseType=M, year=..., month=...)` — 看它靠哪些词起量，复制打法。
5. 门槛评估：`asin_detail.ratings`（评价数门槛）、`keyword_conversion.exactPpc`（广告成本）、`keyword_miner.spr`（上首页难度）。

**判读**：
- 上架 < 3 个月 + 月销量 > 300 + 评价 < 100 = 爆款早期，可快速跟进；
- 上架 < 6 个月 + 月销量 > 500 + 评价 < 50 = 低门槛高机会，优先布局；
- 词 `spr` < 10 + `bid` < $1.5 = 广告成本低，易拉流量。

**输出**：爆款案例表（ASIN、上架时间、当前销量、起量词、门槛）+ 可复制要点 + 跟品 vs 独立开发建议。

---

## P11. 流量来源诊断

**触发**：这个 ASIN 流量从哪来 / 自然流量占比多少 / 广告依赖度怎么样。

**步骤**
1. `ss_traffic_source(request{marketplace, q=ASIN, month})` — 流量来源概览（自然/官方推荐/广告词分布）。
2. `traffic_keyword_stat(marketplace, asin, month)` → `traffic_keyword(marketplace, asin, order={field:"trafficPercentage",desc:true})` — 拆自然词/广告词/AC词/ER词占比与主力词。
3. `traffic_listing_stat(marketplace, asinList=[asin])` → `traffic_listing(marketplace, asinList=[asin], relations=[最大量类型])` — 关联流量（免费/付费）结构。
4. `ss_keyword_order(marketplace, asins=[asin], reverseType=M, year=..., month=...)` — 出单词反查。

**判读**：
- `naturalRatio` > 60% = 自然流量健康，广告属于加速器；
- `naturalRatio` < 30% = 严重依赖广告，停广告即掉排名，需系统做自然词优化；
- 关联流量（FBT/VAV）占比 > 20% = 有捆绑机会，可开 FBT 广告或捆绑报单。

**输出**：自然/广告/关联流量占比 + 流量来源结构 + 优化方向（收词/投放/关联）。

---

## P12. 品牌与商标合规前置

**触发**：这个名字能注册吗 / 会不会侵权 / 帮我查商标。

> **注意**：本 Playbook 的 4 个工具均不使用 `marketplace`，改用 `office`（知识产权局代码）。
> 执行前替换 Step 0-A 问法为："请问要查哪个国家/地区的商标？例如美国（US）、欧盟（EUIPO）、中国（CNIPA）、英国（UKIPO）、日本（JPO）等。"

**步骤**
1. `ss_trademark_country_list` — 取全部知识产权局（office）代码列表，据此确认用户指定市场的 office 代码。
2. `ss_trademark_list(request{text=品牌名, office=[确认后的office代码], status=[Registered,Pending], niceClass=[产品对应尼斯分类]})` — 查同名/近似商标。
3. `ss_trademark_stats(request{office=[确认后的office代码], text=品牌名})` — 按国家统计数量与状态分布，快速判断风险集中国家。
4. `ss_trademark_detail(office=..., brandId=...)` — 看具体商标详情（权利人/类别/状态/有效期）。

**判读**：
- 目标类别（尼斯分类）存在 `Registered` 或 `Pending` 同名商标 → 高风险，需改名或规避。
- 仅在无关类别注册 → 可推进，但建议在目标类别主动确权。
- 多国已注册 = 全球布局品牌，绕不过去，需完全改名。

**尼斯分类常用参考**：电子产品=9；厨具=21；玩具=28；服装=25；宠物用品=31；家居=20；健康/美容=3,5。

**输出**：商标查重结论（风险等级：高/中/低）+ 建议品牌名/类别 + 后续确权动作。

---

## P13. 跨站市场选择（哪个国际站值得进入）

**触发**：要不要开 DE 站 / 哪个欧洲站最值得进 / 日本站和美国站哪个机会大。

> **特殊说明**：本 Playbook 涉及多个站点同时比较，Step 0-A 的问法改为："请确认您目前的**主站**（用于获取 nodeIdPath），以及想**对比的候选站点**（如 DE、UK、JP 等）？"

**步骤**
1. 确定产品的 `nodeIdPath`（在**已确认的主站**用 `product_node` 获取，再推算其他候选站点对应路径；不同站点的类目树结构不完全相同）。
2. **并行**在候选站点（如 US/UK/DE/JP）分别调用：
   - `market_research(marketplace=目标站, month, nodeIdPath=对应路径, topNum=10)` — 各站规模/均价/集中度/退货率。
   - `ss_market_research_statistics(request{marketplace=目标站, nodeIdPath=..., month})` — 综合指标。
3. 需求词验证：`keyword_research(marketplace=目标站, keywords=核心词, month)` — 不同站点搜索量与竞争对比（`keyword_research` 支持14站）。
4. `ss_market_seller_country_distribution(request{marketplace=目标站, nodeIdPath=...})` — 中国卖家渗透率，判断竞争同质化程度。
5. `ss_market_price_distribution(request{marketplace=目标站, nodeIdPath=...})` — 定价带差异，判断进入价格策略。
6. `google_trend(marketplace=各站, keyword=核心词, intervalYear=5, monthly=true)` — 各站市场趋势对比。

**判读**：
- **规模优先**：US 最大但竞争最激烈；DE/UK 规模第二梯队，中国卖家渗透相对低。
- **价格带**：欧洲站普遍可接受更高定价（消费者习惯），利润空间可能优于美国。
- **集中度**：同品类在不同站点集中度差异较大，优先进入集中度 < 40% 的站点。
- **语言/合规**：DE/FR/IT/ES 需本地语言 Listing；JP 需日文；合规成本纳入核算。
- **中国卖家占比**：某站点中国卖家占比 < 30% + 搜索量 > 5000 = 蓝海机会。

**输出**：各站点市场对比表（规模、竞争、定价、中国卖家占比、趋势）+ 推荐进入顺序 + 首选站点理由。

---

## P14. 新品上线 Launch 策略

**触发**：新品马上上架了 / 怎么做新品 Launch / 上新计划怎么制定。

**步骤（Launch 前 30 天）**
1. 词库建立：
   - `keyword_miner(marketplace, keywordList=[核心词,种子词], matchType=1)` — 拓展完整词库（建议 200+ 词）。
   - `keyword_research(marketplace, keywords=核心词)` — 验证主词量级与 TOP3 品牌。
   - `aba_research_monthly(marketplace, date=上月, departments=[类目], searchModel=1)` — 找热门词补充词库。
2. 竞争门槛评估：
   - `keyword_conversion(marketplace, keyword=核心词, timeType=90D, keywordBidMatchType=exact)` — 获取 `exactPpc`（广告竞价参考）、`exactAcos`（类目广告水位）。
   - `traffic_keyword_stat(marketplace, asin=标杆竞品)` — 了解标杆需要多少流量词支撑。
   - `asin_detail(marketplace, asin=标杆竞品)` — 对标 `ratings`（需追赶的评价数）、`lqs`（Listing 质量参考）。
3. 季节时点验证：`google_trend` + `ss_aba_research_trend` 确认上架时点不在旺季尾声。

**步骤（上架第 1~4 周，持续追踪）**
4. `asin_prediction(marketplace, asin=自己)` — 日粒度 BSR + 预估销量，判断起量节奏。
5. `traffic_keyword_stat(marketplace, asin=自己)` — 每周检查收录词数增长。
6. `traffic_keyword(marketplace, asin=自己, conversionKeywordTypes=[EXCELLENT])` — 找最快出单词，集中预算。
7. `ss_keyword_order(marketplace, asins=[自己], reverseType=W, year=..., month=..., week=..., conversionType=E,S)` — 周粒度出单词反查。

**Launch 资源分配参考**
- 前 2 周：精准词广告（取 `spr` < 10 的核心词 5~10 个）+ Vine 评论申请。
- 第 3~4 周：扩展 `conversionKeywordType=EXCELLENT` 词 + 适当开自动广告收集长尾数据。
- 第 5~8 周：`traffic_keyword` 反查自然收录词，停止已自然排名的广告词，节省预算。

**输出**：Launch 词库（分层）+ 广告计划（预算/词/出价区间）+ 里程碑节点（收录词数/BSR/评价数目标）。

---

## P15. 捆绑 / 变体 / 组合品策略

**触发**：做不做套装 / 哪几个 ASIN 适合捆绑 / 如何做变体组合。

**步骤**
1. 关联流量分析：
   - `traffic_listing_stat(marketplace, asinList=[核心ASIN])` — 看哪类关联最多（FBT/BAB/VAV）。
   - `traffic_listing(marketplace, asinList=[核心ASIN], relations=[FBT,BAB])` — 找「一起购买」的商品列表，这些是天然捆绑候选。
2. 市场验证：
   - `product_research(marketplace, month, keyword=组合词, order={field:"total_units",desc:true})` — 看市场上捆绑套装是否已有销量。
   - `keyword_research(marketplace, keywords=套装核心词)` — 验证套装关键词需求量。
3. 竞品套装拆解：
   - `asin_detail(marketplace, asin=套装竞品)` — 看变体结构（`variationList`）、价格策略（单品 vs 套装溢价）。
   - `ss_review(marketplace, asin=套装竞品, starList=[4,5])` — 好评归纳卖点，`starList=[1,2,3]` 归纳改善点。
4. 价格策略：`ss_asin_coupon_trend` / `ss_keepa_info` — 对标套装竞品促销节奏与历史价格。

**判读**：
- FBT 关联 ASIN 与你的主品互补（如耳机+耳机套）= 天然捆绑，用户接受度高。
- 套装词搜索量 ≥ 单品词的 20% = 有独立市场，值得开发；< 5% = 需求不明确。
- 套装售价 > 单品之和 × 1.15 = 捆绑溢价合理；< 单品之和 = 靠促销逻辑，需算清楚利润。
- 变体策略：同类目竞品变体数 > 5 且评价集中在父ASIN = 变体合并有利；变体数多但单个评价少 = 分散风险。

**输出**：推荐捆绑组合 + 定价策略 + 套装词库 + Listing 优化建议（五点突出套装价值）。

---

## P16. ACOS 诊断与广告结构优化（深化 P5）

**触发**：整体 ACOS 偏高但不知道问题在哪 / 广告结构要重建 / 想降 ACOS 但不降销量。

**步骤（四层诊断框架）**

**第一层：词层面**
1. `keyword_conversion(marketplace, keyword=广告词, timeType=90D, keywordBidMatchType=exact)` — 获取该词的市场平均 `exactAcos`，判断是高价竞争词还是自身Listing问题。
2. `traffic_keyword(marketplace, asin=自己, conversionKeywordTypes=[EXCELLENT,STABLE,LOST,INVALID])` — 分层统计各转化类型词的数量与流量占比。

**第二层：竞争层面**
3. `competitor_lookup(marketplace, keyword=主词, order={field:"total_units",desc:true}, size=20)` — 看头部竞品定价、评价、`lqs`，判断竞争力差距。
4. `traffic_extend(marketplace, asinList=[自己,头部竞品1,2])` — 找共同争夺的词，评估是否在高竞价词上与强手正面对抗。

**第三层：Listing 层面**
5. `asin_detail(marketplace, asin=自己)` — 检查 `lqs`（Listing 质量分），与竞品对比。
6. `ss_market_ebc_distribution(request{marketplace, nodeIdPath=..., topN=10})` — 判断类目内 A+/视频配置是否影响转化。

**第四层：价格层面**
7. `ss_asin_coupon_trend(marketplace, asin=自己)` + `ss_keepa_info(marketplace, asin=自己)` — 确认价格竞争力，高 ACOS 有时是价格偏高导致 CTR 低。
8. `ss_market_price_distribution(request{marketplace, nodeIdPath=..., month})` — 确认自身定价是否在主销价格带内。

**根因与对策**
| 根因 | 诊断信号 | 对策 |
|------|----------|------|
| 投放词转化差 | LOST/INVALID词占流量 > 40% | 下线LOST词，否定INVALID词 |
| Listing 转化率低 | lqs < 竞品均值；评分 < 4.0 | 优化图片/五点/A+/评价 |
| 价格竞争力不足 | 定价在价格带的高段且销量占比低 | 重新定价或增加coupon |
| 出价过高 | exactPpc > exactAcos对应健康竞价 | 压低竞价，转精准匹配 |
| 广泛匹配浪费 | broad词 ACOS >> exact词 | 关闭broad，改phrase/exact |

**输出**：ACOS 诊断报告（词/竞争/Listing/价格四层）+ 优化优先级清单 + 预期 ACOS 改善幅度。

---

## P17. 库存规划与 BSR 目标设定

**触发**：备货多少合适 / 目标 BSR 需要多少销量 / 旺季缺货怎么预防。

**步骤**
1. BSR 目标反推销量：
   - `asin_detail(marketplace, asin=竞标标杆)` — 获取 `bsrId`（一级类目ID）和 `bsrRank`（当前BSR）。
   - `bsr_prediction(marketplace, categoryId=bsrId, bsr=目标BSR)` — 获取 `estDailySales` 和 `estMonthSales`，这是目标销量基准。
2. 季节系数分析：
   - `asin_sales_trend(marketplace, asin=竞品)` — 拉 12 个月历史销量趋势，计算月度季节系数（旺月/均月）。
   - `google_trend(marketplace, keyword=核心词, intervalYear=5, monthly=true)` — 验证季节规律，找峰值月份。
3. 安全库存计算：
   - `asin_prediction(marketplace, asin=自己)` — 近期日销量估算（用于计算安全天数）。
   - 结合自身 FBA 补货周期（通常头程 30~45 天 + FBA 处理 3~7 天）。

**计算公式参考**
```
月备货量 = bsr_prediction.estMonthSales × 季节系数 × 安全系数(1.2~1.5)
旺季备货 = 月备货量 × 旺季月数 + 安全库存(30天日销量)
备货时点 = 旺季开始月份 - 头程周期(月) - 1
```

**旺季系数参考流程**
- `asin_sales_trend` 返回的 `parentUnitSales` 按月排列，旺月/全年均值 = 该月季节系数。
- 若竞品数据不够，用 `google_trend` 的 `items[].value` 归一化后推算。

**判读**：
- 旺季系数 > 2.5 = 强季节性产品，必须提前 3 个月大量备货，缺货等于放弃旺季。
- 旺季系数 1.2~1.5 = 弱季节性，安全库存 = 正常月销 × 1.5 即可。
- FBA 仓储费旺季（10~12月）上涨，需权衡发货时间和仓储成本。

**输出**：月度备货计划表 + 备货节点 + 目标 BSR 对应的月销量 + 旺季安全库存量。

---

## 输出与协作规范
- **结论先行**：先给判断（做/不做、加投/降价），再给数据。
- **表格化**：多对象对比一律用表；保留英文指标口径（如 `supplyDemandRatio`）。
- **标注口径**：站点、月份、变体口径（`variation`）、排序字段、数据来源工具名。
- **可执行**：每条结论配一个下一步动作（具体到词/ASIN/价格区间/时间节点）。
- **区分事实与推断**：工具返回值=事实；经验阈值=推断，需显式标注。
- **量化**：给出具体数字目标，如「建议补齐 A+，因为类目内有A+的商品销量占比达 68%，比无A+高出 2.3 倍」。
