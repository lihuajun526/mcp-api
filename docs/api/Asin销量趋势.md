一、mcp接口
输入参数和返回结果的格式参考下面的文档
https://open.sellersprite.com/api/61

【平台通用约定】
- 响应包裹：统一 {code, message, data}，失败时 data 含 hint 处理建议
- returnFields（可选）：按需返回字段，取值为 data.items 元素（或 data）的字段名，分页信息始终保留
- 错误码表：OK / BAD_REQUEST / UPSTREAM_ERROR / INTERNAL_ERROR，及 JSON-RPC 协议错误（-32602 等）
详见同目录《通用约定.md》。

二、第三方curl请求及响应如下
1、curl请求
curl --url 'https://www.sellersprite.com/v2/competitor-lookup/chart-monthly.json' \
  -H 'accept: application/json, text/plain, */*' \
  -H 'accept-language: zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6' \
  -H 'content-type: application/x-www-form-urlencoded;charset=UTF-8' \
  -b 'current_guest=hvwrrJISKaPA_260830-222014; Hm_lvt_e0dfc78949a2d7c553713cb5c573a486=1788099049; HMACCOUNT=C5618A56F61A870A; _ga=GA1.1.399313004.1788099049; _gcl_au=1.1.376940756.1788099049; cjConsent=MHxOfDB8Tnww; cjUser=82fe5143-515a-450d-8925-fa7d1d890e75; MEIQIA_TRACK_ID=3IdeoxgBSesmeY6Km8tlAVV98Rw; MEIQIA_VISIT_ID=3Idep15i7r6HC96BHu8GJTDEv2i; cd78a1d7fc5218a1a3ec=09601e9f1a910c9f8784435e946b74aa; _fp=60848e4a067452eec316b065fc3e1ffe; _gaf_fp=412d1af9e741c199cb66a90312380c57; rank-login-user=1766518871qrvbGyHJO0R5NAd5dYk3ivVyEoSdK9Prxqlf8B5LvZC4r1F84ksj1eqj4DiNYdXM; rank-login-user-info=eyJuaWNrbmFtZSI6ImFtejAxMDEiLCJpc0FkbWluIjpmYWxzZSwiYWNjb3VudCI6IjE3OCoqKio3MDk3IiwidG9rZW4iOiIxNzY2NTE4ODcxcXJ2Ykd5SEpPMFI1TkFkNWRZazNpdlZ5RW9TZEs5UHJ4cWxmOEI1THZaQzRyMUY4NGtzajFlcWo0RGlOWWRYTSJ9; Sprite-X-Token=eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2Nzk5NjI2YmZlMDQzZTBiYzI5NTEwMTE4ODA3YWExIn0.eyJqdGkiOiJjczdZRi1KVVpqVDRuM2lhRk5uc0V3IiwiaWF0IjoxNzg4MDk5MDcxLCJleHAiOjE3ODgxODU0NzEsIm5iZiI6MTc4ODA5OTAxMSwic3ViIjoieXVueWEiLCJpc3MiOiJyYW5rIiwiYXVkIjoic2VsbGVyU3BhY2UiLCJpZCI6NDM1NzIyLCJwaSI6bnVsbCwibm4iOiJhbXowMTAxIiwic3lzIjoiU1NfQ04iLCJlZCI6Ik4iLCJwaG4iOiIxNzg5NTYwNzA5NyIsImVtIjoiYW16MDEwMUBzZWxsZXJzcHJpdGUuY29tIiwibWwiOiJTIiwiZW5kIjoxODA2MDcwMjcxNzA1fQ.WtFQJgTQ1bCYB1r3-GBSQAFGuVMpGEZiiopOIENorqBSUwAyqx9GZomkRCupzPXvNZVVPIXNwmE-PYzvuKc0CpassoDPeV1m-p0iYbsL1NHw_OppGKdCVosQi1TnmxOBrji2IMUtthSTtS1oESBnNNlaenA9xblW7SLwPL-sIo79rs64X5yEbuY1a8kv8rSUTm28esVfDaYEuHexXIHab0laDY6iY-L4Bhj_y6bg0advVygGjwxVc2kn7MHAmEQd_JU0DZzotoNGo5fGe8fJAoo22PJbOO2OyiYyDc0vfVoK2uPYPiQ-NoMTPl_S5RaR_tIry-W6vVNKumTF5pH84g; ao_lo_to_n="1766518871qrvbGyHJO0R5NAd5dYk3iou2grXlY0G4j0hGAhmAE8GhzYQw0eQL2uAgXVwQGrlvzs3EnbcftcazS6VNzBsf8luG+y0YPrz9l3VbFmo999c="; _clck=1s7pnp1%5E2%5Eg92%5E0%5E2433; ecookie=eOVNfTHJHe21932j_CN; p_c_size=50; JSESSIONID=5DB0DBE4A7F1662E0B5D9D95C8954034; Hm_lpvt_e0dfc78949a2d7c553713cb5c573a486=1788137613; _ga_38NCVF2XST=GS2.1.s1788160147$o3$g1$t1788162342$j60$l0$h866420427; _ga_CN0F80S6GL=GS2.1.s1788160147$o3$g1$t1788162342$j60$l0$h0' \
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
  --data-raw 'asin=B0CQ4STXZR&marketId=1'

