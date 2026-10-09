gsap.registerPlugin(ScrollTrigger);

const canvas=document.querySelector("#heroCanvas");
const ctx=canvas.getContext("2d",{alpha:false,desynchronized:true});
const FRAME_W=960,FRAME_H=540,COLS=5,ROWS=4,CELL_W=960,CELL_H=540;
const FRAMES=300,SHEETS=15;
const sheetImages=[];
let imagesLoaded=0,ready=false,lastFrame=-1,targetFrame=0,renderFrame=0,lastT=performance.now();

function loadSheets(){
  for(let i=1;i<=SHEETS;i++){
    const img=new Image();
    img.decoding="async";
    img.src=`assets/sheets/sheet-${String(i).padStart(2,"0")}.jpg`;
    img.onload=()=>{imagesLoaded++; if(imagesLoaded===SHEETS){ready=true;drawFrame(0);}};
    sheetImages.push(img);
  }
}
function drawFrame(index){
  index=Math.max(0,Math.min(FRAMES-1,Math.round(index)));
  if(!ready)return;
  if(index===lastFrame)return;
  const sheet=Math.floor(index/20);
  const local=index%20;
  const sx=(local%COLS)*CELL_W;
  const sy=Math.floor(local/COLS)*CELL_H;
  const img=sheetImages[sheet];
  if(!img.complete)return;
  ctx.drawImage(img,sx,sy,CELL_W,CELL_H,0,0,FRAME_W,FRAME_H);
  lastFrame=index;
}
loadSheets();

function animateFrames(now){
  const dt=Math.min((now-lastT)/1000,.05);lastT=now;
  const response=1-Math.pow(.000001,dt);
  renderFrame += (targetFrame-renderFrame)*response;
  if(Math.abs(renderFrame-lastFrame)>=.08)drawFrame(renderFrame);
  requestAnimationFrame(animateFrames);
}
requestAnimationFrame(animateFrames);

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=t=>t*t*(3-2*t);
const smoother=t=>t*t*t*(t*(t*6-15)+10);

ScrollTrigger.create({
 trigger:".cinema",start:"top top",end:"bottom bottom",scrub:1.25,
 onUpdate:self=>{
   const p=self.progress;
   targetFrame=ease(p)*299;
   document.querySelector("#progress").style.width=`${p*100}%`;
   document.querySelector("#frameReadout").textContent=`${String(Math.round(targetFrame)+1).padStart(3,"0")} / 300`;

   // Cinematic camera. Final phase deliberately pulls OUT so the complete
   // final composition and the person wearing the glasses are visible.
   let q,scale,rx,ry,rz,z,x,y;
   if(p<.18){
     q=smoother(p/.18);scale=1.02+.08*q;rx=1-.8*q;ry=-1.4*q;rz=.12*q;z=45*q;x=-1*q;y=.5*q;
   }else if(p<.40){
     q=smoother((p-.18)/.22);scale=1.10+.13*q;rx=.2+1.9*q;ry=-1.4+3.3*q;rz=.12-.35*q;z=45+95*q;x=-1+2.5*q;y=.5-1.3*q;
   }else if(p<.62){
     q=smoother((p-.40)/.22);scale=1.23+.10*q;rx=2.1-3.0*q;ry=1.9-4.2*q;rz=-.23+.35*q;z=140-35*q;x=1.5-2.8*q;y=-.8+1.7*q;
   }else if(p<.82){
     q=smoother((p-.62)/.20);scale=1.33-.02*q;rx=-.9+.65*q;ry=-2.3+1.8*q;rz=.12-.12*q;z=105-12*q;x=-1.3+1.1*q;y=.9-.7*q;
   }else{
     q=smoother((p-.82)/.18);
     // Strong final pull-back.
     scale=1.31-.48*q;
     rx=-.25+.18*q;ry=-.5+.45*q;rz=0;
     z=93-70*q;x=.0;y=.2-.2*q;
   }
   gsap.set("#mediaWrap",{xPercent:x*.6,yPercent:y*.5,z:z*.3});
   gsap.set("#media",{scale,rotationX:rx,rotationY:ry,rotationZ:rz,z,borderRadius:34-p*18});
   gsap.set("#heroCanvas",{scale:1.01+p*.035});
   gsap.set(".back",{scale:1.1+p*.17,xPercent:-p*3,yPercent:-p});
   gsap.set(".front",{scale:1.02+p*.06});
   gsap.set(".sheen",{xPercent:-70+p*165,opacity:.18+.32*Math.sin(p*Math.PI)});
   gsap.set("#nav",{y:-p*4,backgroundColor:`rgba(12,12,12,${.46+.3*p})`});

   const introOut=ease(clamp((p-.07)/.18,0,1));
   gsap.set(".intro",{opacity:1-introOut,y:-p*150,x:p*18,scale:1-p*.06,filter:`blur(${introOut*7}px)`});

   const ranges=[[.15,.32],[.31,.51],[.50,.70],[.69,.86]];
   const beats=[...document.querySelectorAll(".beat")];
   ranges.forEach((r,i)=>{
     let op=0;if(p>=r[0]&&p<=r[1]){let n=(p-r[0])/(r[1]-r[0]);op=n<.18?ease(n/.18):n>.82?ease((1-n)/.18):1}
     gsap.set(beats[i],{opacity:op,y:(1-op)*(i%2?-35:35),x:(1-op)*(i%2?22:-22),scale:.97+.03*op,filter:`blur(${(1-op)*8}px)`});
     if(op>.5)document.querySelector("#chapter").textContent=String(i+1).padStart(2,"0");
   });

   // Final text appears only once the camera has started pulling out.
   const finalP=ease(clamp((p-.86)/.12,0,1));
   gsap.set("#finalLock",{opacity:finalP,y:40-40*finalP,filter:`blur(${(1-finalP)*7}px)`});
 }
});

