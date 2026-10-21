(function(){
  var root=document.documentElement;
  function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}

  /* ---------- Adaptive themes: Day / Night + Focus (low cognitive load) ---------- */
  var mq=window.matchMedia('(prefers-color-scheme: dark)');
  var t=store('sh-theme'); if(t==='light'||t==='dark') root.setAttribute('data-theme',t);
  var f=store('sh-focus');
  // context trigger: people who ask their OS for less motion or more contrast start in Focus
  var wantsCalm=window.matchMedia('(prefers-contrast: more)').matches;
  if(f==='1'||(f===null&&wantsCalm)) root.setAttribute('data-mode','focus');
  function eff(){var a=root.getAttribute('data-theme');return a||(mq.matches?'dark':'light')}
  function sync(){
    document.querySelectorAll('[data-set-theme]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.setTheme===eff()))});
    document.querySelectorAll('[data-focus]').forEach(function(b){b.setAttribute('aria-pressed',String(root.getAttribute('data-mode')==='focus'))});
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-set-theme]');
    if(b){root.setAttribute('data-theme',b.dataset.setTheme);store('sh-theme',b.dataset.setTheme);sync()}
    var fb=e.target.closest('[data-focus]');
    if(fb){var on=root.getAttribute('data-mode')==='focus';if(on)root.removeAttribute('data-mode');else root.setAttribute('data-mode','focus');store('sh-focus',on?'0':'1');sync()}
    var m=e.target.closest('.menu-btn');
    if(m){var n=m.closest('.nav');n.classList.toggle('open');m.setAttribute('aria-expanded',n.classList.contains('open'))}
    var c=e.target.closest('.copy');
    if(c){var txt=c.dataset.copy;var done=function(){c.textContent='Copied';setTimeout(function(){c.textContent='Copy'},1600)};
      try{navigator.clipboard.writeText(txt).then(done,function(){selectText(c)})}catch(err){selectText(c)}}
  });
  function selectText(c){var v=c.parentNode.querySelector('.val');if(!v)return;var r=document.createRange();r.selectNodeContents(v);var s=getSelection();s.removeAllRanges();s.addRange(r)}
  mq.addEventListener&&mq.addEventListener('change',sync);
  sync();

  /* ---------- Physics cursor (spring + damping) ---------- */
  var fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if(fine){
    var ring=document.createElement('div');ring.className='cur-ring';ring.setAttribute('aria-hidden','true');
    var dot=document.createElement('div');dot.className='cur-dot';dot.setAttribute('aria-hidden','true');
    document.body.appendChild(ring);document.body.appendChild(dot);
    var tx=0,ty=0,x=0,y=0,vx=0,vy=0,K=0.16,D=0.72;
    addEventListener('pointermove',function(e){tx=e.clientX;ty=e.clientY;dot.style.transform='translate('+tx+'px,'+ty+'px)';root.classList.add('cur-on');
      var h=e.target.closest('a,button,[data-cursor]');
      if(h&&!h.closest('.fig')){root.classList.add('cur-hover');ring.textContent=h.dataset.cursor||(h.matches('a.pcard,a.gcard,a.next')?'Open':'')}else root.classList.remove('cur-hover')});
    document.addEventListener('pointerleave',function(){root.classList.remove('cur-on')});
    (function loop(){vx=(vx+(tx-x)*K)*D;vy=(vy+(ty-y)*K)*D;x+=vx;y+=vy;
      var hov=root.classList.contains('cur-hover');var sp=hov?0:Math.min(Math.hypot(vx,vy)/40,.35),ang=hov?0:Math.atan2(vy,vx)*180/Math.PI;
      ring.style.transform='translate('+x+'px,'+y+'px) rotate('+ang+'deg) scale('+(1+sp)+','+(1-sp*.6)+')';
      requestAnimationFrame(loop)})();
    /* magnetic buttons */
    document.querySelectorAll('.btn,.next .circle').forEach(function(el){
      el.addEventListener('pointermove',function(e){if(root.getAttribute('data-mode')==='focus')return;var r=el.getBoundingClientRect();el.style.transform='translate('+((e.clientX-r.left-r.width/2)*.18)+'px,'+((e.clientY-r.top-r.height/2)*.28)+'px)'});
      el.addEventListener('pointerleave',function(){el.style.transform=''});
    });
  }

  /* ---------- Sticky TOC highlight ---------- */
  var toc=document.querySelector('.toc');
  if(toc&&'IntersectionObserver' in window){
    var links=[].slice.call(toc.querySelectorAll('a'));
    var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){links.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+en.target.id)})}})},{rootMargin:'-40% 0px -55% 0px'});
    links.forEach(function(a){var s=document.querySelector(a.getAttribute('href'));if(s)io.observe(s)});
  }

  /* ---------- Figma canvas ---------- */
  document.querySelectorAll('[data-fig]').forEach(function(fig){
    var canvas=fig.querySelector('.fig-canvas'),board=fig.querySelector('.fig-board'),props=fig.querySelector('.fig-props-body'),out=fig.querySelector('.fig-zoom output');
    var sel=document.createElement('div');sel.className='fig-sel';sel.innerHTML='<i></i><i></i><i></i><i></i><b></b>';canvas.appendChild(sel);
    var z=1,cur=null,user=false;
    function setZ(v){z=Math.max(.2,Math.min(1.25,v));board.style.setProperty('--z',z);if(out)out.textContent=Math.round(z*100)+'%';place()}
    function fit(){if(user)return;board.style.setProperty('--z',1);var w=board.offsetWidth;var target=fig.dataset.fit?board.querySelector('#'+fig.dataset.fit):null;
      var tw=target?(target.offsetWidth+140):w;setZ(Math.min(1,(canvas.clientWidth-8)/tw));if(target){canvas.scrollLeft=Math.max(0,target.offsetLeft*z-50)}}
    function place(){if(!cur){sel.classList.remove('on');return}
      var cr=canvas.getBoundingClientRect(),r=cur.getBoundingClientRect();
      sel.style.left=(r.left-cr.left+canvas.scrollLeft)+'px';sel.style.top=(r.top-cr.top+canvas.scrollTop)+'px';
      sel.style.width=r.width+'px';sel.style.height=r.height+'px';
      sel.querySelector('b').textContent=Math.round(cur.offsetWidth)+' × '+Math.round(cur.offsetHeight)+(cur.dataset.al?'  ⋮ '+cur.dataset.al:'');
      sel.classList.add('on')}
    function select(id){var el=board.querySelector('[data-id="'+id+'"]');if(!el)return;cur=el;
      fig.querySelectorAll('.ly').forEach(function(l){l.classList.toggle('on',l.dataset.t===id)});
      var tp=fig.querySelector('template[data-p="'+id+'"]');if(tp&&props){props.innerHTML='';props.appendChild(tp.content.cloneNode(true))}
      place()}
    fig.addEventListener('click',function(e){
      var l=e.target.closest('.ly');if(l){select(l.dataset.t);var el=board.querySelector('[data-id="'+l.dataset.t+'"]');if(el){var cr=canvas.getBoundingClientRect(),r=el.getBoundingClientRect();canvas.scrollBy({left:r.left-cr.left-40,top:r.top-cr.top-60,behavior:'smooth'})}return}
      var zb=e.target.closest('[data-zoom]');if(zb){user=true;setZ(z+(+zb.dataset.zoom));return}
      var t=e.target.closest('.fig-canvas [data-id]');if(t){
        // like Figma: first click selects the outermost not-yet-selected ancestor
        var chain=[];var n=t;while(n&&n!==board){if(n.dataset&&n.dataset.id)chain.unshift(n);n=n.parentElement}
        var idx=cur?chain.indexOf(cur):-1;var pick=chain[Math.min(idx+1,chain.length-1)];select(pick.dataset.id)}
    });
    canvas.addEventListener('scroll',place,{passive:true});
    addEventListener('resize',function(){fit();place()});
    fit();
    if(fig.dataset.default)select(fig.dataset.default);
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){fit();place()});
  });

  /* live demos on lab page */
  document.querySelectorAll('[data-toggle-demo]').forEach(function(b){b.addEventListener('click',function(){b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed')!=='true'))})});
  document.querySelectorAll('[data-mode-demo]').forEach(function(g){g.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;g.querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});var s=document.querySelector(g.dataset.modeDemo);if(s)s.dataset.vm=b.dataset.v})});
})();


