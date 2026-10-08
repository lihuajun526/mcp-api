# SellerDex MCP 工具参数速查（46 个）

> 通过 `tools/call` 调用，服务端鉴权，**不要传 API Key**。响应统一为 `{code, message, data}`。
> **两种调用形态**：常规工具参数平铺；`ss_market_*` / `ss_trademark_list` / `ss_trademark_stats` 等把业务参数放进 **`request` 对象**。
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
- 参数：`marketplace`、`returnFields`
- 返回：`marketplace`、`total`、`items[{category_name, category_name_cn, category_value}]`
- 用途：需要类目值时**先调本工具**，匹配 `category_value` 供 `aba_research_*` 的 `departments` 使用。

### product_node — 类目节点树（10 站）
- 参数：`marketplace`、`nodeIdPath`、`keyword`、`returnFields`
- 模式：① `nodeIdPath` 浏览子类目；② `keyword`（类目名或 nodeId）搜索节点；都不传→顶级类目列表。
- 返回（数组）：`nodeIdPath/nodeLabelPath/nodeLabelLocale/nodeLabelPathLocale/products`
- 用途：拿 `nodeIdPath` 供 `product_research`/`competitor_lookup`/`market_research`/`bsr_prediction`/全部 `ss_market_*` 使用。

### market_research — 选市场 / 细分类目分析（10 站，size 20/50/100）
- 粒度：**一条记录=一个细分类目**。
- 参数：`marketplace`、`month`、`nodeIdPath`、`departmentKeyword`、`topNum`(默认10)、`newProduct`(1/3/6/12，默认3)、`sellerLocation`、`page`/`size`/`order` + 大量区间：`min/maxAvgUnits`、`AvgRevenue`、`AvgRatings`、`AvgRating`、`AvgBsr`、`AvgPrice`、`Weight`、`Volume`、`AvgProfit`、`TopAvgUnits`、`TopAvgRevenue`、`TopAvgBsr`、`GoodsCount`、`Brands`、`Sellers`、`AvgSellers`、`GoodsCrn`、`BrandCrn`、`SellerCrn`、`EbcProportion`、`FbaProportion`、`FbmProportion`、`AmazonSelfProportion`、`NewProportion`、`NewCount`、`NewAvgRatings`、`NewAvgPrice`、`NewAvgRating`、`NewAvgUnits`、`NewAvgRevenue`。
- 返回：`nodeId/nodeIdPath/nodeLabelName/nodeLabelPath/ranking/topProducts/brands/sellers/totalUnits/totalRevenue/avgUnits/avgRevenue/avgPrice/avgRatings/avgRating/avgBsr/avgSellers/avgProfit/ebcProportion/amazonSelfProportion/fbaProportion/fbmProportion/sellerNation/returnRatio/avgReturnRatio/searchToPurchaseRatio/top3ProductSales/top5ProductSales/top10ProductSales/top20ProductSales`。

### product_research — 多维度选品（10 站，size 20/60/100）
- 粒度：**ASIN 级商品**。
- 参数：`marketplace`、`month`、`keyword`、`matchType`(1/2/3)、`excludeKeywords`、`includeBrands`/`excludeBrands`、`includeSellers`/`excludeSellers`、`nodeIdPaths[]`、`filterSub`、`variation`、`fulfillment`(AMZ,FBA,FBM)、`sellerNation`、`dimensionType`(SS/LS/SB/LB/ELO/EL5O/EL7O/EL15O/O)、`weightUnit`(g/lb/oz/kg)、`badgeBS`/`badgeAC`/`badgeNR`、`availableMonth`、`page`/`size`/`order` + 区间（价格/评分/评分数/评分数变化/卖家数/利润率/BSR/BSR变化/销量/销额/增长率/重量/变体数/FBA/LQS）。
- 返回：`items{asin/brand/title/nodeIdPath/nodeLabelPath/bsr/bsrCr/bsrCv/units/unitsGr/amzUnit/amzSales/revenue/price/profit/fba/ratings/ratingsRate/rating/ratingsCv/ratingDelta/lqs/availableDate/fulfillment/variations/sellers/sellerId/sellerName/sellerNation/badge{...}/weight/dimension/dimensionsType/pkgDimensions/pkgWeight/sku/subcategories}`。

