# 运营场景作业流（Playbooks P1~P27）

> 每个 Playbook = 触发 → 调用序列（**同一行 `‖` 连接的调用并行发起**）→ 判读 → 输出。
> 前置：按 SKILL.md §2 完成最小确认；参数细节查 tools-reference；阈值与公式**只引用** thresholds.md（下文记作 `T§x`）。
> 通用：带 returnFields 预设（tools-reference §F）；不编造字段；非英语站先翻译关键词；输出带口径行与置信度。

---

## P1. 蓝海选品（从 0 找机会）

**触发**：帮我找 XX 站的蓝海 / 什么品值得做。

1. 定范围：用户给了大类 → `product_node(keyword=类目名)` 拿父 `nodeIdPath`；没给 → `market_research()` 不传 nodeIdPath 看全部大类，挑 2~3 个。
2. **一次筛子类目**：`market_research(nodeIdPath=父, minAvgUnits, maxGoodsCrn=50, maxBrandCrn=50, maxAmazonSelfProportion=25, minNewProportion=5, minAvgProfit=20, order={field:"avg_units",desc:true}, returnFields=MARKET_SCAN)` → 候选子类目 5~10 个。（`T§2.2`；非 US 站按 `T§1` 缩放销量）
3. 需求验证（并行）：
   `aba_research_monthly(departments=[first_category 匹配值], searchModel=3)` ‖ `aba_research_weekly(departments=…, searchModel=4)` ‖ `keyword_research(keywords=候选核心词, returnFields=KW_MARKET)`
4. 落到商品：`product_research(nodeIdPaths=[候选], availableMonth=12, minUnits, maxRatings=300, order={field:"total_units",desc:true}, returnFields=ASIN_CORE)` → 看"新品能否卖起来"。
5. 结构快筛（Top 2 候选）：`ss_market_research_statistics` ‖ `ss_market_product_concentration` ‖ `ss_market_price_distribution`。
6. 趋势：`google_trend(keyword=核心词, monthly=true)`（长尾无数据则跳过并降置信度）。
7. 商标/利润预检（入围后）：P12 快查品牌词冲突；P21 用售价带 + `fba` 估 GM。

**判读**：按 `T§4.1` 机会评分卡打分；否决项优先。
**输出**：候选赛道评分表（6 维 + 总分 + 置信度）→ Top 1~3 的切入价格带、核心词、代表 ASIN、建议上架时点。

---

## P2. 市场结构体检

**触发**：这个类目竞争激烈吗 / 定价带怎么定。

`product_node` 拿 `nodeIdPath` 后按档位：
- **快筛**：`ss_market_research_statistics` ‖ `ss_market_product_concentration` ‖ `ss_market_price_distribution`
- **标准**（+3）：`ss_market_ratings_count_distribution` ‖ `ss_market_listing_date_distribution` ‖ `ss_market_seller_country_distribution`
- **深度**（+7）：`ss_market_brand_concentration` ‖ `ss_market_seller_concentration` ‖ `ss_market_seller_type_concentration` ‖ `ss_market_rating_distribution` ‖ `ss_market_listing_trend_distribution` ‖ `ss_market_ebc_distribution` ‖ `ss_market_product_demand_trend`

用户要看自己的位置时，在 `ss_market_product_concentration` 传 `asins=[自己]`。

**判读**：`T§2.3`；品牌/卖家集中度一定和"同级类目均值"比较。
**输出**：竞争结构报告（集中度、价格带、评价门槛、新品接受度、内容配置、卖家画像）+ 进入建议 + 标注档位。

---

## P3. 竞品拆解

**触发**：分析这个 ASIN / 拆解这几个竞品。

1. 定竞品：`asin_competitor(asin, size=20)` 或用户给定列表。
2. 并行一轮拿全：
   `competitor_lookup(asins=[自己+竞品≤40], returnFields=ASIN_CORE)` ‖ `traffic_extend(asinList=[≤20], returnFields=…)` ‖ `traffic_listing_stat(asinList=[…])` ‖ `ss_keyword_order(asins=[≤20], reverseType=M, year, month, conversionType="E,S")`
