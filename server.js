import express from "express";
import api from "./api/index.js";

const app = express();
const HTML = String.raw`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="MOONX7 Profile — Free Fire player profile, ranks, statistics, guild, wishlist and Craftland.">
<title>MOONX7 Profile</title>
<style>
:root{--bg:#05060a;--panel:rgba(14,17,25,.78);--line:rgba(255,255,255,.1);--text:#f7f8ff;--muted:#929aae;--accent:#8b6cff;--accent2:#d64cff;--ok:#62e6a7;--danger:#ff6b87}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;min-height:100vh;color:var(--text);font:15px Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:radial-gradient(circle at 10% -10%,#1c1740 0,transparent 35%),radial-gradient(circle at 100% 10%,#2b1232 0,transparent 30%),var(--bg);overflow-x:hidden}
body:before{content:"";position:fixed;inset:0;pointer-events:none;background:linear-gradient(115deg,transparent 20%,rgba(255,255,255,.025) 50%,transparent 80%);animation:sheen 9s linear infinite}@keyframes sheen{0%{transform:translateX(-50%)}100%{transform:translateX(50%)}}
.wrap{width:min(1180px,calc(100% - 28px));margin:auto;padding:22px 0 70px}.nav{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.logo{font-size:22px;font-weight:950;letter-spacing:.7px}.logo span{color:#a47cff}.pill{border:1px solid var(--line);background:#ffffff06;border-radius:999px;padding:8px 12px;color:#b9c0d0;font-size:12px}
.hero,.card{border:1px solid var(--line);background:linear-gradient(145deg,rgba(24,27,39,.82),rgba(9,11,17,.75));box-shadow:0 24px 80px #0008;backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);border-radius:26px}.hero{padding:34px;text-align:center;position:relative;overflow:hidden}.hero:after{content:"";position:absolute;width:280px;height:280px;right:-130px;top:-150px;background:#9b6cff33;filter:blur(30px);border-radius:50%}.eyebrow{color:#a894ff;text-transform:uppercase;letter-spacing:2px;font-weight:800;font-size:11px}.hero h1{font-size:clamp(35px,6vw,62px);line-height:1;margin:9px 0 12px}.hero p{color:var(--muted);margin:0 auto;max-width:650px}.search{display:grid;grid-template-columns:1fr 210px 130px;gap:10px;max-width:820px;margin:25px auto 0;position:relative;z-index:1}.search input,.search select,.search button{width:100%;border:1px solid #ffffff12;background:#090c13d9;color:white;border-radius:15px;padding:15px;outline:none}.search input:focus,.search select:focus{border-color:#8b6cff99;box-shadow:0 0 0 4px #8b6cff15}.search button{border:0;background:linear-gradient(135deg,#765cff,#c149ff);font-weight:900;cursor:pointer;transition:.2s}.search button:hover{transform:translateY(-1px);filter:brightness(1.1)}.search button:disabled{opacity:.6;cursor:wait}.error{min-height:20px;margin-top:13px;color:var(--danger)}
#result{display:none}.topgrid{display:grid;grid-template-columns:1.25fr .75fr;gap:16px;margin-top:16px}.card{padding:23px}.profile{display:flex;gap:18px;align-items:center}.avatar{width:92px;height:92px;border-radius:24px;display:grid;place-items:center;background:linear-gradient(135deg,#302b5b,#11131c);border:1px solid #ffffff14;font-size:34px;box-shadow:inset 0 1px #fff1}.nick{font-size:30px;font-weight:950;letter-spacing:-.6px;word-break:break-word}.meta{color:var(--muted);margin-top:5px}.chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}.chip{border:1px solid #ffffff12;background:#ffffff06;border-radius:999px;padding:6px 9px;color:#c4cad7;font-size:12px}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:20px}.stat{padding:14px;border:1px solid #ffffff0d;border-radius:16px;background:#07091088}.stat span{color:var(--muted);font-size:12px}.stat b{display:block;font-size:20px;margin-top:4px}.section{margin-top:16px}.title{font-weight:900;font-size:17px;margin-bottom:13px}.ranks{display:grid;grid-template-columns:1fr 1fr;gap:10px}.rank{padding:16px;border:1px solid #ffffff0d;border-radius:17px;background:#080a10}.rank small{color:var(--muted)}.rank b{display:block;font-size:24px;margin-top:4px}.detailgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}.detail{padding:13px;border:1px solid #ffffff0d;border-radius:15px;background:#080a10}.detail small{display:block;color:var(--muted);margin-bottom:5px}.detail b{word-break:break-word}.itemgrid{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}.item{min-height:74px;border:1px solid #ffffff0d;border-radius:15px;background:linear-gradient(145deg,#171a27,#090b11);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px}.item b{font-size:12px}.item span{font-size:10px;color:var(--muted)}.guild{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.json{white-space:pre-wrap;overflow:auto;max-height:430px;font:12px ui-monospace,SFMono-Regular,Menlo,monospace;color:#aeb8cb;background:#05070b;border:1px solid #ffffff0d;border-radius:16px;padding:15px}.loading{display:none;margin-top:16px;color:#b9b1ff}.footer{text-align:center;color:#687083;font-size:12px;margin-top:22px}.api-link{color:#aaa0ff;text-decoration:none}
@media(max-width:820px){.topgrid{grid-template-columns:1fr}.search{grid-template-columns:1fr}.detailgrid,.guild{grid-template-columns:repeat(2,1fr)}.itemgrid{grid-template-columns:repeat(3,1fr)}}@media(max-width:520px){.wrap{width:min(100% - 18px,1180px)}.hero{padding:25px 15px}.pill{display:none}.profile{align-items:flex-start}.avatar{width:72px;height:72px;font-size:26px}.nick{font-size:23px}.stats{grid-template-columns:1fr 1fr}.stats .stat:last-child{grid-column:1/-1}.ranks{grid-template-columns:1fr}.detailgrid,.guild{grid-template-columns:1fr 1fr}.itemgrid{grid-template-columns:repeat(2,1fr)}}
</style></head>
<body><main class="wrap">
<header class="nav"><div class="logo">MOON<span>X7</span> PROFILE</div><div class="pill">FREE FIRE • PROFILE INTELLIGENCE</div></header>
<section class="hero">
<div class="eyebrow">Public player lookup</div><h1>Find a Free Fire Profile</h1><p>Consulta UID, nivel, likes, rangos, estadísticas, gremio, wishlist y datos de Craftland en una sola página.</p>
<div class="search"><input id="uid" inputmode="numeric" maxlength="15" placeholder="UID • ejemplo 1633864660"><select id="region"></select><button id="searchBtn" onclick="loadProfile()">SEARCH</button></div>
<div id="loading" class="loading">⌛ Consultando perfil y datos adicionales…</div><div id="error" class="error"></div>
</section>
<section id="result">
<div class="topgrid">
<section class="card"><div class="profile"><div class="avatar">★</div><div><div class="nick" id="nick">—</div><div class="meta" id="meta">—</div><div class="chips"><span class="chip" id="regionChip">—</span><span class="chip" id="accountType">Account</span></div></div></div>
<div class="stats"><div class="stat"><span>LEVEL</span><b id="level">—</b></div><div class="stat"><span>LIKES</span><b id="likes">—</b></div><div class="stat"><span>EXP</span><b id="exp">—</b></div></div></section>
<section class="card"><div class="title">Competitive ranks</div><div class="ranks"><div class="rank"><small>Battle Royale</small><b id="br">—</b><span class="muted" id="brPts"></span></div><div class="rank"><small>Clash Squad</small><b id="cs">—</b><span class="muted" id="csPts"></span></div></div></section>
</div>
<section class="card section"><div class="title">Account details</div><div class="detailgrid" id="details"></div></section>
<section class="card section"><div class="title">Guild</div><div class="guild" id="guild"><div class="detail"><small>Status</small><b>Not available</b></div></div></section>
<section class="card section"><div class="title">Wishlist</div><div class="itemgrid" id="wishlist"></div></section>
<section class="card section"><div class="title">Raw player data</div><div id="json" class="json"></div></section>
</section>
<footer class="footer">MOONX7 Profile • <a class="api-link" href="/api/health">API status</a> • <span id="year"></span></footer>
</main>
<script>
const $=id=>document.getElementById(id);
const fmt=v=>v===null||v===undefined||v===""?"—":typeof v==="number"?v.toLocaleString():String(v);
const pick=(o,...keys)=>{for(const k of keys)if(o?.[k]!==undefined&&o?.[k]!==null)return o[k];return null};
function esc(v){return String(v??"—").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
function renderDetails(b,d){
 const fields=[["UID",d.uid],["Region",d.region],["Account ID",pick(b,"accountId")],["Season",pick(b,"seasonId")],["Badges",pick(b,"badgeCnt")],["Max BR",pick(b,"maxRank")],["Max CS",pick(b,"csMaxRank")],["Release",pick(b,"releaseVersion")],["Banner ID",pick(b,"bannerId")],["Head Pic",pick(b,"headPic")],["Title",pick(b,"title")],["Created",pick(b,"createAt")?new Date(Number(b.createAt)*1000).toLocaleDateString():"—"]];
 $("details").innerHTML=fields.map(([k,v])=>'<div class="detail"><small>'+esc(k)+'</small><b>'+esc(fmt(v))+'</b></div>').join("");
}
function renderGuild(g){
 if(!g){$("guild").innerHTML='<div class="detail"><small>Status</small><b>No guild data returned</b></div>';return}
 const fields=[["Guild",pick(g,"clanName")],["ID",pick(g,"clanId")],["Level",pick(g,"clanLevel")],["Members",pick(g,"memberNum")],["Capacity",pick(g,"capacity")],["Slogan",pick(g,"slogan")],["Certified",pick(g,"isCertification")?"Yes":"No"],["Region",pick(g,"region")]];
 $("guild").innerHTML=fields.map(([k,v])=>'<div class="detail"><small>'+esc(k)+'</small><b>'+esc(fmt(v))+'</b></div>').join("");
}
function renderWishlist(w){
 const items=w?.items||w?.result?.items||[];
 $("wishlist").innerHTML=items.length?items.slice(0,24).map(x=>'<div class="item"><b>'+esc(x.itemId)+'</b><span>'+esc(x.releaseTime?new Date(Number(x.releaseTime)*1000).toLocaleDateString():"item")+'</span></div>').join(""):'<div class="muted">No wishlist items returned.</div>';
}
async function init(){
 try{const r=await fetch("/api/regions");const d=await r.json();$("region").innerHTML=d.regions.map(x=>'<option value="'+x.code+'">'+x.flag+' '+x.code+' — '+x.name+'</option>').join("");const q=new URLSearchParams(location.search);if(q.get("region"))$("region").value=q.get("region").toUpperCase();if(q.get("uid")){$("uid").value=q.get("uid");loadProfile()}}catch(e){$("error").textContent="No se pudieron cargar las regiones."}
 $("year").textContent=new Date().getFullYear();
}
async function loadProfile(){
 const u=$("uid").value.trim(),rg=$("region").value;$("error").textContent="";$("result").style.display="none";
 if(!/^\d{5,15}$/.test(u)){ $("error").textContent="Introduce un UID válido de 5 a 15 dígitos.";return}
 $("searchBtn").disabled=true;$("loading").style.display="block";
 try{
  const r=await fetch("/api/profile?uid="+encodeURIComponent(u)+"&region="+encodeURIComponent(rg));const d=await r.json();if(!r.ok)throw Error(d.error||"No se pudo consultar el perfil");
  const b=d.account?.basicInfo||d.account?.result?.basicInfo||{};
  $("nick").textContent=pick(b,"nickname")||"Unknown Player";$("meta").textContent="UID "+u+" · "+rg;$("regionChip").textContent=(d.regionInfo?.flag||"🌎")+" "+(d.regionInfo?.name||rg);
  $("accountType").textContent="Account "+fmt(pick(b,"accountType"));$("level").textContent=fmt(pick(b,"level"));$("likes").textContent=fmt(pick(b,"liked"));$("exp").textContent=fmt(pick(b,"exp"));
  $("br").textContent=fmt(pick(b,"brRank","rank"));$("brPts").textContent="Points: "+fmt(pick(b,"rankingPoints"));$("cs").textContent=fmt(pick(b,"csRank"));$("csPts").textContent="Points: "+fmt(pick(b,"csRankingPoints"));
  renderDetails(b,d);renderGuild(d.guild);renderWishlist(d.wishlist);$("json").textContent=JSON.stringify(d,null,2);$("result").style.display="block";
  history.replaceState(null,"","?uid="+encodeURIComponent(u)+"&region="+encodeURIComponent(rg));
 }catch(e){$("error").textContent=e.message||"Error consultando el perfil."}finally{$("searchBtn").disabled=false;$("loading").style.display="none"}
}
$("uid").addEventListener("keydown",e=>{if(e.key==="Enter")loadProfile()});init();
</script></body></html>`;

app.disable("x-powered-by");
app.use("/api", api);

app.get("/", (req, res) => {
  res.type("html").send(HTML);
});

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ success: false, error: "API route not found" });
  }
  return res.type("html").send(HTML);
});

if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log("MOONX7 Profile listening on " + PORT));
}

export default app;
