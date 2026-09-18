const { getPool } = require("./db");
const cacheSeconds = () => Number(process.env.PRICE_CACHE_SECONDS || 30);
async function getPrice(symbol) {
  const pool=getPool();
  const cached=await pool.query("SELECT price_usd::text,fetched_at FROM price_cache WHERE symbol=$1",[symbol]);
  if(cached.rows[0] && (Date.now()-new Date(cached.rows[0].fetched_at).getTime())/1000 < cacheSeconds())
    return {priceUsd:cached.rows[0].price_usd,fetchedAt:cached.rows[0].fetched_at};
  if(!process.env.PRICE_PROVIDER_URL || !process.env.PRICE_PROVIDER_API_KEY) {
    if(cached.rows[0]) return {priceUsd:cached.rows[0].price_usd,fetchedAt:cached.rows[0].fetched_at,stale:true};
    return null;
  }
  const r=await fetch(process.env.PRICE_PROVIDER_URL,{method:"POST",headers:{"content-type":"application/json","authorization":`Bearer ${process.env.PRICE_PROVIDER_API_KEY}`},body:JSON.stringify({symbol})});
  if(!r.ok) {
    if(cached.rows[0]) return {priceUsd:cached.rows[0].price_usd,fetchedAt:cached.rows[0].fetched_at,stale:true};
    return null;
  }
  const d=await r.json();
  if(typeof d.priceUsd!=="string" || Number(d.priceUsd)<=0) return cached.rows[0]?{priceUsd:cached.rows[0].price_usd,fetchedAt:cached.rows[0].fetched_at,stale:true}:null;
  const now=new Date();
  await pool.query(`INSERT INTO price_cache(symbol,price_usd,fetched_at) VALUES($1,$2,$3) ON CONFLICT(symbol) DO UPDATE SET price_usd=EXCLUDED.price_usd,fetched_at=EXCLUDED.fetched_at`,[symbol,d.priceUsd,now]);
  return {priceUsd:d.priceUsd,fetchedAt:now.toISOString()};
}
module.exports={getPrice};