3. 逐个深挖 Top 3 竞品（并行）：`asin_sales_trend`（含详情，无需再调 asin_detail）‖ `ss_keepa_info(dailyLatest=true, 近 12 个月)`。
4. 需要文案对比时才调 `asin_detail`（拿 `title/features/overviews/variationList`）。

**判读**：
- 流量结构 `T§2.5`：竞品 `naturalRatio` 高 → 自然词壁垒强，避免正面硬投；广告词多 → 可用 Listing/自然词抢位。
- `traffic_extend` 中多个竞品都有排名、你没有的词 = 必补词。
- 付费关联（SP/BCA）多 = 对手在抢详情页流量，可反向投放其 ASIN。
- `ss_keepa_info` 价格与 BSR 联动 → 识别降价拉排名、Coupon 节奏。

**输出**：竞品对比表（价格、销量、BSR、评价及增速、毛利率、LQS、自然/广告结构、价格历史）+ 共同争夺词 + 3 个差异化切入点。

---

## P4. 关键词调研与 Listing 优化

**触发**：做词库 / 写标题五点 / 埋词。

1. 种子词：用户给 + `traffic_keyword(asin=头部竞品, order={field:"trafficPercentage",desc:true}, size=50)` 提取主力词。非英语站先翻译。
2. 扩词：`keyword_miner(keywordList=[种子≤200], minRelevancy=60, returnFields=KW_MINER, order={field:"searches",desc:true})`。
3. 市场与趋势（并行）：`keyword_research(keywords=核心词, returnFields=KW_MARKET)` ‖ `ss_keyword_research_trends(keyword=Top 词)` ‖ `keyword_research(keywords=核心词, marketPeriod="S10,S11,S12")`（筛季节词）。
4. 收录差距：`traffic_extend(asinList=[自己+竞品])` → 竞品有排名、自己无排名的词。

**分层**：
- 标题：搜索量 Top + 购买率绿灯 + 与产品强相关（2~3 个）
- 五点/A+：次核心词与卖点词、场景词
- Search Terms：长尾（`wordCount` ≥ 3）、同义词、当地语言变体、不放品牌词
- 季节词：旺季前 4~6 周上线

**输出**：分层词表（位置/搜索量/购买率/SPR）+ 竞品已收录我缺失的词 + 标题与五点改写示例。

---

## P5. 广告投放优化

**触发**：投哪些词 / 出价多少。

1. 先算钱：P21 得到 GM、目标 ACOS、**最高可承受 CPC**（`T§3.2`）。
2. 候选词市场基准：`keyword_conversion(keyword=核心词, timeType=90D, keywordBidMatchType=exact, customAvgProductPrice=售价, returnFields=KW_ADS)`。
3. 自身词表现（并行）：
   `traffic_keyword(asin=自己, conversionKeywordTypes=["EXCELLENT"])` ‖ `traffic_keyword(asin=自己, conversionKeywordTypes=["LOST","INVALID"])` ‖ `traffic_keyword(asin=自己, badges=["ADS"], order={field:"latest1daysAds",desc:true})`
4. 拓词：`traffic_extend(asinList=[自己+竞品], maxSPR=10)` ‖ `keyword_miner(keywordList=[现有词], maxSPR=15)` → 用最高 CPC 过滤。

**判读**（`T§3.2`）：
- `exactPpc.value` ≤ 0.7×最高CPC → 加投；0.7~1.0 → 精准小预算；> 1.0 → 只投长尾或放弃。
- EXCELLENT → 加预算/提价；LOST → 先查价格/评价/主图，再降价；INVALID → 否定。
- 自然排名已稳定首页的词 → 降低广告出价，节省预算。
- 有用户广告报表时：逐词比较"自身 CVR vs 市场 clickConvRate""实际 CPC vs 最高 CPC"。

