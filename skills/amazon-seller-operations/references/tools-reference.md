# SellerDex MCP 工具参数速查（46 个）

> 通过 `tools/call` 调用，服务端鉴权，**不要传 API Key**。响应统一为 `{code, message, data}`。
> **两种调用形态**：常规工具参数平铺；`ss_market_*` / `ss_trademark_list` / `ss_trademark_stats` / `ss_traffic_source` 等把业务参数放进 **`request` 对象**。
> `returnFields` 类型不一致：常规工具为**数组** `["asin","price"]`，`ss_*` request 型为**逗号字符串** `"asin,price"`。

## 公共约定
| 参数 | 约定 |
|------|------|
| `marketplace` | 各工具支持站点不同（见每组标注）；越界报 JSON-RPC `-32602` |
| `month`/`date`/`historyDate` | `yyyyMM`，如 `202507`；不填=最近月份/最近30天 |
| `size` | 各工具取值不同（20/60/100 或 20/50/100 或自由整数） |
| `variation` | `N`=含变体（默认）、`Y`=不含变体 |
| `order` | `{field, desc}`；`desc` 默认 true |

站点档位：**10 站**=US/JP/UK/DE/FR/IT/ES/CA/IN/MX；**9 站**=去掉 MX；**12 站**=10+BR/AU；**13 站**=10+BR/AU/AE；**14 站**=10+BR/AU/SA/AE。

---

# A. 选品与市场发现（9）

### first_category — 站点一级类目（14 站）
- 参数：`marketplace`、`returnFields`（数组）
- 返回：`marketplace`、`total`、`items[{category_name, category_name_cn, category_value}]`
- 用途：需要类目值时**先调本工具**，匹配 `category_value` 供 `aba_research_*` 的 `departments` 使用。

### product_node — 类目节点树（10 站）
- 参数：`marketplace`、`nodeIdPath`、`keyword`、`returnFields`（数组）
- 模式：① `nodeIdPath` 浏览子类目；② `keyword`（类目名或 nodeId）搜索节点；都不传→顶级类目列表。
- 返回（数组）：`nodeIdPath/nodeLabelPath/nodeLabelLocale/nodeLabelPathLocale/products`
- 用途：拿 `nodeIdPath` 供 `product_research`/`competitor_lookup`/`market_research`/`bsr_prediction`/全部 `ss_market_*` 使用。

### market_research — 选市场 / 细分类目分析（10 站，size 20/50/100）
- 粒度：**一条记录=一个细分类目**。
- 参数：`marketplace`、`month`、`nodeIdPath`、`departmentKeyword`、`topNum`(默认10)、`newProduct`(1/3/6/12，默认3，月数)、`sellerLocation`（多个逗号分隔，如`US,CN`）、`page`/`size`/`order`
- 区间过滤（min/max 前缀）：`AvgUnits`、`AvgRevenue`、`AvgRatings`、`AvgRating`、`AvgBsr`、`AvgPrice`、`Weight`、`Volume`、`AvgProfit`、`TopAvgUnits`、`TopAvgRevenue`、`TopAvgBsr`、`GoodsCount`、`Brands`、`Sellers`、`AvgSellers`、`GoodsCrn`、`BrandCrn`、`SellerCrn`、`EbcProportion`、`FbaProportion`、`FbmProportion`、`AmazonSelfProportion`、`NewProportion`、`NewCount`、`NewAvgRatings`、`NewAvgPrice`、`NewAvgRating`、`NewAvgUnits`、`NewAvgRevenue`
- 返回：`nodeId/nodeIdPath/nodeLabelName/nodeLabelPath/ranking/topProducts/brands/sellers/totalUnits/totalRevenue/avgUnits/avgRevenue/avgPrice/avgRatings/avgRating/avgBsr/avgSellers/avgProfit/ebcProportion/amazonSelfProportion/fbaProportion/fbmProportion/sellerNation/returnRatio/avgReturnRatio/searchToPurchaseRatio/top3ProductSales/top5ProductSales/top10ProductSales/top20ProductSales`

