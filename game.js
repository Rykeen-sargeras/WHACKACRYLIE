'use strict';

const gate=document.querySelector('#gate'),agree=document.querySelector('#agree'),enter=document.querySelector('#enter'),app=document.querySelector('#app');
agree.addEventListener('change',()=>enter.disabled=!agree.checked);
enter.addEventListener('click',()=>{gate.classList.add('dismissed');app.removeAttribute('aria-hidden');resize();});

const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),cleaner=document.querySelector('#cleaner'),faceInput=document.querySelector('#faceInput'),resetFace=document.querySelector('#resetFace'),statusEl=document.querySelector('#status');
const DPR=()=>Math.min(devicePixelRatio||1,2);let W=1200,H=700,last=performance.now(),pointer={x:0,y:0,down:false,lastX:0,lastY:0,vx:0,vy:0},grab=null,paint=[],faceImage=null;
const savedFace=localStorage.getItem('wac-face');if(savedFace){faceImage=new Image();faceImage.src=savedFace;}

function resize(){const r=canvas.getBoundingClientRect(),d=DPR();W=r.width;H=r.height;canvas.width=Math.round(W*d);canvas.height=Math.round(H*d);ctx.setTransform(d,0,0,d,0,0);resetScene();}
addEventListener('resize',resize);

class Point{constructor(x,y,r=15,m=1){this.x=x;this.y=y;this.px=x;this.py=y;this.r=r;this.m=m;this.pinned=false;this.detached=false;} impulse(x,y){this.px-=x;this.py-=y;}}
class Link{constructor(a,b,len,stiff=.92,breakForce=95){this.a=a;this.b=b;this.len=len;this.stiff=stiff;this.breakForce=breakForce;this.broken=false;} solve(){if(this.broken)return;const dx=this.b.x-this.a.x,dy=this.b.y-this.a.y,d=Math.hypot(dx,dy)||1,diff=(d-this.len)/d;if(Math.abs(d-this.len)>this.breakForce){this.broken=true;this.b.detached=true;splash((this.a.x+this.b.x)/2,(this.a.y+this.b.y)/2,12);return;}const ox=dx*.5*diff*this.stiff,oy=dy*.5*diff*this.stiff;if(!this.a.pinned){this.a.x+=ox;this.a.y+=oy}if(!this.b.pinned){this.b.x-=ox;this.b.y-=oy}}}
class Tool{constructor(type,x,y,w,h,m=2){Object.assign(this,{type,x,y,px:x,py:y,w,h,m,angle:0,pa:0,held:false});} get radius(){return Math.max(this.w,this.h)*.48}}

let body=[],links=[],tools=[];
function P(x,y,r,m){const p=new Point(x,y,r,m);body.push(p);return p}
function L(a,b,len,stiff,bf){const l=new Link(a,b,len,stiff,bf);links.push(l);return l}
function resetScene(){if(!W||!H)return;paint=[];body=[];links=[];tools=[];grab=null;canvas.classList.remove('dragging');statusEl.textContent='Cleaner is always available.';
  const cx=W*.72,cy=H*.30;
  const head=P(cx,cy,42,2.8),neck=P(cx,cy+55,15,1.5),chest=P(cx,cy+112,31,3),hip=P(cx,cy+205,27,3);
  const ls=P(cx-62,cy+104,19,1.4),le=P(cx-112,cy+158,17,1.1),lh=P(cx-137,cy+219,18,1);
  const rs=P(cx+62,cy+104,19,1.4),re=P(cx+112,cy+158,17,1.1),rh=P(cx+137,cy+219,18,1);
  const lk=P(cx-38,cy+284,22,1.8),lf=P(cx-45,cy+370,22,1.5),rk=P(cx+38,cy+284,22,1.8),rf=P(cx+45,cy+370,22,1.5);
  L(head,neck,55,.98,120);L(neck,chest,58,.98,120);L(chest,hip,93,.98,150);L(chest,ls,63,.94,82);L(ls,le,74,.92,72);L(le,lh,70,.9,65);L(chest,rs,63,.94,82);L(rs,re,74,.92,72);L(re,rh,70,.9,65);L(hip,lk,88,.95,95);L(lk,lf,88,.92,85);L(hip,rk,88,.95,95);L(rk,rf,88,.92,85);L(ls,rs,124,.82,150);L(lk,rk,76,.82,140);
  const shelfY=H-95, gap=Math.min(128,W/8.2),start=Math.max(70,(W-gap*6)/2);
  [['stapler',62,28,1.8],['mug',46,50,1.5],['scissors',65,30,1.2],['keyboard',105,38,2.5],['trophy',52,74,2.2],['chair',82,105,4],['extinguisher',42,105,3]].forEach((t,i)=>tools.push(new Tool(t[0],start+i*gap,shelfY,t[1],t[2],t[3])));
}

