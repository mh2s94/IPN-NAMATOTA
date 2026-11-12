// ---------- letterSpacing polyfill (Safari / older browsers) ----------
(function(){const p=CanvasRenderingContext2D.prototype;if('letterSpacing' in p)return;
  const oF=p.fillText,oS=p.strokeText,oM=p.measureText,oSave=p.save,oRest=p.restore;
  Object.defineProperty(p,'letterSpacing',{get(){return(this._ls||0)+'px'},set(v){this._ls=parseFloat(v)||0}});
  p.save=function(){(this._st||(this._st=[])).push(this._ls||0);oSave.call(this)};
  p.restore=function(){if(this._st&&this._st.length)this._ls=this._st.pop();oRest.call(this)};
  p.measureText=function(s){const m=oM.call(this,s);return this._ls?{width:m.width+this._ls*s.length}:m};
  const wrap=fn=>function(s,x,y){const ls=this._ls||0;if(!ls)return fn.call(this,s,x,y);
    const tot=oM.call(this,s).width+ls*s.length,al=this.textAlign;
    let sx=al==='center'?x-tot/2:(al==='right'||al==='end')?x-tot:x;this.textAlign='left';
    for(const ch of s){fn.call(this,ch,sx,y);sx+=oM.call(this,ch).width+ls}this.textAlign=al};
  p.fillText=wrap(oF);p.strokeText=wrap(oS);
})();

// ---------- layout ----------
const SW=1080,SH=1920,DUR=15;
let W=SW,H=SH,SX=0,SY=0,SCALE=1,DPR=1,K=1;
const cv=document.getElementById('stage'),ctx=cv.getContext('2d');
const off=document.createElement('canvas'),oc=off.getContext('2d');
const off2=document.createElement('canvas'),oc2=off2.getContext('2d');
function layout(){
  const vw=cv.clientWidth||innerWidth,vh=cv.clientHeight||innerHeight;
  DPR=Math.min(2,window.devicePixelRatio||1);
  const land=vw/vh>0.75;
  SCALE=land?Math.min(vw/SW,vh/1520):Math.min(vw/SW,vh/SH);
  W=vw/SCALE;H=vh/SCALE;SX=(W-SW)/2;SY=land?H/2-1025:(H-SH)/2;
  cv.width=Math.round(vw*DPR);cv.height=Math.round(vh*DPR);
  K=Math.min(2,Math.max(0.5,SCALE*DPR));
  off.width=Math.ceil(SW*K);off.height=Math.ceil(SH*K);
  off2.width=Math.ceil(900*K);off2.height=Math.ceil(600*K);
}

const RED='#E30613',NAVY='#044878',DEEP='#02101D',CREAM='#F5F1EA',TEAL='#1FA9BE',ICE='#BFF3FF';
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const P=(t,a,b)=>clamp((t-a)/(b-a));
const lerp=(a,b,u)=>a+(b-a)*u;
const eOutExpo=u=>u>=1?1:1-Math.pow(2,-10*u);
const eInExpo=u=>u<=0?0:Math.pow(2,10*u-10);
const eIO=u=>u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;
const eOut3=u=>1-Math.pow(1-u,3);
const eIn3=u=>u*u*u;
const eOutBack=(u,s=1.9)=>1+(s+1)*Math.pow(u-1,3)+s*Math.pow(u-1,2);
const eIOExpo=u=>u<=0?0:u>=1?1:u<.5?Math.pow(2,20*u-10)/2:(2-Math.pow(2,-20*u+10))/2;
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const img={};
function load(n,src){return new Promise((r,j)=>{const i=new Image();i.onload=()=>{img[n]=i;r()};i.onerror=j;i.src=src})}
const grains=[];
function makeGrain(){const R=rng(7);for(let k=0;k<4;k++){const g=document.createElement('canvas');g.width=360;g.height=640;const gc=g.getContext('2d');const d=gc.createImageData(360,640);for(let i=0;i<d.data.length;i+=4){const v=R()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}gc.putImageData(d,0,0);grains.push(g)}}
function font(c,f){c.font=f}
function revealText(c,txt,x,y,f,col,u,opt={}){
  if(u<=0)return;const lh=opt.lh||100,align=opt.align||'left';
  c.save();font(c,f);c.textAlign=align;c.textBaseline='alphabetic';c.letterSpacing=(opt.ls||0)+'px';
  const w=c.measureText(txt).width+40;let x0=align==='left'?x-10:align==='center'?x-w/2:x-w+10;
  c.beginPath();c.rect(x0,y-lh*1.02,w+20,lh*1.3);c.clip();
  const e=eOutExpo(u);c.fillStyle=col;c.globalAlpha=opt.alpha??1;c.fillText(txt,x,y+(1-e)*lh*1.15);c.restore();
}
function typeText(c,txt,x,y,f,col,u,opt={}){
  if(u<=0)return;const n=Math.floor(txt.length*clamp(u)+0.0001);
  c.save();font(c,f);c.textAlign=opt.align||'left';c.letterSpacing=(opt.ls||0)+'px';c.fillStyle=col;c.globalAlpha=opt.alpha??1;
  const s=txt.slice(0,n);c.fillText(s,x,y);
  if(u<1&&opt.cursor!==false){const w=c.measureText(s).width;const ax=(opt.align==='center')?x+w/2:x+w;const fs=parseInt(f);c.fillRect(ax+4,y-fs*0.78,fs*0.55,fs*0.9)}
  c.restore();
}
function ichthys(c,x,y,s,ang,lw,col,alpha=1){
  c.save();c.translate(x,y);c.rotate(ang);c.scale(s,s);c.beginPath();
  c.moveTo(-1,-0.55);c.quadraticCurveTo(0.05,0.95,1,0);c.moveTo(-1,0.55);c.quadraticCurveTo(0.05,-0.95,1,0);
  c.lineWidth=lw/s;c.strokeStyle=col;c.globalAlpha=alpha;c.lineCap='round';c.lineJoin='round';c.stroke();c.restore();
}