### product_research — 多维度选品（10 站，size 20/60/100）
- 粒度：**ASIN 级商品**。
- 参数：`marketplace`、`month`、`keyword`、`matchType`(1=词组/2=模糊默认/3=精准)、`excludeKeywords`、`includeBrands`/`excludeBrands`（逗号分隔）、`includeSellers`/`excludeSellers`（逗号分隔）、`nodeIdPaths[]`、`filterSub`(Y=仅子类目)、`variation`、`fulfillment`(AMZ,FBA,FBM)、`sellerNation`(US,CN 等)、`dimensionType`(SS/LS/SB/LB/ELO/EL5O/EL7O/EL15O/O)、`weightUnit`(g/lb/oz/kg)、`badgeBS`/`badgeAC`/`badgeNR`（Y=只要有该徽章）、`availableMonth`（近N月上架）、`page`/`size`/`order`
- 区间过滤（min/max 前缀）：`Price`、`Rating`、`Ratings`、`RatingsCv`（月新增评分）、`Sellers`、`Profit`、`Bsr`、`BsrCv`、`BsrCr`、`Units`、`AmzUnit`（子体销量）、`Revenue`、`RevenueCr`、`UnitsCr`、`Weights`、`Variations`、`SubBsrRank`（子类排名，filterSub=Y时）、`Fba`、`Lqs`
- 返回：`items{asin/brand/title/nodeIdPath/nodeLabelPath/bsr/bsrCr/bsrCv/units/unitsGr/amzUnit/amzSales/revenue/price/profit/fba/ratings/ratingsRate/rating/ratingsCv/ratingDelta/lqs/availableDate/fulfillment/variations/sellers/sellerId/sellerName/sellerNation/badge{bestSeller,amazonChoice,newRelease,ebc,video}/weight/dimension/dimensionsType/pkgDimensions/pkgWeight/sku/subcategories}`

### keyword_research — 关键词选品（14 站，size 20/50/100）
- 参数（必填）：`marketplace`、`keywords`
- 参数（选填）：`excludeKeywords`、`month`、`supplement`(N=仅查输入词/Y=含系统扩展词，默认N)、`withYearlyGrowth`(bool，仅新细分市场)
- 区间过滤：`searches`/`growth`/`yearlyGrowth`/`yearlyGrowthRate`/`growthTrendMin`/`growthRateTrendMin`/`products`/`purchases`/`purchaseRate`/`avgPrice`/`avgReviews`/`avgRating`/`bid`/`monopolyClickRate`/`goodsValue`/`supplyDemandRatio`/`wordCount`
- **季节筛选**：`marketPeriod`（S1~S12，对应1~12月旺季，多个用逗号，如 `S11,S12` = 11/12月旺季）
- 返回：`keywords/searches/clicks/impressions/purchases/growth/purchaseRate/products/supplyDemandRatio/avgPrice/avgRatings/avgRating/bid/araClickRate/araShareRate/goodsValue/marketPeriod/keywordCn/brands/categories/relationAsinList/araAsinList`

### aba_research_weekly — ABA 数据（按周，14 站，size 20/50/100）
- 参数：`marketplace`；日期三件套：`year`+`month`(1-12)+`week`(1-5)（**三者同传**，系统自动换算为该月第`week`个周六日期，无需手算；缺省=最近一周）
- `departments[]`（来自 `first_category` 的 `category_value`，可多选）、`includeKeywords`/`excludeKeywords`、`exactFlag`
- `searchModel`：1=热门（默认）/2=异动/3=持续增长/4=快速飙升/5=潜力/6=长尾
- 区间：`searchRank`/`searches`/`monopolyClickRate`/`conversionRate`/`wordCount`/`SPR`/`titleDensity`/`clicks`/`impressions`/`rankGrowthRate`
- 排序默认 `searchfrequencyrank`
- 返回：`keyword/searchRank/searchRankCv/searchRankCr/searches/purchases/purchaseRate/clicks/impressions/searchRankGrowthValue/searchRankGrowthRate/w1SearchRank/w4SearchRank/w12SearchRank`（及各自 Growth）、`bid/cvsShareRate/clickShareRate/titleDensityExact/cprExact/top3Brands/top3AsinDtoList`

