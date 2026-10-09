# SellerDex MCP 工具参数与返回速查（46 个）

> 通过 `tools/call` 调用，服务端鉴权，**不要传 API Key**。成功响应 `{code:"OK", message, data}`。
> 本文以 `tools/list` 真实 schema + 服务端实际返回为准；**工具描述里列出但实际不返回的字段已剔除或标注**。

---

## 0. 公共约定

### 0.1 调用形态
| 形态 | 工具 | 写法 |
|------|------|------|
| request 包裹（16） | 13 个 `ss_market_*`、`ss_traffic_source`、`ss_trademark_list`、`ss_trademark_stats` | `{"request":{"marketplace":"US",...}}` |
| 平铺（30） | 其余全部，含 `ss_keyword_order`、`ss_trademark_detail`、`ss_trademark_country_list`（无参） | `{"marketplace":"US","asin":"..."}` |

### 0.2 marketplace 约束
- 42 个工具必填 marketplace；4 个商标工具用 `office`。
- **27 个有枚举**（越界报 `-32602`）；**15 个无枚举**（13 个 `ss_market_*`、`ss_traffic_source`、`ss_keyword_order`）越界**返回空或业务错误**。

### 0.3 时间参数（26 个工具 + 2 个时间戳工具）
| 参数 | 格式 | 工具 |
|------|------|------|
| `month` | `yyyyMM` 字符串 | `competitor_lookup`、`product_research`、`market_research`、`traffic_keyword`、`traffic_keyword_stat`、`keyword_research`（近 24 个月）、`ss_keyword_research_trends`（默认 `nearly`）、`ss_traffic_source`、13 个 `ss_market_*` |
| `date` | `yyyyMM` | `aba_research_monthly` |
| `historyDate` | `yyyyMM` | `keyword_miner`、`traffic_extend` |
| `year`+`month`(1-12 整数)+`week`(1-5) | 系统自动换算为该月第 N 个周六 | `aba_research_weekly`（三者同传，缺省=最近一周）、`ss_keyword_order`（year+month 必填，W 模式需 week） |
| `startTimestamp`/`endTimestamp` | 毫秒 | `ss_review`、`ss_keepa_info` |

不传时间 = 最近 30 天 / 最新可用数据。跨期对比时显式传入同口径月份。

### 0.4 returnFields 类型
- 常规工具（无 `ss_` 前缀）：**数组** `["asin","price"]`
- `ss_*` 工具：**逗号字符串** `"asin,price"`
- 分页信封字段（page/size/total/pages/hasNextPage/items/order/marketplace/month）始终保留。

### 0.5 分页 size
| 取值 | 工具 |
|------|------|
| 20/60/100（默认 60） | `competitor_lookup`、`asin_competitor`、`product_research` |
| 20/50/100（默认 50） | `traffic_keyword`、`traffic_extend`、`traffic_listing`、`keyword_research`、`keyword_miner`、`keyword_conversion`、`aba_research_weekly/monthly`、`market_research` |
| 自由整数 | `ss_review`、`ss_keyword_order`、`ss_traffic_source`、`ss_trademark_list` |

