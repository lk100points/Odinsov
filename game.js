'use strict';
// ЗАЕЗД В ОДИНЦОВО — ночная зимняя аркадная гонка-выживание (псевдо-3D, 320x180 пикселей)
const W=320,H=180,K=60,cv=document.getElementById('c'),g=cv.getContext('2d'),O=document.getElementById('ov');
cv.width=W;cv.height=H;
const SK=[{n:'Серый',p:0,a:'#9aa0ac',b:'#6d7380'},{n:'Ралли',p:400,a:'#e8e8ee',b:'#d8421c'},{n:'Неон',p:900,a:'#12d6ff',b:'#ff2bd6'},{n:'Лёд',p:1200,a:'#bfe6ff',b:'#ffffff'},{n:'Золото',p:3000,a:'#ffcf33',b:'#b8860b'},{n:'Пантера «КОЧ» (мем)',p:1500,a:'#17171d',b:'#2e2e3a',txt:'КОЧ'}];
const TI=[{n:'Обычные',p:0,g:1,s:1,d:1,t:'база'},{n:'Шипованные',p:600,g:1.25,s:1,d:1,t:'+сцепление'},{n:'Спорт',p:1200,g:1.1,s:1.06,d:1,t:'+скорость'},{n:'Дрифтовые',p:1800,g:.9,s:1,d:2,t:'×2 очки за дрифт'}];
const GU=[{n:'Обрез',p:0,m:2,rl:1.8,sp:22,t:'2 патрона'},{n:'Помповое',p:900,m:4,rl:1.5,sp:26,t:'4 патрона, шире разброс'},{n:'Золотой «Одинцовец»',p:2500,m:6,rl:1.1,sp:34,t:'6 патронов, быстрая перезарядка'}];
const TR=[{n:'Чёрный',p:0,c:i=>'#050507'},{n:'Неон',p:500,c:i=>i%2?'#0ff':'#f0f'},{n:'Огонь',p:1000,c:i=>i%3?'#ff6a00':'#ffd200'},{n:'Радуга',p:2000,c:i=>`hsl(${i*37%360},100%,60%)`},{n:'Звёздная пыль',p:2500,c:i=>i%2?'#fff':'#9fd8ff'}];
const UP=[['eng','Двигатель','+6% макс. скорость'],['hnd','Управление','+8% поворот'],['rel','Перезарядка','−8% времени']];
const DB={skin:SK,tire:TI,gun:GU,trail:TR};
const MS=['Ты у меня на прицеле.','Подрежу тебя на повороте!','Одинцово тебя не забудет.','Дрифтуй, пока можешь.'];
let S;try{S=JSON.parse(localStorage.odin)}catch(e){}
S=S||{coins:0,best:0,own:{skin:[0],tire:[0],gun:[0],trail:[0]},eq:{skin:0,tire:0,gun:0,trail:0},up:{eng:0,hnd:0,rel:0}};
const save=()=>{try{localStorage.odin=JSON.stringify(S)}catch(e){}};
let st='menu',fp=false,keys={},ui={},pz,px,sp,da,stv,combo,score,kills,bots,marks,parts,snow,held,ammo,rel,flash,bf=0,kick,dead,time,msg,msgT,markT,mc=0,hor=66,aim={x:160,y:90},cols=[];
const hf=new Float32Array(H),cx=new Float32Array(H),zz=new Float32Array(H);
const R=Math.random,curv=z=>Math.sin(z*.0021)*.9+Math.sin(z*.0007+2)*.7+Math.sin(z*.0043)*.25;
const hsh=n=>{n=Math.sin(n*127.1)*43758.5;return n-Math.floor(n)};
const sh=(c,f)=>{const n=parseInt(c.slice(1),16);return`rgb(${(n>>16)*f|0},${(n>>8&255)*f|0},${(n&255)*f|0})`};
const mx=()=>850*(1+.06*S.up.eng)*TI[S.eq.tire].s;
const poly=a=>{g.beginPath();a.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.fill()};
const tx=(s,x,y,c)=>{g.fillStyle='#000';g.fillText(s,x+1,y+1);g.fillStyle=c||'#fff';g.fillText(s,x,y)};
const VG=g.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,W*.7),LG=g.createRadialGradient(W/2,H,4,W/2,H,130);
VG.addColorStop(0,'rgba(0,0,0,0)');VG.addColorStop(1,'rgba(0,0,10,.68)');LG.addColorStop(0,'rgba(255,255,230,.3)');LG.addColorStop(1,'rgba(255,255,230,0)');