// ---------- backgrounds (full viewport) ----------
const bubbles=[];{const R=rng(3);for(let i=0;i<150;i++)bubbles.push({x:R(),y:R(),r:0.8+R()*3.6,v:30+R()*90,a:0.08+R()*0.35,w:R()*6})}
function oceanBG(c,t){
  const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#06345A');g.addColorStop(0.45,'#03203A');g.addColorStop(1,DEEP);
  c.fillStyle=g;c.fillRect(0,0,W,H);
  c.save();c.globalCompositeOperation='lighter';
  const nR=Math.max(6,Math.round(W/180));
  for(let i=0;i<nR;i++){const ang=-0.35+(i/(nR-1))*0.7+Math.sin(t*0.6+i*1.7)*0.05;
    c.save();c.translate(W*0.5+(i-(nR-1)/2)*120,-120);c.rotate(ang);
    const rg=c.createLinearGradient(0,0,0,H*1.1);rg.addColorStop(0,'rgba(120,210,235,0.10)');rg.addColorStop(1,'rgba(120,210,235,0)');
    c.fillStyle=rg;const bw=50+((i*37)%70);c.fillRect(-bw/2,0,bw,H*1.3);c.restore()}
  c.restore();
  c.save();c.fillStyle='#CFF5FF';
  for(const b of bubbles){const y=((b.y*H-t*b.v)%H+H)%H;const x=b.x*W+Math.sin(t*1.3+b.w)*8;c.globalAlpha=b.a;c.beginPath();c.arc(x,y,b.r,0,7);c.fill()}
  c.restore();
}
function navyBG(c,t){
  const g=c.createRadialGradient(W*0.5,H*0.42,50,W*0.5,H*0.5,Math.max(W,H)*0.8);g.addColorStop(0,'#0A3C66');g.addColorStop(1,'#021426');
  c.fillStyle=g;c.fillRect(0,0,W,H);
  c.save();c.strokeStyle='rgba(160,210,255,0.05)';c.lineWidth=1;
  const gx0=((SX+60)%120+120)%120;
  for(let x=gx0;x<W;x+=120){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke()}
  for(let y=(t*20)%120;y<H;y+=120){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}
  c.restore();
}
function brackets(c,a){
  if(a<=0)return;c.save();c.globalAlpha=a;c.strokeStyle='rgba(255,255,255,0.55)';c.lineWidth=3;const m=54,L=54;
  [[m,m,1,1],[W-m,m,-1,1],[m,H-m,1,-1],[W-m,H-m,-1,-1]].forEach(([x,y,sx,sy])=>{c.beginPath();c.moveTo(x,y+sy*L);c.lineTo(x,y);c.lineTo(x+sx*L,y);c.stroke()});c.restore();
}
function hud(c,t,a,idx){
  if(a<=0)return;c.save();c.globalAlpha=a;font(c,'26px IDM');c.letterSpacing='6px';c.fillStyle='rgba(255,255,255,0.85)';c.textAlign='left';
  c.fillText('PT. INDUSTRI PERIKANAN NAMATOTA',96,124);
  c.textAlign='right';font(c,'26px Mono');c.letterSpacing='2px';c.fillStyle=RED;c.fillText('●',W-96-150,124);
  c.fillStyle='rgba(255,255,255,0.85)';c.fillText(idx,W-96,124);c.restore();
}

