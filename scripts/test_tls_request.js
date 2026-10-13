'use strict';

/**
 * TLS 指纹诊断脚本
 *
 * 将下面的 curl 请求转为等价的 Node.js axios 请求，
 * 在 Linux 服务器上运行此脚本，与直接跑 curl 对比结果。
 *
 * 运行方式（无需启动完整应用）：
 *   node scripts/test_tls_request.js
 *
 * 若 curl 通、此脚本报 Captcha not matched → 确认为 Node.js TLS 指纹问题
 * 若此脚本也通 → 问题在应用层（headers / cookie 拼装逻辑）
 */

const https = require('https');
const axios = require('axios');

// ── 从 curl 命令原样复制的参数 ──────────────────────────────────────────────
const URL = 'https://www.sellersprite.com/v2/tools/sales-estimator/bsr.json';

const HEADERS = {
  'accept': 'application/json, text/javascript, */*; q=0.01',
  'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
  'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
  'origin': 'https://www.sellersprite.com',
  'priority': 'u=1, i',
  'referer': 'https://www.sellersprite.com/v2/tools/sales-estimator',
  'sec-ch-ua': '"Chromium";v="154", "Microsoft Edge";v="154", "Not A(Brand";v="99"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0',
  'x-requested-with': 'XMLHttpRequest',
  // 把 curl -b 里的 cookie 原样粘贴到这里
  'cookie': 'current_guest=D2cOzwD2Pehn_261013-097746; Hm_lvt_e0dfc78949a2d7c553713cb5c573a486=1791856484; HMACCOUNT=6D1302574036E8CC; _ga=GA1.1.365118563.1791856484; cjConsent=MHxOfDB8Tnww; cjUser=9d66f423-3efb-4f32-a15e-f5b56d8094ad; 39770f9d5111d30dc760=1d7dd6292698d3b0c8e319afd7007bc9; _clck=1hktpjp%5E2%5Ega9%5E0%5E2477; _fp=362451437dc7b1d73be8076c9b30eb3b; _gaf_fp=950695da27c96fa19a3d756958898da4; MEIQIA_TRACK_ID=3KcUjs6FaNB0dLqo2hSi0S59KIB; MEIQIA_VISIT_ID=3KcUjo3Ys8vlltrfzWkzz5E9l8p; rank-login-user=5904191971gHLJssCDBvzyK8Stj5xyvEAqmXCnuCs2zYJ9ThkYaI2yhmrPU9M+EccYS12goccQ; rank-login-user-info="eyJuaWNrbmFtZSI6IuWkp+WFrOWPuCIsImlzQWRtaW4iOmZhbHNlLCJhY2NvdW50IjoiMTg4KioqKjcwOTciLCJ0b2tlbiI6IjU5MDQxOTE5NzFnSExKc3NDREJ2enlLOFN0ajV4eXZFQXFtWENudUNzMnpZSjlUaGtZYUkyeWhtclBVOU0rRWNjWVMxMmdvY2NRIn0="; Sprite-X-Token=eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2Nzk5NjI2YmZlMDQzZTBiYzI5NTEwMTE4ODA3YWExIn0.eyJqdGkiOiJ1YzdYajZVQkJwSEpXcVBpbF9Zb3NnIiwiaWF0IjoxNzkxODU2NDk1LCJleHAiOjE3OTE5NDI4OTUsIm5iZiI6MTc5MTg1NjQzNSwic3ViIjoieXVueWEiLCJpc3MiOiJyYW5rIiwiYXVkIjoic2VsbGVyU3BhY2UiLCJpZCI6MzYwNDEzLCJwaSI6bnVsbCwibm4iOiLlpKflhazlj7giLCJzeXMiOiJTU19DTiIsImVkIjoiTiIsInBobiI6IjE4ODU3MTA3MDk3IiwiZW0iOiJsaWh1YWp1bjUyNkAxNjMuY29tIiwibWwiOiJTIiwiZW5kIjoxODAyMTM4MDk1MDk0fQ.OfDCUyuI89gAAqBVZ96MVPH8N4jJTOgbhZG1hsy6RJKb-KZz_-YqS7nxNzN47jnyVLFeK86VmdI9SzrSv1sLshrxG4Pi8Y4FOF-G_mTHNPrkVgIyi-K98mAAhLED92kzPq-uKn1B9Y6OIoGjB85xqnHgZGkrYihafh_PKZtDuXBIm5_bXZJAAvWyyumrHvdZmoIeaiAw5YwXNBz6vbjeuckXSa51UNhLphWE5ZLk1YFXcE6fKcRrpMaxuIV8G3-iQOC2nJ6yzxtMoWR4sdkdOAIh7l7xCtrj4NGa3w05pUT5BuatTBLgSCT_4f9LQDmu3Gy9jvVtTCVO4iIp3ORY3w; ao_lo_to_n="5904191971gHLJssCDBvzyK8Stj5xyvAZXahVXwwrhdKoylCsf9ZviDpO1NxCD0hLSAAsX97iQb81vM19XfNo6zF761YbbCDhE9CRLjpHl5ZaLALGkpdA="; ecookie=UwAOXHmuIRi3O5vr_CN; _gcl_au=1.1.1812912229.1791856484.1911832167.1791856486.1791856525.21357635.1791856486.1791856525; JSESSIONID=4437EA1A932E2CD591BF80CFA1000922; Hm_lpvt_e0dfc78949a2d7c553713cb5c573a486=1791863092; _ga_CN0F80S6GL=GS2.1.s1791863091$o2$g0$t1791863091$j60$l0$h0; _clsk=1r3fzb9%5E1791863091848%5E2%5E0%5Eo.clarity.ms%2Fcollect; _ga_38NCVF2XST=GS2.1.s1791863091$o2$g1$t1791863120$j31$l0$h85489144',
};