**输出**：投放词分层（加投/维持/降价/否定）+ 每个词的建议出价区间（不超过最高 CPC）+ 否定词清单 + 预算建议。

---

## P6. 评论与口碑洞察

1. 并行：`ss_review(asin, starList=[1,2,3], size=100)` ‖ `ss_review(asin, starList=[4,5], size=50)` ‖ `ss_review(asin, typeList=[1,2], size=30)`。
2. 时间对比（改版/批次问题）：`ss_review(asin, starList=[1,2,3], startTimestamp=近90天)` vs 更早时间窗。
3. 多竞品：对 Top 3 竞品重复步骤 1，合并归纳。
4. 星级趋势：`ss_keepa_info` 的评分/评论数序列。

**判读**：按主题聚类（质量/尺寸/功能/包装/物流/描述不符），按频次排序；物流包装类 = 快速修复；功能质量类 = 产品迭代；Vine 差评集中 = 量产前必须解决。
**输出**：痛点 Top 10（频次 + 代表原话）+ 好评卖点 Top 5 + Listing 改写建议 + 产品改良清单。

---

## P7. 价格与促销监控

1. 并行：`ss_asin_detail_with_coupon_trend(asin)` ‖ `ss_keepa_info(asin, dailyLatest=true, 近 6~12 个月)` ‖ `asin_prediction(asin)`。
2. 多竞品：每个 ASIN 重复步骤 1（`ss_asin_detail_with_coupon_trend` 已含 Coupon 趋势，不再调 `ss_asin_coupon_trend`）。

**判读**：降价/Coupon 当日起 `dailyItemList.sales` 明显上升 = 价格弹性高；长期低价 + BSR 稳 = 成本壁垒；低价 + BSR 波动 = 价格战消耗；大促前 2 周降价 ≥ 15% = 对手备战信号。
**输出**：价格/促销节奏表（日期、原价、成交价、Coupon、BSR 变化）+ 历史最低价 + 自身定价与促销时点建议。

---

## P8. 类目进入决策

1. `product_node` → `nodeIdPath`。
2. 并行：`market_research(nodeIdPath=父节点, returnFields=MARKET_SCAN)`（定位目标子类目那一行）‖ P2 标准档 ‖ `product_research(nodeIdPaths=[目标], order={field:"total_units",desc:true}, size=20, returnFields=ASIN_CORE)`。
3. 门槛与收益：头部 `bsrId` → `bsr_prediction(categoryId, bsr=目标排名)`；核心词 `keyword_conversion` → P21 算 GM 与最高 CPC。

**判读**：`T§4.1` 评分卡 + 否决项。
**输出**：做/不做 + 评分卡 + 进入门槛（评价数、SPR、冲首页成本、启动资金粗估）+ 目标 BSR 与对应销量。

---

## P9. 趋势与时点

1. 并行：`google_trend(keyword, monthly=true, intervalYear=5)` ‖ `ss_aba_research_trend(keyword, timeGranularity=M)` ‖ `ss_keyword_research_trends(keyword)`。
2. 验证：`asin_sales_trend(asin=头部竞品)`（2~3 个并行）。
3. 短期：`aba_research_weekly(includeKeywords=词, searchModel=4)`。

**判读**：`T§2.6`；峰谷比 > 2.5 为强季节性，备货时点按 `T§3.4`。
**输出**：季节曲线要点（峰值月、淡季月、峰谷比）+ 长期方向 + 上架/备货/广告加码时间表。

---

## P10. 新品 / 爆款验证

1. 飙升词：`aba_research_weekly(departments, searchModel=4, minRankGrowthRate=50)`。
2. 快速起量新品：`product_research(keyword=飙升词, availableMonth=6, minUnits=300, maxRatings=100, order={field:"total_units_growth",desc:true}, returnFields=ASIN_CORE)`。
3. 拆打法（并行）：`asin_prediction(Top 3)` ‖ `ss_keyword_order(asins=[Top 3], reverseType=W, year, month, week, conversionType="E")` ‖ `traffic_listing_stat(asinList=[Top 3])`。
4. 门槛：`keyword_conversion(核心词)` + SPR。