// ---------- SCENE 1 ----------
function scene1(c,t){
  oceanBG(c,t);
  c.save();c.translate(SX,SY);
  const cy=980;const lu=eOutExpo(P(t,0.15,0.9));const lw=820*lu;
  c.fillStyle=RED;c.fillRect(SW/2-lw/2,cy+40,lw,8);
  typeText(c,'PULAU',SW/2,cy-250,'34px IDM','rgba(255,255,255,0.9)',P(t,0.35,0.75),{align:'center',ls:22,cursor:false});
  const word='NAMATOTA';const ru=eOutExpo(P(t,0.3,1.1));const ty=cy+(1-ru)*250;
  c.save();c.beginPath();c.rect(0,cy-260,SW,300);c.clip();
  font(c,'180px IDB');c.letterSpacing='-3px';c.textAlign='center';c.lineWidth=3;c.strokeStyle='rgba(255,255,255,0.9)';c.strokeText(word,SW/2,ty);c.restore();
  const fu=eIO(P(t,0.75,1.9));
  if(fu>0){
    oc.setTransform(K,0,0,K,0,0);oc.clearRect(0,0,SW,SH);
    const top=cy-138,bot=cy+5;const level=lerp(bot+20,top-30,fu);
    const wg=oc.createLinearGradient(0,top,0,bot);wg.addColorStop(0,'#FFFFFF');wg.addColorStop(0.5,'#BFF0FA');wg.addColorStop(1,TEAL);
    oc.fillStyle=wg;oc.beginPath();oc.moveTo(0,SH);
    for(let x=0;x<=SW;x+=10)oc.lineTo(x,level+Math.sin(x/70+t*7)*10*(1-fu*0.6)+Math.sin(x/31-t*5)*4);
    oc.lineTo(SW,SH);oc.closePath();oc.fill();
    oc.save();oc.globalCompositeOperation='destination-in';font(oc,'180px IDB');oc.letterSpacing='-3px';oc.textAlign='center';oc.fillStyle='#fff';oc.fillText(word,SW/2,ty);oc.restore();
    c.save();c.beginPath();c.rect(0,cy-260,SW,300);c.clip();c.drawImage(off,0,0,SW,SH);c.restore();
  }
  typeText(c,'KAIMANA  ·  PAPUA BARAT',SW/2,cy+130,'38px IDM','#fff',P(t,0.9,1.6),{align:'center',ls:10});
  c.save();c.globalAlpha=eOut3(P(t,1.2,1.7));font(c,'24px Mono');c.fillStyle='rgba(255,255,255,0.55)';c.textAlign='center';c.letterSpacing='4px';
  c.fillText('TELUK TRITON — LAUT ARAFURA',SW/2,cy+200);c.restore();
  c.restore();
}

// ---------- SCENE 2 ----------
function photoView(t){const u=eIO(P(t,2.0,6.4));const z=lerp(1.06,1.30,u);const S=Math.max(W/1159,H/2576)*z;
  const half=H/2/S;let cy=lerp(1040,1330,u);cy=clamp(cy,half,2576-half);return{S,cy}}
function p2s(v,px,py){return[W/2+(px-579.5)*v.S,H/2+(py-v.cy)*v.S]}
function callout(c,t,t0,px,py,v,label,dir){
  const[x,y]=p2s(v,px,py);const a=P(t,t0,t0+0.25);if(a<=0)return;
  if(x<-50||x>W+50||y<-50||y>H+50)return;
  c.save();
  for(let k=0;k<2;k++){const ph=((t-t0)*1.1+k*0.5)%1;c.globalAlpha=(1-ph)*0.8*a;c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();c.arc(x,y,10+ph*46,0,7);c.stroke()}
  c.globalAlpha=1;c.fillStyle=RED;c.beginPath();c.arc(x,y,11*eOutBack(a),0,7);c.fill();c.strokeStyle='#fff';c.lineWidth=4;c.stroke();
  const lu=eOutExpo(P(t,t0+0.15,t0+0.7));const dx=dir*90,dy=-110,hl=dir*170;const p1=[x+dx,y+dy],p2=[x+dx+hl,y+dy];
  c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();c.moveTo(x,y);
  const L1=Math.hypot(dx,dy),L2=Math.abs(hl),tot=(L1+L2)*lu;
  if(tot<=L1)c.lineTo(x+dx*tot/L1,y+dy*tot/L1);else{c.lineTo(p1[0],p1[1]);c.lineTo(p1[0]+hl*(tot-L1)/L2,p1[1])}
  c.stroke();
  const la=eOutExpo(P(t,t0+0.45,t0+0.95));
  if(la>0){font(c,'30px IDBold');c.letterSpacing='3px';const tw=c.measureText(label).width;const bw=tw+44,bh=58;
    const bx=dir>0?p2[0]:p2[0]-bw,by=p2[1]-bh/2;
    c.save();c.beginPath();c.rect(bx-2,by-2,(bw+4)*la,bh+4);c.clip();
    c.fillStyle='rgba(2,16,29,0.82)';c.fillRect(bx,by,bw,bh);c.fillStyle=RED;c.fillRect(dir>0?bx:bx+bw-6,by,6,bh);
    c.fillStyle='#fff';c.textAlign='left';c.fillText(label,bx+22+(dir>0?4:-4),by+40);c.restore()}
  c.restore();
}
function scene2(c,t){
  const v=photoView(t);
  if(!img.photo){const g0=c.createLinearGradient(0,0,0,H);g0.addColorStop(0,'#0E5A6E');g0.addColorStop(1,'#04304F');c.fillStyle=g0;c.fillRect(0,0,W,H)}
  else c.drawImage(img.photo,W/2-579.5*v.S,H/2-v.cy*v.S,1159*v.S,2576*v.S);
  c.save();c.globalCompositeOperation='multiply';c.fillStyle='rgba(30,70,110,0.18)';c.fillRect(0,0,W,H);c.restore();
  c.save();c.globalAlpha=P(t,2.4,3.0);
  const g=c.createLinearGradient(0,H*0.5,0,H);g.addColorStop(0,'rgba(2,16,29,0)');g.addColorStop(1,'rgba(2,16,29,0.92)');c.fillStyle=g;c.fillRect(0,0,W,H);
  const g2=c.createLinearGradient(0,0,0,300);g2.addColorStop(0,'rgba(2,16,29,0.6)');g2.addColorStop(1,'rgba(2,16,29,0)');c.fillStyle=g2;c.fillRect(0,0,W,300);
  c.restore();
  callout(c,t,3.35,900,1290,v,'DERMAGA & PABRIK',-1);
  callout(c,t,3.85,175,1110,v,'KAPAL NELAYAN',1);
  c.save();c.translate(SX,SY);
  const by=1600;const ra=eOutExpo(P(t,2.75,3.25));c.fillStyle=RED;c.fillRect(96,by-150,70*ra,6);
  typeText(c,'01 — LOKASI',186,by-136,'26px Mono','rgba(255,255,255,0.85)',P(t,2.8,3.2),{ls:4});
  revealText(c,'Pulau Namatota',92,by,'108px IDB','#fff',P(t,2.9,3.6),{lh:110,ls:-2});
  revealText(c,'Kaimana, Papua Barat',96,by+82,'54px IDM','rgba(255,255,255,0.85)',P(t,3.05,3.75),{lh:60});
  c.restore();
}