function reset(){pz=0;px=0;sp=0;da=0;stv=0;combo=1;score=0;kills=0;marks=[];parts=[];held=false;rel=0;ammo=GU[S.eq.gun].m;flash=kick=dead=0;time=0;msg='';msgT=0;markT=0;
 snow=Array.from({length:90},()=>({x:R()*W,y:R()*H,v:20+R()*30,s:R()<.12}));
 cols=Array.from({length:40},(_,i)=>({x:i*8,y:R()*H,v:50+R()*120,s:R()*99|0}));
 bots=Array.from({length:8},()=>({}));bots.forEach(b=>respawn(b,true))}
function respawn(b,first){b.k=.6+R()*.55*Math.min(1.6,1+time/120);const back=!first&&b.k>1&&R()<.6;
 b.z=pz+(back?-300-R()*200:(first?500:1500)+R()*2200);b.x=[-.55,0,.55][R()*3|0];b.tx=b.x;b.t=R()*3;b.v=Math.max(380,sp*b.k);b.burn=0;b.cut=R()<.45;b.sk=SK[R()*5|0]}
function proj(dz,x){const t=K/dz,r=hor+t*(H-hor),i=Math.min(H-1,Math.max(hor+1,r|0)),h=t*W*.42;return{x:cx[i]+x*h,y:r,h,t}}
function startReload(){if(!held||rel>0||ammo>=GU[S.eq.gun].m)return;rel=GU[S.eq.gun].rl*(1-.08*S.up.rel)}
function fire(ax,ay){if(st!='play'||!fp||!held||rel>0||ammo<1)return;ammo--;flash=.12;kick=1;aim={x:ax,y:ay};const sr=GU[S.eq.gun].sp;
 for(const b of bots){if(b.burn>0)continue;const dz=b.z-pz;if(dz<70||dz>2200)continue;const p=proj(dz,b.x);
  if(Math.hypot(p.x-ax,p.y-p.h*.1-ay)<sr+p.h*.2){b.burn=1.5;b.sx=(R()-.5)*.8;score+=100}}
 for(let i=0;i<8;i++)parts.push({x:ax,y:ay,vx:(R()-.5)*90,vy:(R()-.5)*90,l:.25,c:'#fff',s:1});
 if(ammo<1)startReload()}
function boom(b){const dz=b.z-pz;if(dz>35){const p=proj(dz,b.x);for(let i=0;i<45;i++){const a=R()*6.28,v=20+R()*90;
  parts.push({x:p.x,y:p.y-p.h*.1,vx:Math.cos(a)*v,vy:Math.sin(a)*v-30,l:.5+R()*.8,c:['#fff','#ffd23a','#ff7a00','#c22','#333'][R()*5|0],s:1+R()*3})}bf=.15}
 score+=500;kills++;respawn(b)}
function crash(){if(st=='play'){st='dead';dead=0}}