**判读**：上架 < 3 个月 + 月销 > 300 + 评价 < 100 = 爆款早期；`ratingsCv`/月销 > 8% 提示可能靠测评（`T§2.4`），复制难度高。
**输出**：爆款案例表（ASIN、上架天数、月销、评价及增速、起量词、门槛）+ 跟品 vs 差异化开发建议。

---

## P11. 流量来源诊断

1. 并行：`ss_traffic_source(request{marketplace, q=ASIN})` ‖ `traffic_keyword_stat(asin)` ‖ `traffic_listing_stat(asinList=[asin])`。
2. 明细：`traffic_keyword(asin, order={field:"trafficPercentage",desc:true}, returnFields=TRAFFIC_KW)` ‖ `traffic_listing(asinList=[asin], relations=[数量最多的类型])`。
3. 某个词的流量去向：`ss_traffic_source(request{marketplace, q=关键词})`。

**判读**：`T§2.5`。
**输出**：自然/推荐/广告/关联四类流量占比 + 主力词清单 + 优化方向（收词/投放/关联/防守）。

---

## P12. 商标合规

1. 确定 office（SKILL §2）；不确定时 `ss_trademark_country_list`。
2. 并行：`ss_trademark_list(request{text=品牌名, office=[…], niceClass=[产品类别], status=["Registered","Pending"]})` ‖ `ss_trademark_stats(request{office=[…], text=品牌名})`。
3. 命中项：`ss_trademark_detail(office, brandId)`。

**尼斯分类参考**：3 化妆品/清洁 · 5 保健 · 8 手工具 · 9 电子 · 11 灯具/家电 · 18 箱包 · 20 家具 · 21 厨具/家居用品 · 24 纺织 · 25 服装鞋帽 · 28 玩具/运动 · 31 宠物食品 · 35 零售服务。
**判读**：同类别 Registered/Pending 同名或近似 → 高风险（否决项）；仅其他类别 → 中风险，尽快在目标类别申请；多国注册 → 换名。
**输出**：风险等级 + 冲突明细 + 建议动作。附声明：不覆盖专利与类目审核。

---

## P13. 跨站市场选择

**前置**：确认候选站点。非英语站先把核心词翻成当地语言（同时保留英文词对照）。
1. **每个站分别** `product_node(keyword=类目当地语言名或英文名)` 拿各自 `nodeIdPath`（不要推算）。
2. 每站并行：`market_research(nodeIdPath=该站路径, returnFields=MARKET_SCAN)` ‖ `keyword_research(keywords=当地语言核心词)` ‖ `ss_market_seller_country_distribution(request{…})` ‖ `ss_market_price_distribution(request{…})`。
3. 趋势：`google_trend(marketplace=各站, keyword=当地语言词)`。
4. AE/BR/AU/SA 没有 `market_research`/`product_node` → 只做关键词与 Keepa 层面的对比，并说明。

**判读**：体量按 `T§1.2` 校正后比较；价格换算成本币占比；中国卖家占比、集中度、退货率按 `T§2.2/2.3`；语言合规成本（翻译、本地认证、VAT/EPR）计入风险维。
**输出**：站点对比表 + 各站评分卡 + 推荐进入顺序。

---

## P14. 新品 Launch

**上架前**
1. 词库：P4。
2. 门槛与预算：`keyword_conversion(核心词, customAvgProductPrice=售价)` → 按 `T§3.2` 算最高 CPC 与冲首页成本（SPR × CPA）；`competitor_lookup(asins=[标杆])` 看评价数与 LQS。
3. 时点：P9，避开旺季尾声上架。

**上架后 1~8 周（每周）**
4. 并行：`asin_prediction(asin=自己)` ‖ `traffic_keyword_stat(asin=自己)` ‖ `ss_keyword_order(asins=[自己], reverseType=W, year, month, week)`。
5. `traffic_keyword(asin=自己, conversionKeywordTypes=["EXCELLENT"])` → 集中预算。