// ---------- SCENE 3 ----------
const school=[];{const R=rng(11);for(let i=0;i<70;i++)school.push({r:140+R()*340,ph:R()*6.28,w:(0.45+R()*0.35),sq:0.55+R()*0.35,s:14+R()*22,red:R()<0.14,a:0.18+R()*0.45,n:R()*10,cy:-120+R()*240,d:R()*0.35})}
const species=['CAKALANG','TUNA','KAKAP','TENGGIRI','BAWAL'];const spT=[6.55,7.1,7.65,8.2,8.75];
function scene3(c,t,exitU=0){
  navyBG(c,t);
  const cx=SX+SW*0.6+Math.max(0,(W-SW)*0.12),cyy=SY+1150;const wide=W>SW*1.2?1.35:1;
  for(const f of school){
    const th=f.ph+t*f.w;let x=cx+Math.cos(th)*f.r*wide,y=cyy+f.cy+Math.sin(th)*f.r*f.sq+Math.sin(t*2+f.n)*14;
    let ang=Math.atan2(Math.cos(th)*f.r*f.sq,-Math.sin(th)*f.r*wide);
    const ex=eInExpo(clamp((exitU-f.d)/0.65));if(ex>0){x+=ex*(W*0.8+900);ang=lerp(ang,0,Math.min(1,ex*3))}
    const intro=eOut3(P(t,6.0+f.d,6.8+f.d));if(intro<=0)continue;
    const col=f.red?RED:'#DDF6FF';
    if(ex>0.02)for(let k=1;k<4;k++)ichthys(c,x-k*ex*60,y,f.s,ang,3,col,f.a*intro*(0.3/k));
    ichthys(c,x,y,f.s*intro,ang,f.red?4:3,col,f.a*intro);
  }
  const oa=1-eOut3(exitU);
  c.save();c.globalAlpha=oa;c.translate(SX,SY-eIn3(exitU)*120);
  c.fillStyle=RED;c.fillRect(96,350,70*eOutExpo(P(t,6.2,6.7)),6);
  typeText(c,'02 — HASIL TANGKAPAN',186,364,'26px Mono','rgba(255,255,255,0.85)',P(t,6.25,6.7),{ls:4});
  revealText(c,'Kekayaan laut',92,470,'84px IDB','#fff',P(t,6.3,6.9),{lh:90});
  revealText(c,'nelayan Namatota',92,560,'84px IDB','rgba(255,255,255,0.55)',P(t,6.4,7.0),{lh:90});
  let k=0;for(let i=1;i<spT.length;i++)k+=eOutExpo(P(t,spT[i]-0.05,spT[i]+0.45));
  c.save();c.beginPath();c.rect(0,700,SW,820);c.clip();
  for(let j=0;j<species.length;j++){
    const d=j-k;if(Math.abs(d)>2.2)continue;
    const appear=eOutExpo(P(t,spT[0]-0.1+j*0.04,spT[0]+0.5+j*0.04));
    const y=1160+d*185+(1-appear)*200;const s=1-Math.min(Math.abs(d),2)*0.38;const act=1-Math.min(1,Math.abs(d));
    c.save();c.translate(96,y);c.scale(s,s);font(c,'150px IDB');c.letterSpacing='-3px';c.textAlign='left';
    c.globalAlpha=oa*appear*(1-Math.min(Math.abs(d),2)*0.4);
    c.lineWidth=2.5/s;c.strokeStyle='rgba(255,255,255,0.7)';c.strokeText(species[j],0,0);
    c.fillStyle=`rgba(255,255,255,${act})`;c.fillText(species[j],0,0);c.restore();
  }
  c.restore();
  const ma=eOutExpo(P(t,spT[0],spT[0]+0.4));c.fillStyle=RED;c.fillRect(56,1052,10,120*ma);
  const idx=Math.min(4,Math.round(k));
  c.save();font(c,'30px Mono');c.fillStyle='rgba(255,255,255,0.8)';c.textAlign='right';c.letterSpacing='3px';c.globalAlpha=ma*oa;
  c.fillText('0'+(idx+1)+' / 05',SW-96,1700);c.restore();
  for(let j=0;j<5;j++){c.fillStyle=j===idx?RED:'rgba(255,255,255,0.3)';c.fillRect(96+j*46,1686,34,j===idx?8:4)}
  c.restore();
}