/* ---------- Card motion: reveal on scroll, tilt and light follow the pointer ---------- */
(function(){
  [].slice.call(document.querySelectorAll('.mw-card,.pcard,.box-link')).forEach(function(c){c.classList.add('tilt')});
  var cards=[].slice.call(document.querySelectorAll('.gcard,.tilt'));if(!cards.length)return;
  var root=document.documentElement;
  function calm(){return matchMedia('(prefers-reduced-motion: reduce)').matches||root.getAttribute('data-mode')==='focus'}
  cards.forEach(function(c){var g=document.createElement('span');g.className='glare';g.setAttribute('aria-hidden','true');c.appendChild(g)});
  if(!calm()&&'IntersectionObserver' in window){
    root.classList.add('js');
    cards.forEach(function(c){var sib=[].slice.call(c.parentNode.children);var i=sib.indexOf(c);c.classList.add('pre');c.style.transitionDelay=(i%4)*80+'ms'});
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.remove('pre');io.unobserve(e.target);
      setTimeout(function(){e.target.style.transitionDelay=''},900)}})},{threshold:.15,rootMargin:'0px 0px -40px 0px'});
    cards.forEach(function(c){io.observe(c)});
  }
  if(!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
  cards.forEach(function(c){
    var raf=0;
    c.addEventListener('pointermove',function(e){if(calm())return;var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      cancelAnimationFrame(raf);raf=requestAnimationFrame(function(){c.classList.add('tilting');
        c.style.setProperty('--ry',((x-.5)*8).toFixed(2)+'deg');c.style.setProperty('--rx',((.5-y)*6).toFixed(2)+'deg');
        c.style.setProperty('--gx',(x*100).toFixed(1)+'%');c.style.setProperty('--gy',(y*100).toFixed(1)+'%');
        c.style.setProperty('--dx',((x-.5)*1.2).toFixed(3));c.style.setProperty('--dy',((y-.5)*1.2).toFixed(3))})});
    c.addEventListener('pointerleave',function(){cancelAnimationFrame(raf);c.classList.remove('tilting');['--rx','--ry','--dx','--dy'].forEach(function(p){c.style.removeProperty(p)})});
  });
})();