### 0.6 排序字段总表（最常见的出错点）
| 工具 | 是否枚举约束 | 默认方向 | 合法字段 |
|------|------------|---------|---------|
| `competitor_lookup` | 否（错了静默失效） | desc | `total_units`(默认)、`amz_unit`、`total_amount`、`bsr_rank`、`price`、`rating`、`ratings`、`profit`、`reviews_rate`、`available_date`、`total_units_growth`、`total_amount_growth`、`reviews_increasement`、`bsr_rank_cv`、`bsr_rank_cr` |
| `product_research` | 否 | desc | `total_units`(默认)、`amz_unit`、`total_amount`、`bsr_rank`、`price`、`profit`、`rating`、`ratings`、`fba`、`lqs`、`available_date`、`total_units_growth`、`total_amount_growth`、`bsr_rank_cv`、`bsr_rank_cr` |
| `market_research` | 否 | desc | `total_sales`(默认)、`avg_revenue`、`avg_units`、`avg_bsr`、`avg_price`、`avg_rating`、`return_rate`、`new_product_count` |
| `keyword_research` | 否 | desc | `searches`(默认)、`purchases`、`purchaseRate`、`products`、`growth`、`bid`、`supplyDemandRatio`、`avgPrice` |
| `keyword_miner` | 否 | desc | `relevancy`(默认)、`searchRank`、`searches`、`purchases`、`purchaseRate`、`impressions`、`clicks`、`spr`、`titleDensity`、`products`、`supplyDemandRatio`、`adProducts`、`monopolyClickRate`、`cvsShareRate`、`bid`、`avgPrice`、`avgRatings`、`avgRating` |
| `aba_research_weekly/monthly` | 否 | desc | `searchfrequencyrank`(默认)、`searches`、`clicks`、`impressions`（其他值未保证，找飙升词用 `searchModel=4` + `minRankGrowthRate`） |
| `traffic_keyword` | **是**（越界 -32602） | **asc** | `rankPosition`(默认)、`adPosition`、`createdTime`、`searchesRank`、`searches`、`purchases`、`purchaseRate`、`products`、`supplyDemandRatio`、`latest1daysAds`、`bid`、`trafficPercentage` |
| `traffic_extend` | **是** | desc | `trafficPercentage`(默认)、`relationAsin`、`searchesRank`、`searches`、`purchases`、`purchaseRate`、`titleDensity`、`products`、`supplyDemandRatio`、`adProduct`、`bid`、`impressions`、`clicks`、`totalClickRate`、`totalConversionRate` |
| `traffic_listing` | **是** | desc | `relationCount`(默认)、`createdTime` |
| `ss_keyword_order` | 否 | **asc** | `searchRank`(默认)、`searchRankGrowthValue`、`searchRankGrowthRate`、`sumClickRate` |
| `ss_traffic_source` | 否 | — | `searchfrequencyrank`、`cprExact`(SPR)、`titleDensityExact`、`searches` |
| `ss_trademark_list` | 否 | — | `applicationDate` |

> `traffic_keyword` 的 `naturalRatio`/`adRatio`/`latest7daysAds`/`latest30daysAds` 只是返回字段，**不能排序**。

### 0.7 单位与量级（下结论前必看）
| 字段 | 单位 |
|------|------|
| `keyword_research`: `purchaseRate`、`araClickRate`、`araShareRate`、`goodsValue` | **0~1 小数**（服务端已 ÷100） |
| `keyword_research`: `growth` | 百分数 |
| `keyword_research` 过滤：`minPurchaseRate`、`minGrowth`、`minYearlyGrowthRate` | 百分数 |
| `traffic_extend` 过滤：`minPurchaseRate` | 0~1 |
| `keyword_miner` 过滤：`minPurchasesRate` | 百分数 |
| `market_research`: `*Proportion`、`goodsCrn/brandCrn/sellerCrn`、`newProportion`、`returnRatio` | **百分数**（如 35.2 = 35.2%） |
| `market_research`: `monopolyRatio` | 倍数（头部月均销量 ÷ 整体月均销量） |
| `product_research/competitor_lookup`: `profit` | 毛利率 %（平台估算，通常只扣佣金与 FBA 费，不含采购、头程、广告；算真实利润用 P21 公式） |
| `fba`、`price`、`bid`、`*Ppc`、`*Cpa`、`avgPrice` | **站点本币** |
| `lqs` | 分数，量级以返回为准；只做相对比较（自己 vs 竞品均值） |
| 其他未列比率字段 | 先看量级：全部 ≤ 1 视为小数，否则视为百分数 |

---

## A. 选品与市场发现（9）

### first_category（14 站）
- 参数：`marketplace`、`returnFields[]`
- 返回：`total`、`items[{category_name, category_name_cn, category_value}]`
- 唯一用途：给 `aba_research_*` 的 `departments` 提供取值。

### product_node（10 站）
- 参数：`marketplace`、`nodeIdPath`（浏览子节点）或 `keyword`（类目名/nodeId 搜索）；都不传 = 顶级类目
- 返回（数组）：`nodeIdPath`、`nodeLabelPath`、`nodeLabelLocale`、`nodeLabelPathLocale`、`products`
- `nodeIdPath` 第一段 = 一级类目 ID，可作 `bsr_prediction.categoryId`。

