import { useState, useMemo, useEffect } from "react";

// ── Mock Data ──────────────────────────────────────────────────────────────
const CATEGORIES = ["Food & Dining","Transport","Shopping","Housing","Entertainment","Health","Income","Freelance","Investment"];
const CAT_COLORS = {
  "Food & Dining":"#D85A30","Transport":"#378ADD","Shopping":"#D4537E",
  "Housing":"#533AB7","Entertainment":"#1D9E75","Health":"#BA7517",
  "Income":"#639922","Freelance":"#185FA5","Investment":"#3B6D11"
};

const RAW_TXN = [
  {id:1,date:"2024-04-01",desc:"Salary",amount:5200,type:"income",category:"Income"},
  {id:2,date:"2024-04-02",desc:"Grocery Store",amount:-142.5,type:"expense",category:"Food & Dining"},
  {id:3,date:"2024-04-03",desc:"Uber",amount:-18.4,type:"expense",category:"Transport"},
  {id:4,date:"2024-04-04",desc:"Netflix",amount:-15.99,type:"expense",category:"Entertainment"},
  {id:5,date:"2024-04-05",desc:"Freelance Project A",amount:850,type:"income",category:"Freelance"},
  {id:6,date:"2024-04-06",desc:"Rent",amount:-1800,type:"expense",category:"Housing"},
  {id:7,date:"2024-04-07",desc:"Zara",amount:-96,type:"expense",category:"Shopping"},
  {id:8,date:"2024-04-08",desc:"Pharmacy",amount:-33,type:"expense",category:"Health"},
  {id:9,date:"2024-04-09",desc:"Restaurant",amount:-64,type:"expense",category:"Food & Dining"},
  {id:10,date:"2024-04-10",desc:"Bus Pass",amount:-55,type:"expense",category:"Transport"},
  {id:11,date:"2024-04-12",desc:"Amazon",amount:-129,type:"expense",category:"Shopping"},
  {id:12,date:"2024-04-14",desc:"Gym",amount:-45,type:"expense",category:"Health"},
  {id:13,date:"2024-04-15",desc:"Freelance Project B",amount:1200,type:"income",category:"Freelance"},
  {id:14,date:"2024-04-16",desc:"Coffee Shop",amount:-22,type:"expense",category:"Food & Dining"},
  {id:15,date:"2024-04-18",desc:"Stocks Dividend",amount:310,type:"income",category:"Investment"},
  {id:16,date:"2024-04-20",desc:"Movie Tickets",amount:-38,type:"expense",category:"Entertainment"},
  {id:17,date:"2024-04-22",desc:"Takeout",amount:-47,type:"expense",category:"Food & Dining"},
  {id:18,date:"2024-04-24",desc:"Electric Bill",amount:-88,type:"expense",category:"Housing"},
  {id:19,date:"2024-04-25",desc:"Salary",amount:5200,type:"income",category:"Income"},
  {id:20,date:"2024-04-26",desc:"H&M",amount:-75,type:"expense",category:"Shopping"},
  {id:21,date:"2024-03-01",desc:"Salary",amount:5200,type:"income",category:"Income"},
  {id:22,date:"2024-03-03",desc:"Grocery Store",amount:-160,type:"expense",category:"Food & Dining"},
  {id:23,date:"2024-03-05",desc:"Freelance Project",amount:600,type:"income",category:"Freelance"},
  {id:24,date:"2024-03-06",desc:"Rent",amount:-1800,type:"expense",category:"Housing"},
  {id:25,date:"2024-03-10",desc:"Shopping",amount:-210,type:"expense",category:"Shopping"},
  {id:26,date:"2024-03-12",desc:"Doctor Visit",amount:-120,type:"expense",category:"Health"},
  {id:27,date:"2024-03-15",desc:"Salary",amount:5200,type:"income",category:"Income"},
  {id:28,date:"2024-03-20",desc:"Restaurant",amount:-89,type:"expense",category:"Food & Dining"},
  {id:29,date:"2024-03-25",desc:"Transport",amount:-65,type:"expense",category:"Transport"},
  {id:30,date:"2024-03-28",desc:"Entertainment",amount:-55,type:"expense",category:"Entertainment"},
  {id:31,date:"2024-02-01",desc:"Salary",amount:5200,type:"income",category:"Income"},
  {id:32,date:"2024-02-04",desc:"Grocery",amount:-135,type:"expense",category:"Food & Dining"},
  {id:33,date:"2024-02-06",desc:"Rent",amount:-1800,type:"expense",category:"Housing"},
  {id:34,date:"2024-02-10",desc:"Freelance",amount:400,type:"income",category:"Freelance"},
  {id:35,date:"2024-02-14",desc:"Valentines Dinner",amount:-180,type:"expense",category:"Food & Dining"},
  {id:36,date:"2024-02-15",desc:"Salary",amount:5200,type:"income",category:"Income"},
  {id:37,date:"2024-02-20",desc:"Shopping",amount:-145,type:"expense",category:"Shopping"},
  {id:38,date:"2024-02-25",desc:"Streaming Services",amount:-48,type:"expense",category:"Entertainment"},
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmt(n){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);}
function fmtD(n){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",minimumFractionDigits:2,maximumFractionDigits:2}).format(n);}


// ── Donut Chart (SVG) ──────────────────────────────────────────────────────
function DonutChart({segments,size=180}){
  const total=segments.reduce((a,s)=>a+s.value,0);
  let angle=-90;
  const paths=segments.map((s)=>{
    const pct=s.value/total;
    const deg=pct*360;
    const r=70, cx=90, cy=90;
    const rad=(a)=>a*Math.PI/180;
    const x1=cx+r*Math.cos(rad(angle));
    const y1=cy+r*Math.sin(rad(angle));
    angle+=deg;
    const x2=cx+r*Math.cos(rad(angle));
    const y2=cy+r*Math.sin(rad(angle));
    const largeArc=deg>180?1:0;
    return{...s,d:`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`,pct};
  });
  return(
    <svg width={size} height={size} viewBox="0 0 180 180" style={{cursor:"pointer"}}>
      {paths.map((p,i)=>(
        <path key={i} d={p.d} fill={p.color} opacity={0.9} style={{transition:"all 0.3s"}} onMouseEnter={(e)=>e.target.style.opacity="1"} onMouseLeave={(e)=>e.target.style.opacity="0.9"}/>
      ))}
      <circle cx="90" cy="90" r="48" fill="var(--bg-card)"/>
      <text x="90" y="88" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-primary)" fontFamily="inherit">Total</text>
      <text x="90" y="106" textAnchor="middle" fontSize="11" fontWeight="500" fill="var(--text-muted)" fontFamily="inherit">{fmt(total)}</text>
    </svg>
  );
}

