一、mcp接口
输入参数和返回结果的格式参考下面的文档
https://open.sellersprite.com/api/62

【平台通用约定】
- 响应包裹：统一 {code, message, data}，失败时 data 含 hint 处理建议
- returnFields（可选）：按需返回字段，取值为 data.items 元素（或 data）的字段名，分页信息始终保留
- 错误码表：OK / BAD_REQUEST / UPSTREAM_ERROR / INTERNAL_ERROR，及 JSON-RPC 协议错误（-32602 等）
详见同目录《通用约定.md》。

二、第三方curl请求及响应如下
1、curl请求
curl --url 'https://www.sellersprite.com/v3/api/competing-lookup' \
  -H 'accept: application/json, text/plain, */*' \
  -H 'accept-language: zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6' \
  -H 'content-type: application/json;charset=UTF-8' \
  -b 'current_guest=hvwrrJISKaPA_260830-222014; Hm_lvt_e0dfc78949a2d7c553713cb5c573a486=1788099049; HMACCOUNT=C5618A56F61A870A; _ga=GA1.1.399313004.1788099049; _gcl_au=1.1.376940756.1788099049; cjConsent=MHxOfDB8Tnww; cjUser=82fe5143-515a-450d-8925-fa7d1d890e75; MEIQIA_TRACK_ID=3IdeoxgBSesmeY6Km8tlAVV98Rw; MEIQIA_VISIT_ID=3Idep15i7r6HC96BHu8GJTDEv2i; cd78a1d7fc5218a1a3ec=09601e9f1a910c9f8784435e946b74aa; _fp=60848e4a067452eec316b065fc3e1ffe; _gaf_fp=412d1af9e741c199cb66a90312380c57; rank-login-user=1766518871qrvbGyHJO0R5NAd5dYk3ivVyEoSdK9Prxqlf8B5LvZC4r1F84ksj1eqj4DiNYdXM; rank-login-user-info=eyJuaWNrbmFtZSI6ImFtejAxMDEiLCJpc0FkbWluIjpmYWxzZSwiYWNjb3VudCI6IjE3OCoqKio3MDk3IiwidG9rZW4iOiIxNzY2NTE4ODcxcXJ2Ykd5SEpPMFI1TkFkNWRZazNpdlZ5RW9TZEs5UHJ4cWxmOEI1THZaQzRyMUY4NGtzajFlcWo0RGlOWWRYTSJ9; Sprite-X-Token=eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2Nzk5NjI2YmZlMDQzZTBiYzI5NTEwMTE4ODA3YWExIn0.eyJqdGkiOiJjczdZRi1KVVpqVDRuM2lhRk5uc0V3IiwiaWF0IjoxNzg4MDk5MDcxLCJleHAiOjE3ODgxODU0NzEsIm5iZiI6MTc4ODA5OTAxMSwic3ViIjoieXVueWEiLCJpc3MiOiJyYW5rIiwiYXVkIjoic2VsbGVyU3BhY2UiLCJpZCI6NDM1NzIyLCJwaSI6bnVsbCwibm4iOiJhbXowMTAxIiwic3lzIjoiU1NfQ04iLCJlZCI6Ik4iLCJwaG4iOiIxNzg5NTYwNzA5NyIsImVtIjoiYW16MDEwMUBzZWxsZXJzcHJpdGUuY29tIiwibWwiOiJTIiwiZW5kIjoxODA2MDcwMjcxNzA1fQ.WtFQJgTQ1bCYB1r3-GBSQAFGuVMpGEZiiopOIENorqBSUwAyqx9GZomkRCupzPXvNZVVPIXNwmE-PYzvuKc0CpassoDPeV1m-p0iYbsL1NHw_OppGKdCVosQi1TnmxOBrji2IMUtthSTtS1oESBnNNlaenA9xblW7SLwPL-sIo79rs64X5yEbuY1a8kv8rSUTm28esVfDaYEuHexXIHab0laDY6iY-L4Bhj_y6bg0advVygGjwxVc2kn7MHAmEQd_JU0DZzotoNGo5fGe8fJAoo22PJbOO2OyiYyDc0vfVoK2uPYPiQ-NoMTPl_S5RaR_tIry-W6vVNKumTF5pH84g; ao_lo_to_n="1766518871qrvbGyHJO0R5NAd5dYk3iou2grXlY0G4j0hGAhmAE8GhzYQw0eQL2uAgXVwQGrlvzs3EnbcftcazS6VNzBsf8luG+y0YPrz9l3VbFmo999c="; _clck=1s7pnp1%5E2%5Eg92%5E0%5E2433; ecookie=eOVNfTHJHe21932j_CN; p_c_size=50; JSESSIONID=5DB0DBE4A7F1662E0B5D9D95C8954034; Hm_lpvt_e0dfc78949a2d7c553713cb5c573a486=1788137613; _ga_CN0F80S6GL=GS2.1.s1788160147$o3$g1$t1788161206$j9$l0$h0; _ga_38NCVF2XST=GS2.1.s1788160147$o3$g1$t1788161332$j54$l0$h866420427; _clsk=dspmkc%5E1788161332467%5E13%5E1%5En.clarity.ms%2Fcollect' \
  -H 'origin: https://www.sellersprite.com' \
  -H 'priority: u=1, i' \
  -H 'referer: https://www.sellersprite.com/v3/competitor-lookup?market=US&monthName=bsr_sales_nearly&asins=%5B%22B0D5BMFK9S%22%5D&page=1&nodeIdPaths=%5B%5D&symbolFlag=true&size=20&order%5Bfield%5D=total_units&order%5Bdesc%5D=true&lowPrice=N&salesGrowthType=30d' \
  -H 'sec-ch-ua: "Not=A?Brand";v="99", "Microsoft Edge";v="151", "Chromium";v="151"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: same-origin' \
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0' \
  --data-raw '{"market":"US","monthName":"bsr_sales_nearly","asins":["B0D5BMFK9S"],"page":1,"nodeIdPaths":[],"symbolFlag":false,"size":20,"order":{"field":"total_units","desc":true},"lowPrice":"N"}'

