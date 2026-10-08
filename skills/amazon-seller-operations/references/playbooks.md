# 运营场景作业流（Playbooks）

> 每个 Playbook = 业务问题 → 工具调用序列 → 判读逻辑 → 输出物。工具名后括号内为关键入参。
> 通用纪律：先确认站点（并核对是否在该工具支持范围内）与月份；默认带 `returnFields` 收敛字段；不编造数据。
> `ss_market_*` 等 request 包裹型工具的入参需放进 `request` 对象。

---

## P1. 蓝海选品（从 0 找机会赛道）

**触发**：帮我找 XX 站点的蓝海类目 / 有什么值得做的新品。

**步骤**
1. `first_category(marketplace)` — 取站点一级类目；若用户已给类目名，语义匹配出 `category_value`。
2. `product_node(marketplace, keyword=类目名)` 或 `product_node(nodeIdPath=顶层路径)` — 逐层向下拿到目标 `nodeIdPath`。
3. `market_research(marketplace, month, nodeIdPath, topNum, newProduct, order=avgProfit desc)` — 看子类目健康度（规模 / 利润率 / 集中度 / 新品占比 / 退货率 / 自营占比）。
4. 结构体检（见 P2）— 需要更细的竞争结构时，串联 `ss_market_*`。
5. `keyword_research(marketplace, keywords=核心词, month, order=supplyDemandRatio desc)` — 从需求词验证需求与竞争。
6. `aba_research_monthly(marketplace, date, departments=[category_value], searchModel=3)`（持续增长）或 `5`（潜力）— 交叉验证潜力词。
7. `product_research(marketplace, month, nodeIdPaths=[nodeIdPath], keyword, ...区间, order=total_units desc)` — 落到 ASIN 机会商品。
8. `google_trend(marketplace, keyword, intervalYear=5, monthly=false)` — 验季节性，判切入时点。

**判读**：需求（searches/purchases）↑ + 竞争（products/adProducts/monopolyClickRate）↓ + 利润（avgProfit/price）合理 + 趋势（growth/yearlyGrowth）↑ + 退货率低 = 优先赛道。

**输出**：候选赛道排序表 + Top 候选 ASIN + 建议切入词与备货时点。

---

## P2. 市场结构体检（类目深度分析）

**触发**：这个类目竞争激烈吗 / 头部垄断程度如何 / 定价带怎么定。

**步骤**（先 `product_node` 拿 `nodeIdPath`，再并行调用）
1. `ss_market_research_statistics(request{marketplace, nodeIdPath, month, topN})` — 汇总。
2. 集中度三件套：
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
1. 定竞品：`asin_competitor(marketplace, asin, size)` 自动找直接竞品；或 `competitor_lookup(marketplace, keyword=.../brand=..., order=total_units desc)`。
2. `asin_detail(marketplace, asin)` — 品牌、价格、`bsrId`、`nodeIdPath`、评价、变体、`lqs`。
3. 销量：`asin_sales_trend`（月度长期、父/子体）+ `asin_prediction`（日粒度短期）。
4. 流量结构：`traffic_keyword_stat` → `traffic_keyword(marketplace, asin, order=trafficPercentage desc)` 看主力词、自然/广告占比（`naturalRatio`/`adRatio`）。
5. 关联流量：`traffic_listing_stat(marketplace, asinList=[自己,竞品...])` → `traffic_listing(relations=[数量最大的类型])`。
6. 词矩阵：`traffic_extend(marketplace, asinList=[多个竞品])` 找多竞品共同争夺的高价值词。
7. 价格/BSR 历史：`ss_keepa_info(marketplace, asin)` 看历史曲线，识别价格战与排名波动。

**判读**：竞品靠自然词多、广告词少→硬拼广告难；广告词多、`latest7daysAds` 高→可打差异化。`FBT`/`VAV` 关联多→有捆绑/互补机会。

**输出**：竞品对比表（价格、销量、BSR、评价、利润、流量结构、历史价格）+ 差异化切入点。

---

## P4. 关键词调研与 Listing 优化

**触发**：给 XX 产品做关键词规划 / 优化标题五点。