**节奏**：第 1~2 周 SPR < 10 的精准词 5~10 个 + Vine；第 3~4 周扩 EXCELLENT 词 + 自动广告收词；第 5~8 周自然排名稳定的词降价，转投新词。
**输出**：分层词库 + 广告计划（词、出价 ≤ 最高 CPC、日预算）+ 周里程碑（收录词数、BSR、评价数）。

---

## P15. 捆绑 / 变体 / 组合

1. 并行：`traffic_listing_stat(asinList=[核心])` ‖ `traffic_listing(asinList=[核心], relations=["FBT","BAB"])`。
2. 市场验证：`keyword_research(keywords="套装词, 单品词")` ‖ `product_research(keyword=套装词, returnFields=ASIN_CORE)`。
3. 竞品套装：`competitor_lookup(asins=[套装竞品])` + 需要变体结构时 `asin_detail`（`variationList`）；`ss_review(starList=[1,2,3])`。

**判读**：套装词搜索量 ≥ 单品词 20% = 有独立需求；套装售价 ≥ 单品之和 × 1.1 且 GM 不降 = 合理；FBT 互补品 = 首选组合。
**输出**：推荐组合 + 定价与 GM 测算 + 套装词库 + 变体规划。

---

## P16. ACOS 诊断（深化 P5）

1. **基线**：P21 算盈亏平衡 ACOS；有用户报表则以实际 ACOS/TACOS 为准，否则用 `keyword_conversion(customAvgProductPrice=售价).exactAcos` 作市场基准。
2. **词层**：`traffic_keyword(asin=自己, conversionKeywordTypes=["EXCELLENT","STABLE","LOST","INVALID"], size=100)` → 统计各类型流量占比。
3. **竞争层**：`competitor_lookup(keyword=主词, size=20, returnFields=ASIN_CORE)` ‖ `traffic_extend(asinList=[自己+头部 2~3])`。
4. **Listing 层**：自己 vs 头部的 `lqs/rating/ratings/badge`（步骤 3 已有）+ `ss_market_ebc_distribution`。
5. **价格层**：`ss_asin_detail_with_coupon_trend(asin=自己)` ‖ `ss_market_price_distribution`。

| 根因 | 信号 | 对策 |
|------|------|------|
| 投错词 | LOST+INVALID 流量 > 40% | 否定 INVALID，LOST 降价 |
| 出价过高 | 实际/市场 CPC > 最高 CPC | 按公式降价，转精准 |
| 转化弱 | 自身 CVR < 市场 clickConvRate；星级/LQS 低于竞品 | 主图/五点/A+/评价优先 |
| 价格劣势 | 定价位于主销价格带之上且无 Coupon | 调价或加 Coupon |
| 匹配浪费 | broadAcos ≫ exactAcos | 收紧广泛匹配 |
| 结构性 | GM 过低，盈亏 ACOS < 市场 ACOS | 降成本或换赛道 |

**输出**：四层诊断 + 根因排序 + 动作清单 + 预期 ACOS 区间。

---

## P17. 库存规划与 BSR 目标

1. 并行：`asin_detail(asin=标杆)`（取 `bsrId`）‖ `asin_sales_trend(asin=自己或竞品)` ‖ `asin_prediction(asin=自己)`。
2. `bsr_prediction(categoryId=bsrId, bsr=目标排名)` → 目标日销。
3. 季节：`google_trend(monthly=true)`（竞品历史不足时）。

**计算**：`T§3.3` + `T§3.4`。Q4 入仓限制与仓储费上涨需提前 2 周以上。
**输出**：月度备货表（需求、补货点、安全库存、发货日期）+ 目标 BSR 对应销量 + 断货风险提示。

---

## P18. 卖家 / 店铺画像