### aba_research_monthly — ABA 数据（按月，14 站，size 20/50/100）
- 参数：同 weekly，但日期用 `date`（`yyyyMM`，留空=最近30天）；其余参数与 weekly 完全一致，返回字段相同。

### bsr_prediction — BSR 销量预测（10 站）
- 参数（必填）：`marketplace`、`categoryId`（**一级类目数字ID**，来自 `asin_detail.bsrId` 或 `product_node` 节点根 id）、`bsr`（目标排名整数）
- 返回：`categoryLabel`、`estDailySales`、`estMonthSales`、`itemList[{bsr,estDailySales,estMonthSales}]`
- 用途：输入目标 BSR → 估算对应日/月销量，反算达到目标需要的销量基准。

### google_trend — 谷歌趋势（13 站）
- 参数（必填）：`marketplace`、`keyword`
- 参数（选填）：`googleProp`（web=网页搜索默认/shoppingCart=购物搜索）、`monthly`（false=按周默认）、`intervalYear`（1=近1年/5=近5年默认）
- 返回：`keyword/link/range{week,month,quarter,half,year,threeYear,all}/items[{time(ms),value(0~100)}]`

---

# B. 竞品与商品分析（9）

### competitor_lookup — 查竞品列表（10 站，size 20/60/100）
- 场景：**已知目标→查这批商品数据**。至少提供一个筛选条件（或仅指定市场查全量）。
- 参数：`marketplace`、`month`、`keyword`、`brand`、`sellerName`（支持按卖家名过滤，`product_research` 不支持）、`asins[]`（≤40，也接受单个字符串自动转数组）、`nodeIdPath`、`variation`、`page`/`size`/`order`
- 排序字段：`total_units/amz_unit/total_amount/bsr_rank/price/rating/ratings/profit/reviews_rate/available_date/各增长率/bsr_rank_cv/bsr_rank_cr`
- 返回字段与 `product_research` 相同。

### asin_competitor — 单 ASIN 直接竞品（10 站）
- 参数（必填）：`marketplace`、`asin`
- 参数（选填）：`size`（20/60/100，默认60）、`returnFields`（数组）
- 返回：`data`（竞品对象数组，字段同 product_research item）

### asin_detail — ASIN 详情（10 站）
- 参数（必填）：`marketplace`、`asin`（一次一个）
- 参数（选填）：`returnFields`（数组）
- 返回（对象，不分页）：`asin/asinUrl/brand/bsrId/bsrLabel/bsrRank/availableDate/createdTime/firstRatingDate/coupon/questions/rating/ratings/reviews/variantRatings/variantReviews/nodeId/nodeIdPath/nodeLabelPath/parent/price/primePrice/deliveryPrice/sellerId/sellerName/fulfillment/sellers/skuList/title/features/overviews/badge{...}/variationList/variations/weight/dimensions/lqs`
- 串联：`bsrId`→`bsr_prediction`；`nodeIdPath`→`product_node`/`product_research`/`competitor_lookup`/`ss_market_*`

### asin_prediction — ASIN 销量预测（日粒度，10 站）
- 参数（必填）：`marketplace`、`asin`
- 参数（选填）：`returnFields`（数组）
- 返回：`asinDetail{...}`、`dailyItemList[{date,bsr,sales,amount,price}]`、`monthItemList[{date,sales,amount,price}]`

### asin_sales_trend — ASIN 销量趋势（月粒度，10 站）
- 参数（必填）：`marketplace`、`asin`
- 参数（选填）：`returnFields`（数组）
- 返回：`asin{...完整详情...}`、`salesTrendPoints[{month,price,averagePrice,parentUnitSales,childUnitSales,parentSalesRevenue,childSalesRevenue}]`

