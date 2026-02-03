import{u as b,_ as I,l as E}from"./index-DaAC2zqA.js";import{r as n,j as e,M as T,L as A,e as R,f as D,A as _}from"./react-vendor-JE9gdlBQ.js";import{b as P,a as M,L as B}from"./router-DL0rZlEF.js";import{w as y,d as O}from"./dark_logo(c)-CHybLdYU.js";import"./utils-2shQNo7D.js";import"./vendor-C1Py2TwH.js";function G(){const[r,v]=n.useState(!1),[l,w]=n.useState({email:"",password:""}),[d,m]=n.useState(!1),[g,u]=n.useState(""),[s,k]=n.useState(null),[j,S]=n.useState(y),[x,z]=n.useState("dark"),p=n.useRef(null),N=P(),F=M(),{isAuthenticated:Y,role:q}=b(),C=()=>{if(typeof window>"u")return"dark";const t=document.documentElement.getAttribute("data-theme")||document.body.getAttribute("data-theme");return t==="auto"?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":t||"dark"};n.useEffect(()=>{const t=()=>{const a=C();z(a),S(a==="dark"?O:y)};t();const o=new MutationObserver(t);o.observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme"]}),o.observe(document.body,{attributes:!0,attributeFilter:["data-theme"]});const i=window.matchMedia("(prefers-color-scheme: dark)");return i.addEventListener("change",t),()=>{o.disconnect(),i.removeEventListener("change",t)}},[]),n.useEffect(()=>{const t=new IntersectionObserver(o=>{o.forEach(i=>{i.isIntersecting&&!s&&(I(()=>import("./nikita-pishchugin-IdyI9y8BfB4-unsplash-CabSUqcr.js"),[]).then(a=>{k(a.default)}),t.disconnect())})},{rootMargin:"50px"});return p.current&&t.observe(p.current),()=>{t.disconnect()}},[s]);const h=t=>w({...l,[t.target.name]:t.target.value}),L=async t=>{var o,i,a,f;t.preventDefault();try{m(!0),u("");const c=await E(l.email,l.password);b.getState().login({token:c.access_token});const W=((i=(o=F.state)==null?void 0:o.from)==null?void 0:i.pathname)||"/tenant/overview";N(W,{replace:!0})}catch(c){u(((f=(a=c.response)==null?void 0:a.data)==null?void 0:f.detail)||"Login failed. Please check your credentials.")}finally{m(!1)}};return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        @media (max-width: 768px) {
          .login-image-container {
            display: none !important;
          }
          .login-form-container {
            width: 100% !important;
            padding: 16px !important;
          }
          .login-logo {
            height: 60px !important;
            top: 16px !important;
            left: 16px !important;
          }
          .login-title {
            font-size: 28px !important;
          }
          .login-subtitle {
            font-size: 14px !important;
            margin-top: 4px !important;
          }
          .login-label {
            font-size: 12px !important;
          }
          .login-input {
            padding: 12px 14px 12px 38px !important;
            font-size: 14px !important;
          }
          .login-icon {
            left: 12px !important;
            width: 14px !important;
            height: 14px !important;
          }
          .login-toggle-btn {
            right: 10px !important;
          }
          .login-toggle-icon {
            width: 14px !important;
            height: 14px !important;
          }
          .login-button {
            padding: 12px 20px !important;
            font-size: 14px !important;
          }
          .login-divider-text {
            font-size: 11px !important;
          }
          .login-link-text {
            font-size: 13px !important;
          }
          .login-error {
            font-size: 12px !important;
            padding: 10px !important;
          }
        }
      `}),e.jsx("main",{className:"bw","aria-label":"Auth",style:{margin:0,padding:0,height:"100vh",overflow:"hidden"},children:e.jsxs("div",{style:{display:"flex",height:"100vh",width:"100%"},children:[e.jsxs("div",{ref:p,className:"login-image-container",style:{width:"70%",height:"100%",position:"relative",backgroundImage:s?`url(${s})`:"none",backgroundColor:s?"transparent":"#f3f4f6",backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat",transition:"background-image 0.3s ease",display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"48px",paddingTop:"120px"},children:[e.jsx("div",{style:{position:"absolute",top:0,left:0,width:"100%",height:"100%",backgroundColor:"rgba(0, 0, 0, 0.6)",zIndex:1}}),e.jsx("div",{style:{color:"white",textAlign:"center",maxWidth:"600px",zIndex:2,position:"relative",padding:"32px"},children:e.jsx("p",{style:{fontFamily:"Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",fontSize:"20px",lineHeight:"1.6",fontWeight:300,textShadow:"0 2px 8px rgba(0, 0, 0, 0.5)",margin:0},children:"Deliver five‑star journeys with every mile. Keep your bookings, drivers, and customers in perfect sync so you can focus on exceptional service."})})]}),e.jsxs("div",{role:"form","aria-labelledby":"auth-title",className:"login-form-container",style:{width:"30%",height:"100%",position:"relative",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px",backgroundColor:"var(--bw-bg)",overflowY:"auto"},children:[e.jsx("img",{src:j,alt:"Logo",className:"login-logo",style:{position:"absolute",top:"24px",left:"24px",height:"95px",width:"auto",objectFit:"contain",zIndex:10}}),e.jsx("h2",{className:"login-title",style:{margin:0,fontSize:40,fontFamily:"DM Sans, sans-serif",fontWeight:200},children:"Welcome back"}),e.jsx("p",{className:"small-muted login-subtitle",style:{marginTop:6,fontSize:16,fontFamily:"Work Sans, sans-serif",fontWeight:300},children:"Sign in to continue"}),g&&e.jsx("div",{className:"login-error",style:{marginTop:16,padding:"12px",backgroundColor:"#fee2e2",border:"1px solid #fecaca",borderRadius:"4px",color:"#dc2626",fontSize:"14px",fontFamily:"Work Sans, sans-serif"},children:g}),e.jsxs("form",{onSubmit:L,style:{marginTop:16,width:"100%"},children:[e.jsx("label",{className:"small-muted login-label",htmlFor:"email",style:{fontFamily:"Work Sans, sans-serif"},children:"Email"}),e.jsxs("div",{style:{position:"relative",marginTop:6,marginBottom:12},children:[e.jsx(T,{className:"login-icon",size:16,"aria-hidden":!0,style:{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",opacity:.7,color:x==="dark"?"#000000":void 0}}),e.jsx("input",{id:"email",name:"email",type:"email",required:!0,className:"bw-input login-input",style:{padding:"16px 18px 16px 44px",borderRadius:0,fontFamily:"Work Sans, sans-serif"},placeholder:"you@email",onChange:h})]}),e.jsx("label",{className:"small-muted login-label",htmlFor:"password",style:{fontFamily:"Work Sans, sans-serif"},children:"Password"}),e.jsxs("div",{style:{position:"relative",marginTop:6},children:[e.jsx(A,{className:"login-icon",size:16,"aria-hidden":!0,style:{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",opacity:.7,color:x==="dark"?"#000000":void 0}}),e.jsx("input",{id:"password",name:"password",type:r?"text":"password",required:!0,className:"bw-input login-input",style:{padding:"16px 18px 16px 44px",borderRadius:0,fontFamily:"Work Sans, sans-serif"},placeholder:"••••••••",onChange:h}),e.jsx("button",{type:"button","aria-label":"Toggle password",className:"login-toggle-btn",onClick:()=>v(!r),style:{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"transparent",border:0,color:"#4c4e4eff"},children:r?e.jsx(R,{className:"login-toggle-icon",size:16}):e.jsx(D,{className:"login-toggle-icon",size:16})})]}),e.jsxs("button",{className:"bw-btn login-button",style:{width:"100%",marginTop:16,borderRadius:0,padding:"14px 24px",fontFamily:"Work Sans, sans-serif",fontWeight:500},disabled:d,children:[e.jsx("span",{children:d?"Signing in...":"Sign in"}),!d&&e.jsx(_,{size:16,"aria-hidden":!0})]}),e.jsxs("div",{style:{marginTop:24,width:"100%"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",marginBottom:16,gap:12},children:[e.jsx("div",{style:{flex:1,height:"1px",backgroundColor:"var(--bw-border)"}}),e.jsx("span",{className:"small-muted login-divider-text",style:{fontSize:"12px",fontFamily:"Work Sans, sans-serif"},children:"or"}),e.jsx("div",{style:{flex:1,height:"1px",backgroundColor:"var(--bw-border)"}})]}),e.jsx("p",{className:"small-muted login-link-text",style:{textAlign:"center",marginBottom:16,fontSize:"14px",fontFamily:"Work Sans, sans-serif"},children:"Don't have an account?"}),e.jsx(B,{to:"/signup",style:{textDecoration:"none",display:"block"},children:e.jsx("button",{className:"bw-btn login-button",style:{width:"100%",borderRadius:0,padding:"14px 24px",background:"var(--bw-bg)",color:"var(--bw-fg)",border:"1px solid var(--bw-fg)",fontFamily:"Work Sans, sans-serif",fontWeight:500},children:"Create account"})})]})]})]})]})})]})}export{G as default};