1. 盘点：`competitor_lookup(sellerName=卖家名, size=100, order={field:"total_units",desc:true}, returnFields=SELLER_SCAN)`；多个卖家或需叠加条件时用 `product_research(includeSellers="A,B", …)`（`includeSellers` 取值为卖家名还是卖家 ID，以首次返回结果验证）。
2. 按 `nodeIdPath` 聚合：ASIN 数、类目数、销量集中度、平均评价数、上架时间分布。
3. Top 5 ASIN：`asin_sales_trend`（并行，含详情）+ `traffic_extend(asinList=[Top 5])`。
4. 价格策略：`ss_keepa_info(Top 1~2)`。

**判读**：铺货型（ASIN > 100、多类目、评价普遍 < 50）→ 用品质/品牌突破；精品型（< 30 个、1~2 类目、评价 > 500、LQS 高）→ 正面竞争需充足预算；近 6 个月上新密集 = 扩张期。
**输出**：卖家画像 + Top ASIN 表 + 主力词 + 威胁评估 + 应对策略。（跟卖监控见 P23）

---

## P19. Listing 质量体检

1. 并行：`competitor_lookup(asins=[自己+头部竞品≤40], returnFields=ASIN_CORE)` ‖ `asin_detail(asin=自己)`（文案、`subcategories`）‖ `traffic_keyword_stat(asin=自己)` ‖ `ss_market_ebc_distribution(request{marketplace, nodeIdPath})`。
2. 词命中：`traffic_keyword(asin=自己, conversionKeywordTypes=["EXCELLENT"])` ‖ `traffic_extend(asinList=[自己+竞品])`（缺失词）。
3. 口碑：`ss_review(asin=自己, starList=[1,2,3], size=50)` ‖ `ss_review(asin=自己, starList=[4,5], size=30)`。

| 维度 | 指标 | 基准 |
|------|------|------|
| 质量分 | `lqs` | ≥ 竞品均值（`T§2.4`） |
| 评价 | `ratings`、`rating`、`ratingsCv` | `T§2.4` |
| 徽章 | BS/AC | 至少一个 |
| 内容 | A+/视频 | 按 `ebc_distribution` 判断回报 |
| 词覆盖 | EXCELLENT 词数、缺失词数 | `T§2.5` |
| 文案 | 标题是否含 Top 3 核心词；五点是否回应差评 Top 3 痛点 | — |

**输出**：体检表（6 维红黄绿）+ 按收益排序的优化清单 + 标题/五点改写示例。

---

## P20. 周期监控看板

> 工具本身不能定时执行；输出可直接给自动化任务使用的"调用清单 + 告警规则"，并建议用户保存每期结果用于环比。

| 频率 | 调用 | 告警（`T§2.7`） |
|------|------|------|
| 每日 | `asin_prediction(自己+核心竞品)` | BSR ±30% |
| 每日/隔日 | `ss_keepa_info(自己, dailyLatest=true, 近7天)` | Buy Box 卖家变化、卖家数 ≥ 2、价格异常 |
| 每周 | `traffic_keyword_stat(自己)` ‖ `ss_keyword_order(asins=[自己+竞品], reverseType=W)` ‖ `aba_research_weekly(departments, searchModel=4)` ‖ `competitor_lookup(asins=[竞品], returnFields=ASIN_LITE)` | 流量词 −15%；竞品新起量词；新飙升词；竞品降价 ≥ 15% |
| 每月 | `traffic_keyword(自己, month=上月)` vs 本月（P25）‖ `asin_sales_trend(自己)` ‖ `product_research(nodeIdPaths=[类目], availableMonth=3, order={field:"total_units",desc:true}, size=20)` ‖ `ss_market_product_concentration` ‖ `keyword_conversion(核心词, timeType=90D)` ‖ `ss_review(自己, startTimestamp=近30天)` | 核心词掉出首页；新品威胁；集中度变化；星级下降 |

**输出**：日/周/月三层看板 + 本期告警 + 行动清单。

---

## P21. 利润与单位经济测算（新）

