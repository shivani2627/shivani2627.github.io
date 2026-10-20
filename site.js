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
