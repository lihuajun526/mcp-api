一、mcp接口
输入参数和返回结果的格式参考下面的文档
https://open.sellersprite.com/api/3

【平台通用约定】
- 响应包裹：统一 {code, message, data}，失败时 data 含 hint 处理建议
- returnFields（可选）：按需返回字段，取值为 data.items 元素（或 data）的字段名，分页信息始终保留
- 错误码表：OK / BAD_REQUEST / UPSTREAM_ERROR / INTERNAL_ERROR，及 JSON-RPC 协议错误（-32602 等）
详见同目录《通用约定.md》。

二、第三方curl请求及响应如下
1、curl请求
curl 'https://www.sellersprite.com/v3/api/competing-lookup' \
  -H 'accept: application/json, text/plain, */*' \
  -H 'accept-language: zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6' \
  -H 'content-type: application/json;charset=UTF-8' \
  -b 'current_guest=TSEEMwXgYuyM_260624-120348; _gcl_au=1.1.1116324850.1782276663; ecookie=r7CzqaVJaOd05LKN_CN; _ga=GA1.1.2030963696.1782276671; MEIQIA_TRACK_ID=3FZJUu3FAkDLAuxM0hoevJ7fM8C; MEIQIA_VISIT_ID=3FZJUvKpwmPWyaw7vUWBY2KC0DL; _gaf_N1=9c2e81385f7b3e8bc3448b622a3f458a; ecookie=r7CzqaVJaOd05LKN_CN; 21c8438170385c35fdb8=ecfb71fbbfa8f2eac95c2744c928a248; JSESSIONID=49BA84046B73BF36228F54CB2194F9A7; _fp=60848e4a067452eec316b065fc3e1ffe; _gaf_fp=d8dd110f209cde891cfe573ce9866006; _clck=7rzy5e%5E2%5Eg7m%5E0%5E2366; rank-login-user=3757273871ksI2fB5I1Tqj8tgt0XeEr9hh62COuIH02JwEojze8riruX89TSg/fVRYoo0SOM/u; rank-login-user-info="eyJuaWNrbmFtZSI6IllZMDAxMjQwIiwiaXNBZG1pbiI6ZmFsc2UsImFjY291bnQiOiJZWTAwMTI0MCIsInRva2VuIjoiMzc1NzI3Mzg3MWtzSTJmQjVJMVRxajh0Z3QwWGVFcjloaDYyQ091SUgwMkp3RW9qemU4cmlydVg4OVRTZy9mVlJZb28wU09NL3UifQ=="; Sprite-X-Token=eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2Nzk5NjI2YmZlMDQzZTBiYzI5NTEwMTE4ODA3YWExIn0.eyJqdGkiOiJzcWlxZFBseFhEcHRwNUZDaGFoeTB3IiwiaWF0IjoxNzgzNjY5OTczLCJleHAiOjE3ODM3NTYzNzMsIm5iZiI6MTc4MzY2OTkxMywic3ViIjoieXVueWEiLCJpc3MiOiJyYW5rIiwiYXVkIjoic2VsbGVyU3BhY2UiLCJpZCI6MTg2OTkwNCwicGkiOjQzNTcyMiwibm4iOiJZWTAwMTI0MCIsInN5cyI6IlNTX0NOIiwiZWQiOiJOIiwiZW0iOiJZWTAwMTI0MEBzZWxsZXJzcHJpdGUuY29tIiwibWwiOiJTIiwiZW5kIjoxODA2MDQ3NTczNDU1fQ.IBBVynh7X1UlvZW7zy5XlU8l_eEUr_BYmUsXItuA3ug5Wo3LV89rVyPFzj6G8ogSqbYMIzxyhq-duo9PNbDyZfUJRuFjaZ_xsK7FBLmeIrQyzvW1e6CSSaD0F4jJcO81bQAUSsJRuoZ6i099tRczs25EvZ0I3Kji3n1_BBzYzoF4YXgrDTyV7r1EHBpSKOMVOR3_h9d1_i13OzzL3WatfyCp7OGNsCQrTlasriyCNIpGIOeGjw7N0z-HVXV8fBsBehCBBxRY8WStwXu183k_I_FRfmAC6G7ZKqEhhYOSUpg5hkeUbkyM25K4m_RqNHe5OFJdhhqoX_cZJHApvZHEyA; ao_lo_to_n="3757273871ksI2fB5I1Tqj8tgt0XeErw/lmFiIc02cVAaHbDcVWNMPyni4ZH/Wb+Lcln51lxnYtvH44FcuW+2q2q2GFZKJAAx7+HLuXHVjoaAS4Zj4I8M="; Hm_lvt_e0dfc78949a2d7c553713cb5c573a486=1782276660,1783669977; Hm_lpvt_e0dfc78949a2d7c553713cb5c573a486=1783669977; HMACCOUNT=39BD546C157B51DC; _ga_38NCVF2XST=GS2.1.s1783669969$o5$g1$t1783670046$j43$l0$h265952408; _ga_CN0F80S6GL=GS2.1.s1783669970$o5$g1$t1783670046$j59$l0$h0; _clsk=j9sizz%5E1783670048733%5E6%5E0%5Ei.clarity.ms%2Fcollect' \
  -H 'origin: https://www.sellersprite.com' \
  -H 'priority: u=1, i' \
  -H 'referer: https://www.sellersprite.com/v3/competitor-lookup?market=US&monthName=bsr_sales_nearly&asins=%5B%22B0GYPQ75WH%22%5D&page=1&nodeIdPaths=%5B%5D&symbolFlag=false&size=60&order%5Bfield%5D=amz_unit&order%5Bdesc%5D=true&lowPrice=N&salesGrowthType=30d' \
  -H 'sec-ch-ua: "Not;A=Brand";v="8", "Chromium";v="150", "Microsoft Edge";v="150"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: same-origin' \
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0' \
  --data-raw '{"market":"US","monthName":"bsr_sales_nearly","asins":["B0GYPQ75WH"],"page":1,"nodeIdPaths":[],"symbolFlag":true,"size":60,"order":{"field":"amz_unit","desc":true},"lowPrice":"N"}'