const BODY = 'station=US&cid=2619525011&bsr=100&gtk=0cAFcWeA42c0IrA_Ozj9eL4CwKoWworpfNIlJvHhZW15Vmhx6FYSlWa1IXjNxB2hBCYhO5i5anyRn3zX9SSALpINBYjGxIELPRttZj1F4vcVjag_Gnb8mKoqjOPOYIjY_m4pcKYgkHNSxHPsnTbCaQzApUN1lhoKbiA5UZ2qdp8lVK8Q9QK12cosHEHQ5wo6_wePh-S7tTxZSynLiYNwrCp48uJo1aRFRrKFYbpsQgiXQDvE4Qh9998Mi1Do_M337Pn9uE3uNTjKNg-7i_TggZEywJRO190ovcwdXEzROKs-qs_V2zRDx360a5wPUtxXpiAGeO3wSmnbtjofeAvPCnMzW-UxgiR1bGVtBqmNPRC9a9jrfGiWeoBQxaUDctkPdCjd2sN50dCQE6rl6yBGIRRwp4KCGXvdoutQv0UGdy-v8ITQ507-TpIC-hBbBY_opjshsEAVDPP0q1uuQEb_7KouqI7Mv-YhUKnZbX15qFnIyS5Us3mzMY_fRRzfngxymtydpwRbIlOm2zEmaySVEXkryAw210acG75JlRiS5JWRPX8IxK9e09bCBua0r6-2siihgSEt7xky-6zW_E0tHadw50vYdx559VW98wuOQOoa70kPU1-NRTb-cu-UXnhVN_Vn0SMEAfjARY8clY8WtnIcceOQEjDmO66yiyVfcRlM2KxgHaFjK0cHKo6L3rkE3s_PoZTAsz8YjrVYp7wbzZKdOvoz2zoN2WRP2ylOMq_eT7cUQg36ge8XQUG7AsByIfc9WtacJ45KONfRl8Ppux6EpfYz2OK69WNEyJ03rxlN_VjDGUTuH87ODkF5_qyY76gz4KhxAq6kPXRDMWnMXR-y3l0GqZfpXyGoutKS9XZ-QxToVZcSHUIdNviXokH3wZtmFbVPFQ-k_iaFvOqud8drj6_p-1dHwylx7MER8kwyf1qUtoAffe3iy8Hes0tKEEzpRoXACMZBdVbwC8flTqC53dHMaku5JLsRvJnhYs0R4r9G3lkGTeRL9YWArpttJx9pF_X_dfS6noRHOLc6EeVtxGUsBLzJNKWT9eJqN_kTRwr6cMt9heyPBCzSNAGJiZtswmWBGmNEigTIqI8Q7cwQW62m1IlGOkjSg56kYNnbHGqkwrj2txewgTXYzoMcKMUeCf-Kl8FvgjKTUXSVc-M1Jd_d9qj5B96wH6RRmF27PZJlS1K__RYWk_Iif7QuP341BL3nhirdcttaoMMPBx2zsRDCmuglM_t1rAb-ns51madTJHRxME4g_uLsujKPmPOziicGpF7mt3wiRfQeaqdFEHs8zBIDUIL7rYnQFKm6n91cN96BsohP5uqUvyhovBBjQ9ZLIzZHi8VT8Fa3vlmndNaFwKYrk3H4AADhueNE7TQhekT-RlrmTBwGmnjD7lxeRnQ49SvtQCPHoS6zgrvTOSJOLpjtyNSMgJ3KUiQsMHvGQAg9brHU7YknYZEOMHlI2gg5KyffsKaNamn1aXAe6W89Y8O_TIcUfEYlxw-IP9a28_gq3SCQ1WKMu7hbKbdMAg704nAn6Dhgzvg4usW5W5SCrERE1DGty8vZ4_XzKJJWFnX5WgvCB5utMtLYw9_futsgL6lcBKIenv-RBn_BbSE6oc76P25bL3wvLbw7TAGh7HlZ9nyMEO3siRTmGLXPpz3h35T10g-Ui74abAj7k6MItP5zglkBYZ29z4kd9c7ZssijlMIeUh3VIrGxKnt84LYRjronDm_auRbIDNRSy4b0d6RovR_6GNRzVB70F0x1tUR77923ZXZEbtJX1YZUZfowzg50EpWzRW_1VPVxv-gt2DQE3xqonTg32SzYWBGaHMHPSpIpSiYdnAKCLtTPrGoiSPYjddEaCryZiZFvYqfOau0AX7h3B55m6WU2SDG6ySa_S_KDFqRuErr0xpGvYJzNcL7aflTA8rigqiCkfXIv7raocMuz0m4Hnt81PEv1iVpDBF_60RXr17R3OrLPtLPHS4m0cKfnPI0kZ3WW7PXzlyCSofM-frlrSBnZ79CpPwvyRzns1lA1B3scXpNf95GEeugSqg21bhotnodC9O6CVnGVyC2hoVu7Vfolbtr_MZwDznxFAjuuTcSTalSKl7BQt72PZzISsza0YG3QoHPDEJE_JfoVr3SqAGj9ciDL8ZLuLhlaVRZph0naIQfjS3_W7A-_RUPaWIqsVXwOTGEOsR5SMysLQyL-0VH69LyWb0n-SF3p9EdaWJkD08_cZBfVgkxkFq2sACuE2V2XUlBRy0ZpcVjViD9YWfNyfsO-Y6ttGXNZ0IAbqTBcAMyQUh-o3pA-rZKTUYRSca-08eFkpA1wTewg';
// ────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Node.js version :', process.version);
  console.log('OpenSSL version :', process.versions.openssl);
  console.log('Platform        :', process.platform, process.arch);
  console.log('');
  console.log('发送请求到:', URL);
  console.log('─'.repeat(60));

  try {
    const resp = await axios.post(URL, BODY, {
      headers: HEADERS,
      timeout: 15000,
      // 不验证证书（仅调试用，线上不要保留）
      // httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });

    console.log('HTTP 状态码:', resp.status);
    console.log('响应 body (前 500 字符):');
    const body = typeof resp.data === 'object' ? JSON.stringify(resp.data) : String(resp.data);
    console.log(body.slice(0, 500));

    if (resp.data && resp.data.code !== undefined) {
      const isOk = [0, 200, '0', '200', 'OK', 'SUCCESS'].includes(
        typeof resp.data.code === 'string' ? resp.data.code.toUpperCase() : resp.data.code
      );
      console.log('');
      console.log(isOk ? '✓ 业务成功' : `✗ 业务失败: code=${resp.data.code}, message=${resp.data.message}`);
    }
  } catch (err) {
    if (err.response) {
      console.error('HTTP 错误:', err.response.status);
      console.error('响应 body:', JSON.stringify(err.response.data).slice(0, 500));
    } else {
      console.error('请求异常:', err.message);
    }
  }
}

main();