// ---------- SCENE 4 ----------
let nowT=0;
function drawSegs(c,segs,u){let tot=0;const ls=segs.map(s=>{const l=Math.hypot(s[2]-s[0],s[3]-s[1]);tot+=l;return l});let rem=tot*clamp(u);
  c.beginPath();for(let i=0;i<segs.length&&rem>0;i++){const s=segs[i],f=Math.min(1,rem/ls[i]);c.moveTo(s[0],s[1]);c.lineTo(lerp(s[0],s[2],f),lerp(s[1],s[3],f));rem-=ls[i]}c.stroke()}
function iconBoat(c,x,y,u,col){c.save();c.translate(x,y);c.strokeStyle=col;c.lineWidth=6;c.lineCap='round';c.lineJoin='round';
  drawSegs(c,[[-46,8,46,8],[46,8,30,32],[30,32,-30,32],[-30,32,-46,8],[0,8,0,-40],[0,-40,30,-12],[30,-12,0,-12]],u);
  c.beginPath();for(let i=-50;i<=50;i+=4)c.lineTo(i,46+Math.sin(i/8+nowT*6)*3);c.globalAlpha=u;c.stroke();c.restore()}
function iconFactory(c,x,y,u,col){c.save();c.translate(x,y);c.strokeStyle=col;c.lineWidth=6;c.lineCap='round';c.lineJoin='round';
  drawSegs(c,[[-46,40,46,40],[46,40,46,-6],[46,-6,22,10],[22,10,22,-6],[22,-6,-2,10],[-2,10,-2,-6],[-2,-6,-26,10],[-26,10,-26,-40],[-26,-40,-40,-40],[-40,-40,-40,40],[-40,40,-46,40]],u);c.restore()}
function iconSnow(c,x,y,u,col,rot){c.save();c.translate(x,y);c.rotate(rot);c.strokeStyle=col;c.lineWidth=6;c.lineCap='round';
  for(let k=0;k<6;k++){c.save();c.rotate(k*Math.PI/3);const L=44*eOut3(clamp(u*1.4-k*0.06));c.beginPath();c.moveTo(0,0);c.lineTo(0,-L);
    if(L>24){c.moveTo(0,-26);c.lineTo(-12,-38);c.moveTo(0,-26);c.lineTo(12,-38)}c.stroke();c.restore()}c.restore()}