function update(dt){time+=dt;
 for(const s of snow){s.y+=s.v*dt;s.x+=(-curv(pz+300)*20-8)*dt;if(s.y>H){s.y=0;s.x=R()*W}if(s.x<0)s.x+=W;if(s.x>W)s.x-=W}
 for(let i=parts.length;i--;){const p=parts[i];p.l-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=90*dt;if(p.l<=0)parts.splice(i,1)}
 flash=Math.max(0,flash-dt);bf=Math.max(0,bf-dt);kick=Math.max(0,kick-dt*5);msgT-=dt;
 if(rel>0){rel-=dt;if(rel<=0){rel=0;ammo=GU[S.eq.gun].m}}
 if(st=='dead'){dead+=dt;sp*=Math.max(0,1-4*dt);if(dead>2.6)over();return}
 if(st!='play')return;
 const mxs=mx(),tire=TI[S.eq.tire],grip=tire.g*(1+.08*S.up.hnd);
 const L=keys.arrowleft||keys.a||ui.l,Rt=keys.arrowright||keys.d||ui.r,gas=keys.arrowup||keys.w||ui.gas,brk=keys.arrowdown||keys.s||ui.brk;
 stv+=((Rt?1:0)-(L?1:0)-stv)*Math.min(1,dt*9);
 if(gas)sp+=380*dt;if(brk)sp-=800*dt;sp-=90*dt;if(Math.abs(px)>1.05)sp*=1-1.4*dt;sp=Math.max(0,Math.min(mxs,sp));
 const f=sp/mxs,dri=Math.abs(stv)>.55&&f>.55;
 da+=((dri?stv:0)-da)*Math.min(1,dt*5);
 px+=stv*dt*f*1.5*grip*(dri?1.15:1)-curv(pz+120)*dt*sp*(dri?.00025:.00042);
 pz+=sp*dt;score+=dt*sp*.012;
 if(dri){combo=Math.min(8,combo+dt*1.5);score+=dt*sp*.04*combo*tire.d;markT-=dt;if(markT<=0){markT=.035;marks.push({z:pz+K,x:px,l:1,c:TR[S.eq.trail].c(mc++)})}}else combo=Math.max(1,combo-dt*3);
 for(const m of marks)m.l-=dt*.25;while(marks.length&&(marks[0].l<=0||marks[0].z<pz))marks.shift();
 if(Math.abs(px)>1.45)crash();
 if(time>8&&msgT<=0&&R()<dt*.08){msg=MS[R()*MS.length|0];msgT=2.2}
 for(const b of bots){b.z+=b.v*dt;
  if(b.burn>0){b.burn-=dt;b.x+=b.sx*dt;b.v*=1-.6*dt;if(b.burn<=0){boom(b);continue}}
  else{b.v+=(Math.max(380,sp*b.k)-b.v)*dt*.5;b.t-=dt;if(b.t<=0){b.t=2+R()*3;const d=b.z-pz;b.tx=b.cut&&d>80&&d<600?px:[-.55,0,.55][R()*3|0]}
   b.x+=(Math.max(-.85,Math.min(.85,b.tx))-b.x)*dt*1.2}
  const dz=b.z-pz;if(dz<-500||dz>4200){respawn(b);continue}
  if(Math.abs(dz-K)<22&&Math.abs(b.x-px)<.34)crash()}}
function over(){st='over';S.coins+=score|0;S.best=Math.max(S.best,score|0);save();
 ov(`<h1 class="r">МАТРИЦА ТЕБЯ ПОГЛОТИЛА</h1><p>очки: <b>${score|0}</b> · взорвано: ${kills}<br>рекорд: ${S.best} · в кошельке: ${S.coins} ⛁</p><button onclick="start()">↻ ЕЩЁ РАЗ</button><button onclick="shop()">ГАРАЖ</button>`)}

function car(x,y,w,sk,f,glow){const h=w*.5;
 g.fillStyle=sh(sk.a,f);g.fillRect(x-w/2,y-h*.62,w,h*.5);
 g.fillStyle=sh(sk.b,f);g.fillRect(x-w*.36,y-h,w*.72,h*.4);
 g.fillStyle='#0a1018';g.fillRect(x-w*.3,y-h*.94,w*.6,h*.26);
 g.fillStyle=glow?'#ff3030':'#a01818';g.fillRect(x-w*.46,y-h*.56,w*.2,h*.12);g.fillRect(x+w*.26,y-h*.56,w*.2,h*.12);
 g.fillStyle='#050505';g.fillRect(x-w*.5,y-h*.2,w*.16,h*.2);g.fillRect(x+w*.34,y-h*.2,w*.16,h*.2);
 g.fillStyle='#ddd';g.fillRect(x-w*.1,y-h*.3,w*.2,h*.1);
 if(sk.txt){g.fillStyle='#ffd400';g.font=`bold ${Math.max(3,w*.17)|0}px monospace`;g.textAlign='center';g.fillText(sk.txt,x,y-h*.46);g.textAlign='left'}}
function flame(x,y,w){const h=w*.5;for(let i=0;i<7;i++){g.fillStyle=['#ff7a00','#ffd23a','#c22','#555'][R()*4|0];g.fillRect(x+(R()-.5)*w,y-h*(.8+R()*1.2),Math.max(1,w*.14),Math.max(1,h*.35))}}
function tree(x,y,ht,f){g.fillStyle=sh('#2a1c10',f);g.fillRect(x-ht*.03,y-ht*.15,ht*.06,ht*.15);
 for(let i=0;i<3;i++){const w=ht*.42*(1-i*.22),by=y-ht*.12-i*ht*.26,ty=by-ht*.42;g.fillStyle=sh('#14302f',f);poly([[x-w,by],[x+w,by],[x,ty]]);g.fillStyle=sh('#9fb4c8',f*.8);poly([[x-w*.45,by-ht*.2],[x+w*.45,by-ht*.2],[x,ty]])}}
