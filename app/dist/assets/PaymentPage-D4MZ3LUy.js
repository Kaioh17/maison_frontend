import{r as p,j as e,ag as k,Z as P,ah as C}from"./react-vendor-JE9gdlBQ.js";import{E,l as z,u as F,a as W,P as T}from"./stripe-BEfo7vFG.js";import{S as R}from"./index-DaAC2zqA.js";import{u as B}from"./useFavicon-Bc8ZFvv0.js";import{b as j,a as I}from"./router-DL0rZlEF.js";import"./vendor-C1Py2TwH.js";import"./utils-2shQNo7D.js";const D=n=>{const a={};return n&&(a.stripeAccount=n),z(R,a)};function _({booking:n,clientSecret:a}){const s=F(),o=W(),d=j(),[t,m]=p.useState(!1),[f,c]=p.useState(""),[b,u]=p.useState(""),g=async r=>{if(r.preventDefault(),!(!s||!o)){m(!0),c("");try{const{error:x}=await o.submit();if(x){c(x.message||"Please check your payment details."),m(!1);return}const{error:l,paymentIntent:i}=await s.confirmPayment({elements:o,clientSecret:a,confirmParams:{return_url:`${window.location.origin}/rider/booking-success`},redirect:"if_required"});if(l){c(l.message||"Payment failed. Please try again."),m(!1);return}i&&i.status==="succeeded"&&d("/rider/booking-success",{state:{booking:n}})}catch(x){c(x.message||"An error occurred. Please try again."),m(!1)}}};return e.jsxs("form",{onSubmit:g,style:{width:"100%"},children:[f&&e.jsx("div",{style:{padding:"clamp(12px, 2vw, 16px)",backgroundColor:"rgba(239, 68, 68, 0.1)",border:"1px solid #ef4444",borderRadius:"8px",color:"#ef4444",marginBottom:"clamp(20px, 3vw, 24px)",fontSize:"clamp(13px, 2vw, 14px)",fontFamily:"Work Sans, sans-serif"},children:f}),e.jsxs("div",{style:{backgroundColor:"var(--bw-card-bg, var(--bw-bg))",border:"1px solid var(--bw-border)",borderRadius:"12px",padding:"clamp(20px, 4vw, 24px)",marginBottom:"clamp(24px, 4vw, 32px)"},children:[e.jsx(T,{}),e.jsx("style",{children:`
          /* Reduce font size of Stripe terms text */
          .pii-consent-text,
          [data-testid="pii-consent-text"],
          .pii-consent-text p,
          div[class*="pii"],
          div[class*="consent"] {
            font-size: clamp(10px, 1.5vw, 11px) !important;
          }
          /* Target Stripe's terms text more specifically */
          form > div > div:last-child,
          .StripeElement + div,
          div[class*="Stripe"] div[class*="text"]:last-child {
            font-size: clamp(10px, 1.5vw, 11px) !important;
          }
        `})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"clamp(12px, 2.5vw, 16px)"},children:[e.jsx("button",{type:"submit",disabled:!s||!o||t,style:{width:"100%",padding:"clamp(16px, 2.5vw, 20px) clamp(20px, 4vw, 24px)",borderRadius:"12px",backgroundColor:"#10b981",color:"#ffffff",border:"none",cursor:!s||!o||t?"not-allowed":"pointer",fontFamily:"Work Sans, sans-serif",fontWeight:600,fontSize:"clamp(16px, 3vw, 18px)",opacity:!s||!o||t?.6:1,transition:"all 0.2s ease",boxShadow:!s||!o||t?"none":"0 4px 12px rgba(16, 185, 129, 0.3)",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"},onMouseEnter:r=>{s&&o&&!t&&(r.currentTarget.style.transform="translateY(-1px)",r.currentTarget.style.boxShadow="0 6px 16px rgba(16, 185, 129, 0.4)")},onMouseLeave:r=>{s&&o&&!t&&(r.currentTarget.style.transform="translateY(0)",r.currentTarget.style.boxShadow="0 4px 12px rgba(16, 185, 129, 0.3)")},children:t?e.jsxs(e.Fragment,{children:[e.jsx(k,{size:20,style:{animation:"spin 1s linear infinite"}}),"Processing Payment..."]}):e.jsxs(e.Fragment,{children:[e.jsx(P,{size:20}),"Pay $",n.estimated_price.toFixed(2)]})}),e.jsxs("button",{type:"button",onClick:()=>d("/rider/dashboard",{replace:!0}),disabled:t,style:{width:"100%",padding:"clamp(14px, 2.5vw, 18px) clamp(20px, 4vw, 24px)",borderRadius:"12px",backgroundColor:"transparent",color:"#6b7280",border:"1px solid var(--bw-border)",cursor:t?"not-allowed":"pointer",fontFamily:"Work Sans, sans-serif",fontWeight:600,fontSize:"clamp(14px, 2.5vw, 16px)",opacity:t?.6:1,transition:"all 0.2s ease",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"},onMouseEnter:r=>{t||(r.currentTarget.style.backgroundColor="var(--bw-bg-hover)")},onMouseLeave:r=>{t||(r.currentTarget.style.backgroundColor="transparent")},children:[e.jsx(C,{size:18}),"Cancel"]})]}),e.jsx("style",{children:`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        /* Reduce font size of Stripe terms text */
        .pii-consent-text,
        [data-testid="pii-consent-text"],
        .pii-consent-text p,
        div[class*="pii"],
        div[class*="consent"],
        form > div > div:last-child p,
        .StripeElement + div p,
        div[class*="Stripe"] div[class*="text"]:last-child {
          font-size: clamp(10px, 1.5vw, 11px) !important;
        }
      `})]})}function q(){B();const n=j(),a=I(),[s,o]=p.useState(null),[d,t]=p.useState(""),[m,f]=p.useState(""),[c,b]=p.useState(null);if(p.useEffect(()=>{var w,h,S;const l=(w=a.state)==null?void 0:w.booking,i=(h=a.state)==null?void 0:h.clientSecret;if(!l||!i){n("/rider/book",{replace:!0});return}o(l),t(i);const v=(S=l.payment)==null?void 0:S.tenant_acct_id,y=D(v);b(y)},[a.state,n]),!c)return e.jsx("div",{style:{minHeight:"100vh",backgroundColor:"var(--bw-bg)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Work Sans, sans-serif"},children:e.jsx("div",{style:{padding:"clamp(20px, 4vw, 24px)",backgroundColor:"rgba(239, 68, 68, 0.1)",border:"1px solid #ef4444",borderRadius:"12px",color:"#ef4444",fontSize:"clamp(14px, 2.5vw, 16px)"},children:"Stripe is not configured. Please contact support."})});if(!s||!d)return e.jsx("div",{style:{minHeight:"100vh",backgroundColor:"var(--bw-bg)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Work Sans, sans-serif"},children:e.jsx("div",{style:{color:"var(--bw-text)",fontSize:"16px"},children:"Loading..."})});const u=(l,i)=>{if(typeof window>"u")return i;try{const v=document.documentElement;return getComputedStyle(v).getPropertyValue(l).trim()||i}catch{return i}},g=u("--bw-bg","#121212"),r=u("--bw-text","#E0E0E0"),x={clientSecret:d,appearance:{theme:"stripe",variables:{colorPrimary:"#10b981",colorBackground:g,colorText:r,colorDanger:"#ef4444",fontFamily:"Work Sans, sans-serif",spacingUnit:"4px",borderRadius:"8px"}},loader:"auto"};return e.jsx("div",{style:{minHeight:"100vh",backgroundColor:"var(--bw-bg)",fontFamily:"Work Sans, sans-serif",padding:"clamp(16px, 3vw, 24px)",display:"flex",flexDirection:"column"},children:e.jsxs("div",{style:{maxWidth:"600px",margin:"0 auto",width:"100%",flex:1,display:"flex",flexDirection:"column"},children:[e.jsx("h1",{style:{margin:"0 0 clamp(24px, 4vw, 32px) 0",fontSize:"clamp(24px, 4vw, 32px)",fontWeight:200,fontFamily:"DM Sans, sans-serif",color:"var(--bw-text)",textAlign:"center"},children:"Complete Payment"}),e.jsxs("div",{style:{backgroundColor:"var(--bw-card-bg, var(--bw-bg))",border:"1px solid var(--bw-border)",borderRadius:"16px",padding:"clamp(20px, 4vw, 28px)",marginBottom:"clamp(24px, 4vw, 32px)",boxShadow:"0 2px 12px rgba(0, 0, 0, 0.08)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"clamp(16px, 3vw, 20px)",paddingBottom:"clamp(16px, 3vw, 20px)",borderBottom:"1px solid var(--bw-border)"},children:[e.jsx("div",{style:{fontSize:"clamp(12px, 2vw, 14px)",color:"var(--bw-text)",opacity:.7,fontFamily:"Work Sans, sans-serif"},children:"Total Amount"}),e.jsxs("div",{style:{fontSize:"clamp(24px, 4vw, 32px)",fontWeight:600,color:"var(--bw-text)",fontFamily:"DM Sans, sans-serif",letterSpacing:"-0.02em"},children:["$",s.estimated_price.toFixed(2)]})]}),e.jsx("div",{style:{fontSize:"clamp(11px, 1.8vw, 12px)",color:"var(--bw-text)",opacity:.6,fontFamily:"Work Sans, sans-serif",lineHeight:1.5},children:"Your payment information is secure and encrypted by Stripe."})]}),e.jsx(E,{stripe:c,options:x,children:e.jsx(_,{booking:s,clientSecret:d})}),e.jsx("style",{children:`
          /* Reduce font size of Stripe payment terms text */
          .pii-consent-text,
          [data-testid="pii-consent-text"],
          .pii-consent-text p,
          div[class*="pii"],
          div[class*="consent"],
          form[class*="Stripe"] p,
          div[class*="Stripe"] p:last-child,
          div[class*="Stripe"] div[class*="text"] p {
            font-size: clamp(10px, 1.5vw, 11px) !important;
            line-height: 1.4 !important;
          }
        `}),e.jsx("div",{style:{textAlign:"center",paddingTop:"clamp(24px, 4vw, 32px)",borderTop:"1px solid var(--bw-border)",marginTop:"auto"},children:e.jsx("p",{style:{fontSize:"clamp(11px, 1.8vw, 12px)",color:"var(--bw-text)",opacity:.5,margin:0,fontFamily:"Work Sans, sans-serif"},children:"Powered by Maison"})})]})})}export{q as default};