function integratePoint(p,dt){if(p.pinned)return;const vx=(p.x-p.px)*.992,vy=(p.y-p.py)*.992;p.px=p.x;p.py=p.y;p.x+=vx;p.y+=vy+1300*dt*dt;bounds(p,p.r,.34)}
function integrateTool(t,dt){if(t.held)return;const vx=(t.x-t.px)*.986,vy=(t.y-t.py)*.986,av=(t.angle-t.pa)*.98;t.px=t.x;t.py=t.y;t.pa=t.angle;t.x+=vx;t.y+=vy+1250*dt*dt;t.angle+=av;toolBounds(t);collideTool(t)}
function bounds(p,r,bounce){if(p.x<r){p.x=r;p.px=p.x+(p.x-p.px)*-bounce}if(p.x>W-r){p.x=W-r;p.px=p.x+(p.x-p.px)*-bounce}if(p.y<r){p.y=r;p.py=p.y+(p.y-p.py)*-bounce}if(p.y>H-58-r){p.y=H-58-r;p.py=p.y+(p.y-p.py)*-bounce;p.px+=(p.x-p.px)*.18}}
function toolBounds(t){const r=t.radius;if(t.x<r){t.x=r;t.px=t.x+(t.x-t.px)*-.5}if(t.x>W-r){t.x=W-r;t.px=t.x+(t.x-t.px)*-.5}if(t.y<r){t.y=r;t.py=t.y+(t.y-t.py)*-.5}if(t.y>H-58-r){t.y=H-58-r;t.py=t.y+(t.y-t.py)*-.46;t.px+=(t.x-t.px)*.12;t.pa-=.08}}
function collideTool(t){const tvx=t.x-t.px,tvy=t.y-t.py,speed=Math.hypot(tvx,tvy);for(const p of body){const dx=p.x-t.x,dy=p.y-t.y,d=Math.hypot(dx,dy)||1,min=p.r+t.radius*.72;if(d<min){const nx=dx/d,ny=dy/d,over=min-d;p.x+=nx*over*.72;p.y+=ny*over*.72;t.x-=nx*over*.28;t.y-=ny*over*.28;const hit=Math.min(50,speed*.9);p.impulse(tvx*.48,tvy*.48);t.px+=nx*hit*.08;t.py+=ny*hit*.08;if(speed>17){splash(p.x,p.y,Math.min(16,4+speed/3));statusEl.textContent=`${label(t.type)} impact`;for(const l of links){if(!l.broken&&(l.a===p||l.b===p)&&speed>29&&Math.random()<.18){l.broken=true;p.detached=true;splash(p.x,p.y,14)}}}}}}
function label(s){return s.toUpperCase()}
function splash(x,y,n){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=2+Math.random()*10;paint.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-3,r:2+Math.random()*7,life:1,stuck:false})}if(paint.length>420)paint.splice(0,paint.length-420)}
function updatePaint(dt){for(const q of paint){if(q.stuck)continue;q.vy+=900*dt;q.x+=q.vx;q.y+=q.vy;if(q.y>H-59){q.y=H-59;q.stuck=true}q.life=Math.max(.28,q.life-dt*.08)}}

function pointerPos(e){const r=canvas.getBoundingClientRect(),p=e.touches?e.touches[0]:e;return{x:p.clientX-r.left,y:p.clientY-r.top}}
function down(e){e.preventDefault();const p=pointerPos(e);pointer.x=pointer.lastX=p.x;pointer.y=pointer.lastY=p.y;pointer.down=true;grab=findGrab(p.x,p.y);if(grab){canvas.classList.add('dragging');if(grab.kind==='tool')grab.obj.held=true;statusEl.textContent=grab.kind==='tool'?`Holding ${label(grab.obj.type)}`:'Holding ragdoll';}}
function move(e){if(!pointer.down)return;e.preventDefault();const p=pointerPos(e);pointer.vx=p.x-pointer.x;pointer.vy=p.y-pointer.y;pointer.lastX=pointer.x;pointer.lastY=pointer.y;pointer.x=p.x;pointer.y=p.y;if(!grab)return;const o=grab.obj;if(grab.kind==='tool'){o.px=o.x-pointer.vx*1.6;o.py=o.y-pointer.vy*1.6;o.x=p.x;o.y=p.y;o.pa=o.angle;o.angle+=pointer.vx*.018}else{o.px=o.x-pointer.vx*1.4;o.py=o.y-pointer.vy*1.4;o.x=p.x;o.y=p.y}}
function up(){if(!pointer.down)return;pointer.down=false;canvas.classList.remove('dragging');if(grab){const o=grab.obj;if(grab.kind==='tool'){o.held=false;o.px=o.x-pointer.vx*2.5;o.py=o.y-pointer.vy*2.5}else{o.px=o.x-pointer.vx*2.2;o.py=o.y-pointer.vy*2.2}statusEl.textContent='Released. Cleaner is always available.'}grab=null}
function findGrab(x,y){let best=null,bd=Infinity;for(const t of tools){const d=Math.hypot(x-t.x,y-t.y);if(d<t.radius+18&&d<bd){best={kind:'tool',obj:t};bd=d}}for(const p of body){const d=Math.hypot(x-p.x,y-p.y);if(d<p.r+22&&d<bd){best={kind:'body',obj:p};bd=d}}return best}
canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);addEventListener('pointerup',up);canvas.addEventListener('touchstart',down,{passive:false});canvas.addEventListener('touchmove',move,{passive:false});addEventListener('touchend',up);
cleaner.addEventListener('click',resetScene);

