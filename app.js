const API = window.ZEXO_API_URL || "/api";
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
let currentPage = "home", homeFilter = "all", catalogCategory = "all", authMode = "signin", sessionUser = null;
const demoTextures = [
 {id:"texture-01",title:"Verdant Realism",description:"A crisp natural look with richer greens and clean block details.",category:"visual",version:"1.21",downloads:1240,tag:"POPULAR"},
 {id:"texture-02",title:"Pixel Classic+",description:"A nostalgic pixel refresh for familiar Minecraft worlds.",category:"visual",version:"1.21",downloads:980,tag:"FEATURED"},
 {id:"texture-03",title:"Nightfall UI",description:"A dark interface-inspired pack for a clean visual setup.",category:"visual",version:"26.x",downloads:760,tag:"NEW"},
 {id:"texture-04",title:"Soft Survival",description:"Gentle colors and subtle details for everyday survival.",category:"visual",version:"1.20",downloads:530,tag:"COMMUNITY"},
 {id:"texture-05",title:"Ore Vision",description:"Make important resources easier to spot underground.",category:"utility",version:"1.21",downloads:490,tag:"UTILITY"},
 {id:"texture-06",title:"Clean PvP",description:"Minimal textures for focused Bedrock PvP sessions.",category:"visual",version:"26.x",downloads:410,tag:"PVP"}
];
let textures = [...demoTextures], addons = [];
const demoSkins = [
 {id:"skin-1",title:"ZEXO Explorer",meta:"Classic Bedrock skin",tag:"POPULAR"},
 {id:"skin-2",title:"Forest Scout",meta:"Green survival style",tag:"NEW"},
 {id:"skin-3",title:"Night PvP",meta:"Dark competitive style",tag:"POPULAR"},
 {id:"skin-4",title:"Pixel Builder",meta:"Bright creator style",tag:"NEW"},
 {id:"skin-5",title:"Cave Miner",meta:"Mining adventure style",tag:"CLASSIC"},
 {id:"skin-6",title:"Ender Knight",meta:"End-inspired armor style",tag:"FEATURED"}
];
let selectedSkin=demoSkins[0], skinFilter="all";
function renderSkins(){
 let list=[...demoSkins], q=($("#skin-search")?.value||"").toLowerCase();
 if(skinFilter==="popular") list=list.filter(x=>x.tag==="POPULAR");
 if(skinFilter==="new") list=list.filter(x=>x.tag==="NEW");
 list=list.filter(x=>(x.title+" "+x.meta).toLowerCase().includes(q));
 $("#skin-grid").innerHTML=list.map(s=>'<button class="skin-card" data-skin-id="'+s.id+'"><div class="skin-card-art"><div class="mini-skin"></div></div><div class="skin-card-body"><b>'+escapeHtml(s.title)+'</b><small>'+escapeHtml(s.meta)+'</small></div></button>').join("");
 $("#skin-grid [data-skin-id]").forEach(b=>b.addEventListener("click",()=>selectSkin(b.dataset.skinId)));
}
function selectSkin(id){
 selectedSkin=demoSkins.find(s=>s.id===id)||demoSkins[0];
 $("#selected-skin").textContent=selectedSkin.title;
 $("#selected-skin-meta").textContent=selectedSkin.meta;
 $("#skin-preview-art").dataset.skin=selectedSkin.id;
}
if($("#skin-search")){
 $("#skin-search").addEventListener("input",renderSkins);
 $("#skin-filters").addEventListener("click",e=>{const b=e.target.closest("[data-skin-filter]");if(!b)return;skinFilter=b.dataset.skinFilter;$("#skin-filters .tab").forEach(x=>x.classList.toggle("active",x===b));renderSkins();});
 $("#select-skin").addEventListener("click",()=>notify(selectedSkin.title+" selected."));
 renderSkins();
}

