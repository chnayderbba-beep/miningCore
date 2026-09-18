async function submitPayout({currency,network,destinationAddress,amount,fee,withdrawalId}) {
  if (process.env.ENABLE_REAL_PAYOUTS !== "true" || !process.env.PAYOUT_PROVIDER_URL || !process.env.PAYOUT_PROVIDER_API_KEY)
    throw new Error("Real payout provider is not configured.");
  const r=await fetch(process.env.PAYOUT_PROVIDER_URL,{method:"POST",headers:{"content-type":"application/json","authorization":`Bearer ${process.env.PAYOUT_PROVIDER_API_KEY}`},body:JSON.stringify({currency,network,destinationAddress,amount,fee,withdrawalId})});
  if(!r.ok) throw new Error("Payout provider error");
  const d=await r.json();
  if(typeof d.txid!=="string" || !d.txid) throw new Error("Payout provider did not return a real TXID");
  return {txid:d.txid,providerReference:d.providerReference||null,submittedAt:d.submittedAt||new Date().toISOString()};
}
module.exports={submitPayout};