### ss_asin_detail_with_coupon_trend — ASIN 详情 + 优惠趋势（13 站）
- 参数（必填）：`marketplace`、`asin`
- 参数（选填）：`returnFields`（**逗号字符串**）
- 一次性返回 ASIN 完整详情与优惠价格趋势，适合做促销监控时替代分开调用。

### ss_asin_coupon_trend — ASIN 优惠价格趋势（13 站）
- 参数（必填）：`marketplace`、`asin`
- 参数（选填）：`returnFields`（**逗号字符串**）
- 返回：原价、优惠类型（金额/百分比）、优惠额、计算后成交价时间序列。

### ss_review — 商品评论列表（13 站，size 自由整数）
- 参数（必填）：`marketplace`、`asin`
- 参数（选填）：`starList[]`（1~5 星，多选）、`typeList[]`（1=图片/2=视频/3=VP/4=Vine，多选）、`page`/`size`、`startTimestamp`/`endTimestamp`（毫秒）、`returnFields`（**逗号字符串**）
- 返回：评论标题/内容/评分/评论人/评论时间/是否 VP/Vine 等。

### ss_keepa_info — Keepa 历史数据（13 站）
- 参数（必填）：`marketplace`、`asin`
- 参数（选填）：`startTimestamp`/`endTimestamp`（毫秒）、`dailyLatest`（true=仅每天最新一条，压缩数据量）、`returnFields`（**逗号字符串**）
- 返回：价格/BSR 等历史时间序列。

---

# C. 关键词与流量（11）

### keyword_miner — 关键词扩词挖掘（13 站，size 20/50/100）
- 场景：**以种子词为起点，挖包含词根的衍生/长尾词**。
- 参数（必填）：`marketplace`、`keywordList[]`（≤200）
- 参数（选填）：`historyDate`、`filterRootWord`(0=全部默认/1=只含词根)、`matchType`(0=词组/1=广泛默认)、`keywordBidMatchType`(phrase/exact默认/broad)、`amazonChoice`(bool)、`includeKeywords[]`/`excludeKeywords[]`
- 区间过滤（注意字段名）：`minSearch`/`maxSearch`（搜索量，**注意是 Search 不是 Searches**）、`minPurchases`/`maxPurchases`、`minPurchasesRate`/`maxPurchasesRate`、`minSPR`/`maxSPR`、`minRelevancy`/`maxRelevancy`（0~100）、`minSearchRank`/`maxSearchRank`、`minProducts`/`maxProducts`、`minSupplyDemandRatio`/`maxSupplyDemandRatio`、`minAdProducts`/`maxAdProducts`、`minMonopolyClickRate`/`maxMonopolyClickRate`、`minBid`/`maxBid`、`minWordCount`/`maxWordCount`、`minPrice`/`maxPrice`、`minRatings`/`maxRatings`、`minRating`/`maxRating`
- 返回：`keyword/searches/purchases/purchaseRate/products/adProducts/supplyDemandRatio/monopolyClickRate/avgPrice/avgRatings/avgRating/bid/spr/titleDensity/wordCount/relevancy/amazonChoice/searchRank/clicks/impressions/cvsShareRate/departments`

### keyword_conversion — 关键字转化率与广告数据（9 站，size 20/50/100）
- 参数（必填）：`marketplace`、`keyword`
- 参数（选填）：`timeType`（WEEK=近7天默认/90D=近90天）、`keywordBidMatchType`(phrase/exact默认/broad)、`matchType`(0=词组/1=广泛默认)、`includeKeywords[]`/`excludeKeywords[]`、`customAvgProductPrice`（自定义均价，影响预算/ACOS计算）
- 区间过滤：`searches`/`clicks`/`purchases`/`searchConvRate`/`clickConvRate`/`ppc`/`cpa`/`productPrice`/`acos`/`clickingRate`（前三ASIN点击占比）/`conversionRate`（前三ASIN转化占比）/`phraseCount`/`budget`
- 返回：`keyword/searches/clicks/purchases/searchConvRate/clickConvRate/clickingRate/conversionRate/phrasePpc{value,min,max}/exactPpc/broadPpc/phraseCpa/exactCpa/broadCpa/avgProductPrice/phraseBudget/exactBudget/broadBudget/phraseAcos/exactAcos/broadAcos/top3Asins[]/top10Asins[]`