### keyword_research — 关键词选品（14 站，size 20/50/100）
- 参数：`marketplace`、`keywords`（**必填**）、`excludeKeywords`、`month`、`supplement`(N/Y)、`withYearlyGrowth`、`marketPeriod` + 区间（searches/growth/yearlyGrowth/yearlyGrowthRate/growthTrendMin/growthRateTrendMin/products/purchases/purchaseRate/avgPrice/avgReviews/avgRating/bid/monopolyClickRate/goodsValue/supplyDemandRatio/wordCount）、`page`/`size`/`order`。
- 返回：`keywords/searches/clicks/impressions/purchases/growth/purchaseRate/products/supplyDemandRatio/avgPrice/avgRatings/avgRating/bid/araClickRate/araShareRate/goodsValue/marketPeriod/keywordCn/brands/categories/relationAsinList/araAsinList`。

### aba_research_weekly — ABA 数据选品（按周，14 站，size 20/50/100）
- 参数：`marketplace`、`year`+`month`(1-12)+`week`(1-5)（三者同传，缺省=最近一周，系统自动换算周六日期）、`departments[]`（来自 `first_category`）、`includeKeywords`/`excludeKeywords`、`exactFlag`、`searchModel`(1热门/2异动/3持续增长/4快速飙升/5潜力/6长尾)、`rankGrowthValue`/`rankGrowthRate` + 区间（searchRank/searches/monopolyClickRate/conversionRate/wordCount/SPR/titleDensity/clicks/impressions）、`page`/`size`/`order`（默认 searchfrequencyrank）。
- 返回：`keyword/searchRank/searchRankCv/searchRankCr/searches/purchases/purchaseRate/clicks/impressions/searchRankGrowthValue/searchRankGrowthRate/w1SearchRank/w4SearchRank/w12SearchRank`（及各自 Growth）、`bid/cvsShareRate/clickShareRate/titleDensityExact/cprExact/top3Brands/top3AsinDtoList`。

### aba_research_monthly — ABA 数据选品（按月，14 站，size 20/50/100）
- 参数：同 weekly，但日期用 `date`（`yyyyMM`，留空=最近30天）；返回字段一致。

### bsr_prediction — BSR 销量预测（10 站）
- 参数：`marketplace`、`categoryId`（一级类目数字ID，来自 `asin_detail.bsrId` 或 `product_node`）、`bsr`。
- 返回：`categoryLabel`、`estDailySales`、`estMonthSales`、`itemList[{bsr,estDailySales,estMonthSales}]`。

### google_trend — 谷歌趋势（13 站）
- 参数：`marketplace`、`keyword`、`googleProp`（web 默认 / shoppingCart）、`monthly`（false=按周默认）、`intervalYear`（1 / 5 默认）。
- 返回：`keyword/link/range{week,month,quarter,half,year,threeYear,all}/items[{time(ms),value(0~100)}]`。

---

# B. 竞品与商品分析（9）

### competitor_lookup — 查竞品列表（10 站，size 20/60/100）
- 场景：**已知目标→查这批商品数据**。
- 参数：`marketplace`、`month`、`keyword`、`brand`、`sellerName`、`asins[]`（≤40）、`nodeIdPath`、`variation`、`page`/`size`/`order`（total_units/amz_unit/total_amount/bsr_rank/price/rating/ratings/profit/reviews_rate/available_date/各增长率/bsr_rank_cv/bsr_rank_cr）。
- 至少一个筛选条件，或仅指定市场查全量。支持 `sellerName`（`product_research` 不支持）。

### asin_competitor — 单 ASIN 直接竞品（10 站，size 20/60/100）
- 参数：`marketplace`、`asin`、`size`。返回 `data` 为竞品对象数组（字段同 product_research item）。

