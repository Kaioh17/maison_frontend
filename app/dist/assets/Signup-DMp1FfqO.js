import{_ as te,c as se,l as ne,u as ie}from"./index-DaAC2zqA.js";import{r as i,j as e,e as ae,f as oe,I as re}from"./react-vendor-JE9gdlBQ.js";import{b as le,L as pe}from"./router-DL0rZlEF.js";import{w as I,d as de}from"./dark_logo(c)-CHybLdYU.js";import"./utils-2shQNo7D.js";import"./vendor-C1Py2TwH.js";function he(){const[c,E]=i.useState(""),[u,D]=i.useState(""),[g,T]=i.useState(!1),[y,P]=i.useState(""),[b,A]=i.useState(""),[v,_]=i.useState(""),[w,M]=i.useState(""),[r,H]=i.useState(""),[j,$]=i.useState(""),[p,S]=i.useState(null),[k,N]=i.useState(null),[C,B]=i.useState(null),[z,m]=i.useState(null),[W,x]=i.useState(!1),[f,F]=i.useState(null),[l,U]=i.useState(null),[q,O]=i.useState(I),[Y,V]=i.useState("dark"),h=i.useRef(null),Q=le(),G=()=>{if(typeof window>"u")return"dark";const t=document.documentElement.getAttribute("data-theme")||document.body.getAttribute("data-theme");return t==="auto"?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":t||"dark"};i.useEffect(()=>{const t=()=>{const a=G();V(a),O(a==="dark"?de:I)};t();const n=new MutationObserver(t);n.observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme"]}),n.observe(document.body,{attributes:!0,attributeFilter:["data-theme"]});const s=window.matchMedia("(prefers-color-scheme: dark)");return s.addEventListener("change",t),()=>{n.disconnect(),s.removeEventListener("change",t)}},[]);const J=t=>{const s=t.replace(/\D/g,"").slice(0,10);return s.length===0?"":s.length<=3?`(${s}`:s.length<=6?`(${s.slice(0,3)}) ${s.slice(3)}`:`(${s.slice(0,3)}) ${s.slice(3,6)}-${s.slice(6)}`},K=t=>{const n=J(t.target.value);_(n)},R=t=>t?/^[a-z0-9-]+$/.test(t)?/^[a-z0-9]/.test(t)?/[a-z0-9]$/.test(t)?t.includes("--")?"Slug cannot contain consecutive hyphens":null:"Slug must end with a letter or number":"Slug must start with a letter or number":"Slug can only contain lowercase letters, numbers, and hyphens":null,X=t=>{const n=t.target.value.toLowerCase();H(n);const s=R(n);F(s)},Z=t=>{var s;const n=(s=t.target.files)==null?void 0:s[0];if(n){S(n);const a=new FileReader;a.onload=o=>{var d;N((d=o.target)==null?void 0:d.result)},a.readAsDataURL(n)}},L=()=>{S(null),N(null);const t=document.getElementById("logo-upload");t&&(t.value="")};i.useEffect(()=>{const t=new IntersectionObserver(n=>{n.forEach(s=>{s.isIntersecting&&!l&&(te(()=>import("./photo-1526289034009-0240ddb68ce3-CRaaIUft.js"),[]).then(a=>{U(a.default)}),t.disconnect())})},{rootMargin:"50px"});return h.current&&t.observe(h.current),()=>{t.disconnect()}},[l]);const ee=async t=>{var s,a;t.preventDefault(),B(null),m(null);const n=R(r);if(n){F(n),m("Please fix the slug format before submitting");return}try{const o=v.replace(/\D/g,"");await se({email:c,first_name:y,last_name:b,password:u,phone_no:o,company_name:w,slug:r,city:j,logo_url:p});const d=await ne(c,u);ie.getState().login({token:d.access_token}),Q("/subscription")}catch(o){m(((a=(s=o==null?void 0:o.response)==null?void 0:s.data)==null?void 0:a.detail)||o.message||"Failed to create account")}};return e.jsxs("main",{className:"bw","aria-label":"Create account",style:{margin:0,padding:0,height:"100vh",overflow:"hidden"},children:[e.jsx("style",{children:`
        @media (max-width: 768px) {
          .signup-image-container {
            display: none !important;
          }
          .signup-form-container {
            width: 100% !important;
            padding: 16px 24px !important;
            height: auto !important;
            min-height: 100vh !important;
          }
          .signup-form-grid {
            grid-template-columns: 1fr !important;
          }
          .signup-form {
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .signup-main-container {
            flex-direction: column !important;
          }
          .signup-logo {
            height: 60px !important;
            top: 16px !important;
            left: 16px !important;
          }
          .signup-title {
            font-size: 28px !important;
          }
          .signup-subtitle {
            font-size: 14px !important;
            margin-top: 4px !important;
          }
          .signup-label {
            font-size: 12px !important;
          }
          .signup-input {
            padding: 12px 14px 12px 14px !important;
            font-size: 14px !important;
          }
          .signup-input-password {
            padding: 12px 14px 12px 14px !important;
            padding-right: 38px !important;
            font-size: 14px !important;
          }
          .signup-toggle-btn {
            right: 10px !important;
          }
          .signup-toggle-icon {
            width: 14px !important;
            height: 14px !important;
          }
          .signup-button {
            padding: 12px 20px !important;
            font-size: 14px !important;
          }
          .signup-link-text {
            font-size: 13px !important;
          }
          .signup-error {
            font-size: 12px !important;
          }
          .signup-message {
            font-size: 12px !important;
          }
          .signup-logo-label {
            font-size: 12px !important;
          }
          .signup-logo-link {
            font-size: 13px !important;
          }
          .signup-logo-cancel {
            font-size: 11px !important;
          }
          .signup-slug-info {
            font-size: 11px !important;
            width: 280px !important;
          }
          .signup-slug-error {
            font-size: 11px !important;
          }
          .signup-modal {
            padding: 20px !important;
          }
          .signup-modal-title {
            font-size: 20px !important;
          }
          .signup-modal-content {
            font-size: 13px !important;
          }
          .signup-modal-heading {
            font-size: 14px !important;
          }
          .signup-modal-code {
            font-size: 12px !important;
          }
        }
      `}),e.jsxs("div",{className:"signup-main-container",style:{display:"flex",height:"100vh",width:"100%"},children:[e.jsx("div",{ref:h,className:"signup-image-container",style:{width:"65%",height:"100%",position:"relative",backgroundImage:l?`url(${l})`:"none",backgroundColor:l?"transparent":"#f3f4f6",backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat",transition:"background-image 0.3s ease",display:"flex",alignItems:"center",justifyContent:"center",padding:"48px"},children:e.jsxs("div",{style:{color:"white",textAlign:"center",maxWidth:"600px",zIndex:2,padding:"32px"},children:[e.jsx("h1",{style:{fontFamily:"DM Sans, sans-serif",fontSize:"40px",fontWeight:200,margin:"0 0 16px 0"},children:"Welcome to Maison"}),e.jsx("p",{style:{fontFamily:"Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",fontSize:"20px",lineHeight:"1.6",fontWeight:300,margin:0},children:"where technology meets timeless service. Whether you're managing one car or an entire fleet, our platform gives you the tools to organize, grow, and impress. Because running a premium transportation business should feel as smooth as the rides you deliver."})]})}),e.jsxs("div",{role:"form","aria-labelledby":"signup-title",className:"signup-form-container",style:{width:"35%",height:"100%",position:"relative",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px",backgroundColor:"var(--bw-bg)",overflowY:"auto"},children:[e.jsx("img",{src:q,alt:"Maison Logo",className:"signup-logo",style:{position:"absolute",top:"24px",left:"24px",height:"95px",width:"auto",objectFit:"contain",zIndex:10}}),e.jsx("h1",{id:"signup-title",className:"signup-title",style:{margin:0,fontSize:40,fontFamily:"DM Sans, sans-serif",fontWeight:200},children:"Create account"}),e.jsx("p",{className:"small-muted signup-subtitle",style:{marginTop:6,fontSize:16,fontFamily:"Work Sans, sans-serif",fontWeight:300},children:"Set up your company profile in minutes."}),e.jsxs("form",{onSubmit:ee,className:"vstack signup-form-grid signup-form",style:{display:"grid",gap:12,marginTop:16,width:"100%"},children:[e.jsxs("div",{className:"signup-form-grid",style:{display:"grid",gap:12,gridTemplateColumns:"1fr 1fr"},children:[e.jsxs("label",{className:"small-muted",style:{fontFamily:"Work Sans, sans-serif"},children:["First name",e.jsx("input",{className:"bw-input signup-input",value:y,onChange:t=>P(t.target.value),style:{padding:"16px 18px 16px 18px",borderRadius:0,fontFamily:"Work Sans, sans-serif"}})]}),e.jsxs("label",{className:"small-muted",style:{fontFamily:"Work Sans, sans-serif"},children:["Last name",e.jsx("input",{className:"bw-input signup-input",value:b,onChange:t=>A(t.target.value),style:{padding:"16px 18px 16px 18px",borderRadius:0,fontFamily:"Work Sans, sans-serif"}})]})]}),e.jsxs("div",{className:"signup-form-grid",style:{display:"grid",gap:12,gridTemplateColumns:"1fr 1fr"},children:[e.jsxs("label",{className:"small-muted",style:{fontFamily:"Work Sans, sans-serif"},children:["Email",e.jsx("div",{style:{position:"relative",marginTop:6},children:e.jsx("input",{className:"bw-input signup-input",type:"email",value:c,onChange:t=>E(t.target.value),required:!0,style:{padding:"16px 18px 16px 18px",borderRadius:0,fontFamily:"Work Sans, sans-serif"}})})]}),e.jsxs("label",{className:"small-muted",style:{fontFamily:"Work Sans, sans-serif"},children:["Password",e.jsxs("div",{style:{position:"relative",marginTop:6},children:[e.jsx("input",{className:"bw-input",type:g?"text":"password",value:u,onChange:t=>D(t.target.value),required:!0,style:{padding:"16px 18px 16px 18px",paddingRight:"44px",borderRadius:0,fontFamily:"Work Sans, sans-serif"}}),e.jsx("button",{type:"button","aria-label":"Toggle password",onClick:()=>T(!g),style:{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"transparent",border:0,color:"#4c4e4eff",cursor:"pointer"},children:g?e.jsx(ae,{size:16}):e.jsx(oe,{size:16})})]})]})]}),e.jsxs("div",{className:"signup-form-grid",style:{display:"grid",gap:12,gridTemplateColumns:"1fr 1fr"},children:[e.jsxs("label",{className:"small-muted",style:{display:"flex",flexDirection:"column",gap:"6px",fontFamily:"Work Sans, sans-serif"},children:["Phone",e.jsx("input",{className:"bw-input signup-input",type:"tel",placeholder:"(555) 555-5555",value:v,onChange:K,maxLength:14,style:{padding:"16px 18px 16px 18px",borderRadius:0,fontFamily:"Work Sans, sans-serif"}})]}),e.jsxs("label",{className:"small-muted",style:{fontFamily:"Work Sans, sans-serif"},children:["Company",e.jsx("input",{className:"bw-input signup-input",value:w,onChange:t=>M(t.target.value),style:{padding:"16px 18px 16px 18px",borderRadius:0,fontFamily:"Work Sans, sans-serif"}})]})]}),e.jsxs("div",{className:"signup-form-grid",style:{display:"grid",gap:12,gridTemplateColumns:"1fr 1fr"},children:[e.jsxs("label",{className:"small-muted",style:{position:"relative",fontFamily:"Work Sans, sans-serif"},children:[e.jsxs("span",{style:{display:"flex",alignItems:"center",gap:"6px"},children:["Slug",e.jsxs("div",{style:{position:"relative",display:"inline-block"},onMouseEnter:t=>{W||t.currentTarget.setAttribute("data-hover","true")},onMouseLeave:t=>{t.currentTarget.removeAttribute("data-hover")},onClick:t=>{t.stopPropagation(),x(!0)},children:[e.jsx(re,{size:14,style:{cursor:"pointer",color:"var(--bw-muted)",opacity:.7}}),e.jsxs("div",{className:"slug-info-preview",style:{position:"absolute",bottom:"100%",left:"0",marginBottom:"8px",padding:"10px 14px",backgroundColor:"var(--bw-bg-secondary)",border:"1px solid var(--bw-border)",borderRadius:"6px",color:"var(--bw-text)",fontSize:"12px",zIndex:1e3,boxShadow:"0 2px 8px rgba(0, 0, 0, 0.15)",width:"320px",textAlign:"left",pointerEvents:"none",opacity:0,transition:"opacity 0.2s ease",lineHeight:"1.5",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden",textOverflow:"ellipsis"},children:["Your slug creates unique branded URLs for your riders. Click to learn more about format requirements and how slugs work in the white-labeling system.",e.jsx("div",{style:{position:"absolute",top:"100%",left:"20px",width:0,height:0,borderLeft:"6px solid transparent",borderRight:"6px solid transparent",borderTop:"6px solid var(--bw-border)"}})]})]})]}),e.jsx("input",{className:"bw-input signup-input",placeholder:"my-company",value:r,onChange:X,style:{padding:"16px 18px 16px 18px",borderRadius:0,fontFamily:"Work Sans, sans-serif",borderColor:f?"#ef4444":void 0}}),f&&e.jsx("div",{style:{marginTop:"4px",fontSize:"12px",color:"#ef4444",fontFamily:"Work Sans, sans-serif"},children:f})]}),e.jsxs("label",{className:"small-muted",style:{fontFamily:"Work Sans, sans-serif"},children:["City",e.jsx("input",{className:"bw-input signup-input",value:j,onChange:t=>$(t.target.value),style:{padding:"16px 18px 16px 18px",borderRadius:0,fontFamily:"Work Sans, sans-serif"}})]})]}),e.jsxs("div",{className:"bw-form-group",children:[e.jsx("label",{className:"small-muted",style:{fontFamily:"Work Sans, sans-serif"},children:"Company Logo (optional)"}),e.jsxs("div",{style:{display:"flex",gap:12,alignItems:"center"},children:[e.jsx("input",{type:"file",accept:"image/*",onChange:Z,style:{display:"none"},id:"logo-upload"}),e.jsx("a",{href:"#",onClick:t=>{var n;t.preventDefault(),(n=document.getElementById("logo-upload"))==null||n.click()},style:{color:"var(--bw-accent)",textDecoration:"underline",cursor:"pointer",fontSize:"14px",fontFamily:"Work Sans, sans-serif"},children:p?"Change Logo":"Upload Logo"}),p&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"small-muted",style:{fontSize:"12px",fontFamily:"Work Sans, sans-serif"},children:p.name}),e.jsx("a",{href:"#",onClick:t=>{t.preventDefault(),L()},style:{color:"#dc2626",textDecoration:"underline",cursor:"pointer",fontSize:"12px",fontFamily:"Work Sans, sans-serif"},children:"Cancel"})]})]}),k&&e.jsxs("div",{style:{marginTop:8,position:"relative",display:"inline-block"},children:[e.jsx("img",{src:k,alt:"Logo preview",style:{maxWidth:"100px",maxHeight:"100px",objectFit:"contain",border:"1px solid #ddd",borderRadius:"4px"}}),e.jsx("a",{href:"#",onClick:t=>{t.preventDefault(),L()},style:{position:"absolute",top:"-8px",right:"-8px",color:"#dc2626",textDecoration:"underline",cursor:"pointer",fontSize:"12px",backgroundColor:"white",padding:"2px 6px",borderRadius:"4px",border:"1px solid #ddd",fontFamily:"Work Sans, sans-serif"},children:"×"})]})]}),z&&e.jsx("div",{className:"small-muted signup-error",style:{color:"#ffb3b3",fontFamily:"Work Sans, sans-serif"},children:z}),C&&e.jsx("div",{className:"small-muted signup-message",style:{color:"#b3ffcb",fontFamily:"Work Sans, sans-serif"},children:C}),e.jsx("button",{className:"bw-btn signup-button",type:"submit",style:{color:Y==="dark"?"#000000":"#ffffffff",borderRadius:0,fontFamily:"Work Sans, sans-serif",fontWeight:500},children:"Create account"}),e.jsxs("div",{style:{marginTop:12,textAlign:"center"},children:[e.jsx("span",{className:"small-muted signup-link-text",style:{fontFamily:"Work Sans, sans-serif"},children:"Already have an account? "}),e.jsx(pe,{to:"/tenant/login",className:"signup-link-text",style:{marginLeft:6,color:"var(--bw-accent)",textDecoration:"underline",cursor:"pointer",fontFamily:"Work Sans, sans-serif"},children:"sign in"})]})]})]})]}),W&&e.jsx("div",{style:{position:"fixed",top:0,left:0,right:0,bottom:0,backgroundColor:"rgba(0, 0, 0, 0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1e4,padding:"20px"},onClick:()=>x(!1),children:e.jsxs("div",{className:"signup-modal",style:{backgroundColor:"var(--bw-bg)",border:"1px solid var(--bw-border)",borderRadius:"12px",padding:"32px",maxWidth:"600px",width:"100%",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 4px 20px rgba(0, 0, 0, 0.3)",position:"relative"},onClick:t=>t.stopPropagation(),children:[e.jsx("button",{onClick:()=>x(!1),style:{position:"absolute",top:"16px",right:"16px",background:"transparent",border:"none",fontSize:"24px",cursor:"pointer",color:"var(--bw-text)",padding:"4px 8px",borderRadius:"4px",lineHeight:1},"aria-label":"Close",children:"×"}),e.jsx("h2",{className:"signup-modal-title",style:{margin:"0 0 20px 0",fontSize:"24px",fontWeight:600,fontFamily:"DM Sans, sans-serif",color:"var(--bw-text)"},children:"About Slugs"}),e.jsxs("div",{className:"signup-modal-content",style:{display:"flex",flexDirection:"column",gap:"20px",fontFamily:"Work Sans, sans-serif",color:"var(--bw-text)"},children:[e.jsxs("div",{children:[e.jsx("h3",{className:"signup-modal-heading",style:{margin:"0 0 8px 0",fontSize:"16px",fontWeight:600,color:"var(--bw-text)"},children:"What is a Slug?"}),e.jsx("p",{className:"signup-modal-content",style:{margin:0,fontSize:"14px",lineHeight:"1.6",color:"var(--bw-text)",opacity:.9},children:"A slug is a URL-friendly identifier that creates a unique path for your company's white-labeled pages. It's used to create tenant-specific URLs for your riders."})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"signup-modal-heading",style:{margin:"0 0 8px 0",fontSize:"16px",fontWeight:600,color:"var(--bw-text)"},children:"How It Works"}),e.jsx("p",{className:"signup-modal-content",style:{margin:"0 0 12px 0",fontSize:"14px",lineHeight:"1.6",color:"var(--bw-text)",opacity:.9},children:"Once you set your slug, your riders will access your branded pages through URLs like:"}),e.jsxs("div",{className:"signup-modal-code",style:{padding:"12px",backgroundColor:"var(--bw-bg-secondary)",border:"1px solid var(--bw-border)",borderRadius:"6px",fontFamily:"monospace",fontSize:"13px",color:"var(--bw-accent)"},children:[e.jsxs("div",{style:{marginBottom:"4px"},children:["• ",e.jsx("strong",{children:"Login:"})," /",r||"your-slug","/riders/login"]}),e.jsxs("div",{style:{marginBottom:"4px"},children:["• ",e.jsx("strong",{children:"Registration:"})," /",r||"your-slug","/riders/register"]}),e.jsxs("div",{children:["• ",e.jsx("strong",{children:"Dashboard:"})," /",r||"your-slug","/rider/dashboard"]})]})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"signup-modal-heading",style:{margin:"0 0 8px 0",fontSize:"16px",fontWeight:600,color:"var(--bw-text)"},children:"Format Requirements"}),e.jsxs("ul",{className:"signup-modal-content",style:{margin:0,paddingLeft:"20px",fontSize:"14px",lineHeight:"1.8",color:"var(--bw-text)",opacity:.9},children:[e.jsx("li",{children:"Use only lowercase letters, numbers, and hyphens"}),e.jsx("li",{children:"No spaces or special characters"}),e.jsx("li",{children:"Must start and end with a letter or number"}),e.jsxs("li",{children:["Examples: ",e.jsx("code",{style:{backgroundColor:"var(--bw-bg-secondary)",padding:"2px 6px",borderRadius:"3px"},children:"my-company"}),", ",e.jsx("code",{style:{backgroundColor:"var(--bw-bg-secondary)",padding:"2px 6px",borderRadius:"3px"},children:"ridez123"}),", ",e.jsx("code",{style:{backgroundColor:"var(--bw-bg-secondary)",padding:"2px 6px",borderRadius:"3px"},children:"premium-transport"})]})]})]}),e.jsxs("div",{className:"signup-modal-content",style:{padding:"12px",backgroundColor:"rgba(59, 130, 246, 0.1)",border:"1px solid rgba(59, 130, 246, 0.3)",borderRadius:"6px",fontSize:"13px",color:"var(--bw-text)"},children:[e.jsx("strong",{children:"Note:"})," Your slug must be unique. If the slug you choose is already taken, you'll need to select a different one."]})]})]})}),e.jsx("style",{children:`
        [data-hover="true"] .slug-info-preview {
          opacity: 1 !important;
        }
      `})]})}export{he as default};
