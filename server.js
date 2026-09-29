import express from "express";

const app=express();
const PORT=process.env.PORT||3000;
const UPSTREAM=process.env.FF_UPSTREAM||"https://free-ff-api-src-5plp.onrender.com";
const CACHE_TTL=Number(process.env.CACHE_TTL_MS||300000);
const cache=new Map();

const REGIONS={
  BR:{name:"Brazil",group:"South America",flag:"🇧🇷"},
  SAC:{name:"South America",group:"South America",flag:"🌎"},
  US:{name:"United States",group:"North America",flag:"🇺🇸"},
  NA:{name:"North America",group:"North America",flag:"🌎"},
  LATAM:{name:"Latin America",group:"South America",flag:"🌎"},
  IND:{name:"India",group:"South Asia",flag:"🇮🇳"},
  BD:{name:"Bangladesh",group:"South Asia",flag:"🇧🇩"},
  PK:{name:"Pakistan",group:"South Asia",flag:"🇵🇰"},
  ID:{name:"Indonesia",group:"Southeast Asia",flag:"🇮🇩"},
  SG:{name:"Singapore",group:"Southeast Asia",flag:"🇸🇬"},
  TH:{name:"Thailand",group:"Southeast Asia",flag:"🇹🇭"},
  VN:{name:"Vietnam",group:"Southeast Asia",flag:"🇻🇳"},
  TW:{name:"Taiwan",group:"East Asia",flag:"🇹🇼"},
  ME:{name:"Middle East",group:"Middle East",flag:"🌍"},
  RU:{name:"Russia",group:"CIS",flag:"🇷🇺"},
  CIS:{name:"CIS",group:"CIS",flag:"🌍"},
  EUROPE:{name:"Europe",group:"Europe",flag:"🇪🇺"},
  EU:{name:"Europe",group:"Europe",flag:"🇪🇺"},
  MY:{name:"Malaysia",group:"Southeast Asia",flag:"🇲🇾"}
};

function validUid(uid){return /^\\d{5,15}$/.test(String(uid||""))}
function regionCode(region){const r=String(region||"").toUpperCase(); return REGIONS[r]?r:null}
function keyFor(path,uid,region){return path+"|"+uid+"|"+region}
function cached(key){const x=cache.get(key); if(!x)return null; if(Date.now()-x.time>CACHE_TTL){cache.delete(key);return null} return x.data}
async function upstream(path,uid,region){
  const key=keyFor(path,uid,region); const hit=cached(key); if(hit)return {...hit,_meta:{cached:true}};
  const url=new URL(UPSTREAM+"/api/v1/"+path);
  url.searchParams.set("uid",uid); url.searchParams.set("region",region);
  const response=await fetch(url,{headers:{"user-agent":"MOONX7-Profile/1.0"}});
  const text=await response.text();
  let data; try{data=JSON.parse(text)}catch{throw new Error("Upstream returned non-JSON")}
  if(!response.ok) throw new Error(data.message||("Upstream HTTP "+response.status));
  cache.set(key,{time:Date.now(),data});
  return {...data,_meta:{cached:false}};
}

app.use(express.json());
app.use(express.static("public"));

app.get("/api/health",(req,res)=>res.json({ok:true,name:"MOONX7 Profile API",version:"1.0.0",regions:Object.keys(REGIONS).length,cacheEntries:cache.size}));
app.get("/api/regions",(req,res)=>res.json({regions:Object.entries(REGIONS).map(([code,v])=>({code,...v}))}));

app.get("/api/profile",async(req,res)=>{
  const uid=String(req.query.uid||"").trim();
  const region=regionCode(req.query.region);
  if(!validUid(uid)) return res.status(400).json({success:false,error:"Invalid UID"});
  if(!region) return res.status(400).json({success:false,error:"Unsupported region",supportedRegions:Object.keys(REGIONS)});
  try{
    const [account,stats]=await Promise.allSettled([upstream("account",uid,region),upstream("playerstats",uid,region)]);
    const accountData=account.status==="fulfilled"?account.value:null;
    const statsData=stats.status==="fulfilled"?stats.value:null;
    if(!accountData && !statsData) return res.status(404).json({success:false,error:"Player not found"});
    res.json({success:true,uid,region,regionInfo:REGIONS[region],account:accountData,stats:statsData});
  }catch(e){res.status(502).json({success:false,error:e.message})}
});

app.get("/api/account",async(req,res)=>{try{const uid=String(req.query.uid||"");const region=regionCode(req.query.region);if(!validUid(uid)||!region)return res.status(400).json({success:false,error:"uid and valid region are required"});res.json(await upstream("account",uid,region))}catch(e){res.status(502).json({success:false,error:e.message})}});
app.get("/api/playerstats",async(req,res)=>{try{const uid=String(req.query.uid||"");const region=regionCode(req.query.region);if(!validUid(uid)||!region)return res.status(400).json({success:false,error:"uid and valid region are required"});res.json(await upstream("playerstats",uid,region))}catch(e){res.status(502).json({success:false,error:e.message})}});
app.get("/api/guild",async(req,res)=>{try{const guildID=String(req.query.guildID||"");const region=regionCode(req.query.region);if(!guildID||!region)return res.status(400).json({success:false,error:"guildID and valid region are required"});const key="guild|"+guildID+"|"+region;const hit=cached(key);if(hit)return res.json(hit);const u=new URL(UPSTREAM+"/api/v1/guildInfo");u.searchParams.set("guildID",guildID);u.searchParams.set("region",region);const rr=await fetch(u);const d=await rr.json();if(!rr.ok)throw new Error(d.message||"Guild lookup failed");cache.set(key,{time:Date.now(),data:d});res.json(d)}catch(e){res.status(502).json({success:false,error:e.message})}});

app.get("*",(req,res)=>res.sendFile(process.cwd()+"/public/index.html"));
app.listen(PORT,()=>console.log("MOONX7 Profile listening on "+PORT));