**触发**：能赚多少 / 怎么定价 / 最高能出多少广告费。

1. 收集：售价（或目标价）、采购价、头程；缺失时一次性询问，否则按 `T§3.1` 假设并标注。
2. 平台数据（并行）：`competitor_lookup(asins=[自己或标杆], returnFields=["asin","price","fba","profit","rating","ratings"])` ‖ `ss_keepa_info(asin)`（核对 FBA 费与尺寸档）‖ `market_research(nodeIdPath=父节点)` 取 `returnRatio`。
3. 广告：`keyword_conversion(核心词 3~5 个, customAvgProductPrice=售价, returnFields=KW_ADS)`。
4. 计算：`T§3.1` + `T§3.2`；可做 2~3 个售价方案的敏感性对比。

**输出**：
| 售价 | 到岸成本 | 平台费 | 退货损耗 | GM | 盈亏 ACOS | 最高 CPC | 市场 CPC | 结论 |
|------|---------|-------|---------|----|----------|---------|---------|------|
+ 定价建议 + 可投词清单（市场 CPC ≤ 最高 CPC）+ 降本方向（如换小号标准尺寸，用 `product_research(dimensionType="SS")` 看同类竞品是否可行）。

---

## P22. 一键 ASIN 体检（新）

**触发**：我的 ASIN 怎么了 / 销量掉了 / 帮我全面看看。

一轮并行：
`asin_sales_trend(asin)` ‖ `asin_prediction(asin)` ‖ `ss_keepa_info(asin, dailyLatest=true, 近90天)` ‖ `traffic_keyword_stat(asin)` ‖ `traffic_keyword(asin, order={field:"trafficPercentage",desc:true}, size=50, returnFields=TRAFFIC_KW)` ‖ `ss_review(asin, starList=[1,2,3], startTimestamp=近60天)` ‖ `asin_competitor(asin, size=20, returnFields=ASIN_LITE)`

按需第二轮：上月 `traffic_keyword(asin, month=上月)` 对比排名；`ss_market_price_distribution`。

**归因顺序**：断货/Buy Box 丢失（Keepa 卖家与价格）→ 价格变化/竞品降价 → 星级下滑/差评集中 → 核心词排名下滑/流量词减少 → 季节性（同比）→ 新竞品挤压。
**输出**：`T§4.2` 健康评分 + 销量变化归因（证据链）+ 3 个优先动作。

---

## P23. 跟卖与 Buy Box 监控（新，替代旧版 P18 跟卖逻辑）

**触发**：被跟卖了吗 / 购物车丢了 / 有人低价抢购物车。

1. 并行：`asin_detail(asin)`（`sellers`、`sellerName`、`fulfillment`）‖ `ss_keepa_info(asin, dailyLatest=true, 近30~90天)`（卖家数序列、Buy Box 卖家 ID 历史、Buy Box 价格）。
2. 批量自查：`competitor_lookup(asins=[自家全部≤40], returnFields=["asin","sellers","sellerName","price"])` → `sellers ≥ 2` 的 ASIN 进入步骤 1。

**判读**：`sellers` ≥ 2 或 Buy Box 卖家 ID 出现非本店 → 跟卖；Buy Box 价格低于自身售价 → 低价跟卖；卖家数短时剧增 → 可能被批量跟卖或 Listing 被改。
**动作建议**：核实品牌备案与商标（P12）、试购取证、投诉侵权，必要时调整包装与差异化。
**输出**：跟卖 ASIN 清单（卖家数、开始时间、Buy Box 占用情况、价格）+ 处置步骤。

---

## P24. 抢 Best Seller 标与类目节点优化（新）

**触发**：怎么拿 BS 标 / 放哪个类目更好。

