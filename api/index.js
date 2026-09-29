import express from "express";
const app=express();
const UPSTREAM=process.env.FF_UPSTREAM||"https://free-ff-api-src-5plp.onrender.com";
const TTL=Number(process.env.CACHE_TTL_MS||300000);
const cache=new Map();
const regions={
 BR:["Brazil","South America","🇧🇷"],SAC:["South America","South America","🌎"],US:["United States","North America","🇺🇸"],NA:["North America","North America","🌎"],LATAM:["Latin America","Latin America","🌎"],
 IND:["India","South Asia","🇮🇳"],BD:["Bangladesh","South Asia","🇧🇩"],PK:["Pakistan","South Asia","🇵🇰"],ID:["Indonesia","Southeast Asia","🇮🇩"],SG:["Singapore","Southeast Asia","🇸🇬"],TH:["Thailand","Southeast Asia","🇹🇭"],VN:["Vietnam","Southeast Asia","🇻🇳"],TW:["Taiwan","East Asia","🇹🇼"],ME:["Middle East","Middle East","🌍"],RU:["Russia","CIS","🇷🇺"],CIS:["CIS","CIS","🌍"],EU:["Europe","Europe","🇪🇺"],EUROPE:["Europe","Europe","🇪🇺"],MY:["Malaysia","Southeast Asia","🇲🇾"]
};
const okUid=x=>/^\\d{5,15}$/.test(String(x||""));
const reg=x=>String(x||"").toUpperCase();
async function call(path,params){
 const key=path+"|"+JSON.stringify(params), hit=cache.get(key);
 if(hit&&Date.now()-hit.t<TTL)return {...hit.d,_meta:{cached:true}};
 const u=new URL(UPSTREAM+"/api/v1/"+path); for(const [k,v] of Object.entries(params))u.searchParams.set(k,v);
 const r=await fetch(u,{headers:{"user-agent":"MOONX7-Profile/1.0"}});
 const d=await r.json(); if(!r.ok)throw new Error(d.message||"Provider error");
 cache.set(key,{t:Date.now(),d}); return {...d,_meta:{cached:false}};
}
app.use(express.json());
app.get("/health",(q,s)=>s.json({ok:true,service:"MOONX7 Profile API",cache:cache.size,regions:Object.keys(regions).length}));
app.get("/regions",(q,s)=>s.json({regions:Object.entries(regions).map(([code,v])=>({code,name:v[0],group:v[1],flag:v[2]}))}));
app.get("/profile",async(q,s)=>{
 const uid=String(q.query.uid||"").trim(), region=reg(q.query.region);
 if(!okUid(uid)||!regions[region])return s.status(400).json({success:false,error:"UID and supported region are required"});
 try{
  const [account,stats]=await Promise.allSettled([call("account",{uid,region}),call("playerstats",{uid,region})]);
  if(account.status==="rejected"&&stats.status==="rejected")return s.status(404).json({success:false,error:"Player not found"});
  s.json({success:true,uid,region,regionInfo:{code:region,name:regions[region][0],group:regions[region][1],flag:regions[region][2]},account:account.status==="fulfilled"?account.value:null,stats:stats.status==="fulfilled"?stats.value:null});
 }catch(e){s.status(502).json({success:false,error:e.message})}
});
app.get("/account",async(q,s)=>{try{s.json(await call("account",{uid:String(q.query.uid||""),region:reg(q.query.region)}))}catch(e){s.status(502).json({success:false,error:e.message})}});
app.get("/playerstats",async(q,s)=>{try{s.json(await call("playerstats",{uid:String(q.query.uid||""),region:reg(q.query.region)}))}catch(e){s.status(502).json({success:false,error:e.message})}});
app.get("/guild",async(q,s)=>{try{s.json(await call("guildInfo",{guildID:String(q.query.guildID||""),region:reg(q.query.region)}))}catch(e){s.status(502).json({success:false,error:e.message})}});
export default app;