function matrix(a){g.fillStyle=`rgba(0,12,0,${Math.min(.85,a*.5)})`;g.fillRect(0,0,W,H);g.font='8px monospace';const C='ｱｲｳｴｵｶｷｸｹｺ0123456789';
 for(let i=0;i<Math.min(40,a*30);i++){const c=cols[i],y=(c.y+time*c.v)%(H+60);for(let j=0;j<7;j++){g.fillStyle=j?`rgba(0,255,70,${1-j/7})`:'#d8ffd8';g.fillText(C[(c.s+j+(time*8|0))%C.length],c.x,y-j*8)}}}
function cockpit(){g.fillStyle='#0a0b0e';poly([[0,0],[40,0],[14,H-30],[0,H-26]]);poly([[W,0],[W-40,0],[W-14,H-30],[W,H-26]]);g.fillRect(0,0,W,13);
 g.fillStyle='#121418';poly([[0,H-30],[W*.3,H-46],[W*.7,H-46],[W,H-30],[W,H],[0,H]]);
 g.fillStyle='#050608';g.fillRect(W/2-34,8,68,17);g.fillStyle='#1a2332';g.fillRect(W/2-32,10,64,13);
 for(const b of bots)if(b.z<pz&&b.z>pz-700){g.fillStyle='#f33';g.fillRect(W/2-30+(b.x+1)*30,14,3,2)}
 const wx=W*.36,wy=H-18;
 for(const o of[-16,16]){const c=wx+o,y=wy-12;g.fillStyle='#050505';g.beginPath();g.arc(c,y,9,0,6.3);g.fill();const a=2.2+sp/mx()*3.9;g.strokeStyle='#f33';g.lineWidth=1;g.beginPath();g.moveTo(c,y);g.lineTo(c+Math.cos(a)*8,y+Math.sin(a)*8);g.stroke()}
 g.save();g.translate(wx,wy);g.rotate(stv*.7);g.strokeStyle='#1d1f26';g.lineWidth=6;g.beginPath();g.ellipse(0,0,36,14,0,0,6.3);g.stroke();g.strokeStyle='#c33';g.lineWidth=2;g.beginPath();g.ellipse(0,0,36,14,0,4.4,5);g.stroke();g.fillStyle='#2a2d36';g.fillRect(-6,-3,12,6);g.restore();
 g.font='bold 13px monospace';tx(Math.min(5,1+(sp/190|0)),W*.56,H-30,'#e22');
 if(held){for(let i=0;i<GU[S.eq.gun].m;i++){g.fillStyle=i<ammo?'#e33':'#422';g.fillRect(W*.56+10+i*4,H-38,2,7)}if(rel>0){g.font='bold 7px monospace';tx('ПЕРЕЗАРЯДКА',W*.56+10,H-12,'#fc4')}}
 if(!held){g.save();g.translate(W*.78,15);g.rotate(.12);g.fillStyle='#222';g.fillRect(-24,-13,2,11);g.fillRect(8,-13,2,11);g.fillStyle='#454a52';g.fillRect(-34,-3,50,4);g.fillRect(-34,2,48,3);g.fillStyle='#5a3a1e';g.fillRect(14,-4,22,7);g.restore();
  if((time*2|0)%2){g.font='bold 7px monospace';tx('ТАП — ВЗЯТЬ ДРОБОВИК',W*.5,38,'#fd4')}}
 else{g.save();g.translate(W*.8,H+4);g.rotate(-.45-kick*.15);g.fillStyle='#4a4f58';g.fillRect(-3,-82,6,82);g.fillStyle='#5a3a1e';g.fillRect(-5,-44,10,16);g.fillRect(-6,-14,12,18);
  if(flash>0){g.fillStyle='#ffe27a';g.beginPath();g.arc(0,-88,10,0,6.3);g.fill()}g.restore();
  g.strokeStyle='#fd4';g.lineWidth=1;g.beginPath();g.moveTo(aim.x-4,aim.y);g.lineTo(aim.x+4,aim.y);g.moveTo(aim.x,aim.y-4);g.lineTo(aim.x,aim.y+4);g.stroke()}}

