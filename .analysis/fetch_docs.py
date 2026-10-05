import re, html, urllib.request, json, os, time

BASE = 'https://open.sellersprite.com'
IDS = [1,2,3,6,9,10,12,13,14,15,16,19,20,26,27,29,46,61,62,63]
NAMES = {
 1:'查竞品(competitor_lookup)',2:'选产品(product_research)',3:'ASIN详情(asin_detail)',
 6:'关键词挖掘(keyword_miner)',9:'查产品类目(product_node)',10:'关键词选品(keyword_research)',
 12:'谷歌趋势(google_trend)',13:'流量词统计(traffic_keyword_stat)',14:'关键词反查(traffic_keyword)',
 15:'关联流量统计(traffic_listing_stat)',16:'关联流量列表(traffic_listing)',
 19:'ABA按周(aba_research_weekly)',20:'ABA按月(aba_research_monthly)',26:'BSR销量预测(bsr_prediction)',
 27:'ASIN销量预测(asin_prediction)',29:'选市场列表(market_research)',46:'拓展流量词(traffic_extend)',
 61:'ASIN销量趋势(asin_sales_trend)',62:'查ASIN竞品(asin_competitor)',63:'关键词转化率(keyword_conversion)'
}

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'})
    return urllib.request.urlopen(req, timeout=30).read().decode('utf-8','ignore')

def tables(htmltext):
    htmltext = re.sub(r'<script[\s\S]*?</script>','',htmltext)
    htmltext = re.sub(r'<style[\s\S]*?</style>','',htmltext)
    out=[]
    for tm in re.finditer(r'<table[\s\S]*?</table>', htmltext):
        t = tm.group(0)
        rows=[]
        for rm in re.finditer(r'<tr[\s\S]*?</tr>', t):
            cells=[]
            for cm in re.finditer(r'<t[hd][^>]*>([\s\S]*?)</t[hd]>', rm.group(0)):
                c = re.sub(r'<[^>]+>',' ', cm.group(1))
                c = html.unescape(re.sub(r'\s+',' ',c)).strip()
                cells.append(c)
            if cells: rows.append(cells)
        if rows: out.append(rows)
    return out

def dump(pid):
    try:
        h = fetch(f'{BASE}/api/{pid}')
    except Exception as e:
        return f'### /api/{pid} FETCH ERR {e}\n'
    tbs = tables(h)
    lines=[f'##### /api/{pid}  {NAMES.get(pid,"")}', f'  (tables={len(tbs)})']
    for ti,t in enumerate(tbs):
        hdr = '|'.join(t[0])
        if '参数' in hdr or '是否必填' in hdr:
            lines.append(f'  [表{ti}] ' + hdr)
            for r in t[1:]:
                # only request-param tables (have 是否必填) and output tables
                lines.append('    ' + ' | '.join(r))
    return '\n'.join(lines)+'\n'

out=[]
for pid in IDS:
    out.append(dump(pid))
    time.sleep(0.3)
open('/Users/lihuajun/workspace/mcp-api/.analysis/official_docs.txt','w',encoding='utf-8').write('\n'.join(out))
print('done', sum(len(x) for x in out))

# appendix
try:
    h=fetch(f'{BASE}/appendix')
    open('/Users/lihuajun/workspace/mcp-api/.analysis/appendix.html','w',encoding='utf-8').write(h)
    tbs=tables(h)
    al=[]
    for ti,t in enumerate(tbs):
        al.append(f'### appendix 表{ti}: ' + '|'.join(t[0]))
        for r in t[1:]:
            al.append('  ' + ' | '.join(r))
    open('/Users/lihuajun/workspace/mcp-api/.analysis/appendix.txt','w',encoding='utf-8').write('\n'.join(al))
    print('appendix tables', len(tbs))
except Exception as e:
    print('appendix err', e)