// Lenis gives the scroll itself a consistent physical feel.
if(!matchMedia("(prefers-reduced-motion: reduce)").matches){
  const lenis=new Lenis({duration:1.15,smoothWheel:true,syncTouch:false,lerp:.075,wheelMultiplier:.9,touchMultiplier:1.05});
  lenis.on("scroll",ScrollTrigger.update);
  gsap.ticker.add(t=>lenis.raf(t*1000));
  gsap.ticker.lagSmoothing(1000,16);
}

if(matchMedia("(pointer:fine)").matches){
 addEventListener("pointermove",e=>{
   const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;
   gsap.to("#mediaWrap",{x:`+=${x*7}`,y:`+=${y*5}`,duration:1.3,ease:"power3.out",overwrite:true});
   gsap.to(".front",{x:x*-16,y:y*-10,duration:1.5,ease:"power3.out",overwrite:true});
 });
}

gsap.utils.toArray(".parallax").forEach(el=>{
 const s=parseFloat(el.dataset.speed)||.1;
 gsap.to(el,{y:s*180,ease:"none",scrollTrigger:{trigger:el.closest("section"),start:"top bottom",end:"bottom top",scrub:1.2}});
});

gsap.utils.toArray(".editorial,.contact").forEach(section=>{
 gsap.from(section.querySelectorAll(".eyebrow,h2,p,a"),{y:65,opacity:0,stagger:.07,duration:1.15,ease:"power4.out",scrollTrigger:{trigger:section,start:"top 72%",once:true}});
});

document.querySelector("#menu").addEventListener("click",()=>document.querySelector("#mobileMenu").classList.toggle("open"));
document.querySelectorAll("#mobileMenu a").forEach(a=>a.addEventListener("click",()=>document.querySelector("#mobileMenu").classList.remove("open")));