**步骤**
1. `keyword_miner(marketplace, keywordList=[种子词...], filterRootWord, matchType)` — 扩长尾词库；用 `relevancy` 过滤相关性，`supplyDemandRatio`/`products`/`adProducts` 判竞争，`spr` 判上首页难度。
2. `keyword_research(marketplace, keywords=核心词, month)` — 拿核心词市场量级、趋势、关联 ASIN、TOP3 品牌/类目。
3. `keyword_conversion(marketplace, keyword=核心词, timeType=90D, keywordBidMatchType)` — 转化率、PPC、ACOS，评估商业价值。
4. `ss_keyword_research_trends(marketplace, keyword)` — 看词的历史趋势，避开衰退词。
5. 反查对标：`traffic_keyword` / `ss_keyword_order(marketplace, asins=[竞品], reverseType=M, conversionType=E,S)` — 看竞品靠哪些词拿量，对照自己是否收录。

**判读与分层**
- 主打词：`searches` 高 + `purchaseRate`/`searchConvRate` 高 + 竞争可控。
- 广告词：`conversionRate` 高 + `bid` 低。
- 铺词/长尾：`wordCount` 多、`products` 少、`supplyDemandRatio` 高。
- 埋词优先级：核心高转化词放标题/五点；长尾词放 Search Terms / A+ / 后台。

**输出**：分层关键词表 + 埋词位置建议 + 「竞品已收录而自己缺失」的词清单。

---

## P5. 广告投放优化

**触发**：这个词值不值得投 / ACOS 太高怎么办。

**步骤**
1. `keyword_conversion(marketplace, keyword/包含词, timeType=WEEK|90D, keywordBidMatchType=exact|phrase|broad)` — `searchConvRate`/`clickConvRate`、`exactPpc/broadPpc/phrasePpc`、`exactAcos`、`exactBudget`、`top3Asins`/`top10Asins`。
2. `traffic_keyword(marketplace, asin=自己, conversionKeywordTypes=[LOST])` — 转化流失词；`[INVALID]` 找否词候选；`[EXCELLENT]` 找优质词加投。
3. `ss_keyword_order(marketplace, asins=[自己], reverseType=W, conversionType=L,I)` — 按周看转化流失/无效曝光词。
4. `traffic_keyword(..., order=latest7daysAds desc, badges=[ADS])` — 看广告依赖度。
5. `keyword_miner` / `traffic_extend` — 拓低 `bid` + 高 `purchaseRate` 的新投放词。

**判读**：`exactAcos` 低于类目均值且 `searchConvRate` 高→加预算、提竞价；`bid` 高但 `purchaseRate` 低→转长尾或放弃；`LOST`→查 Listing/价格/库存后降竞价止损；广告词占比过高、自然词少→先补自然流量。

**输出**：投放词分层（加投/维持/降价/否词）+ 建议竞价区间（参考 `exactPpc.min~max`）+ 否词清单。

---

## P6. 评论与口碑洞察

**触发**：竞品差评在哪 / 用户最在意什么 / 怎么优化产品。

**步骤**
1. `ss_review(marketplace, asin, starList=[1,2,3])` — 拉中差评，归纳痛点。
2. `ss_review(marketplace, asin, typeList=[1,2])` — 看图片/视频评论，了解真实使用场景。
3. `ss_review(marketplace, asin, typeList=[4])` — 看 Vine 评论（早期口碑）。
4. `ss_review(marketplace, asin, startTimestamp/endTimestamp)` — 按时间窗看近期口碑变化（如改版后）。
5. 结合 `asin_detail` 的 `rating`/`ratings` 与 `ss_market_rating_distribution` 判断类目整体口碑水位。

**判读**：差评集中的功能点=产品迭代优先级；高频「没有 XX 功能/尺寸不对」=差异化卖点；若差评来自物流/包装则属可快速修正项。

**输出**：差评痛点清单（按频次）+ Listing 卖点/五点改写建议 + 产品迭代清单。

---

## P7. 促销与价格监控

**触发**：竞品在打价格战吗 / 优惠力度多大 / 历史最低价是多少。

**步骤**
1. `ss_asin_coupon_trend(marketplace, asin)` — 原价、优惠类型（金额/百分比）、优惠金额、成交价。
2. `ss_asin_detail_with_coupon_trend(marketplace, asin)` — 详情 + 优惠趋势一起看。
3. `ss_keepa_info(marketplace, asin, dailyLatest=true)` — 价格/BSR 历史曲线，识别涨价/降价节点与排名联动。
4. `asin_sales_trend` / `asin_prediction` — 验证价格变动对销量的影响。

**判读**：优惠期销量明显上行→价格弹性高，可计划促销；`ss_keepa_info` 显示长期低价+BSR 稳定→低成本壁垒高，慎入。

**输出**：竞品价格/促销节奏表 + 自身定价与促销时点建议。

---

## P8. 市场/类目评估（进入决策）

**触发**：XX 类目能做吗。