### market_research（10 站，size 20/50/100）
- 粒度：一条 = 一个细分类目。不传 `nodeIdPath` = 全部大类；传入 = 其子类目。
- 参数：`month`、`nodeIdPath`、`departmentKeyword`、`topNum`(默认10)、`newProduct`(1/3/6/12)、`sellerLocation`(逗号)、`page/size/order`
- **区间过滤（min/max 前缀，可一次筛出合格子类目）**：`AvgUnits`、`AvgRevenue`、`AvgRatings`、`AvgRating`、`AvgBsr`、`AvgPrice`、`Weight`、`Volume`、`AvgProfit`、`TopAvgUnits`、`TopAvgRevenue`、`TopAvgBsr`、`GoodsCount`、`Brands`、`Sellers`、`AvgSellers`、`GoodsCrn`、`BrandCrn`、`SellerCrn`、`EbcProportion`、`FbaProportion`、`FbmProportion`、`AmazonSelfProportion`、`NewProportion`、`NewCount`、`NewAvgRatings`、`NewAvgPrice`、`NewAvgRating`、`NewAvgUnits`、`NewAvgRevenue`
- **实际返回**：`ranking`、`nodeId`、`nodeIdPath`、`nodeLabelName`、`nodeLabelLocale`、`topProducts`(样本商品数)、`brands`、`sellers`、`totalUnits`、`avgUnits`、`topAvgUnits`、`monopolyRatio`、`avgRevenue`、`topAvgRevenue`、`avgRatings`、`avgRating`、`avgBsr`、`topAvgBsr`、`avgSellers`、`avgPrice`、`fbaProportion`、`amazonSelfProportion`、`fbmProportion`、`goodsCrn`、`brandCrn`、`sellerCrn`、`newCount`、`newProportion`、`totalProducts`(前台商品总数)、`returnRatio`、`avgReturnRatio`(同类目均值)
- ⚠️ 工具描述中的 `avgProfit`、`top3/5/10/20ProductSales`、`ebcProportion`、`searchToPurchaseRatio`、`sellerNation` **不返回**。利润率要按 `minAvgProfit` 过滤间接控制，或用 `product_research.profit` / `ss_market_research_statistics` 补；集中度用 `goodsCrn`。

### product_research（10 站，size 20/60/100）
- 粒度：ASIN 级，"设条件 → 发现商品"。
- 参数：`month`、`keyword`+`matchType`(1 词组/2 模糊默认/3 精准)、`excludeKeywords`、`includeBrands/excludeBrands`、**`includeSellers/excludeSellers`**（逗号，多卖家）、`nodeIdPaths[]`、`filterSub`(Y)、`variation`、`fulfillment`(AMZ,FBA,FBM)、`sellerNation`(US,CN…)、`dimensionType`(SS/LS/SB/LB/ELO/EL5O/EL7O/EL15O/O)、`weightUnit`、`badgeBS/badgeAC/badgeNR`(Y)、`availableMonth`(近 N 月上架)、`page/size/order`
- 区间（min/max）：`Price`、`Rating`、`Ratings`、**`RatingsCv`(月新增评分数)**、`Sellers`、`Profit`(%)、`Bsr`、`BsrCv`、`BsrCr`、`Units`、`AmzUnit`、`Revenue`、`RevenueCr`、`UnitsCr`、`Weights`、`Variations`、`SubBsrRank`(需 filterSub=Y)、`Fba`、`Lqs`
- 返回 items：`asin/brand/title/parent/nodeId/nodeIdPath/nodeLabelPath/bsrId/bsr/bsrCr/bsrCv/units/unitsGr/amzUnit/amzSales/revenue/revenueGr/price/primePrice/averagePrice/profit/fba/ratings/ratingsRate/rating/ratingsCv/ratingDelta/lqs/availableDate/availableDays/firstReviewDate/fulfillment/variations/sellers/sellerId/sellerName/sellerNation/badge{bestSeller,amazonChoice,newRelease,ebc,video}/weight/dimension/dimensionsType/pkgDimensions/pkgDimensionType/pkgWeight/subcategories/coupon/questions/salesTrend/amzUnitTrend`