2、响应结果
{
    "message": "",
    "data": {
        "asin": "B0CQ4STXZR",
        "asinObj": {
            "alias": "B0CQ4STXZR",
            "amazonChoice": "Y",
            "amazonChoiceLabel": "Amazon's Choice",
            "amazonChoiceUrl": "/s/ref=choice_dp_b?keywords=lufeiya%20computer%20desk",
            "asin": "B0CQ4STXZR",
            "asinUrl": "https://www.amazon.com/dp/B0CQ4STXZR?psc=1",
            "availableDate": 1702310400000,
            "bestSeller": "N",
            "brand": "Lufeiya",
            "brandImage": "https://m.media-amazon.com/images/S/stores-image-uploads-na-prod/c/AmazonStores/ATVPDKIKX0DER/884ca65b07e119e07a6164beef9d0f60.w1754.h1754._RO876,1,0,0,0,0,0,0,0,0,15_FMpng_.jpg",
            "brandUrl": "/stores/LUFEIYA/page/286014F1-E7F9-4883-9C03-6BD4FA62A3EE?lp_asin=B0CQ4STXZR&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto",
            "bsrId": "home-garden",
            "bsrLabel": "Home & Kitchen",
            "bsrRank": 3918,
            "bsrSubId": "3733671",
            "bsrSubLabel": "Home Office Desks",
            "bsrSubRank": 19,
            "categoryId": "home-garden",
            "categoryName": "Home & Kitchen",
            "coupon": "",
            "createdTime": 1704536713000,
            "deliveryPrice": -1.0,
            "diamond": "B0D5BMFK9S",
            "dimensions": "19.7\"D x 46.6\"W x 29.5\"H",
            "ebc": "Y",
            "features": [
                "Vintage Style Design: This Splice Board Desk is made of thick P2 Particle wood board with scratch-resistant, anti-collision and waterproof, protect home office desk surface from daily wear and tear, rustic desktop match black metal steel frame match almost room decoration, giving you spacious and free workstation space for your office activities, like working, studying, gaming, and so on. The desk is USPTO Patent Approved（ Patent Number: 29937022）",
                "Versatile File Cabinet: Computer desk with 3 𝙁𝙖𝙗𝙧𝙞𝙘 𝘿𝙧𝙖𝙬𝙚𝙧𝙨, the addition of this feature renders the desk lightweight and facilitates its mobility. One versatile file cabinet keep everything you need well organized and easily accessible. Two small drawers offers storage solution to your home office supplies. The adjustable file drawer is suitable for hanging legal size or letter size files. You can try this two installation methods (left or right).",
                "Sturdy Structure: Extra fixed steel brackets and adjustable leg pads provide greater stability, ensure the desktop is level, non-slip & anti-scratch protectors under the legs to protect your floor from scratching and reducing noises when moving.",
                "Easy Assemble: A detailed instruction manual and tool are provided, no other tools required, quick and easy to assemble, about 20 minutes.",
                "After-sale Service: Provides professional customer service, easy and fast replacement is guaranteed if have quality problem of the desk, please feel free to contact us."
            ],
            "firstReviewDate": 1709568000000,
            "guestVisited": false,
            "imageUrl": "https://m.media-amazon.com/images/I/41QFkBW9VqL._AC_US200_.jpg",
            "lqs": 100,
            "monthUnits": 400,
            "monthUnitsUpdatedTime": 1788164625000,
            "newRelease": "N",
            "nodeId": 3733671,
            "nodeIdPath": "1055398:1063306:1063312:3733671",
            "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
            "nonSharedDiamond": "B0CQ4Q4S3B",
            "overviews": "{\"Brand\":\"Lufeiya\",\"Shape\":\"Rectangular\",\"Desk design\":\"Computer Desk, Writing Desk\",\"Product Dimensions\":\"19.7\\\"D x 46.6\\\"W x 29.5\\\"H\",\"Color\":\"Rustic Brown\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\",\"Top Material Type\":\"Tabletop made of FSC-Certified Wood\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Reversible\"}",
            "parent": "B0D93D2G2W",
            "price": 79.99,
            "primeExclusivePrice": -1.0,
            "rating": 4.4,
            "ratingsShare": 0,
            "reviewHighlights": "[{\"summary\":\"Customers are satisfied with the desk's quality, finding it nicer than expected and exactly what they wanted.\",\"negative\":54,\"label\":\"quality\",\"positive\":229},{\"summary\":\"Customers find the desk easy to put together, with one mentioning that it can be assembled with the drawers on either side.\",\"negative\":21,\"label\":\"assembly\",\"positive\":187},{\"summary\":\"Customers find the desk offers great value for money, with multiple customers mentioning they would buy it again and one noting it doesn't break the bank.\",\"negative\":24,\"label\":\"value for money\",\"positive\":116},{\"summary\":\"Customers appreciate the desk's size, describing it as perfect for various spaces, including children's rooms, with roomy drawers that store household essentials.\",\"negative\":6,\"label\":\"size\",\"positive\":92},{\"summary\":\"Customers like the desk's appearance, noting that it looks nice and matches well with bed frames, with one customer mentioning it's not cluttered looking.\",\"negative\":9,\"label\":\"appearance\",\"positive\":80},{\"summary\":\"Customers find that the desk works well, particularly as a secondary declutter desk, with the drawers functioning effectively. One customer mentions it's perfect for small home office space.\",\"negative\":8,\"label\":\"functionality\",\"positive\":44},{\"summary\":\"Customers have mixed opinions about the desk's drawers, with some loving the side pockets and finding them perfect for office items, while others dislike them.\",\"negative\":25,\"label\":\"drawer quality\",\"positive\":36},{\"summary\":\"Customers express dissatisfaction with the desk's drawers, which are made of fabric rather than wood.\",\"negative\":51,\"label\":\"material\",\"positive\":17}]",
            "reviewSummary": "Customers find the desk easy to assemble and appreciate its value for money, with one mentioning it can be built with drawers on either side. The size is perfect for small spaces, with one noting it accommodates normal office needs, and customers like its appearance, particularly how it matches bed frames. The functionality receives positive feedback, working well as a secondary declutter desk. While customers love the side pockets and drawers for office items, the material quality receives mixed reviews, with several customers noting the drawers are made of fabric rather than wood.",
            "reviews": 2339,
            "reviewsShare": 148,
            "sellerId": "A1G57VOI7NPB74",
            "sellerName": "Lufeiya",
            "sellerType": "FBA",
            "sellers": 1,
            "sku": [
                "Color: Rustic Brown",
                "Size: 46.6\""
            ],
            "skuStr": "Color: Rustic Brown | Size: 46.6\"",
            "station": "GLOBAL",
            "subcategories": [
                {
                    "code": "3733671",
                    "label": "Home Office Desks",
                    "rank": 7
                }
            ],
            "title": "Lufeiya Computer Desk with File Drawers Cabinet, 47 Inch Reversible Home Office Desks with Fabric Filing Cabinet for Small Space, Study Writing Table PC Desks, Rustic Brown",
            "totalReview": 0,
            "updatedTime": 1788164625000,
            "variationList": [
                {
                    "asin": "B0DGLDWY9C",
                    "attribute": "Color: Black | Size: 54.6\""
                },
                {
                    "asin": "B0CQ4Q4S3B",
                    "attribute": "Color: White | Size: 46.6\""
                },
                {
                    "asin": "B0D5BMFK9S",
                    "attribute": "Color: Black | Size: 46.6\""
                },
                {
                    "asin": "B0DDYDWBQQ",
                    "attribute": "Color: White | Size: 54.6\""
                },
                {
                    "asin": "B0CQ4STXZR",
                    "attribute": "Color: Rustic Brown | Size: 46.6\""
                },
                {
                    "asin": "B0DS4DVX1T",
                    "attribute": "Color: Grey | Size: 46.6\""
                },
                {
                    "asin": "B0DDYDBTNF",
                    "attribute": "Color: Rustic Brown | Size: 54.6\""
                }
            ],
            "variations": 7,
            "videoUrl": "N",
            "weight": "31.5 pounds",
            "zoomImageUrl": "https://m.media-amazon.com/images/I/41QFkBW9VqL._AC_US600_.jpg"
        },
        "chartData": {
            "2024-06": {
                "alias": "B0CQ4STXZR",
                "amazonChoice": "Home Office Desks by Lufeiya",
                "amzUnit": 1000,
                "amzUnitDate": 1719541139524,
                "amzUnitTrend": "{\"202402\":200,\"202403\":700,\"202404\":200,\"202405\":500,\"202406\":1000}",
                "amzUnitTrends": [
                    {
                        "dk": "202402",
                        "sales": 200
                    },
                    {
                        "dk": "202403",
                        "sales": 700
                    },
                    {
                        "dk": "202404",
                        "sales": 200
                    },
                    {
                        "dk": "202405",
                        "sales": 500
                    },
                    {
                        "dk": "202406",
                        "sales": 1000
                    }
                ],
                "asin": "B0CQ4STXZR",
                "availableDate": 1707276720000,
                "availableDays": 143,
                "availableMonth": 4,
                "availableYear": 0,
                "averagePrice": 99.99,
                "brand": "Lufeiya",
                "brandUrl": "https://www.amazon.com/s?k=Lufeiya",
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRank": 34140,
                "bsrRankCr": -27.93,
                "bsrRankCv": -7453,
                "categoryId": "1055398",
                "categoryName": "Home & Kitchen",
                "channel": "P",
                "coupon": "",
                "curMon": false,
                "deliveryPrice": 74.12,
                "dimensionType": "EL15O",
                "dimensions": "19.7 x 46.6 x 29.5 inches",
                "ebc": "Y",
                "fba": 21.21,
                "firstReviewDate": 1707276720000,
                "guestVisited": false,
                "id": "USB0CQ4STXZR",
                "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/71yX-N0LTuL._AC_US200_.jpg",
                "lqs": 80,
                "marketId": 1,
                "monDailySales": "",
                "monthId": 202406,
                "monthName": "202406",
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "order": {
                    "desc": true,
                    "field": ""
                },
                "overviews": "{\"Brand\":\"Lufeiya\",\"Product Dimensions\":\"19.7\\\"D x 46.6\\\"W x 29.5\\\"H\",\"Color\":\"Rustic Brown\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Reversible\",\"Room Type\":\"Office, Living Room, Bedroom, Study Room\",\"Recommended Uses For Product\":\"Working, Writing, Gaming\",\"Furniture leg material\":\"Metal\"}",
                "page": 0,
                "pages": 0,
                "parent": "B0D5BMFK9S",
                "parentChangeHis": [],
                "price": 99.99,
                "primeExclusivePrice": -1.0,
                "profit": 63.79,
                "rating": 4.4,
                "reviews": 205,
                "reviewsDelta": -25,
                "reviewsIncreasement": 31,
                "salesTrend": "{\"202309\":0,\"202406\":0,\"202307\":0,\"202308\":0,\"202404\":337,\"202405\":1688,\"202306\":0,\"202402\":704,\"202403\":2349,\"202312\":0,\"202401\":0,\"202310\":0,\"202311\":0}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerNation": "CN",
                "sellerType": "FBA",
                "sellers": 1,
                "sku": "Size: 46.6\" | Color: Rustic Brown",
                "station": "GLOBAL",
                "subcategories": [
                    {
                        "code": "3733671",
                        "label": "Home Office Desks",
                        "rank": 110
                    }
                ],
                "symbol": "Y",
                "syncTime": 1721636136079,
                "title": "Lufeiya Computer Desk with Fabric File Drawers Cabinet, 47 Inch Home Office Desks with Filing Cabinet for Small Space, Study Writing Table PC Desks, Rustic Brown",
                "took": 0,
                "total": 0,
                "totalAmount": 0.0,
                "totalAmountGrowth": 100.0,
                "totalUnits": 0,
                "totalUnitsGrowth": 100.0,
                "trends": [
                    {
                        "dk": "202306",
                        "sales": 0
                    },
                    {
                        "dk": "202307",
                        "sales": 0
                    },
                    {
                        "dk": "202308",
                        "sales": 0
                    },
                    {
                        "dk": "202309",
                        "sales": 0
                    },
                    {
                        "dk": "202310",
                        "sales": 0
                    },
                    {
                        "dk": "202311",
                        "sales": 0
                    },
                    {
                        "dk": "202312",
                        "sales": 0
                    },
                    {
                        "dk": "202401",
                        "sales": 0
                    },
                    {
                        "dk": "202402",
                        "sales": 704
                    },
                    {
                        "dk": "202403",
                        "sales": 2349
                    },
                    {
                        "dk": "202404",
                        "sales": 337
                    },
                    {
                        "dk": "202405",
                        "sales": 1688
                    },
                    {
                        "dk": "202406",
                        "sales": 0
                    }
                ],
                "updatedTime": 1721647579963,
                "variations": 3,
                "video": "N",
                "weight": "31.8 pounds"
            },
            "2024-07": {
                "alias": "B0CQ4STXZR",
                "amazonChoice": "Home Office Desks by Lufeiya",
                "amzUnit": 300,
                "amzUnitDate": 1722565638000,
                "amzUnitTrend": "{\"202402\":200,\"202403\":700,\"202404\":200,\"202405\":500,\"202406\":1000}",
                "amzUnitTrends": [
                    {
                        "dk": "202402",
                        "sales": 200
                    },
                    {
                        "dk": "202403",
                        "sales": 700
                    },
                    {
                        "dk": "202404",
                        "sales": 200
                    },
                    {
                        "dk": "202405",
                        "sales": 500
                    },
                    {
                        "dk": "202406",
                        "sales": 1000
                    }
                ],
                "asin": "B0CQ4STXZR",
                "availableDate": 1707276720000,
                "availableDays": 174,
                "availableMonth": 5,
                "availableYear": 0,
                "averagePrice": 99.35,
                "brand": "Lufeiya",
                "brandUrl": "https://www.amazon.com/s?k=Lufeiya",
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRank": 11067,
                "bsrRankCr": 43.05,
                "bsrRankCv": 8367,
                "categoryId": "1055398",
                "categoryName": "Home & Kitchen",
                "channel": "P",
                "coupon": "",
                "curMon": false,
                "deliveryPrice": 74.12,
                "dimensionType": "EL15O",
                "dimensions": "19.7 x 46.6 x 29.5 inches",
                "ebc": "Y",
                "fba": 21.21,
                "firstReviewDate": 1707276720000,
                "guestVisited": false,
                "id": "USB0CQ4STXZR",
                "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/71yX-N0LTuL._AC_US200_.jpg",
                "lqs": 100,
                "marketId": 1,
                "monDailySales": "",
                "monthId": 202407,
                "monthName": "202407",
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "order": {
                    "desc": true,
                    "field": ""
                },
                "overviews": "{\"Brand\":\"Lufeiya\",\"Product Dimensions\":\"19.7\\\"D x 46.6\\\"W x 29.5\\\"H\",\"Color\":\"Rustic Brown\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Reversible\",\"Room Type\":\"Office, Living Room, Bedroom, Study Room\",\"Recommended Uses For Product\":\"Working, Writing, Gaming\",\"Furniture leg material\":\"Metal\"}",
                "page": 0,
                "pages": 0,
                "parent": "B0D93D2G2W",
                "parentChangeHis": [
                    {
                        "timePoint": 1720022400000,
                        "value": "B0CVD77VP1"
                    },
                    {
                        "timePoint": 1720022400000,
                        "value": "B0CQ4STXZR"
                    },
                    {
                        "timePoint": 1720454400000,
                        "value": "B0D93D2G2W"
                    }
                ],
                "price": 99.99,
                "primeExclusivePrice": -1.0,
                "profit": 63.79,
                "rating": 4.3,
                "reviews": 200,
                "reviewsDelta": 0,
                "reviewsIncreasement": 0,
                "reviewsRate": 0.0,
                "salesTrend": "{\"202309\":0,\"202406\":1598,\"202307\":0,\"202407\":1775,\"202308\":0,\"202404\":337,\"202405\":1688,\"202402\":704,\"202403\":2349,\"202312\":0,\"202401\":0,\"202310\":0,\"202311\":0}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerNation": "CN",
                "sellerType": "FBA",
                "sellers": 1,
                "sku": "Size: 46.6\" | Color: Rustic Brown",
                "station": "GLOBAL",
                "subcategories": [
                    {
                        "code": "3733671",
                        "label": "Home Office Desks",
                        "rank": 47
                    }
                ],
                "symbol": "N",
                "syncTime": 1722565427000,
                "title": "Lufeiya Computer Desk with Fabric File Drawers Cabinet, 47 Inch Home Office Desks with Filing Cabinet for Small Space, Study Writing Table PC Desks, Rustic Brown",
                "took": 0,
                "total": 0,
                "totalAmount": 176346.25,
                "totalAmountGrowth": 100.0,
                "totalUnits": 1775,
                "totalUnitsGrowth": 100.0,
                "trends": [
                    {
                        "dk": "202307",
                        "sales": 0
                    },
                    {
                        "dk": "202308",
                        "sales": 0
                    },
                    {
                        "dk": "202309",
                        "sales": 0
                    },
                    {
                        "dk": "202310",
                        "sales": 0
                    },
                    {
                        "dk": "202311",
                        "sales": 0
                    },
                    {
                        "dk": "202312",
                        "sales": 0
                    },
                    {
                        "dk": "202401",
                        "sales": 0
                    },
                    {
                        "dk": "202402",
                        "sales": 704
                    },
                    {
                        "dk": "202403",
                        "sales": 2349
                    },
                    {
                        "dk": "202404",
                        "sales": 337
                    },
                    {
                        "dk": "202405",
                        "sales": 1688
                    },
                    {
                        "dk": "202406",
                        "sales": 1598
                    },
                    {
                        "dk": "202407",
                        "sales": 1775
                    }
                ],
                "updatedTime": 1722587797348,
                "variations": 3,
                "video": "N",
                "weight": "31.8 pounds"
            },
            "2024-08": {
                "alias": "B0CQ4STXZR",
                "amazonChoice": "Home Office Desks by Lufeiya",
                "amzUnit": 1000,
                "amzUnitDate": 1725078297000,
                "amzUnitTrend": "{\"202402\":200,\"202403\":700,\"202404\":200,\"202405\":500,\"202406\":1000,\"202407\":200}",
                "amzUnitTrends": [
                    {
                        "dk": "202402",
                        "sales": 200
                    },
                    {
                        "dk": "202403",
                        "sales": 700
                    },
                    {
                        "dk": "202404",
                        "sales": 200
                    },
                    {
                        "dk": "202405",
                        "sales": 500
                    },
                    {
                        "dk": "202406",
                        "sales": 1000
                    },
                    {
                        "dk": "202407",
                        "sales": 200
                    }
                ],
                "asin": "B0CQ4STXZR",
                "availableDate": 1707276720000,
                "availableDays": 205,
                "availableMonth": 6,
                "availableYear": 0,
                "averagePrice": 98.37,
                "brand": "Lufeiya",
                "brandUrl": "https://www.amazon.com/s?k=Lufeiya",
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRank": 6580,
                "bsrRankCr": -1.89,
                "bsrRankCv": -122,
                "categoryId": "1055398",
                "categoryName": "Home & Kitchen",
                "channel": "P",
                "coupon": "",
                "curMon": false,
                "deliveryPrice": -1.0,
                "dimensionType": "EL15O",
                "dimensions": "19.7 x 46.6 x 29.5 inches",
                "ebc": "Y",
                "fba": 21.21,
                "firstReviewDate": 1707276720000,
                "guestVisited": false,
                "id": "USB0CQ4STXZR",
                "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/71yX-N0LTuL._AC_US200_.jpg",
                "lqs": 83,
                "marketId": 1,
                "monDailySales": "",
                "monthId": 202408,
                "monthName": "202408",
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "order": {
                    "desc": true,
                    "field": ""
                },
                "overviews": "{\"Brand\":\"Lufeiya\",\"Product Dimensions\":\"19.7\\\"D x 46.6\\\"W x 29.5\\\"H\",\"Color\":\"Rustic Brown\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Reversible\",\"Room Type\":\"Office, Bedroom, Living Room, Study Room\",\"Recommended Uses For Product\":\"Working, Writing, Gaming\",\"Furniture leg material\":\"Metal\"}",
                "page": 0,
                "pages": 0,
                "parent": "B0D93D2G2W",
                "parentChangeHis": [
                    {
                        "timePoint": 1720022400000,
                        "value": "B0CVD77VP1"
                    },
                    {
                        "timePoint": 1720022400000,
                        "value": "B0CQ4STXZR"
                    },
                    {
                        "timePoint": 1720454400000,
                        "value": "B0D93D2G2W"
                    }
                ],
                "price": 99.99,
                "primeExclusivePrice": -1.0,
                "profit": 63.79,
                "rating": 4.3,
                "reviews": 256,
                "reviewsDelta": 0,
                "reviewsIncreasement": 56,
                "reviewsRate": 1.39,
                "salesTrend": "{\"202408\":4033,\"202309\":0,\"202406\":1598,\"202407\":1775,\"202308\":0,\"202404\":337,\"202405\":1688,\"202402\":704,\"202403\":2349,\"202312\":0,\"202401\":0,\"202310\":0,\"202311\":0}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerNation": "CN",
                "sellerType": "FBA",
                "sellers": 1,
                "sku": "Size: 46.6\" | Color: Rustic Brown",
                "station": "GLOBAL",
                "subcategories": [
                    {
                        "code": "3733671",
                        "label": "Home Office Desks",
                        "rank": 21
                    }
                ],
                "symbol": "N",
                "syncTime": 1725203894000,
                "title": "Lufeiya Computer Desk with Fabric File Drawers Cabinet, 47 Inch Home Office Desks with Filing Cabinet for Small Space, Study Writing Table PC Desks, Rustic Brown",
                "took": 0,
                "total": 0,
                "totalAmount": 396726.22,
                "totalAmountGrowth": 132.0,
                "totalUnits": 4033,
                "totalUnitsGrowth": 132.0,
                "trends": [
                    {
                        "dk": "202308",
                        "sales": 0
                    },
                    {
                        "dk": "202309",
                        "sales": 0
                    },
                    {
                        "dk": "202310",
                        "sales": 0
                    },
                    {
                        "dk": "202311",
                        "sales": 0
                    },
                    {
                        "dk": "202312",
                        "sales": 0
                    },
                    {
                        "dk": "202401",
                        "sales": 0
                    },
                    {
                        "dk": "202402",
                        "sales": 704
                    },
                    {
                        "dk": "202403",
                        "sales": 2349
                    },
                    {
                        "dk": "202404",
                        "sales": 337
                    },
                    {
                        "dk": "202405",
                        "sales": 1688
                    },
                    {
                        "dk": "202406",
                        "sales": 1598
                    },
                    {
                        "dk": "202407",
                        "sales": 1775
                    },
                    {
                        "dk": "202408",
                        "sales": 4033
                    }
                ],
                "updatedTime": 1725227272805,
                "variations": 2,
                "video": "N",
                "weight": "31.8 pounds"
            },
            "2024-09": {
                "alias": "B0CQ4STXZR",
                "amazonChoice": "Overall Pick",
                "amzUnit": 800,
                "amzUnitDate": 1727951253000,
                "amzUnitTrend": "{\"202402\":200,\"202403\":700,\"202404\":200,\"202405\":500,\"202406\":1000,\"202407\":200,\"202408\":1000}",
                "amzUnitTrends": [
                    {
                        "dk": "202402",
                        "sales": 200
                    },
                    {
                        "dk": "202403",
                        "sales": 700
                    },
                    {
                        "dk": "202404",
                        "sales": 200
                    },
                    {
                        "dk": "202405",
                        "sales": 500
                    },
                    {
                        "dk": "202406",
                        "sales": 1000
                    },
                    {
                        "dk": "202407",
                        "sales": 200
                    },
                    {
                        "dk": "202408",
                        "sales": 1000
                    }
                ],
                "asin": "B0CQ4STXZR",
                "availableDate": 1707276720000,
                "availableDays": 235,
                "availableMonth": 7,
                "availableYear": 0,
                "averagePrice": 97.68,
                "brand": "Lufeiya",
                "brandUrl": "https://www.amazon.com/s?k=Lufeiya",
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRank": 16472,
                "bsrRankCr": 7.64,
                "bsrRankCv": 1363,
                "categoryId": "1055398",
                "categoryName": "Home & Kitchen",
                "channel": "P",
                "coupon": "",
                "curMon": false,
                "deliveryPrice": -1.0,
                "dimensionType": "EL15O",
                "dimensions": "19.7 x 46.6 x 29.5 inches",
                "ebc": "Y",
                "fba": 21.21,
                "firstReviewDate": 1707276720000,
                "guestVisited": false,
                "id": "USB0CQ4STXZR",
                "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/71yX-N0LTuL._AC_US200_.jpg",
                "lqs": 100,
                "marketId": 1,
                "monDailySales": "",
                "monthId": 202409,
                "monthName": "202409",
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "order": {
                    "desc": true,
                    "field": ""
                },
                "overviews": "{\"Brand\":\"Lufeiya\",\"Product Dimensions\":\"19.7\\\"D x 46.6\\\"W x 29.5\\\"H\",\"Color\":\"Rustic Brown\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Reversible\",\"Room Type\":\"Office, Living Room, Bedroom, Study Room\",\"Recommended Uses For Product\":\"Working, Writing, Gaming\",\"Furniture leg material\":\"Metal\"}",
                "page": 0,
                "pages": 0,
                "parent": "B0D93D2G2W",
                "parentChangeHis": [
                    {
                        "timePoint": 1720022400000,
                        "value": "B0CVD77VP1"
                    },
                    {
                        "timePoint": 1720022400000,
                        "value": "B0CQ4STXZR"
                    },
                    {
                        "timePoint": 1720454400000,
                        "value": "B0D93D2G2W"
                    }
                ],
                "pkgDimensionType": "LB",
                "pkgDimensions": "34.8 x 21.4 x 4.3 inches",
                "pkgVolumeWeights": 10449.897,
                "pkgWeight": "34.05 pounds",
                "price": 99.99,
                "primeExclusivePrice": 89.87,
                "profit": 63.79,
                "rating": 4.2,
                "reviews": 332,
                "reviewsDelta": 5,
                "reviewsIncreasement": 74,
                "reviewsRate": 3.31,
                "salesTrend": "{\"202408\":4033,\"202309\":0,\"202409\":2238,\"202406\":1598,\"202407\":1775,\"202404\":337,\"202405\":1688,\"202402\":704,\"202403\":2349,\"202312\":0,\"202401\":0,\"202310\":0,\"202311\":0}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerNation": "CN",
                "sellerType": "FBA",
                "sellers": 1,
                "sku": "Size: 46.6\" | Color: Rustic Brown",
                "station": "GLOBAL",
                "subcategories": [
                    {
                        "code": "3733671",
                        "label": "Home Office Desks",
                        "rank": 54
                    }
                ],
                "symbol": "N",
                "syncTime": 1727966698000,
                "title": "Lufeiya Computer Desk with Fabric File Drawers Cabinet, 47 Inch Home Office Desks with Filing Cabinet for Small Space, Study Writing Table PC Desks, Rustic Brown",
                "took": 0,
                "total": 0,
                "totalAmount": 218607.84,
                "totalAmountGrowth": -38.0,
                "totalUnits": 2238,
                "totalUnitsGrowth": -38.0,
                "trends": [
                    {
                        "dk": "202309",
                        "sales": 0
                    },
                    {
                        "dk": "202310",
                        "sales": 0
                    },
                    {
                        "dk": "202311",
                        "sales": 0
                    },
                    {
                        "dk": "202312",
                        "sales": 0
                    },
                    {
                        "dk": "202401",
                        "sales": 0
                    },
                    {
                        "dk": "202402",
                        "sales": 704
                    },
                    {
                        "dk": "202403",
                        "sales": 2349
                    },
                    {
                        "dk": "202404",
                        "sales": 337
                    },
                    {
                        "dk": "202405",
                        "sales": 1688
                    },
                    {
                        "dk": "202406",
                        "sales": 1598
                    },
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
                    }
                ],
                "updatedTime": 1727971517742,
                "variations": 3,
                "video": "N",
                "weight": "31.8 pounds"
            },
            "2024-10": {
                "alias": "B0CQ4STXZR",
                "amazonChoice": "Overall Pick",
                "amzUnit": 700,
                "amzUnitDate": 1730531403000,
                "amzUnitTrend": "{\"202402\":200,\"202403\":700,\"202404\":200,\"202405\":500,\"202406\":1000,\"202407\":200,\"202408\":1000,\"202409\":900}",
                "amzUnitTrends": [
                    {
                        "dk": "202402",
                        "sales": 200
                    },
                    {
                        "dk": "202403",
                        "sales": 700
                    },
                    {
                        "dk": "202404",
                        "sales": 200
                    },
                    {
                        "dk": "202405",
                        "sales": 500
                    },
                    {
                        "dk": "202406",
                        "sales": 1000
                    },
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
                    }
                ],
                "asin": "B0CQ4STXZR",
                "availableDate": 1707276720000,
                "availableDays": 266,
                "availableMonth": 8,
                "availableYear": 0,
                "averagePrice": 99.99,
                "brand": "Lufeiya",
                "brandUrl": "https://www.amazon.com/s?k=Lufeiya",
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRank": 7084,
                "bsrRankCr": 25.7,
                "bsrRankCv": 2450,
                "categoryId": "1055398",
                "categoryName": "Home & Kitchen",
                "channel": "P",
                "coupon": "",
                "curMon": false,
                "deliveryPrice": -1.0,
                "dimensionType": "EL15O",
                "dimensions": "19.7 x 46.6 x 29.5 inches",
                "ebc": "Y",
                "fba": 20.73,
                "firstReviewDate": 1707276720000,
                "guestVisited": false,
                "id": "USB0CQ4STXZR",
                "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/71yX-N0LTuL._AC_US200_.jpg",
                "lqs": 100,
                "marketId": 1,
                "monDailySales": "",
                "monthId": 202410,
                "monthName": "202410",
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "order": {
                    "desc": true,
                    "field": ""
                },
                "overviews": "{\"Brand\":\"Lufeiya\",\"Product Dimensions\":\"19.7\\\"D x 46.6\\\"W x 29.5\\\"H\",\"Color\":\"Rustic Brown\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Reversible\",\"Room Type\":\"Office, Living Room, Bedroom, Study Room\",\"Recommended Uses For Product\":\"Working, Writing, Gaming\",\"Furniture leg material\":\"Metal\"}",
                "page": 0,
                "pages": 0,
                "parent": "B0D93D2G2W",
                "parentChangeHis": [
                    {
                        "timePoint": 1720022400000,
                        "value": "B0CVD77VP1"
                    },
                    {
                        "timePoint": 1720022400000,
                        "value": "B0CQ4STXZR"
                    },
                    {
                        "timePoint": 1720454400000,
                        "value": "B0D93D2G2W"
                    }
                ],
                "pkgDimensionType": "LB",
                "pkgDimensions": "34.3 x 21.3 x 3.7 inches",
                "pkgVolumeWeights": 8821.168,
                "pkgWeight": "31 pounds",
                "price": 99.99,
                "primeExclusivePrice": -1.0,
                "profit": 64.27,
                "rating": 4.2,
                "reviews": 393,
                "reviewsDelta": 0,
                "reviewsIncreasement": 61,
                "reviewsRate": 2.07,
                "salesTrend": "{\"202408\":4033,\"202409\":2238,\"202406\":1598,\"202407\":1775,\"202404\":337,\"202405\":1688,\"202402\":704,\"202403\":2349,\"202312\":0,\"202401\":0,\"202310\":0,\"202410\":2945,\"202311\":0}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerNation": "CN",
                "sellerType": "FBA",
                "sellers": 1,
                "sku": "Color: Rustic Brown | Size: 46.6\"",
                "station": "GLOBAL",
                "subcategories": [
                    {
                        "code": "3733671",
                        "label": "Home Office Desks",
                        "rank": 10
                    }
                ],
                "symbol": "N",
                "syncTime": 1730550484000,
                "title": "Lufeiya Computer Desk with Fabric File Drawers Cabinet, 47 Inch Home Office Desks with Filing Cabinet for Small Space, Study Writing Table PC Desks, Rustic Brown",
                "took": 0,
                "total": 0,
                "totalAmount": 294470.53,
                "totalAmountGrowth": 0.0,
                "totalUnits": 2945,
                "totalUnitsGrowth": 0.0,
                "trends": [
                    {
                        "dk": "202310",
                        "sales": 0
                    },
                    {
                        "dk": "202311",
                        "sales": 0
                    },
                    {
                        "dk": "202312",
                        "sales": 0
                    },
                    {
                        "dk": "202401",
                        "sales": 0
                    },
                    {
                        "dk": "202402",
                        "sales": 704
                    },
                    {
                        "dk": "202403",
                        "sales": 2349
                    },
                    {
                        "dk": "202404",
                        "sales": 337
                    },
                    {
                        "dk": "202405",
                        "sales": 1688
                    },
                    {
                        "dk": "202406",
                        "sales": 1598
                    },
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
                    }
                ],
                "updatedTime": 1730566632652,
                "variations": 3,
                "video": "N",
                "weight": "31.8 Pounds"
            },
            "2024-11": {
                "alias": "B0CQ4STXZR",
                "amazonChoice": "office desk with drawers",
                "amzUnit": 900,
                "amzUnitDate": 1733069718000,
                "amzUnitTrend": "{\"202402\":200,\"202403\":700,\"202404\":200,\"202405\":500,\"202406\":1000,\"202407\":200,\"202408\":1000,\"202409\":900,\"202410\":700}",
                "amzUnitTrends": [
                    {
                        "dk": "202402",
                        "sales": 200
                    },
                    {
                        "dk": "202403",
                        "sales": 700
                    },
                    {
                        "dk": "202404",
                        "sales": 200
                    },
                    {
                        "dk": "202405",
                        "sales": 500
                    },
                    {
                        "dk": "202406",
                        "sales": 1000
                    },
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
                    }
                ],
                "asin": "B0CQ4STXZR",
                "availableDate": 1707276720000,
                "availableDays": 296,
                "availableMonth": 9,
                "availableYear": 0,
                "averagePrice": 96.59,
                "brand": "Lufeiya",
                "brandUrl": "https://www.amazon.com/s?k=Lufeiya",
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRank": 5853,
                "bsrRankCr": 16.64,
                "bsrRankCv": 1168,
                "categoryId": "1055398",
                "categoryName": "Home & Kitchen",
                "channel": "P",
                "coupon": "",
                "curMon": false,
                "deliveryPrice": -1.0,
                "dimensionType": "EL15O",
                "dimensions": "19.7 x 46.6 x 29.5 inches",
                "ebc": "Y",
                "fba": 20.73,
                "firstReviewDate": 1707276720000,
                "guestVisited": false,
                "id": "USB0CQ4STXZR",
                "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/71yX-N0LTuL._AC_US200_.jpg",
                "lqs": 100,
                "marketId": 1,
                "monDailySales": "",
                "monthId": 202411,
                "monthName": "202411",
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "order": {
                    "desc": true,
                    "field": ""
                },
                "overviews": "{\"Brand\":\"Lufeiya\",\"Product Dimensions\":\"19.7\\\"D x 46.6\\\"W x 29.5\\\"H\",\"Color\":\"Rustic Brown\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Reversible\",\"Room Type\":\"Office, Living Room, Bedroom, Study Room\",\"Recommended Uses For Product\":\"Working, Writing, Gaming\",\"Furniture leg material\":\"Metal\"}",
                "page": 0,
                "pages": 0,
                "parent": "B0D93D2G2W",
                "parentChangeHis": [
                    {
                        "timePoint": 1720022400000,
                        "value": "B0CVD77VP1"
                    },
                    {
                        "timePoint": 1720022400000,
                        "value": "B0CQ4STXZR"
                    },
                    {
                        "timePoint": 1720454400000,
                        "value": "B0D93D2G2W"
                    }
                ],
                "pkgDimensionType": "LB",
                "pkgDimensions": "34.5 x 21.5 x 4 inches",
                "pkgVolumeWeights": 9682.068,
                "pkgWeight": "30.9 pounds",
                "price": 89.87,
                "primeExclusivePrice": -1.0,
                "rating": 4.2,
                "reviews": 439,
                "reviewsDelta": 1,
                "reviewsIncreasement": 46,
                "reviewsRate": 1.1,
                "salesTrend": "{\"202408\":4033,\"202409\":2238,\"202406\":1598,\"202407\":1775,\"202404\":337,\"202405\":1688,\"202402\":704,\"202403\":2349,\"202411\":4187,\"202312\":0,\"202401\":0,\"202410\":2945,\"202311\":0}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerNation": "CN",
                "sellerType": "FBA",
                "sellers": 1,
                "sku": "Size: 46.6\" | Color: Rustic Brown",
                "station": "GLOBAL",
                "subcategories": [
                    {
                        "code": "3733671",
                        "label": "Home Office Desks",
                        "rank": 37
                    }
                ],
                "symbol": "N",
                "syncTime": 1733083099000,
                "title": "Lufeiya Computer Desk with Fabric File Drawers Cabinet, 47 Inch Home Office Desks with Filing Cabinet for Small Space, Study Writing Table PC Desks, Rustic Brown",
                "took": 0,
                "total": 0,
                "totalAmount": 404422.3,
                "totalUnits": 4187,
                "trends": [
                    {
                        "dk": "202311",
                        "sales": 0
                    },
                    {
                        "dk": "202312",
                        "sales": 0
                    },
                    {
                        "dk": "202401",
                        "sales": 0
                    },
                    {
                        "dk": "202402",
                        "sales": 704
                    },
                    {
                        "dk": "202403",
                        "sales": 2349
                    },
                    {
                        "dk": "202404",
                        "sales": 337
                    },
                    {
                        "dk": "202405",
                        "sales": 1688
                    },
                    {
                        "dk": "202406",
                        "sales": 1598
                    },
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
                    }
                ],
                "updatedTime": 1733098978532,
                "variations": 4,
                "video": "N",
                "weight": "31.8 Pounds"
            },
            "2024-12": {
                "alias": "B0CQ4STXZR",
                "amazonChoice": "lufeiya computer desk with fabric file drawers",
                "amzUnit": 400,
                "amzUnitDate": 1735720084000,
                "amzUnitTrend": "{\"202402\":200,\"202403\":700,\"202404\":200,\"202405\":500,\"202406\":1000,\"202407\":200,\"202408\":1000,\"202409\":900,\"202410\":700,\"202411\":900}",
                "amzUnitTrends": [
                    {
                        "dk": "202402",
                        "sales": 200
                    },
                    {
                        "dk": "202403",
                        "sales": 700
                    },
                    {
                        "dk": "202404",
                        "sales": 200
                    },
                    {
                        "dk": "202405",
                        "sales": 500
                    },
                    {
                        "dk": "202406",
                        "sales": 1000
                    },
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
                    }
                ],
                "asin": "B0CQ4STXZR",
                "availableDate": 1707276720000,
                "availableDays": 327,
                "availableMonth": 10,
                "availableYear": 0,
                "averagePrice": 98.66,
                "brand": "Lufeiya",
                "brandUrl": "https://www.amazon.com/s?k=Lufeiya",
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRank": 17930,
                "bsrRankCr": 42.47,
                "bsrRankCv": 13234,
                "categoryId": "1055398",
                "categoryName": "Home & Kitchen",
                "channel": "P",
                "coupon": "",
                "curMon": false,
                "deliveryPrice": -1.0,
                "dimensionType": "EL15O",
                "dimensions": "19.7 x 46.6 x 29.5 inches",
                "ebc": "Y",
                "fba": 20.73,
                "firstReviewDate": 1707276720000,
                "guestVisited": false,
                "id": "USB0CQ4STXZR",
                "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/71yX-N0LTuL._AC_US200_.jpg",
                "lqs": 100,
                "marketId": 1,
                "monDailySales": "",
                "monthId": 202412,
                "monthName": "202412",
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "order": {
                    "desc": true,
                    "field": ""
                },
                "overviews": "{\"Brand\":\"Lufeiya\",\"Product Dimensions\":\"19.7\\\"D x 46.6\\\"W x 29.5\\\"H\",\"Color\":\"Rustic Brown\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Versatile File Cabinet with Adjustable Drawer\",\"Room Type\":\"Office, Living Room, Bedroom, Study Room\",\"Recommended Uses For Product\":\"Working, Writing, Gaming\",\"Mounting Type\":\"Floor Mount\"}",
                "page": 0,
                "pages": 0,
                "parent": "B0D93D2G2W",
                "parentChangeHis": [
                    {
                        "timePoint": 1720022400000,
                        "value": "B0CVD77VP1"
                    },
                    {
                        "timePoint": 1720022400000,
                        "value": "B0CQ4STXZR"
                    },
                    {
                        "timePoint": 1720454400000,
                        "value": "B0D93D2G2W"
                    }
                ],
                "pkgDimensionType": "LB",
                "pkgDimensions": "34.5 x 21.5 x 4 inches",
                "pkgVolumeWeights": 9682.068,
                "pkgWeight": "30.9 pounds",
                "price": 89.87,
                "primeExclusivePrice": -1.0,
                "rating": 4.2,
                "reviews": 513,
                "reviewsDelta": 0,
                "reviewsIncreasement": 74,
                "reviewsRate": 4.59,
                "salesTrend": "{\"202408\":4033,\"202409\":2238,\"202406\":1598,\"202407\":1775,\"202404\":337,\"202405\":1688,\"202402\":704,\"202403\":2349,\"202411\":4187,\"202312\":0,\"202412\":1613,\"202401\":0,\"202410\":2945}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerNation": "CN",
                "sellerType": "FBA",
                "sellers": 1,
                "sku": "Color: Rustic Brown | Size: 46.6\"",
                "station": "GLOBAL",
                "subcategories": [
                    {
                        "code": "3733671",
                        "label": "Home Office Desks",
                        "rank": 101
                    }
                ],
                "symbol": "N",
                "syncTime": 1735736704000,
                "title": "Lufeiya Computer Desk with Fabric File Drawers Cabinet, 47 Inch Home Office Desks with Filing Cabinet for Small Space, Study Writing Table PC Desks, Rustic Brown",
                "took": 0,
                "total": 0,
                "totalAmount": 159138.58,
                "totalUnits": 1613,
                "trends": [
                    {
                        "dk": "202312",
                        "sales": 0
                    },
                    {
                        "dk": "202401",
                        "sales": 0
                    },
                    {
                        "dk": "202402",
                        "sales": 704
                    },
                    {
                        "dk": "202403",
                        "sales": 2349
                    },
                    {
                        "dk": "202404",
                        "sales": 337
                    },
                    {
                        "dk": "202405",
                        "sales": 1688
                    },
                    {
                        "dk": "202406",
                        "sales": 1598
                    },
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
                    }
                ],
                "updatedTime": 1735772192812,
                "variations": 5,
                "video": "N",
                "weight": "150 磅"
            },
            "2025-01": {
                "alias": "B0CQ4STXZR",
                "amazonChoice": "lufeiya computer desk",
                "amzUnit": 200,
                "amzUnitDate": 1738182967470,
                "amzUnitTrend": "{\"202402\":200,\"202403\":700,\"202404\":200,\"202405\":500,\"202406\":1000,\"202407\":200,\"202408\":1000,\"202409\":900,\"202410\":700,\"202411\":900,\"202412\":400,\"202501\":200}",
                "amzUnitTrends": [
                    {
                        "dk": "202402",
                        "sales": 200
                    },
                    {
                        "dk": "202403",
                        "sales": 700
                    },
                    {
                        "dk": "202404",
                        "sales": 200
                    },
                    {
                        "dk": "202405",
                        "sales": 500
                    },
                    {
                        "dk": "202406",
                        "sales": 1000
                    },
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
                    }
                ],
                "asin": "B0CQ4STXZR",
                "availableDate": 1702310400000,
                "availableDays": 416,
                "availableMonth": 1,
                "availableYear": 1,
                "averagePrice": 96.51,
                "brand": "Lufeiya",
                "brandUrl": "https://www.amazon.com/s?k=Lufeiya",
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRank": 15045,
                "bsrRankCr": 41.09,
                "bsrRankCv": 10492,
                "categoryId": "1055398",
                "categoryName": "Home & Kitchen",
                "channel": "P",
                "coupon": "",
                "curMon": false,
                "deliveryPrice": -1.0,
                "dimensionType": "EL15O",
                "dimensions": "19.7 x 46.6 x 29.5 inches",
                "ebc": "Y",
                "fba": 19.69,
                "firstReviewDate": 1702310400000,
                "guestVisited": false,
                "id": "USB0CQ4STXZR",
                "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/71yX-N0LTuL._AC_US200_.jpg",
                "lqs": 100,
                "marketId": 1,
                "monDailySales": "",
                "monthId": 202501,
                "monthName": "202501",
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "order": {
                    "desc": true,
                    "field": ""
                },
                "overviews": "{\"Brand\":\"Lufeiya\",\"Product Dimensions\":\"19.7\\\"D x 46.6\\\"W x 29.5\\\"H\",\"Color\":\"Rustic Brown\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Versatile File Cabinet with Adjustable Drawer\",\"Room Type\":\"Office, Living Room, Bedroom, Study Room\",\"Recommended Uses For Product\":\"Working, Writing, Gaming\",\"Mounting Type\":\"Floor Mount\"}",
                "page": 0,
                "pages": 0,
                "parent": "B0D93D2G2W",
                "parentChangeHis": [],
                "pkgDimensionType": "LB",
                "pkgDimensions": "34.5 x 21.5 x 4 inches",
                "pkgVolumeWeights": 9682.068,
                "pkgWeight": "30.9 pounds",
                "price": 89.87,
                "primeExclusivePrice": -1.0,
                "profit": 61.93,
                "rating": 4.2,
                "reviews": 581,
                "reviewsDelta": 113,
                "reviewsIncreasement": 66,
                "reviewsRate": 4.62,
                "salesTrend": "{\"202408\":4033,\"202409\":2238,\"202406\":0,\"202407\":1775,\"202404\":337,\"202405\":1483,\"202402\":704,\"202501\":1428,\"202403\":2349,\"202411\":4187,\"202412\":1613,\"202401\":0,\"202410\":2945}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerNation": "CN",
                "sellerType": "FBA",
                "sellers": 2,
                "sku": "Color: Rustic Brown | Size: 46.6\"",
                "station": "GLOBAL",
                "subcategories": [
                    {
                        "code": "3733671",
                        "label": "Home Office Desks",
                        "rank": 55
                    }
                ],
                "symbol": "N",
                "syncTime": 1743072205494,
                "title": "Lufeiya Computer Desk with Fabric File Drawers Cabinet, 47 Inch Reversible Home Office Desks with Filing Cabinet for Small Space, Study Writing Table PC Desks, Rustic Brown",
                "took": 0,
                "total": 0,
                "totalAmount": 137816.28,
                "totalAmountGrowth": 2.0,
                "totalUnits": 1428,
                "totalUnitsGrowth": 2.0,
                "trends": [
                    {
                        "dk": "202401",
                        "sales": 0
                    },
                    {
                        "dk": "202402",
                        "sales": 704
                    },
                    {
                        "dk": "202403",
                        "sales": 2349
                    },
                    {
                        "dk": "202404",
                        "sales": 337
                    },
                    {
                        "dk": "202405",
                        "sales": 1483
                    },
                    {
                        "dk": "202406",
                        "sales": 0
                    },
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
                        "sales": 1428
                    }
                ],
                "updatedTime": 1743079357946,
                "variations": 6,
                "video": "N",
                "weight": "30.9 Pounds"
            },
            "2025-02": {
                "alias": "B0CQ4STXZR",
                "amazonChoice": "Overall Pick",
                "amzUnit": 300,
                "amzUnitDate": 1740680013052,
                "amzUnitTrend": "{\"202402\":200,\"202403\":700,\"202404\":200,\"202405\":500,\"202406\":1000,\"202407\":200,\"202408\":1000,\"202409\":900,\"202410\":700,\"202411\":900,\"202412\":400,\"202501\":200,\"202502\":300}",
                "amzUnitTrends": [
                    {
                        "dk": "202402",
                        "sales": 200
                    },
                    {
                        "dk": "202403",
                        "sales": 700
                    },
                    {
                        "dk": "202404",
                        "sales": 200
                    },
                    {
                        "dk": "202405",
                        "sales": 500
                    },
                    {
                        "dk": "202406",
                        "sales": 1000
                    },
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
                    }
                ],
                "asin": "B0CQ4STXZR",
                "availableDate": 1702310400000,
                "availableDays": 444,
                "availableMonth": 2,
                "availableYear": 1,
                "averagePrice": 97.5,
                "brand": "Lufeiya",
                "brandUrl": "https://www.amazon.com/s?k=Lufeiya",
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRank": 6920,
                "bsrRankCr": 44.78,
                "bsrRankCv": 5612,
                "categoryId": "1055398",
                "categoryName": "Home & Kitchen",
                "channel": "P",
                "coupon": "",
                "curMon": false,
                "deliveryPrice": -1.0,
                "dimensionType": "EL15O",
                "dimensions": "19.7 x 46.6 x 29.5 inches",
                "ebc": "Y",
                "fba": 19.69,
                "firstReviewDate": 1702310400000,
                "guestVisited": false,
                "id": "USB0CQ4STXZR",
                "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/71yX-N0LTuL._AC_US200_.jpg",
                "lqs": 100,
                "marketId": 1,
                "monDailySales": "",
                "monthId": 202502,
                "monthName": "202502",
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "order": {
                    "desc": true,
                    "field": ""
                },
                "overviews": "{\"Brand\":\"Lufeiya\",\"Product Dimensions\":\"19.7\\\"D x 46.6\\\"W x 29.5\\\"H\",\"Color\":\"Rustic Brown\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Versatile File Cabinet with Adjustable Drawer\",\"Room Type\":\"Office, Living Room, Bedroom, Study Room\",\"Recommended Uses For Product\":\"Working, Writing, Gaming\",\"Mounting Type\":\"Floor Mount\"}",
                "page": 0,
                "pages": 0,
                "parent": "B0D93D2G2W",
                "parentChangeHis": [],
                "pkgDimensionType": "LB",
                "pkgDimensions": "34.5 x 21.5 x 4 inches",
                "pkgVolumeWeights": 9682.068,
                "pkgWeight": "30.9 pounds",
                "price": 89.87,
                "primeExclusivePrice": -1.0,
                "profit": 60.39,
                "rating": 4.2,
                "reviews": 638,
                "reviewsDelta": 82,
                "reviewsIncreasement": 56,
                "reviewsRate": 2.97,
                "salesTrend": "{\"202408\":4033,\"202409\":2238,\"202406\":1598,\"202407\":1775,\"202404\":337,\"202405\":1688,\"202402\":704,\"202501\":1334,\"202403\":2349,\"202502\":1885,\"202411\":4187,\"202412\":1613,\"202410\":2945}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerNation": "CN",
                "sellerType": "FBA",
                "sellers": 2,
                "sku": "Color: Rustic Brown | Size: 46.6\"",
                "station": "GLOBAL",
                "subcategories": [
                    {
                        "code": "3733671",
                        "label": "Home Office Desks",
                        "rank": 30
                    }
                ],
                "symbol": "N",
                "syncTime": 1744029316000,
                "title": "Lufeiya Computer Desk with Fabric File Drawers Cabinet, 47 Inch Reversible Home Office Desks with Filing Cabinet for Small Space, Study Writing Table PC Desks, Rustic Brown",
                "took": 0,
                "total": 0,
                "totalAmount": 183787.5,
                "totalAmountGrowth": 32.0,
                "totalUnits": 1885,
                "totalUnitsGrowth": 32.0,
                "totalUnitsGrowthYoy": 167.76,
                "trends": [
                    {
                        "dk": "202402",
                        "sales": 704
                    },
                    {
                        "dk": "202403",
                        "sales": 2349
                    },
                    {
                        "dk": "202404",
                        "sales": 337
                    },
                    {
                        "dk": "202405",
                        "sales": 1688
                    },
                    {
                        "dk": "202406",
                        "sales": 1598
                    },
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
                        "sales": 1885
                    }
                ],
                "updatedTime": 1744075009163,
                "variations": 7,
                "video": "N",
                "weight": "31.8 Pounds"
            },
            "2025-03": {
                "alias": "B0CQ4STXZR",
                "amazonChoice": "Overall Pick",
                "amzUnit": 200,
                "amzUnitDate": 1743383613000,
                "amzUnitTrend": "{\"202402\":200,\"202403\":700,\"202404\":200,\"202405\":500,\"202406\":1000,\"202407\":200,\"202408\":1000,\"202409\":900,\"202410\":700,\"202411\":900,\"202412\":400,\"202501\":200,\"202502\":300}",
                "amzUnitTrends": [
                    {
                        "dk": "202402",
                        "sales": 200
                    },
                    {
                        "dk": "202403",
                        "sales": 700
                    },
                    {
                        "dk": "202404",
                        "sales": 200
                    },
                    {
                        "dk": "202405",
                        "sales": 500
                    },
                    {
                        "dk": "202406",
                        "sales": 1000
                    },
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
                    }
                ],
                "asin": "B0CQ4STXZR",
                "availableDate": 1702310400000,
                "availableDays": 475,
                "availableMonth": 3,
                "availableYear": 1,
                "averagePrice": 98.15,
                "brand": "Lufeiya",
                "brandUrl": "https://www.amazon.com/s?k=Lufeiya",
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRank": 8942,
                "bsrRankCr": 29.21,
                "bsrRankCv": 3689,
                "categoryId": "1055398",
                "categoryName": "Home & Kitchen",
                "channel": "P",
                "coupon": "",
                "curMon": false,
                "deliveryPrice": -1.0,
                "dimensionType": "EL15O",
                "dimensions": "19.7 x 46.6 x 29.5 inches",
                "ebc": "Y",
                "fba": 19.69,
                "firstReviewDate": 1702310400000,
                "guestVisited": false,
                "id": "USB0CQ4STXZR",
                "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/71yX-N0LTuL._AC_US200_.jpg",
                "lqs": 100,
                "marketId": 1,
                "monDailySales": "",
                "monthId": 202503,
                "monthName": "202503",
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "order": {
                    "desc": true,
                    "field": ""
                },
                "overviews": "{\"Brand\":\"Lufeiya\",\"Product Dimensions\":\"19.7\\\"D x 46.6\\\"W x 29.5\\\"H\",\"Color\":\"Rustic Brown\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Versatile File Cabinet with Adjustable Drawer\",\"Room Type\":\"Office, Living Room, Bedroom, Study Room\",\"Recommended Uses For Product\":\"Working, Writing, Gaming\",\"Mounting Type\":\"Floor Mount\"}",
                "page": 0,
                "pages": 0,
                "parent": "B0D93D2G2W",
                "parentChangeHis": [
                    {
                        "timePoint": 1720022400000,
                        "value": "B0CVD77VP1"
                    },
                    {
                        "timePoint": 1720022400000,
                        "value": "B0CQ4STXZR"
                    },
                    {
                        "timePoint": 1720454400000,
                        "value": "B0D93D2G2W"
                    }
                ],
                "pkgDimensionType": "LB",
                "pkgDimensions": "34.5 x 21.5 x 4 inches",
                "pkgVolumeWeights": 9682.068,
                "pkgWeight": "30.9 pounds",
                "price": 85.37,
                "primeExclusivePrice": -1.0,
                "profit": 61.93,
                "rating": 4.2,
                "reviews": 703,
                "reviewsDelta": 0,
                "reviewsIncreasement": 65,
                "reviewsRate": 3.3,
                "salesTrend": "{\"202408\":4033,\"202409\":2238,\"202406\":1598,\"202407\":1775,\"202404\":337,\"202503\":1972,\"202405\":1688,\"202402\":704,\"202501\":1334,\"202403\":2349,\"202502\":2001,\"202411\":4187,\"202412\":1613,\"202410\":2945}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerNation": "CN",
                "sellerType": "FBA",
                "sellers": 2,
                "sku": "Color: Rustic Brown | Size: 46.6\"",
                "station": "GLOBAL",
                "subcategories": [
                    {
                        "code": "3733671",
                        "label": "Home Office Desks",
                        "rank": 26
                    }
                ],
                "symbol": "N",
                "syncTime": 1743394897000,
                "title": "Lufeiya Computer Desk with Fabric File Drawers Cabinet, 47 Inch Reversible Home Office Desks with Filing Cabinet for Small Space, Study Writing Table PC Desks, Rustic Brown",
                "took": 0,
                "total": 0,
                "totalAmount": 193551.8,
                "totalAmountGrowth": 0.0,
                "totalUnits": 1972,
                "totalUnitsGrowth": 0.0,
                "totalUnitsGrowthYoy": -16.05,
                "totalUnitsGrowthYoyLag1": 184.23,
                "trends": [
                    {
                        "dk": "202402",
                        "sales": 704
                    },
                    {
                        "dk": "202403",
                        "sales": 2349
                    },
                    {
                        "dk": "202404",
                        "sales": 337
                    },
                    {
                        "dk": "202405",
                        "sales": 1688
                    },
                    {
                        "dk": "202406",
                        "sales": 1598
                    },
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
                    }
                ],
                "updatedTime": 1743403337952,
                "variations": 6,
                "video": "N",
                "weight": "30.9 Pounds"
            },
            "2025-04": {
                "alias": "B0CQ4STXZR",
                "amazonChoice": "Overall Pick",
                "amzUnit": 100,
                "amzUnitDate": 1746191290000,
                "amzUnitTrend": "{\"202402\":200,\"202403\":700,\"202404\":200,\"202405\":500,\"202406\":1000,\"202407\":200,\"202408\":1000,\"202409\":900,\"202410\":700,\"202411\":900,\"202412\":400,\"202501\":200,\"202502\":300,\"202503\":200}",
                "amzUnitTrends": [
                    {
                        "dk": "202402",
                        "sales": 200
                    },
                    {
                        "dk": "202403",
                        "sales": 700
                    },
                    {
                        "dk": "202404",
                        "sales": 200
                    },
                    {
                        "dk": "202405",
                        "sales": 500
                    },
                    {
                        "dk": "202406",
                        "sales": 1000
                    },
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
                    }
                ],
                "asin": "B0CQ4STXZR",
                "availableDate": 1702310400000,
                "availableDays": 505,
                "availableMonth": 4,
                "availableYear": 1,
                "averagePrice": 87.7,
                "brand": "Lufeiya",
                "brandUrl": "https://www.amazon.com/s?k=Lufeiya",
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRank": 20873,
                "bsrRankCr": 27.33,
                "bsrRankCv": 7849,
                "categoryId": "1055398",
                "categoryName": "Home & Kitchen",
                "channel": "P",
                "coupon": "",
                "curMon": false,
                "deliveryPrice": -1.0,
                "dimensionType": "EL15O",
                "dimensions": "19.7 x 46.6 x 29.5 inches",
                "ebc": "Y",
                "fba": 19.69,
                "firstReviewDate": 1702310400000,
                "guestVisited": false,
                "id": "USB0CQ4STXZR",
                "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/71yX-N0LTuL._AC_US200_.jpg",
                "lqs": 100,
                "marketId": 1,
                "monDailySales": "",
                "monthId": 202504,
                "monthName": "202504",
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "order": {
                    "desc": true,
                    "field": ""
                },
                "overviews": "{\"Brand\":\"Lufeiya\",\"Product Dimensions\":\"19.7\\\"D x 46.6\\\"W x 29.5\\\"H\",\"Color\":\"Rustic Brown\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Versatile File Cabinet with Adjustable Drawer\",\"Room Type\":\"Office, Living Room, Bedroom, Study Room\",\"Recommended Uses For Product\":\"Working, Writing, Gaming\",\"Mounting Type\":\"Floor Mount\"}",
                "page": 0,
                "pages": 0,
                "parent": "B0D93D2G2W",
                "parentChangeHis": [
                    {
                        "timePoint": 1720022400000,
                        "value": "B0CVD77VP1"
                    },
                    {
                        "timePoint": 1720022400000,
                        "value": "B0CQ4STXZR"
                    },
                    {
                        "timePoint": 1720454400000,
                        "value": "B0D93D2G2W"
                    }
                ],
                "pkgDimensionType": "LB",
                "pkgDimensions": "34.5 x 21.5 x 4 inches",
                "pkgVolumeWeights": 9682.068,
                "pkgWeight": "30.9 pounds",
                "price": 79.99,
                "primeExclusivePrice": -1.0,
                "profit": 60.39,
                "rating": 4.3,
                "reviews": 809,
                "reviewsDelta": 2,
                "reviewsIncreasement": 103,
                "reviewsRate": 7.42,
                "salesTrend": "{\"202408\":4033,\"202409\":2238,\"202406\":1598,\"202407\":1775,\"202404\":337,\"202503\":1972,\"202405\":1688,\"202504\":1388,\"202402\":704,\"202501\":1334,\"202403\":2349,\"202502\":2001,\"202411\":4187,\"202412\":1613,\"202410\":2945}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerNation": "CN",
                "sellerType": "FBA",
                "sellers": 2,
                "sku": "Color: Rustic Brown | Size: 46.6\"",
                "station": "GLOBAL",
                "subcategories": [
                    {
                        "code": "3733671",
                        "label": "Home Office Desks",
                        "rank": 67
                    }
                ],
                "symbol": "N",
                "syncTime": 1746240293000,
                "title": "Lufeiya Computer Desk with Fabric File Drawers Cabinet, 47 Inch Reversible Home Office Desks with Filing Cabinet for Small Space, Study Writing Table PC Desks, Rustic Brown",
                "took": 0,
                "total": 0,
                "totalAmount": 121727.59,
                "totalAmountGrowth": -25.0,
                "totalUnits": 1388,
                "totalUnitsGrowth": -25.0,
                "totalUnitsGrowthYoy": 311.87,
                "totalUnitsGrowthYoyLag1": -16.05,
                "totalUnitsGrowthYoyLag2": 184.23,
                "trends": [
                    {
                        "dk": "202402",
                        "sales": 704
                    },
                    {
                        "dk": "202403",
                        "sales": 2349
                    },
                    {
                        "dk": "202404",
                        "sales": 337
                    },
                    {
                        "dk": "202405",
                        "sales": 1688
                    },
                    {
                        "dk": "202406",
                        "sales": 1598
                    },
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
                    }
                ],
                "updatedTime": 1746250439570,
                "variations": 7,
                "video": "N",
                "weight": "31.8 Pounds"
            },
            "2025-05": {
                "alias": "B0CQ4STXZR",
                "amazonChoice": "lufeiya computer desk",
                "amzUnit": 100,
                "amzUnitDate": 1748591629000,
                "amzUnitTrend": "{\"202402\":200,\"202403\":700,\"202404\":200,\"202405\":500,\"202406\":1000,\"202407\":200,\"202408\":1000,\"202409\":900,\"202410\":700,\"202411\":900,\"202412\":400,\"202501\":200,\"202502\":300,\"202503\":200,\"202504\":100}",
                "amzUnitTrends": [
                    {
                        "dk": "202402",
                        "sales": 200
                    },
                    {
                        "dk": "202403",
                        "sales": 700
                    },
                    {
                        "dk": "202404",
                        "sales": 200
                    },
                    {
                        "dk": "202405",
                        "sales": 500
                    },
                    {
                        "dk": "202406",
                        "sales": 1000
                    },
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
                    }
                ],
                "asin": "B0CQ4STXZR",
                "availableDate": 1702310400000,
                "availableDays": 536,
                "availableMonth": 5,
                "availableYear": 1,
                "averagePrice": 82.83,
                "brand": "Lufeiya",
                "brandUrl": "https://www.amazon.com/s?k=Lufeiya",
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRank": 15051,
                "bsrRankCr": 24.44,
                "bsrRankCv": 4869,
                "categoryId": "1055398",
                "categoryName": "Home & Kitchen",
                "channel": "P",
                "coupon": "",
                "curMon": false,
                "deliveryPrice": -1.0,
                "dimensionType": "EL15O",
                "dimensions": "19.7 x 46.6 x 29.5 inches",
                "ebc": "Y",
                "fba": 19.69,
                "firstReviewDate": 1702310400000,
                "guestVisited": false,
                "id": "USB0CQ4STXZR",
                "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/71yX-N0LTuL._AC_US200_.jpg",
                "lqs": 100,
                "marketId": 1,
                "monDailySales": "",
                "monthId": 202505,
                "monthName": "202505",
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "order": {
                    "desc": true,
                    "field": ""
                },
                "overviews": "{\"Brand\":\"Lufeiya\",\"Product Dimensions\":\"19.7\\\"D x 46.6\\\"W x 29.5\\\"H\",\"Color\":\"Rustic Brown\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Versatile File Cabinet with Adjustable Drawer\",\"Room Type\":\"Office, Living Room, Bedroom, Study Room\",\"Recommended Uses For Product\":\"Working, Writing, Gaming\",\"Mounting Type\":\"Floor Mount\"}",
                "page": 0,
                "pages": 0,
                "parent": "B0D93D2G2W",
                "parentChangeHis": [
                    {
                        "timePoint": 1720022400000,
                        "value": "B0CVD77VP1"
                    },
                    {
                        "timePoint": 1720022400000,
                        "value": "B0CQ4STXZR"
                    },
                    {
                        "timePoint": 1720454400000,
                        "value": "B0D93D2G2W"
                    }
                ],
                "pkgDimensionType": "LB",
                "pkgDimensions": "34.5 x 21.5 x 4 inches",
                "pkgVolumeWeights": 9682.068,
                "pkgWeight": "30.9 pounds",
                "price": 76.99,
                "primeExclusivePrice": -1.0,
                "profit": 59.43,
                "rating": 4.3,
                "reviews": 858,
                "reviewsDelta": 0,
                "reviewsIncreasement": 49,
                "reviewsRate": 3.84,
                "salesTrend": "{\"202408\":4033,\"202409\":2238,\"202406\":1598,\"202505\":1275,\"202407\":1775,\"202404\":337,\"202503\":1972,\"202405\":1688,\"202504\":1388,\"202402\":704,\"202501\":1334,\"202403\":2349,\"202502\":2001,\"202411\":4187,\"202412\":1613,\"202410\":2945}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerNation": "CN",
                "sellerType": "FBA",
                "sellers": 1,
                "sku": "Color: Rustic Brown | Size: 46.6\"",
                "station": "GLOBAL",
                "subcategories": [
                    {
                        "code": "3733671",
                        "label": "Home Office Desks",
                        "rank": 42
                    }
                ],
                "symbol": "N",
                "syncTime": 1748756898000,
                "title": "Lufeiya Computer Desk with Fabric File Drawers Cabinet, 47 Inch Reversible Home Office Desks with Filing Cabinet for Small Space, Study Writing Table PC Desks, Rustic Brown",
                "took": 0,
                "total": 0,
                "totalAmount": 105608.25,
                "totalUnits": 1275,
                "totalUnitsGrowthYoy": -24.47,
                "totalUnitsGrowthYoyLag1": 311.87,
                "totalUnitsGrowthYoyLag2": -16.05,
                "totalUnitsGrowthYoyLag3": 184.23,
                "trends": [
                    {
                        "dk": "202402",
                        "sales": 704
                    },
                    {
                        "dk": "202403",
                        "sales": 2349
                    },
                    {
                        "dk": "202404",
                        "sales": 337
                    },
                    {
                        "dk": "202405",
                        "sales": 1688
                    },
                    {
                        "dk": "202406",
                        "sales": 1598
                    },
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
                        "sales": 1275
                    }
                ],
                "updatedTime": 1748758365811,
                "variations": 7,
                "video": "N",
                "weight": "31.8 Pounds"
            },
            "2025-06": {
                "alias": "B0CQ4STXZR",
                "amzUnit": 300,
                "amzUnitDate": 1751270686000,
                "amzUnitTrend": "{\"202402\":200,\"202403\":700,\"202404\":200,\"202405\":500,\"202406\":1000,\"202407\":200,\"202408\":1000,\"202409\":900,\"202410\":700,\"202411\":900,\"202412\":400,\"202501\":200,\"202502\":300,\"202503\":200,\"202504\":100,\"202505\":100}",
                "amzUnitTrends": [
                    {
                        "dk": "202402",
                        "sales": 200
                    },
                    {
                        "dk": "202403",
                        "sales": 700
                    },
                    {
                        "dk": "202404",
                        "sales": 200
                    },
                    {
                        "dk": "202405",
                        "sales": 500
                    },
                    {
                        "dk": "202406",
                        "sales": 1000
                    },
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
                    }
                ],
                "asin": "B0CQ4STXZR",
                "availableDate": 1702310400000,
                "availableDays": 566,
                "availableMonth": 6,
                "availableYear": 1,
                "averagePrice": 81.22,
                "brand": "Lufeiya",
                "brandUrl": "https://www.amazon.com/s?k=Lufeiya",
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRank": 6873,
                "bsrRankCr": 40.59,
                "bsrRankCv": 4696,
                "categoryId": "1055398",
                "categoryName": "Home & Kitchen",
                "channel": "P",
                "coupon": "",
                "curMon": false,
                "deliveryPrice": -1.0,
                "dimensionType": "EL15O",
                "dimensions": "19.7 x 46.6 x 29.5 inches",
                "ebc": "Y",
                "fba": 19.69,
                "firstReviewDate": 1702310400000,
                "guestVisited": false,
                "id": "USB0CQ4STXZR",
                "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/71yX-N0LTuL._AC_US200_.jpg",
                "lqs": 100,
                "marketId": 1,
                "monDailySales": "",
                "monthId": 202506,
                "monthName": "202506",
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "order": {
                    "desc": true,
                    "field": ""
                },
                "overviews": "{\"Brand\":\"Lufeiya\",\"Product Dimensions\":\"19.7\\\"D x 46.6\\\"W x 29.5\\\"H\",\"Color\":\"Rustic Brown\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Versatile File Cabinet with Adjustable Drawer\",\"Room Type\":\"Office, Living Room, Bedroom, Study Room\",\"Recommended Uses For Product\":\"Working, Writing, Gaming\",\"Mounting Type\":\"Floor Mount\"}",
                "page": 0,
                "pages": 0,
                "parent": "B0D93D2G2W",
                "parentChangeHis": [],
                "pkgDimensionType": "LB",
                "pkgDimensions": "34.5 x 21.5 x 4 inches",
                "pkgVolumeWeights": 9682.068,
                "pkgWeight": "30.9 pounds",
                "price": 76.99,
                "primeExclusivePrice": -1.0,
                "profit": 56.86,
                "rating": 4.3,
                "reviews": 954,
                "reviewsDelta": 0,
                "reviewsIncreasement": 96,
                "reviewsRate": 4.75,
                "salesTrend": "{\"202408\":4033,\"202409\":2238,\"202406\":1598,\"202505\":1285,\"202407\":1775,\"202506\":2023,\"202404\":337,\"202503\":1972,\"202405\":1688,\"202504\":1388,\"202402\":704,\"202501\":1334,\"202403\":2349,\"202502\":2001,\"202411\":4187,\"202412\":1613,\"202410\":2945}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerNation": "CN",
                "sellerType": "FBA",
                "sellers": 2,
                "sku": "Color: Rustic Brown | Size: 46.6\"",
                "station": "GLOBAL",
                "subcategories": [
                    {
                        "code": "3733671",
                        "label": "Home Office Desks",
                        "rank": 14
                    }
                ],
                "symbol": "N",
                "syncTime": 1751286953000,
                "title": "Lufeiya Computer Desk with Fabric File Drawers Cabinet, 47 Inch Reversible Home Office Desks with Filing Cabinet for Small Space, Study Writing Table PC Desks, Rustic Brown",
                "took": 0,
                "total": 0,
                "totalAmount": 164308.06,
                "totalAmountGrowth": 52.0,
                "totalUnits": 2023,
                "totalUnitsGrowth": 52.0,
                "totalUnitsGrowthYoy": 26.6,
                "totalUnitsGrowthYoyLag1": -23.87,
                "totalUnitsGrowthYoyLag2": 311.87,
                "totalUnitsGrowthYoyLag3": -16.05,
                "totalUnitsGrowthYoyLag4": 184.23,
                "trends": [
                    {
                        "dk": "202402",
                        "sales": 704
                    },
                    {
                        "dk": "202403",
                        "sales": 2349
                    },
                    {
                        "dk": "202404",
                        "sales": 337
                    },
                    {
                        "dk": "202405",
                        "sales": 1688
                    },
                    {
                        "dk": "202406",
                        "sales": 1598
                    },
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
                    }
                ],
                "updatedTime": 1751301608894,
                "variations": 7,
                "video": "N",
                "weight": "31.8 Pounds"
            },
            "2025-07": {
                "alias": "B0CQ4STXZR",
                "amzUnit": 500,
                "amzUnitDate": 1753896609000,
                "amzUnitTrend": "{\"202402\":200,\"202403\":700,\"202404\":200,\"202405\":500,\"202406\":1000,\"202407\":200,\"202408\":1000,\"202409\":900,\"202410\":700,\"202411\":900,\"202412\":400,\"202501\":200,\"202502\":300,\"202503\":200,\"202504\":100,\"202505\":100,\"202506\":300}",
                "amzUnitTrends": [
                    {
                        "dk": "202402",
                        "sales": 200
                    },
                    {
                        "dk": "202403",
                        "sales": 700
                    },
                    {
                        "dk": "202404",
                        "sales": 200
                    },
                    {
                        "dk": "202405",
                        "sales": 500
                    },
                    {
                        "dk": "202406",
                        "sales": 1000
                    },
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
                    }
                ],
                "asin": "B0CQ4STXZR",
                "availableDate": 1702310400000,
                "availableDays": 597,
                "availableMonth": 7,
                "availableYear": 1,
                "averagePrice": 82.31,
                "brand": "Lufeiya",
                "brandUrl": "https://www.amazon.com/s?k=Lufeiya",
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRank": 8839,
                "bsrRankCr": 8.28,
                "bsrRankCv": 798,
                "categoryId": "1055398",
                "categoryName": "Home & Kitchen",
                "channel": "P",
                "coupon": "",
                "curMon": false,
                "deliveryPrice": -1.0,
                "dimensionType": "EL15O",
                "dimensions": "19.7 x 46.6 x 29.5 inches",
                "ebc": "Y",
                "fba": 20.07,
                "firstReviewDate": 1702310400000,
                "guestVisited": false,
                "id": "USB0CQ4STXZR",
                "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/71yX-N0LTuL._AC_US200_.jpg",
                "lqs": 100,
                "marketId": 1,
                "monDailySales": "",
                "monthId": 202507,
                "monthName": "202507",
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "order": {
                    "desc": true,
                    "field": ""
                },
                "overviews": "{\"Brand\":\"Lufeiya\",\"Product Dimensions\":\"19.7\\\"D x 46.6\\\"W x 29.5\\\"H\",\"Color\":\"Rustic Brown\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Reversible\",\"Room Type\":\"Office, Living Room, Bedroom, Study Room\",\"Recommended Uses For Product\":\"Working, Writing, Gaming\",\"Mounting Type\":\"Floor Mount\"}",
                "page": 0,
                "pages": 0,
                "parent": "B0D93D2G2W",
                "parentChangeHis": [],
                "pkgDimensionType": "LB",
                "pkgDimensions": "34 x 21.5 x 3.5 inches",
                "pkgVolumeWeights": 8349.031,
                "pkgWeight": "31.15 pounds",
                "price": 69.98,
                "primeExclusivePrice": -1.0,
                "profit": 56.32,
                "rating": 4.4,
                "reviews": 1029,
                "reviewsDelta": 0,
                "reviewsIncreasement": 73,
                "reviewsRate": 1.71,
                "salesTrend": "{\"202408\":4033,\"202507\":4264,\"202409\":2238,\"202406\":1598,\"202505\":1285,\"202407\":1775,\"202506\":2023,\"202404\":337,\"202503\":1972,\"202405\":1688,\"202504\":1388,\"202402\":704,\"202501\":1334,\"202403\":2349,\"202502\":2001,\"202411\":4187,\"202412\":1613,\"202410\":2945}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerNation": "CN",
                "sellerType": "FBA",
                "sellers": 2,
                "sku": "Color: Rustic Brown | Size: 46.6\"",
                "station": "GLOBAL",
                "subcategories": [
                    {
                        "code": "3733671",
                        "label": "Home Office Desks",
                        "rank": 30
                    }
                ],
                "symbol": "N",
                "syncTime": 1753899973000,
                "title": "Lufeiya Computer Desk with Fabric File Drawers Cabinet, 47 Inch Reversible Home Office Desks with Filing Cabinet for Small Space, Study Writing Table PC Desks, Rustic Brown",
                "took": 0,
                "total": 0,
                "totalAmount": 350969.84,
                "totalAmountGrowth": 104.0,
                "totalUnits": 4264,
                "totalUnitsGrowth": 104.0,
                "totalUnitsGrowthYoy": 140.23,
                "totalUnitsGrowthYoyLag1": 26.6,
                "totalUnitsGrowthYoyLag2": -23.87,
                "totalUnitsGrowthYoyLag3": 311.87,
                "totalUnitsGrowthYoyLag4": -16.05,
                "totalUnitsGrowthYoyLag5": 184.23,
                "trends": [
                    {
                        "dk": "202402",
                        "sales": 704
                    },
                    {
                        "dk": "202403",
                        "sales": 2349
                    },
                    {
                        "dk": "202404",
                        "sales": 337
                    },
                    {
                        "dk": "202405",
                        "sales": 1688
                    },
                    {
                        "dk": "202406",
                        "sales": 1598
                    },
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
                    }
                ],
                "updatedTime": 1753920887472,
                "variations": 7,
                "video": "N",
                "weight": "31.8 Pounds"
            },
            "2025-08": {
                "alias": "B0CQ4STXZR",
                "amzUnit": 500,
                "amzUnitDate": 1756559233000,
                "amzUnitTrend": "{\"202402\":200,\"202403\":700,\"202404\":200,\"202405\":500,\"202406\":1000,\"202407\":200,\"202408\":1000,\"202409\":900,\"202410\":700,\"202411\":900,\"202412\":400,\"202501\":200,\"202502\":300,\"202503\":200,\"202504\":100,\"202505\":100,\"202506\":300,\"202507\":500}",
                "amzUnitTrends": [
                    {
                        "dk": "202402",
                        "sales": 200
                    },
                    {
                        "dk": "202403",
                        "sales": 700
                    },
                    {
                        "dk": "202404",
                        "sales": 200
                    },
                    {
                        "dk": "202405",
                        "sales": 500
                    },
                    {
                        "dk": "202406",
                        "sales": 1000
                    },
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
                    }
                ],
                "asin": "B0CQ4STXZR",
                "availableDate": 1702310400000,
                "availableDays": 628,
                "availableMonth": 8,
                "availableYear": 1,
                "averagePrice": 81.26,
                "brand": "Lufeiya",
                "brandUrl": "https://www.amazon.com/s?k=Lufeiya",
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRank": 4653,
                "bsrRankCr": -7.68,
                "bsrRankCv": -332,
                "categoryId": "1055398",
                "categoryName": "Home & Kitchen",
                "channel": "P",
                "coupon": "",
                "curMon": false,
                "deliveryPrice": -1.0,
                "dimensionType": "EL15O",
                "dimensions": "19.7 x 46.6 x 29.5 inches",
                "ebc": "Y",
                "fba": 20.07,
                "firstReviewDate": 1702310400000,
                "guestVisited": false,
                "id": "USB0CQ4STXZR",
                "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/71yX-N0LTuL._AC_US200_.jpg",
                "lqs": 100,
                "marketId": 1,
                "monDailySales": "",
                "monthId": 202508,
                "monthName": "202508",
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "order": {
                    "desc": true,
                    "field": ""
                },
                "overviews": "{\"Brand\":\"Lufeiya\",\"Product Dimensions\":\"19.7\\\"D x 46.6\\\"W x 29.5\\\"H\",\"Color\":\"Rustic Brown\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Reversible\",\"Room Type\":\"Bedroom, Living Room, Office, Study Room\",\"Recommended Uses For Product\":\"Gaming, Working, Writing\",\"Mounting Type\":\"Floor Mount\"}",
                "page": 0,
                "pages": 0,
                "parent": "B0D93D2G2W",
                "parentChangeHis": [],
                "pkgDimensionType": "LB",
                "pkgDimensions": "34.6 x 21.1 x 3.9 inches",
                "pkgVolumeWeights": 9291.242,
                "pkgWeight": "31.61 pounds",
                "price": 69.97,
                "primeExclusivePrice": -1.0,
                "profit": 56.32,
                "rating": 4.4,
                "reviews": 1150,
                "reviewsDelta": 0,
                "reviewsIncreasement": 112,
                "reviewsRate": 2.64,
                "salesTrend": "{\"202408\":4033,\"202507\":4264,\"202409\":2238,\"202508\":4239,\"202406\":1598,\"202505\":1285,\"202407\":1775,\"202506\":2023,\"202404\":337,\"202503\":1972,\"202405\":1688,\"202504\":1388,\"202402\":704,\"202501\":1334,\"202403\":2349,\"202502\":2001,\"202411\":4187,\"202412\":1613,\"202410\":2945}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerNation": "CN",
                "sellerType": "FBA",
                "sellers": 2,
                "sku": "Color: Rustic Brown | Size: 46.6\"",
                "station": "GLOBAL",
                "subcategories": [
                    {
                        "code": "3733671",
                        "label": "Home Office Desks",
                        "rank": 17
                    }
                ],
                "symbol": "N",
                "syncTime": 1756593809000,
                "title": "Lufeiya Computer Desk with Fabric File Drawers Cabinet, 47 Inch Reversible Home Office Desks with Filing Cabinet for Small Space, Study Writing Table PC Desks, Rustic Brown",
                "took": 0,
                "total": 0,
                "totalAmount": 344461.16,
                "totalAmountGrowth": -4.0,
                "totalUnits": 4239,
                "totalUnitsGrowth": -4.0,
                "totalUnitsGrowthYoy": 5.11,
                "totalUnitsGrowthYoyLag1": 140.23,
                "totalUnitsGrowthYoyLag2": 26.6,
                "totalUnitsGrowthYoyLag3": -23.87,
                "totalUnitsGrowthYoyLag4": 311.87,
                "totalUnitsGrowthYoyLag5": -16.05,
                "trends": [
                    {
                        "dk": "202402",
                        "sales": 704
                    },
                    {
                        "dk": "202403",
                        "sales": 2349
                    },
                    {
                        "dk": "202404",
                        "sales": 337
                    },
                    {
                        "dk": "202405",
                        "sales": 1688
                    },
                    {
                        "dk": "202406",
                        "sales": 1598
                    },
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
                    }
                ],
                "updatedTime": 1756597357125,
                "variations": 7,
                "video": "N",
                "weight": "31.8 Pounds"
            },
            "2025-09": {
                "alias": "B0CQ4STXZR",
                "amazonChoice": "Amazon's Choice",
                "amzUnit": 500,
                "amzUnitDate": 1759312926000,
                "amzUnitTrend": "{\"202402\":200,\"202403\":700,\"202404\":200,\"202405\":500,\"202406\":1000,\"202407\":200,\"202408\":1000,\"202409\":900,\"202410\":700,\"202411\":900,\"202412\":400,\"202501\":200,\"202502\":300,\"202503\":200,\"202504\":100,\"202505\":100,\"202506\":300,\"202507\":500,\"202508\":500}",
                "amzUnitTrends": [
                    {
                        "dk": "202402",
                        "sales": 200
                    },
                    {
                        "dk": "202403",
                        "sales": 700
                    },
                    {
                        "dk": "202404",
                        "sales": 200
                    },
                    {
                        "dk": "202405",
                        "sales": 500
                    },
                    {
                        "dk": "202406",
                        "sales": 1000
                    },
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
                    }
                ],
                "asin": "B0CQ4STXZR",
                "availableDate": 1702310400000,
                "availableDays": 658,
                "availableMonth": 9,
                "availableYear": 1,
                "averagePrice": 77.91,
                "brand": "Lufeiya",
                "brandUrl": "https://www.amazon.com/s?k=Lufeiya",
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRank": 13000,
                "bsrRankCr": -11.38,
                "bsrRankCv": -1328,
                "categoryId": "1055398",
                "categoryName": "Home & Kitchen",
                "channel": "P",
                "coupon": "",
                "curMon": false,
                "deliveryPrice": -1.0,
                "dimensionType": "EL15O",
                "dimensions": "19.7 x 46.6 x 29.5 inches",
                "ebc": "Y",
                "fba": 20.07,
                "firstReviewDate": 1702310400000,
                "guestVisited": false,
                "id": "USB0CQ4STXZR",
                "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/715MlAvRnWL._AC_US200_.jpg",
                "lqs": 100,
                "marketId": 1,
                "monDailySales": "",
                "monthId": 202509,
                "monthName": "202509",
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "order": {
                    "desc": true,
                    "field": ""
                },
                "overviews": "{\"Brand\":\"Lufeiya\",\"Room Type\":\"Bedroom, Living Room, Office, Study Room\",\"Product Dimensions\":\"19.7\\\"D x 46.6\\\"W x 29.5\\\"H\",\"Color\":\"Rustic Brown\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Reversible\",\"Recommended Uses For Product\":\"Gaming, Working, Writing\",\"Furniture leg material\":\"Metal\"}",
                "page": 0,
                "pages": 0,
                "parent": "B0D93D2G2W",
                "parentChangeHis": [],
                "pkgDimensionType": "LB",
                "pkgDimensions": "34.6 x 21.1 x 3.9 inches",
                "pkgVolumeWeights": 9291.242,
                "pkgWeight": "31.61 pounds",
                "price": 69.97,
                "primeExclusivePrice": -1.0,
                "profit": 56.32,
                "rating": 4.4,
                "reviews": 1264,
                "reviewsDelta": 0,
                "reviewsIncreasement": 104,
                "reviewsRate": 3.36,
                "salesTrend": "{\"202509\":3095,\"202408\":4033,\"202507\":4264,\"202409\":2238,\"202508\":4239,\"202406\":1598,\"202505\":1285,\"202407\":1775,\"202506\":2023,\"202404\":337,\"202503\":1972,\"202405\":1688,\"202504\":1388,\"202402\":704,\"202501\":1334,\"202403\":2349,\"202502\":2001,\"202411\":4187,\"202412\":1613,\"202410\":2945}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerNation": "CN",
                "sellerType": "FBA",
                "sellers": 2,
                "sku": "Color: Rustic Brown | Size: 46.6\"",
                "station": "GLOBAL",
                "subcategories": [
                    {
                        "code": "3733671",
                        "label": "Home Office Desks",
                        "rank": 30
                    }
                ],
                "symbol": "N",
                "syncTime": 1759303741000,
                "title": "Lufeiya Computer Desk with Fabric File Drawers Cabinet, 47 Inch Reversible Home Office Desks with Filing Cabinet for Small Space, Study Writing Table PC Desks, Rustic Brown",
                "took": 0,
                "total": 0,
                "totalAmount": 241131.47,
                "totalAmountGrowth": 0.0,
                "totalUnits": 3095,
                "totalUnitsGrowth": 0.0,
                "totalUnitsGrowthYoy": 38.29,
                "totalUnitsGrowthYoyLag1": 5.11,
                "totalUnitsGrowthYoyLag2": 140.23,
                "totalUnitsGrowthYoyLag3": 26.6,
                "totalUnitsGrowthYoyLag4": -23.87,
                "totalUnitsGrowthYoyLag5": 311.87,
                "trends": [
                    {
                        "dk": "202402",
                        "sales": 704
                    },
                    {
                        "dk": "202403",
                        "sales": 2349
                    },
                    {
                        "dk": "202404",
                        "sales": 337
                    },
                    {
                        "dk": "202405",
                        "sales": 1688
                    },
                    {
                        "dk": "202406",
                        "sales": 1598
                    },
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
                    }
                ],
                "updatedTime": 1759329232477,
                "variations": 7,
                "video": "N",
                "weight": "31.8 Pounds"
            },
            "2025-10": {
                "alias": "B0CQ4STXZR",
                "amazonChoice": "Amazon's Choice",
                "amzUnit": 300,
                "amzUnitDate": 1761961518000,
                "amzUnitTrend": "{\"202402\":200,\"202403\":700,\"202404\":200,\"202405\":500,\"202406\":1000,\"202407\":200,\"202408\":1000,\"202409\":900,\"202410\":700,\"202411\":900,\"202412\":400,\"202501\":200,\"202502\":300,\"202503\":200,\"202504\":100,\"202505\":100,\"202506\":300,\"202507\":500,\"202508\":500,\"202509\":500}",
                "amzUnitTrends": [
                    {
                        "dk": "202402",
                        "sales": 200
                    },
                    {
                        "dk": "202403",
                        "sales": 700
                    },
                    {
                        "dk": "202404",
                        "sales": 200
                    },
                    {
                        "dk": "202405",
                        "sales": 500
                    },
                    {
                        "dk": "202406",
                        "sales": 1000
                    },
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
                    }
                ],
                "asin": "B0CQ4STXZR",
                "availableDate": 1702310400000,
                "availableDays": 689,
                "availableMonth": 10,
                "availableYear": 1,
                "averagePrice": 85.37,
                "brand": "Lufeiya",
                "brandUrl": "https://www.amazon.com/s?k=Lufeiya",
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRank": 13874,
                "bsrRankCr": -19.96,
                "bsrRankCv": -2308,
                "categoryId": "1055398",
                "categoryName": "Home & Kitchen",
                "channel": "P",
                "coupon": "",
                "curMon": false,
                "deliveryPrice": -1.0,
                "dimensionType": "EL15O",
                "dimensions": "19.7 x 46.6 x 29.5 inches",
                "ebc": "Y",
                "fba": 21.11,
                "firstReviewDate": 1702310400000,
                "guestVisited": false,
                "id": "USB0CQ4STXZR",
                "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/715MlAvRnWL._AC_US200_.jpg",
                "lqs": 100,
                "marketId": 1,
                "monDailySales": "",
                "monthId": 202510,
                "monthName": "202510",
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "order": {
                    "desc": true,
                    "field": ""
                },
                "overviews": "{\"Brand\":\"Lufeiya\",\"Product Dimensions\":\"19.7\\\"D x 46.6\\\"W x 29.5\\\"H\",\"Color\":\"Rustic Brown\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Reversible\",\"Room Type\":\"Bedroom, Living Room, Office, Study Room\",\"Recommended Uses For Product\":\"Gaming, Working, Writing\",\"Furniture leg material\":\"Metal\"}",
                "page": 0,
                "pages": 0,
                "parent": "B0D93D2G2W",
                "parentChangeHis": [],
                "pkgDimensionType": "LB",
                "pkgDimensions": "34.6 x 21.1 x 3.9 inches",
                "pkgVolumeWeights": 9291.242,
                "pkgWeight": "31.61 pounds",
                "price": 89.99,
                "primeExclusivePrice": 76.99,
                "profit": 57.58,
                "rating": 4.4,
                "reviews": 1360,
                "reviewsDelta": 0,
                "reviewsIncreasement": 96,
                "reviewsRate": 3.45,
                "salesTrend": "{\"202509\":3095,\"202408\":4033,\"202507\":4264,\"202409\":2238,\"202508\":4239,\"202406\":1598,\"202505\":1285,\"202407\":1775,\"202506\":2023,\"202404\":337,\"202503\":1972,\"202405\":1688,\"202504\":1388,\"202402\":704,\"202501\":1334,\"202403\":2349,\"202502\":2001,\"202411\":4187,\"202510\":2782,\"202412\":1613,\"202410\":2945}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerNation": "CN",
                "sellerType": "FBA",
                "sellers": 1,
                "sku": "Color: Rustic Brown | Size: 46.6\"",
                "station": "GLOBAL",
                "subcategories": [
                    {
                        "code": "3733671",
                        "label": "Home Office Desks",
                        "rank": 34
                    }
                ],
                "symbol": "N",
                "syncTime": 1761961536000,
                "title": "Lufeiya Computer Desk with Fabric File Drawers Cabinet, 47 Inch Reversible Home Office Desks with Filing Cabinet for Small Space, Study Writing Table PC Desks, Rustic Brown",
                "took": 0,
                "total": 0,
                "totalAmount": 237499.34,
                "totalUnits": 2782,
                "totalUnitsGrowthYoy": -5.53,
                "totalUnitsGrowthYoyLag1": 38.29,
                "totalUnitsGrowthYoyLag2": 5.11,
                "totalUnitsGrowthYoyLag3": 140.23,
                "totalUnitsGrowthYoyLag4": 26.6,
                "totalUnitsGrowthYoyLag5": -23.87,
                "trends": [
                    {
                        "dk": "202402",
                        "sales": 704
                    },
                    {
                        "dk": "202403",
                        "sales": 2349
                    },
                    {
                        "dk": "202404",
                        "sales": 337
                    },
                    {
                        "dk": "202405",
                        "sales": 1688
                    },
                    {
                        "dk": "202406",
                        "sales": 1598
                    },
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
                    }
                ],
                "updatedTime": 1761973044314,
                "variations": 7,
                "video": "N",
                "weight": "31.8 Pounds"
            },
            "2025-11": {
                "alias": "B0CQ4STXZR",
                "amazonChoice": "Amazon's Choice",
                "amzUnit": 400,
                "amzUnitDate": 1764530646000,
                "amzUnitTrend": "{\"202402\":200,\"202403\":700,\"202404\":200,\"202405\":500,\"202406\":1000,\"202407\":200,\"202408\":1000,\"202409\":900,\"202410\":700,\"202411\":900,\"202412\":400,\"202501\":200,\"202502\":300,\"202503\":200,\"202504\":100,\"202505\":100,\"202506\":300,\"202507\":500,\"202508\":500,\"202509\":500,\"202510\":300}",
                "amzUnitTrends": [
                    {
                        "dk": "202402",
                        "sales": 200
                    },
                    {
                        "dk": "202403",
                        "sales": 700
                    },
                    {
                        "dk": "202404",
                        "sales": 200
                    },
                    {
                        "dk": "202405",
                        "sales": 500
                    },
                    {
                        "dk": "202406",
                        "sales": 1000
                    },
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
                    }
                ],
                "asin": "B0CQ4STXZR",
                "availableDate": 1704486960000,
                "availableDays": 693,
                "availableMonth": 10,
                "availableYear": 1,
                "averagePrice": 81.17,
                "brand": "Lufeiya",
                "brandUrl": "https://www.amazon.com/s?k=Lufeiya",
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRank": 7087,
                "bsrRankCr": 17.36,
                "bsrRankCv": 1489,
                "categoryId": "1055398",
                "categoryName": "Home & Kitchen",
                "channel": "P",
                "coupon": "",
                "curMon": false,
                "deliveryPrice": -1.0,
                "dimensionType": "EL15O",
                "dimensions": "19.7 x 46.6 x 29.5 inches",
                "ebc": "Y",
                "fba": 21.11,
                "firstReviewDate": 1704486960000,
                "guestVisited": false,
                "id": "USB0CQ4STXZR",
                "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/715MlAvRnWL._AC_US200_.jpg",
                "lqs": 100,
                "marketId": 1,
                "monDailySales": "",
                "monthId": 202511,
                "monthName": "202511",
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "order": {
                    "desc": true,
                    "field": ""
                },
                "overviews": "{\"Brand\":\"Lufeiya\",\"Product Dimensions\":\"19.7\\\"D x 46.6\\\"W x 29.5\\\"H\",\"Color\":\"Rustic Brown\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Reversible\",\"Room Type\":\"Bedroom, Living Room, Office, Study Room\",\"Recommended Uses For Product\":\"Gaming, Working, Writing\",\"Furniture leg material\":\"Metal\"}",
                "page": 0,
                "pages": 0,
                "parent": "B0D93D2G2W",
                "parentChangeHis": [],
                "pkgDimensionType": "LB",
                "pkgDimensions": "34.6 x 21.1 x 3.9 inches",
                "pkgVolumeWeights": 9291.242,
                "pkgWeight": "31.61 pounds",
                "price": 66.48,
                "primeExclusivePrice": -1.0,
                "profit": 53.25,
                "rating": 4.4,
                "reviews": 1479,
                "reviewsDelta": 0,
                "reviewsIncreasement": 113,
                "reviewsRate": 3.31,
                "salesTrend": "{\"202509\":3095,\"202408\":4033,\"202507\":4264,\"202409\":2238,\"202508\":4239,\"202406\":1598,\"202505\":1285,\"202407\":1775,\"202506\":2023,\"202404\":337,\"202503\":1972,\"202405\":1688,\"202504\":1388,\"202402\":704,\"202501\":1334,\"202403\":2349,\"202502\":2001,\"202411\":4187,\"202510\":2782,\"202412\":1613,\"202511\":3411,\"202410\":2945}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerNation": "CN",
                "sellerType": "FBA",
                "sellers": 1,
                "sku": "Color: Rustic Brown | Size: 46.6\"",
                "station": "GLOBAL",
                "subcategories": [
                    {
                        "code": "3733671",
                        "label": "Home Office Desks",
                        "rank": 28
                    }
                ],
                "symbol": "N",
                "syncTime": 1764582287000,
                "title": "Lufeiya Computer Desk with Fabric File Drawers Cabinet, 47 Inch Reversible Home Office Desks with Filing Cabinet for Small Space, Study Writing Table PC Desks, Rustic Brown",
                "took": 0,
                "total": 0,
                "totalAmount": 276870.88,
                "totalAmountGrowth": 21.0,
                "totalUnits": 3411,
                "totalUnitsGrowth": 21.0,
                "totalUnitsGrowthYoy": -18.53,
                "totalUnitsGrowthYoyLag1": -5.53,
                "totalUnitsGrowthYoyLag2": 38.29,
                "totalUnitsGrowthYoyLag3": 5.11,
                "totalUnitsGrowthYoyLag4": 140.23,
                "totalUnitsGrowthYoyLag5": 26.6,
                "trends": [
                    {
                        "dk": "202402",
                        "sales": 704
                    },
                    {
                        "dk": "202403",
                        "sales": 2349
                    },
                    {
                        "dk": "202404",
                        "sales": 337
                    },
                    {
                        "dk": "202405",
                        "sales": 1688
                    },
                    {
                        "dk": "202406",
                        "sales": 1598
                    },
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
                    }
                ],
                "updatedTime": 1764584658768,
                "variations": 6,
                "video": "N",
                "weight": "31.8 Pounds"
            },
            "2025-12": {
                "alias": "B0CQ4STXZR",
                "amazonChoice": "Amazon's Choice",
                "amzUnit": 300,
                "amzUnitDate": 1767300405000,
                "amzUnitTrend": "{\"202402\":200,\"202403\":700,\"202404\":200,\"202405\":500,\"202406\":1000,\"202407\":200,\"202408\":1000,\"202409\":900,\"202410\":700,\"202411\":900,\"202412\":400,\"202501\":200,\"202502\":300,\"202503\":200,\"202504\":100,\"202505\":100,\"202506\":300,\"202507\":500,\"202508\":500,\"202509\":500,\"202510\":300,\"202511\":400}",
                "amzUnitTrends": [
                    {
                        "dk": "202402",
                        "sales": 200
                    },
                    {
                        "dk": "202403",
                        "sales": 700
                    },
                    {
                        "dk": "202404",
                        "sales": 200
                    },
                    {
                        "dk": "202405",
                        "sales": 500
                    },
                    {
                        "dk": "202406",
                        "sales": 1000
                    },
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
                    }
                ],
                "asin": "B0CQ4STXZR",
                "availableDate": 1704486960000,
                "availableDays": 724,
                "availableMonth": 11,
                "availableYear": 1,
                "averagePrice": 89.33,
                "brand": "Lufeiya",
                "brandUrl": "https://www.amazon.com/s?k=Lufeiya",
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRank": 31470,
                "bsrRankCr": -71.32,
                "bsrRankCv": -13101,
                "categoryId": "1055398",
                "categoryName": "Home & Kitchen",
                "channel": "P",
                "coupon": "",
                "curMon": false,
                "deliveryPrice": -1.0,
                "dimensionType": "EL15O",
                "dimensions": "19.7 x 46.6 x 29.5 inches",
                "ebc": "Y",
                "fba": 21.11,
                "firstReviewDate": 1704486960000,
                "guestVisited": false,
                "id": "USB0CQ4STXZR",
                "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/715MlAvRnWL._AC_US200_.jpg",
                "lqs": 100,
                "marketId": 1,
                "monDailySales": "",
                "monthId": 202512,
                "monthName": "202512",
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "order": {
                    "desc": true,
                    "field": ""
                },
                "overviews": "{\"Brand\":\"Lufeiya\",\"Shape\":\"Rectangular\",\"Desk design\":\"Computer Desk, Writing Desk\",\"Product Dimensions\":\"19.7\\\"D x 46.6\\\"W x 29.5\\\"H\",\"Color\":\"Rustic Brown\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\",\"Top Material Type\":\"Tabletop made of FSC-Certified Wood\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Reversible\"}",
                "page": 0,
                "pages": 0,
                "parent": "B0D93D2G2W",
                "parentChangeHis": [],
                "pkgDimensionType": "LB",
                "pkgDimensions": "34.6 x 21.1 x 3.9 inches",
                "pkgVolumeWeights": 9291.242,
                "pkgWeight": "31.61 pounds",
                "price": 89.99,
                "primeExclusivePrice": -1.0,
                "profit": 60.31,
                "rating": 4.3,
                "reviews": 731,
                "reviewsDelta": 845,
                "reviewsIncreasement": 0,
                "reviewsRate": 0.0,
                "salesTrend": "{\"202509\":3095,\"202408\":4033,\"202507\":4264,\"202409\":2238,\"202508\":4239,\"202406\":1598,\"202505\":1285,\"202407\":1775,\"202506\":2023,\"202404\":337,\"202503\":1972,\"202405\":1688,\"202504\":1388,\"202402\":704,\"202501\":1334,\"202512\":2484,\"202403\":2349,\"202502\":2001,\"202411\":4187,\"202510\":2782,\"202412\":1613,\"202511\":3411,\"202410\":2945}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerNation": "CN",
                "sellerType": "FBA",
                "sellers": 1,
                "sku": "Color: Rustic Brown | Size: 46.6\"",
                "station": "GLOBAL",
                "subcategories": [
                    {
                        "code": "3733671",
                        "label": "Home Office Desks",
                        "rank": 156
                    }
                ],
                "symbol": "N",
                "syncTime": 1767316220944,
                "title": "Lufeiya Computer Desk with Fabric File Drawers Cabinet, 47 Inch Reversible Home Office Desks with Filing Cabinet for Small Space, Study Writing Table PC Desks, Rustic Brown",
                "took": 0,
                "total": 0,
                "totalAmount": 221895.72,
                "totalUnits": 2484,
                "totalUnitsGrowthYoy": 54.0,
                "totalUnitsGrowthYoyLag1": -18.53,
                "totalUnitsGrowthYoyLag2": -5.53,
                "totalUnitsGrowthYoyLag3": 38.29,
                "totalUnitsGrowthYoyLag4": 5.11,
                "totalUnitsGrowthYoyLag5": 140.23,
                "trends": [
                    {
                        "dk": "202402",
                        "sales": 704
                    },
                    {
                        "dk": "202403",
                        "sales": 2349
                    },
                    {
                        "dk": "202404",
                        "sales": 337
                    },
                    {
                        "dk": "202405",
                        "sales": 1688
                    },
                    {
                        "dk": "202406",
                        "sales": 1598
                    },
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
                    }
                ],
                "updatedTime": 1767322464448,
                "variations": 7,
                "video": "N",
                "weight": "31.8 Pounds"
            },
            "2026-01": {
                "alias": "B0D5BMFK9S",
                "amazonChoice": "Amazon's Choice",
                "amzUnit": 100,
                "amzUnitDate": 1768974296786,
                "amzUnitTrend": "{\"202402\":200,\"202403\":700,\"202404\":200,\"202405\":500,\"202406\":1000,\"202407\":200,\"202408\":1000,\"202409\":900,\"202410\":700,\"202411\":900,\"202412\":400,\"202501\":200,\"202502\":300,\"202503\":200,\"202504\":100,\"202505\":100,\"202506\":300,\"202507\":500,\"202508\":500,\"202509\":500,\"202510\":300,\"202511\":400,\"202512\":400,\"202601\":100}",
                "amzUnitTrends": [
                    {
                        "dk": "202402",
                        "sales": 200
                    },
                    {
                        "dk": "202403",
                        "sales": 700
                    },
                    {
                        "dk": "202404",
                        "sales": 200
                    },
                    {
                        "dk": "202405",
                        "sales": 500
                    },
                    {
                        "dk": "202406",
                        "sales": 1000
                    },
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
                    }
                ],
                "asin": "B0CQ4STXZR",
                "availableDate": 1704486960000,
                "availableDays": 755,
                "availableMonth": 0,
                "availableYear": 2,
                "averagePrice": 85.78,
                "brand": "Lufeiya",
                "brandUrl": "https://www.amazon.com/s?k=Lufeiya",
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRank": 13549,
                "bsrRankCr": -9.45,
                "bsrRankCv": -1170,
                "categoryId": "1055398",
                "categoryName": "Home & Kitchen",
                "channel": "P",
                "coupon": "",
                "curMon": false,
                "deliveryPrice": -1.0,
                "dimensionType": "EL15O",
                "dimensions": "19.7 x 46.6 x 29.5 inches",
                "ebc": "Y",
                "fba": 19.33,
                "firstReviewDate": 1704486960000,
                "guestVisited": false,
                "id": "USB0CQ4STXZR",
                "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/715MlAvRnWL._AC_US200_.jpg",
                "lqs": 100,
                "marketId": 1,
                "monDailySales": "",
                "monthId": 202601,
                "monthName": "202601",
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "order": {
                    "desc": true,
                    "field": ""
                },
                "overviews": "{\"Brand\":\"Lufeiya\",\"Shape\":\"Rectangular\",\"Desk design\":\"Computer Desk, Writing Desk\",\"Product Dimensions\":\"19.7\\\"D x 46.6\\\"W x 29.5\\\"H\",\"Color\":\"Black\",\"Style\":\"Modern\",\"Base Material\":\"Metal\",\"Top Material Type\":\"Tabletop made of FSC-Certified Wood\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Compact\"}",
                "page": 0,
                "pages": 0,
                "parent": "B0D93D2G2W",
                "parentChangeHis": [],
                "pkgDimensionType": "LB",
                "pkgDimensions": "34.6 x 21.1 x 3.9 inches",
                "pkgVolumeWeights": 9291.242,
                "pkgWeight": "31.61 pounds",
                "price": 89.99,
                "primeExclusivePrice": 84.99,
                "profit": 62.26,
                "rating": 4.4,
                "reviews": 779,
                "reviewsDelta": 0,
                "reviewsIncreasement": 48,
                "reviewsRate": 2.61,
                "salesTrend": "{\"202509\":3095,\"202408\":4033,\"202507\":4264,\"202409\":2238,\"202508\":4239,\"202406\":0,\"202505\":1285,\"202407\":1775,\"202506\":2023,\"202404\":0,\"202503\":1972,\"202405\":0,\"202504\":1388,\"202402\":0,\"202501\":1334,\"202512\":2503,\"202403\":0,\"202502\":2001,\"202601\":1841,\"202411\":4187,\"202510\":2782,\"202412\":1613,\"202511\":3411,\"202410\":2945}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerNation": "CN",
                "sellerType": "FBA",
                "sellers": 1,
                "sku": "Color: Rustic Brown | Size: 46.6\"",
                "station": "GLOBAL",
                "subcategories": [
                    {
                        "code": "3733671",
                        "label": "Home Office Desks",
                        "rank": 41
                    }
                ],
                "symbol": "N",
                "syncTime": 1770026208000,
                "title": "Lufeiya Computer Desk with File Drawers Cabinet, 47 Inch Reversible Home Office Desks with Filing Cabinet for Small Space, Gaming Study Writing Table PC Desks, Black",
                "took": 0,
                "total": 0,
                "totalAmount": 157920.98,
                "totalAmountGrowth": -24.0,
                "totalUnits": 1841,
                "totalUnitsGrowth": -24.0,
                "totalUnitsGrowthYoy": 38.01,
                "totalUnitsGrowthYoyLag1": 55.18,
                "totalUnitsGrowthYoyLag2": -18.53,
                "totalUnitsGrowthYoyLag3": -5.53,
                "totalUnitsGrowthYoyLag4": 38.29,
                "totalUnitsGrowthYoyLag5": 5.11,
                "trends": [
                    {
                        "dk": "202402",
                        "sales": 0
                    },
                    {
                        "dk": "202403",
                        "sales": 0
                    },
                    {
                        "dk": "202404",
                        "sales": 0
                    },
                    {
                        "dk": "202405",
                        "sales": 0
                    },
                    {
                        "dk": "202406",
                        "sales": 0
                    },
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
                        "sales": 2503
                    },
                    {
                        "dk": "202601",
                        "sales": 1841
                    }
                ],
                "updatedTime": 1770048472143,
                "variations": 4,
                "video": "N",
                "weight": "31.8 Pounds"
            },
            "2026-02": {
                "alias": "B0CQ4STXZR",
                "amzUnit": 200,
                "amzUnitDate": 1772209116583,
                "amzUnitTrend": "{\"202402\":200,\"202403\":700,\"202404\":200,\"202405\":500,\"202406\":1000,\"202407\":200,\"202408\":1000,\"202409\":900,\"202410\":700,\"202411\":900,\"202412\":400,\"202501\":200,\"202502\":300,\"202503\":200,\"202504\":100,\"202505\":100,\"202506\":300,\"202507\":500,\"202508\":500,\"202509\":500,\"202510\":300,\"202511\":400,\"202512\":400,\"202601\":100}",
                "amzUnitTrends": [
                    {
                        "dk": "202402",
                        "sales": 200
                    },
                    {
                        "dk": "202403",
                        "sales": 700
                    },
                    {
                        "dk": "202404",
                        "sales": 200
                    },
                    {
                        "dk": "202405",
                        "sales": 500
                    },
                    {
                        "dk": "202406",
                        "sales": 1000
                    },
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
                    }
                ],
                "asin": "B0CQ4STXZR",
                "availableDate": 1704486960000,
                "availableDays": 783,
                "availableMonth": 1,
                "availableYear": 2,
                "averagePrice": 89.99,
                "brand": "Lufeiya",
                "brandUrl": "https://www.amazon.com/s?k=Lufeiya",
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRank": 9391,
                "bsrRankCr": -22.58,
                "bsrRankCv": -1730,
                "categoryId": "1055398",
                "categoryName": "Home & Kitchen",
                "channel": "P",
                "coupon": "",
                "curMon": false,
                "deliveryPrice": -1.0,
                "dimensionType": "EL15O",
                "dimensions": "19.7 x 46.6 x 29.5 inches",
                "ebc": "Y",
                "fba": 19.33,
                "firstReviewDate": 1704486960000,
                "guestVisited": false,
                "id": "USB0CQ4STXZR",
                "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/715MlAvRnWL._AC_US200_.jpg",
                "lqs": 100,
                "marketId": 1,
                "monDailySales": "",
                "monthId": 202602,
                "monthName": "202602",
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "order": {
                    "desc": true,
                    "field": ""
                },
                "overviews": "{\"Brand\":\"Lufeiya\",\"Shape\":\"Rectangular\",\"Desk design\":\"Computer Desk, Writing Desk\",\"Product Dimensions\":\"19.7\\\"D x 46.6\\\"W x 29.5\\\"H\",\"Color\":\"Rustic Brown\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\",\"Top Material Type\":\"Tabletop made of FSC-Certified Wood\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Reversible\"}",
                "page": 0,
                "pages": 0,
                "parent": "B0D93D2G2W",
                "parentChangeHis": [],
                "pkgDimensionType": "SB",
                "pkgDimensions": "34.6 x 21.1 x 3.9 inches",
                "pkgVolumeWeights": 9291.242,
                "pkgWeight": "31.61 pounds",
                "price": 89.99,
                "primeExclusivePrice": 85.49,
                "profit": 62.39,
                "rating": 4.4,
                "reviews": 1782,
                "reviewsDelta": 5,
                "reviewsIncreasement": 1003,
                "reviewsRate": 45.57,
                "salesTrend": "{\"202509\":3095,\"202408\":4033,\"202507\":4264,\"202409\":2238,\"202508\":4239,\"202406\":0,\"202505\":1285,\"202407\":1775,\"202506\":2023,\"202404\":0,\"202503\":1972,\"202602\":2201,\"202405\":0,\"202504\":1388,\"202402\":0,\"202501\":1334,\"202403\":0,\"202502\":2001,\"202601\":1841,\"202410\":2945,\"202512\":2484,\"202411\":4187,\"202510\":2782,\"202412\":1613,\"202511\":3411}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerNation": "CN",
                "sellerType": "FBA",
                "sellers": 1,
                "sku": "Color: Rustic Brown | Size: 46.6\"",
                "station": "GLOBAL",
                "subcategories": [
                    {
                        "code": "3733671",
                        "label": "Home Office Desks",
                        "rank": 33
                    }
                ],
                "symbol": "N",
                "syncTime": 1772544956000,
                "title": "Lufeiya Computer Desk with Fabric File Drawers Cabinet, 47 Inch Reversible Home Office Desks with Filing Cabinet for Small Space, Study Writing Table PC Desks, Rustic Brown",
                "took": 0,
                "total": 0,
                "totalAmount": 198067.98,
                "totalUnits": 2201,
                "totalUnitsGrowthYoy": 10.0,
                "totalUnitsGrowthYoyLag1": 38.01,
                "totalUnitsGrowthYoyLag2": 54.0,
                "totalUnitsGrowthYoyLag3": -18.53,
                "totalUnitsGrowthYoyLag4": -5.53,
                "totalUnitsGrowthYoyLag5": 38.29,
                "trends": [
                    {
                        "dk": "202402",
                        "sales": 0
                    },
                    {
                        "dk": "202403",
                        "sales": 0
                    },
                    {
                        "dk": "202404",
                        "sales": 0
                    },
                    {
                        "dk": "202405",
                        "sales": 0
                    },
                    {
                        "dk": "202406",
                        "sales": 0
                    },
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
                    }
                ],
                "updatedTime": 1772557143000,
                "variations": 5,
                "video": "N",
                "weight": "30.9 Pounds"
            },
            "2026-03": {
                "alias": "B0DDYDBTNF",
                "amzUnit": 200,
                "amzUnitDate": 1774813063848,
                "amzUnitTrend": "{\"202403\":700,\"202404\":200,\"202405\":500,\"202406\":1000,\"202407\":200,\"202408\":1000,\"202409\":900,\"202410\":700,\"202411\":900,\"202412\":400,\"202501\":200,\"202502\":300,\"202503\":200,\"202504\":100,\"202505\":100,\"202506\":300,\"202507\":500,\"202508\":500,\"202509\":500,\"202510\":300,\"202511\":400,\"202512\":400,\"202601\":100,\"202602\":200,\"202603\":200}",
                "amzUnitTrends": [
                    {
                        "dk": "202403",
                        "sales": 700
                    },
                    {
                        "dk": "202404",
                        "sales": 200
                    },
                    {
                        "dk": "202405",
                        "sales": 500
                    },
                    {
                        "dk": "202406",
                        "sales": 1000
                    },
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
                    }
                ],
                "asin": "B0CQ4STXZR",
                "availableDate": 1704486960000,
                "availableDays": 814,
                "availableMonth": 2,
                "availableYear": 2,
                "averagePrice": 89.99,
                "brand": "Lufeiya",
                "brandUrl": "https://www.amazon.com/s?k=Lufeiya",
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRank": 11110,
                "bsrRankCr": 32.7,
                "bsrRankCv": 5398,
                "categoryId": "1055398",
                "categoryName": "Home & Kitchen",
                "channel": "P",
                "coupon": "",
                "curMon": false,
                "deliveryPrice": -1.0,
                "dimensionType": "EL15O",
                "dimensions": "19.7 x 46.6 x 29.5 inches",
                "ebc": "Y",
                "fba": 20.01,
                "firstReviewDate": 1704486960000,
                "guestVisited": false,
                "id": "USB0CQ4STXZR",
                "imageUrl": "https://m.media-amazon.com/images/I/41b0fdzeceL._AC_US200_.jpg",
                "lqs": 100,
                "marketId": 1,
                "monDailySales": "",
                "monthId": 202603,
                "monthName": "202603",
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "order": {
                    "desc": true,
                    "field": ""
                },
                "overviews": "{\"Brand\":\"Lufeiya\",\"Shape\":\"Rectangular\",\"Desk design\":\"Computer Desk, Writing Desk\",\"Product Dimensions\":\"19.7\\\"D x 54.5\\\"W x 29.5\\\"H\",\"Color\":\"Rustic Brown\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\",\"Top Material Type\":\"Tabletop made of FSC-Certified Wood\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Compact\"}",
                "page": 0,
                "pages": 0,
                "parent": "B0D93D2G2W",
                "parentChangeHis": [],
                "pkgDimensionType": "SB",
                "pkgDimensions": "34.6 x 21.1 x 3.9 inches",
                "pkgVolumeWeights": 9291.242,
                "pkgWeight": "31.61 pounds",
                "price": 89.99,
                "primeExclusivePrice": -1.0,
                "profit": 64.99,
                "rating": 4.4,
                "reviews": 1902,
                "reviewsDelta": 55,
                "reviewsIncreasement": 120,
                "reviewsRate": 5.78,
                "salesTrend": "{\"202509\":3095,\"202408\":4033,\"202507\":4264,\"202409\":2238,\"202508\":4239,\"202505\":1285,\"202407\":1775,\"202506\":2023,\"202503\":1972,\"202602\":2201,\"202504\":1388,\"202603\":2077,\"202501\":1334,\"202512\":2484,\"202502\":2001,\"202601\":1841,\"202411\":4187,\"202510\":2782,\"202412\":1613,\"202511\":3411,\"202410\":2945}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerNation": "CN",
                "sellerType": "FBA",
                "sellers": 1,
                "sku": "Color: Rustic Brown | Size: 46.6\"",
                "station": "GLOBAL",
                "subcategories": [
                    {
                        "code": "3733671",
                        "label": "Home Office Desks",
                        "rank": 23
                    }
                ],
                "symbol": "N",
                "syncTime": 1777454609000,
                "title": "Lufeiya Computer Desk with Fabric File Drawers Cabinet, 55 Inch Reversible Home Office Desks with Filing Cabinet for Small Space, Study Writing Table PC Desks with Storage for Bedroom, Rustic Brown",
                "took": 0,
                "total": 0,
                "totalAmount": 186909.22,
                "totalAmountGrowth": 10.0,
                "totalUnits": 2077,
                "totalUnitsGrowth": 10.0,
                "totalUnitsGrowthYoy": 5.32,
                "totalUnitsGrowthYoyLag1": 10.0,
                "totalUnitsGrowthYoyLag2": 38.01,
                "totalUnitsGrowthYoyLag3": 54.0,
                "totalUnitsGrowthYoyLag4": -18.53,
                "totalUnitsGrowthYoyLag5": -5.53,
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
                    }
                ],
                "updatedTime": 1777500160896,
                "variations": 6,
                "video": "N",
                "weight": "30.9 Pounds"
            },
            "2026-04": {
                "alias": "B0DDYDBTNF",
                "amazonChoice": "Amazon's Choice",
                "amzUnit": 100,
                "amzUnitDate": 1776971594277,
                "amzUnitTrend": "{\"202403\":700,\"202404\":200,\"202405\":500,\"202406\":1000,\"202407\":200,\"202408\":1000,\"202409\":900,\"202410\":700,\"202411\":900,\"202412\":400,\"202501\":200,\"202502\":300,\"202503\":200,\"202504\":100,\"202505\":100,\"202506\":300,\"202507\":500,\"202508\":500,\"202509\":500,\"202510\":300,\"202511\":400,\"202512\":400,\"202601\":100,\"202602\":200,\"202603\":200}",
                "amzUnitTrends": [
                    {
                        "dk": "202403",
                        "sales": 700
                    },
                    {
                        "dk": "202404",
                        "sales": 200
                    },
                    {
                        "dk": "202405",
                        "sales": 500
                    },
                    {
                        "dk": "202406",
                        "sales": 1000
                    },
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
                    }
                ],
                "asin": "B0CQ4STXZR",
                "availableDate": 1704486960000,
                "availableDays": 844,
                "availableMonth": 3,
                "availableYear": 2,
                "averagePrice": 98.05,
                "brand": "Lufeiya",
                "brandUrl": "https://www.amazon.com/s?k=Lufeiya",
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRank": 27014,
                "bsrRankCr": -51.13,
                "bsrRankCv": -9139,
                "categoryId": "1055398",
                "categoryName": "Home & Kitchen",
                "channel": "P",
                "coupon": "",
                "curMon": false,
                "deliveryPrice": -1.0,
                "dimensionType": "EL15O",
                "dimensions": "19.7 x 46.6 x 29.5 inches",
                "ebc": "Y",
                "fba": 20.01,
                "firstReviewDate": 1704486960000,
                "guestVisited": false,
                "id": "USB0CQ4STXZR",
                "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/71KjDsHLboL._AC_US200_.jpg",
                "lqs": 100,
                "marketId": 1,
                "monDailySales": "",
                "monthId": 202604,
                "monthName": "202604",
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "order": {
                    "desc": true,
                    "field": ""
                },
                "overviews": "{\"Brand\":\"Lufeiya\",\"Shape\":\"Rectangular\",\"Desk design\":\"Computer Desk, Writing Desk\",\"Product Dimensions\":\"19.7\\\"D x 54.5\\\"W x 29.5\\\"H\",\"Color\":\"Rustic Brown\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\",\"Top Material Type\":\"Tabletop made of FSC-Certified Wood\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Compact\"}",
                "page": 0,
                "pages": 0,
                "parent": "B0D93D2G2W",
                "parentChangeHis": [],
                "pkgDimensionType": "SB",
                "pkgDimensions": "34.6 x 21.1 x 3.9 inches",
                "pkgVolumeWeights": 9291.242,
                "pkgWeight": "31.61 pounds",
                "price": 99.99,
                "primeExclusivePrice": 89.99,
                "profit": 62.77,
                "rating": 4.5,
                "reviews": 1957,
                "reviewsDelta": 0,
                "reviewsIncreasement": 53,
                "reviewsRate": 2.41,
                "salesTrend": "{\"202509\":3095,\"202408\":4033,\"202507\":4264,\"202409\":2238,\"202508\":4239,\"202505\":1285,\"202604\":2201,\"202407\":1775,\"202506\":2023,\"202503\":1972,\"202602\":2201,\"202504\":1388,\"202603\":1733,\"202501\":1334,\"202512\":2484,\"202502\":2001,\"202601\":1841,\"202411\":4187,\"202510\":2782,\"202412\":1613,\"202511\":3411,\"202410\":2945}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerNation": "CN",
                "sellerType": "FBA",
                "sellers": 1,
                "sku": "Color: Rustic Brown | Size: 46.6\"",
                "station": "GLOBAL",
                "subcategories": [
                    {
                        "code": "3733671",
                        "label": "Home Office Desks",
                        "rank": 47
                    }
                ],
                "symbol": "N",
                "syncTime": 1777644261000,
                "title": "Lufeiya Computer Desk with Fabric File Drawers Cabinet, 55 Inch Reversible Home Office Desks with Filing Cabinet for Small Space, Study Writing Table PC Desks with Storage for Bedroom, Rustic Brown",
                "took": 0,
                "total": 0,
                "totalAmount": 215808.06,
                "totalUnits": 2201,
                "totalUnitsGrowthYoy": 58.57,
                "totalUnitsGrowthYoyLag1": -12.12,
                "totalUnitsGrowthYoyLag2": 10.0,
                "totalUnitsGrowthYoyLag3": 38.01,
                "totalUnitsGrowthYoyLag4": 54.0,
                "totalUnitsGrowthYoyLag5": -18.53,
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
                        "sales": 1733
                    },
                    {
                        "dk": "202604",
                        "sales": 2201
                    }
                ],
                "updatedTime": 1777676709257,
                "variations": 6,
                "video": "N",
                "weight": "30.9 Pounds"
            },
            "2026-05": {
                "alias": "B0CQ4STXZR",
                "amazonChoice": "Amazon's Choice",
                "amzUnit": 50,
                "amzUnitDate": 1780075918065,
                "amzUnitTrend": "{\"202404\":200,\"202405\":500,\"202406\":1000,\"202407\":200,\"202408\":1000,\"202409\":900,\"202410\":700,\"202411\":900,\"202412\":400,\"202501\":200,\"202502\":300,\"202503\":200,\"202504\":100,\"202505\":100,\"202506\":300,\"202507\":500,\"202508\":500,\"202509\":500,\"202510\":300,\"202511\":400,\"202512\":400,\"202601\":100,\"202602\":200,\"202603\":200,\"202604\":100}",
                "amzUnitTrends": [
                    {
                        "dk": "202404",
                        "sales": 200
                    },
                    {
                        "dk": "202405",
                        "sales": 500
                    },
                    {
                        "dk": "202406",
                        "sales": 1000
                    },
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
                    }
                ],
                "asin": "B0CQ4STXZR",
                "availableDate": 1704486960000,
                "availableDays": 875,
                "availableMonth": 4,
                "availableYear": 2,
                "averagePrice": 95.98,
                "brand": "Lufeiya",
                "brandUrl": "https://www.amazon.com/s?k=Lufeiya",
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRank": 25064,
                "bsrRankCr": 6.66,
                "bsrRankCv": 1789,
                "categoryId": "1055398",
                "categoryName": "Home & Kitchen",
                "channel": "P",
                "coupon": "",
                "curMon": false,
                "deliveryPrice": -1.0,
                "dimensionType": "EL15O",
                "dimensions": "19.7 x 46.6 x 29.5 inches",
                "ebc": "Y",
                "fba": 20.01,
                "firstReviewDate": 1704486960000,
                "guestVisited": false,
                "id": "USB0CQ4STXZR",
                "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/715MlAvRnWL._AC_US200_.jpg",
                "lqs": 83,
                "marketId": 1,
                "monDailySales": "",
                "monthId": 202605,
                "monthName": "202605",
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "order": {
                    "desc": true,
                    "field": ""
                },
                "overviews": "{\"Brand\":\"Lufeiya\",\"Top Material Type\":\"Tabletop made of FSC-Certified Wood\",\"Shape\":\"Rectangular\",\"Desk design\":\"Computer Desk, Writing Desk\",\"Product Dimensions\":\"19.7\\\"D x 46.6\\\"W x 29.5\\\"H\",\"Color\":\"Rustic Brown\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Reversible\"}",
                "page": 0,
                "pages": 0,
                "parent": "B0D93D2G2W",
                "parentChangeHis": [],
                "pkgDimensionType": "SB",
                "pkgDimensions": "34.6 x 21.1 x 3.9 inches",
                "pkgVolumeWeights": 9291.242,
                "pkgWeight": "31.61 pounds",
                "price": 99.99,
                "primeExclusivePrice": -1.0,
                "profit": 62.77,
                "rating": 4.5,
                "reviews": 2065,
                "reviewsDelta": 0,
                "reviewsIncreasement": 108,
                "reviewsRate": 7.65,
                "salesTrend": "{\"202509\":3095,\"202408\":4033,\"202507\":4264,\"202409\":2238,\"202508\":4239,\"202505\":1285,\"202604\":1896,\"202407\":1775,\"202506\":2023,\"202605\":1412,\"202503\":1972,\"202602\":2201,\"202504\":1388,\"202603\":2077,\"202501\":1334,\"202512\":2484,\"202502\":2001,\"202601\":1841,\"202411\":4187,\"202510\":2782,\"202412\":1613,\"202511\":3411,\"202410\":2945}",
                "sellerId": "",
                "sellerName": "Amazon",
                "sellerNation": "US",
                "sellerType": "AMZ",
                "sellers": 1,
                "sku": "Color: Rustic Brown | Size: 46.6\"",
                "station": "GLOBAL",
                "subcategories": [
                    {
                        "code": "3733671",
                        "label": "Home Office Desks",
                        "rank": 44
                    }
                ],
                "symbol": "N",
                "syncTime": 1780114623000,
                "title": "Lufeiya Computer Desk with File Drawers Cabinet, 47 Inch Reversible Home Office Desks with Fabric Filing Cabinet for Small Space, Study Writing Table PC Desks, Rustic Brown",
                "took": 0,
                "total": 0,
                "totalAmount": 135523.77,
                "totalAmountGrowth": -29.0,
                "totalUnits": 1412,
                "totalUnitsGrowth": -29.0,
                "totalUnitsGrowthYoy": 9.88,
                "totalUnitsGrowthYoyLag1": 36.6,
                "totalUnitsGrowthYoyLag2": 5.32,
                "totalUnitsGrowthYoyLag3": 10.0,
                "totalUnitsGrowthYoyLag4": 38.01,
                "totalUnitsGrowthYoyLag5": 54.0,
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
                    }
                ],
                "updatedTime": 1780242942300,
                "variations": 7,
                "video": "N",
                "weight": "30.9 Pounds"
            },
            "2026-06": {
                "alias": "B0CQ4STXZR",
                "amazonChoice": "Amazon's Choice",
                "amzUnit": 200,
                "amzUnitDate": 1782755785377,
                "amzUnitTrend": "{\"202405\":500,\"202406\":1000,\"202407\":200,\"202408\":1000,\"202409\":900,\"202410\":700,\"202411\":900,\"202412\":400,\"202501\":200,\"202502\":300,\"202503\":200,\"202504\":100,\"202505\":100,\"202506\":300,\"202507\":500,\"202508\":500,\"202509\":500,\"202510\":300,\"202511\":400,\"202512\":400,\"202601\":100,\"202602\":200,\"202603\":200,\"202604\":100,\"202605\":50}",
                "amzUnitTrends": [
                    {
                        "dk": "202405",
                        "sales": 500
                    },
                    {
                        "dk": "202406",
                        "sales": 1000
                    },
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
                    }
                ],
                "asin": "B0CQ4STXZR",
                "availableDate": 1704486960000,
                "availableDays": 905,
                "availableMonth": 5,
                "availableYear": 2,
                "averagePrice": 94.23,
                "brand": "Lufeiya",
                "brandUrl": "https://www.amazon.com/s?k=Lufeiya",
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRank": 16600,
                "bsrRankCr": 2.62,
                "bsrRankCv": 447,
                "categoryId": "1055398",
                "categoryName": "Home & Kitchen",
                "channel": "P",
                "coupon": "",
                "curMon": false,
                "deliveryPrice": -1.0,
                "dimensionType": "EL15O",
                "dimensions": "19.7 x 46.6 x 29.5 inches",
                "ebc": "Y",
                "fba": 20.01,
                "firstReviewDate": 1704486960000,
                "guestVisited": false,
                "id": "USB0CQ4STXZR",
                "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/715MlAvRnWL._AC_US200_.jpg",
                "lqs": 100,
                "marketId": 1,
                "monDailySales": "",
                "monthId": 202606,
                "monthName": "202606",
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "order": {
                    "desc": true,
                    "field": ""
                },
                "overviews": "{\"Brand\":\"Lufeiya\",\"Shape\":\"Rectangular\",\"Desk design\":\"Computer Desk, Writing Desk\",\"Product Dimensions\":\"19.7\\\"D x 46.6\\\"W x 29.5\\\"H\",\"Color\":\"Rustic Brown\",\"Style\":\"Rustic\",\"Base Material\":\"Metal\",\"Top Material Type\":\"Tabletop made of FSC-Certified Wood\",\"Finish Type\":\"Powder Coated\",\"Special Feature\":\"Reversible\"}",
                "page": 0,
                "pages": 0,
                "parent": "B0D93D2G2W",
                "parentChangeHis": [],
                "pkgDimensionType": "SB",
                "pkgDimensions": "34.6 x 21.1 x 3.9 inches",
                "pkgVolumeWeights": 9291.242,
                "pkgWeight": "31.61 pounds",
                "price": 99.99,
                "primeExclusivePrice": -1.0,
                "profit": 61.59,
                "rating": 4.5,
                "reviews": 2143,
                "reviewsDelta": 9,
                "reviewsIncreasement": 70,
                "reviewsRate": 2.97,
                "salesTrend": "{\"202509\":3095,\"202408\":4033,\"202507\":4264,\"202606\":2360,\"202409\":2238,\"202508\":4239,\"202505\":1285,\"202604\":1896,\"202407\":1775,\"202506\":2023,\"202605\":1412,\"202503\":1972,\"202602\":2201,\"202504\":1388,\"202603\":2077,\"202501\":1334,\"202502\":2001,\"202601\":1841,\"202410\":2945,\"202512\":2484,\"202411\":4187,\"202510\":2782,\"202412\":1613,\"202511\":3411}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerNation": "CN",
                "sellerType": "FBA",
                "sellers": 1,
                "sku": "Color: Rustic Brown | Size: 46.6\"",
                "station": "GLOBAL",
                "subcategories": [
                    {
                        "code": "3733671",
                        "label": "Home Office Desks",
                        "rank": 35
                    }
                ],
                "symbol": "N",
                "syncTime": 1782994571217,
                "title": "Lufeiya Computer Desk with File Drawers Cabinet, 47 Inch Reversible Home Office Desks with Fabric Filing Cabinet for Small Space, Study Writing Table PC Desks, Rustic Brown",
                "took": 0,
                "total": 0,
                "totalAmount": 222382.81,
                "totalUnits": 2360,
                "totalUnitsGrowthYoy": 16.66,
                "totalUnitsGrowthYoyLag1": 9.88,
                "totalUnitsGrowthYoyLag2": 36.6,
                "totalUnitsGrowthYoyLag3": 5.32,
                "totalUnitsGrowthYoyLag4": 10.0,
                "totalUnitsGrowthYoyLag5": 38.01,
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
                        "sales": 2360
                    }
                ],
                "updatedTime": 1783028660847,
                "variations": 7,
                "video": "N",
                "weight": "30.9 Pounds"
            },
            "2026-07": {
                "alias": "B0CQ4STXZR",
                "amazonChoice": "Amazon's Choice",
                "amzUnit": 200,
                "amzUnitDate": 1785341800749,
                "amzUnitTrend": "{\"202406\":1000,\"202407\":200,\"202408\":1000,\"202409\":900,\"202410\":700,\"202411\":900,\"202412\":400,\"202501\":200,\"202502\":300,\"202503\":200,\"202504\":100,\"202505\":100,\"202506\":300,\"202507\":500,\"202508\":500,\"202509\":500,\"202510\":300,\"202511\":400,\"202512\":400,\"202601\":100,\"202602\":200,\"202603\":200,\"202604\":100,\"202605\":50,\"202606\":200}",
                "amzUnitTrends": [
                    {
                        "dk": "202406",
                        "sales": 1000
                    },
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
                    }
                ],
                "asin": "B0CQ4STXZR",
                "availableDate": 1704486960000,
                "availableDays": 936,
                "availableMonth": 6,
                "availableYear": 2,
                "averagePrice": 91.89,
                "brand": "Lufeiya",
                "brandUrl": "https://www.amazon.com/s?k=Lufeiya",
                "bsrId": "home-garden",
                "bsrLabel": "Home & Kitchen",
                "bsrRank": 6869,
                "bsrRankCr": 23.84,
                "bsrRankCv": 2150,
                "categoryId": "1055398",
                "categoryName": "Home & Kitchen",
                "channel": "P",
                "coupon": "",
                "curMon": false,
                "deliveryPrice": -1.0,
                "dimensionType": "EL15O",
                "dimensions": "19.7 x 46.6 x 29.5 inches",
                "ebc": "Y",
                "fba": 20.01,
                "firstReviewDate": 1704486960000,
                "guestVisited": false,
                "id": "USB0CQ4STXZR",
                "imageUrl": "https://images-na.ssl-images-amazon.com/images/I/715MlAvRnWL._AC_US200_.jpg",
                "lqs": 100,
                "marketId": 1,
                "monDailySales": "",
                "monthId": 202607,
                "monthName": "202607",
                "nodeId": 3733671,
                "nodeIdPath": "1055398:1063306:1063312:3733671",
                "nodeLabelPath": "Home & Kitchen:Furniture:Home Office Furniture:Home Office Desks",
                "order": {
                    "desc": true,
                    "field": ""
                },
                "overviews": "{\"Dimensions & weight\":\"46.6\\\"W x 19.7\\\"D x 29.5\\\"H, Package: 87.8 x 53.7 x 10 cm, 14.34 kg\",\"Finish & material\":\"Engineered wood tabletop, FSC-Certified wood, Metal frame, Powder coated\",\"Desk type & style\":\"Computer desk, Rustic style, Rectangular shape\",\"Storage features\":\"3 drawers, 1 file cabinet, Utility drawer type, Legal/letter size files\",\"Capacity & performance\":\"150 lbs max weight, 47 inch workspace\",\"Special features\":\"Reversible file cabinet, Adjustable leg pads, Scratch-resistant, Waterproof\",\"Assembly & installation\":\"Assembly required, 20 minutes assembly time, 5 items included, 1 box\",\"Included components\":\"Storage bag, Assembly tools\",\"Base & mounting\":\"Floor mount, Leg base type\",\"Room type & use\":\"Office, Adult age range, Unisex\"}",
                "page": 0,
                "pages": 0,
                "parent": "B0D93D2G2W",
                "parentChangeHis": [],
                "pkgDimensionType": "SB",
                "pkgDimensions": "34.6 x 21.1 x 3.9 inches",
                "pkgVolumeWeights": 9291.242,
                "pkgWeight": "31.61 pounds",
                "price": 79.99,
                "primeExclusivePrice": -1.0,
                "profit": 59.99,
                "rating": 4.4,
                "reviews": 2231,
                "reviewsDelta": 0,
                "reviewsIncreasement": 85,
                "reviewsRate": 3.05,
                "salesTrend": "{\"202509\":3095,\"202408\":4033,\"202507\":4264,\"202606\":2414,\"202409\":2238,\"202508\":4239,\"202607\":2783,\"202505\":1285,\"202604\":1896,\"202407\":1775,\"202506\":2023,\"202605\":1412,\"202503\":1972,\"202602\":2201,\"202504\":1388,\"202603\":2077,\"202501\":1334,\"202502\":2001,\"202601\":1841,\"202410\":2945,\"202512\":2484,\"202411\":4187,\"202510\":2782,\"202412\":1613,\"202511\":3411}",
                "sellerId": "A1G57VOI7NPB74",
                "sellerName": "Lufeiya",
                "sellerNation": "CN",
                "sellerType": "FBA",
                "sellers": 1,
                "sku": "Color: Rustic Brown | Size: 46.6\"",
                "station": "GLOBAL",
                "subcategories": [
                    {
                        "code": "3733671",
                        "label": "Home Office Desks",
                        "rank": 8
                    }
                ],
                "symbol": "N",
                "syncTime": 1785568298000,
                "title": "Lufeiya Computer Desk with File Drawers Cabinet, 47 Inch Reversible Home Office Desks with Fabric Filing Cabinet for Small Space, Study Writing Table PC Desks, Rustic Brown",
                "took": 0,
                "total": 0,
                "totalAmount": 255729.88,
                "totalAmountGrowth": 16.0,
                "totalUnits": 2783,
                "totalUnitsGrowth": 16.0,
                "totalUnitsGrowthYoy": -34.73,
                "totalUnitsGrowthYoyLag1": 19.33,
                "totalUnitsGrowthYoyLag2": 9.88,
                "totalUnitsGrowthYoyLag3": 36.6,
                "totalUnitsGrowthYoyLag4": 5.32,
                "totalUnitsGrowthYoyLag5": 10.0,
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
                    }
                ],
                "updatedTime": 1785628950356,
                "variations": 7,
                "video": "N",
                "weight": "30.9 Pounds"
            },
            "2026-08": {
                "averagePrice": 93.48,
                "curMon": true,
                "curMonDaysales": [
                    {
                        "bsr": 5055,
                        "dailySales": 193,
                        "dailySales5MA": 193.0,
                        "dateId": 20260802,
                        "dateStr": "2026/08/02",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 5535,
                        "dailySales": 157,
                        "dailySales5MA": 175.0,
                        "dateId": 20260803,
                        "dateStr": "2026/08/03",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 5990,
                        "dailySales": 157,
                        "dailySales5MA": 169.0,
                        "dateId": 20260804,
                        "dateStr": "2026/08/04",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 5410,
                        "dailySales": 161,
                        "dailySales5MA": 167.0,
                        "dateId": 20260805,
                        "dateStr": "2026/08/05",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 5431,
                        "dailySales": 168,
                        "dailySales5MA": 167.2,
                        "dateId": 20260806,
                        "dateStr": "2026/08/06",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 5100,
                        "dailySales": 176,
                        "dailySales5MA": 163.8,
                        "dateId": 20260807,
                        "dateStr": "2026/08/07",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 4726,
                        "dailySales": 173,
                        "dailySales5MA": 167.0,
                        "dateId": 20260808,
                        "dateStr": "2026/08/08",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 4789,
                        "dailySales": 216,
                        "dailySales5MA": 178.8,
                        "dateId": 20260809,
                        "dateStr": "2026/08/09",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 4919,
                        "dailySales": 179,
                        "dailySales5MA": 182.4,
                        "dateId": 20260810,
                        "dateStr": "2026/08/10",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 5303,
                        "dailySales": 169,
                        "dailySales5MA": 182.6,
                        "dateId": 20260811,
                        "dateStr": "2026/08/11",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 5052,
                        "dailySales": 176,
                        "dailySales5MA": 182.6,
                        "dateId": 20260812,
                        "dateStr": "2026/08/12",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 4748,
                        "dailySales": 184,
                        "dailySales5MA": 184.8,
                        "dateId": 20260813,
                        "dateStr": "2026/08/13",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 4493,
                        "dailySales": 192,
                        "dailySales5MA": 180.0,
                        "dateId": 20260814,
                        "dateStr": "2026/08/14",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 4308,
                        "dailySales": 198,
                        "dailySales5MA": 183.8,
                        "dateId": 20260815,
                        "dateStr": "2026/08/15",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 4382,
                        "dailySales": 196,
                        "dailySales5MA": 189.2,
                        "dateId": 20260816,
                        "dateStr": "2026/08/16",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 4380,
                        "dailySales": 196,
                        "dailySales5MA": 193.2,
                        "dateId": 20260817,
                        "dateStr": "2026/08/17",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 4524,
                        "dailySales": 191,
                        "dailySales5MA": 194.6,
                        "dateId": 20260818,
                        "dateStr": "2026/08/18",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 4519,
                        "dailySales": 191,
                        "dailySales5MA": 194.4,
                        "dateId": 20260819,
                        "dateStr": "2026/08/19",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 4566,
                        "dailySales": 190,
                        "dailySales5MA": 192.8,
                        "dateId": 20260820,
                        "dateStr": "2026/08/20",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 4197,
                        "dailySales": 202,
                        "dailySales5MA": 194.0,
                        "dateId": 20260821,
                        "dateStr": "2026/08/21",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 4361,
                        "dailySales": 196,
                        "dailySales5MA": 194.0,
                        "dateId": 20260822,
                        "dateStr": "2026/08/22",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 4394,
                        "dailySales": 196,
                        "dailySales5MA": 195.0,
                        "dateId": 20260823,
                        "dateStr": "2026/08/23",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 3934,
                        "dailySales": 212,
                        "dailySales5MA": 199.2,
                        "dateId": 20260824,
                        "dateStr": "2026/08/24",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 3728,
                        "dailySales": 220,
                        "dailySales5MA": 205.2,
                        "dateId": 20260825,
                        "dateStr": "2026/08/25",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 3602,
                        "dailySales": 226,
                        "dailySales5MA": 210.0,
                        "dateId": 20260826,
                        "dateStr": "2026/08/26",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 3291,
                        "dailySales": 241,
                        "dailySales5MA": 219.0,
                        "dateId": 20260827,
                        "dateStr": "2026/08/27",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 3372,
                        "dailySales": 237,
                        "dailySales5MA": 227.2,
                        "dateId": 20260828,
                        "dateStr": "2026/08/28",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 3395,
                        "dailySales": 236,
                        "dailySales5MA": 232.0,
                        "dateId": 20260829,
                        "dateStr": "2026/08/29",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 3479,
                        "dailySales": 232,
                        "dailySales5MA": 234.4,
                        "dateId": 20260830,
                        "dateStr": "2026/08/30",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    },
                    {
                        "bsr": 3428,
                        "dailySales": 234,
                        "dailySales5MA": 236.0,
                        "dateId": 20260831,
                        "dateStr": "2026/08/31",
                        "guestVisited": false,
                        "order": {
                            "desc": true,
                            "field": ""
                        },
                        "page": 0,
                        "pages": 0,
                        "took": 0,
                        "total": 0
                    }
                ],
                "guestVisited": false,
                "monDailySales": "{\"days\":[\"2026/08/02\",\"2026/08/03\",\"2026/08/04\",\"2026/08/05\",\"2026/08/06\",\"2026/08/07\",\"2026/08/08\",\"2026/08/09\",\"2026/08/10\",\"2026/08/11\",\"2026/08/12\",\"2026/08/13\",\"2026/08/14\",\"2026/08/15\",\"2026/08/16\",\"2026/08/17\",\"2026/08/18\",\"2026/08/19\",\"2026/08/20\",\"2026/08/21\",\"2026/08/22\",\"2026/08/23\",\"2026/08/24\",\"2026/08/25\",\"2026/08/26\",\"2026/08/27\",\"2026/08/28\",\"2026/08/29\",\"2026/08/30\",\"2026/08/31\"],\"bsrs\":[5055,5535,5990,5410,5431,5100,4726,4789,4919,5303,5052,4748,4493,4308,4382,4380,4524,4519,4566,4197,4361,4394,3934,3728,3602,3291,3372,3395,3479,3428],\"prices\":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],\"sales\":[\"193\",\"157\",\"157\",\"161\",\"168\",\"176\",\"173\",\"216\",\"179\",\"169\",\"176\",\"184\",\"192\",\"198\",\"196\",\"196\",\"191\",\"191\",\"190\",\"202\",\"196\",\"196\",\"212\",\"220\",\"226\",\"241\",\"237\",\"236\",\"232\",\"234\"],\"mas\":[\"193.0\",\"175.0\",\"169.0\",\"167.0\",\"167.2\",\"163.8\",\"167.0\",\"178.8\",\"182.4\",\"182.6\",\"182.6\",\"184.8\",\"180.0\",\"183.8\",\"189.2\",\"193.2\",\"194.6\",\"194.4\",\"192.8\",\"194.0\",\"194.0\",\"195.0\",\"199.2\",\"205.2\",\"210.0\",\"219.0\",\"227.2\",\"232.0\",\"234.4\",\"236.0\"]}",
                "monthId": 202608,
                "monthName": "202608",
                "order": {
                    "desc": true,
                    "field": ""
                },
                "page": 0,
                "pages": 0,
                "took": 0,
                "total": 0,
                "totalAmount": 565086.6,
                "totalUnits": 6045
            }
        },
        "marketId": 1,
        "station": {
            "country": "United States",
            "website": "https://www.amazon.com",
            "code": "COM",
            "marketplace": "ATVPDKIKX0DER",
            "areas": [
                "US",
                "MX"
            ],
            "publicCode": "US",
            "label": "美国站(com)",
            "shortname": "美",
            "marketId": 1,
            "countryCode": "US",
            "online": true,
            "currency": "$",
            "currencyCode": "USD"
        },
        "taskStation": "GLOBAL"
    },
    "code": "OK"
}