// RAYZ feedback deck — five-page book turn. Replace the placeholder image paths
// and copy below when the real feedback/images are supplied.
const feedbackData = [
  {quote:"I honestly did not expect so many people to notice the glasses. They fit my face really well and have become my go-to pair when I step out.",name:"Bunty",role:"RAYZ customer",image:"assets/feedback/feedback-01-bunty.webp"},
  {quote:"I wanted something that looked good but still felt easy to wear every day. These have been comfortable, simple and I keep getting compliments on them.",name:"Rita",role:"RAYZ customer",image:"assets/feedback/feedback-02-rita.webp"},
  {quote:"The sunglasses have that slightly premium look without feeling too flashy. I wore them out on a sunny day and they instantly became my favourite pair.",name:"Bhargav",role:"RAYZ customer",image:"assets/feedback/feedback-03-bhargav.webp"},
  {quote:"I was looking for an everyday frame that would work with formal clothes as well as casual ones. The fit is comfortable and the design feels really clean.",name:"Sumit",role:"RAYZ customer",image:"assets/feedback/feedback-04-sumit.webp"},
  {quote:"I like how understated the frame is. It feels light, looks sharp and works well for long days when I am moving between class, work and everything else.",name:"Sahil",role:"RAYZ customer",image:"assets/feedback/feedback-05-sahil.webp"}
];

const feedbackStage=document.querySelector('#feedbackStage');
const feedbackStack=document.querySelector('#feedbackStack');
const feedbackPrev=document.querySelector('#feedbackPrev');
const feedbackNext=document.querySelector('#feedbackNext');
const feedbackProgress=document.querySelector('#feedbackProgress');
let feedbackIndex=0;
let feedbackBusy=false;
let feedbackTimer=null;

function buildFeedback(){
  if(!feedbackStack)return;
  feedbackStack.innerHTML=feedbackData.map((d,i)=>`
    <article class="feedback-card ${i===0?'is-active':''}" data-index="${i}" tabindex="0">
      <div class="feedback-copy">
        <div class="feedback-index"><span>${String(i+1).padStart(2,'0')} / 05</span><i></i><span>RAYZ FEEDBACK</span></div>
        <div class="feedback-quote">${d.quote}</div>
        <div class="feedback-person">
          <div class="feedback-avatar">${d.image?`<img src="${d.image}" alt="">`:''}</div>
          <div><strong>${d.name}</strong><span>${d.role}</span></div>
        </div>
      </div>
      <div class="feedback-photo ${d.image?'has-image':''}">${d.image?`<img src="${d.image}" alt="Feedback from ${d.name}">`:''}</div>
    </article>`).join('');
  feedbackProgress.innerHTML=feedbackData.map((_,i)=>`<i class="${i===0?'current':''}"><b></b></i>`).join('');
  syncFeedbackStack();
}
function syncFeedbackStack(){
  const cards=[...feedbackStack.children];
  cards.forEach((card,i)=>{
    card.classList.remove('is-active','is-behind','is-behind-2');
    const rel=(i-feedbackIndex+feedbackData.length)%feedbackData.length;
    if(rel===0)card.classList.add('is-active');
    else if(rel===1)card.classList.add('is-behind');
    else if(rel===2)card.classList.add('is-behind-2');
    else card.style.visibility='hidden';
    if(rel>2)card.style.visibility='hidden'; else card.style.visibility='visible';
  });
  [...feedbackProgress.children].forEach((dot,i)=>dot.classList.toggle('current',i===feedbackIndex));
}
function restartFeedbackProgress(){
  [...feedbackProgress.children].forEach((dot,i)=>{
    const bar=dot.querySelector('b');
    bar.style.transition='none';bar.style.transform='scaleX(0)';
    if(i===feedbackIndex){requestAnimationFrame(()=>{bar.style.transition='transform 5.5s linear';bar.style.transform='scaleX(1)'})}
  });
}
function turnFeedback(direction=1){
  if(feedbackBusy)return;
  feedbackBusy=true;
  const oldIndex=feedbackIndex;
  const nextIndex=(feedbackIndex+direction+feedbackData.length)%feedbackData.length;
  const oldCard=feedbackStack.children[oldIndex];
  const newCard=feedbackStack.children[nextIndex];
  if(direction>0){
    newCard.classList.remove('is-behind');
    newCard.style.visibility='visible';
    oldCard.classList.add('turn-out');
    newCard.classList.add('turn-in');
  }else{
    newCard.style.visibility='visible';
    newCard.classList.add('turn-in','reverse-in');
    oldCard.classList.add('reverse-out');
  }
  feedbackIndex=nextIndex;
  setTimeout(()=>{
    [...feedbackStack.children].forEach(c=>c.classList.remove('turn-out','turn-in','reverse-out','reverse-in'));
    syncFeedbackStack();
    restartFeedbackProgress();
    feedbackBusy=false;
  },960);
}
function startFeedbackAuto(){
  clearInterval(feedbackTimer);
  feedbackTimer=setInterval(()=>turnFeedback(1),5500);
  restartFeedbackProgress();
}
feedbackNext?.addEventListener('click',()=>{turnFeedback(1);startFeedbackAuto()});
feedbackPrev?.addEventListener('click',()=>{turnFeedback(-1);startFeedbackAuto()});
feedbackStack?.addEventListener('click',e=>{if(e.target.closest('.feedback-card')){turnFeedback(1);startFeedbackAuto()}});
feedbackStage?.addEventListener('mouseenter',()=>clearInterval(feedbackTimer));
feedbackStage?.addEventListener('mouseleave',startFeedbackAuto);
feedbackStage?.addEventListener('touchstart',()=>clearInterval(feedbackTimer),{passive:true});
feedbackStage?.addEventListener('touchend',startFeedbackAuto,{passive:true});
buildFeedback();
startFeedbackAuto();

