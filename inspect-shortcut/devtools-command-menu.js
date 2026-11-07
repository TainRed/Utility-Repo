const I={
palette:'<rect x="6" y="10" width="36" height="28" rx="4"/><path d="M13 19h22M13 26h14M13 32h9"/>',
area:'<path d="M8 16V8h8M32 8h8v8M40 32v8h-8M16 40H8v-8"/><rect x="18" y="18" width="12" height="12" rx="1"/>',
full:'<rect x="14" y="4" width="20" height="40" rx="2"/><path d="M8 12v24M40 12v24M20 14h8M20 22h8"/>',
node:'<path d="M10 14L4 24l6 10M38 14l6 10-6 10"/><rect x="17" y="16" width="14" height="16" rx="2"/>',
eye:'<path d="M4 24c6-10 14-14 20-14s14 4 20 14c-6 10-14 14-20 14S10 34 4 24z"/><circle cx="24" cy="24" r="6"/>',
device:'<rect x="14" y="6" width="20" height="36" rx="3"/><path d="M22 36h4M6 16v16M42 16v16"/>',
pie:'<circle cx="24" cy="24" r="16"/><path d="M24 8v16l11 11"/>',
trash:'<path d="M10 14h28M18 14V9h12v5M14 14l2 26h16l2-26M21 21v12M27 21v12"/>',
term:'<rect x="5" y="9" width="38" height="30" rx="3"/><path d="M12 19l6 5-6 5M22 30h10"/>',
warn:'<path d="M24 6L44 40H4z"/><path d="M24 19v11M24 35v1"/>',
wifi:'<path d="M6 20c10-9 26-9 36 0M13 28c6-5 16-5 22 0M24 35v1M8 8l32 32"/>',
nojs:'<path d="M16 12L6 24l10 12M32 12l10 12-10 12M8 40L40 8"/>',
cov:'<path d="M6 12h36M6 24h24M6 36h30"/><path d="M34 22l4 4 6-8"/>',
moon:'<path d="M38 28A16 16 0 1 1 20 8a12 12 0 0 0 18 20z"/>',
find:'<circle cx="21" cy="21" r="12"/><path d="M30 30l12 12"/>',
cursor:'<path d="M8 6l14 36 6-14 14-6z"/><path d="M30 30l10 10"/>',
cache:'<ellipse cx="24" cy="12" rx="16" ry="6"/><path d="M8 12v12c0 3 7 6 16 6s16-3 16-6V12M8 24v12c0 3 7 6 16 6s16-3 16-6V24"/>',
hash:'<path d="M18 10l-4 28M32 10l-4 28M10 18h30M8 30h30"/>',
lh:'<path d="M24 4v6M12 9l4 4M36 9l-4 4"/><path d="M18 20h12l3 22H15z"/>',
pin:'<path d="M24 44s14-12 14-24a14 14 0 0 0-28 0c0 12 14 24 14 24z"/><circle cx="24" cy="20" r="5"/>',
open:'<rect x="5" y="8" width="38" height="32" rx="3"/><path d="M5 18h38M22 18v22"/>'};
const D=[
{c:'Essentials',t:'Open the Command Menu',cmd:'(open DevTools first)',w:['Ctrl','Shift','P'],m:['Cmd','Shift','P'],d:'The launcher for everything below. Opens a search box inside DevTools.',i:'palette'},
{c:'Essentials',t:'Open DevTools',cmd:'—',w:['F12'],m:['Cmd','Opt','I'],d:'Ctrl+Shift+I also works on Windows and Linux.',i:'open'},
{c:'Essentials',t:'Inspect an element',cmd:'—',w:['Ctrl','Shift','C'],m:['Cmd','Shift','C'],d:'Hover any part of the page and click it to jump to its HTML and CSS.',i:'cursor'},
{c:'Essentials',t:'Open any file',cmd:'(delete the > then type a file name)',w:['Ctrl','P'],m:['Cmd','P'],d:'Fuzzy-search every source file the page loaded and jump straight to it.',i:'hash'},
{c:'Essentials',t:'Search all sources',cmd:'Show Search',w:['Ctrl','Shift','F'],m:['Cmd','Opt','F'],d:'Find a string across every loaded file, not just the one you have open.',i:'find'},
{c:'Visual',t:'Capture area screenshot',cmd:'Capture area screenshot',d:'Drag a box around one part of the page and save it as a PNG.',i:'area'},
{c:'Visual',t:'Capture full-size screenshot',cmd:'Capture full size screenshot',d:'Saves the whole scrolling page as one tall image. No stitching.',i:'full'},
{c:'Visual',t:'Capture node screenshot',cmd:'Capture node screenshot',d:'Select an element in the Elements panel first, then run this to photograph just that element.',i:'node'},
{c:'Visual',t:'Emulate vision deficiencies',cmd:'Show Rendering',d:'In the Rendering drawer, simulate blurred vision or colour blindness. Also highlights layout shifts.',i:'eye'},
{c:'Visual',t:'Toggle device toolbar',cmd:'Toggle device toolbar',w:['Ctrl','Shift','M'],m:['Cmd','Shift','M'],d:'Turns the viewport into a phone or tablet simulator with a size picker.',i:'device'},
{c:'Visual',t:'Switch to dark theme',cmd:'Switch to dark theme',d:'Changes DevTools itself, not the page. Easier on the eyes at night.',i:'moon'},
{c:'Audit',t:'CSS overview',cmd:'Show CSS overview',d:'A report of every colour, font and size in use, with contrast issues and unused rules flagged.',i:'pie'},
{c:'Audit',t:'Show issues',cmd:'Show Issues',d:'Collects security, cookie and accessibility problems Chrome spotted on the page.',i:'warn'},
{c:'Audit',t:'Run Lighthouse',cmd:'Show Lighthouse',d:'Scores the page for performance, accessibility, SEO and best practices.',i:'lh'},
{c:'Audit',t:'Coverage',cmd:'Show Coverage',d:'Shows how much of each CSS and JS file the page actually used. Good for trimming bloat.',i:'cov'},
{c:'Debug',t:'Show console',cmd:'Show Console',d:'Opens the JavaScript log. Press Esc to toggle the console drawer under any panel.',w:['Esc'],m:['Esc'],i:'term'},
{c:'Debug',t:'Disable JavaScript',cmd:'Disable JavaScript',d:'Reload and see what the page looks like for anyone without scripts.',i:'nojs'},
{c:'Debug',t:'Override location',cmd:'Show Sensors',d:'Fake your GPS position, device tilt or timezone to test location features.',i:'pin'},
{c:'Network',t:'Clear site data',cmd:'Clear site data',d:'Wipes cookies, local storage and cache for this site only. No trip through browser settings.',i:'trash'},
{c:'Network',t:'Go offline',cmd:'Go offline',d:'Cuts the network for the tab to test offline behaviour. Run Go online to restore it.',i:'wifi'},
{c:'Network',t:'Network conditions',cmd:'Show Network conditions',d:'Opens a drawer with throttling presets, a Disable cache checkbox and a user-agent override.',i:'cache'}
];
const $=s=>document.querySelector(s);let os=/Mac/i.test(navigator.platform)?'mac':'win',cat='All',q='';
const cats=['All',...new Set(D.map(x=>x.c))];
function keys(a){return a?a.map(k=>'<kbd>'+k+'</kbd>').join('<i>+</i>'):''}
function icon(n){return '<svg viewBox="0 0 48 48" aria-hidden="true">'+I[n].replace(/<(path|rect|circle|ellipse)/g,'<$1 pathLength="1"')+'</svg>'}
function render(){
  $('#openKeys').innerHTML=keys(os=='mac'?['Cmd','Shift','P']:['Ctrl','Shift','P']);
  const list=D.filter(x=>(cat=='All'||x.c==cat)&&(x.t+' '+x.d+' '+x.cmd).toLowerCase().includes(q));
  $('#grid').innerHTML=list.length?list.map((x,n)=>{
    const k=os=='mac'?x.m:x.w, runnable=x.cmd.indexOf('(')<0&&x.cmd!='—';
    return `<article class="card"><div class="top"><div class="ico">${icon(x.i)}</div><div><h2>${x.t}</h2><span class="cat">${x.c}</span></div></div>
    <p class="desc">${x.d}</p><div class="keys">${keys(k)}</div>
    ${runnable?`<div class="run"><code>&gt; ${x.cmd}</code><button data-copy="${x.cmd}">Copy</button></div>`:''}</article>`}).join('')
    :'<p class="empty">Nothing matches. Try a shorter keyword like “screen” or “cache”.</p>';
}
$('#chips').innerHTML=cats.map(c=>`<button class="chip" aria-pressed="${c=='All'}" data-cat="${c}">${c}</button>`).join('');
$('#chips').onclick=e=>{const b=e.target.closest('[data-cat]');if(!b)return;cat=b.dataset.cat;document.querySelectorAll('.chip').forEach(c=>c.setAttribute('aria-pressed',c==b));render()};
$('#q').oninput=e=>{q=e.target.value.toLowerCase().trim();render()};
document.querySelectorAll('[data-os]').forEach(b=>b.onclick=()=>{os=b.dataset.os;document.querySelectorAll('[data-os]').forEach(x=>x.setAttribute('aria-pressed',x==b));render()});
document.querySelectorAll('[data-os]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.os==os));
function toast(m){const t=$('#toast');t.textContent=m;t.style.opacity=1;clearTimeout(toast.t);toast.t=setTimeout(()=>t.style.opacity=0,1400)}
$('#grid').onclick=e=>{const b=e.target.closest('[data-copy]');if(!b)return;
  const v=b.dataset.copy;(navigator.clipboard?navigator.clipboard.writeText(v):Promise.reject()).then(()=>toast('Copied: '+v),()=>toast('Select the text and copy it manually'))};
render();
// hero typing loop
const ph=['Capture area screenshot','Show CSS overview','Toggle device toolbar','Clear site data','Go offline'];let pi=0,ci=0,del=false;
const ty=$('#typed'),cr=$('#caret');
function tick(){const w=ph[pi];ci+=del?-1:1;ty.textContent=w.slice(0,ci);
  try{cr.setAttribute('transform','translate('+ty.getComputedTextLength()+' 0)')}catch(e){}
  let d=del?25:70;if(!del&&ci==w.length){del=true;d=1400}else if(del&&ci==0){del=false;pi=(pi+1)%ph.length;d=400}setTimeout(tick,d)}
if(!matchMedia('(prefers-reduced-motion:reduce)').matches)tick();else ty.textContent=ph[0];