/* ---------- 60-second version of each case study ---------- */
(function(){
  var Q={
  'dese':{p:"The state's school finance portal worked, but every task went through long lists of links, and staff opened page after page to answer one question.",r:"UX designer and researcher, January to June 2026: research, structure, design system, prototypes and handoff.",d:["Separate menus for state staff, school districts and the public, so each person sees only what they need.","A dashboard that leads with four numbers, calculation status and what's due next.","A design document first, then the Figma library and matching React components built from it."],o:"Handed off in June 2026: the Figma file in Dev Mode, the design document and React components that match the file."},
  'protect':{p:"A statewide legal system with no brand, no design system, a 2005 search tool and a desktop app that made people switch tabs for every case.",r:"The only designer for 18 months, January 2024 to June 2025, working with business analysts and developers.",d:["Built the web design system from IBM's Carbon kit, with light and dark modes, instead of starting from scratch.","Kept dense tables and showed “last synced” everywhere, because staff didn't trust results without knowing how fresh the data was.","Tested with analysts when direct access to users wasn't possible, and logged what still needed checking."],o:"Three web tools (XCQ, eFiling and Administration) and desktop changes, tested in QA with the BAs and live. More than 300 screens moved into one consistent experience."},
  'protect-details':{p:"To check one case's synced data, staff left the grid, opened a tab, read it and went back, for every row.",r:"Sole designer, working with the business analyst and developers.",d:["A details pane under the grid that follows the selected row.","Static expand and collapse sections, because the Windows framework couldn't animate or rely on hover.","Fields ordered by how often they're used, not alphabetically."],o:"Built, tested in QA with the BAs, and live in the desktop app."},
  'protect-xcq':{p:"XCQ, the 2005 inter-county search tool, had no sorting, loaded every result at once and failed contrast and keyboard checks.",r:"Sole designer, working with the business analyst and developers.",d:["System first: tokens and components before any screen.","Pagination with 10, 25 or 50 per page, so large searches stay fast without changing how people scan.","Surname first with aliases in the grid, because matching people across counties depends on them."],o:"Rebuilt on the new design system, tested in QA with the BAs and live."},
  'protect-efiling':{p:"DA staff needed to look up people and cases across every county from a browser, using data that syncs once a night.",r:"Sole designer, working with the business analyst and developers.",d:["Built almost entirely from XCQ components; the only new pattern was a sync banner, which went back into the library.","A partial-sync banner that names the missing counties, so a missing county isn't read as “no record”.","A dense table instead of cards, because staff scan long lists."],o:"Tested in QA with the BAs and live."},
  'protect-logo':{p:"PROTECT had no visual identity, so it felt like a temporary internal tool.",r:"Designer for brand and UI, with business analysts and developers.",d:["A shield with the Wisconsin outline and scales, kept symmetrical for a legal audience.","Tested at 16, 32, 64 and 128 px early, so fine detail was removed before anyone got attached to it.","Gold only on navy or as an accent, because it fails contrast as text on white."],o:"Primary and reversed lockups, exports in SVG, PNG, ICO and PDF, and color rules, used across the desktop app and web tools."},
  'hp':{p:"Sales reps and contract managers worked across spreadsheets, email and separate portals.",r:"Senior UX designer, October 2022 to April 2023.",d:["Two connected products, one for sales and one for contracts, instead of one large app.","Kept all ten table columns with horizontal scroll, because reps compare across them.","Shared Figma components matched to the coded components in names, states and spacing."],o:"Each enhancement was designed in Axure RP, tested in QA with the BA and the team, and released into the live application."},
  'citi':{p:"Teams tracked module status and owners across tools, spreadsheets and email.",r:"UI/UX designer, November 2021 to July 2022.",d:["Only Citi Design System components, extended through tokens.","Light and dark themes from the start, which caught contrast problems early.","Metric, owner and status on every card, because the real problem was accountability."],o:"Full designs for every state in both themes, specs, and support through development."},
  'fedex':{p:"Customers couldn't tell similar print products apart, and the price appeared only after they configured an order.",r:"UI developer moving into UX, November 2018 to July 2021, on a large team.",d:["A card for each product type with a photo, use case and material.","A “starting at” price on every card.","An inline type guide for people who land straight on a product page."],o:"Two rounds of usability testing; both concepts were approved for development."},
  'amazon':{p:"The homepage leads with promotions, while returning customers usually come to track an order, reorder or pick up where they left off.",r:"Independent concept, not affiliated with Amazon.",d:["Returning-customer jobs (orders, buy again, continue) on the first screen.","Eight navigation items instead of thirteen.","No auto-rotating banner; one hero the shopper controls."],o:"A redesign checked against the Laws of UX and WCAG 2.2, with a validation plan. Not yet tested with users."}
  };
  var key=(location.pathname.split('/').pop()||'').replace('.html','');var q=Q[key];
  var hero=document.querySelector('.cs-hero .wrap');if(!q||!hero)return;
  var body=document.body;
  var sw=document.createElement('div');sw.className='qswitch';sw.setAttribute('role','group');sw.setAttribute('aria-label','How much to read');
  sw.innerHTML='<button type="button" data-q="full" aria-pressed="true">Full story</button><button type="button" data-q="quick" aria-pressed="false"><span aria-hidden="true">◷</span> 60-second version</button>';
  hero.appendChild(sw);
  var tocWrap=document.querySelector('.toc');tocWrap=tocWrap&&tocWrap.parentNode;
  var qs=document.createElement('section');qs.className='quick-view';qs.setAttribute('aria-label','60-second version');
  qs.innerHTML='<div class="wrap"><div class="qgrid">'+
    '<div class="box"><span class="k">The problem</span><p>'+q.p+'</p></div>'+
    
    '<div class="box qd"><span class="k">Three key decisions</span><ol>'+q.d.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ol></div>'+
    '<div class="box sun"><span class="k">Result</span><p>'+q.o+'</p></div>'+
    '</div><button type="button" class="qmore">Read the full story <span aria-hidden="true">↓</span></button></div>';
  (tocWrap||hero.parentNode).insertAdjacentElement('afterend',qs);
  function set(mode,scroll){var quick=mode==='quick';body.classList.toggle('quick',quick);
    sw.querySelectorAll('button').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.q===mode))});
    try{localStorage.setItem('sh-read',mode)}catch(e){}
    if(scroll)(quick?qs:sw).scrollIntoView({behavior:'smooth',block:'start'})}
  sw.addEventListener('click',function(e){var b=e.target.closest('button');if(b)set(b.dataset.q,b.dataset.q==='quick')});
  qs.querySelector('.qmore').addEventListener('click',function(){set('full',false);var t=document.querySelector('.cs-sec');if(t)t.scrollIntoView({behavior:'smooth'})});
  var saved=null;try{saved=localStorage.getItem('sh-read')}catch(e){}
  if(saved==='quick')set('quick',false);
})();