### asin_detail — ASIN 详情（10 站）
- 参数：`marketplace`、`asin`（一次一个）。
- 返回（对象，不分页）：`asin/asinUrl/brand/bsrId/bsrLabel/bsrRank/availableDate/createdTime/firstRatingDate/coupon/questions/rating/ratings/reviews/variantRatings/variantReviews/nodeId/nodeIdPath/nodeLabelPath/parent/price/primePrice/deliveryPrice/sellerId/sellerName/fulfillment/sellers/skuList/title/features/overviews/badge{...}/variationList/variations/weight/dimensions/lqs`。
- 串联：`bsrId`→`bsr_prediction`；`nodeIdPath`→`product_node`/`product_research`/`competitor_lookup`/`ss_market_*`。

### asin_prediction — ASIN 销量预测（日粒度，10 站）
- 参数：`marketplace`、`asin`。返回：`asinDetail{...}`、`dailyItemList[{date,bsr,sales,amount,price}]`、`monthItemList[{date,sales,amount,price}]`。

### asin_sales_trend — ASIN 销量趋势（月粒度，10 站）
- 参数：`marketplace`、`asin`。返回：`asin{...完整详情...}`、`salesTrendPoints[{month,price,averagePrice,parentUnitSales,childUnitSales,parentSalesRevenue,childSalesRevenue}]`。

### ss_asin_detail_with_coupon_trend — ASIN 详情 + 优惠趋势（13 站）
- 参数：`marketplace`、`asin`、`returnFields`（字符串）。

### ss_asin_coupon_trend — ASIN 优惠价格趋势（13 站）
- 参数：`marketplace`、`asin`、`returnFields`。返回：原价、优惠类型（金额/百分比）、优惠金额、计算后成交价。

### ss_review — 商品评论列表（13 站，size 自由整数）
- 参数：`marketplace`、`asin`、`starList[]`（1~5 星）、`typeList[]`（1 图片/2 视频/3 VP/4 Vine）、`page`/`size`、`startTimestamp`/`endTimestamp`（毫秒）、`returnFields`（字符串）。
- 返回：评论标题/内容/评分/评论人/评论时间等。

### ss_keepa_info — Keepa 历史数据（13 站）
- 参数：`marketplace`、`asin`、`startTimestamp`/`endTimestamp`（毫秒）、`dailyLatest`（仅每天最新一条）、`returnFields`（字符串）。
- 返回：价格/BSR 等历史时间序列。

---

# C. 关键词与流量（11）

### keyword_miner — 关键词扩词挖掘（13 站，size 20/50/100）
- 场景：**以种子词为起点，挖包含词根的衍生/长尾词**。
- 参数：`marketplace`、`keywordList[]`（**必填**，≤200）、`historyDate`、`filterRootWord`(0/1)、`matchType`(0词组/1广泛)、`keywordBidMatchType`(phrase/exact/broad)、`amazonChoice`、`includeKeywords`/`excludeKeywords` + 区间（search/purchases/purchasesRate/SPR/relevancy/searchRank/products/supplyDemandRatio/adProducts/monopolyClickRate/bid/wordCount/price/ratings/rating）、`page`/`size`/`order`（默认 relevancy）。
- 返回：`keyword/searches/purchases/purchaseRate/products/adProducts/supplyDemandRatio/monopolyClickRate/avgPrice/avgRatings/avgRating/bid/spr/titleDensity/wordCount/relevancy/amazonChoice/searchRank/clicks/impressions/cvsShareRate/departments`。

