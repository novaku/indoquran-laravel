import{r as e}from"./vendor-react-core-6TMgrhI0.js";import{aj as t,ak as a,al as r,am as o}from"./vendor-utils-Dtdek_Yu.js";var i=(e,t)=>(e=>"function"==typeof e)(e)?e(t):e,s=(()=>{let e=0;return()=>(++e).toString()})(),n=(()=>{let e;return()=>{if(void 0===e&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),l=(e,t)=>{switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,20)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:a}=t;return l(e,{type:e.toasts.find(e=>e.id===a.id)?1:0,toast:a});case 3:let{toastId:r}=t;return{...e,toasts:e.toasts.map(e=>e.id===r||void 0===r?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let o=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+o}))}}},d=[],c={toasts:[],pausedAt:void 0},p=e=>{c=l(c,e),d.forEach(e=>{e(c)})},u={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},m=e=>(t,a)=>{let r=((e,t="blank",a)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...a,id:(null==a?void 0:a.id)||s()}))(t,e,a);return p({type:2,toast:r}),r.id},f=(e,t)=>m("blank")(e,t);f.error=m("error"),f.success=m("success"),f.loading=m("loading"),f.custom=m("custom"),f.dismiss=e=>{p({type:3,toastId:e})},f.remove=e=>p({type:4,toastId:e}),f.promise=(e,t,a)=>{let r=f.loading(t.loading,{...a,...null==a?void 0:a.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let o=t.success?i(t.success,e):void 0;return o?f.success(o,{id:r,...a,...null==a?void 0:a.success}):f.dismiss(r),e}).catch(e=>{let o=t.error?i(t.error,e):void 0;o?f.error(o,{id:r,...a,...null==a?void 0:a.error}):f.dismiss(r)}),e};var y=(e,t)=>{p({type:1,toast:{id:e,height:t}})},h=()=>{p({type:5,time:Date.now()})},g=new Map,b=t`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,v=t`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,x=t`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,w=r("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${b} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${v} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${x} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,E=t`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,$=r("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${E} 1s linear infinite;
`,D=t`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,k=t`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,z=r("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${D} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${k} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,O=r("div")`
  position: absolute;
`,I=r("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,P=t`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,j=r("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${P} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,A=({toast:t})=>{let{icon:a,type:r,iconTheme:o}=t;return void 0!==a?"string"==typeof a?e.createElement(j,null,a):a:"blank"===r?null:e.createElement(I,null,e.createElement($,{...o}),"loading"!==r&&e.createElement(O,null,"error"===r?e.createElement(w,{...o}):e.createElement(z,{...o})))},C=e=>`\n0% {transform: translate3d(0,${-200*e}%,0) scale(.6); opacity:.5;}\n100% {transform: translate3d(0,0,0) scale(1); opacity:1;}\n`,N=e=>`\n0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}\n100% {transform: translate3d(0,${-150*e}%,-1px) scale(.6); opacity:0;}\n`,M=r("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,T=r("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,H=e.memo(({toast:a,position:r,style:o,children:s})=>{let l=a.height?((e,a)=>{let r=e.includes("top")?1:-1,[o,i]=n()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[C(r),N(r)];return{animation:a?`${t(o)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${t(i)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(a.position||r||"top-center",a.visible):{opacity:0},d=e.createElement(A,{toast:a}),c=e.createElement(T,{...a.ariaProps},i(a.message,a));return e.createElement(M,{className:a.className,style:{...l,...o,...a.style}},"function"==typeof s?s({icon:d,message:c}):e.createElement(e.Fragment,null,d,c))});o(e.createElement);var S=({id:t,className:a,style:r,onHeightUpdate:o,children:i})=>{let s=e.useCallback(e=>{if(e){let a=()=>{let a=e.getBoundingClientRect().height;o(t,a)};a(),new MutationObserver(a).observe(e,{subtree:!0,childList:!0,characterData:!0})}},[t,o]);return e.createElement("div",{ref:s,className:a,style:r},i)},L=a`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,R=({reverseOrder:t,position:a="top-center",toastOptions:r,gutter:o,children:s,containerStyle:l,containerClassName:m})=>{let{toasts:b,handlers:v}=(t=>{let{toasts:a,pausedAt:r}=((t={})=>{let[a,r]=e.useState(c),o=e.useRef(c);e.useEffect(()=>(o.current!==c&&r(c),d.push(r),()=>{let e=d.indexOf(r);e>-1&&d.splice(e,1)}),[]);let i=a.toasts.map(e=>{var a,r,o;return{...t,...t[e.type],...e,removeDelay:e.removeDelay||(null==(a=t[e.type])?void 0:a.removeDelay)||(null==t?void 0:t.removeDelay),duration:e.duration||(null==(r=t[e.type])?void 0:r.duration)||(null==t?void 0:t.duration)||u[e.type],style:{...t.style,...null==(o=t[e.type])?void 0:o.style,...e.style}}});return{...a,toasts:i}})(t);e.useEffect(()=>{if(r)return;let e=Date.now(),t=a.map(t=>{if(t.duration===1/0)return;let a=(t.duration||0)+t.pauseDuration-(e-t.createdAt);if(!(a<0))return setTimeout(()=>f.dismiss(t.id),a);t.visible&&f.dismiss(t.id)});return()=>{t.forEach(e=>e&&clearTimeout(e))}},[a,r]);let o=e.useCallback(()=>{r&&p({type:6,time:Date.now()})},[r]),i=e.useCallback((e,t)=>{let{reverseOrder:r=!1,gutter:o=8,defaultPosition:i}=t||{},s=a.filter(t=>(t.position||i)===(e.position||i)&&t.height),n=s.findIndex(t=>t.id===e.id),l=s.filter((e,t)=>t<n&&e.visible).length;return s.filter(e=>e.visible).slice(...r?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+o,0)},[a]);return e.useEffect(()=>{a.forEach(e=>{if(e.dismissed)((e,t=1e3)=>{if(g.has(e))return;let a=setTimeout(()=>{g.delete(e),p({type:4,toastId:e})},t);g.set(e,a)})(e.id,e.removeDelay);else{let t=g.get(e.id);t&&(clearTimeout(t),g.delete(e.id))}})},[a]),{toasts:a,handlers:{updateHeight:y,startPause:h,endPause:o,calculateOffset:i}}})(r);return e.createElement("div",{id:"_rht_toaster",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...l},className:m,onMouseEnter:v.startPause,onMouseLeave:v.endPause},b.map(r=>{let l=r.position||a,d=((e,t)=>{let a=e.includes("top"),r=a?{top:0}:{bottom:0},o=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:n()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(a?1:-1)}px)`,...r,...o}})(l,v.calculateOffset(r,{reverseOrder:t,gutter:o,defaultPosition:a}));return e.createElement(S,{id:r.id,key:r.id,onHeightUpdate:v.updateHeight,className:r.visible?L:"",style:d},"custom"===r.type?i(r.message,r):s?s(r):e.createElement(H,{toast:r,position:l}))}))};export{R as O,f as c};