const flakes=[];{const R=rng(21);for(let i=0;i<130;i++)flakes.push({x:R(),y:R(),s:1+R()*3,v:40+R()*80,ph:R()*6})}
function scene4(c,t){
  navyBG(c,t);nowT=t;
  const fr=eIO(P(t,11.1,11.9));
  if(fr>0){c.save();const gx=SX+SW*0.3,gy=SY+1400;const g=c.createRadialGradient(gx,gy,50,gx,gy,1400);g.addColorStop(0,'rgba(150,230,255,0.35)');g.addColorStop(1,'rgba(150,230,255,0)');
    c.globalAlpha=fr;c.fillStyle=g;c.fillRect(0,0,W,H);c.fillStyle='#E8FBFF';
    for(const f of flakes){const y=(f.y*H+t*f.v)%H;c.globalAlpha=fr*0.6;c.beginPath();c.arc(f.x*W+Math.sin(t+f.ph)*10,y,f.s,0,7);c.fill()}c.restore()}
  c.save();c.translate(SX,SY);
  c.fillStyle=RED;c.fillRect(96,350,70*eOutExpo(P(t,9.85,10.3)),6);
  typeText(c,'03 — ALUR PRODUKSI',186,364,'26px Mono','rgba(255,255,255,0.85)',P(t,9.9,10.3),{ls:4});
  revealText(c,'Dari laut,',92,470,'84px IDB','#fff',P(t,9.95,10.5),{lh:90});
  revealText(c,'menjadi ikan beku.',92,560,'84px IDB','rgba(255,255,255,0.55)',P(t,10.05,10.6),{lh:90});
  const nodes=[{y:860,t:10.15,ttl:'NELAYAN LOKAL',sub:'Hasil tangkapan dari perairan Kaimana',ic:'boat'},
               {y:1170,t:10.6,ttl:'PENGOLAHAN',sub:'Diproses di Pulau Namatota',ic:'fac'},
               {y:1480,t:11.05,ttl:'IKAN BEKU',sub:'Komoditas utama perusahaan',ic:'snow'}];
  const X=210,y0=nodes[0].y,y1=nodes[2].y;const lu=eIO(P(t,10.2,11.15));
  c.save();c.strokeStyle='rgba(255,255,255,0.18)';c.lineWidth=4;c.setLineDash([2,14]);c.lineCap='round';c.beginPath();c.moveTo(X,y0);c.lineTo(X,y1);c.stroke();c.restore();
  c.fillStyle=RED;c.fillRect(X-3,y0,6,(y1-y0)*lu);
  if(lu>0&&lu<1){const yy=y0+(y1-y0)*lu;const gg=c.createRadialGradient(X,yy,0,X,yy,40);gg.addColorStop(0,'rgba(255,90,90,0.9)');gg.addColorStop(1,'rgba(255,90,90,0)');c.fillStyle=gg;c.fillRect(X-40,yy-40,80,80)}
  for(const n of nodes){
    const u=P(t,n.t,n.t+0.5);if(u<=0)continue;const e=eOutBack(u,1.6);const iceN=n.ic==='snow'&&fr>0.5;
    c.save();c.translate(X,n.y);c.scale(e,e);c.fillStyle=iceN?'#E9FBFF':'#0B3B62';c.beginPath();c.arc(0,0,92,0,7);c.fill();
    c.lineWidth=5;c.strokeStyle=iceN?ICE:'rgba(255,255,255,0.9)';c.stroke();c.restore();
    const iu=P(t,n.t+0.1,n.t+0.8);const col=iceN?NAVY:'#fff';
    if(n.ic==='boat')iconBoat(c,X,n.y-4,iu,col);if(n.ic==='fac')iconFactory(c,X,n.y,iu,col);if(n.ic==='snow')iconSnow(c,X,n.y,iu,col,t*0.8);
    const pu=P(t,n.t,n.t+0.9);if(pu>0&&pu<1){c.save();c.globalAlpha=(1-pu)*0.7;c.strokeStyle=n.ic==='snow'?ICE:RED;c.lineWidth=4;c.beginPath();c.arc(X,n.y,92+pu*70,0,7);c.stroke();c.restore()}
    revealText(c,n.ttl,X+140,n.y+6,'62px IDB','#fff',P(t,n.t+0.12,n.t+0.7),{lh:66,ls:1});
    revealText(c,n.sub,X+142,n.y+58,'32px IDM','rgba(255,255,255,0.7)',P(t,n.t+0.22,n.t+0.8),{lh:40});
  }
  c.restore();
}

// ---------- SCENE 5 ----------
function staggerText(c,txt,cx,y,f,col,t,t0,st,ls){
  c.save();font(c,f);c.letterSpacing=ls+'px';c.textAlign='left';
  const total=c.measureText(txt).width-ls;let x=cx-total/2;
  for(let i=0;i<txt.length;i++){const ch=txt[i];const w=c.measureText(ch).width;const u=P(t,t0+i*st,t0+i*st+0.5);
    if(u>0){const e=eOutExpo(u);c.globalAlpha=clamp(u*2.5);c.fillStyle=col;c.fillText(ch,x,y+(1-e)*40)}x+=w}
  c.restore();
}
function scene5(c,t){
  c.fillStyle=CREAM;c.fillRect(0,0,W,H);
  c.save();c.globalAlpha=0.035;c.fillStyle=NAVY;c.beginPath();c.moveTo(0,H);for(let x=0;x<=W;x+=10)c.lineTo(x,H-220+Math.sin(x/90+t*1.5)*18);c.lineTo(W,H);c.fill();c.restore();
  c.save();c.translate(SX,SY);
  const push=lerp(1,1.035,eOut3(P(t,12.4,15)));
  c.save();c.translate(SW/2,840);c.scale(push,push);
  const LS=1.12,lw=744*LS,lh=503*LS;c.translate(-lw/2,-lh/2);
  const wu=eOutExpo(P(t,12.45,13.15));
  if(wu>0&&img.waves){c.save();c.beginPath();c.rect(0,0,lw*wu,lh);c.clip();c.drawImage(img.waves,(1-wu)*-80,0,lw,lh);c.restore()}
  const fu=eIO(P(t,12.6,13.35));
  if(fu>0&&img.fish){
    const fcx=395*LS,fcy=178*LS;
    if(fu>=1)c.drawImage(img.fish,0,0,lw,lh);
    else{oc2.setTransform(K,0,0,K,0,0);oc2.clearRect(0,0,900,600);oc2.globalCompositeOperation='source-over';oc2.drawImage(img.fish,0,0,lw,lh);
      oc2.globalCompositeOperation='destination-in';oc2.beginPath();oc2.moveTo(fcx,fcy);oc2.arc(fcx,fcy,900,Math.PI,Math.PI+fu*Math.PI*2+0.001);oc2.closePath();oc2.fill();
      oc2.globalCompositeOperation='source-over';c.drawImage(off2,0,0,900,600);
      const a=Math.PI+fu*Math.PI*2;c.save();c.strokeStyle='rgba(227,6,19,0.35)';c.lineWidth=2;c.beginPath();c.moveTo(fcx,fcy);c.lineTo(fcx+Math.cos(a)*420,fcy+Math.sin(a)*240);c.stroke();c.restore()}
  }
  const tu=P(t,13.15,13.6);
  if(tu>0&&img.text){const s=eOutBack(tu,2.2);const tcx=430*LS,tcy=178*LS;c.save();c.translate(tcx,tcy);c.scale(s,s);c.translate(-tcx,-tcy);c.globalAlpha=clamp(tu*3);c.drawImage(img.text,0,0,lw,lh);c.restore()}
  c.restore();
  staggerText(c,'PT. INDUSTRI PERIKANAN',SW/2,1260,'50px PopB',NAVY,t,13.45,0.022,6);
  staggerText(c,'NAMATOTA',SW/2,1395,'128px PopB',NAVY,t,13.6,0.045,10);
  const du=eOutExpo(P(t,13.9,14.5));c.fillStyle=RED;c.fillRect(SW/2-180*du,1450,360*du,6);
  c.save();c.globalAlpha=eOut3(P(t,14.1,14.6));font(c,'32px IDM');c.letterSpacing='10px';c.textAlign='center';c.fillStyle='rgba(4,72,120,0.75)';
  c.fillText('KAIMANA  ·  PAPUA BARAT',SW/2,1530);c.restore();
  c.restore();
}