### keyword_research（14 站，size 20/50/100）
- 必填：`marketplace`、`keywords`
- 选填：`excludeKeywords`、`month`(近 24 月)、`supplement`(Y=含同义扩展)、`withYearlyGrowth`(仅新细分市场)、`marketPeriod`(S1~S12，逗号；**仅作过滤**)
- 区间（min/max）：`Searches`、`Growth`(%)、`Products`、`Purchases`、`PurchaseRate`(%)、`YearlyGrowth`、`YearlyGrowthRate`(%)、`GrowthTrendMin`(近3月增长值)、`GrowthRateTrendMin`(近3月增长率%)、`AvgPrice`、`AvgReviews`、`AvgRating`、`Bid`、`MonopolyClickRate`、`GoodsValue`、`SupplyDemandRatio`、`WordCount`
- **实际返回**：`keywords`、`keywordCn`、`searches`、`clicks`、`impressions`、`purchases`、`purchaseRate`(0~1)、`growth`(%)、`searchMonthlyCv/searchMonthlyCr`(同比)、`searchNearlyCv/searchNearlyCr`(近3月)、`supplyDemandRatio`、`products`、`araClickRate`(ABA 前三点击集中度 0~1)、`araShareRate`(前三转化份额 0~1)、`araAsinList`、`goodsValue`、`bid/bidMin/bidMax`、`avgPrice`、`avgRatings`、`avgRating`、`relationAsinList`、`searchesTrend`
- ⚠️ `monopolyClickRate` 不返回（集中度看 `araClickRate`）；`marketPeriod`、`brands`、`categories` 返回为空。

### aba_research_weekly（14 站）/ aba_research_monthly（14 站）
- 日期：weekly 用 `year+month+week`；monthly 用 `date`(yyyyMM)
- `departments[]`（来自 `first_category`）、`includeKeywords`/`excludeKeywords`(字符串)、`exactFlag`
- `searchModel`：1 热门(默认)/2 异动/3 持续增长/4 快速飙升/5 潜力/6 长尾
- 区间（min/max）：`SearchRank`、`Searches`、`MonopolyClickRate`、`ConversionRate`、`WordCount`、`SPR`、`TitleDensity`、`Clicks`、`Impressions`、`RankGrowthRate`；weekly 另有 `rankGrowthValue`/`rankGrowthRate`
- 返回：`keyword/keywordCn/departments/searchRank/searchRankCv/searchRankCr/searches/purchases/purchaseRate/clicks/impressions/searchRankGrowthValue/searchRankGrowthRate/w1|w4|w12SearchRank(+GrowthValue/GrowthRate，weekly 有值)/bid/bidMin/bidMax/cvsShareRate/clickShareRate/titleDensityExact/cprExact(SPR)/top3Brands/top3AsinDtoList`

### bsr_prediction（10 站）
- 必填：`categoryId`（字符串数字 ID）、`bsr`（整数）
- 返回：`categoryLabel`、`estDailySales`、`estMonthSales`、`itemList[{bsr,estDailySales,estMonthSales}]`（可画 BSR-销量曲线）
- 仅支持**一级类目** BSR；小类排名不能直接代入。

### google_trend（13 站）
- 必填：`keyword`；选填：`googleProp`(web 默认/shoppingCart 购物意图)、`monthly`(默认 false=周)、`intervalYear`(1/5，默认 5)
- 返回：`link`、`range{week,month,quarter,half,year,threeYear,all}`、`items[{time(ms),value(0~100)}]`
- 长尾词、小语种常无数据 → 降置信度，不作否决。

---

## B. 竞品与商品分析（9）

### competitor_lookup（10 站，size 20/60/100）
- "已知目标 → 查这批商品"。参数：`month`、`keyword`、`brand`、`sellerName`、**`asins[]`(≤40，批量替代 asin_detail)**、`nodeIdPath`、`variation`、`page/size/order`
- 返回 items：同 `product_research`。

### asin_competitor（10 站）
- 必填：`asin`；选填：`size`(20/60/100)、`returnFields[]`
- 返回：竞品数组（字段同 product_research，含 `profit/fba/ratingsCv`，**无 lqs/availableDate**）。

