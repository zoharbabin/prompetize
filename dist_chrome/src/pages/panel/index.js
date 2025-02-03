import"../../../assets/modulepreload-polyfill-B5Qt9EMX.js";import{j as e,c as g}from"../../../assets/client-Boq2Mm0S.js";import{r as a,R as p}from"../../../assets/tailwind-CTcJeN-E.js";import{B as h}from"../../../assets/browser-polyfill-BNsK6TjJ.js";const u=()=>{const[s,n]=a.useState([]),[o,l]=a.useState("all"),[d,m]=a.useState("");a.useEffect(()=>{const r=h.runtime.connect({name:"panel"});return r.onMessage.addListener(t=>{n(i=>[...i,{...t,timestamp:Date.now()}])}),()=>{r.disconnect()}},[]);const c=s.filter(r=>{const t=o==="all"||r.type===o,i=d===""||JSON.stringify(r).toLowerCase().includes(d.toLowerCase());return t&&i}),x=()=>{n([])};return e.jsxs("div",{className:"h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white",children:[e.jsx("div",{className:"sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4",children:e.jsxs("div",{className:"flex items-center justify-between gap-4",children:[e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsxs("select",{value:o,onChange:r=>l(r.target.value),className:"px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md",children:[e.jsx("option",{value:"all",children:"All"}),e.jsx("option",{value:"log",children:"Logs"}),e.jsx("option",{value:"error",children:"Errors"}),e.jsx("option",{value:"info",children:"Info"})]}),e.jsx("input",{type:"text",value:d,onChange:r=>m(r.target.value),placeholder:"Search logs...",className:"px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md flex-1"})]}),e.jsx("button",{onClick:x,className:"px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors",children:"Clear"})]})}),e.jsx("div",{className:"p-4 space-y-2",children:c.length===0?e.jsx("div",{className:"text-center text-gray-500 dark:text-gray-400 py-8",children:"No logs to display"}):c.map((r,t)=>e.jsxs("div",{className:`p-3 rounded-md ${r.type==="error"?"bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200":r.type==="info"?"bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200":"bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"}`,children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-xs opacity-75",children:new Date(r.timestamp).toLocaleTimeString()}),e.jsx("span",{className:"text-xs font-medium uppercase",children:r.type})]}),e.jsxs("div",{className:"mt-1",children:[e.jsx("div",{className:"font-medium",children:r.message}),r.data&&e.jsx("pre",{className:"mt-2 text-sm overflow-x-auto",children:JSON.stringify(r.data,null,2)})]})]},r.timestamp+t))})]})};function y(){const s=document.querySelector("#__root");if(!s)throw new Error("Can't find Panel root element");g.createRoot(s).render(e.jsx(p.StrictMode,{children:e.jsx(u,{})}))}y();
//# sourceMappingURL=index.js.map