/* ---------- Before / after slider ---------- */
(function(){
  document.querySelectorAll('[data-ba]').forEach(function(ba){
    var stage=ba.querySelector('.ba-stage'),range=ba.querySelector('.ba-range'),w=+ba.dataset.w||900;
    function fit(){var s=ba.clientWidth/w;stage.style.transform='scale('+s+')';ba.style.height=(stage.offsetHeight*s)+'px'}
    function set(v){ba.style.setProperty('--pos',v+'%')}
    range.addEventListener('input',function(){set(range.value)});
    addEventListener('resize',fit);fit();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
  });
})();

/* ---------- Try XCQ search (sample data, fictional names) ---------- */
(function(){
  var box=document.getElementById('xcq-try');if(!box)return;
  var LAST=['Larsen','Larson','Lars','Larsen-Holt','Larkin','Lange','Lindqvist','Olsen','Nguyen','Schmidt','Kowalski','Garcia','Johnson','Peterson','Hansen','Meyer','Becker','Novak','Ortiz','Brennan'];
  var FIRST=['Erik','Priya','Dana','Theo','Maya','Jonah','Rosa','Ines','Caleb','Nora','Owen','Lena','Marcus','Ava','Samir','Hazel','Felix','June','Rafael','Greta'];
  var CTY=['Dane','Brown','Eau Claire','Marathon','Outagamie','Milwaukee','Waukesha','La Crosse','Rock','Kenosha','Iron','Florence'];
  var seed=7;function r(n){seed=(seed*9301+49297)%233280;return Math.floor(seed/233280*n)}
  var P=[];for(var i=0;i<96;i++){var l=LAST[i%LAST.length],f=FIRST[r(FIRST.length)],c=CTY[r(CTY.length)];
    var y=1958+r(45),m=1+r(12),d=1+r(28);var al=[];var k=r(4);
    if(k===1)al.push('AKA '+f+' '+LAST[r(LAST.length)]);if(k===2)al.push('AKA '+f.charAt(0)+'. '+l,'AKA '+FIRST[r(FIRST.length)]+' '+l);
    P.push({name:l+', '+f+' '+String.fromCharCode(65+r(26)),last:l,dob:(m<10?'0':'')+m+'/'+(d<10?'0':'')+d+'/'+y,iso:y*10000+m*100+d,sex:/^(Priya|Dana|Maya|Rosa|Ines|Nora|Lena|Ava|Hazel|June|Greta)$/.test(f)?'F':'M',county:c,al:al})}
  var $=function(s){return box.querySelector(s)};
  var q=$('.xt-q'),cty=$('.xt-county'),size=$('.xt-size'),fail=$('.xt-fail'),tb=$('tbody'),bar=$('.xt-bar'),pager=$('.xt-pager'),empty=$('.xt-empty'),alert=$('.xt-alert'),err=$('#xt-err'),table=$('table'),sync=$('.xt-sync');
  cty.innerHTML='<option value="">All 72 counties</option>'+CTY.slice().sort().map(function(c){return '<option>'+c+'</option>'}).join('');
  var sortK='name',dir=1,page=1;
  function esc(t){return t.replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
  function hi(t,v){if(!v)return esc(t);var i=t.toLowerCase().indexOf(v.toLowerCase());return i<0?esc(t):esc(t.slice(0,i))+'<mark>'+esc(t.slice(i,i+v.length))+'</mark>'+esc(t.slice(i+v.length))}
  function render(){
    var v=q.value.trim(),failed=fail.checked,per=+size.value;
    var bad=v.length<2;err.hidden=!bad;q.classList.toggle('err',bad);q.setAttribute('aria-invalid',String(bad));
    alert.hidden=!failed;alert.innerHTML='<b>2 counties didn’t sync last night: Iron, Florence.</b><br>Results from those counties may be missing. Try again after 6 AM, or contact DA IT if it continues.';
    sync.textContent=failed?'Partial sync · 2 counties missing':'Data synced 2:00 AM';
    if(bad){tb.innerHTML='';table.hidden=true;empty.hidden=false;empty.innerHTML='<b>Type at least 2 letters</b>Partial last names work: “Lar” finds Larsen and Larson.';bar.innerHTML='';pager.innerHTML='';return}
    var lv=v.toLowerCase();
    var rows=P.filter(function(p){var hit=p.last.toLowerCase().indexOf(lv)===0||p.al.some(function(a){return a.toLowerCase().split(/[ .,]+/).some(function(w){return w.indexOf(lv)===0})});
      return hit&&(!cty.value||p.county===cty.value)&&!(failed&&(p.county==='Iron'||p.county==='Florence'))});
    rows.sort(function(a,b){var x=sortK==='dob'?a.iso-b.iso:(a[sortK]>b[sortK]?1:a[sortK]<b[sortK]?-1:0);return x*dir});
    var pages=Math.max(1,Math.ceil(rows.length/per));if(page>pages)page=pages;
    var slice=rows.slice((page-1)*per,page*per);
    table.hidden=!rows.length;empty.hidden=!!rows.length;
    empty.innerHTML='<b>No matches for “'+esc(v)+'”'+(cty.value?' in '+esc(cty.value):'')+'</b>Check the spelling, or search all counties.';
    tb.innerHTML=slice.map(function(p){return '<tr><td><a>'+hi(p.name,v)+'</a></td><td>'+p.dob+'</td><td>'+p.sex+'</td><td>'+p.county+'</td><td style="opacity:.75">'+(p.al.length?p.al.map(function(a){return hi(a,v)}).join(' · '):'—')+'</td></tr>'}).join('');
    var label={name:'Full name',dob:'DOB',county:'County'}[sortK];
    bar.innerHTML='<span><b>'+rows.length+' result'+(rows.length===1?'':'s')+'</b> for Last name = “'+esc(v)+'” · '+(cty.value?esc(cty.value):'all counties')+'</span><span>Sorted by '+label+(dir>0?' A→Z':' Z→A')+'</span>';
    box.querySelectorAll('th[aria-sort]').forEach(function(th){var b=th.querySelector('button'),on=b.dataset.k===sortK;th.setAttribute('aria-sort',on?(dir>0?'ascending':'descending'):'none');b.querySelector('span').textContent=on?(dir>0?'↑':'↓'):'↕'});
    var from=rows.length?(page-1)*per+1:0,to=Math.min(page*per,rows.length),btns='';
    for(var i=1;i<=pages;i++)btns+='<button type="button" data-p="'+i+'"'+(i===page?' aria-current="page"':'')+'>'+i+'</button>';
    pager.innerHTML=rows.length?'<span>Showing '+from+'–'+to+' of '+rows.length+'</span><div><button type="button" data-p="'+(page-1)+'"'+(page===1?' disabled':'')+'>← Prev</button>'+btns+'<button type="button" data-p="'+(page+1)+'"'+(page===pages?' disabled':'')+'>Next →</button></div>':'';
  }
  q.addEventListener('input',function(){page=1;render()});
  [cty,size,fail].forEach(function(el){el.addEventListener('change',function(){page=1;render()})});
  box.querySelector('thead').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.dataset.k===sortK)dir=-dir;else{sortK=b.dataset.k;dir=1}render()});
  pager.addEventListener('click',function(e){var b=e.target.closest('button');if(!b||b.disabled)return;page=+b.dataset.p;render()});
  box.querySelector('.xt-mode').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;box.classList.toggle('dk',b.dataset.m==='dark');box.querySelectorAll('.xt-mode button').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))})});
  render();
})();