### keyword_conversion — 关键字转化率（9 站，size 20/50/100）
- 参数：`marketplace`、`keyword`、`timeType`（WEEK 近7天默认 / 90D）、`keywordBidMatchType`、`matchType`、`includeKeywords`/`excludeKeywords`、`customAvgProductPrice` + 区间（searches/clicks/purchases/searchConvRate/clickConvRate/ppc/cpa/productPrice/acos/clickingRate/conversionRate/phraseCount/budget）、`page`/`size`/`order`。
- 返回：`keyword/searches/clicks/purchases/searchConvRate/clickConvRate/clickingRate/conversionRate/phrasePpc{value,min,max}/exactPpc/broadPpc/phraseCpa/exactCpa/broadCpa/avgProductPrice/phraseBudget/exactBudget/broadBudget/phraseAcos/exactAcos/broadAcos/top3Asins[]/top10Asins[]`。

### traffic_keyword_stat — 流量词统计概览（13 站）
- 参数：`marketplace`、`asin`、`month`。返回：`keywords`(总流量词)/`ranks`/`ads`/`calcTime`/`badgeCount{ns/ac/er/fs/hr/sb/sv/ad}`。
- 用途：**先调本工具了解规模**，再决定是否翻页拉 `traffic_keyword`。

### traffic_keyword — ASIN 流量词反查（13 站，size 20/50/100）
- 参数：`marketplace`、`asin`、`keyword`、`month`、`badges[]`（NATURAL_SEARCHING/AMAZON_CHOICE/EDITORIAL_RECOMMENDATIONS/FOUR_STAR/SPONSOR_BRAND/SPONSOR_VIDEO/HIGHLY_RATED/ADS）、`trafficKeywordTypes[]`（PRIMARY/PRECISE/PRECISE_LONG_TAIL）、`conversionKeywordTypes[]`（EXCELLENT/STABLE/LOST/INVALID）、`page`/`size`/`order`（默认 rankPosition）。
- 返回：`items{keyword/searches/products/purchases/purchaseRate/bid/badges/rankPosition/adPosition/searchesRank/latest1daysAds/latest7daysAds/latest30daysAds/supplyDemandRatio/trafficPercentage/trafficKeywordType/conversionKeywordType/calculatedWeeklySearches/impressions/clicks/naturalRatio/adRatio}`。

### traffic_extend — 拓展流量词（多 ASIN，13 站，size 20/50/100）
- 参数：`marketplace`、`asinList[]`（≤20）、`historyDate`、`queryType`(0所有变体/1畅销变体/2当前变体默认)、`amazonChoice`、`includeKeywords`/`excludeKeywords` + 区间（searches/searchRank/purchases/purchaseRate/products/supplyDemandRatio/bid/adProducts/avgPrice/wordCount/SPR/titleDensity/monopolyClickRate/trafficPercentage/conversionRate/competitors）、`page`/`size`/`order`。
- 返回：`items{keyword/searches/products/purchases/purchaseRate/bid/searchesRank/latest*daysAds/supplyDemandRatio/trafficPercentage/avgPrice/avgRating/titleDensity/spr/monopolyClickRate/top3ClickingRate/top3ConversionRate/relationVariationsItems[{asin,trafficPercentage,title,price,reviews,rating}]}`。

### traffic_listing_stat — 关联流量统计概览（12 站）
- 参数：`marketplace`、`asinList[]`。返回：`relations`/`freeRelations`/`paidRelations`/`calcTime`/`items[{relation,count}]`。
- 用途：**先调本工具**看类型分布，再调 `traffic_listing`。

### traffic_listing — 关联流量商品列表（12 站，size 20/50/100）
- 参数：`marketplace`、`asinList[]`、`relations[]`（VAV 看了又看/CSI 相似产品/AVP 看了还看/BAV 看了却买/MIB 捆绑销售/FBT 组合购买/MIE 更多相关/BAB 买了又买/COB 品牌推荐/SP 商品广告/FSA 四星产品/BCA 品牌广告；空数组=全部）、`variations`(默认 true)、`page`/`size`/`order`。
- 返回：`items{asin/title/price/units/revenue/bsr/ratings/rating/fulfillment/brand/sellerNation/badge{...}}`。