### asin_detail（10 站，一次 1 个）
- 返回：`asin/asinUrl/brand/bsrId/bsrLabel/bsrRank/availableDate/createdTime/firstRatingDate/coupon/questions/rating/ratings/reviews/variantRatings/variantReviews/nodeId/nodeIdPath/nodeLabelPath/nodeLabelPathLocale/parent/price/primePrice/deliveryPrice/sellerId/sellerName/fulfillment/sellers/skuList/title/features/overviews/badge{…}/variationList[{asin,attribute}]/variations/weight/dimensions/subcategories[{rank,code,label}]/lqs`
- 只需要 Listing 文本（`title/features/overviews`）、`subcategories`、`variationList` 时才单独调用；其他批量场景用 `competitor_lookup(asins)`。

### asin_prediction（10 站）
- 返回：`asinDetail{asin,title,brand,availableDate,category,categoryId,ratings,rating}`、`dailyItemList[{date,bsr,sales,amount,price}]`、`monthItemList[{date,sales,amount,price}]`

### asin_sales_trend（10 站）
- 返回：`asin{…完整详情，同 asin_detail…}`、`salesTrendPoints[{month,price,averagePrice,parentUnitSales,childUnitSales,parentSalesRevenue,childSalesRevenue}]`

### ss_asin_detail_with_coupon_trend（13 站）
- 必填：`asin`；`returnFields` 逗号字符串。返回详情 + Coupon 价格趋势（**包含 ss_asin_coupon_trend 的全部信息**）。

### ss_asin_coupon_trend（13 站）
- 返回：原价、优惠类型（金额/百分比）、优惠额、成交价。仅需轻量价格信息时使用。

### ss_review（13 站，size 自由）
- 选填：`starList[]`(1~5)、`typeList[]`(1 图片/2 视频/3 VP/4 Vine)、`page/size`、`startTimestamp/endTimestamp`(ms)、`returnFields`(字符串)
- 无排序参数；时间窗用时间戳控制。