1. `asin_detail(asin=自己)` → `subcategories`（当前小类及排名）、`nodeIdPath`。
2. 候选节点：`product_node(nodeIdPath=父节点)` 列出兄弟节点；`market_research(nodeIdPath=父节点, returnFields=MARKET_SCAN)` 对比各节点的 `topAvgUnits`、`goodsCrn`。
3. 每个候选节点的第 1 名门槛（并行）：`competitor_lookup(nodeIdPath=候选, size=20, order={field:"total_units",desc:true}, returnFields=ASIN_LITE)`。
4. 自身日销：`asin_prediction(asin=自己)`。

**判读**：候选节点第 1 名日销 ≤ 自身日销 × 1.2 且节点与产品真实相关 → 可争取；节点集中度低于同级 → 更易稳定。须遵守亚马逊类目政策，不可放入不相关类目。
**输出**：候选节点表（节点、第 1 名日销、差距、相关性）+ 推荐节点 + 拿标所需日销与广告计划。

---

## P25. 关键词排名追踪（新）

**触发**：核心词排名涨了还是跌了 / 每月排名报告。

1. 并行：`traffic_keyword(asin=自己, month=本月或不传, size=100, returnFields=TRAFFIC_KW)` ‖ `traffic_keyword(asin=自己, month=上月, size=100, returnFields=TRAFFIC_KW)`。
2. 指定词：传 `keyword=该词` 过滤。
3. 竞品同词对比：`traffic_extend(asinList=[自己+竞品])` 的 `relationVariationsItems`。

**判读**：按 `rankPosition`（自然）与 `adPosition`（广告）分别计算变化；新进入的词、掉出前 3 页的词单独列出；自然排名上升且广告位稳定 → 可降广告出价。
**输出**：排名变动表（词、搜索量、上月→本月自然/广告位、变化）+ 掉词与新词 + 动作。

---

## P26. 大促备战与复盘（新）

**触发**：Prime Day / 黑五 / 网一怎么备 / 大促效果如何。

**备战（大促前 6~8 周）**
1. 去年同期：`asin_sales_trend(自己+竞品)` 取大促月销量倍数；`google_trend(intervalYear=1)` 看峰值周。
2. 竞品去年打法：`ss_keepa_info(竞品, 大促前后 30 天时间窗)` → 降价幅度与时点；`ss_asin_detail_with_coupon_trend(竞品)`。
3. 备货：`T§3.4`，季节系数取大促月实际倍数。

**复盘（大促后 1 周）**
4. 并行：`asin_prediction(自己+竞品)`（日销、日 BSR、日价格）‖ `ss_keepa_info(自己+竞品, 大促前后)` ‖ `ss_keyword_order(asins=[自己+竞品], reverseType=W, 大促周)`。

**判读**：大促期销量倍数、价格弹性（销量涨幅 / 降价幅度）、大促后 BSR 回落速度（看自然流量是否沉淀）、对手降价深度。
**输出**：备战清单（备货量、发货日、促销价、广告预算）或复盘报告（倍数、弹性、ROI 估算、明年调整）。

---

## P27. 新品雷达与评论增速异常（新）

**触发**：最近冒出了哪些新品 / 谁在快速起量 / 谁可能在刷评。

1. 新品雷达：`product_research(nodeIdPaths=[类目], availableMonth=3, minUnits=类目 avgUnits, order={field:"total_units",desc:true}, size=60, returnFields=ASIN_CORE)` ‖ `product_research(nodeIdPaths=[类目], badgeNR="Y", size=20)`。
2. 评论增速：`product_research(nodeIdPaths=[类目], minRatingsCv=50, availableMonth=6, order={field:"total_units",desc:true})`。
3. 验证可疑 ASIN：`ss_keepa_info`（评论数曲线是否陡增）‖ `ss_review(asin, typeList=[3])`（VP 占比）‖ `ss_review(asin, startTimestamp=近30天)`（内容同质化）。

**判读**：`ratingsCv`/月销 > 8%，或评论数单周陡增且多为短评 → 疑似非自然；新品月销 > 类目均值且评价 < 50 → 真实强势新品，重点研究其关键词（P10 步骤 3）。
**输出**：新品威胁清单 + 异常评论增速清单（证据，不下违规定论）+ 应对建议。
