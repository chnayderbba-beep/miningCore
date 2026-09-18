const { getPool } = require("./db");
async function balance(client, userId, currency) {
  const {rows} = await client.query(
    `SELECT COALESCE(SUM(CASE WHEN type IN ('MINING_CREDIT','ADJUSTMENT','WITHDRAWAL_REVERSED') THEN amount
                              WHEN type IN ('WITHDRAWAL_RESERVE','WITHDRAWAL_FEE','WITHDRAWAL_COMPLETED') THEN -amount
                              ELSE 0 END),0)::numeric AS available
     FROM wallet_ledger WHERE user_id=$1 AND currency=$2`, [userId,currency]);
  return rows[0].available;
}
async function totalByType(client,userId,currency,type) {
  const {rows}=await client.query("SELECT COALESCE(SUM(amount),0)::numeric AS total FROM wallet_ledger WHERE user_id=$1 AND currency=$2 AND type=$3",[userId,currency,type]);
  return rows[0].total;
}
module.exports = { balance, totalByType };