### ss_keyword_order — 多 ASIN 出单词反查（13 站）
- 参数：`marketplace`、`asins[]`（≤20）、`reverseType`（W 周 / M 月）、`year`/`month`（`reverseType=W` 时还需 `week` 1-5）、`conversionType`（E 优质/S 平稳/L 流失/I 无效，逗号分隔）、`variation`(N 默认含变体)、`page`/`size`/`order`、`returnFields`。
- 返回：各 ASIN 对应关键词及其转化类型等。

### ss_keyword_research_trends — 关键词研究趋势（13 站）
- 参数：`marketplace`、`keyword`、`month`（默认 nearly）。返回关键词的历史趋势。

### ss_aba_research_trend — ABA 趋势（13 站）
- 参数：`marketplace`、`keyword`、`timeGranularity`（W 周 / M 月）。返回 ABA 排名/搜索量趋势。

### ss_traffic_source — 流量来源（13 站）
- 参数（request 包裹）：`request{marketplace, q（ASIN 或关键词，必填）, month, order, page, size, returnFields}`。

---

# D. 市场结构与竞争分布（13 个，request 包裹型，13 站）

**统一入参**（放进 `request`）：
| 字段 | 说明 |
|------|------|
| `marketplace` | 必填，13 站 |
| `nodeIdPath` | **必填**，类目节点路径，如 `2619525011:3741271`（来自 `product_node`） |
| `month` | `yyyyMM` |
| `topN` | 头部 Listing 样本数（默认取头部前 10），用于与整体样本对比判集中度 |
| `newProduct` | 新品定义阈值（月），服装常 1、母婴可 6 |
| `returnFields` | 逗号字符串 |
| `asins` | 仅 `ss_market_product_concentration` 支持，用于过滤 ASIN |

| 工具 | 分析内容与用途 |
|------|----------------|
| `ss_market_research_statistics` | 市场调研统计汇总 |
| `ss_market_product_concentration` | 商品集中度 = 头部总销量 T / 样本总销量 A；判断头部垄断与进入机会 |
| `ss_market_brand_concentration` | 品牌集中度，含**同级类目品牌集中度**对比；判断是否被少数品牌占据 |
| `ss_market_seller_concentration` | 卖家集中度；判断是否被少数卖家垄断 |
| `ss_market_seller_type_concentration` | 卖家类型（AMZ/FBA/FBM）集中度 |
| `ss_market_seller_country_distribution` | 卖家国籍分布；中国卖家占比高=打法同质化 |
| `ss_market_price_distribution` | 价格区间分布、销量占比、平均销量占比、区间评分；找差异化定价带 |
| `ss_market_rating_distribution` | 评分（星级）分布 |
| `ss_market_ratings_count_distribution` | 评分数区间分布（区间跨度可配置）；判断新品评价进入门槛 |
| `ss_market_listing_date_distribution` | 上架**距今时长**分布；判断新品接受度与打造难度 |
| `ss_market_listing_trend_distribution` | 上架**绝对时间**分布 + 各区间平均评分；判断生命周期与市场成熟度 |
| `ss_market_ebc_distribution` | A+ 页面 / Lister 视频 四象限配置分布及销量占比；判断内容投入回报 |
| `ss_market_product_demand_trend` | 需求趋势：页面浏览量、商品总数、退货率（市场均值/同类目均值）、搜索购买比（市场均值/同类目均值） |

---

# E. 商标与品牌合规（4）

| 工具 | 参数 | 说明 |
|------|------|------|
| `ss_trademark_country_list` | 无参 | 返回商标知识产权局（office）代码列表 |
| `ss_trademark_list` | `request{text(必填,模糊查多字段), brandName[], applicant[], applicationYear[], expiryYear[], niceClass[], office[], status[](Registered/Pending/Expired/Ended/Unknown), imageBase64, order, page, size, returnFields}` | 商标列表查询 |
| `ss_trademark_stats` | `request{office[](必填), text(必填)}` | 商标统计 |
| `ss_trademark_detail` | `office`(必填)、`brandId`(必填) | 商标详情 |

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