faceInput.addEventListener('change',()=>{const f=faceInput.files&&faceInput.files[0];if(!f)return;if(f.size>5*1024*1024){statusEl.textContent='Face image must be under 5 MB.';return}const rd=new FileReader();rd.onload=()=>{faceImage=new Image();faceImage.onload=()=>statusEl.textContent='Custom face loaded.';faceImage.src=String(rd.result);try{localStorage.setItem('wac-face',String(rd.result))}catch{}};rd.readAsDataURL(f)});
resetFace.addEventListener('click',()=>{faceImage=null;localStorage.removeItem('wac-face');faceInput.value='';statusEl.textContent='Default face restored.'});

function drawOffice(){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#27313d');g.addColorStop(.62,'#151b23');g.addColorStop(.621,'#31343a');g.addColorStop(1,'#1e2025');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#0b1118';ctx.fillRect(W*.08,H*.11,W*.28,H*.3);ctx.strokeStyle='#58687c';ctx.lineWidth=5;ctx.strokeRect(W*.08,H*.11,W*.28,H*.3);ctx.fillStyle='#122536';ctx.fillRect(W*.095,H*.13,W*.25,H*.26);for(let i=0;i<7;i++){ctx.fillStyle=i%2?'#182f43':'#203a50';ctx.fillRect(W*.1+i*W*.035,H*.2+Math.sin(i)*12,W*.02,H*.19)}
  ctx.fillStyle='#10151c';ctx.fillRect(0,H-58,W,58);ctx.fillStyle='#252d38';ctx.fillRect(0,H-64,W,7);
  ctx.fillStyle='#1b222c';ctx.fillRect(W*.42,H*.12,W*.18,H*.14);ctx.strokeStyle='#566276';ctx.lineWidth=2;ctx.strokeRect(W*.42,H*.12,W*.18,H*.14);ctx.fillStyle='#d8dde4';ctx.font='800 16px Arial';ctx.fillText('QUARTERLY',W*.445,H*.17);ctx.fillStyle='#dc3540';ctx.fillRect(W*.45,H*.2,W*.12,8);
  const dg=ctx.createLinearGradient(0,H*.62,0,H*.88);dg.addColorStop(0,'#715038');dg.addColorStop(1,'#3c2a20');ctx.fillStyle=dg;roundRect(W*.08,H*.57,W*.48,H*.24,8);ctx.fill();ctx.strokeStyle='#15100d';ctx.lineWidth=5;ctx.stroke();ctx.fillStyle='#281c16';ctx.fillRect(W*.1,H*.8,W*.44,20);
}
function roundRect(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);return ctx}
function drawLinks(){ctx.lineCap='round';for(const l of links){if(l.broken)continue;ctx.strokeStyle='#2a3039';ctx.lineWidth=18;ctx.beginPath();ctx.moveTo(l.a.x,l.a.y);ctx.lineTo(l.b.x,l.b.y);ctx.stroke();ctx.strokeStyle='#4f5b69';ctx.lineWidth=11;ctx.stroke()}}
function drawBody(){drawLinks();const head=body[0];for(let i=1;i<body.length;i++){const p=body[i];const grad=ctx.createRadialGradient(p.x-p.r*.3,p.y-p.r*.4,2,p.x,p.y,p.r);grad.addColorStop(0,i===2||i===3?'#43546a':'#313c4b');grad.addColorStop(1,'#18202a');ctx.fillStyle=grad;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle=p.detached?'#8f1d25':'#0b0f14';ctx.lineWidth=4;ctx.stroke();}
  ctx.save();ctx.translate(head.x,head.y);const ang=Math.atan2(body[1].y-head.y,body[1].x-head.x)-Math.PI/2;ctx.rotate(ang);ctx.shadowColor='#000';ctx.shadowBlur=18;ctx.fillStyle='#d1a47f';ctx.beginPath();ctx.ellipse(0,0,38,45,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;if(faceImage&&faceImage.complete){ctx.save();ctx.beginPath();ctx.ellipse(0,0,34,41,0,0,Math.PI*2);ctx.clip();const ratio=Math.max(68/faceImage.width,82/faceImage.height),w=faceImage.width*ratio,h=faceImage.height*ratio;ctx.drawImage(faceImage,-w/2,-h/2,w,h);ctx.restore()}else{ctx.fillStyle='#111820';ctx.beginPath();ctx.arc(-13,-5,3.5,0,7);ctx.arc(13,-5,3.5,0,7);ctx.fill();ctx.strokeStyle='#6f2630';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,12,13,.15*Math.PI,.85*Math.PI);ctx.stroke();ctx.fillStyle='#1a1112';ctx.beginPath();ctx.arc(0,-31,39,Math.PI,0);ctx.lineTo(39,-5);ctx.quadraticCurveTo(10,-18,-38,-5);ctx.closePath();ctx.fill()}ctx.restore();
}
function drawTool(t){ctx.save();ctx.translate(t.x,t.y);ctx.rotate(t.angle);ctx.shadowColor='#000a';ctx.shadowBlur=10;ctx.shadowOffsetY=5;switch(t.type){case'stapler':ctx.fillStyle='#a51e28';roundRect(-31,-14,62,28,8).fill();ctx.fillStyle='#2c333c';ctx.fillRect(-26,8,52,8);break;case'mug':ctx.fillStyle='#d7dce2';roundRect(-19,-24,38,48,6).fill();ctx.strokeStyle='#d7dce2';ctx.lineWidth=7;ctx.beginPath();ctx.arc(20,0,14,-1.2,1.2);ctx.stroke();break;case'scissors':ctx.strokeStyle='#b9c4cf';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-27,-9);ctx.lineTo(28,12);ctx.moveTo(-27,9);ctx.lineTo(28,-12);ctx.stroke();ctx.strokeStyle='#b01d27';ctx.lineWidth=6;ctx.beginPath();ctx.arc(-30,-12,10,0,7);ctx.arc(-30,12,10,0,7);ctx.stroke();break;case'keyboard':ctx.fillStyle='#202832';roundRect(-52,-19,104,38,6).fill();ctx.fillStyle='#8793a1';for(let y=-11;y<=11;y+=11)for(let x=-43;x<=43;x+=12)ctx.fillRect(x,y,7,6);break;case'trophy':ctx.fillStyle='#d9a72e';ctx.beginPath();ctx.moveTo(-19,-35);ctx.lineTo(19,-35);ctx.lineTo(11,15);ctx.lineTo(-11,15);ctx.closePath();ctx.fill();ctx.fillRect(-4,13,8,30);ctx.fillRect(-20,39,40,9);break;case'chair':ctx.fillStyle='#343d4b';roundRect(-35,-50,70,65,13).fill();ctx.fillStyle='#202631';roundRect(-42,8,84,25,9).fill();ctx.strokeStyle='#222a34';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(0,28);ctx.lineTo(0,48);ctx.moveTo(0,48);ctx.lineTo(-35,58);ctx.moveTo(0,48);ctx.lineTo(35,58);ctx.stroke();break;case'extinguisher':ctx.fillStyle='#c51f2b';roundRect(-21,-52,42,104,15).fill();ctx.fillStyle='#202832';ctx.fillRect(-15,-62,30,15);ctx.strokeStyle='#202832';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(10,-55);ctx.quadraticCurveTo(38,-51,32,-24);ctx.stroke();break}ctx.restore()}
function drawPaint(){for(const q of paint){ctx.globalAlpha=Math.min(1,q.life);ctx.fillStyle='#bd1723';ctx.beginPath();ctx.arc(q.x,q.y,q.r,0,7);ctx.fill()}ctx.globalAlpha=1}
function render(){ctx.clearRect(0,0,W,H);drawOffice();drawPaint();for(const t of tools)drawTool(t);drawBody();if(grab){ctx.strokeStyle='#efb940aa';ctx.lineWidth=2;ctx.setLineDash([7,7]);ctx.beginPath();ctx.arc(grab.obj.x,grab.obj.y,(grab.obj.r||grab.obj.radius)+12,0,7);ctx.stroke();ctx.setLineDash([])}}
function frame(now){const dt=Math.min(.025,(now-last)/1000);last=now;for(const p of body)integratePoint(p,dt);for(let k=0;k<7;k++)for(const l of links)l.solve();for(const t of tools)integrateTool(t,dt);updatePaint(dt);render();requestAnimationFrame(frame)}
resize();requestAnimationFrame(frame);
