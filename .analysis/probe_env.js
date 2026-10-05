const mysql=require('mysql2/promise');
const Redis=require('ioredis');
require('dotenv').config({path:'.env.local'});
(async()=>{
  try{
    const c=await mysql.createConnection({host:process.env.MYSQL_HOST,port:+process.env.MYSQL_PORT,user:process.env.MYSQL_USER,password:process.env.MYSQL_PASSWORD,database:process.env.MYSQL_DATABASE});
    const [u]=await c.query('SELECT id,username,api_key,points,qps_limit,status,admin FROM user_account LIMIT 20');
    console.log('USERS:'); console.table(u);
    const [t]=await c.query('SHOW TABLES');
    console.log('TABLES:', t.map(r=>Object.values(r)[0]).join(', '));
    const [ep]=await c.query('SELECT * FROM endpoint_cost LIMIT 40').catch(e=>(['no endpoint_cost:'+e.message]));
    console.log('ENDPOINT COST:', JSON.stringify(ep).slice(0,1500));
    await c.end();
  }catch(e){console.log('MYSQL ERR',e.message);}
  try{
    const r=new Redis({host:process.env.REDIS_HOST,port:+process.env.REDIS_PORT});
    const sessions=await r.hkeys('mcp:session:SELLERSPRITE');
    console.log('SESSION fields:', sessions);
    for(const f of sessions.slice(0,3)){
      const v=await r.hget('mcp:session:SELLERSPRITE',f);
      try{const o=JSON.parse(v);console.log(' session',f,'keys=',Object.keys(o),'cookieLen=',(o.cookie||'').length,'hasSecretKey=',!!o.secretKey)}catch(e){console.log(' session',f,'parse err')}
    }
    const keys=await r.keys('mcp:*');
    console.log('redis mcp keys count:', keys.length, keys.slice(0,30));
    await r.quit();
  }catch(e){console.log('REDIS ERR',e.message);}
})();