// ── Sparkline SVG ──────────────────────────────────────────────────────────
function Sparkline({data,color,h=40,w=120}){
  if(!data||data.length<2)return null;
  const min=Math.min(...data),max=Math.max(...data);
  const range=max-min||1;
  const pts=data.map((v,i)=>({x:(i/(data.length-1))*w,y:h-((v-min)/range)*(h-8)-4}));
  const d="M"+pts.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L");
  const fill=d+` L${w},${h} L0,${h} Z`;
  return(
    <svg width={w} height={h} style={{overflow:"visible"}}>
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#sg-${color.replace("#","")})`}/>
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ── Line Chart ─────────────────────────────────────────────────────────────
function LineChart({income,expenses,labels}){
  const allVals=[...income,...expenses];
  const maxV=Math.max(...allVals)||1;
  const W=500,H=180,PX=40,PY=20;
  const iW=W-PX*2,iH=H-PY*2;
  const px=(i)=>PX+i/(labels.length-1)*iW;
  const py=(v)=>PY+iH-(v/maxV)*iH;
  const mkPath=(arr,color)=>{
    const d="M"+arr.map((v,i)=>`${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" L");
    const area=d+` L${px(arr.length-1).toFixed(1)},${PY+iH} L${px(0).toFixed(1)},${PY+iH} Z`;
    return(
      <g key={color}>
        <defs>
          <linearGradient id={`ag-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#ag-${color.replace("#","")})`}/>
        <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        {arr.map((v,i)=><circle key={i} cx={px(i)} cy={py(v)} r="4" fill={color} stroke="var(--bg-card)" strokeWidth="2"/>)}
      </g>
    );
  };
  const ticks=5;
  return(
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible"}}>
      {Array.from({length:ticks},(_,i)=>{
        const v=maxV*i/(ticks-1);
        const y=py(v);
        return(
          <g key={i}>
            <line x1={PX} y1={y} x2={W-PX} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4,4"/>
            <text x={PX-6} y={y+4} textAnchor="end" fontSize="9" fontWeight="600" fill="var(--text-muted)" fontFamily="inherit">{fmt(v)}</text>
          </g>
        );
      })}
      {labels.map((l,i)=>(
        <text key={i} x={px(i)} y={H-2} textAnchor="middle" fontSize="9" fontWeight="600" fill="var(--text-muted)" fontFamily="inherit">{l}</text>
      ))}
      {mkPath(income,"#639922")}
      {mkPath(expenses,"#D85A30")}
    </svg>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App(){
  // ── Load from LocalStorage ──────────────────────────────────────────────
  const load=(k,df)=>JSON.parse(localStorage.getItem(k))??df;

  const [dark,setDark]=useState(()=>load("fd-dark",false));
  const [role,setRole]=useState(()=>load("fd-role","admin"));
  const [nav,setNav]=useState("dashboard");
  const [txns,setTxns]=useState(()=>load("fd-txns",RAW_TXN));
  const [search,setSearch]=useState("");
  const [filterType,setFilterType]=useState("all");
  const [filterCat,setFilterCat]=useState("all");
  const [sortBy,setSortBy]=useState("date");
  const [sortDir,setSortDir]=useState("desc");
  const [showModal,setShowModal]=useState(false);
  const [showMobileNav,setShowMobileNav]=useState(false);
  const [newTxn,setNewTxn]=useState({desc:"",amount:"",type:"expense",category:"Food & Dining",date:new Date().toISOString().slice(0,10)});
  const [editId,setEditId]=useState(null);
  const [toast,setToast]=useState(null);

  useEffect(()=>{
    localStorage.setItem("fd-dark",JSON.stringify(dark));
    localStorage.setItem("fd-role",JSON.stringify(role));
    localStorage.setItem("fd-txns",JSON.stringify(txns));
  },[dark,role,txns]);

  const showToast=(msg,t="success")=>{setToast({msg,t});setTimeout(()=>setToast(null),2500);};

  // ── Derived data ──────────────────────────────────────────────────────────
  const totalIncome=useMemo(()=>txns.filter(t=>t.type==="income").reduce((a,t)=>a+Math.abs(t.amount),0),[txns]);
  const totalExpense=useMemo(()=>txns.filter(t=>t.type==="expense").reduce((a,t)=>a+Math.abs(t.amount),0),[txns]);
  const balance=totalIncome-totalExpense;
  const savingsRate=totalIncome>0?((balance/totalIncome)*100).toFixed(1):0;

  const catSpending=useMemo(()=>{
    const map={};
    txns.filter(t=>t.type==="expense").forEach(t=>{
      map[t.category]=(map[t.category]||0)+Math.abs(t.amount);
    });
    return Object.entries(map).map(([k,v])=>({label:k,value:v,color:CAT_COLORS[k]||"#888"})).sort((a,b)=>b.value-a.value);
  },[txns]);

  const monthlyData=useMemo(()=>{
    const map={};
    txns.forEach(t=>{
      const m=t.date.slice(0,7);
      if(!map[m])map[m]={income:0,expenses:0};
      if(t.type==="income")map[m].income+=Math.abs(t.amount);
      else map[m].expenses+=Math.abs(t.amount);
    });
    const sorted=Object.keys(map).sort();
    return{labels:sorted.map(k=>MONTHS[parseInt(k.slice(5))-1]),income:sorted.map(k=>map[k].income),expenses:sorted.map(k=>map[k].expenses)};
  },[txns]);

  const filtered=useMemo(()=>{
    let r=[...txns];
    if(search)r=r.filter(t=>t.desc.toLowerCase().includes(search.toLowerCase())||t.category.toLowerCase().includes(search.toLowerCase()));
    if(filterType!=="all")r=r.filter(t=>t.type===filterType);
    if(filterCat!=="all")r=r.filter(t=>t.category===filterCat);
    r.sort((a,b)=>{
      let va=a[sortBy],vb=b[sortBy];
      if(sortBy==="amount"){va=Math.abs(a.amount);vb=Math.abs(b.amount);}
      return sortDir==="asc"?(va>vb?1:-1):(va<vb?1:-1);
    });
    return r;
  },[txns,search,filterType,filterCat,sortBy,sortDir]);

  const topCat=catSpending[0];

  // ── RBAC helpers ──────────────────────────────────────────────────────────
  const isAdmin=role==="admin";

  // ── Handlers ─────────────────────────────────────────────────────────────
  const saveTxn=()=>{
    if(!newTxn.desc||!newTxn.amount||!newTxn.date){showToast("Fill all fields","error");return;}
    const amt=parseFloat(newTxn.amount);
    if(isNaN(amt)||amt<=0){showToast("Invalid amount","error");return;}
    const obj={...newTxn,amount:newTxn.type==="expense"?-amt:amt,id:editId||Date.now()};
    if(editId){setTxns(t=>t.map(x=>x.id===editId?obj:x));showToast("Transaction updated");}
    else{setTxns(t=>[obj,...t]);showToast("Transaction added");}
    setShowModal(false);setEditId(null);
    setNewTxn({desc:"",amount:"",type:"expense",category:"Food & Dining",date:new Date().toISOString().slice(0,10)});
  };
  const deleteTxn=(id)=>{setTxns(t=>t.filter(x=>x.id!==id));showToast("Transaction deleted");};
  const startEdit=(t)=>{setEditId(t.id);setNewTxn({desc:t.desc,amount:Math.abs(t.amount),type:t.type,category:t.category,date:t.date});setShowModal(true);};
  const toggleSort=(col)=>{if(sortBy===col)setSortDir(d=>d==="asc"?"desc":"asc");else{setSortBy(col);setSortDir("desc");}};

  // ── Theme ─────────────────────────────────────────────────────────────────
  const theme={
    "--bg":dark?"#0f1115":"#F5F4F0",
    "--bg-card":dark?"#181a1f":"#fff",
    "--bg-sidebar":dark?"#181a1f":"#1a1d25",
    "--text-primary":dark?"#f0f0f0":"#1a1a1a",
    "--text-muted":dark?"#a0a0a0":"#666",
    "--border":dark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.12)",
    "--accent":"#378ADD",
    "--green":"#639922",
    "--red":"#D85A30",
  };

  const navItems=[
    {id:"dashboard",icon:"◈",label:"Overview"},
    {id:"transactions",icon:"⊟",label:"Transactions"},
    {id:"insights",icon:"◉",label:"Insights"},
  ];

  // ── CSS ───────────────────────────────────────────────────────────────────
  const css=`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Inter:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text-primary);}
    .fd-root{display:flex;min-height:100vh;background:var(--bg);color:var(--text-primary);font-family:'Inter',sans-serif;transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);}
    .fd-sidebar{width:240px;flex-shrink:0;background:var(--bg-sidebar);display:flex;flex-direction:column;padding:28px 0;position:sticky;top:0;height:100vh;overflow:hidden;transition:all 0.3s;}
    .fd-sidebar-logo{padding:0 24px 28px;border-bottom:0.5px solid rgba(255,255,255,0.08);margin-bottom:12px;display:flex;align-items:center;gap:10px;}
    .fd-logo-mark{font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.5px;}
    .fd-logo-mark::before{content:"◆";color:var(--accent);margin-right:4px;}
    .fd-logo-sub{font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-top:2px;}
    .fd-nav-item{display:flex;align-items:center;gap:10px;padding:12px 24px;cursor:pointer;font-size:14px;font-weight:500;color:rgba(255,255,255,0.5);border-left:3px solid transparent;transition:all 0.2s;}
    .fd-nav-item:hover{color:rgba(255,255,255,0.85);background:rgba(255,255,255,0.04);}
    .fd-nav-item.active{color:#fff;border-left-color:var(--accent);background:linear-gradient(90deg, rgba(55,138,221,0.15) 0%, transparent 100%);}
    .fd-nav-icon{font-size:16px;width:20px;text-align:center;}
    .fd-sidebar-footer{margin-top:auto;padding:20px 24px 0;border-top:0.5px solid rgba(255,255,255,0.08);}
    .fd-main{flex:1;display:flex;flex-direction:column;min-height:100vh;overflow:hidden;}
    .fd-topbar{display:flex;align-items:center;justify-content:space-between;padding:16px 32px;background:var(--bg-card);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:10;backdrop-filter:blur(8px);background:rgba(var(--bg-card), 0.8);}
    .fd-page-title{font-size:20px;font-weight:700;letter-spacing:-0.4px;}
    .fd-topbar-actions{display:flex;align-items:center;gap:12px;}
    .fd-badge{font-size:11px;font-weight:600;padding:4px 10px;border-radius:999px;background:rgba(55,138,221,0.12);color:var(--accent);letter-spacing:0.3px;text-transform:uppercase;}
    .fd-btn{font-family:inherit;font-size:13.5px;font-weight:600;padding:8px 16px;border-radius:10px;cursor:pointer;border:1px solid var(--border);background:var(--bg-card);color:var(--text-primary);display:inline-flex;align-items:center;gap:8px;transition:all 0.2s;box-shadow:0 1px 2px rgba(0,0,0,0.05);}
    .fd-btn:hover{background:var(--bg);transform:translateY(-1px);}
    .fd-btn.primary{background:var(--accent);color:#fff;border-color:var(--accent);box-shadow:0 4px 12px rgba(55,138,221,0.25);}
    .fd-btn.primary:hover{opacity:0.9;}
    .fd-btn.danger{background:#FAECE7;color:#993C1D;border-color:#F0997B;}
    .fd-btn-icon{width:36px;padding:0;justify-content:center;font-size:16px;}
    .fd-content{flex:1;padding:24px 32px;overflow-y:auto;}
    .fd-grid{display:grid;gap:16px;}
    .fd-card{background:var(--bg-card);border-radius:16px;border:1px solid var(--border);padding:24px;transition:all 0.3s ease;box-shadow:0 4px 20px rgba(0,0,0,0.02);}
    .fd-card:hover{box-shadow:0 8px 30px rgba(0,0,0,0.04);border-color:var(--accent);}
    .fd-card-sm{background:var(--bg-card);border-radius:14px;border:1px solid var(--border);padding:18px;transition:all 0.2s;}
    .fd-metric-label{font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px;}
    .fd-metric-val{font-size:26px;font-weight:800;letter-spacing:-1px;line-height:1;}
    .fd-metric-sub{font-size:12px;color:var(--text-muted);margin-top:8px;display:flex;align-items:center;gap:4px;}
    .fd-tag{font-size:11px;font-weight:600;padding:4px 10px;border-radius:8px;display:inline-block;text-transform:capitalize;}
    .fd-table-container{overflow-x:auto;width:100%;-webkit-overflow-scrolling:touch;}
    .fd-table{width:100%;border-collapse:separate;border-spacing:0;font-size:14px;}
    .fd-table th{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-muted);padding:14px 16px;text-align:left;border-bottom:1px solid var(--border);}
    .fd-table td{padding:16px;border-bottom:1px solid var(--border);transition:background 0.2s;}
    .fd-table tr:hover td{background:rgba(0,0,0,0.01);}
    .fd-input{font-family:inherit;font-size:14px;padding:10px 14px;border-radius:10px;border:1px solid var(--border);background:var(--bg-card);color:var(--text-primary);width:100%;outline:none;transition:all 0.2s;}
    .fd-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(55,138,221,0.1);}
    .fd-select{font-family:inherit;font-size:14px;padding:9px 14px;border-radius:10px;border:1px solid var(--border);background:var(--bg-card);color:var(--text-primary);cursor:pointer;outline:none;}
    .fd-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:100;backdrop-filter:blur(4px);animation:fadeIn 0.2s;}
    .fd-modal{background:var(--bg-card);border-radius:20px;padding:32px;width:480px;max-width:94vw;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);animation:slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);}
    .fd-hamburger{display:none;font-size:24px;background:none;border:none;color:var(--text-primary);cursor:pointer;}
    .hide-mobile{display:inline-block;}
    @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
    @keyframes slideIn{from{transform:translateY(20px);opacity:0;}to{transform:translateY(0);opacity:1;}}
    @media(max-width:992px){
      .fd-sidebar{position:fixed;left:0;z-index:100;transform:translateX(-100%);transition:transform 0.3s;}
      .fd-sidebar.open{transform:translateX(0);}
      .fd-hamburger{display:block;}
      .fd-sidebar-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:90;display:none;backdrop-filter:blur(2px);}
      .fd-sidebar-overlay.show{display:block;}
    }
    @media(max-width:768px){
      .fd-content{padding:20px;}
      .fd-topbar{padding:14px 20px;}
      .fd-page-title{font-size:18px;}
      .hide-mobile{display:none;}
    }
  `;

  const pageTitles={dashboard:"Overview",transactions:"Transactions",insights:"Insights"};

  return(
    <>
      <style>{css}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <div className="fd-root" style={theme}>
        {/* Sidebar Overlay */}
        <div className={`fd-sidebar-overlay${showMobileNav?" show":""}`} onClick={()=>setShowMobileNav(false)}/>

        {/* Sidebar */}
        <nav className={`fd-sidebar${showMobileNav?" open":""}`}>
          <div className="fd-sidebar-logo">
            <div className="fd-logo-mark">Fintrak</div>
          </div>
          {navItems.map(n=>(
            <div key={n.id} className={`fd-nav-item${nav===n.id?" active":""}`} onClick={()=>{setNav(n.id);setShowMobileNav(false);}}>
              <span className="fd-nav-icon">{n.icon}</span>
              {n.label}
            </div>
          ))}
          <div className="fd-sidebar-footer">
            <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:10,textTransform:"uppercase",letterSpacing:"1px",fontWeight:700}}>Access Level</div>
            <div className="fd-role-pill">
              {["admin","viewer"].map(r=>(
                <button key={r} className={`fd-role-opt${role===r?" active":""}`} onClick={()=>setRole(r)} style={{flex:1,textTransform:"capitalize"}}>{r}</button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main */}
        <div className="fd-main">
          {/* Topbar */}
          <div className="fd-topbar">
            <div style={{display:"flex",alignItems:"center",gap:16}}>
              <button className="fd-hamburger" onClick={()=>setShowMobileNav(true)}>☰</button>
              <h1 className="fd-page-title">{pageTitles[nav]}</h1>
              <span className="fd-badge">{role}</span>
            </div>
            <div className="fd-topbar-actions">
              <button className="fd-btn fd-btn-icon" onClick={()=>setDark(d=>!d)} title="Toggle theme">
                {dark?"☀":"🌙"}
              </button>
              {isAdmin && (
                <button className="fd-btn primary" onClick={()=>{setEditId(null);setNewTxn({desc:"",amount:"",type:"expense",category:"Food & Dining",date:new Date().toISOString().slice(0,10)});setShowModal(true);}}>
                  <span style={{fontSize:16}}>+</span> <span className="hide-mobile">Add Transaction</span>
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="fd-content">
            {nav==="dashboard"&&<DashboardPage totalIncome={totalIncome} totalExpense={totalExpense} balance={balance} savingsRate={savingsRate} catSpending={catSpending} monthlyData={monthlyData} txns={txns} topCat={topCat} isAdmin={isAdmin}/>}
            {nav==="transactions"&&<TransactionsPage filtered={filtered} search={search} setSearch={setSearch} filterType={filterType} setFilterType={setFilterType} filterCat={filterCat} setFilterCat={setFilterCat} sortBy={sortBy} sortDir={sortDir} toggleSort={toggleSort} isAdmin={isAdmin} startEdit={startEdit} deleteTxn={deleteTxn}/>}
            {nav==="insights"&&<InsightsPage catSpending={catSpending} monthlyData={monthlyData} totalIncome={totalIncome} totalExpense={totalExpense} balance={balance} savingsRate={savingsRate} topCat={topCat} txns={txns}/>}
          </div>
        </div>

        {/* Modal */}
        {showModal&&(
          <div className="fd-modal-overlay" onClick={(e)=>{if(e.target.className.includes("overlay")||e.target.className==="fd-modal-overlay")setShowModal(false);}}>
            <div className="fd-modal">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                <h2 style={{fontSize:17,fontWeight:600}}>{editId?"Edit":"Add"} Transaction</h2>
                <button className="fd-btn" style={{padding:"4px 10px"}} onClick={()=>setShowModal(false)}>✕</button>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <div>
                  <div style={{fontSize:12,fontWeight:500,color:"var(--text-muted)",marginBottom:5}}>Description</div>
                  <input className="fd-input" placeholder="e.g. Coffee Shop" value={newTxn.desc} onChange={e=>setNewTxn(t=>({...t,desc:e.target.value}))}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:500,color:"var(--text-muted)",marginBottom:5}}>Amount ($)</div>
                    <input className="fd-input" type="number" min="0" placeholder="0.00" value={newTxn.amount} onChange={e=>setNewTxn(t=>({...t,amount:e.target.value}))}/>
                  </div>
                  <div>
                    <div style={{fontSize:12,fontWeight:500,color:"var(--text-muted)",marginBottom:5}}>Date</div>
                    <input className="fd-input" type="date" value={newTxn.date} onChange={e=>setNewTxn(t=>({...t,date:e.target.value}))}/>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:500,color:"var(--text-muted)",marginBottom:5}}>Type</div>
                    <select className="fd-select" style={{width:"100%"}} value={newTxn.type} onChange={e=>setNewTxn(t=>({...t,type:e.target.value}))}>
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                  <div>
                    <div style={{fontSize:12,fontWeight:500,color:"var(--text-muted)",marginBottom:5}}>Category</div>
                    <select className="fd-select" style={{width:"100%"}} value={newTxn.category} onChange={e=>setNewTxn(t=>({...t,category:e.target.value}))}>
                      {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:10,marginTop:20,justifyContent:"flex-end"}}>
                <button className="fd-btn" onClick={()=>setShowModal(false)}>Cancel</button>
                <button className="fd-btn primary" onClick={saveTxn}>{editId?"Save Changes":"Add Transaction"}</button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast&&(
          <div className="fd-toast" style={{background:toast.t==="error"?"#FAECE7":"#EAF3DE",color:toast.t==="error"?"#993C1D":"#3B6D11",border:`0.5px solid ${toast.t==="error"?"#F0997B":"#97C459"}`}}>
            {toast.t==="error"?"✕":"✓"} {toast.msg}
          </div>
        )}
      </div>
    </>
  );
}

// ── Dashboard Page ─────────────────────────────────────────────────────────
function DashboardPage({totalIncome,totalExpense,balance,savingsRate,catSpending,monthlyData,txns,topCat,isAdmin}){
  const recentTxns=txns.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
  const donutData=catSpending.slice(0,5);
  
  // Budget Logic (Mock)
  const budgetLimit=4500;
  const budgetUsage=(totalExpense/budgetLimit*100).toFixed(0);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:24}}>
      {/* KPI Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16}}>
        {[
          {label:"Total Balance",val:fmt(balance),sub:`${savingsRate}% savings rate`,color:"var(--accent)",spark:[7200,8100,6800,9200,10400,balance]},
          {label:"Total Income",val:fmt(totalIncome),sub:"All-time earnings",color:"var(--green)",spark:[8000,9000,7500,10000,11000,totalIncome]},
          {label:"Total Expenses",val:fmt(totalExpense),sub:"All-time spending",color:"var(--red)",spark:[3000,4000,3500,4500,5000,totalExpense]},
        ].map((m,i)=>(
          <div key={i} className="fd-card" style={{position:"relative",overflow:"hidden"}}>
            <div className="fd-metric-label">{m.label}</div>
            <div className="fd-metric-val" style={{color:m.color}}>{m.val}</div>
            <div className="fd-metric-sub">{m.sub}</div>
            {m.spark&&(
              <div style={{position:"absolute",bottom:20,right:24,opacity:0.8}}>
                <Sparkline data={m.spark} color={m.color} h={40} w={100}/>
              </div>
            )}
          </div>
        ))}
        {/* Budget Card */}
        <div className="fd-card">
          <div className="fd-metric-label">Monthly Budget</div>
          <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:8}}>
            <div className="fd-metric-val">{budgetUsage}%</div>
            <div style={{fontSize:12,color:"var(--text-muted)"}}>{fmt(totalExpense)} / {fmt(budgetLimit)}</div>
          </div>
          <div className="fd-progress-bar" style={{height:8,background:"var(--border)"}}>
            <div className="fd-progress-fill" style={{width:`${Math.min(100,budgetUsage)}%`,background:budgetUsage>90?"var(--red)":"var(--accent)"}}/>
          </div>
          <div className="fd-metric-sub">Spent this month</div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))",gap:20}}>
        <div className="fd-card" style={{minWidth:"0"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:10}}>
            <div>
              <div className="fd-section-title">Income vs Expenses</div>
              <div style={{fontSize:12,color:"var(--text-muted)"}}>Overview of monthly movement</div>
            </div>
            <div style={{display:"flex",gap:16,fontSize:12,fontWeight:600}}>
              <span style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:10,height:10,borderRadius:"50%",background:"var(--green)"}}/> Income</span>
              <span style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:10,height:10,borderRadius:"50%",background:"var(--red)"}}/> Expenses</span>
            </div>
          </div>
          <LineChart income={monthlyData.income} expenses={monthlyData.expenses} labels={monthlyData.labels}/>
        </div>
        <div className="fd-card" style={{display:"flex",flexDirection:"column"}}>
          <div className="fd-section-title">Spending Distribution</div>
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20}}>
            <DonutChart segments={donutData} size={180}/>
            <div style={{width:"100%",display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {donutData.slice(0,4).map((c,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:13,padding:"8px 12px",background:"var(--bg)",borderRadius:10}}>
                  <span style={{display:"flex",alignItems:"center",gap:8,overflow:"hidden"}}>
                    <span style={{width:10,height:10,borderRadius:"50%",background:c.color,flexShrink:0}}/>
                    <span style={{color:"var(--text-muted)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.label}</span>
                  </span>
                  <span style={{fontWeight:700}}>{fmt(c.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="fd-card" style={{padding:"0 0 10px 0"}}>
        <div style={{padding:"24px 24px 16px"}}>
          <div className="fd-section-title">Latest Transactions</div>
        </div>
        <div className="fd-table-container">
          <table className="fd-table">
            <thead>
              <tr>
                <th>Detail</th>
                <th>Category</th>
                <th>Date</th>
                <th style={{textAlign:"right"}}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTxns.map(t=>(
                <tr key={t.id}>
                  <td style={{fontWeight:600}}>{t.desc}</td>
                  <td><span className="fd-tag" style={{background:CAT_COLORS[t.category]+"15",color:CAT_COLORS[t.category]}}>{t.category}</span></td>
                  <td style={{color:"var(--text-muted)",fontSize:13,fontFamily:"'DM Mono',monospace"}}>{t.date}</td>
                  <td style={{textAlign:"right",fontWeight:700,color:t.amount>0?"var(--green)":"var(--red)",fontFamily:"'DM Mono',monospace"}}>
                    {t.amount>0?"+":""}{fmtD(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Transactions Page ──────────────────────────────────────────────────────
function TransactionsPage({filtered,search,setSearch,filterType,setFilterType,filterCat,setFilterCat,sortBy,sortDir,toggleSort,isAdmin,startEdit,deleteTxn}){
  const SortIcon=({col})=>(sortBy===col?<span style={{marginLeft:3}}>{sortDir==="asc"?"↑":"↓"}</span>:null);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Filters */}
      <div className="fd-card-sm" style={{display:"flex",flexWrap:"wrap",gap:12,alignItems:"center"}}>
        <input className="fd-input" style={{maxWidth:260}} placeholder="Search transactions..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <div style={{display:"flex",gap:6}}>
          {["all","income","expense"].map(t=>(
            <button key={t} className={`fd-chip${filterType===t?" active":""}`} onClick={()=>setFilterType(t)} style={{textTransform:"capitalize"}}>{t}</button>
          ))}
        </div>
        <select className="fd-select" value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c=><option key={c}>{c}</option>)}
        </select>
        <span style={{marginLeft:"auto",fontSize:12,color:"var(--text-muted)",fontWeight:600}}>{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="fd-card" style={{padding:0,overflow:"hidden"}}>
        {filtered.length===0?(
          <div className="fd-empty">No transactions match your filters</div>
        ):(
          <div className="fd-table-container">
            <table className="fd-table">
              <thead>
                <tr>
                  <th onClick={()=>toggleSort("date")}>Date<SortIcon col="date"/></th>
                  <th onClick={()=>toggleSort("desc")}>Description<SortIcon col="desc"/></th>
                  <th>Category</th>
                  <th>Type</th>
                  <th onClick={()=>toggleSort("amount")} style={{textAlign:"right"}}>Amount<SortIcon col="amount"/></th>
                  {isAdmin&&<th style={{textAlign:"right"}}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(t=>(
                  <tr key={t.id}>
                    <td style={{fontFamily:"'DM Mono',monospace",fontSize:13,color:"var(--text-muted)"}}>{t.date}</td>
                    <td style={{fontWeight:600}}>{t.desc}</td>
                    <td><span className="fd-tag" style={{background:CAT_COLORS[t.category]+"15",color:CAT_COLORS[t.category]}}>{t.category}</span></td>
                    <td><span className="fd-tag" style={{background:t.type==="income"?"var(--green)15":"var(--red)15",color:t.type==="income"?"var(--green)":"var(--red)",textTransform:"capitalize"}}>{t.type}</span></td>
                    <td style={{textAlign:"right",fontWeight:700,color:t.amount>0?"var(--green)":"var(--red)",fontFamily:"'DM Mono',monospace"}}>
                      {t.amount>0?"+":""}{fmtD(t.amount)}
                    </td>
                    {isAdmin&&(
                      <td style={{textAlign:"right"}}>
                        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                          <button className="fd-btn" style={{padding:"6px 12px",fontSize:12,fontWeight:700}} onClick={()=>startEdit(t)}>Edit</button>
                          <button className="fd-btn danger" style={{padding:"6px 12px",fontSize:12,fontWeight:700}} onClick={()=>deleteTxn(t.id)}>Delete</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Insights Page ──────────────────────────────────────────────────────────
function InsightsPage({catSpending,monthlyData,totalIncome,totalExpense,balance,savingsRate,topCat,txns}){
  const totalCatExp=catSpending.reduce((a,c)=>a+c.value,0)||1;
  const months=monthlyData.labels;
  const lastM=months[months.length-1];
  const prevM=months[months.length-2];
  const lastInc=monthlyData.income[monthlyData.income.length-1]||0;
  const prevInc=monthlyData.income[monthlyData.income.length-2]||0;
  const lastExp=monthlyData.expenses[monthlyData.expenses.length-1]||0;
  const prevExp=monthlyData.expenses[monthlyData.expenses.length-2]||0;
  const incChg=prevInc>0?((lastInc-prevInc)/prevInc*100).toFixed(1):null;
  const expChg=prevExp>0?((lastExp-prevExp)/prevExp*100).toFixed(1):null;
  const avgTxn=txns.filter(t=>t.type==="expense").length>0?totalExpense/txns.filter(t=>t.type==="expense").length:0;
  const freqCat=useMemo(()=>{
    const map={};
    txns.filter(t=>t.type==="expense").forEach(t=>{map[t.category]=(map[t.category]||0)+1;});
    return Object.entries(map).sort((a,b)=>b[1]-a[1])[0];
  },[txns]);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Summary stat row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14}}>
        {[
          {label:"Savings Rate",val:`${savingsRate}%`,note:"Of total income",color:parseFloat(savingsRate)>20?"#639922":"#D85A30"},
          {label:"Avg. Expense",val:fmt(avgTxn),note:"Per transaction",color:"#378ADD"},
          {label:"Top Category",val:topCat?.label||"—",note:topCat?fmt(topCat.value):"",color:topCat?CAT_COLORS[topCat.label]:"#888"},
          {label:"Most Frequent",val:freqCat?freqCat[0]:"—",note:freqCat?`${freqCat[1]} times`:"",color:"#D4537E"},
        ].map((s,i)=>(
          <div key={i} className="fd-card-sm">
            <div className="fd-metric-label">{s.label}</div>
            <div style={{fontSize:22,fontWeight:700,letterSpacing:"-0.5px",color:s.color,marginBottom:4}}>{s.val}</div>
            <div style={{fontSize:12,color:"var(--text-muted)"}}>{s.note}</div>
          </div>
        ))}
      </div>

      {/* Monthly comparison */}
      <div className="fd-card">
        <div className="fd-section-title">Month-over-Month Comparison</div>
        {months.length>=2?(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginTop:8}}>
            {[
              {label:"Income",last:lastInc,prev:prevInc,chg:incChg,color:"#639922"},
              {label:"Expenses",last:lastExp,prev:prevExp,chg:expChg,color:"#D85A30"},
            ].map((m,i)=>(
              <div key={i} style={{padding:"16px",background:"var(--bg,#F5F4F0)",borderRadius:10}}>
                <div style={{fontSize:12,fontWeight:500,color:"var(--text-muted)",marginBottom:6}}>{m.label}</div>
                <div style={{display:"flex",gap:16,alignItems:"flex-end"}}>
                  <div>
                    <div style={{fontSize:10,color:"var(--text-muted)"}}>{prevM||"Previous"}</div>
                    <div style={{fontSize:18,fontWeight:600,color:"var(--text-primary)"}}>{fmt(m.prev)}</div>
                  </div>
                  <div style={{fontSize:20,color:"var(--text-muted)"}}>→</div>
                  <div>
                    <div style={{fontSize:10,color:"var(--text-muted)"}}>{lastM||"Latest"}</div>
                    <div style={{fontSize:18,fontWeight:700,color:m.color}}>{fmt(m.last)}</div>
                  </div>
                </div>
                {m.chg&&(
                  <div style={{marginTop:8,fontSize:12,fontWeight:500,color:parseFloat(m.chg)>0?(m.label==="Income"?"#639922":"#D85A30"):(m.label==="Income"?"#D85A30":"#639922")}}>
                    {parseFloat(m.chg)>0?"▲":"▼"} {Math.abs(m.chg)}% from {prevM}
                  </div>
                )}
              </div>
            ))}
          </div>
        ):<div className="fd-empty">Need more data for comparison</div>}
      </div>

      {/* Spending breakdown bars */}
      <div className="fd-card">
        <div className="fd-section-title">Spending Breakdown</div>
        <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:8}}>
          {catSpending.map((c,i)=>(
            <div key={i}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:13}}>
                <span style={{display:"flex",alignItems:"center",gap:7}}>
                  <span style={{width:8,height:8,borderRadius:2,background:c.color,display:"inline-block"}}/>
                  <span style={{fontWeight:500}}>{c.label}</span>
                </span>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:"var(--text-muted)"}}>
                  {fmt(c.value)} · {(c.value/totalCatExp*100).toFixed(1)}%
                </span>
              </div>
              <div className="fd-progress-bar">
                <div className="fd-progress-fill" style={{width:`${(c.value/totalCatExp*100)}%`,background:c.color}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key observations */}
      <div className="fd-card">
        <div className="fd-section-title">Key Observations</div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:8}}>
          {[
            {icon:"◈",text:`Your highest spending category is ${topCat?.label} at ${fmt(topCat?.value||0)}, making up ${((topCat?.value||0)/totalCatExp*100).toFixed(1)}% of total expenses.`,color:"#D85A30"},
            {icon:"◉",text:`Your savings rate is ${savingsRate}%. ${parseFloat(savingsRate)>20?"Great job maintaining a healthy savings rate!":"Consider reducing discretionary spending to improve your savings."}`,color:parseFloat(savingsRate)>20?"#639922":"#BA7517"},
            {icon:"⊟",text:`You make an average transaction of ${fmt(avgTxn)} on expenses. Your most frequent spending category is ${freqCat?freqCat[0]:"N/A"} (${freqCat?freqCat[1]:0} transactions).`,color:"#378ADD"},
            {icon:"◈",text:`Net balance across all records: ${fmt(balance)}. ${balance>0?"You're in positive financial health.":"Consider reviewing your expenses."}`,color:balance>0?"#639922":"#D85A30"},
          ].map((o,i)=>(
            <div key={i} style={{display:"flex",gap:12,padding:"12px 14px",background:"var(--bg,#F5F4F0)",borderRadius:10,alignItems:"flex-start"}}>
              <span style={{fontSize:16,color:o.color,flexShrink:0,marginTop:1}}>{o.icon}</span>
              <span style={{fontSize:13.5,color:"var(--text-primary)",lineHeight:1.6}}>{o.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
