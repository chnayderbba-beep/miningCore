const crypto = require("crypto");
const { SignJWT, jwtVerify } = require("jose");
const { getPool } = require("./db");
const { getCookies } = require("./http");
const secret = () => new TextEncoder().encode(process.env.JWT_SECRET || "");

async function createSession(userId) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");
  const sid = crypto.randomUUID();
  const token = await new SignJWT({ sid, sub: userId }).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("7d").sign(secret());
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  await getPool().query("INSERT INTO sessions(id,user_id,token_hash,expires_at) VALUES($1,$2,$3,now()+interval '7 days')",[sid,userId,hash]);
  return token;
}
async function requireUser(req) {
  const token = getCookies(req).mc_session;
  if (!token) return null;
  try {
    const {payload} = await jwtVerify(token, secret());
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    const {rows} = await getPool().query("SELECT u.id,u.full_name,u.username,u.email,u.role,u.status FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now()",[hash]);
    return rows[0] || null;
  } catch { return null; }
}
function assertSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  const allowed = (process.env.APP_ORIGINS || "").split(",").map(s=>s.trim()).filter(Boolean);
  return allowed.includes(origin);
}
module.exports = { createSession, requireUser, assertSameOrigin };
