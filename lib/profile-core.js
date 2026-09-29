import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const UPSTREAM = process.env.FF_UPSTREAM || "https://free-ff-api-src-5plp.onrender.com";
export const TTL = Math.max(30000, Number(process.env.CACHE_TTL_MS || 300000));
export const REQUEST_TIMEOUT = Math.max(3000, Number(process.env.FF_TIMEOUT_MS || 15000));

export const REGIONS = {
  IND:["India","South Asia","🇮🇳"], BR:["Brazil","South America","🇧🇷"], SG:["Singapore","Southeast Asia","🇸🇬"],
  RU:["Russia","CIS","🇷🇺"], ID:["Indonesia","Southeast Asia","🇮🇩"], TW:["Taiwan","East Asia","🇹🇼"],
  US:["United States","North America","🇺🇸"], VN:["Vietnam","Southeast Asia","🇻🇳"], TH:["Thailand","Southeast Asia","🇹🇭"],
  ME:["Middle East","Middle East","🌍"], PK:["Pakistan","South Asia","🇵🇰"], CIS:["CIS","CIS","🌍"],
  BD:["Bangladesh","South Asia","🇧🇩"], NA:["North America","North America","🌎"], LATAM:["Latin America","Latin America","🌎"],
  SAC:["South America","South America","🌎"], EU:["Europe","Europe","🇪🇺"], EUROPE:["Europe","Europe","🇪🇺"], MY:["Malaysia","Southeast Asia","🇲🇾"]
};

const memory = new Map();
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey, { auth:{autoRefreshToken:false,persistSession:false} }) : null;

export const normalizeRegion = x => String(x || "").trim().toUpperCase();
export const validUid = x => /^\d{5,15}$/.test(String(x || "").trim());
export const validId = x => /^[A-Za-z0-9_-]{2,64}$/.test(String(x || "").trim());

function memoryKey(path, params){ return path + "|" + JSON.stringify(params); }

async function readSupabaseCache(uid, region){
  if(!supabase) return null;
  const { data, error } = await supabase.from("profile_cache").select("payload,expires_at").eq("uid",uid).eq("region",region).maybeSingle();
  if(error || !data) return null;
  return { payload:data.payload, expiresAt:new Date(data.expires_at).getTime() };
}

async function writeSupabaseCache(uid, region, payload){
  if(!supabase) return;
  const expiresAt = new Date(Date.now()+TTL).toISOString();
  await supabase.from("profile_cache").upsert({uid,region,payload,fetched_at:new Date().toISOString(),expires_at:expiresAt},{onConflict:"uid,region"});
}

export async function logSearch(uid, region, ip=""){
  if(!supabase) return;
  const salt = process.env.SEARCH_HASH_SALT || "moonx7-profile";
  const ipHash = ip ? crypto.createHash("sha256").update(salt+"|"+ip).digest("hex") : null;
  await supabase.from("profile_searches").insert({uid,region,ip_hash:ipHash});
}

async function provider(path, params){
  const key = memoryKey(path,params);
  const hit = memory.get(key);
  if(hit && Date.now()-hit.time < TTL) return {...hit.data,_meta:{cached:true,source:"memory"}};

  const url = new URL(UPSTREAM.replace(/\/$/,"") + "/api/v1/" + path);
  for(const [k,v] of Object.entries(params)) url.searchParams.set(k,String(v));
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(),REQUEST_TIMEOUT);
  try{
    const response = await fetch(url,{signal:controller.signal,headers:{"user-agent":"MOONX7-Profile/2.0","accept":"application/json"}});
    const text = await response.text();
    let data; try { data = JSON.parse(text); } catch { throw new Error("Provider returned invalid JSON"); }
    if(!response.ok) throw new Error(data?.message || data?.error || "Provider error");
    memory.set(key,{time:Date.now(),data});
    return {...data,_meta:{cached:false,source:"provider"}};
  } finally { clearTimeout(timer); }
}

export async function call(path, params){
  const region = normalizeRegion(params.region);
  const uid = String(params.uid || "");
  if(uid && region){
    const cached = await readSupabaseCache(uid,region);
    if(cached && cached.expiresAt > Date.now()){
      return {...cached.payload,_meta:{cached:true,source:"supabase"}};
    }
  }
  try{
    const data = await provider(path,params);
    if(uid && region) await writeSupabaseCache(uid,region,data);
    return data;
  }catch(error){
    if(uid && region){
      const stale = await readSupabaseCache(uid,region);
      if(stale?.payload) return {...stale.payload,_meta:{cached:true,stale:true,source:"supabase"}};
    }
    throw error;
  }
}

export function regionInfo(region){
  const r = normalizeRegion(region), v = REGIONS[r];
  return v ? {code:r,name:v[0],group:v[1],flag:v[2]} : null;
}

export function allRegions(){
  return Object.entries(REGIONS).map(([code,v])=>({code,name:v[0],group:v[1],flag:v[2]}));
}

export async function buildProfile(uid, region){
  const r = normalizeRegion(region);
  const [account, stats, wishlist, craftland] = await Promise.allSettled([
    call("account",{uid,region:r}),
    call("playerstats",{uid,region:r}),
    call("wishlistitems",{uid,region:r}),
    call("craftlandProfile",{uid,region:r})
  ]);
  const ok = [account,stats,wishlist,craftland].some(x=>x.status==="fulfilled");
  if(!ok) throw new Error("Player not found or provider unavailable");
  const accountData = account.status==="fulfilled" ? account.value : null;
  const basic = accountData?.basicInfo || accountData?.result?.basicInfo || {};
  let guild = null;
  const guildId = basic.guildId || basic.clanId || basic.guildID || accountData?.guildInfo?.clanId;
  if(guildId && validId(guildId)){
    try { guild = await call("guildInfo",{guildID:guildId,region:r}); } catch {}
  }
  return {
    success:true,uid,region:r,regionInfo:regionInfo(r),
    account:accountData,
    stats:stats.status==="fulfilled"?stats.value:null,
    wishlist:wishlist.status==="fulfilled"?wishlist.value:null,
    craftland:craftland.status==="fulfilled"?craftland.value:null,
    guild,
    fetchedAt:new Date().toISOString()
  };
}
