import{h as S,i as $,r as T,k as A,j as e,x as R,A as U,C as M,D as N,b2 as C,b3 as w,a as P,b as B,b4 as E,a6 as X,a7 as D,B as v,a8 as F,m as O}from"./index-Bbtx-9Vv.js";import{P as W}from"./MenuItem-BivmY2tO.js";import{C as K}from"./Container-zL0dTZ3J.js";import{A as V,a as J,b as L}from"./ExpandMore-CCICA9lh.js";import{T as q}from"./TextField-D8eUR7XE.js";function z(a){return String(a).match(/[\d.\-+]*\s*(.*)/)[1]||""}function G(a){return parseFloat(a)}function H(a){return S("MuiSkeleton",a)}$("MuiSkeleton",["root","text","rectangular","rounded","circular","pulse","wave","withChildren","fitContent","heightAuto"]);const Q=a=>{const{classes:s,variant:t,animation:n,hasChildren:o,width:r,height:l}=a;return U({root:["root",t,n,o&&"withChildren",o&&!r&&"fitContent",o&&!l&&"heightAuto"]},H,s)},g=w`
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 1;
  }
`,y=w`
  0% {
    transform: translateX(-100%);
  }

  50% {
    /* +0.5s of delay between each loop */
    transform: translateX(100%);
  }

  100% {
    transform: translateX(100%);
  }
`,Y=typeof g!="string"?C`
        animation: ${g} 2s ease-in-out 0.5s infinite;
      `:null,Z=typeof y!="string"?C`
        &::after {
          animation: ${y} 2s linear 0.5s infinite;
        }
      `:null,_=M("span",{name:"MuiSkeleton",slot:"Root",overridesResolver:(a,s)=>{const{ownerState:t}=a;return[s.root,s[t.variant],t.animation!==!1&&s[t.animation],t.hasChildren&&s.withChildren,t.hasChildren&&!t.width&&s.fitContent,t.hasChildren&&!t.height&&s.heightAuto]}})(N(({theme:a})=>{const s=z(a.shape.borderRadius)||"px",t=G(a.shape.borderRadius);return{display:"block",backgroundColor:a.vars?a.vars.palette.Skeleton.bg:a.alpha(a.palette.text.primary,a.palette.mode==="light"?.11:.13),height:"1.2em",variants:[{props:{variant:"text"},style:{marginTop:0,marginBottom:0,height:"auto",transformOrigin:"0 55%",transform:"scale(1, 0.60)",borderRadius:`${t}${s}/${Math.round(t/.6*10)/10}${s}`,"&:empty:before":{content:'"\\00a0"'}}},{props:{variant:"circular"},style:{borderRadius:"50%"}},{props:{variant:"rounded"},style:{borderRadius:(a.vars||a).shape.borderRadius}},{props:({ownerState:n})=>n.hasChildren,style:{"& > *":{visibility:"hidden"}}},{props:({ownerState:n})=>n.hasChildren&&!n.width,style:{maxWidth:"fit-content"}},{props:({ownerState:n})=>n.hasChildren&&!n.height,style:{height:"auto"}},{props:{animation:"pulse"},style:Y||{animation:`${g} 2s ease-in-out 0.5s infinite`}},{props:{animation:"wave"},style:{position:"relative",overflow:"hidden",WebkitMaskImage:"-webkit-radial-gradient(white, black)","&::after":{background:`linear-gradient(
                90deg,
                transparent,
                ${(a.vars||a).palette.action.hover},
                transparent
              )`,content:'""',position:"absolute",transform:"translateX(-100%)",bottom:0,left:0,right:0,top:0}}},{props:{animation:"wave"},style:Z||{"&::after":{animation:`${y} 2s linear 0.5s infinite`}}}]}})),b=T.forwardRef(function(s,t){const n=A({props:s,name:"MuiSkeleton"}),{animation:o="pulse",className:r,component:l="span",height:p,style:m,variant:h="text",width:u,...c}=n,i={...n,animation:o,component:l,variant:h,hasChildren:!!c.children},f=Q(i);return e.jsx(_,{as:l,ref:t,className:R(f.root,r),ownerState:i,...c,style:{width:u,height:p,...m}})}),I=O()(a=>({container:{paddingTop:a.spacing(3),paddingBottom:a.spacing(3)},buttons:{display:"flex",justifyContent:"space-between",marginTop:a.spacing(3),gap:a.spacing(2)}}));function ia({endpoint:a,item:s,setItem:t,defaultItem:n,validate:o,onItemSaved:r,menu:l,breadcrumbs:p,children:m}){const h=P(),{classes:u}=I(),c=B(),{id:i}=E();X(async({signal:d})=>{if(!s)if(i){const x=await(await fetch(`/api/${a}/${i}`,{signal:d})).json();t(x)}else t(n)},[i,s,n,a,t]);const f=D(async()=>{const d=i?`/api/${a}/${i}`:`/api/${a}`,j=await(await fetch(d,{method:i?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)})).json();r&&r(j),h(-1)});return e.jsx(W,{menu:l,breadcrumbs:p,children:e.jsx(K,{maxWidth:"xs",className:u.container,children:s?e.jsxs(e.Fragment,{children:[m,e.jsxs("div",{className:u.buttons,children:[e.jsx(v,{color:"primary",variant:"outlined",onClick:()=>h(-1),children:c("sharedCancel")}),e.jsx(v,{color:"primary",variant:"contained",onClick:f,disabled:!o(),children:c("sharedSave")})]})]}):e.jsxs(V,{defaultExpanded:!0,children:[e.jsx(J,{children:e.jsx(F,{variant:"subtitle1",children:e.jsx(b,{width:"10em"})})}),e.jsx(L,{children:[1,2,3].map(d=>e.jsx(b,{width:"100%",children:e.jsx(q,{})},d))})]})})})}export{ia as E};