### ss_keepa_info（13 站）
- 选填：`startTimestamp/endTimestamp`(ms)、`dailyLatest`(true 压缩为每日一条)、`returnFields`
- 返回（时间序列 `{timePoint,value}`）：大类/小类 BSR、售价/成交价/划线价/**Buy Box 价格**、**卖家数量变化、Buy Box 卖家 ID 历史**、评论数/评分趋势、父子体与变体列表、**FBA 费用**、尺寸重量包装。**不含销量。**
- 是跟卖监控、评分下滑预警、FBA 成本核算的核心工具。

---

## C. 关键词与流量（11）

### keyword_miner（13 站，size 20/50/100）
- 必填：`keywordList[]`(≤200)
- 选填：`historyDate`、`filterRootWord`(0 全部/1 只含词根)、`matchType`(0 词组/1 广泛默认)、`keywordBidMatchType`(phrase/exact 默认/broad)、`amazonChoice`、`includeKeywords[]/excludeKeywords[]`
- 区间（注意名称）：`minSearch/maxSearch`（**不是 Searches**）、`Purchases`、`PurchasesRate`(%)、`SPR`、`Relevancy`(0~100)、`SearchRank`、`Products`、`SupplyDemandRatio`、`AdProducts`、`MonopolyClickRate`、`Bid`、`WordCount`、`Price`、`Ratings`、`Rating`
- 返回：`keyword/keywordCn/keywordJp/departments/searches/purchases/purchaseRate/monopolyClickRate/products/adProducts/supplyDemandRatio/avgPrice/avgRatings/avgRating/bid/bidMin/bidMax/cvsShareRate/wordCount/titleDensity/spr/relevancy/absoluteRelevancy/amazonChoice/searchRank/searchWeeklyRank/clicks/impressions/phrasePpcItem/exactPpcItem/broadPpcItem/trends`

### keyword_conversion（9 站，size 20/50/100）
- 必填：`keyword`；选填：`timeType`(WEEK 近7天默认/90D)、`keywordBidMatchType`、`matchType`、`includeKeywords[]/excludeKeywords[]`、**`customAvgProductPrice`（传自己售价，让 ACOS/预算贴近自身）**
- 区间（min/max）：`Searches`、`Clicks`、`Purchases`、`SearchConvRate`、`ClickConvRate`、`Ppc`、`Cpa`、`ProductPrice`、`Acos`、`ClickingRate`、`ConversionRate`、`PhraseCount`、`Budget`
- 返回：`keyword/searches/clicks/purchases/searchConvRate/clickConvRate/clickingRate(前三点击占比)/conversionRate(前三转化占比)/phraseCount/{phrase|exact|broad}{Ppc|Cpa|Budget|Acos}{value,min,max}/avgProductPrice/searchesTrend/clickTrend/purchaseTrend/top3Asins[{asin,clickRate,conversionRate}]/top10Asins[{asin,asinPrice,asinReviews,asinRating,rankPage,position,ad,amazonChoice}]`
- **所有广告指标都是市场基准估算，不是卖家自己的数据。**

### traffic_keyword_stat（13 站）
- 必填：`asin`；选填：`month`（严格 yyyyMM）
- 返回：`keywords`(总流量词)、`ranks`(自然排名词)、`ads`(广告词)、`calcTime`、`badgeCount{ns,ac,er,fs,hr,sb,sv,ad}`

### traffic_keyword（13 站，size 20/50/100）
- 必填：`asin`；选填：`keyword`(过滤)、**`month`(历史月份，可做排名月度对比)**、`page/size/order`
- `badges[]`：`NATURAL_SEARCHING`/`AMAZON_CHOICE`/`EDITORIAL_RECOMMENDATIONS`/`FOUR_STAR`/`SPONSOR_BRAND`/`SPONSOR_VIDEO`/`HIGHLY_RATED`/`ADS`
- `trafficKeywordTypes[]`：`PRIMARY`/`PRECISE`/`PRECISE_LONG_TAIL`
- `conversionKeywordTypes[]`：`EXCELLENT`/`STABLE`/`LOST`/`INVALID`
- 返回 items：`keyword/keywordCn/searches/products/purchases/purchaseRate/bid/bidMin/bidMax/badges/rankPosition/adPosition/searchesRank/latest1daysAds/latest7daysAds/latest30daysAds/supplyDemandRatio/trafficPercentage/trafficKeywordType/conversionKeywordType/calculatedWeeklySearches/titleDensity/spr/monopolyClickRate/top3ClickingRate/top3ConversionRate/clicks/impressions/naturalRatio/adRatio/topAsins/searchesTrend`
- 范围：近 30 天进入前台搜索结果**前 3 页**的词。

### traffic_extend（13 站，size 20/50/100）
- 必填：`asinList[]`(≤20)；选填：`historyDate`、`queryType`(0 所有变体/1 畅销变体/2 当前变体默认)、`amazonChoice`、`includeKeywords[]/excludeKeywords[]`
- 区间（min/max）：`Searches`、`SearchRank`、`Purchases`、`PurchaseRate`(0~1)、`Products`、`SupplyDemandRatio`、`Bid`、`AdProducts`、`AvgPrice`、`WordCount`、`SPR`、`TitleDensity`、`MonopolyClickRate`、`TrafficPercentage`、`ConversionRate`、`Competitors`
- 返回 items：`keyword/searches/products/purchases/purchaseRate/bid/searchesRank/latest*daysAds/supplyDemandRatio/trafficPercentage/avgPrice/avgRating/titleDensity/spr/monopolyClickRate/top3ClickingRate/top3ConversionRate/relationVariationsItems[{asin,trafficPercentage,title,price,reviews,rating}]`

### traffic_listing_stat（12 站）
- 必填：`asinList[]`；返回：`relations`、`freeRelations`、`paidRelations`、`calcTime`、`items[{relation,count}]`

### traffic_listing（12 站，size 20/50/100）
- 必填：`asinList[]`；选填：`relations[]`（空=全部）、`variations`(默认 true)、`page/size/order`
- relations：`VAV` 看了又看 / `CSI` 相似产品 / `AVP` 看了还看 / `BAV` 看了却买 / `MIB` 捆绑销售 / `FBT` 组合购买 / `MIE` 更多相关 / `BAB` 买了又买 / `COB` 品牌推荐 / `SP` 商品广告 / `FSA` 四星产品 / `BCA` 品牌广告
- 免费关联 vs 付费关联（SP/BCA）可判断对手是否在你的详情页投广告。
- 返回 items：`asin/title/price/units/revenue/bsr/ratings/rating/fulfillment/brand/sellerNation/badge{…}`

### ss_keyword_order（13 站，平铺，marketplace 无枚举）
- 必填：`marketplace`、`asins[]`(≤20)、`reverseType`(W/M)、`year`、`month`；`week`（W 模式必填）
- 选填：`conversionType`（逗号：E 优质/S 平稳/L 流失/I 无效）、`variation`(N 默认/Y)、`page/size/order`、`returnFields`(字符串)
- 回答"这个 ASIN 实际靠哪些词曝光和转化、转化结构在变好还是变差"。

### ss_keyword_research_trends（13 站）
- 必填：`keyword`；选填：`month`
- 返回：搜索量、购买量、购买率、同比、环比、近 3 月增长率的趋势序列（**无排名**）。

### ss_aba_research_trend（13 站）
- 必填：`keyword`；选填：`timeGranularity`(W/M)
- 返回：ABA 排名与搜索量趋势序列。

### ss_traffic_source（13 站，request 包裹）
- `request` 必填：`marketplace`、`q`（**ASIN 或关键词**）；选填：`month`、`page/size/order`、`returnFields`
- 返回：自然搜索 / 官方推荐（AC/ER 等）/ 广告（SP/SB/SV）的流量词分布与占比 + 商品基础信息。
- 传关键词时可看"这个词的流量被哪些来源、哪些 ASIN 拿走"。
- 示例：`{"request":{"marketplace":"US","q":"B07Z82895W"}}`

---

## D. 市场结构与竞争分布（13，request 包裹，13 站）

统一 `request`：`marketplace`(必填)、`nodeIdPath`(必填)、`month`、`topN`(默认10)、`newProduct`(月)、`returnFields`(字符串)；`ss_market_product_concentration` 额外支持 `asins[]`（把自己的 ASIN 放进样本对比位置）。

| 工具 | 用途 |
|------|------|
| `ss_market_research_statistics` | 综合统计：规模、头部 vs 新品的价格/销量/评价差距、利润率 |
| `ss_market_product_concentration` | 头部 Listing 明细 + 商品集中度 T/A |
| `ss_market_brand_concentration` | 品牌集中度 + **同级类目均值**对比 |
| `ss_market_seller_concentration` | 卖家集中度 + 同级类目对比 |
| `ss_market_seller_type_concentration` | AMZ/FBA/FBM 的 ASIN 占比、销量占比、评分 |
| `ss_market_seller_country_distribution` | 卖家国籍分布及销量占比 |
| `ss_market_price_distribution` | 价格区间商品数、销量占比、平均销量占比、区间评分 |
| `ss_market_rating_distribution` | 星级区间分布与销量效率 |
| `ss_market_ratings_count_distribution` | 评分数区间分布（新品评价门槛） |
| `ss_market_listing_date_distribution` | 上架**距今时长**分布（新品接受度） |
| `ss_market_listing_trend_distribution` | 上架**绝对时间**分布 + 区间平均评分（生命周期） |
| `ss_market_ebc_distribution` | A+ × 视频四象限的商品数与销量占比 |
| `ss_market_product_demand_trend` | 页面浏览量、商品总数、退货率与搜索购买比（含同类目均值） |

分级：**快筛**（statistics + product_concentration + price_distribution）→ **标准**（+ ratings_count + listing_date + seller_country）→ **深度**（全部 13）。

---

## E. 商标（4，不用 marketplace）

| 工具 | 形态 | 参数 |
|------|------|------|
| `ss_trademark_country_list` | 无参 | 返回 office 代码列表 |
| `ss_trademark_list` | request | `text`(必填，模糊多字段)、`brandName[]`、`applicant[]`、`applicationYear[]`、`expiryYear[]`、`niceClass[]`、`office[]`、`status[]`(Registered/Pending/Expired/Ended/Unknown)、`imageBase64`、`order{field:"applicationDate"}`、`page/size`、`returnFields` |
| `ss_trademark_stats` | request | `office[]`(必填)、`text`(必填)、`returnFields` |
| `ss_trademark_detail` | 平铺 | `office`(必填)、`brandId`(必填)、`returnFields` |

---

## F. returnFields 预设（直接复制）

| 预设名 | 适用工具 | 字段 |
|--------|---------|------|
| `ASIN_CORE` | competitor_lookup / product_research / asin_competitor | `["asin","brand","title","price","units","revenue","bsr","rating","ratings","ratingsCv","profit","fba","lqs","availableDate","sellers","sellerName","sellerNation","fulfillment","badge","nodeIdPath","variations"]` |
| `ASIN_LITE` | 同上（大批量） | `["asin","brand","price","units","revenue","bsr","rating","ratings","availableDate"]` |
| `SELLER_SCAN` | competitor_lookup(sellerName) | `["asin","title","units","revenue","price","ratings","bsr","nodeIdPath","nodeLabelPath","sellerId","fulfillment","availableDate","lqs"]` |
| `KW_MARKET` | keyword_research | `["keywords","searches","purchases","purchaseRate","growth","searchMonthlyCr","searchNearlyCr","supplyDemandRatio","products","araClickRate","bid","avgPrice","avgRatings","avgRating"]` |
| `KW_MINER` | keyword_miner | `["keyword","searches","purchases","purchaseRate","products","adProducts","supplyDemandRatio","monopolyClickRate","bid","spr","titleDensity","relevancy","wordCount"]` |
| `KW_ADS` | keyword_conversion | `["keyword","searches","searchConvRate","clickConvRate","clickingRate","exactPpc","exactCpa","exactAcos","broadAcos","avgProductPrice","top3Asins"]` |
| `TRAFFIC_KW` | traffic_keyword | `["keyword","searches","purchaseRate","bid","badges","rankPosition","adPosition","trafficPercentage","conversionKeywordType","naturalRatio","adRatio","latest7daysAds","spr"]` |
| `MARKET_SCAN` | market_research | `["nodeIdPath","nodeLabelName","nodeLabelLocale","totalUnits","avgUnits","avgPrice","avgRatings","avgRating","goodsCrn","brandCrn","monopolyRatio","newProportion","amazonSelfProportion","fbmProportion","returnRatio","avgReturnRatio","totalProducts"]` |
| `KEEPA_LITE` | ss_keepa_info | 先不传拉一次看字段名，再按需裁剪（字段名随上游变化）；务必 `dailyLatest=true` + 时间窗 |

---

## G. 错误速查

| code | 处理 |
|------|------|
| `OK` | 正常 |
| `BAD_REQUEST` | 按 message 修正参数 |
| `UPSTREAM_ERROR` | 按 `data.hint`：会话失效/配额耗尽 → 联系管理员；限流/超时/不可用 → 降频重试 |
| `INTERNAL_ERROR` | 友好降级，联系管理员 |
| JSON-RPC `-32601` | method 不存在 |
| JSON-RPC `-32602` | 必填缺失 / 工具名错误 / 站点、size、枚举排序字段越界 |
| JSON-RPC `-32001` | 缺少 API Key（客户端配置问题） |
| JSON-RPC `-32000` | 鉴权失败 / 限流 / 余额不足 |

## H. 高频参数陷阱

| 陷阱 | 正确做法 |
|------|----------|
| `keyword_miner` 用 `minSearches` | `minSearch`/`maxSearch` |
| `traffic_keyword` 想要 Top 却没传 desc | 默认升序，显式 `desc:true` |
| 用 `latest7daysAds`/`naturalRatio` 排序 | 不在枚举，报 -32602 |
| `traffic_listing` 用 snake_case 排序 | 只能 `relationCount`/`createdTime` |
| `market_research` 用 camelCase 排序 | 只能 snake_case 8 个值，否则静默失效 |
| 引用 `market_research.avgProfit/top3ProductSales` | 不返回，改用 `goodsCrn`/`monopolyRatio`，利润看 `product_research.profit` |
| 引用 `keyword_research.monopolyClickRate` | 不返回，用 `araClickRate` |
| `purchaseRate` 跨工具直接比较 | 先统一单位（§0.7） |
| `ss_traffic_source` / `ss_market_*` 参数平铺 | 包进 `request` |
| `ss_keyword_order` 包进 request 或漏 year/month | 平铺；year+month+reverseType 必填，W 需 week |
| `aba_research_weekly` 手算周六 | 只传 year+month+week |
| `bsr_prediction` 传小类排名 | 只接受一级类目 BSR；`bsr` 为整数 |
| 跨站沿用 nodeIdPath | 每站重新 `product_node` |
| 非英语站用英文词查 | 先翻译为当地语言 |