// ---------- master ----------
function waveEdgePath(c,level,t,amp,freq,speed){c.beginPath();c.moveTo(0,H+10);for(let x=0;x<=W;x+=8)c.lineTo(x,level+Math.sin(x/freq+t*speed)*amp+Math.sin(x/(freq*0.43)-t*speed*1.3)*amp*0.35);c.lineTo(W,H+10);c.closePath()}
function render(t){
  ctx.setTransform(SCALE*DPR,0,0,SCALE*DPR,0,0);ctx.save();
  if(t<2.75){
    const tu=eIO(P(t,2.05,2.7));
    ctx.save();ctx.translate(0,-tu*260);scene1(ctx,t);ctx.restore();
    if(t>=2.05){const level=lerp(H+80,-120,tu);
      ctx.save();waveEdgePath(ctx,level,t,26,110,7);ctx.clip();scene2(ctx,t);ctx.restore();
      ctx.save();waveEdgePath(ctx,level,t,26,110,7);ctx.strokeStyle='rgba(255,255,255,0.9)';ctx.lineWidth=5;ctx.stroke();ctx.restore()}
  }else if(t<6.45){
    scene2(ctx,t);const u=P(t,5.85,6.45);
    if(u>0){const e1=eIOExpo(clamp(u*1.25)),e2=eIOExpo(clamp(u*1.25-0.22));const sk=H*0.36;
      const poly=e=>{const x=lerp(-sk-60,W+60,e);ctx.beginPath();ctx.moveTo(-sk-60,0);ctx.lineTo(x+sk,0);ctx.lineTo(x,H);ctx.lineTo(-sk-60,H);ctx.closePath()};
      ctx.save();poly(e1);ctx.fillStyle=RED;ctx.fill();ctx.restore();ctx.save();poly(e2);ctx.clip();scene3(ctx,t,0);ctx.restore()}
  }else if(t<9.95){
    scene3(ctx,t,P(t,9.15,9.8));const u=P(t,9.4,9.95);
    if(u>0){const e1=eIOExpo(clamp(u*1.25)),e2=eIOExpo(clamp(u*1.25-0.22));const sk=Math.min(420,W*0.4);
      const poly=e=>{const y=lerp(H+sk+60,-60,e);ctx.beginPath();ctx.moveTo(0,H+sk+60);ctx.lineTo(0,y);ctx.lineTo(W,y-sk);ctx.lineTo(W,H+sk+60);ctx.closePath()};
      ctx.save();poly(e1);ctx.fillStyle=RED;ctx.fill();ctx.restore();ctx.save();poly(e2);ctx.clip();scene4(ctx,t);ctx.restore()}
  }else if(t<12.75){
    scene4(ctx,t);const u=P(t,11.95,12.75);
    if(u>0)for(const[col,d]of[[NAVY,0],[TEAL,0.12],[CREAM,0.24]]){const e=eIO(clamp((u-d)/0.76));if(e<=0)continue;const level=lerp(H+60,-140,e);
      if(col===CREAM){ctx.save();waveEdgePath(ctx,level,t,30,95,6);ctx.clip();scene5(ctx,t);ctx.restore()}
      else{ctx.save();waveEdgePath(ctx,level,t+d*3,30,95,6);ctx.fillStyle=col;ctx.fill();ctx.restore()}}
  }else scene5(ctx,t);
  const ha=P(t,2.5,2.9)*(1-P(t,11.95,12.3));
  brackets(ctx,ha*0.9);hud(ctx,t,ha,t<6.1?'01 / 03':t<9.7?'02 / 03':'03 / 03');
  const light=t>12.6;
  const vg=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*0.32,W/2,H/2,Math.max(W,H)*0.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,light?'rgba(60,40,20,0.13)':'rgba(0,8,16,0.5)');
  ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  ctx.globalCompositeOperation='overlay';ctx.globalAlpha=light?0.05:0.08;
  const g=grains[Math.floor(t*30)%4];for(let gx=0;gx<W;gx+=540)for(let gy=0;gy<H;gy+=960)ctx.drawImage(g,gx,gy,540,960);
  ctx.restore();
}