function draw(){hor=fp?76:66;
 let dx=0,xa=0;for(let r=H-1;r>hor;r--){const t=(r-hor)/(H-hor),z=pz+K/t;dx+=curv(z)*.012;xa+=dx;hf[r]=t*W*.42;cx[r]=W/2-px*hf[r]+xa;zz[r]=z}
 let gr=g.createLinearGradient(0,0,0,hor);gr.addColorStop(0,'#02030a');gr.addColorStop(1,'#1c2840');g.fillStyle=gr;g.fillRect(0,0,W,hor+1);
 const off=(cx[hor+1]-W/2)*.4;g.fillStyle='#26324a';g.beginPath();g.moveTo(0,hor);
 for(let x=0;x<=W;x+=8)g.lineTo(x,hor-14-12*Math.sin((x-off)*.03)-8*Math.sin((x-off)*.083+1));g.lineTo(W,hor);g.fill();
 for(let r=hor+1;r<H;r++){const t=(r-hor)/(H-hor),f=Math.min(.85,.18+t*1.5),s=(zz[r]/50|0)&1,c=cx[r],h=hf[r];
  g.fillStyle=sh(s?'#788aaa':'#687a9a',f);g.fillRect(0,r,W,1);
  g.fillStyle=s?sh('#dddddd',f):sh('#aa2222',f);g.fillRect(c-h*1.1,r,h*2.2,1);
  g.fillStyle=sh('#3a3c46',f);g.fillRect(c-h,r,h*2,1);
  if(s){g.fillStyle=sh('#cfcfcf',f);g.fillRect(c-h*.02-.5,r,h*.04+1,1)}}
 g.fillStyle=LG;g.fillRect(0,hor,W,H-hor);
 const sl=[];
 for(let k=Math.ceil((pz+40)/90);k*90<pz+2800;k++)for(const sd of[-1,1]){const dz=k*90-pz,p=proj(dz,sd*(1.3+hsh(k*2+sd)*1.1));sl.push([dz,()=>tree(p.x,p.y,p.h*.55,Math.min(.85,.2+p.t*1.5))])}
 for(const m of marks){const dz=m.z-pz;if(dz<38||dz>1800)continue;const p=proj(dz,m.x);
  sl.push([dz,()=>{g.globalAlpha=Math.min(1,m.l);g.fillStyle=m.c;const w=Math.max(1,p.h*.035);g.fillRect(p.x-p.h*.12,p.y,w,Math.max(1,w*.6));g.fillRect(p.x+p.h*.12-w,p.y,w,Math.max(1,w*.6));g.globalAlpha=1}])}
 for(const b of bots){const dz=b.z-pz;if(dz<35||dz>3000)continue;const p=proj(dz,b.x);
  sl.push([dz,()=>{car(p.x,p.y,p.h*.4,b.sk,Math.min(.9,.25+p.t*1.6),1);if(b.burn>0)flame(p.x,p.y,p.h*.4)}])}
 sl.sort((a,b)=>b[0]-a[0]);for(const o of sl)o[1]();
 if(!fp){g.save();g.translate(W/2+da*12,H-6);g.rotate(da*.3);if(st=='dead'||st=='over')g.globalAlpha=Math.max(0,1-dead/1.4);car(0,0,54,SK[S.eq.skin],.9,1);g.restore();g.globalAlpha=1}
 for(const p of parts){g.fillStyle=p.c;g.fillRect(p.x,p.y,p.s,p.s)}
 for(const s of snow){g.fillStyle='#dfeaff';if(s.s){g.fillRect(s.x-1,s.y,3,1);g.fillRect(s.x,s.y-1,1,3)}else g.fillRect(s.x,s.y,1,1)}
 if(bf>0){g.fillStyle=`rgba(255,200,120,${bf*2})`;g.fillRect(0,0,W,H)}
 if(fp)cockpit();
 g.fillStyle=VG;g.fillRect(0,0,W,H);
 g.font='bold 8px monospace';g.textAlign='left';
 if(st=='play'||st=='dead'){tx('ОЧКИ '+(score|0),4,10);tx((sp*.2|0)+' КМ/Ч',4,19);if(combo>1.5)tx('ДРИФТ x'+combo.toFixed(1),4,28,'#fa3');if(msgT>0)tx(msg,70,50)}
 if(st=='dead'||st=='over')matrix(st=='over'?3:dead)}