### traffic_keyword_stat — 流量词统计概览（13 站）
- 参数（必填）：`marketplace`、`asin`
- 参数（选填）：`month`（严格 yyyyMM 格式）、`returnFields`（数组）
- 返回：`keywords`(总流量词数)/`ranks`(排名词数)/`ads`(广告词数)/`calcTime`/`badgeCount{ns/ac/er/fs/hr/sb/sv/ad}`
- 用途：**先调本工具了解规模**，再决定是否翻页拉 `traffic_keyword`。

### traffic_keyword — ASIN 流量词反查（13 站，size 20/50/100）
- 参数（必填）：`marketplace`、`asin`
- 参数（选填）：`keyword`（关键词过滤）、`page`、`size`、`month`（yyyyMM）、`order`
- `badges[]` 枚举：`NATURAL_SEARCHING`/`AMAZON_CHOICE`/`EDITORIAL_RECOMMENDATIONS`/`FOUR_STAR`/`SPONSOR_BRAND`/`SPONSOR_VIDEO`/`HIGHLY_RATED`/`ADS`
- `trafficKeywordTypes[]`：`PRIMARY`（主要流量词）/`PRECISE`（精准流量词）/`PRECISE_LONG_TAIL`（长尾流量词）
- `conversionKeywordTypes[]`：`EXCELLENT`（优质）/`STABLE`（平稳）/`LOST`（流失）/`INVALID`（无效曝光）
- 返回：`items{keyword/searches/products/purchases/purchaseRate/bid/badges/rankPosition/adPosition/searchesRank/latest1daysAds/latest7daysAds/latest30daysAds/supplyDemandRatio/trafficPercentage/trafficKeywordType/conversionKeywordType/calculatedWeeklySearches/impressions/clicks/naturalRatio/adRatio}`

### traffic_extend — 拓展流量词（多 ASIN，13 站，size 20/50/100）
- 参数（必填）：`marketplace`、`asinList[]`（≤20）
- 参数（选填）：`historyDate`（yyyyMM）、`queryType`(0=所有变体/1=畅销变体/2=当前变体默认)、`amazonChoice`(bool)、`includeKeywords[]`/`excludeKeywords[]`
- 区间过滤：`searches`/`searchRank`/`purchases`/`purchaseRate`/`products`/`supplyDemandRatio`/`bid`/`adProducts`/`avgPrice`/`wordCount`/`SPR`/`titleDensity`/`monopolyClickRate`/`trafficPercentage`/`conversionRate`/`competitors`（ASIN竞品数）
- 返回：`items{keyword/searches/products/purchases/purchaseRate/bid/searchesRank/latest*daysAds/supplyDemandRatio/trafficPercentage/avgPrice/avgRating/titleDensity/spr/monopolyClickRate/top3ClickingRate/top3ConversionRate/relationVariationsItems[{asin,trafficPercentage,title,price,reviews,rating}]}`

### traffic_listing_stat — 关联流量统计概览（12 站）
- 参数（必填）：`marketplace`、`asinList[]`
- 参数（选填）：`returnFields`（数组）
- 返回：`relations`/`freeRelations`/`paidRelations`/`calcTime`/`items[{relation,count}]`
- 用途：**先调本工具**看类型分布，再调 `traffic_listing`。