const notify = (msg) => { const el=$("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(notify.timer);notify.timer=setTimeout(()=>el.classList.remove("show"),2600); };
function navigate(page){currentPage=page;$$(".page").forEach(p=>p.classList.toggle("active",p.id===`page-${page}`));$$("[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===page));$("#crumb-page").textContent=page.toUpperCase();window.scrollTo({top:0,behavior:"smooth"});}
$$("[data-page]").forEach(el=>el.addEventListener("click",e=>{e.preventDefault();navigate(el.dataset.page)}));
function card(item,type){const mark=(item.title||"Z").trim().charAt(0).toUpperCase();return `<article class="content-card"><div class="card-art"><span class="card-type">${(item.tag||type).toUpperCase()}</span><span class="art-letter">${escapeHtml(mark)}</span></div><div class="card-body"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description||"Community creation for Minecraft Bedrock.")}</p><div class="card-foot"><span>${escapeHtml(item.version||"BEDROCK")} · ${Number(item.downloads||0).toLocaleString()} DOWNLOADS</span><button class="card-open" data-detail="${escapeHtml(item.id)}" data-kind="${type}">DETAILS ↗</button></div></div></article>`;}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderTextures(){let list=[...textures];if(homeFilter==="popular")list.sort((a,b)=>(b.downloads||0)-(a.downloads||0));if(homeFilter==="new")list.reverse();const q=$("#home-search").value.toLowerCase();list=list.filter(x=>(x.title+" "+x.description).toLowerCase().includes(q));$("#home-grid").innerHTML=list.length?list.map(x=>card(x,"texture")).join(""):'<div class="empty-state">NO TEXTURE PACKS MATCH YOUR SEARCH.</div>';}
function renderAddons(){let list=[...addons];if(catalogCategory!=="all")list=list.filter(x=>(x.category||"").toLowerCase()===catalogCategory);const version=$("#version-filter").value;if(version)list=list.filter(x=>x.version===version);const q=$("#catalog-search").value.toLowerCase();list=list.filter(x=>(x.title+" "+x.description).toLowerCase().includes(q));const sort=$("#sort-filter").value;if(sort==="new")list.reverse();if(sort==="name")list.sort((a,b)=>a.title.localeCompare(b.title));if(sort==="popular")list.sort((a,b)=>(b.downloads||0)-(a.downloads||0));$("#catalog-grid").innerHTML=list.length?list.map(x=>card(x,"addon")).join(""):'<div class="empty-state">NO PUBLISHED ADD-ONS YET.<br><br>Creator submissions will appear here after admin approval.</div>';}
async function api(path,options={}){const res=await fetch(API+path,{credentials:"include",...options,headers:{"Content-Type":"application/json",...(options.headers||{})}});let data={};try{data=await res.json()}catch{}if(!res.ok)throw new Error(data.error||"Request failed");return data;}
async function loadCatalog(){try{const d=await api("/content?type=texture");if(Array.isArray(d.items)&&d.items.length)textures=d.items; }catch{}try{const d=await api("/content?type=addon");addons=d.items||[];}catch{addons=[];}renderTextures();renderAddons();}
$("#home-search").addEventListener("input",renderTextures);$("#catalog-search").addEventListener("input",renderAddons);$("#version-filter").addEventListener("change",renderAddons);$("#sort-filter").addEventListener("change",renderAddons);
$("#home-filters").addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;homeFilter=b.dataset.filter;$$(".tab").forEach(x=>x.classList.toggle("active",x===b));renderTextures();});
$("#catalog-categories").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;catalogCategory=b.dataset.category;$$(".pill").forEach(x=>x.classList.toggle("active",x===b));renderAddons();});
document.addEventListener("click",e=>{const b=e.target.closest("[data-detail]");if(!b)return;const item=[...textures,...addons].find(x=>String(x.id)===b.dataset.detail);if(item)notify(item.title+" — "+(item.description||"Details will be available soon."));});
$("#auth-switch").addEventListener("click",()=>{authMode=authMode==="signin"?"signup":"signin";$("#auth-title").textContent=authMode==="signin"?"Welcome back.":"Create your ZEXO ID.";$("#auth-subtitle").textContent=authMode==="signin"?"Sign in to continue to your account.":"Join the community and save your creations.";$("#name-field").classList.toggle("hidden",authMode==="signin");$("#auth-submit").innerHTML=authMode==="signin"?'SIGN IN <span>↗</span>':'CREATE ACCOUNT <span>↗</span>';$("#auth-switch-text").textContent=authMode==="signin"?"New to ZEXO?":"Already have an account?";$("#auth-switch").textContent=authMode==="signin"?"CREATE ACCOUNT":"SIGN IN";});
$("#auth-form").addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const payload={email:f.get("email"),password:f.get("password"),name:f.get("name")};try{const d=await api("/auth/"+authMode,{method:"POST",body:JSON.stringify(payload)});sessionUser=d.user;showAccount();notify("You're signed in.");}catch(err){notify(err.message==="Failed to fetch"?"Account service is not configured yet.":err.message);}});
function showAccount(){if(!sessionUser)return;$("#account-dashboard").classList.remove("hidden");$("#auth-form").parentElement.classList.add("hidden");$(".auth-switch").classList.add("hidden");$("#account-name").textContent=sessionUser.name||sessionUser.email;$("#account-library").innerHTML='<p class="fine-print">Your saved downloads and purchases will appear here.</p>';}
$("#signout").addEventListener("click",async()=>{try{await api("/auth/signout",{method:"POST",body:"{}"});}catch{}sessionUser=null;$("#account-dashboard").classList.add("hidden");$("#auth-form").parentElement.classList.remove("hidden");$(".auth-switch").classList.remove("hidden");notify("Signed out.");});
$$("[data-action]").forEach(b=>b.addEventListener("click",()=>{const a=b.dataset.action;if(a==="upload"){$("#upload-panel").classList.remove("hidden");$("#more-result").classList.add("hidden");$("#upload-panel").scrollIntoView({behavior:"smooth"});}else if(a==="admin"){notify("Admin access is enabled only for configured admin accounts.");}else if(a==="settings"||a==="help"||a==="terms"){const p=$("#more-result");p.classList.remove("hidden");p.innerHTML=a==="settings"?'<h2>Settings</h2><p class="fine-print">Theme, language and notification controls will live here. ZEXO stays English-only.</p>':a==="terms"?'<h2>Terms & privacy</h2><p class="fine-print">ZEXO policy pages will be available here before public launch.</p>':'<h2>Help & about</h2><p class="fine-print">ZEXO is a Minecraft Bedrock marketplace focused on texture packs, add-ons, skins and digital products.</p>';p.scrollIntoView({behavior:"smooth"});}});
const uploadForm=$("#upload-form");if(uploadForm)uploadForm.addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const file=f.get("file");if(!file||!(/\.(mcpack|mcaddon|zip)$/i).test(file.name)){notify("Choose a .mcpack, .mcaddon or .zip file.");return;}if(file.size>100*1024*1024){notify("File exceeds the 100 MB client limit.");return;}try{const body=new FormData();for(const [k,v] of f.entries())body.append(k,v);const res=await fetch(API+"/uploads",{method:"POST",credentials:"include",body});const d=await res.json();if(!res.ok)throw new Error(d.error||"Upload failed");notify("Submitted for admin review.");e.currentTarget.reset();}catch(err){notify(err.message==="Failed to fetch"?"Upload service is not configured yet.":err.message);}});
$("#year").textContent=new Date().getFullYear();renderTextures();renderAddons();loadCatalog();