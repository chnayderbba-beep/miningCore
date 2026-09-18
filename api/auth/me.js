const {json}=require("../../lib/http"); const {requireUser}=require("../../lib/auth");
module.exports=async(req,res)=>{const u=await requireUser(req);return u?json(res,200,{user:u}):json(res,401,{error:"Unauthorized"});};