// Real-photo product cards: subtle 3D response without overpowering the photography.
if(matchMedia('(pointer:fine)').matches){
  document.querySelectorAll('.tilt-card').forEach(card=>{
    const image=card.querySelector('img');
    card.addEventListener('pointermove',e=>{
      const r=card.getBoundingClientRect();
      const px=(e.clientX-r.left)/r.width-.5;
      const py=(e.clientY-r.top)/r.height-.5;
      gsap.to(card,{rotationY:px*5,rotationX:-py*4,x:px*4,y:py*3,duration:.6,ease:'power3.out',overwrite:true});
      if(image)gsap.to(image,{x:px*-8,y:py*-6,duration:.8,ease:'power3.out',overwrite:true});
    });
    card.addEventListener('pointerleave',()=>{
      gsap.to(card,{rotationY:0,rotationX:0,x:0,y:0,duration:.9,ease:'power3.out'});
      if(image)gsap.to(image,{x:0,y:0,duration:1,ease:'power3.out'});
    });
  });
}

// RAYZ campaign film controls
// Film 02 (WhatsApp video) autoplays muted because browsers block autoplay with sound.
// The sound button lets the visitor enable audio without stopping the film. Film 01 starts paused and plays with sound after user interaction.
document.querySelectorAll('.ad-film').forEach((card) => {
  const video = card.querySelector('.ad-video');
  const toggle = card.querySelector('.ad-play-toggle');
  const sound = card.querySelector('.ad-sound-toggle');
  if (!video || !toggle || !sound) return;

  const syncState = () => {
    const playing = !video.paused && !video.ended;
    toggle.dataset.state = playing ? 'playing' : 'paused';
    toggle.setAttribute('aria-label', playing ? 'Pause film' : 'Play film');
    sound.dataset.muted = video.muted ? 'true' : 'false';
    sound.setAttribute('aria-label', video.muted ? 'Turn sound on' : 'Mute film');
  };

  const togglePlayback = (event) => {
    event.stopPropagation();
    if (video.paused || video.ended) {
      // If the visitor explicitly starts a film, allow sound.
      if (card.classList.contains('ad-film-a')) video.muted = false;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const toggleSound = (event) => {
    event.stopPropagation();
    video.muted = !video.muted;
    if (!video.paused) video.play().catch(() => {});
    syncState();
  };

  toggle.addEventListener('click', togglePlayback);
  sound.addEventListener('click', toggleSound);
  video.addEventListener('play', syncState);
  video.addEventListener('pause', syncState);
  video.addEventListener('volumechange', syncState);
  video.addEventListener('ended', syncState);

  // Clicking the actual film toggles playback, but never opens Drive.
  video.addEventListener('click', togglePlayback);
  syncState();
});