2、响应结果
{
    "code": "OK",
    "message": "成功",
    "data": {
        "guestId": null,
        "pages": 1,
        "page": 1,
        "size": 60,
        "total": 1,
        "took": 0,
        "url": null,
        "order": {
            "field": "",
            "desc": true
        },
        "items": [
            {
                "guestId": null,
                "pages": 0,
                "page": 0,
                "size": null,
                "total": 0,
                "took": 0,
                "url": null,
                "order": {
                    "field": "",
                    "desc": true
                },
                "items": null,
                "terminal": null,
                "hasNextPage": null,
                "id": "USB00MNV8E0C",
                "marketId": 1,
                "station": "GLOBAL",
                "monthId": null,
                "monthName": null,
                "table": null,
                "category1Id": null,
                "category1Name": null,
                "nodeId": 389577011,
                "nodeIdPath": "3760901:15342811:15745581:389577011",
                "nodeLabelPath": "Health & Household:Household Supplies:Household Batteries:AA",
                "nodeLabelLocale": "AA",
                "nodeLabelPathLocale": "健康与家居:家居用品:家用电池:AA",
                "asin": "B00MNV8E0C",
                "channel": "S",
                "alias": "B00MNV8E0C",
                "symbol": "Y",
                "title0": null,
                "brand0": null,
                "brandShort": null,
                "amzUnit": 100000,
                "amzUnitDate": 1782526603000,
                "amzUnitTrend": "{\"202405\":100000,\"202406\":100000,\"202407\":100000,\"202408\":100000,\"202409\":100000,\"202410\":100000,\"202411\":100000,\"202412\":100000,\"202501\":100000,\"202502\":100000,\"202503\":100000,\"202504\":100000,\"202505\":100000,\"202506\":100000,\"202507\":100000,\"202508\":100000,\"202509\":100000,\"202510\":100000,\"202511\":100000,\"202512\":100000,\"202601\":100000,\"202602\":100000,\"202603\":100000,\"202604\":100000,\"202605\":90000}",
                "totalAmount": 4700674.0,
                "fbaAmount": null,
                "totalUnits": 384042,
                "fbaUnits": null,
                "averagePrice": 15.29,
                "totalAmountRank": null,
                "impression": null,
                "conversionRate": null,
                "totalAmountGrowth": 12.15,
                "totalUnitsGrowth": 12.15,
                "totalUnitsGrowthYoy": null,
                "totalUnitsGrowthYoyLag1": null,
                "totalUnitsGrowthYoyLag2": null,
                "totalUnitsGrowthYoyLag3": null,
                "totalUnitsGrowthYoyLag4": null,
                "totalUnitsGrowthYoyLag5": null,
                "salesTrend": "{\"202509\":171333,\"202507\":426324,\"202606\":381720,\"202508\":224092,\"202505\":261880,\"202604\":317092,\"202506\":306352,\"202605\":355629,\"202602\":337944,\"202603\":366156,\"202512\":400479,\"202601\":356704,\"202510\":207067,\"202511\":187012}",
                "createdTime": null,
                "updatedTime": 1782489600000,
                "syncTime": 1782526738406,
                "categoryId": "hpc",
                "categoryName": "Health & Household",
                "title": "Amazon Basics 48-Pack AA Alkaline High-Performance Batteries, 1.5 Volt, 10-Year Shelf Life, Long-lasting, No Leakage",
                "asinUrl": null,
                "imageUrl": "https://m.media-amazon.com/images/I/81iJ+tnLADL._AC_US200_.jpg",
                "videoUrl": null,
                "video": "N",
                "ebc": "Y",
                "lqs": 100,
                "price": 15.29,
                "primeExclusivePrice": -1.0,
                "coupon": "",
                "deliveryPrice": -1.0,
                "rating": 4.7,
                "reviews": 943125,
                "questions": 326,
                "availableDate": 1499375640000,
                "availableYear": 9,
                "availableMonth": 0,
                "availableDays": 3288,
                "firstReviewDate": 1499375640000,
                "publishDate": null,
                "bsrRank": 4,
                "bsrId": "hpc",
                "bsrLabel": "Health & Household",
                "bsrRankCv": -1,
                "bsrRankCr": -33.33,
                "brand": "Amazon Basics",
                "brandUrl": "/stores/AmazonBasics/page/947C6949-CF8E-4BD3-914A-B411DD3E4433?lp_asin=B00MNV8E0C&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto",
                "dimensions": "6 x 2.3 x 1 inches",
                "dimensionType": "LS",
                "weight": "0.05 pounds",
                "pkgDimensions": "7.2 x 4.3 x 1.3 inches",
                "pkgDimensionType": "LS",
                "pkgWeight": "2.6 pounds",
                "pkgVolumeWeights": 131.33939,
                "overviews": "{\"Brand\":\"Amazon Basics\",\"Battery Cell Composition\":\"Alkaline\",\"Battery Capacity\":\"2875\",\"Recommended Uses For Product\":\"Camera, Clock\",\"Unit Count\":\"48 Count\"}",
                "sellerId": "",
                "sellerName": "Amazon",
                "sellerType": "AMZ",
                "sellerNation": "US",
                "sellers": 1,
                "amazonChoice": "Amazon's Choice",
                "bestSeller": "#1 Best Seller  in AA Batteries",
                "newRelease": null,
                "estimatedSales": null,
                "parent": "B0CQMQ6XDB",
                "variations": 7,
                "variationAsin": null,
                "sku": "Size: 48 Count (Pack of 1)",
                "fba": 6.34,
                "profit": 33.2,
                "trends": [
                    {
                        "dk": "202505",
                        "sales": 261880
                    },
                    {
                        "dk": "202506",
                        "sales": 306352
                    },
                    {
                        "dk": "202507",
                        "sales": 426324
                    },
                    {
                        "dk": "202508",
                        "sales": 224092
                    },
                    {
                        "dk": "202509",
                        "sales": 171333
                    },
                    {
                        "dk": "202510",
                        "sales": 207067
                    },
                    {
                        "dk": "202511",
                        "sales": 187012
                    },
                    {
                        "dk": "202512",
                        "sales": 400479
                    },
                    {
                        "dk": "202601",
                        "sales": 356704
                    },
                    {
                        "dk": "202602",
                        "sales": 337944
                    },
                    {
                        "dk": "202603",
                        "sales": 366156
                    },
                    {
                        "dk": "202604",
                        "sales": 317092
                    },
                    {
                        "dk": "202605",
                        "sales": 355629
                    },
                    {
                        "dk": "202606",
                        "sales": 381720
                    }
                ],
                "amzUnitTrends": [
                    {
                        "dk": "202405",
                        "sales": 100000
                    },
                    {
                        "dk": "202406",
                        "sales": 100000
                    },
                    {
                        "dk": "202407",
                        "sales": 100000
                    },
                    {
                        "dk": "202408",
                        "sales": 100000
                    },
                    {
                        "dk": "202409",
                        "sales": 100000
                    },
                    {
                        "dk": "202410",
                        "sales": 100000
                    },
                    {
                        "dk": "202411",
                        "sales": 100000
                    },
                    {
                        "dk": "202412",
                        "sales": 100000
                    },
                    {
                        "dk": "202501",
                        "sales": 100000
                    },
                    {
                        "dk": "202502",
                        "sales": 100000
                    },
                    {
                        "dk": "202503",
                        "sales": 100000
                    },
                    {
                        "dk": "202504",
                        "sales": 100000
                    },
                    {
                        "dk": "202505",
                        "sales": 100000
                    },
                    {
                        "dk": "202506",
                        "sales": 100000
                    },
                    {
                        "dk": "202507",
                        "sales": 100000
                    },
                    {
                        "dk": "202508",
                        "sales": 100000
                    },
                    {
                        "dk": "202509",
                        "sales": 100000
                    },
                    {
                        "dk": "202510",
                        "sales": 100000
                    },
                    {
                        "dk": "202511",
                        "sales": 100000
                    },
                    {
                        "dk": "202512",
                        "sales": 100000
                    },
                    {
                        "dk": "202601",
                        "sales": 100000
                    },
                    {
                        "dk": "202602",
                        "sales": 100000
                    },
                    {
                        "dk": "202603",
                        "sales": 100000
                    },
                    {
                        "dk": "202604",
                        "sales": 100000
                    },
                    {
                        "dk": "202605",
                        "sales": 90000
                    }
                ],
                "reviewsDelta": 0,
                "reviewsRate": 1.32,
                "reviewsIncreasement": 5086,
                "profitDto": null,
                "sellerDto": null,
                "subSalesRank": null,
                "curMon": false,
                "curMonDaysales": null,
                "subcategories": [
                    {
                        "code": "389577011",
                        "rank": 1,
                        "label": "AA Batteries"
                    }
                ],
                "parentChangeHis": [],
                "source": null,
                "dimensionsTag": "15.24 x 5.84 x 2.54 cm",
                "pkgDimensionsTag": "18.29 x 10.92 x 3.30 cm",
                "weightTag": "22.68 g",
                "pkgWeightTag": "1.18 kg",
                "bigImageUrl": "https://images-na.ssl-images-amazon.com/images/I/81iJ+tnLADL._AC_US600_.jpg",
                "liked": false,
                "subTotalAmount": 1529000.0,
                "monDailySales": "",
                "guestVisited": false
            }
        ],
        "terminal": null,
        "hasNextPage": null,
        "symbolChecked": false,
        "guestVisited": false
    },
    "success": true
}