// ---------- playback + audio ----------
// Browsers block sound until the visitor interacts. We try to autoplay with sound;
// if blocked, the first tap/click/key anywhere turns the music on, in sync.
const AUDIO_SRC='assets/audio/soundtrack.mp3';
const audio=new Audio(AUDIO_SRC);
// load the track into memory so it can always seek (works on any host, even without HTTP range support)
fetch(AUDIO_SRC).then(r=>r.blob()).then(bl=>{const wasPlaying=!audio.paused;audio.src=URL.createObjectURL(bl);audio.load();if(wasPlaying)syncAudio()}).catch(()=>{});audio.preload='auto';audio.addEventListener('loadedmetadata',()=>fixDrift(0.08));audio.addEventListener('playing',()=>fixDrift(0.08));audio.setAttribute('playsinline','');
let start=0,playing=false,curT=0,raf=0;
let wantSound=true,unlocked=false;
const btnS=document.getElementById('sound'),btnR=document.getElementById('replay'),hint=document.getElementById('hint');
function setIcon(on){document.getElementById('icoOn').style.display=on?'':'none';document.getElementById('icoOff').style.display=on?'none':'';
  btnS.setAttribute('aria-label',on?'Matikan suara':'Nyalakan suara')}
function showHint(v){if(hint)hint.classList.toggle('show',v)}
function clockT(){return Math.min(DUR,(performance.now()-start)/1000)}
function syncAudio(){
  if(!wantSound){audio.pause();return Promise.resolve(false)}
  const t=playing===true?clockT():curT;
  if(t>=DUR-0.05){audio.pause();return Promise.resolve(true)}
  try{audio.currentTime=t}catch(e){}
  const p=audio.play();
  return (p&&p.then?p:Promise.resolve()).then(()=>{unlocked=true;fixDrift(0.08);setIcon(true);showHint(false);return true})
    .catch(()=>{setIcon(false);if(playing===true)showHint(true);return false});
}
function fixDrift(tol){if(audio.paused||playing!==true)return;const t=clockT();if(t<DUR-0.1&&Math.abs(audio.currentTime-t)>tol){try{audio.currentTime=t}catch(e){}}}
let fd=0;
function frame(now){curT=clockT();render(curT);if(++fd%15===0)fixDrift(0.12);
  if(curT<DUR)raf=requestAnimationFrame(frame);else{playing=false;btnR.classList.add('pulse');showHint(false)}}
function play(from=0){cancelAnimationFrame(raf);start=performance.now()-from*1000;curT=from;playing=true;btnR.classList.remove('pulse');raf=requestAnimationFrame(frame);syncAudio()}
function unlockAnywhere(e){
  if(unlocked||!wantSound)return;
  if(e.target&&e.target.closest&&e.target.closest('.ctrl'))return; // buttons handle themselves
  syncAudio();
}
['pointerdown','touchend','keydown'].forEach(ev=>addEventListener(ev,unlockAnywhere,{passive:true}));
btnS.addEventListener('click',()=>{
  if(!unlocked&&wantSound){syncAudio();return}       // first gesture: turn sound on
  wantSound=!wantSound;
  if(wantSound){syncAudio()}else{audio.pause();setIcon(false);showHint(false)}
});
btnR.addEventListener('click',()=>{play(0)});
let rz=0;addEventListener('resize',()=>{cancelAnimationFrame(rz);rz=requestAnimationFrame(()=>{layout();if(playing!==true)render(curT)})});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){if(playing===true){curT=clockT();cancelAnimationFrame(raf);audio.pause();playing='paused'}}
  else if(playing==='paused'){play(curT)}});

window.ready=(async()=>{
  layout();makeGrain();
  // images load in background; the animation does not wait for them
  const imgs=Promise.all([load('photo','assets/img/photo.webp'),load('fish','assets/img/fish.png'),load('text','assets/img/text.png'),load('waves','assets/img/waves.png')]).catch(()=>{});
  // wait for fonts at most 1.2 s, then start regardless
  const fonts=Promise.all(['180px IDB','40px IDBold','40px IDM','40px PopB','40px Mono'].map(f=>document.fonts.load(f))).catch(()=>{});
  await Promise.race([fonts,new Promise(r=>setTimeout(r,1200))]);
  render(0);
  if(!window.__CAPTURE)play(0);
  if(window.__CAPTURE)await imgs;
  return true;
})();