2、响应结果
{
    "code": "OK",
    "message": "成功",
    "data": {
        "guestId": null,
        "pages": 1,
        "page": 1,
        "size": 20,
        "total": 7,
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
                "id": "USB0CQ4Q4S3B",
                "marketId": 1,
                "station": "GLOBAL",
                "monthId": null,
                "monthName": null,
                "table": null,
                "category1Id": null,
                "category1Name": null,
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "nodeLabelLocale": "家庭办公桌",
                "nodeLabelPathLocale": "家居用品:家具:家庭办公家具:家庭办公桌",
                "asin": "B0CQ4Q4S3B",
                "channel": "S",
                "alias": "B0CQ4Q4S3B",
                "symbol": "N",
                "title0": null,
                "brand0": null,
                "brandShort": null,
                "amzUnit": 1000,
                "amzUnitDate": 1788150122000,
                "amzUnitTrend": "{\"202407\":900,\"202408\":2000,\"202409\":1000,\"202410\":1000,\"202411\":2000,\"202412\":900,\"202501\":500,\"202502\":800,\"202503\":900,\"202504\":700,\"202505\":400,\"202506\":800,\"202507\":1000,\"202508\":1000,\"202509\":900,\"202510\":1000,\"202511\":1000,\"202512\":1000,\"202601\":800,\"202602\":700,\"202603\":800,\"202604\":600,\"202605\":300,\"202606\":700,\"202607\":600}",
                "totalAmount": 418891.2,
                "fbaAmount": null,
                "totalUnits": 5880,
                "fbaUnits": null,
                "averagePrice": 71.24,
                "totalAmountRank": null,
                "impression": null,
                "conversionRate": null,
                "totalAmountGrowth": 15.29,
                "totalUnitsGrowth": 15.29,
                "totalUnitsGrowthYoy": 38.71,
                "totalUnitsGrowthYoyLag1": -34.73,
                "totalUnitsGrowthYoyLag2": 19.33,
                "totalUnitsGrowthYoyLag3": 9.88,
                "totalUnitsGrowthYoyLag4": 36.6,
                "totalUnitsGrowthYoyLag5": 5.32,
                "salesTrend": "{\"202509\":3095,\"202608\":6045,\"202408\":4033,\"202507\":4264,\"202606\":2414,\"202409\":2238,\"202508\":4239,\"202607\":2783,\"202505\":1285,\"202604\":1896,\"202407\":1775,\"202506\":2023,\"202605\":1412,\"202503\":1972,\"202602\":2201,\"202504\":1388,\"202603\":2077,\"202501\":1334,\"202502\":2001,\"202601\":1841,\"202410\":2945,\"202512\":2484,\"202411\":4187,\"202510\":2782,\"202412\":1613,\"202511\":3411}",
                "createdTime": null,
                "updatedTime": 1788105600000,
                "syncTime": 1788150320000,
                "categoryId": "home-garden",
                "categoryName": "Home & Kitchen",
                "title": "Lufeiya White Desk with File Drawers Cabinet, 47 Inch Reversible Computer Desk with Fabric Filing Cabinet for Bedroom Small Space Home Office, Modern Writing Table PC Desks, White",
                "asinUrl": null,
                "imageUrl": "https://m.media-amazon.com/images/I/31hD++OJr5L._AC_US200_.jpg",
                "videoUrl": null,
                "video": "N",
                "ebc": "Y",
                "lqs": 100,
                "price": 71.24,
                "primeExclusivePrice": -1.0,
                "coupon": "",
                "deliveryPrice": -1.0,
                "rating": 4.4,
                "reviews": 2338,
                "questions": null,
                "availableDate": 1704530880000,
                "availableYear": 2,
                "availableMonth": 7,
                "availableDays": 967,
                "firstReviewDate": 1709568000000,
                "publishDate": null,
                "bsrRank": 3863,
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRankCv": -29,
                "bsrRankCr": -0.76,
                "brand": "Lufeiya",
                "brandUrl": "/stores/LUFEIYA/page/286014F1-E7F9-4883-9C03-6BD4FA62A3EE?lp_asin=B0CQ4Q4S3B&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto",
                "dimensions": "46.6\"D x 19.7\"W x 29.5\"H",
                "dimensionType": "EL15O",
                "weight": "30.8 pounds",
                "pkgDimensions": "34.6 x 21.4 x 3.6 inches",
                "pkgDimensionType": "SB",
                "pkgWeight": "30.9 pounds",
                "pkgVolumeWeights": 8158.1943,
                "overviews": "{\"Brand\":\"Lufeiya\",\"Shape\":\"Rectangular\",\"Desk design\":\"Computer Desk, Writing Desk\",\"Product Dimensions\":\"46.6\\\"D x 19.7\\\"W x 29.5\\\"H\",\"Color\":\"White\",\"Style\":\"Modern\",\"Base Material\":\"Metal\",\"Top Material Type\":\"Tabletop made of FSC-Certified Wood\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Reversible\"}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerType": "FBA",
                "sellerNation": "CN",
                "sellers": 2,
                "amazonChoice": "Amazon's Choice",
                "bestSeller": null,
                "newRelease": "#1 New Release  in Home Office Desks",
                "estimatedSales": null,
                "parent": "B0D93D2G2W",
                "variations": 7,
                "variationAsin": null,
                "sku": "Color: White | Size: 46.6\"",
                "fba": 19.61,
                "profit": 57.47,
                "trends": [
                    {
                        "dk": "202407",
                        "sales": 1775
                    },
                    {
                        "dk": "202408",
                        "sales": 4033
                    },
                    {
                        "dk": "202409",
                        "sales": 2238
                    },
                    {
                        "dk": "202410",
                        "sales": 2945
                    },
                    {
                        "dk": "202411",
                        "sales": 4187
                    },
                    {
                        "dk": "202412",
                        "sales": 1613
                    },
                    {
                        "dk": "202501",
                        "sales": 1334
                    },
                    {
                        "dk": "202502",
                        "sales": 2001
                    },
                    {
                        "dk": "202503",
                        "sales": 1972
                    },
                    {
                        "dk": "202504",
                        "sales": 1388
                    },
                    {
                        "dk": "202505",
                        "sales": 1285
                    },
                    {
                        "dk": "202506",
                        "sales": 2023
                    },
                    {
                        "dk": "202507",
                        "sales": 4264
                    },
                    {
                        "dk": "202508",
                        "sales": 4239
                    },
                    {
                        "dk": "202509",
                        "sales": 3095
                    },
                    {
                        "dk": "202510",
                        "sales": 2782
                    },
                    {
                        "dk": "202511",
                        "sales": 3411
                    },
                    {
                        "dk": "202512",
                        "sales": 2484
                    },
                    {
                        "dk": "202601",
                        "sales": 1841
                    },
                    {
                        "dk": "202602",
                        "sales": 2201
                    },
                    {
                        "dk": "202603",
                        "sales": 2077
                    },
                    {
                        "dk": "202604",
                        "sales": 1896
                    },
                    {
                        "dk": "202605",
                        "sales": 1412
                    },
                    {
                        "dk": "202606",
                        "sales": 2414
                    },
                    {
                        "dk": "202607",
                        "sales": 2783
                    },
                    {
                        "dk": "202608",
                        "sales": 6045
                    }
                ],
                "amzUnitTrends": [
                    {
                        "dk": "202407",
                        "sales": 900
                    },
                    {
                        "dk": "202408",
                        "sales": 2000
                    },
                    {
                        "dk": "202409",
                        "sales": 1000
                    },
                    {
                        "dk": "202410",
                        "sales": 1000
                    },
                    {
                        "dk": "202411",
                        "sales": 2000
                    },
                    {
                        "dk": "202412",
                        "sales": 900
                    },
                    {
                        "dk": "202501",
                        "sales": 500
                    },
                    {
                        "dk": "202502",
                        "sales": 800
                    },
                    {
                        "dk": "202503",
                        "sales": 900
                    },
                    {
                        "dk": "202504",
                        "sales": 700
                    },
                    {
                        "dk": "202505",
                        "sales": 400
                    },
                    {
                        "dk": "202506",
                        "sales": 800
                    },
                    {
                        "dk": "202507",
                        "sales": 1000
                    },
                    {
                        "dk": "202508",
                        "sales": 1000
                    },
                    {
                        "dk": "202509",
                        "sales": 900
                    },
                    {
                        "dk": "202510",
                        "sales": 1000
                    },
                    {
                        "dk": "202511",
                        "sales": 1000
                    },
                    {
                        "dk": "202512",
                        "sales": 1000
                    },
                    {
                        "dk": "202601",
                        "sales": 800
                    },
                    {
                        "dk": "202602",
                        "sales": 700
                    },
                    {
                        "dk": "202603",
                        "sales": 800
                    },
                    {
                        "dk": "202604",
                        "sales": 600
                    },
                    {
                        "dk": "202605",
                        "sales": 300
                    },
                    {
                        "dk": "202606",
                        "sales": 700
                    },
                    {
                        "dk": "202607",
                        "sales": 600
                    }
                ],
                "reviewsDelta": 0,
                "reviewsRate": 1.77,
                "reviewsIncreasement": 104,
                "profitDto": null,
                "sellerDto": {
                    "sellerId": "A1G57VOI7NPB74",
                    "station": "US",
                    "shortName": "Lufeiya",
                    "businessName": "Xiamen Lufeiya Technology Co., LTD.",
                    "businessType": null,
                    "tradeNumber": null,
                    "vatNumber": null,
                    "phone": "",
                    "customerAddress": null,
                    "businessAddress": "火炬高新区火炬园",
                    "nation": "CN",
                    "capital": null,
                    "manger": null,
                    "about": null,
                    "email": null,
                    "nationName": "中国",
                    "rating": 5.0,
                    "positive": 99,
                    "reviews": 408,
                    "products": 39,
                    "feedback": {
                        "days30Count": null,
                        "days30Negative": null,
                        "days30Neutral": null,
                        "days30Positive": null,
                        "days90Count": null,
                        "days90Negative": null,
                        "days90Neutral": null,
                        "days90Positive": null,
                        "lifetimeCount": null,
                        "lifetimeNegative": null,
                        "lifetimeNeutral": null,
                        "lifetimePositive": null,
                        "month12Count": null,
                        "month12Negative": null,
                        "month12Neutral": null,
                        "month12Positive": null
                    },
                    "updateTime": 1788156707014,
                    "syncProductTime": 1787988183128,
                    "simplify": true
                },
                "subSalesRank": null,
                "curMon": false,
                "curMonDaysales": null,
                "subcategories": [
                    {
                        "code": "3733671",
                        "rank": 7,
                        "label": "Home Office Desks"
                    }
                ],
                "parentChangeHis": [],
                "source": null,
                "dimensionsTag": "118.36 x 50.04 x 74.93 cm",
                "pkgDimensionsTag": "87.88 x 54.36 x 9.14 cm",
                "weightTag": "13.97 kg",
                "pkgWeightTag": "14.02 kg",
                "bigImageUrl": "https://m.media-amazon.com/images/I/31hD++OJr5L._AC_US600_.jpg",
                "liked": false,
                "subTotalAmount": 71240.0,
                "monDailySales": "",
                "guestVisited": false
            },
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
                "id": "USB0CQ4STXZR",
                "marketId": 1,
                "station": "GLOBAL",
                "monthId": null,
                "monthName": null,
                "table": null,
                "category1Id": null,
                "category1Name": null,
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "nodeLabelLocale": "家庭办公桌",
                "nodeLabelPathLocale": "家居用品:家具:家庭办公家具:家庭办公桌",
                "asin": "B0CQ4STXZR",
                "channel": "S",
                "alias": "B0CQ4STXZR",
                "symbol": "N",
                "title0": null,
                "brand0": null,
                "brandShort": null,
                "amzUnit": 500,
                "amzUnitDate": 1788147072000,
                "amzUnitTrend": "{\"202407\":200,\"202408\":1000,\"202409\":900,\"202410\":700,\"202411\":900,\"202412\":400,\"202501\":200,\"202502\":300,\"202503\":200,\"202504\":100,\"202505\":100,\"202506\":300,\"202507\":500,\"202508\":500,\"202509\":500,\"202510\":300,\"202511\":400,\"202512\":400,\"202601\":100,\"202602\":200,\"202603\":200,\"202604\":100,\"202605\":50,\"202606\":200,\"202607\":300}",
                "totalAmount": 470341.2,
                "fbaAmount": null,
                "totalUnits": 5880,
                "fbaUnits": null,
                "averagePrice": 79.99,
                "totalAmountRank": null,
                "impression": null,
                "conversionRate": null,
                "totalAmountGrowth": 15.29,
                "totalUnitsGrowth": 15.29,
                "totalUnitsGrowthYoy": 38.71,
                "totalUnitsGrowthYoyLag1": -34.73,
                "totalUnitsGrowthYoyLag2": 19.33,
                "totalUnitsGrowthYoyLag3": 9.88,
                "totalUnitsGrowthYoyLag4": 36.6,
                "totalUnitsGrowthYoyLag5": 5.32,
                "salesTrend": "{\"202509\":3095,\"202608\":6045,\"202408\":4033,\"202507\":4264,\"202606\":2414,\"202409\":2238,\"202508\":4239,\"202607\":2783,\"202505\":1285,\"202604\":1896,\"202407\":1775,\"202506\":2023,\"202605\":1412,\"202503\":1972,\"202602\":2201,\"202504\":1388,\"202603\":2077,\"202501\":1334,\"202502\":2001,\"202601\":1841,\"202410\":2945,\"202512\":2484,\"202411\":4187,\"202510\":2782,\"202412\":1613,\"202511\":3411}",
                "createdTime": null,
                "updatedTime": 1788105600000,
                "syncTime": 1788150320000,
                "categoryId": "home-garden",
                "categoryName": "Home & Kitchen",
                "title": "Lufeiya Computer Desk with File Drawers Cabinet, 47 Inch Reversible Home Office Desks with Fabric Filing Cabinet for Small Space, Study Writing Table PC Desks, Rustic Brown",
                "asinUrl": null,
                "imageUrl": "https://m.media-amazon.com/images/I/41QFkBW9VqL._AC_US200_.jpg",
                "videoUrl": null,
                "video": "N",
                "ebc": "Y",
                "lqs": 100,
                "price": 79.99,
                "primeExclusivePrice": -1.0,
                "coupon": "",
                "deliveryPrice": -1.0,
                "rating": 4.4,
                "reviews": 2338,
                "questions": null,
                "availableDate": 1704486960000,
                "availableYear": 2,
                "availableMonth": 7,
                "availableDays": 968,
                "firstReviewDate": 1709568000000,
                "publishDate": null,
                "bsrRank": 3863,
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRankCv": -29,
                "bsrRankCr": -0.76,
                "brand": "Lufeiya",
                "brandUrl": "/stores/LUFEIYA/page/286014F1-E7F9-4883-9C03-6BD4FA62A3EE?lp_asin=B0CQ4STXZR&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto",
                "dimensions": "19.7\"D x 46.6\"W x 29.5\"H",
                "dimensionType": "EL15O",
                "weight": "31.5 pounds",
                "pkgDimensions": "34.6 x 21.1 x 3.9 inches",
                "pkgDimensionType": "SB",
                "pkgWeight": "31.61 pounds",
                "pkgVolumeWeights": 8158.1943,
                "overviews": "{\"Brand\":\"Lufeiya\",\"Top Material Type\":\"Tabletop made of FSC-Certified Wood\",\"Base Color\":\"Black\",\"Storage Options\":\"[{'file_drawer': 1}, {'small_drawers': 2}]\",\"Shape\":\"Rectangular\",\"Desk design\":\"Computer Desk, Writing Desk\",\"Product Dimensions\":\"19.7\\\"D x 46.6\\\"W x 29.5\\\"H\",\"Color\":\"Rustic Brown\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\"}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerType": "FBA",
                "sellerNation": "CN",
                "sellers": 1,
                "amazonChoice": "Amazon's Choice",
                "bestSeller": null,
                "newRelease": null,
                "estimatedSales": null,
                "parent": "B0D93D2G2W",
                "variations": 7,
                "variationAsin": null,
                "sku": "Color: Rustic Brown | Size: 46.6\"",
                "fba": 20.01,
                "profit": 59.99,
                "trends": [
                    {
                        "dk": "202407",
                        "sales": 1775
                    },
                    {
                        "dk": "202408",
                        "sales": 4033
                    },
                    {
                        "dk": "202409",
                        "sales": 2238
                    },
                    {
                        "dk": "202410",
                        "sales": 2945
                    },
                    {
                        "dk": "202411",
                        "sales": 4187
                    },
                    {
                        "dk": "202412",
                        "sales": 1613
                    },
                    {
                        "dk": "202501",
                        "sales": 1334
                    },
                    {
                        "dk": "202502",
                        "sales": 2001
                    },
                    {
                        "dk": "202503",
                        "sales": 1972
                    },
                    {
                        "dk": "202504",
                        "sales": 1388
                    },
                    {
                        "dk": "202505",
                        "sales": 1285
                    },
                    {
                        "dk": "202506",
                        "sales": 2023
                    },
                    {
                        "dk": "202507",
                        "sales": 4264
                    },
                    {
                        "dk": "202508",
                        "sales": 4239
                    },
                    {
                        "dk": "202509",
                        "sales": 3095
                    },
                    {
                        "dk": "202510",
                        "sales": 2782
                    },
                    {
                        "dk": "202511",
                        "sales": 3411
                    },
                    {
                        "dk": "202512",
                        "sales": 2484
                    },
                    {
                        "dk": "202601",
                        "sales": 1841
                    },
                    {
                        "dk": "202602",
                        "sales": 2201
                    },
                    {
                        "dk": "202603",
                        "sales": 2077
                    },
                    {
                        "dk": "202604",
                        "sales": 1896
                    },
                    {
                        "dk": "202605",
                        "sales": 1412
                    },
                    {
                        "dk": "202606",
                        "sales": 2414
                    },
                    {
                        "dk": "202607",
                        "sales": 2783
                    },
                    {
                        "dk": "202608",
                        "sales": 6045
                    }
                ],
                "amzUnitTrends": [
                    {
                        "dk": "202407",
                        "sales": 200
                    },
                    {
                        "dk": "202408",
                        "sales": 1000
                    },
                    {
                        "dk": "202409",
                        "sales": 900
                    },
                    {
                        "dk": "202410",
                        "sales": 700
                    },
                    {
                        "dk": "202411",
                        "sales": 900
                    },
                    {
                        "dk": "202412",
                        "sales": 400
                    },
                    {
                        "dk": "202501",
                        "sales": 200
                    },
                    {
                        "dk": "202502",
                        "sales": 300
                    },
                    {
                        "dk": "202503",
                        "sales": 200
                    },
                    {
                        "dk": "202504",
                        "sales": 100
                    },
                    {
                        "dk": "202505",
                        "sales": 100
                    },
                    {
                        "dk": "202506",
                        "sales": 300
                    },
                    {
                        "dk": "202507",
                        "sales": 500
                    },
                    {
                        "dk": "202508",
                        "sales": 500
                    },
                    {
                        "dk": "202509",
                        "sales": 500
                    },
                    {
                        "dk": "202510",
                        "sales": 300
                    },
                    {
                        "dk": "202511",
                        "sales": 400
                    },
                    {
                        "dk": "202512",
                        "sales": 400
                    },
                    {
                        "dk": "202601",
                        "sales": 100
                    },
                    {
                        "dk": "202602",
                        "sales": 200
                    },
                    {
                        "dk": "202603",
                        "sales": 200
                    },
                    {
                        "dk": "202604",
                        "sales": 100
                    },
                    {
                        "dk": "202605",
                        "sales": 50
                    },
                    {
                        "dk": "202606",
                        "sales": 200
                    },
                    {
                        "dk": "202607",
                        "sales": 300
                    }
                ],
                "reviewsDelta": 0,
                "reviewsRate": 1.77,
                "reviewsIncreasement": 104,
                "profitDto": null,
                "sellerDto": {
                    "sellerId": "A1G57VOI7NPB74",
                    "station": "US",
                    "shortName": "Lufeiya",
                    "businessName": "Xiamen Lufeiya Technology Co., LTD.",
                    "businessType": null,
                    "tradeNumber": null,
                    "vatNumber": null,
                    "phone": "",
                    "customerAddress": null,
                    "businessAddress": "火炬高新区火炬园",
                    "nation": "CN",
                    "capital": null,
                    "manger": null,
                    "about": null,
                    "email": null,
                    "nationName": "中国",
                    "rating": 5.0,
                    "positive": 99,
                    "reviews": 408,
                    "products": 39,
                    "feedback": {
                        "days30Count": null,
                        "days30Negative": null,
                        "days30Neutral": null,
                        "days30Positive": null,
                        "days90Count": null,
                        "days90Negative": null,
                        "days90Neutral": null,
                        "days90Positive": null,
                        "lifetimeCount": null,
                        "lifetimeNegative": null,
                        "lifetimeNeutral": null,
                        "lifetimePositive": null,
                        "month12Count": null,
                        "month12Negative": null,
                        "month12Neutral": null,
                        "month12Positive": null
                    },
                    "updateTime": 1788156707014,
                    "syncProductTime": 1787988183128,
                    "simplify": true
                },
                "subSalesRank": null,
                "curMon": false,
                "curMonDaysales": null,
                "subcategories": [
                    {
                        "code": "3733671",
                        "rank": 7,
                        "label": "Home Office Desks"
                    }
                ],
                "parentChangeHis": [],
                "source": null,
                "dimensionsTag": "50.04 x 118.36 x 74.93 cm",
                "pkgDimensionsTag": "87.88 x 53.59 x 9.91 cm",
                "weightTag": "14.29 kg",
                "pkgWeightTag": "14.34 kg",
                "bigImageUrl": "https://m.media-amazon.com/images/I/41QFkBW9VqL._AC_US600_.jpg",
                "liked": false,
                "subTotalAmount": 39995.0,
                "monDailySales": "",
                "guestVisited": false
            },
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
                "id": "USB0D5BMFK9S",
                "marketId": 1,
                "station": "GLOBAL",
                "monthId": null,
                "monthName": null,
                "table": null,
                "category1Id": null,
                "category1Name": null,
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "nodeLabelLocale": "家庭办公桌",
                "nodeLabelPathLocale": "家居用品:家具:家庭办公家具:家庭办公桌",
                "asin": "B0D5BMFK9S",
                "channel": "S",
                "alias": "B0D5BMFK9S",
                "symbol": "Y",
                "title0": null,
                "brand0": null,
                "brandShort": null,
                "amzUnit": 2000,
                "amzUnitDate": 1788150320000,
                "amzUnitTrend": "{\"202407\":200,\"202408\":1000,\"202409\":1000,\"202410\":600,\"202411\":900,\"202412\":600,\"202501\":300,\"202502\":400,\"202503\":300,\"202504\":200,\"202505\":300,\"202506\":400,\"202507\":900,\"202508\":1000,\"202509\":700,\"202510\":600,\"202511\":800,\"202512\":300,\"202601\":700,\"202602\":1000,\"202603\":700,\"202604\":500,\"202605\":50,\"202606\":500,\"202607\":900}",
                "totalAmount": 470341.2,
                "fbaAmount": null,
                "totalUnits": 5880,
                "fbaUnits": null,
                "averagePrice": 93.6,
                "totalAmountRank": null,
                "impression": null,
                "conversionRate": null,
                "totalAmountGrowth": 15.29,
                "totalUnitsGrowth": 15.29,
                "totalUnitsGrowthYoy": 38.71,
                "totalUnitsGrowthYoyLag1": -34.73,
                "totalUnitsGrowthYoyLag2": 19.33,
                "totalUnitsGrowthYoyLag3": 9.88,
                "totalUnitsGrowthYoyLag4": 36.6,
                "totalUnitsGrowthYoyLag5": 5.32,
                "salesTrend": "{\"202509\":3095,\"202608\":6045,\"202408\":4033,\"202507\":4264,\"202606\":2414,\"202409\":2238,\"202508\":4239,\"202607\":2783,\"202505\":1285,\"202604\":1896,\"202407\":1775,\"202506\":2023,\"202605\":1412,\"202503\":1972,\"202602\":2201,\"202504\":1388,\"202603\":2077,\"202501\":1334,\"202502\":2001,\"202601\":1841,\"202410\":2945,\"202512\":2484,\"202411\":4187,\"202510\":2782,\"202412\":1613,\"202511\":3411}",
                "createdTime": null,
                "updatedTime": 1788105600000,
                "syncTime": 1788150320000,
                "categoryId": "home-garden",
                "categoryName": "Home & Kitchen",
                "title": "Lufeiya Computer Desk with File Drawers Cabinet, 47 Inch Reversible Home Office Desks with Filing Cabinet for Small Space, Gaming Study Writing Table PC Desks, Black",
                "asinUrl": null,
                "imageUrl": "https://m.media-amazon.com/images/I/712ZBhJ6RkL._AC_US200_.jpg",
                "videoUrl": null,
                "video": "N",
                "ebc": "Y",
                "lqs": 100,
                "price": 79.99,
                "primeExclusivePrice": -1.0,
                "coupon": "",
                "deliveryPrice": -1.0,
                "rating": 4.4,
                "reviews": 2338,
                "questions": null,
                "availableDate": 1721215440000,
                "availableYear": 2,
                "availableMonth": 1,
                "availableDays": 774,
                "firstReviewDate": 1721215440000,
                "publishDate": null,
                "bsrRank": 3863,
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRankCv": -29,
                "bsrRankCr": -0.76,
                "brand": "Lufeiya",
                "brandUrl": "/stores/LUFEIYA/page/286014F1-E7F9-4883-9C03-6BD4FA62A3EE?lp_asin=B0D5BMFK9S&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto",
                "dimensions": "19.7 x 46.6 x 29.5 inches",
                "dimensionType": "EL15O",
                "weight": "31 pounds",
                "pkgDimensions": "34.2 x 21.5 x 3.4 inches",
                "pkgDimensionType": "SB",
                "pkgWeight": "31.1 pounds",
                "pkgVolumeWeights": 8158.1943,
                "overviews": "{\"Brand\":\"Lufeiya\",\"Shape\":\"Rectangular\",\"Desk design\":\"Computer Desk, Writing Desk\",\"Product Dimensions\":\"19.7\\\"D x 46.6\\\"W x 29.5\\\"H\",\"Color\":\"Black\",\"Style\":\"Modern\",\"Base Material\":\"Metal\",\"Top Material Type\":\"Tabletop made of FSC-Certified Wood\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Compact\"}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerType": "FBA",
                "sellerNation": "CN",
                "sellers": 2,
                "amazonChoice": "Amazon's Choice",
                "bestSeller": null,
                "newRelease": null,
                "estimatedSales": null,
                "parent": "B0D93D2G2W",
                "variations": 7,
                "variationAsin": null,
                "sku": "Color: Black | Size: 46.6\"",
                "fba": 20.01,
                "profit": 59.99,
                "trends": [
                    {
                        "dk": "202407",
                        "sales": 1775
                    },
                    {
                        "dk": "202408",
                        "sales": 4033
                    },
                    {
                        "dk": "202409",
                        "sales": 2238
                    },
                    {
                        "dk": "202410",
                        "sales": 2945
                    },
                    {
                        "dk": "202411",
                        "sales": 4187
                    },
                    {
                        "dk": "202412",
                        "sales": 1613
                    },
                    {
                        "dk": "202501",
                        "sales": 1334
                    },
                    {
                        "dk": "202502",
                        "sales": 2001
                    },
                    {
                        "dk": "202503",
                        "sales": 1972
                    },
                    {
                        "dk": "202504",
                        "sales": 1388
                    },
                    {
                        "dk": "202505",
                        "sales": 1285
                    },
                    {
                        "dk": "202506",
                        "sales": 2023
                    },
                    {
                        "dk": "202507",
                        "sales": 4264
                    },
                    {
                        "dk": "202508",
                        "sales": 4239
                    },
                    {
                        "dk": "202509",
                        "sales": 3095
                    },
                    {
                        "dk": "202510",
                        "sales": 2782
                    },
                    {
                        "dk": "202511",
                        "sales": 3411
                    },
                    {
                        "dk": "202512",
                        "sales": 2484
                    },
                    {
                        "dk": "202601",
                        "sales": 1841
                    },
                    {
                        "dk": "202602",
                        "sales": 2201
                    },
                    {
                        "dk": "202603",
                        "sales": 2077
                    },
                    {
                        "dk": "202604",
                        "sales": 1896
                    },
                    {
                        "dk": "202605",
                        "sales": 1412
                    },
                    {
                        "dk": "202606",
                        "sales": 2414
                    },
                    {
                        "dk": "202607",
                        "sales": 2783
                    },
                    {
                        "dk": "202608",
                        "sales": 6045
                    }
                ],
                "amzUnitTrends": [
                    {
                        "dk": "202407",
                        "sales": 200
                    },
                    {
                        "dk": "202408",
                        "sales": 1000
                    },
                    {
                        "dk": "202409",
                        "sales": 1000
                    },
                    {
                        "dk": "202410",
                        "sales": 600
                    },
                    {
                        "dk": "202411",
                        "sales": 900
                    },
                    {
                        "dk": "202412",
                        "sales": 600
                    },
                    {
                        "dk": "202501",
                        "sales": 300
                    },
                    {
                        "dk": "202502",
                        "sales": 400
                    },
                    {
                        "dk": "202503",
                        "sales": 300
                    },
                    {
                        "dk": "202504",
                        "sales": 200
                    },
                    {
                        "dk": "202505",
                        "sales": 300
                    },
                    {
                        "dk": "202506",
                        "sales": 400
                    },
                    {
                        "dk": "202507",
                        "sales": 900
                    },
                    {
                        "dk": "202508",
                        "sales": 1000
                    },
                    {
                        "dk": "202509",
                        "sales": 700
                    },
                    {
                        "dk": "202510",
                        "sales": 600
                    },
                    {
                        "dk": "202511",
                        "sales": 800
                    },
                    {
                        "dk": "202512",
                        "sales": 300
                    },
                    {
                        "dk": "202601",
                        "sales": 700
                    },
                    {
                        "dk": "202602",
                        "sales": 1000
                    },
                    {
                        "dk": "202603",
                        "sales": 700
                    },
                    {
                        "dk": "202604",
                        "sales": 500
                    },
                    {
                        "dk": "202605",
                        "sales": 50
                    },
                    {
                        "dk": "202606",
                        "sales": 500
                    },
                    {
                        "dk": "202607",
                        "sales": 900
                    }
                ],
                "reviewsDelta": 0,
                "reviewsRate": 1.77,
                "reviewsIncreasement": 104,
                "profitDto": null,
                "sellerDto": {
                    "sellerId": "A1G57VOI7NPB74",
                    "station": "US",
                    "shortName": "Lufeiya",
                    "businessName": "Xiamen Lufeiya Technology Co., LTD.",
                    "businessType": null,
                    "tradeNumber": null,
                    "vatNumber": null,
                    "phone": "",
                    "customerAddress": null,
                    "businessAddress": "火炬高新区火炬园",
                    "nation": "CN",
                    "capital": null,
                    "manger": null,
                    "about": null,
                    "email": null,
                    "nationName": "中国",
                    "rating": 5.0,
                    "positive": 99,
                    "reviews": 408,
                    "products": 39,
                    "feedback": {
                        "days30Count": null,
                        "days30Negative": null,
                        "days30Neutral": null,
                        "days30Positive": null,
                        "days90Count": null,
                        "days90Negative": null,
                        "days90Neutral": null,
                        "days90Positive": null,
                        "lifetimeCount": null,
                        "lifetimeNegative": null,
                        "lifetimeNeutral": null,
                        "lifetimePositive": null,
                        "month12Count": null,
                        "month12Negative": null,
                        "month12Neutral": null,
                        "month12Positive": null
                    },
                    "updateTime": 1788156707014,
                    "syncProductTime": 1787988183128,
                    "simplify": true
                },
                "subSalesRank": null,
                "curMon": false,
                "curMonDaysales": null,
                "subcategories": [
                    {
                        "code": "3733671",
                        "rank": 7,
                        "label": "Home Office Desks"
                    }
                ],
                "parentChangeHis": [],
                "source": null,
                "dimensionsTag": "50.04 x 118.36 x 74.93 cm",
                "pkgDimensionsTag": "86.87 x 54.61 x 8.64 cm",
                "weightTag": "14.06 kg",
                "pkgWeightTag": "14.11 kg",
                "bigImageUrl": "https://images-na.ssl-images-amazon.com/images/I/712ZBhJ6RkL._AC_US600_.jpg",
                "liked": false,
                "subTotalAmount": 187200.0,
                "monDailySales": "",
                "guestVisited": false
            },
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
                "id": "USB0DDYDBTNF",
                "marketId": 1,
                "station": "GLOBAL",
                "monthId": null,
                "monthName": null,
                "table": null,
                "category1Id": null,
                "category1Name": null,
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "nodeLabelLocale": "家庭办公桌",
                "nodeLabelPathLocale": "家居用品:家具:家庭办公家具:家庭办公桌",
                "asin": "B0DDYDBTNF",
                "channel": "S",
                "alias": "B0DDYDBTNF",
                "symbol": "N",
                "title0": null,
                "brand0": null,
                "brandShort": null,
                "amzUnit": 200,
                "amzUnitDate": 1788148094000,
                "amzUnitTrend": "{\"202411\":50,\"202412\":50,\"202501\":50,\"202502\":100,\"202503\":100,\"202504\":50,\"202505\":50,\"202506\":50,\"202507\":50,\"202508\":100,\"202509\":100,\"202510\":100,\"202511\":50,\"202512\":50,\"202601\":50,\"202606\":50,\"202607\":50}",
                "totalAmount": 529141.2,
                "fbaAmount": null,
                "totalUnits": 5880,
                "fbaUnits": null,
                "averagePrice": 89.99,
                "totalAmountRank": null,
                "impression": null,
                "conversionRate": null,
                "totalAmountGrowth": 15.29,
                "totalUnitsGrowth": 15.29,
                "totalUnitsGrowthYoy": 38.71,
                "totalUnitsGrowthYoyLag1": -34.73,
                "totalUnitsGrowthYoyLag2": 19.33,
                "totalUnitsGrowthYoyLag3": 9.88,
                "totalUnitsGrowthYoyLag4": 36.6,
                "totalUnitsGrowthYoyLag5": 5.32,
                "salesTrend": "{\"202509\":3095,\"202608\":6045,\"202408\":4033,\"202507\":4264,\"202606\":2414,\"202409\":2238,\"202508\":4239,\"202607\":2783,\"202505\":1285,\"202604\":1896,\"202407\":1775,\"202506\":2023,\"202605\":1412,\"202503\":1972,\"202602\":2201,\"202504\":1388,\"202603\":2077,\"202501\":1334,\"202502\":2001,\"202601\":1841,\"202410\":2945,\"202512\":2484,\"202411\":4187,\"202510\":2782,\"202412\":1613,\"202511\":3411}",
                "createdTime": null,
                "updatedTime": 1788105600000,
                "syncTime": 1788150320000,
                "categoryId": "home-garden",
                "categoryName": "Home & Kitchen",
                "title": "Lufeiya Computer Desk with Fabric File Drawers Cabinet, 55 Inch Reversible Home Office Desks with Filing Cabinet for Small Space, Study Writing Table PC Desks with Storage for Bedroom, Rustic Brown",
                "asinUrl": null,
                "imageUrl": "https://m.media-amazon.com/images/I/41b0fdzeceL._AC_US200_.jpg",
                "videoUrl": null,
                "video": "N",
                "ebc": "Y",
                "lqs": 100,
                "price": 89.99,
                "primeExclusivePrice": -1.0,
                "coupon": "",
                "deliveryPrice": -1.0,
                "rating": 4.4,
                "reviews": 2338,
                "questions": null,
                "availableDate": 1731759840000,
                "availableYear": 1,
                "availableMonth": 9,
                "availableDays": 652,
                "firstReviewDate": 1709568000000,
                "publishDate": null,
                "bsrRank": 3863,
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRankCv": -29,
                "bsrRankCr": -0.76,
                "brand": "Lufeiya",
                "brandUrl": "/stores/LUFEIYA/page/286014F1-E7F9-4883-9C03-6BD4FA62A3EE?lp_asin=B0DDYDBTNF&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto",
                "dimensions": "19.7\"D x 54.5\"W x 29.5\"H",
                "dimensionType": "EL15O",
                "weight": "30.9 pounds",
                "pkgDimensions": "44.2 x 22 x 3.6 inches",
                "pkgDimensionType": "LB",
                "pkgWeight": "34.4 pounds",
                "pkgVolumeWeights": 8158.1943,
                "overviews": "{\"Brand\":\"Lufeiya\",\"Shape\":\"Rectangular\",\"Desk design\":\"Computer Desk, Writing Desk\",\"Product Dimensions\":\"19.7\\\"D x 54.5\\\"W x 29.5\\\"H\",\"Color\":\"Rustic Brown\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\",\"Top Material Type\":\"Tabletop made of FSC-Certified Wood\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Compact\"}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerType": "FBA",
                "sellerNation": "CN",
                "sellers": 1,
                "amazonChoice": "Amazon's Choice",
                "bestSeller": null,
                "newRelease": null,
                "estimatedSales": null,
                "parent": "B0D93D2G2W",
                "variations": 7,
                "variationAsin": null,
                "sku": "Color: Rustic Brown | Size: 54.6\"",
                "fba": 23.05,
                "profit": 59.39,
                "trends": [
                    {
                        "dk": "202407",
                        "sales": 1775
                    },
                    {
                        "dk": "202408",
                        "sales": 4033
                    },
                    {
                        "dk": "202409",
                        "sales": 2238
                    },
                    {
                        "dk": "202410",
                        "sales": 2945
                    },
                    {
                        "dk": "202411",
                        "sales": 4187
                    },
                    {
                        "dk": "202412",
                        "sales": 1613
                    },
                    {
                        "dk": "202501",
                        "sales": 1334
                    },
                    {
                        "dk": "202502",
                        "sales": 2001
                    },
                    {
                        "dk": "202503",
                        "sales": 1972
                    },
                    {
                        "dk": "202504",
                        "sales": 1388
                    },
                    {
                        "dk": "202505",
                        "sales": 1285
                    },
                    {
                        "dk": "202506",
                        "sales": 2023
                    },
                    {
                        "dk": "202507",
                        "sales": 4264
                    },
                    {
                        "dk": "202508",
                        "sales": 4239
                    },
                    {
                        "dk": "202509",
                        "sales": 3095
                    },
                    {
                        "dk": "202510",
                        "sales": 2782
                    },
                    {
                        "dk": "202511",
                        "sales": 3411
                    },
                    {
                        "dk": "202512",
                        "sales": 2484
                    },
                    {
                        "dk": "202601",
                        "sales": 1841
                    },
                    {
                        "dk": "202602",
                        "sales": 2201
                    },
                    {
                        "dk": "202603",
                        "sales": 2077
                    },
                    {
                        "dk": "202604",
                        "sales": 1896
                    },
                    {
                        "dk": "202605",
                        "sales": 1412
                    },
                    {
                        "dk": "202606",
                        "sales": 2414
                    },
                    {
                        "dk": "202607",
                        "sales": 2783
                    },
                    {
                        "dk": "202608",
                        "sales": 6045
                    }
                ],
                "amzUnitTrends": [
                    {
                        "dk": "202411",
                        "sales": 50
                    },
                    {
                        "dk": "202412",
                        "sales": 50
                    },
                    {
                        "dk": "202501",
                        "sales": 50
                    },
                    {
                        "dk": "202502",
                        "sales": 100
                    },
                    {
                        "dk": "202503",
                        "sales": 100
                    },
                    {
                        "dk": "202504",
                        "sales": 50
                    },
                    {
                        "dk": "202505",
                        "sales": 50
                    },
                    {
                        "dk": "202506",
                        "sales": 50
                    },
                    {
                        "dk": "202507",
                        "sales": 50
                    },
                    {
                        "dk": "202508",
                        "sales": 100
                    },
                    {
                        "dk": "202509",
                        "sales": 100
                    },
                    {
                        "dk": "202510",
                        "sales": 100
                    },
                    {
                        "dk": "202511",
                        "sales": 50
                    },
                    {
                        "dk": "202512",
                        "sales": 50
                    },
                    {
                        "dk": "202601",
                        "sales": 50
                    },
                    {
                        "dk": "202606",
                        "sales": 50
                    },
                    {
                        "dk": "202607",
                        "sales": 50
                    }
                ],
                "reviewsDelta": 0,
                "reviewsRate": 1.77,
                "reviewsIncreasement": 104,
                "profitDto": null,
                "sellerDto": {
                    "sellerId": "A1G57VOI7NPB74",
                    "station": "US",
                    "shortName": "Lufeiya",
                    "businessName": "Xiamen Lufeiya Technology Co., LTD.",
                    "businessType": null,
                    "tradeNumber": null,
                    "vatNumber": null,
                    "phone": "",
                    "customerAddress": null,
                    "businessAddress": "火炬高新区火炬园",
                    "nation": "CN",
                    "capital": null,
                    "manger": null,
                    "about": null,
                    "email": null,
                    "nationName": "中国",
                    "rating": 5.0,
                    "positive": 99,
                    "reviews": 408,
                    "products": 39,
                    "feedback": {
                        "days30Count": null,
                        "days30Negative": null,
                        "days30Neutral": null,
                        "days30Positive": null,
                        "days90Count": null,
                        "days90Negative": null,
                        "days90Neutral": null,
                        "days90Positive": null,
                        "lifetimeCount": null,
                        "lifetimeNegative": null,
                        "lifetimeNeutral": null,
                        "lifetimePositive": null,
                        "month12Count": null,
                        "month12Negative": null,
                        "month12Neutral": null,
                        "month12Positive": null
                    },
                    "updateTime": 1788156707014,
                    "syncProductTime": 1787988183128,
                    "simplify": true
                },
                "subSalesRank": null,
                "curMon": false,
                "curMonDaysales": null,
                "subcategories": [
                    {
                        "code": "3733671",
                        "rank": 7,
                        "label": "Home Office Desks"
                    }
                ],
                "parentChangeHis": [],
                "source": null,
                "dimensionsTag": "50.04 x 138.43 x 74.93 cm",
                "pkgDimensionsTag": "112.27 x 55.88 x 9.14 cm",
                "weightTag": "14.02 kg",
                "pkgWeightTag": "15.60 kg",
                "bigImageUrl": "https://m.media-amazon.com/images/I/41b0fdzeceL._AC_US600_.jpg",
                "liked": false,
                "subTotalAmount": 17998.0,
                "monDailySales": "",
                "guestVisited": false
            },
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
                "id": "USB0DDYDWBQQ",
                "marketId": 1,
                "station": "GLOBAL",
                "monthId": null,
                "monthName": null,
                "table": null,
                "category1Id": null,
                "category1Name": null,
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "nodeLabelLocale": "家庭办公桌",
                "nodeLabelPathLocale": "家居用品:家具:家庭办公家具:家庭办公桌",
                "asin": "B0DDYDWBQQ",
                "channel": "S",
                "alias": "B0DDYDWBQQ",
                "symbol": "N",
                "title0": null,
                "brand0": null,
                "brandShort": null,
                "amzUnit": 200,
                "amzUnitDate": 1787869550000,
                "amzUnitTrend": "{\"202411\":50,\"202412\":100,\"202501\":50,\"202502\":100,\"202503\":100,\"202504\":50,\"202505\":100,\"202506\":100,\"202507\":200,\"202508\":200,\"202509\":100,\"202510\":100,\"202511\":200,\"202512\":200,\"202601\":100,\"202606\":100,\"202607\":100}",
                "totalAmount": 529082.44,
                "fbaAmount": null,
                "totalUnits": 5880,
                "fbaUnits": null,
                "averagePrice": 89.98,
                "totalAmountRank": null,
                "impression": null,
                "conversionRate": null,
                "totalAmountGrowth": 15.29,
                "totalUnitsGrowth": 15.29,
                "totalUnitsGrowthYoy": 38.71,
                "totalUnitsGrowthYoyLag1": -34.73,
                "totalUnitsGrowthYoyLag2": 19.33,
                "totalUnitsGrowthYoyLag3": 9.88,
                "totalUnitsGrowthYoyLag4": 36.6,
                "totalUnitsGrowthYoyLag5": 5.32,
                "salesTrend": "{\"202509\":3095,\"202608\":6045,\"202408\":4033,\"202507\":4264,\"202606\":2414,\"202409\":2238,\"202508\":4239,\"202607\":2783,\"202505\":1285,\"202604\":1896,\"202407\":1775,\"202506\":2023,\"202605\":1412,\"202503\":1972,\"202602\":2201,\"202504\":1388,\"202603\":2077,\"202501\":1334,\"202502\":2001,\"202601\":1841,\"202410\":2945,\"202512\":2484,\"202411\":4187,\"202510\":2782,\"202412\":1613,\"202511\":3411}",
                "createdTime": null,
                "updatedTime": 1788105600000,
                "syncTime": 1788150320000,
                "categoryId": "home-garden",
                "categoryName": "Home & Kitchen",
                "title": "Lufeiya White Computer Desk with Fabric File Drawers Cabinet, 55 Inch Reversible Desks with Storage Filing Cabinet for Home Office, Modern Writing Table PC Desks for Bedroom, White",
                "asinUrl": null,
                "imageUrl": "https://m.media-amazon.com/images/I/41x0P+8bEeL._AC_US200_.jpg",
                "videoUrl": null,
                "video": "N",
                "ebc": "Y",
                "lqs": 100,
                "price": 89.98,
                "primeExclusivePrice": -1.0,
                "coupon": "",
                "deliveryPrice": -1.0,
                "rating": 4.4,
                "reviews": 2338,
                "questions": null,
                "availableDate": 1731834240000,
                "availableYear": 1,
                "availableMonth": 9,
                "availableDays": 651,
                "firstReviewDate": 1709568000000,
                "publishDate": null,
                "bsrRank": 3863,
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRankCv": -29,
                "bsrRankCr": -0.76,
                "brand": "Lufeiya",
                "brandUrl": "/stores/LUFEIYA/page/286014F1-E7F9-4883-9C03-6BD4FA62A3EE?lp_asin=B0DDYDWBQQ&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto",
                "dimensions": "19.7\"D x 54.5\"W x 29.5\"H",
                "dimensionType": "EL15O",
                "weight": "30.9 pounds",
                "pkgDimensions": "43 x 21.5 x 3.5 inches",
                "pkgDimensionType": "LB",
                "pkgWeight": "34.1 pounds",
                "pkgVolumeWeights": 8158.1943,
                "overviews": "{\"Brand\":\"Lufeiya\",\"Shape\":\"Rectangular\",\"Desk design\":\"Computer Desk, Writing Desk\",\"Product Dimensions\":\"19.7\\\"D x 54.5\\\"W x 29.5\\\"H\",\"Color\":\"White\",\"Style\":\"Modern\",\"Base Material\":\"Metal\",\"Top Material Type\":\"Tabletop made of FSC-Certified Wood\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Compact\"}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerType": "FBA",
                "sellerNation": "CN",
                "sellers": 1,
                "amazonChoice": "Amazon's Choice",
                "bestSeller": null,
                "newRelease": null,
                "estimatedSales": null,
                "parent": "B0D93D2G2W",
                "variations": 7,
                "variationAsin": null,
                "sku": "Color: White | Size: 54.6\"",
                "fba": 23.05,
                "profit": 59.38,
                "trends": [
                    {
                        "dk": "202407",
                        "sales": 1775
                    },
                    {
                        "dk": "202408",
                        "sales": 4033
                    },
                    {
                        "dk": "202409",
                        "sales": 2238
                    },
                    {
                        "dk": "202410",
                        "sales": 2945
                    },
                    {
                        "dk": "202411",
                        "sales": 4187
                    },
                    {
                        "dk": "202412",
                        "sales": 1613
                    },
                    {
                        "dk": "202501",
                        "sales": 1334
                    },
                    {
                        "dk": "202502",
                        "sales": 2001
                    },
                    {
                        "dk": "202503",
                        "sales": 1972
                    },
                    {
                        "dk": "202504",
                        "sales": 1388
                    },
                    {
                        "dk": "202505",
                        "sales": 1285
                    },
                    {
                        "dk": "202506",
                        "sales": 2023
                    },
                    {
                        "dk": "202507",
                        "sales": 4264
                    },
                    {
                        "dk": "202508",
                        "sales": 4239
                    },
                    {
                        "dk": "202509",
                        "sales": 3095
                    },
                    {
                        "dk": "202510",
                        "sales": 2782
                    },
                    {
                        "dk": "202511",
                        "sales": 3411
                    },
                    {
                        "dk": "202512",
                        "sales": 2484
                    },
                    {
                        "dk": "202601",
                        "sales": 1841
                    },
                    {
                        "dk": "202602",
                        "sales": 2201
                    },
                    {
                        "dk": "202603",
                        "sales": 2077
                    },
                    {
                        "dk": "202604",
                        "sales": 1896
                    },
                    {
                        "dk": "202605",
                        "sales": 1412
                    },
                    {
                        "dk": "202606",
                        "sales": 2414
                    },
                    {
                        "dk": "202607",
                        "sales": 2783
                    },
                    {
                        "dk": "202608",
                        "sales": 6045
                    }
                ],
                "amzUnitTrends": [
                    {
                        "dk": "202411",
                        "sales": 50
                    },
                    {
                        "dk": "202412",
                        "sales": 100
                    },
                    {
                        "dk": "202501",
                        "sales": 50
                    },
                    {
                        "dk": "202502",
                        "sales": 100
                    },
                    {
                        "dk": "202503",
                        "sales": 100
                    },
                    {
                        "dk": "202504",
                        "sales": 50
                    },
                    {
                        "dk": "202505",
                        "sales": 100
                    },
                    {
                        "dk": "202506",
                        "sales": 100
                    },
                    {
                        "dk": "202507",
                        "sales": 200
                    },
                    {
                        "dk": "202508",
                        "sales": 200
                    },
                    {
                        "dk": "202509",
                        "sales": 100
                    },
                    {
                        "dk": "202510",
                        "sales": 100
                    },
                    {
                        "dk": "202511",
                        "sales": 200
                    },
                    {
                        "dk": "202512",
                        "sales": 200
                    },
                    {
                        "dk": "202601",
                        "sales": 100
                    },
                    {
                        "dk": "202606",
                        "sales": 100
                    },
                    {
                        "dk": "202607",
                        "sales": 100
                    }
                ],
                "reviewsDelta": 0,
                "reviewsRate": 1.77,
                "reviewsIncreasement": 104,
                "profitDto": null,
                "sellerDto": {
                    "sellerId": "A1G57VOI7NPB74",
                    "station": "US",
                    "shortName": "Lufeiya",
                    "businessName": "Xiamen Lufeiya Technology Co., LTD.",
                    "businessType": null,
                    "tradeNumber": null,
                    "vatNumber": null,
                    "phone": "",
                    "customerAddress": null,
                    "businessAddress": "火炬高新区火炬园",
                    "nation": "CN",
                    "capital": null,
                    "manger": null,
                    "about": null,
                    "email": null,
                    "nationName": "中国",
                    "rating": 5.0,
                    "positive": 99,
                    "reviews": 408,
                    "products": 39,
                    "feedback": {
                        "days30Count": null,
                        "days30Negative": null,
                        "days30Neutral": null,
                        "days30Positive": null,
                        "days90Count": null,
                        "days90Negative": null,
                        "days90Neutral": null,
                        "days90Positive": null,
                        "lifetimeCount": null,
                        "lifetimeNegative": null,
                        "lifetimeNeutral": null,
                        "lifetimePositive": null,
                        "month12Count": null,
                        "month12Negative": null,
                        "month12Neutral": null,
                        "month12Positive": null
                    },
                    "updateTime": 1788156707014,
                    "syncProductTime": 1787988183128,
                    "simplify": true
                },
                "subSalesRank": null,
                "curMon": false,
                "curMonDaysales": null,
                "subcategories": [
                    {
                        "code": "3733671",
                        "rank": 7,
                        "label": "Home Office Desks"
                    }
                ],
                "parentChangeHis": [],
                "source": null,
                "dimensionsTag": "50.04 x 138.43 x 74.93 cm",
                "pkgDimensionsTag": "109.22 x 54.61 x 8.89 cm",
                "weightTag": "14.02 kg",
                "pkgWeightTag": "15.47 kg",
                "bigImageUrl": "https://m.media-amazon.com/images/I/41x0P+8bEeL._AC_US600_.jpg",
                "liked": false,
                "subTotalAmount": 17996.0,
                "monDailySales": "",
                "guestVisited": false
            },
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
                "id": "USB0DGLDWY9C",
                "marketId": 1,
                "station": "GLOBAL",
                "monthId": null,
                "monthName": null,
                "table": null,
                "category1Id": null,
                "category1Name": null,
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "nodeLabelLocale": "家庭办公桌",
                "nodeLabelPathLocale": "家居用品:家具:家庭办公家具:家庭办公桌",
                "asin": "B0DGLDWY9C",
                "channel": "S",
                "alias": "B0DGLDWY9C",
                "symbol": "N",
                "title0": null,
                "brand0": null,
                "brandShort": null,
                "amzUnit": 400,
                "amzUnitDate": 1788148094000,
                "amzUnitTrend": "{\"202503\":100,\"202504\":50,\"202505\":50,\"202506\":100,\"202507\":200,\"202508\":100,\"202509\":100,\"202510\":100,\"202511\":200,\"202512\":100,\"202601\":100,\"202602\":100,\"202603\":50,\"202604\":50,\"202606\":100,\"202607\":100}",
                "totalAmount": 529141.2,
                "fbaAmount": null,
                "totalUnits": 5880,
                "fbaUnits": null,
                "averagePrice": 89.99,
                "totalAmountRank": null,
                "impression": null,
                "conversionRate": null,
                "totalAmountGrowth": 15.29,
                "totalUnitsGrowth": 15.29,
                "totalUnitsGrowthYoy": 38.71,
                "totalUnitsGrowthYoyLag1": -34.73,
                "totalUnitsGrowthYoyLag2": 19.33,
                "totalUnitsGrowthYoyLag3": 9.88,
                "totalUnitsGrowthYoyLag4": 36.6,
                "totalUnitsGrowthYoyLag5": 5.32,
                "salesTrend": "{\"202509\":3095,\"202608\":6045,\"202408\":4033,\"202507\":4264,\"202606\":2414,\"202409\":2238,\"202508\":4239,\"202607\":2783,\"202505\":1285,\"202604\":1896,\"202407\":1775,\"202506\":2023,\"202605\":1412,\"202503\":1972,\"202602\":2201,\"202504\":1388,\"202603\":2077,\"202501\":1334,\"202502\":2001,\"202601\":1841,\"202410\":2945,\"202512\":2484,\"202411\":4187,\"202510\":2782,\"202412\":1613,\"202511\":3411}",
                "createdTime": null,
                "updatedTime": 1788105600000,
                "syncTime": 1788150320000,
                "categoryId": "home-garden",
                "categoryName": "Home & Kitchen",
                "title": "Lufeiya Computer Desk with Fabric File Drawers Cabinet, 55 Inch Reversible Home Office Desks with Filing Cabinet, Study Writing Table PC Desks with Storage for Bedroom, Black",
                "asinUrl": null,
                "imageUrl": "https://m.media-amazon.com/images/I/41ZFEeIM1BL._AC_US200_.jpg",
                "videoUrl": null,
                "video": "N",
                "ebc": "Y",
                "lqs": 100,
                "price": 89.99,
                "primeExclusivePrice": -1.0,
                "coupon": "",
                "deliveryPrice": -1.0,
                "rating": 4.4,
                "reviews": 2338,
                "questions": null,
                "availableDate": 1739351400000,
                "availableYear": 1,
                "availableMonth": 6,
                "availableDays": 564,
                "firstReviewDate": 1709568000000,
                "publishDate": null,
                "bsrRank": 3863,
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRankCv": -29,
                "bsrRankCr": -0.76,
                "brand": "Lufeiya",
                "brandUrl": "/stores/LUFEIYA/page/286014F1-E7F9-4883-9C03-6BD4FA62A3EE?lp_asin=B0DGLDWY9C&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto",
                "dimensions": "19.7\"D x 54.5\"W x 29.5\"H",
                "dimensionType": "EL15O",
                "weight": "30.9 pounds",
                "pkgDimensions": "43.6 x 21.7 x 3.8 inches",
                "pkgDimensionType": "LB",
                "pkgWeight": "33.9 pounds",
                "pkgVolumeWeights": 8158.1943,
                "overviews": "{\"Brand\":\"Lufeiya\",\"Shape\":\"Rectangular\",\"Desk design\":\"Computer Desk, Writing Desk\",\"Product Dimensions\":\"19.7\\\"D x 54.5\\\"W x 29.5\\\"H\",\"Color\":\"Black\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\",\"Top Material Type\":\"Tabletop made of FSC-Certified Wood\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Compact\"}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerType": "FBA",
                "sellerNation": "CN",
                "sellers": 1,
                "amazonChoice": "Amazon's Choice",
                "bestSeller": null,
                "newRelease": null,
                "estimatedSales": null,
                "parent": "B0D93D2G2W",
                "variations": 7,
                "variationAsin": null,
                "sku": "Color: Black | Size: 54.6\"",
                "fba": 22.66,
                "profit": 59.82,
                "trends": [
                    {
                        "dk": "202407",
                        "sales": 1775
                    },
                    {
                        "dk": "202408",
                        "sales": 4033
                    },
                    {
                        "dk": "202409",
                        "sales": 2238
                    },
                    {
                        "dk": "202410",
                        "sales": 2945
                    },
                    {
                        "dk": "202411",
                        "sales": 4187
                    },
                    {
                        "dk": "202412",
                        "sales": 1613
                    },
                    {
                        "dk": "202501",
                        "sales": 1334
                    },
                    {
                        "dk": "202502",
                        "sales": 2001
                    },
                    {
                        "dk": "202503",
                        "sales": 1972
                    },
                    {
                        "dk": "202504",
                        "sales": 1388
                    },
                    {
                        "dk": "202505",
                        "sales": 1285
                    },
                    {
                        "dk": "202506",
                        "sales": 2023
                    },
                    {
                        "dk": "202507",
                        "sales": 4264
                    },
                    {
                        "dk": "202508",
                        "sales": 4239
                    },
                    {
                        "dk": "202509",
                        "sales": 3095
                    },
                    {
                        "dk": "202510",
                        "sales": 2782
                    },
                    {
                        "dk": "202511",
                        "sales": 3411
                    },
                    {
                        "dk": "202512",
                        "sales": 2484
                    },
                    {
                        "dk": "202601",
                        "sales": 1841
                    },
                    {
                        "dk": "202602",
                        "sales": 2201
                    },
                    {
                        "dk": "202603",
                        "sales": 2077
                    },
                    {
                        "dk": "202604",
                        "sales": 1896
                    },
                    {
                        "dk": "202605",
                        "sales": 1412
                    },
                    {
                        "dk": "202606",
                        "sales": 2414
                    },
                    {
                        "dk": "202607",
                        "sales": 2783
                    },
                    {
                        "dk": "202608",
                        "sales": 6045
                    }
                ],
                "amzUnitTrends": [
                    {
                        "dk": "202503",
                        "sales": 100
                    },
                    {
                        "dk": "202504",
                        "sales": 50
                    },
                    {
                        "dk": "202505",
                        "sales": 50
                    },
                    {
                        "dk": "202506",
                        "sales": 100
                    },
                    {
                        "dk": "202507",
                        "sales": 200
                    },
                    {
                        "dk": "202508",
                        "sales": 100
                    },
                    {
                        "dk": "202509",
                        "sales": 100
                    },
                    {
                        "dk": "202510",
                        "sales": 100
                    },
                    {
                        "dk": "202511",
                        "sales": 200
                    },
                    {
                        "dk": "202512",
                        "sales": 100
                    },
                    {
                        "dk": "202601",
                        "sales": 100
                    },
                    {
                        "dk": "202602",
                        "sales": 100
                    },
                    {
                        "dk": "202603",
                        "sales": 50
                    },
                    {
                        "dk": "202604",
                        "sales": 50
                    },
                    {
                        "dk": "202606",
                        "sales": 100
                    },
                    {
                        "dk": "202607",
                        "sales": 100
                    }
                ],
                "reviewsDelta": 0,
                "reviewsRate": 1.77,
                "reviewsIncreasement": 104,
                "profitDto": null,
                "sellerDto": {
                    "sellerId": "A1G57VOI7NPB74",
                    "station": "US",
                    "shortName": "Lufeiya",
                    "businessName": "Xiamen Lufeiya Technology Co., LTD.",
                    "businessType": null,
                    "tradeNumber": null,
                    "vatNumber": null,
                    "phone": "",
                    "customerAddress": null,
                    "businessAddress": "火炬高新区火炬园",
                    "nation": "CN",
                    "capital": null,
                    "manger": null,
                    "about": null,
                    "email": null,
                    "nationName": "中国",
                    "rating": 5.0,
                    "positive": 99,
                    "reviews": 408,
                    "products": 39,
                    "feedback": {
                        "days30Count": null,
                        "days30Negative": null,
                        "days30Neutral": null,
                        "days30Positive": null,
                        "days90Count": null,
                        "days90Negative": null,
                        "days90Neutral": null,
                        "days90Positive": null,
                        "lifetimeCount": null,
                        "lifetimeNegative": null,
                        "lifetimeNeutral": null,
                        "lifetimePositive": null,
                        "month12Count": null,
                        "month12Negative": null,
                        "month12Neutral": null,
                        "month12Positive": null
                    },
                    "updateTime": 1788156707014,
                    "syncProductTime": 1787988183128,
                    "simplify": true
                },
                "subSalesRank": null,
                "curMon": false,
                "curMonDaysales": null,
                "subcategories": [
                    {
                        "code": "3733671",
                        "rank": 7,
                        "label": "Home Office Desks"
                    }
                ],
                "parentChangeHis": [],
                "source": null,
                "dimensionsTag": "50.04 x 138.43 x 74.93 cm",
                "pkgDimensionsTag": "110.74 x 55.12 x 9.65 cm",
                "weightTag": "14.02 kg",
                "pkgWeightTag": "15.38 kg",
                "bigImageUrl": "https://m.media-amazon.com/images/I/41ZFEeIM1BL._AC_US600_.jpg",
                "liked": false,
                "subTotalAmount": 35996.0,
                "monDailySales": "",
                "guestVisited": false
            },
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
                "id": "USB0DS4DVX1T",
                "marketId": 1,
                "station": "GLOBAL",
                "monthId": null,
                "monthName": null,
                "table": null,
                "category1Id": null,
                "category1Name": null,
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "nodeLabelLocale": "家庭办公桌",
                "nodeLabelPathLocale": "家居用品:家具:家庭办公家具:家庭办公桌",
                "asin": "B0DS4DVX1T",
                "channel": "S",
                "alias": "B0DS4DVX1T",
                "symbol": "N",
                "title0": null,
                "brand0": null,
                "brandShort": null,
                "amzUnit": 500,
                "amzUnitDate": 1788144681000,
                "amzUnitTrend": "{\"202504\":50,\"202505\":100,\"202506\":200,\"202507\":300,\"202508\":200,\"202509\":300,\"202510\":200,\"202511\":300,\"202512\":50,\"202601\":200,\"202602\":300,\"202603\":200,\"202604\":200,\"202605\":100,\"202606\":100,\"202607\":200}",
                "totalAmount": 499682.4,
                "fbaAmount": null,
                "totalUnits": 5880,
                "fbaUnits": null,
                "averagePrice": 84.98,
                "totalAmountRank": null,
                "impression": null,
                "conversionRate": null,
                "totalAmountGrowth": 15.29,
                "totalUnitsGrowth": 15.29,
                "totalUnitsGrowthYoy": 38.71,
                "totalUnitsGrowthYoyLag1": -34.73,
                "totalUnitsGrowthYoyLag2": 19.33,
                "totalUnitsGrowthYoyLag3": 9.88,
                "totalUnitsGrowthYoyLag4": 36.6,
                "totalUnitsGrowthYoyLag5": 5.32,
                "salesTrend": "{\"202509\":3095,\"202608\":6045,\"202408\":4033,\"202507\":4264,\"202606\":2414,\"202409\":2238,\"202508\":4239,\"202607\":2783,\"202505\":1285,\"202604\":1896,\"202407\":1775,\"202506\":2023,\"202605\":1412,\"202503\":1972,\"202602\":2201,\"202504\":1388,\"202603\":2077,\"202501\":1334,\"202502\":2001,\"202601\":1841,\"202410\":2945,\"202512\":2484,\"202411\":4187,\"202510\":2782,\"202412\":1613,\"202511\":3411}",
                "createdTime": null,
                "updatedTime": 1788105600000,
                "syncTime": 1788150320000,
                "categoryId": "home-garden",
                "categoryName": "Home & Kitchen",
                "title": "Lufeiya Computer Desk with File Drawers Cabinet, 47 Inch Home Office Desks with Filing Cabinet for Small Space, Gaming Study Writing Table PC Desks, Gray",
                "asinUrl": null,
                "imageUrl": "https://m.media-amazon.com/images/I/41CMaV0rfrL._AC_US200_.jpg",
                "videoUrl": null,
                "video": "N",
                "ebc": "Y",
                "lqs": 100,
                "price": 84.98,
                "primeExclusivePrice": -1.0,
                "coupon": "",
                "deliveryPrice": -1.0,
                "rating": 4.4,
                "reviews": 2338,
                "questions": null,
                "availableDate": 1743491040000,
                "availableYear": 1,
                "availableMonth": 4,
                "availableDays": 517,
                "firstReviewDate": 1709568000000,
                "publishDate": null,
                "bsrRank": 3863,
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRankCv": -29,
                "bsrRankCr": -0.76,
                "brand": "Lufeiya",
                "brandUrl": "/stores/LUFEIYA/page/286014F1-E7F9-4883-9C03-6BD4FA62A3EE?lp_asin=B0DS4DVX1T&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto",
                "dimensions": "19.7\"D x 46.6\"W x 29.5\"H",
                "dimensionType": "EL15O",
                "weight": "30.9 pounds",
                "pkgDimensions": "36 x 22 x 3.5 inches",
                "pkgDimensionType": "SB",
                "pkgWeight": "31 pounds",
                "pkgVolumeWeights": 8158.1943,
                "overviews": "{\"Brand\":\"Lufeiya\",\"Top Material Type\":\"Tabletop made of FSC-Certified Wood\",\"Recommended Uses For Product\":\"Gaming, Working, Writing\",\"Shape\":\"Rectangular\",\"Desk design\":\"Computer Desk, Writing Desk\",\"Product Dimensions\":\"19.7\\\"D x 46.6\\\"W x 29.5\\\"H\",\"Color\":\"Grey\",\"Style\":\"Modern\",\"Base Material\":\"Metal\",\"Finish Type\":\"Powder Coated\"}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerType": "FBA",
                "sellerNation": "CN",
                "sellers": 1,
                "amazonChoice": "Amazon's Choice",
                "bestSeller": null,
                "newRelease": null,
                "estimatedSales": null,
                "parent": "B0D93D2G2W",
                "variations": 7,
                "variationAsin": null,
                "sku": "Color: Grey | Size: 46.6\"",
                "fba": 19.61,
                "profit": 61.92,
                "trends": [
                    {
                        "dk": "202407",
                        "sales": 1775
                    },
                    {
                        "dk": "202408",
                        "sales": 4033
                    },
                    {
                        "dk": "202409",
                        "sales": 2238
                    },
                    {
                        "dk": "202410",
                        "sales": 2945
                    },
                    {
                        "dk": "202411",
                        "sales": 4187
                    },
                    {
                        "dk": "202412",
                        "sales": 1613
                    },
                    {
                        "dk": "202501",
                        "sales": 1334
                    },
                    {
                        "dk": "202502",
                        "sales": 2001
                    },
                    {
                        "dk": "202503",
                        "sales": 1972
                    },
                    {
                        "dk": "202504",
                        "sales": 1388
                    },
                    {
                        "dk": "202505",
                        "sales": 1285
                    },
                    {
                        "dk": "202506",
                        "sales": 2023
                    },
                    {
                        "dk": "202507",
                        "sales": 4264
                    },
                    {
                        "dk": "202508",
                        "sales": 4239
                    },
                    {
                        "dk": "202509",
                        "sales": 3095
                    },
                    {
                        "dk": "202510",
                        "sales": 2782
                    },
                    {
                        "dk": "202511",
                        "sales": 3411
                    },
                    {
                        "dk": "202512",
                        "sales": 2484
                    },
                    {
                        "dk": "202601",
                        "sales": 1841
                    },
                    {
                        "dk": "202602",
                        "sales": 2201
                    },
                    {
                        "dk": "202603",
                        "sales": 2077
                    },
                    {
                        "dk": "202604",
                        "sales": 1896
                    },
                    {
                        "dk": "202605",
                        "sales": 1412
                    },
                    {
                        "dk": "202606",
                        "sales": 2414
                    },
                    {
                        "dk": "202607",
                        "sales": 2783
                    },
                    {
                        "dk": "202608",
                        "sales": 6045
                    }
                ],
                "amzUnitTrends": [
                    {
                        "dk": "202504",
                        "sales": 50
                    },
                    {
                        "dk": "202505",
                        "sales": 100
                    },
                    {
                        "dk": "202506",
                        "sales": 200
                    },
                    {
                        "dk": "202507",
                        "sales": 300
                    },
                    {
                        "dk": "202508",
                        "sales": 200
                    },
                    {
                        "dk": "202509",
                        "sales": 300
                    },
                    {
                        "dk": "202510",
                        "sales": 200
                    },
                    {
                        "dk": "202511",
                        "sales": 300
                    },
                    {
                        "dk": "202512",
                        "sales": 50
                    },
                    {
                        "dk": "202601",
                        "sales": 200
                    },
                    {
                        "dk": "202602",
                        "sales": 300
                    },
                    {
                        "dk": "202603",
                        "sales": 200
                    },
                    {
                        "dk": "202604",
                        "sales": 200
                    },
                    {
                        "dk": "202605",
                        "sales": 100
                    },
                    {
                        "dk": "202606",
                        "sales": 100
                    },
                    {
                        "dk": "202607",
                        "sales": 200
                    }
                ],
                "reviewsDelta": 0,
                "reviewsRate": 1.77,
                "reviewsIncreasement": 104,
                "profitDto": null,
                "sellerDto": {
                    "sellerId": "A1G57VOI7NPB74",
                    "station": "US",
                    "shortName": "Lufeiya",
                    "businessName": "Xiamen Lufeiya Technology Co., LTD.",
                    "businessType": null,
                    "tradeNumber": null,
                    "vatNumber": null,
                    "phone": "",
                    "customerAddress": null,
                    "businessAddress": "火炬高新区火炬园",
                    "nation": "CN",
                    "capital": null,
                    "manger": null,
                    "about": null,
                    "email": null,
                    "nationName": "中国",
                    "rating": 5.0,
                    "positive": 99,
                    "reviews": 408,
                    "products": 39,
                    "feedback": {
                        "days30Count": null,
                        "days30Negative": null,
                        "days30Neutral": null,
                        "days30Positive": null,
                        "days90Count": null,
                        "days90Negative": null,
                        "days90Neutral": null,
                        "days90Positive": null,
                        "lifetimeCount": null,
                        "lifetimeNegative": null,
                        "lifetimeNeutral": null,
                        "lifetimePositive": null,
                        "month12Count": null,
                        "month12Negative": null,
                        "month12Neutral": null,
                        "month12Positive": null
                    },
                    "updateTime": 1788156707014,
                    "syncProductTime": 1787988183128,
                    "simplify": true
                },
                "subSalesRank": null,
                "curMon": false,
                "curMonDaysales": null,
                "subcategories": [
                    {
                        "code": "3733671",
                        "rank": 7,
                        "label": "Home Office Desks"
                    }
                ],
                "parentChangeHis": [],
                "source": null,
                "dimensionsTag": "50.04 x 118.36 x 74.93 cm",
                "pkgDimensionsTag": "91.44 x 55.88 x 8.89 cm",
                "weightTag": "14.02 kg",
                "pkgWeightTag": "14.06 kg",
                "bigImageUrl": "https://m.media-amazon.com/images/I/41CMaV0rfrL._AC_US600_.jpg",
                "liked": false,
                "subTotalAmount": 42490.0,
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