/* ---------- Focus mode hint (homepage) ---------- */
(function(){
  if(!document.querySelector('.hero-cloak'))return;
  var fb=document.querySelector('[data-focus]');if(!fb)return;
  var root=document.documentElement;
  try{if(localStorage.getItem('sh-focus-hint')==='done'||localStorage.getItem('sh-focus')!==null)return}catch(e){}
  if(root.getAttribute('data-mode')==='focus')return;
  var tip=document.createElement('div');tip.className='fhint';tip.setAttribute('role','note');
  tip.innerHTML='<p><b>Try Focus mode.</b> No motion, larger text, higher contrast: the low-distraction view I’d design for staff who read data all day.</p><div><button type="button" class="fh-try">Try it</button><button type="button" class="fh-x" aria-label="Dismiss">×</button></div>';
  document.body.appendChild(tip);
  function place(){var r=fb.getBoundingClientRect(),w=tip.offsetWidth;
    if(innerWidth<640){tip.style.left='12px';tip.style.right='12px';tip.style.top=(r.bottom+14)+'px';tip.style.setProperty('--ax',(r.left+r.width/2-12)+'px');return}
    var left=Math.min(innerWidth-w-12,Math.max(12,r.right-w));tip.style.left=left+'px';tip.style.right='auto';tip.style.top=(r.bottom+16)+'px';tip.style.setProperty('--ax',(r.left+r.width/2-left)+'px')}
  function done(){tip.classList.remove('on');try{localStorage.setItem('sh-focus-hint','done')}catch(e){}setTimeout(function(){tip.remove()},400)}
  tip.querySelector('.fh-x').addEventListener('click',done);
  tip.querySelector('.fh-try').addEventListener('click',function(){fb.click();done()});
  fb.addEventListener('click',done);
  addEventListener('resize',place);
  setTimeout(function(){place();tip.classList.add('on')},1400);
})();