function ov(h){O.innerHTML=h;O.style.display='flex'}
function menu(){reset();st='menu';ov(`<h1>ЗАЕЗД<br>В ОДИНЦОВО</h1><p>ночь · снег · дробовик · дрифт</p><button onclick="start()">▶ ЕХАТЬ</button><button onclick="shop()">ГАРАЖ</button><small>рекорд ${S.best} · очки: ${S.coins} ⛁<br>← → руль · ↑ газ · ↓ тормоз · C вид · G взять дробовик · Пробел/клик огонь · R перезарядка</small>`)}
function start(){reset();st='play';O.style.display='none'}
const TABS=[['skin','Скины'],['tire','Шины'],['gun','Дробовик'],['trail','След'],['up','Прокачка']];
function shop(tab='skin'){
 let h=`<h2>ГАРАЖ · ${S.coins|0} ⛁</h2><div class="tabs">${TABS.map(t=>`<button class="${t[0]==tab?'on':''}" onclick="shop('${t[0]}')">${t[1]}</button>`).join('')}</div><div class="list">`;
 if(tab=='up')UP.forEach(u=>{const l=S.up[u[0]],c=300*Math.pow(l+1,1.6)|0;h+=`<div class="it"><span><b>${u[1]}</b> ур.${l}/5<br><small>${u[2]}</small></span><button ${l>=5?'disabled':''} onclick="upg('${u[0]}',${c})">${l>=5?'МАКС':'⛁ '+c}</button></div>`});
 else DB[tab].forEach((it,i)=>{const own=S.own[tab].includes(i),eq=S.eq[tab]==i;
  h+=`<div class="it"><span>${tab=='skin'?`<i class="sw" style="background:linear-gradient(${it.a} 50%,${it.b} 50%)"></i>`:''}<b>${it.n}</b>${it.t?`<br><small>${it.t}</small>`:''}</span><button class="${eq?'on':''}" onclick="buy('${tab}',${i})">${eq?'✔ НАДЕТО':own?'НАДЕТЬ':'⛁ '+it.p}</button></div>`});
 ov(h+`</div><button onclick="menu()">← НАЗАД</button>`)}
function buy(c,i){const it=DB[c][i];if(!S.own[c].includes(i)){if(S.coins<it.p)return;S.coins-=it.p;S.own[c].push(i)}S.eq[c]=i;save();shop(c)}
function upg(k,c){if(S.coins<c||S.up[k]>=5)return;S.coins-=c;S.up[k]++;save();shop('up')}

function cpos(e){const r=cv.getBoundingClientRect(),s=Math.min(r.width/W,r.height/H);return{x:(e.clientX-r.left-(r.width-W*s)/2)/s,y:(e.clientY-r.top-(r.height-H*s)/2)/s}}
cv.addEventListener('pointerdown',e=>{if(st!='play'||!fp)return;const p=cpos(e);aim=p;if(!held){if(p.x>W*.55&&p.y<40){held=true;ammo=GU[S.eq.gun].m}}else fire(p.x,p.y)});
cv.addEventListener('pointermove',e=>{aim=cpos(e)});
[['bl','l'],['br','r'],['gas','gas'],['brk','brk']].forEach(([id,k])=>{const el=document.getElementById(id);el.onpointerdown=e=>{ui[k]=1;e.preventDefault()};['pointerup','pointercancel','pointerleave'].forEach(ev=>el['on'+ev]=()=>ui[k]=0)});
document.getElementById('vw').onclick=()=>{fp=!fp};document.getElementById('rl').onclick=startReload;
onkeydown=e=>{const k=e.key.toLowerCase();keys[k]=1;if(k=='c')fp=!fp;if(k=='g'&&fp&&st=='play'){held=true}if(k=='r')startReload();if(k==' '){fire(aim.x,aim.y);e.preventDefault()}};
onkeyup=e=>keys[e.key.toLowerCase()]=0;
let lt=0;function loop(t){const dt=Math.min(.05,(t-lt)/1000||0);lt=t;update(dt);draw();if(document.body.className!=st)document.body.className=st;requestAnimationFrame(loop)}
menu();requestAnimationFrame(loop);