### traffic_listing — 关联流量商品列表（12 站，size 20/50/100）
- 参数（必填）：`marketplace`、`asinList[]`
- 参数（选填）：`relations[]`（空数组=全部）、`variations`(bool，默认true)、`page`/`size`/`order`、`returnFields`（数组）
- `relations` 枚举值：
  - `VAV`：看了又看（View Also Viewed）
  - `CSI`：相似产品（Compare Similar Items）
  - `AVP`：看了还看（Also View Page）
  - `BAV`：看了却买（Bought After Viewing）
  - `MIB`：捆绑销售（Manufacturer Items in Box）
  - `FBT`：组合购买（Frequently Bought Together）
  - `MIE`：更多相关（More Items to Explore）
  - `BAB`：买了又买（Bought Also Bought）
  - `COB`：品牌推荐（Compare Often Bought）
  - `SP`：商品广告（Sponsored Products）
  - `FSA`：四星产品（Four Star And Above）
  - `BCA`：品牌广告（Brand Creative Ads）
- 返回：`items{asin/title/price/units/revenue/bsr/ratings/rating/fulfillment/brand/sellerNation/badge{...}}`

### ss_keyword_order — 多 ASIN 出单词反查（13 站）
- 参数（**全部必填**）：`marketplace`、`asins[]`（≤20）、`reverseType`（W=按周/M=按月）、`year`（整数）、`month`（1-12 整数）
- `week`（1-5，**`reverseType=W` 时必填**，系统自动换算为该周最后一个周六日期）
- 参数（选填）：`conversionType`（多个逗号分隔：E=优质/S=平稳/L=流失/I=无效）、`variation`(N=含变体默认/Y=排除变体)、`page`/`size`/`order`、`returnFields`（**逗号字符串**）
- 返回：各 ASIN 对应关键词及其转化类型、搜索量等。

### ss_keyword_research_trends — 关键词研究趋势（13 站）
- 参数（必填）：`marketplace`、`keyword`
- 参数（选填）：`month`（yyyyMM，默认 `nearly`=最近）、`returnFields`（**逗号字符串**）
- 返回：关键词历史搜索量、排名趋势。

### ss_aba_research_trend — ABA 趋势（13 站）
- 参数（必填）：`marketplace`、`keyword`
- 参数（选填）：`timeGranularity`（W=按周/M=按月）、`returnFields`（**逗号字符串**）
- 返回：ABA 排名/搜索量历史趋势序列。

### ss_traffic_source — 流量来源分析（13 站）
> **⚠️ request 包裹型**：业务参数放进 `request` 对象
- `request` 内参数（必填）：`marketplace`、`q`（ASIN 或关键词）
- `request` 内参数（选填）：`month`（yyyyMM）、`order`、`page`、`size`、`returnFields`（**逗号字符串**）
- 调用示例：`{"request":{"marketplace":"US","q":"B07Z82895W","month":"202507"}}`
- 返回：不同来源（自然搜索/官方推荐/广告）的流量词分布、占比及基础商品信息。

---

# D. 市场结构与竞争分布（13 个，request 包裹型，13 站）

> **全部为 request 包裹型**，调用形式：`{"request":{...}}`
> `returnFields` 为**逗号字符串**

**统一入参**（放进 `request`）：
| 字段 | 说明 |
|------|------|
| `marketplace` | 必填，13 站（US/JP/UK/DE/FR/IT/ES/CA/IN/MX/BR/AU/AE） |
| `nodeIdPath` | **必填**，类目节点路径，如 `2619525011:3741271`（来自 `product_node`） |
| `month` | `yyyyMM` |
| `topN` | 头部 Listing 样本数（默认10），用于与整体样本对比判集中度 |
| `newProduct` | 新品定义阈值（月）：服装常1、母婴可6 |
| `returnFields` | 逗号字符串 |
| `asins` | 仅 `ss_market_product_concentration` 支持，用于过滤 ASIN |

