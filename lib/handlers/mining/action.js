// Reserved compatibility route. Use the dedicated /select-coin, /start and /stop endpoints.
const {json}=require("../../http");
module.exports=async(req,res)=>json(res,410,{error:"Use the dedicated mining action endpoints."});
