function t(){return t=Object.assign?Object.assign.bind():function(t){for(var e=1;arguments.length>e;e++){var n=arguments[e]
for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(t[r]=n[r])}return t},t.apply(this,arguments)}var e,n;(n=e||(e={})).Pop="POP",n.Push="PUSH",n.Replace="REPLACE"
const r="popstate"
function a(n){return void 0===n&&(n={}),function(n,a,i,s){void 0===s&&(s={})
let{window:f=document.defaultView,v5Compat:h=!1}=s,p=f.history,d=e.Pop,m=null,v=g()
function g(){return(p.state||{idx:null}).idx}function y(){d=e.Pop
let t=g(),n=null==t?null:t-v
v=t,m&&m({action:d,location:w.location,delta:n})}function b(t){let e="null"!==f.location.origin?f.location.origin:f.location.href,n="string"==typeof t?t:c(t)
return n=n.replace(/ $/,"%20"),o(e,"No window.location.(origin|href) available to create URL for href: "+n),new URL(n,e)}null==v&&(v=0,p.replaceState(t({},p.state,{idx:v}),""))
let w={get action(){return d},get location(){return function(t,e){let{pathname:n,search:r,hash:a}=t.location
return u("",{pathname:n,search:r,hash:a},e.state&&e.state.usr||null,e.state&&e.state.key||"default")}(f,p)},listen(t){if(m)throw Error("A history only accepts one active listener")
return f.addEventListener(r,y),m=t,()=>{f.removeEventListener(r,y),m=null}},createHref:t=>function(t,e){return"string"==typeof e?e:c(e)}(0,t),createURL:b,encodeLocation(t){let e=b(t)
return{pathname:e.pathname,search:e.search,hash:e.hash}},push:function(t,n){d=e.Push
let r=u(w.location,t,n)
v=g()+1
let a=l(r,v),o=w.createHref(r)
try{p.pushState(a,"",o)}catch(i){if(i instanceof DOMException&&"DataCloneError"===i.name)throw i
f.location.assign(o)}h&&m&&m({action:d,location:w.location,delta:1})},replace:function(t,n){d=e.Replace
let r=u(w.location,t,n)
v=g()
let a=l(r,v),o=w.createHref(r)
p.replaceState(a,"",o),h&&m&&m({action:d,location:w.location,delta:0})},go:t=>p.go(t)}
return w}(0,0,0,n)}function o(t,e){if(!1===t||null==t)throw Error(e)}function i(t,e){if(!t)try{throw Error(e)}catch(n){}}function l(t,e){return{usr:t.state,key:t.key,idx:e}}function u(e,n,r,a){return void 0===r&&(r=null),t({pathname:"string"==typeof e?e:e.pathname,search:"",hash:""},"string"==typeof n?s(n):n,{state:r,key:n&&n.key||a||Math.random().toString(36).substr(2,8)})}function c(t){let{pathname:e="/",search:n="",hash:r=""}=t
return n&&"?"!==n&&(e+="?"===n.charAt(0)?n:"?"+n),r&&"#"!==r&&(e+="#"===r.charAt(0)?r:"#"+r),e}function s(t){let e={}
if(t){let n=t.indexOf("#")
0>n||(e.hash=t.substr(n),t=t.substr(0,n))
let r=t.indexOf("?")
0>r||(e.search=t.substr(r),t=t.substr(0,r)),t&&(e.pathname=t)}return e}var f,h
function p(t,e,n){return void 0===n&&(n="/"),function(t,e,n){let r=S(("string"==typeof e?s(e):e).pathname||"/",n)
if(null==r)return null
let a=d(t)
!function(t){t.sort((t,e)=>t.score!==e.score?e.score-t.score:function(t,e){return t.length===e.length&&t.slice(0,-1).every((t,n)=>t===e[n])?t[t.length-1]-e[e.length-1]:0}(t.routesMeta.map(t=>t.childrenIndex),e.routesMeta.map(t=>t.childrenIndex)))}(a)
let o=null
for(let i=0;null==o&&i<a.length;++i){let t=L(r)
o=x(a[i],t)}return o}(t,e,n)}function d(t,e,n,r){void 0===e&&(e=[]),void 0===n&&(n=[]),void 0===r&&(r="")
let a=(t,a,i)=>{let l={relativePath:void 0===i?t.path||"":i,caseSensitive:!0===t.caseSensitive,childrenIndex:a,route:t}
l.relativePath.startsWith("/")&&(o(l.relativePath.startsWith(r),'Absolute route path "'+l.relativePath+'" nested under path "'+r+'" is not valid. An absolute child route path must start with the combined path of all its parent routes.'),l.relativePath=l.relativePath.slice(r.length))
let u=A([r,l.relativePath]),c=n.concat(l)
t.children&&t.children.length>0&&(o(!0!==t.index,'Index routes must not have child routes. Please remove all child routes from route path "'+u+'".'),d(t.children,e,c,u)),(null!=t.path||t.index)&&e.push({path:u,score:R(u,t.index),routesMeta:c})}
return t.forEach((t,e)=>{var n
if(""!==t.path&&null!=(n=t.path)&&n.includes("?"))for(let r of m(t.path))a(t,e,r)
else a(t,e)}),e}function m(t){let e=t.split("/")
if(0===e.length)return[]
let[n,...r]=e,a=n.endsWith("?"),o=n.replace(/\?$/,"")
if(0===r.length)return a?[o,""]:[o]
let i=m(r.join("/")),l=[]
return l.push(...i.map(t=>""===t?o:[o,t].join("/"))),a&&l.push(...i),l.map(e=>t.startsWith("/")&&""===e?"/":e)}(h=f||(f={})).data="data",h.deferred="deferred",h.redirect="redirect",h.error="error"
const v=/^:[\w-]+$/,g=3,y=2,b=1,w=10,$=-2,O=t=>"*"===t
function R(t,e){let n=t.split("/"),r=n.length
return n.some(O)&&(r+=$),e&&(r+=y),n.filter(t=>!O(t)).reduce((t,e)=>t+(v.test(e)?g:""===e?b:w),r)}function x(t,e,n){let{routesMeta:r}=t,a={},o="/",i=[]
for(let l=0;l<r.length;++l){let t=r[l],n=l===r.length-1,u="/"===o?e:e.slice(o.length)||"/",c=E({path:t.relativePath,caseSensitive:t.caseSensitive,end:n},u),s=t.route
if(!c)return null
Object.assign(a,c.params),i.push({params:a,pathname:A([o,c.pathname]),pathnameBase:C(A([o,c.pathnameBase])),route:s}),"/"!==c.pathnameBase&&(o=A([o,c.pathnameBase]))}return i}function E(t,e){"string"==typeof t&&(t={path:t,caseSensitive:!1,end:!0})
let[n,r]=function(t,e,n){void 0===e&&(e=!1),void 0===n&&(n=!0),i("*"===t||!t.endsWith("*")||t.endsWith("/*"),'Route path "'+t+'" will be treated as if it were "'+t.replace(/\*$/,"/*")+'" because the `*` character must always follow a `/` in the pattern. To get rid of this warning, please change the route path to "'+t.replace(/\*$/,"/*")+'".')
let r=[],a="^"+t.replace(/\/*\*?$/,"").replace(/^\/*/,"/").replace(/[\\.*+^${}|()[\]]/g,"\\$&").replace(/\/:([\w-]+)(\?)?/g,(t,e,n)=>(r.push({paramName:e,isOptional:null!=n}),n?"/?([^\\/]+)?":"/([^\\/]+)"))
return t.endsWith("*")?(r.push({paramName:"*"}),a+="*"===t||"/*"===t?"(.*)$":"(?:\\/(.+)|\\/*)$"):n?a+="\\/*$":""!==t&&"/"!==t&&(a+="(?:(?=\\/|$))"),[RegExp(a,e?void 0:"i"),r]}(t.path,t.caseSensitive,t.end),a=e.match(n)
if(!a)return null
let o=a[0],l=o.replace(/(.)\/+$/,"$1"),u=a.slice(1)
return{params:r.reduce((t,e,n)=>{let{paramName:r,isOptional:a}=e
if("*"===r){let t=u[n]||""
l=o.slice(0,o.length-t.length).replace(/(.)\/+$/,"$1")}const i=u[n]
return t[r]=a&&!i?void 0:(i||"").replace(/%2F/g,"/"),t},{}),pathname:o,pathnameBase:l,pattern:t}}function L(t){try{return t.split("/").map(t=>decodeURIComponent(t).replace(/\//g,"%2F")).join("/")}catch(e){return i(!1,'The URL path "'+t+'" could not be decoded because it is is a malformed URL segment. This is probably due to a bad percent encoding ('+e+")."),t}}function S(t,e){if("/"===e)return t
if(!t.toLowerCase().startsWith(e.toLowerCase()))return null
let n=e.endsWith("/")?e.length-1:e.length,r=t.charAt(n)
return r&&"/"!==r?null:t.slice(n)||"/"}function j(t,e,n,r){return"Cannot include a '"+t+"' character in a manually specified `to."+e+"` field ["+JSON.stringify(r)+"].  Please separate it out to the `to."+n+'` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you.'}function P(t,e){let n=function(t){return t.filter((t,e)=>0===e||t.route.path&&t.route.path.length>0)}(t)
return e?n.map((t,e)=>e===n.length-1?t.pathname:t.pathnameBase):n.map(t=>t.pathnameBase)}function U(e,n,r,a){let i
void 0===a&&(a=!1),"string"==typeof e?i=s(e):(i=t({},e),o(!i.pathname||!i.pathname.includes("?"),j("?","pathname","search",i)),o(!i.pathname||!i.pathname.includes("#"),j("#","pathname","hash",i)),o(!i.search||!i.search.includes("#"),j("#","search","hash",i)))
let l,u=""===e||""===i.pathname,c=u?"/":i.pathname
if(null==c)l=r
else{let t=n.length-1
if(!a&&c.startsWith("..")){let e=c.split("/")
for(;".."===e[0];)e.shift(),t-=1
i.pathname=e.join("/")}l=0>t?"/":n[t]}let f=function(t,e){void 0===e&&(e="/")
let{pathname:n,search:r="",hash:a=""}="string"==typeof t?s(t):t,o=n?n.startsWith("/")?n:function(t,e){let n=e.replace(/\/+$/,"").split("/")
return t.split("/").forEach(t=>{".."===t?n.length>1&&n.pop():"."!==t&&n.push(t)}),n.length>1?n.join("/"):"/"}(n,e):e
return{pathname:o,search:M(r),hash:N(a)}}(i,l),h=c&&"/"!==c&&c.endsWith("/"),p=(u||"."===c)&&r.endsWith("/")
return f.pathname.endsWith("/")||!h&&!p||(f.pathname+="/"),f}const A=t=>t.join("/").replace(/\/\/+/g,"/"),C=t=>t.replace(/\/+$/,"").replace(/^\/*/,"/"),M=t=>t&&"?"!==t?t.startsWith("?")?t:"?"+t:"",N=t=>t&&"#"!==t?t.startsWith("#")?t:"#"+t:""
function _(t){return null!=t&&"number"==typeof t.status&&"string"==typeof t.statusText&&"boolean"==typeof t.internal&&"data"in t}const k=["post","put","patch","delete"]
new Set(k)
const I=["get",...k]
new Set(I)
const T=Object.freeze(Object.defineProperty({__proto__:null},Symbol.toStringTag,{value:"Module"}))
export{e as A,_ as a,a as b,c,P as g,o as i,A as j,p as m,s as p,U as r,S as s,T as w}