| 工具 | 分析内容与用途 |
|------|----------------|
| `ss_market_research_statistics` | 市场调研统计汇总（综合指标一览） |
| `ss_market_product_concentration` | 商品集中度 = 头部总销量 T / 样本总销量 A；判断头部垄断与进入机会 |
| `ss_market_brand_concentration` | 品牌集中度，含**同级类目品牌集中度**横向对比；判断是否被少数品牌占据 |
| `ss_market_seller_concentration` | 卖家集中度；判断是否被少数卖家垄断 |
| `ss_market_seller_type_concentration` | 卖家类型（AMZ/FBA/FBM）占比；判断竞争生态与物流门槛 |
| `ss_market_seller_country_distribution` | 卖家国籍分布；中国卖家占比高=打法同质化，需靠产品差异 |
| `ss_market_price_distribution` | 价格区间分布、销量占比、平均销量、区间评分；找差异化定价带 |
| `ss_market_rating_distribution` | 评分（星级）分布 |
| `ss_market_ratings_count_distribution` | 评分数区间分布（区间跨度可配置）；判断新品评价进入门槛 |
| `ss_market_listing_date_distribution` | 上架**距今时长**分布；判断新品接受度与打造难度 |
| `ss_market_listing_trend_distribution` | 上架**绝对时间**分布 + 各区间平均评分；判断生命周期与市场成熟度 |
| `ss_market_ebc_distribution` | A+ 页面 / Lister 视频 四象限配置分布及销量占比；判断内容投入回报 |
| `ss_market_product_demand_trend` | 需求趋势：页面浏览量、商品总数、退货率（市场均值/同类目均值）、搜索购买比 |

---

# E. 商标与品牌合规（4）

| 工具 | 参数 | 说明 |
|------|------|------|
| `ss_trademark_country_list` | 无参 | 返回商标知识产权局（office）代码列表 |
| `ss_trademark_list` | **request 包裹**：`text`（**必填**，模糊查多字段）、`brandName[]`、`applicant[]`、`applicationYear[]`、`expiryYear[]`、`niceClass[]`（尼斯分类）、`office[]`、`status[]`（Registered/Pending/Expired/Ended/Unknown）、`imageBase64`、`order`、`page`、`size`、`returnFields`（逗号字符串） | 商标列表查询 |
| `ss_trademark_stats` | **request 包裹**：`office[]`（**必填**）、`text`（**必填**）、`returnFields`（逗号字符串） | 商标统计（按国家） |
| `ss_trademark_detail` | 平铺：`office`（**必填**）、`brandId`（**必填**）、`returnFields`（逗号字符串） | 商标详情（权利人/类别/状态/有效期） |

---

## 错误速查
| code | 处理 |
|------|------|
| `OK` | 正常 |
| `BAD_REQUEST` | 按 message 修正参数 |
| `UPSTREAM_ERROR` | 按 `data.hint`：会话失效/配额耗尽→联系管理员；限流/超时/不可用→稍后重试或降频 |
| `INTERNAL_ERROR` | 友好降级，联系管理员 |
| JSON-RPC `-32601` | method 不存在 |
| JSON-RPC `-32602` | 必填参数缺失/工具名不存在/**站点或 size 越界** |
| JSON-RPC `-32001` | 缺少 `X-API-Key` |
| JSON-RPC `-32000` | 鉴权失败/限流/余额不足 |

---

## 常见参数陷阱（高频错误）
| 陷阱 | 正确做法 |
|------|----------|
| `keyword_miner` 用 `minSearches` | 应为 `minSearch`/`maxSearch` |
| `ss_keyword_order` 忘传 `year`/`month` | 三者必填：`year`+`month`+`reverseType`；W型还需 `week` |
| `ss_traffic_source` 参数平铺 | 必须包裹在 `request` 对象内 |
| `aba_research_weekly` 手算周六日期 | 只传 `year`+`month`+`week`，系统自动换算 |
| `returnFields` 类型搞反 | 常规工具=数组；`ss_*` request型=逗号字符串 |
| `keyword_research` 的 `marketPeriod` 格式 | `"S11,S12"` 表示11/12月旺季，S1~S12 |
| `bsr_prediction` 传 BSR 字符串 | `bsr` 参数为整数，`categoryId` 为字符串数字ID |
