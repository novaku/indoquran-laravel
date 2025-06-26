import{r as e,R as t}from"./router-BRm-CzKj.js";let r,a,o,i={data:""},s=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,n=/\/\*[^]*?\*\/|  +/g,l=/\n+/g,c=(e,t)=>{let r="",a="",o="";for(let i in e){let s=e[i];"@"==i[0]?"i"==i[1]?r=i+" "+s+";":a+="f"==i[1]?c(s,i):i+"{"+c(s,"k"==i[1]?"":t)+"}":"object"==typeof s?a+=c(s,t?t.replace(/([^,])+/g,e=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):i):null!=s&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),o+=c.p?c.p(i,s):i+":"+s+";")}return r+(t&&o?t+"{"+o+"}":o)+a},d={},u=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+u(e[r]);return t}return e};function p(e){let t=this||{},r=e.call?e(t.p):e;return((e,t,r,a,o)=>{let i=u(e),p=d[i]||(d[i]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(i));if(!d[p]){let t=i!==e?e:(e=>{let t,r,a=[{}];for(;t=s.exec(e.replace(n,""));)t[4]?a.shift():t[3]?(r=t[3].replace(l," ").trim(),a.unshift(a[0][r]=a[0][r]||{})):a[0][t[1]]=t[2].replace(l," ").trim();return a[0]})(e);d[p]=c(o?{["@keyframes "+p]:t}:t,r?"":"."+p)}let f=r&&d.g?d.g:null;return r&&(d.g=d[p]),m=d[p],y=t,g=a,(b=f)?y.data=y.data.replace(b,m):-1===y.data.indexOf(m)&&(y.data=g?m+y.data:y.data+m),p;var m,y,g,b})(r.unshift?r.raw?((e,t,r)=>e.reduce((e,a,o)=>{let i=t[o];if(i&&i.call){let e=i(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;i=t?"."+t:e&&"object"==typeof e?e.props?"":c(e,""):!1===e?"":e}return e+a+(null==i?"":i)},""))(r,[].slice.call(arguments,1),t.p):r.reduce((e,r)=>Object.assign(e,r&&r.call?r(t.p):r),{}):r,(a=t.target,"object"==typeof window?((a?a.querySelector("#_goober"):window._goober)||Object.assign((a||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:a||i),t.g,t.o,t.k);var a}p.bind({g:1});let f=p.bind({k:1});function m(e,t){let i=this||{};return function(){let t=arguments;return function s(n,l){let c=Object.assign({},n),d=c.className||s.className;i.p=Object.assign({theme:a&&a()},c),i.o=/ *go\d+/.test(d),c.className=p.apply(i,t)+(d?" "+d:"");let u=e;return e[0]&&(u=c.as||e,delete c.as),o&&u[0]&&o(c),r(u,c)}}}var y=(e,t)=>(e=>"function"==typeof e)(e)?e(t):e,g=(()=>{let e=0;return()=>(++e).toString()})(),b=(()=>{let e;return()=>{if(void 0===e&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),h=(e,t)=>{switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,20)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:r}=t;return h(e,{type:e.toasts.find(e=>e.id===r.id)?1:0,toast:r});case 3:let{toastId:a}=t;return{...e,toasts:e.toasts.map(e=>e.id===a||void 0===a?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let o=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+o}))}}},v=[],x={toasts:[],pausedAt:void 0},w=e=>{x=h(x,e),v.forEach(e=>{e(x)})},O={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},j=e=>(t,r)=>{let a=((e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||g()}))(t,e,r);return w({type:2,toast:a}),a.id},E=(e,t)=>j("blank")(e,t);E.error=j("error"),E.success=j("success"),E.loading=j("loading"),E.custom=j("custom"),E.dismiss=e=>{w({type:3,toastId:e})},E.remove=e=>w({type:4,toastId:e}),E.promise=(e,t,r)=>{let a=E.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let o=t.success?y(t.success,e):void 0;return o?E.success(o,{id:a,...r,...null==r?void 0:r.success}):E.dismiss(a),e}).catch(e=>{let o=t.error?y(t.error,e):void 0;o?E.error(o,{id:a,...r,...null==r?void 0:r.error}):E.dismiss(a)}),e};var P,k,$,D,N=(e,t)=>{w({type:1,toast:{id:e,height:t}})},C=()=>{w({type:5,time:Date.now()})},z=new Map,S=t=>{let{toasts:r,pausedAt:a}=((t={})=>{let[r,a]=e.useState(x),o=e.useRef(x);e.useEffect(()=>(o.current!==x&&a(x),v.push(a),()=>{let e=v.indexOf(a);e>-1&&v.splice(e,1)}),[]);let i=r.toasts.map(e=>{var r,a,o;return{...t,...t[e.type],...e,removeDelay:e.removeDelay||(null==(r=t[e.type])?void 0:r.removeDelay)||(null==t?void 0:t.removeDelay),duration:e.duration||(null==(a=t[e.type])?void 0:a.duration)||(null==t?void 0:t.duration)||O[e.type],style:{...t.style,...null==(o=t[e.type])?void 0:o.style,...e.style}}});return{...r,toasts:i}})(t);e.useEffect(()=>{if(a)return;let e=Date.now(),t=r.map(t=>{if(t.duration===1/0)return;let r=(t.duration||0)+t.pauseDuration-(e-t.createdAt);if(!(r<0))return setTimeout(()=>E.dismiss(t.id),r);t.visible&&E.dismiss(t.id)});return()=>{t.forEach(e=>e&&clearTimeout(e))}},[r,a]);let o=e.useCallback(()=>{a&&w({type:6,time:Date.now()})},[a]),i=e.useCallback((e,t)=>{let{reverseOrder:a=!1,gutter:o=8,defaultPosition:i}=t||{},s=r.filter(t=>(t.position||i)===(e.position||i)&&t.height),n=s.findIndex(t=>t.id===e.id),l=s.filter((e,t)=>t<n&&e.visible).length;return s.filter(e=>e.visible).slice(...a?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+o,0)},[r]);return e.useEffect(()=>{r.forEach(e=>{if(e.dismissed)((e,t=1e3)=>{if(z.has(e))return;let r=setTimeout(()=>{z.delete(e),w({type:4,toastId:e})},t);z.set(e,r)})(e.id,e.removeDelay);else{let t=z.get(e.id);t&&(clearTimeout(t),z.delete(e.id))}})},[r]),{toasts:r,handlers:{updateHeight:N,startPause:C,endPause:o,calculateOffset:i}}},A=f`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,I=f`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,T=f`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,M=m("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${A} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${I} 0.15s ease-out forwards;
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
    animation: ${T} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,F=f`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,H=m("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${F} 1s linear infinite;
`,_=f`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,L=f`
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
}`,R=m("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${_} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${L} 0.2s ease-out forwards;
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
`,U=m("div")`
  position: absolute;
`,q=m("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,B=f`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,G=m("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${B} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,W=({toast:t})=>{let{icon:r,type:a,iconTheme:o}=t;return void 0!==r?"string"==typeof r?e.createElement(G,null,r):r:"blank"===a?null:e.createElement(q,null,e.createElement(H,{...o}),"loading"!==a&&e.createElement(U,null,"error"===a?e.createElement(M,{...o}):e.createElement(R,{...o})))},Y=e=>`\n0% {transform: translate3d(0,${-200*e}%,0) scale(.6); opacity:.5;}\n100% {transform: translate3d(0,0,0) scale(1); opacity:1;}\n`,Z=e=>`\n0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}\n100% {transform: translate3d(0,${-150*e}%,-1px) scale(.6); opacity:0;}\n`,J=m("div")`
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
`,K=m("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,Q=e.memo(({toast:t,position:r,style:a,children:o})=>{let i=t.height?((e,t)=>{let r=e.includes("top")?1:-1,[a,o]=b()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[Y(r),Z(r)];return{animation:t?`${f(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${f(o)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(t.position||r||"top-center",t.visible):{opacity:0},s=e.createElement(W,{toast:t}),n=e.createElement(K,{...t.ariaProps},y(t.message,t));return e.createElement(J,{className:t.className,style:{...i,...a,...t.style}},"function"==typeof o?o({icon:s,message:n}):e.createElement(e.Fragment,null,s,n))});P=e.createElement,c.p=k,r=P,a=$,o=D;var V=({id:t,className:r,style:a,onHeightUpdate:o,children:i})=>{let s=e.useCallback(e=>{if(e){let r=()=>{let r=e.getBoundingClientRect().height;o(t,r)};r(),new MutationObserver(r).observe(e,{subtree:!0,childList:!0,characterData:!0})}},[t,o]);return e.createElement("div",{ref:s,className:r,style:a},i)},X=p`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,ee=({reverseOrder:t,position:r="top-center",toastOptions:a,gutter:o,children:i,containerStyle:s,containerClassName:n})=>{let{toasts:l,handlers:c}=S(a);return e.createElement("div",{id:"_rht_toaster",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...s},className:n,onMouseEnter:c.startPause,onMouseLeave:c.endPause},l.map(a=>{let s=a.position||r,n=((e,t)=>{let r=e.includes("top"),a=r?{top:0}:{bottom:0},o=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:b()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...a,...o}})(s,c.calculateOffset(a,{reverseOrder:t,gutter:o,defaultPosition:r}));return e.createElement(V,{id:a.id,key:a.id,onHeightUpdate:c.updateHeight,className:a.visible?X:"",style:n},"custom"===a.type?y(a.message,a):i?i(a):e.createElement(Q,{toast:a,position:s}))}))},te={color:void 0,size:void 0,className:void 0,style:void 0,attr:void 0},re=t.createContext&&t.createContext(te),ae=["attr","size","title"];function oe(e,t){if(null==e)return{};var r,a,o=function(e,t){if(null==e)return{};var r={};for(var a in e)if(Object.prototype.hasOwnProperty.call(e,a)){if(t.indexOf(a)>=0)continue;r[a]=e[a]}return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}function ie(){return ie=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var a in r)Object.prototype.hasOwnProperty.call(r,a)&&(e[a]=r[a])}return e},ie.apply(this,arguments)}function se(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,a)}return r}function ne(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?se(Object(r),!0).forEach(function(t){le(e,t,r[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):se(Object(r)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))})}return e}function le(e,t,r){return t=function(e){var t=function(e,t){if("object"!=typeof e||!e)return e;var r=e[Symbol.toPrimitive];if(void 0!==r){var a=r.call(e,t);if("object"!=typeof a)return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(e)}(e,"string");return"symbol"==typeof t?t:t+""}(t),t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function ce(e){return e&&e.map((e,r)=>t.createElement(e.tag,ne({key:r},e.attr),ce(e.child)))}function de(e){return r=>t.createElement(ue,ie({attr:ne({},e.attr)},r),ce(e.child))}function ue(e){var r=r=>{var a,{attr:o,size:i,title:s}=e,n=oe(e,ae),l=i||r.size||"1em";return r.className&&(a=r.className),e.className&&(a=(a?a+" ":"")+e.className),t.createElement("svg",ie({stroke:"currentColor",fill:"currentColor",strokeWidth:"0"},r.attr,o,n,{className:a,style:ne(ne({color:e.color||r.color},r.style),e.style),height:l,width:l,xmlns:"http://www.w3.org/2000/svg"}),s&&t.createElement("title",null,s),e.children)};return void 0!==re?t.createElement(re.Consumer,null,e=>r(e)):r(te)}export{de as G,ee as O,E as c};