**步骤**
1. `product_node(marketplace, keyword=类目)` → `nodeIdPath`。
2. `market_research(marketplace, month, nodeIdPath, topNum=10, newProduct=3)` — 类目整体规模/均价/利润率/集中度/新品占比/退货率/自营占比。
3. 结构体检（P2）— `ss_market_*` 深挖集中度与分布。
4. `product_research(marketplace, month, nodeIdPaths=[...], order=total_units desc)` — 看头部实际商品，验证垄断情况。
5. `bsr_prediction(marketplace, categoryId, bsr=目标排名)` — 估算目标 BSR 对应销量，判断投入产出。

**输出**：类目评估结论 + 进入门槛（评价数/SPR/广告成本）+ 目标 BSR 与预估销量。

---

## P9. 趋势与时点判断

**触发**：这个品现在做来得及吗 / 什么时候备货。

**步骤**
1. `google_trend(marketplace, keyword, intervalYear=5, monthly=false)` — 5 年/1 年曲线，找季节峰值与长期趋势。
2. `aba_research_weekly(marketplace, year/month/week, includeKeywords=词, searchModel=4)` — 短期飙升词。
3. `ss_aba_research_trend(marketplace, keyword, timeGranularity=W|M)` — ABA 排名/搜索量趋势。
4. `ss_keyword_research_trends(marketplace, keyword)` — 关键词趋势佐证。
5. `asin_sales_trend(marketplace, asin)` — 竞品月度销量验证季节性。

**输出**：季节曲线要点 + 备货/上架时点建议 + 趋势结论（上升/平稳/衰退）。

---

## P10. 新品/爆款验证

**触发**：最近有什么爆款 / 谁在做得好但门槛低。

**步骤**
1. `aba_research_weekly(marketplace, ..., searchModel=4 快速飙升/5 潜力, order=searchRankGrowthRate desc)` — 找近期上升词。
2. `product_research(marketplace, month, keyword=该词, availableMonth=6, order=total_units desc)` — 筛近 6 个月上架商品。
3. `asin_detail` + `asin_sales_trend`/`asin_prediction` — 验证单品销量与上架时间。
4. `traffic_keyword(..., conversionKeywordTypes=[EXCELLENT])` + `ss_keyword_order` — 看它靠哪些词起量，复制打法。
5. 门槛评估：`asin_detail.ratings/rating`、`keyword_conversion.exactPpc`、`keyword_miner.spr`。

**输出**：爆款案例表（ASIN、上架时间、当前销量、起量词、门槛）+ 可复制要点。

---

## P11. 流量来源诊断

**触发**：这个 ASIN 流量从哪来 / 自然流量占比多少。

**步骤**
1. `ss_traffic_source(request{marketplace, q=ASIN 或关键词, month})` — 流量来源概览。
2. `traffic_keyword_stat(marketplace, asin)` → `traffic_keyword` — 拆自然词/广告词/AC 词/ER 词占比与主力词。
3. `traffic_listing_stat` → `traffic_listing` — 关联流量（免费/付费）结构。
4. `ss_keyword_order(marketplace, asins=[asin], reverseType=M)` — 出单词反查。

**输出**：自然/广告/关联流量占比 + 流量来源结构 + 优化方向（收词/投放/关联）。

---

## P12. 品牌与商标合规前置

**触发**：这个名字能注册吗 / 会不会侵权 / 帮我查商标。

**步骤**
1. `ss_trademark_country_list` — 取知识产权局（office）代码。
2. `ss_trademark_list(request{text=品牌名, office=[...], status=[...], niceClass=[...]})` — 查同名/近似商标。
3. `ss_trademark_stats(request{office=[...], text=品牌名})` — 按国家统计数量与状态分布。
4. `ss_trademark_detail(office, brandId)` — 看具体商标详情（权利人/类别/状态/有效期）。

**判读**：目标类别（尼斯分类）存在有效/在审同名商标→高风险，需改名或规避；仅在无关类别注册→可推进但建议逐步确权。

**输出**：商标查重结论（风险等级）+ 建议品牌名/类别 + 后续确权动作。

---

## 输出与协作规范
- **结论先行**：先给判断（做/不做、加投/降价），再给数据。
- **表格化**：多对象对比一律用表；保留英文指标口径（如 `supplyDemandRatio`）。
- **标注口径**：站点、月份、变体口径（`variation`）、排序字段、数据来源工具名。
- **可执行**：每条结论配一个下一步动作。
- **区分事实与推断**：工具返回值=事实；经验阈值=推断，需显式标注。
