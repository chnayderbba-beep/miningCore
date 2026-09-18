async function verifyPayment({txid, network, expectedAddress, expectedAmount}) {
  if (!process.env.PAYMENT_VERIFIER_URL || !process.env.PAYMENT_VERIFIER_API_KEY) {
    return { verified:false, reason:"Payment verification provider is not configured." };
  }
  const r = await fetch(process.env.PAYMENT_VERIFIER_URL, {
    method:"POST", headers:{"content-type":"application/json","authorization":`Bearer ${process.env.PAYMENT_VERIFIER_API_KEY}`},
    body:JSON.stringify({txid,network,expectedAddress,expectedAmount})
  });
  if (!r.ok) return {verified:false, reason:"Payment verification provider error."};
  const data=await r.json();
  return {
    verified: data.verified === true,
    senderAddress: data.senderAddress || null,
    confirmations: Number.isInteger(data.confirmations) ? data.confirmations : 0,
    reason: data.verified ? null : (data.reason || "Payment not verified.")
  };
}
module.exports={verifyPayment};
