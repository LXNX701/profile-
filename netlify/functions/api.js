import express from "express";
import serverless from "serverless-http";
import { allRegions, buildProfile, call, logSearch, normalizeRegion, regionInfo, REGIONS, validId, validUid } from "../../lib/profile-core.js";

const app = express();
app.disable("x-powered-by");
app.use(express.json({limit:"64kb"}));
const asyncRoute = fn => (req,res) => Promise.resolve(fn(req,res)).catch(e => res.status(502).json({success:false,error:e.message || "API error"}));

app.get("/health",(req,res)=>res.json({ok:true,service:"MOONX7 Profile API",version:"2.0",regions:Object.keys(REGIONS).length,supabase:Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY))}));
app.get("/regions",(req,res)=>res.json({success:true,regions:allRegions()}));
app.get("/profile",asyncRoute(async(req,res)=>{
  const uid=String(req.query.uid||"").trim(), region=normalizeRegion(req.query.region);
  if(!validUid(uid)||!regionInfo(region)) return res.status(400).json({success:false,error:"UID and supported region are required"});
  const data=await buildProfile(uid,region);
  await logSearch(uid,region,req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "");
  res.set("Cache-Control","public, max-age=60, s-maxage=300, stale-while-revalidate=600");
  res.json(data);
}));
for (const [route,path,params] of [
  ["/account","account","uid"],["/playerstats","playerstats","uid"],["/wishlistitems","wishlistitems","uid"],["/craftlandProfile","craftlandProfile","uid"]
]) app.get(route,asyncRoute(async(req,res)=>{
  const uid=String(req.query[params]||"").trim(), region=normalizeRegion(req.query.region);
  if(!validUid(uid)||!regionInfo(region)) return res.status(400).json({success:false,error:"UID and supported region are required"});
  res.json(await call(path,{uid,region}));
}));
app.get("/craftlandInfo",asyncRoute(async(req,res)=>{
  const map_code=String(req.query.map_code||"").trim(), region=normalizeRegion(req.query.region);
  if(!validId(map_code)||!regionInfo(region)) return res.status(400).json({success:false,error:"map_code and supported region are required"});
  res.json(await call("craftlandInfo",{map_code,region}));
}));
app.get("/guild",asyncRoute(async(req,res)=>{
  const guildID=String(req.query.guildID||"").trim(), region=normalizeRegion(req.query.region);
  if(!validId(guildID)||!regionInfo(region)) return res.status(400).json({success:false,error:"guildID and supported region are required"});
  res.json(await call("guildInfo",{guildID,region}));
}));
app.get("/",(req,res)=>res.json({service:"MOONX7 Profile API",version:"2.0",endpoints:["/api/profile","/api/account","/api/playerstats","/api/wishlistitems","/api/craftlandProfile","/api/craftlandInfo","/api/guild","/api/regions"]}));
export const handler=serverless(app);
