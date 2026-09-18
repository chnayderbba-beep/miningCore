const { parse, serialize } = require("cookie");
const crypto = require("crypto");
function json(res, status, data) {
  res.status(status).setHeader("Content-Type","application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}
function getCookies(req) { return parse(req.headers.cookie || ""); }
function setSessionCookie(res, token, maxAge) {
  res.setHeader("Set-Cookie", serialize("mc_session", token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/", maxAge
  }));
}
function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", serialize("mc_session","",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:0}));
}
function readBody(req) {
  return new Promise((resolve,reject)=>{
    let data="";
    req.on("data", c => { data += c; if (data.length > 1_000_000) reject(new Error("Payload too large")); });
    req.on("end",()=>{ try { resolve(data ? JSON.parse(data) : {}); } catch { reject(new Error("Invalid JSON")); }});
    req.on("error",reject);
  });
}
module.exports = { json, getCookies, setSessionCookie, clearSessionCookie, readBody };
