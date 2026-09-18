// MineCore: single catch-all Vercel Serverless Function.
const h0=require("../lib/handlers/balance.js");
const h1=require("../lib/handlers/orders.js");
const h2=require("../lib/handlers/transactions.js");
const h3=require("../lib/handlers/plans.js");
const h4=require("../lib/handlers/withdrawals/index.js");
const h5=require("../lib/handlers/withdrawals/detail.js");
const h6=require("../lib/handlers/withdrawals/[id].js");
const h7=require("../lib/handlers/auth/login.js");
const h8=require("../lib/handlers/auth/me.js");
const h9=require("../lib/handlers/auth/register.js");
const h10=require("../lib/handlers/auth/logout.js");
const h11=require("../lib/handlers/mining/select-coin.js");
const h12=require("../lib/handlers/mining/status.js");
const h13=require("../lib/handlers/mining/action.js");
const h14=require("../lib/handlers/mining/index.js");
const h15=require("../lib/handlers/mining/start.js");
const h16=require("../lib/handlers/mining/stop.js");
const h17=require("../lib/handlers/mining/[id]/select-coin.js");
const h18=require("../lib/handlers/mining/[id]/status.js");
const h19=require("../lib/handlers/mining/[id]/start.js");
const h20=require("../lib/handlers/mining/[id]/stop.js");
const h21=require("../lib/handlers/admin/mining-contracts.js");
const h22=require("../lib/handlers/admin/withdrawals.js");
const h23=require("../lib/handlers/admin/orders.js");
const h24=require("../lib/handlers/admin/users.js");
const h25=require("../lib/handlers/admin/audit-logs.js");
const h26=require("../lib/handlers/admin/plan-action.js");
const h27=require("../lib/handlers/admin/stats.js");
const h28=require("../lib/handlers/admin/orders-action.js");
const h29=require("../lib/handlers/admin/plans.js");
const h30=require("../lib/handlers/admin/withdrawal-action.js");
const h31=require("../lib/handlers/admin/plans/[id].js");
const h32=require("../lib/handlers/admin/orders/[id].js");
const h33=require("../lib/handlers/admin/withdrawals/[id].js");

module.exports = async (req, res) => {
  try {
    const raw = req.query?.route;
    const parts = Array.isArray(raw) ? raw.filter(Boolean).map(String) : (typeof raw === 'string' ? raw.split('/').filter(Boolean) : []);
    if (parts.length === 1 && parts[0] === "balance") return h0(req,res);
    if (parts.length === 1 && parts[0] === "orders") return h1(req,res);
    if (parts.length === 1 && parts[0] === "transactions") return h2(req,res);
    if (parts.length === 1 && parts[0] === "plans") return h3(req,res);
    if (parts.length === 1 && parts[0] === "withdrawals") return h4(req,res);
    if (parts.length === 2 && parts[0] === "withdrawals" && parts[1] === "detail") return h5(req,res);
    if (parts.length === 2 && parts[0] === "withdrawals") { req.query = Object.assign({}, req.query || {}, {id: parts[1]}); return h6(req,res); }
    if (parts.length === 2 && parts[0] === "auth" && parts[1] === "login") return h7(req,res);
    if (parts.length === 2 && parts[0] === "auth" && parts[1] === "me") return h8(req,res);
    if (parts.length === 2 && parts[0] === "auth" && parts[1] === "register") return h9(req,res);
    if (parts.length === 2 && parts[0] === "auth" && parts[1] === "logout") return h10(req,res);
    if (parts.length === 2 && parts[0] === "mining" && parts[1] === "select-coin") return h11(req,res);
    if (parts.length === 2 && parts[0] === "mining" && parts[1] === "status") return h12(req,res);
    if (parts.length === 2 && parts[0] === "mining" && parts[1] === "action") return h13(req,res);
    if (parts.length === 1 && parts[0] === "mining") return h14(req,res);
    if (parts.length === 2 && parts[0] === "mining" && parts[1] === "start") return h15(req,res);
    if (parts.length === 2 && parts[0] === "mining" && parts[1] === "stop") return h16(req,res);
    if (parts.length === 3 && parts[0] === "mining" && parts[2] === "select-coin") { req.query = Object.assign({}, req.query || {}, {id: parts[1]}); return h17(req,res); }
    if (parts.length === 3 && parts[0] === "mining" && parts[2] === "status") { req.query = Object.assign({}, req.query || {}, {id: parts[1]}); return h18(req,res); }
    if (parts.length === 3 && parts[0] === "mining" && parts[2] === "start") { req.query = Object.assign({}, req.query || {}, {id: parts[1]}); return h19(req,res); }
    if (parts.length === 3 && parts[0] === "mining" && parts[2] === "stop") { req.query = Object.assign({}, req.query || {}, {id: parts[1]}); return h20(req,res); }
    if (parts.length === 2 && parts[0] === "admin" && parts[1] === "mining-contracts") return h21(req,res);
    if (parts.length === 2 && parts[0] === "admin" && parts[1] === "withdrawals") return h22(req,res);
    if (parts.length === 2 && parts[0] === "admin" && parts[1] === "orders") return h23(req,res);
    if (parts.length === 2 && parts[0] === "admin" && parts[1] === "users") return h24(req,res);
    if (parts.length === 2 && parts[0] === "admin" && parts[1] === "audit-logs") return h25(req,res);
    if (parts.length === 2 && parts[0] === "admin" && parts[1] === "plan-action") return h26(req,res);
    if (parts.length === 2 && parts[0] === "admin" && parts[1] === "stats") return h27(req,res);
    if (parts.length === 2 && parts[0] === "admin" && parts[1] === "orders-action") return h28(req,res);
    if (parts.length === 2 && parts[0] === "admin" && parts[1] === "plans") return h29(req,res);
    if (parts.length === 2 && parts[0] === "admin" && parts[1] === "withdrawal-action") return h30(req,res);
    if (parts.length === 3 && parts[0] === "admin" && parts[1] === "plans") { req.query = Object.assign({}, req.query || {}, {id: parts[2]}); return h31(req,res); }
    if (parts.length === 3 && parts[0] === "admin" && parts[1] === "orders") { req.query = Object.assign({}, req.query || {}, {id: parts[2]}); return h32(req,res); }
    if (parts.length === 3 && parts[0] === "admin" && parts[1] === "withdrawals") { req.query = Object.assign({}, req.query || {}, {id: parts[2]}); return h33(req,res); }
    res.statusCode=404;
    return res.end(JSON.stringify({error:"API route not found"}));
  } catch (err) {
    console.error(err);
    res.statusCode=500;
    return res.end(JSON.stringify({error:"Internal server error"}));
  }
};
