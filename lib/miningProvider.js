async function getMiningProduction({contractRef, coin, miningSpeed, since}) {
  if (!process.env.MINING_PROVIDER_URL || !process.env.MINING_PROVIDER_API_KEY) {
    return { connected:false, reason:"Mining infrastructure is not connected." };
  }
  const r=await fetch(process.env.MINING_PROVIDER_URL,{
    method:"POST",headers:{"content-type":"application/json","authorization":`Bearer ${process.env.MINING_PROVIDER_API_KEY}`},
    body:JSON.stringify({contractRef,coin,miningSpeed,since})
  });
  if(!r.ok) throw new Error("Mining provider error");
  const d=await r.json();
  if(typeof d.minedAmount!=="string") throw new Error("Mining provider returned invalid production data");
  return {connected:true,minedAmount:d.minedAmount,providerRef:d.providerRef||null,measuredAt:d.measuredAt||new Date().toISOString()};
}
async function startMining({contractRef,coin,miningSpeed}) {
  if(!process.env.MINING_PROVIDER_URL || !process.env.MINING_PROVIDER_API_KEY) return {connected:false,reason:"Mining infrastructure is not connected."};
  const r=await fetch(process.env.MINING_PROVIDER_URL+"/start",{method:"POST",headers:{"content-type":"application/json","authorization":`Bearer ${process.env.MINING_PROVIDER_API_KEY}`},body:JSON.stringify({contractRef,coin,miningSpeed})});
  if(!r.ok) throw new Error("Mining provider start error");
  return await r.json();
}
async function stopMining({contractRef}) {
  if(!process.env.MINING_PROVIDER_URL || !process.env.MINING_PROVIDER_API_KEY) return {connected:false,reason:"Mining infrastructure is not connected."};
  const r=await fetch(process.env.MINING_PROVIDER_URL+"/stop",{method:"POST",headers:{"content-type":"application/json","authorization":`Bearer ${process.env.MINING_PROVIDER_API_KEY}`},body:JSON.stringify({contractRef})});
  if(!r.ok) throw new Error("Mining provider stop error");
  return await r.json();
}
module.exports={getMiningProduction,startMining,stopMining};
