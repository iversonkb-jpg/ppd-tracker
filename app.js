/* ============ RENDER ============ */
function daysLeft(){return Math.round((AP_TARGET-TODAY)/86400000);}
function fmtToday(){return TODAY.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});}

function buildProjTree(){
  const t = document.getElementById('projTree');
  t.innerHTML = projects.map(p=>
    `<div class="tree-item lvl2 ${p===currentProj?'active':''}" data-proj="${p}">
       <span class="caret">•</span>${p}</div>`).join('');
  t.querySelectorAll('[data-proj]').forEach(el=>el.onclick=()=>{currentProj=el.dataset.proj;render();});
}

function gaugeSVG(done,total){
  const r=34,cx=45,cy=45, seg=total, gap=6;
  const startA=-210, sweep=240; // arc
  let out=`<svg width="90" height="70" viewBox="0 0 90 62">`;
  for(let i=0;i<seg;i++){
    const a0=startA + (sweep/seg)*i + gap/seg/2;
    const a1=startA + (sweep/seg)*(i+1) - gap/seg/2;
    const p0=pt(cx,cy,r,a0), p1=pt(cx,cy,r,a1);
    const large = (a1-a0)>180?1:0;
    const col = i<done ? '#1d4ed8' : '#e2e6ec';
    out+=`<path d="M${p0.x} ${p0.y} A${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}" stroke="${col}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
    const lp=pt(cx,cy,r,(a0+a1)/2);
  }
  out+=`<text x="45" y="44" text-anchor="middle" font-size="15" font-weight="800" fill="#1f2937">${done}</text>`;
  out+=`<text x="45" y="55" text-anchor="middle" font-size="8" fill="#6b7280">of ${total}</text></svg>`;
  return out;
}
function pt(cx,cy,r,ang){const a=ang*Math.PI/180;return{x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)};}

function render(){
  const d = DASHES[currentDash];
  document.getElementById('updDate').textContent = fmtToday();
  document.getElementById('dashName').textContent = d.name;
  document.getElementById('dashProj').textContent = "ECO GRANDEUR · "+currentProj;
  document.getElementById('dashSub').textContent = d.sub;
  document.getElementById('crumbProj').textContent = currentProj;
  document.getElementById('crumbDash').textContent = d.name;
  document.getElementById('tlTitle').textContent = d.title;

  // countdown
  const dl = daysLeft();
  document.getElementById('cdN').textContent = dl;
  document.getElementById('countdown').classList.toggle('warn', dl<200);

  // tabs active state
  document.querySelectorAll('#subTabs .tab[data-dash]').forEach(t=>
    t.classList.toggle('active', t.dataset.dash===currentDash));

  // sidebar tree
  buildProjTree();

  // KPI cards (derived from milestones)
  renderKPIs(d);

  // gauges
  document.getElementById('gauges').innerHTML = d.gauges.map(g=>
    `<div class="gauge">${gaugeSVG(g.done,g.total)}<div class="cap">${g.cap}</div>
     <div class="pct">${Math.round(g.done/g.total*100)}% complete</div></div>`).join('');

  // trait subtabs for infra dashboards
  renderTraitTabs(d);

  // timeline
  renderTimeline(d);

  // drill-in
  selMilestone = Math.min(selMilestone, d.milestones.length);
  renderDrill(d);
}

function renderKPIs(d){
  const m=d.milestones;
  const count=s=>m.filter(x=>x.st===s).length;
  const cards=[
    {k:"Milestones",v:m.length,cls:""},
    {k:"Completed",v:count(S.green),cls:"g"},
    {k:"In progress",v:count(S.amber)+count(S.orange),cls:"o"},
    {k:"Delayed",v:count(S.red),cls:"r"},
    {k:"Not started",v:count(S.grey),cls:"d"}
  ];
  document.getElementById('kpis').innerHTML = cards.map(c=>
    `<div class="card ${c.cls}"><div class="k">${c.k}</div><div class="v">${c.v}</div></div>`).join('');
}

function renderTraitTabs(d){
  const tl=document.getElementById('tlTitle').parentElement;
  let holder=document.getElementById('traitTabs');
  if(holder) holder.remove();
  if(d.traits){
    const el=document.createElement('div');
    el.id='traitTabs'; el.className='subtabs';
    el.style.margin='0 15px 0';
    el.innerHTML='<div style="width:100%;font-size:10.5px;color:#6b7280;margin:8px 0 2px">Infrastructure trait / stage:</div>'+
      d.traits.map((t,i)=>`<div class="subtab ${i===currentTrait?'active':''}" data-t="${i}">${t}</div>`).join('');
    tl.insertAdjacentElement('afterend', el);
    el.querySelectorAll('[data-t]').forEach(x=>x.onclick=()=>{currentTrait=+x.dataset.t;render();});
  }
}

function renderTimeline(d){
  const tl=document.getElementById('timeline');
  tl.innerHTML=d.milestones.map(m=>{
    const done = m.st===S.green;
    return `<div class="tl-node ${done?'done':''}">
      <div class="tl-dot ${m.st} ${m.n===selMilestone?'sel':''}" data-n="${m.n}" title="${statusLabel[m.st]}">${m.n}</div>
      <div class="tl-label">${m.label}</div>
      <div class="tl-date">${m.date||'&nbsp;'}</div>
    </div>`;
  }).join('');
  tl.querySelectorAll('[data-n]').forEach(dot=>dot.onclick=()=>{selMilestone=+dot.dataset.n;renderDrill(d);
    tl.querySelectorAll('.tl-dot').forEach(x=>x.classList.remove('sel'));dot.classList.add('sel');});
}

function tagFor(t){return{auto:['AUTO','tag-auto'],ppd:['PPD','tag-ppd'],con:['CONSULTANT','tag-con'],sm:['SM/HOD','tag-sm']}[t]||['','']; }

/* ---- Masterplan Confirmation (MKM milestone 1) — kick-off / feasibility-review / management-clearance loop ---- */
const ordinal=n=>['1st','2nd','3rd','4th','5th','6th'][n-1]||(n+'th');
const mcFlow = {
  brief:{
    baseUploaded:true, confirmed:true,
    location:"Mukim Damansara, Daerah Petaling, Selangor",
    landSize:"182 ac · mixed residential + commercial, phased",
    share:["Land zoning","Density / plot ratio","Topography &amp; terrain","Geology profile",
      "Catchment &amp; nearby drainage system","Nearby TNB power supply (PMU/PPU)","Nearby Sewerage Treatment System (STP)",
      "Nearby Water Supply System","Accessibility study","Pricing studies of surrounding project",
      "Existing amenities","Approved preliminary masterplan"],
    arrange:[
      {key:"si",label:"Soil Investigation (SI)",status:"arranged"},
      {key:"util",label:"Utility mapping",status:"arranged"},
      {key:"sia",label:"SIA report preparation",status:"arranged"},
      {key:"eia",label:"EIA report preparation",status:"arranged"},
      {key:"tia",label:"TIA report preparation",status:"arranged"}
    ]
  },
  rounds:[
    {n:1, date:"05 Jan 26", minutes:true, mp:true, ppdApproved:true,
      ca:{status:'feasible', comment:'Feasible — proceed to 2nd-cut workshop for GDV / product-mix refinement.'}},
    {n:2, date:"19 Jan 26", minutes:true, mp:true, ppdApproved:true,
      ca:{status:'feasible', comment:'Feasible — ready for management presentation.'}}
  ],
  mgmt:{presented:true, decision:'approved', comment:'Approved as presented (Stage B clearance).'},
  consultantInformed:true,
  confirmed:true
};

let calPopupEl=null;
function closeCalPopup(){ if(calPopupEl){calPopupEl.remove(); calPopupEl=null;} document.removeEventListener('click',calOutsideClick,true); }
function calOutsideClick(e){ if(calPopupEl && !calPopupEl.contains(e.target)) closeCalPopup(); }
function openCalendarPicker(anchor, onPick){
  closeCalPopup();
  const pop=document.createElement('div'); pop.className='mc-cal-pop';
  let view=new Date(2026,7,1);
  function draw(){
    const y=view.getFullYear(), mo=view.getMonth();
    const first=new Date(y,mo,1), startDow=first.getDay();
    const daysInMonth=new Date(y,mo+1,0).getDate(), daysInPrev=new Date(y,mo,0).getDate();
    const monthName=view.toLocaleString('en-US',{month:'long'});
    let cells='';
    for(let i=0;i<startDow;i++) cells+=`<div class="cal-day other">${daysInPrev-startDow+1+i}</div>`;
    for(let dd=1; dd<=daysInMonth; dd++) cells+=`<div class="cal-day" data-d="${dd}">${dd}</div>`;
    const trail=(7-((startDow+daysInMonth)%7))%7;
    for(let dd=1; dd<=trail; dd++) cells+=`<div class="cal-day other">${dd}</div>`;
    pop.innerHTML = `<div class="cal-head"><span class="cal-nav" data-nav="-1">&#8249;</span><span>${monthName} ${y}</span><span class="cal-nav" data-nav="1">&#8250;</span></div>
      <div class="cal-grid">${['Su','Mo','Tu','We','Th','Fr','Sa'].map(x=>`<div class="cal-dow">${x}</div>`).join('')}${cells}</div>`;
    pop.querySelectorAll('[data-nav]').forEach(b=>b.onclick=e=>{e.stopPropagation(); view=new Date(y,mo+ +b.dataset.nav,1); draw();});
    pop.querySelectorAll('.cal-day[data-d]').forEach(c=>c.onclick=e=>{
      e.stopPropagation();
      const picked=new Date(y,mo,+c.dataset.d);
      const label=picked.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'2-digit'});
      closeCalPopup(); onPick(label);
    });
  }
  draw();
  document.body.appendChild(pop);
  const r=anchor.getBoundingClientRect();
  pop.style.top=(r.bottom+6)+'px'; pop.style.left=Math.min(r.left, window.innerWidth-236)+'px';
  calPopupEl=pop;
  setTimeout(()=>document.addEventListener('click',calOutsideClick,true),0);
}

/* ============ PRE-CONSULTATION & UPLOAD DOC ============ */
const PC_INTERNAL = ["OSC","JPP","JKB","JK","JKP","JPPH","COB","JL"];
const PC_EXTERNAL = ["TNB","AiS","IWK","JPS","JKR","LPHS","PTD","PTG"];
const pcState = { notRequired:false, sel:"OSC", extra:[], data:{} };
(function pcInit(){
  const mk=o=>Object.assign({status:"grey",date:null,notes:[],sketch:false,ppdDate:null,revs:[{rev:"R0",uploaded:false,review:null,remarks:""}]},o);
  [...PC_INTERNAL,...PC_EXTERNAL].forEach(c=>pcState.data[c]=mk({}));
  pcState.data.OSC=mk({status:"amber",date:"12 Feb 26",notes:[{d:"12 Feb 26",t:"Advised to revise setback along the main road; confirm plot ratio."}],sketch:true,ppdDate:"20 Feb 26",revs:[{rev:"R0",uploaded:true,review:null,remarks:""}]});
  pcState.data.JPP=mk({status:"green",date:"10 Feb 26",notes:[{d:"10 Feb 26",t:"No objection in principle; proceed."}],revs:[{rev:"R0",uploaded:true,review:"accepted",remarks:""}]});
  pcState.data.JK =mk({status:"red",date:"11 Feb 26",notes:[{d:"11 Feb 26",t:"Drainage alignment not acceptable at NE boundary."}],sketch:true,ppdDate:"18 Feb 26",revs:[{rev:"R0",uploaded:true,review:"rejected",remarks:"Revise drainage; resubmit R1."}]});
  pcState.data.IWK=mk({status:"amber",date:"13 Feb 26",revs:[{rev:"R0",uploaded:false,review:null,remarks:""}]});
})();
const PC_LBL={grey:"Not started",amber:"In progress",green:"Accepted",red:"Comments / rejected"};
const PC_SHORT={grey:"—",amber:"WIP",green:"OK",red:"CMT"};
const PC_PILL={grey:"grey",amber:"amber",green:"green",red:"red"};

function pcAuthBox(code){
  const r=pcState.data[code]||{status:"grey"};
  return `<div class="pc-auth st-${r.status} ${pcState.sel===code?'sel':''}" data-auth="${code}" title="${PC_LBL[r.status]}">${code}<small>${PC_SHORT[r.status]}</small></div>`;
}
function pcLeft(){
  const st=pcState;
  return `<div class="pc-toggle" data-pc="toggle"><span>Pre-consultation ${st.notRequired?'<span class="tg">not required</span>':'required'}</span><span>${st.notRequired?'&#9745;':'&#9744;'} tab down (NA)</span></div>
    <div class="pc-sec-label">a. Internal Depts (Local Council)</div>
    <div class="pc-auth-grid">${PC_INTERNAL.map(pcAuthBox).join('')}</div>
    <div class="pc-sec-label">b. External Depts</div>
    <div class="pc-auth-grid">${PC_EXTERNAL.map(pcAuthBox).join('')}${st.extra.map(pcAuthBox).join('')}</div>
    <div class="pc-add" data-pc="add">+ Add Authority</div>
    <div class="info" style="margin-top:10px">Click an authority to open its pre-consultation record. Colour = status: grey not started · amber in progress · green accepted · red comments/rejected. Click NA to tab-down authorities not applicable.</div>`;
}
function pcDetail(code,a){
  let h=`<div class="pc-detail"><div class="pc-d-head">${code} — Pre-consultation <span class="pill ${PC_PILL[a.status]}">${PC_LBL[a.status]}</span></div>
    <div class="pc-row"><span class="pc-k">a.</span><span class="pc-v">Date of pre-consultation <span class="muted">(Consultant)</span><br>
      <button class="pc-btn date ${a.date?'set':''}" data-pc="date">${a.date||'Select date'}</button></span></div>
    <div class="pc-row"><span class="pc-k">b.</span><span class="pc-v">Pre-consultation comments / notes <span class="muted">(Consultant)</span>
      ${a.notes.map(n=>`<div class="pc-note"><b>${n.d}</b> — ${n.t}</div>`).join('')}
      <button class="pc-btn upload" data-pc="addnote" style="margin-top:6px">+ Add note</button></span></div>
    <div class="pc-row"><span class="pc-k">c.</span><span class="pc-v">Meeting note / sketch <span class="muted">(Consultant)</span><br>
      <button class="pc-btn upload ${a.sketch?'done':''}" data-pc="sketch">${a.sketch?'&#10003; Uploaded':'Upload note / sketch'}</button></span></div>
    <div class="pc-row"><span class="pc-k">d.</span><span class="pc-v">PPD sets date for revised drawings <span class="muted">(PPD)</span><br>
      <button class="pc-btn date ${a.ppdDate?'set':''}" data-pc="ppddate">${a.ppdDate||'Set date'}</button></span></div>`;
  a.revs.forEach((r,i)=>{
    h+=`<div class="pc-rev"><div class="pc-rev-h">${r.rev} — draft submission doc / drawings</div>
      <button class="pc-btn upload ${r.uploaded?'done':''}" data-pc="upload" data-i="${i}">${r.uploaded?'&#10003; pdf &amp; cad uploaded':'Upload pdf &amp; cad'}</button>
      <div style="margin-top:8px;font-size:11px;color:#374151">PPD review: `;
    if(!r.uploaded) h+=`<span class="muted">awaiting upload</span>`;
    else if(r.review==='accepted') h+=`<span class="pill green">Accepted → notify consultant to submit</span>`;
    else if(r.review==='rejected') h+=`<span class="pill red">Rejected</span>${r.remarks?` <span class="muted">— ${r.remarks}</span>`:''}`;
    else h+=`<button class="pc-btn accept" data-pc="accept" data-i="${i}">Accept</button> <button class="pc-btn reject" data-pc="reject" data-i="${i}">Reject</button>`;
    h+=`</div></div>`;
  });
  h+=`<div class="pc-add" data-pc="addrev" style="margin-top:9px">+ Add revision (R${a.revs.length})</div>
    <div class="info" style="margin-top:10px">If rejected, the commented drawings auto-attach and flow back to the consultant to revise the next revision. Target: pre-consult 1.5 months before online submission; system reminds at 1.5 / 1 / 0.5 months.</div></div>`;
  return h;
}
function renderPreConsult(){
  const st=pcState;
  document.querySelector('.drill').style.gridTemplateColumns='236px 1fr';
  document.getElementById('drillSteps').innerHTML=pcLeft();
  document.getElementById('drillSide').innerHTML=st.notRequired
    ? `<div class="pc-detail"><div class="pc-empty">Pre-consultation marked <b>not required</b> for this submission — authority pre-consultation is skipped; proceed to online submission.</div></div>`
    : pcDetail(st.sel, st.data[st.sel]);
  wirePreConsult();
}
function wirePreConsult(){
  const root=document.querySelector('.drill');
  const re=()=>renderDrill(MKM);
  root.querySelectorAll('[data-auth]').forEach(b=>b.onclick=()=>{pcState.sel=b.dataset.auth;re();});
  const q=s=>root.querySelector(s);
  const tgl=q('[data-pc="toggle"]'); if(tgl) tgl.onclick=()=>{pcState.notRequired=!pcState.notRequired;re();};
  const add=q('[data-pc="add"]'); if(add) add.onclick=()=>{const c=prompt('New authority code (e.g. SKMM):'); if(c){c=c.trim(); pcState.extra.push(c); pcState.data[c]={status:"grey",date:null,notes:[],sketch:false,ppdDate:null,revs:[{rev:"R0",uploaded:false,review:null,remarks:""}]}; pcState.sel=c; re();}};
  const a=pcState.data[pcState.sel];
  const dt=q('[data-pc="date"]'); if(dt) dt.onclick=e=>openCalendarPicker(e.currentTarget,l=>{a.date=l; if(a.status==='grey')a.status='amber'; re();});
  const pd=q('[data-pc="ppddate"]'); if(pd) pd.onclick=e=>openCalendarPicker(e.currentTarget,l=>{a.ppdDate=l; re();});
  const sk=q('[data-pc="sketch"]'); if(sk) sk.onclick=()=>{a.sketch=!a.sketch; if(a.status==='grey')a.status='amber'; re();};
  const an=q('[data-pc="addnote"]'); if(an) an.onclick=()=>{const t=prompt('Pre-consultation note:'); if(t){a.notes.push({d:fmtToday(),t:t.trim()}); if(a.status==='grey')a.status='amber'; re();}};
  root.querySelectorAll('[data-pc="upload"]').forEach(b=>b.onclick=()=>{a.revs[+b.dataset.i].uploaded=true; if(a.status==='grey')a.status='amber'; re();});
  root.querySelectorAll('[data-pc="accept"]').forEach(b=>b.onclick=()=>{a.revs[+b.dataset.i].review='accepted'; a.status='green'; re();});
  root.querySelectorAll('[data-pc="reject"]').forEach(b=>b.onclick=()=>{const rm=prompt('Rejection remarks (auto-attached to drawings):')||''; const r=a.revs[+b.dataset.i]; r.review='rejected'; r.remarks=rm; a.status='red'; re();});
  const ar=q('[data-pc="addrev"]'); if(ar) ar.onclick=()=>{a.revs.push({rev:"R"+a.revs.length,uploaded:false,review:null,remarks:""}); re();};
}

function renderMasterplanConfirm(m){
  const brief=mcFlow.brief;
  let briefAction;
  if(!brief.confirmed){
    briefAction = brief.baseUploaded
      ? `<button class="mc-btn go" data-act="brief-confirm">PPD confirms Project Brief &amp; proceeds to KM Meeting</button>`
      : `<span class="mc-note" style="margin:0">Upload the Base Plan to enable confirmation.</span>`;
  } else {
    briefAction = `<span class="mc-link done"><span class="ic">&#10003;</span>Project Brief confirmed</span> <button class="mc-btn warn" data-act="brief-edit">Return</button>`;
  }
  const briefHtml = `<div class="mc-step mc-accent">
    <div class="mc-n">Step 1 &middot; Project Brief</div>
    <div class="mc-row">
      <span class="mc-link ${brief.baseUploaded?'done':''}" data-act="brief-base">
        <span class="ic">${brief.baseUploaded?'&#10003;':'&#128206;'}</span>${brief.baseUploaded?'Base Plan uploaded (PPD)':'Link to click (PPD to upload the base plan)'}
      </span>
      ${brief.baseUploaded?'<button class="mc-btn warn" data-act="brief-base-edit">Return / re-upload</button>':''}
    </div>
    <div class="mc-note" style="margin:9px 0 4px;font-weight:700;color:#374151">a&ndash;b. Basic project data</div>
    <div class="mc-row">
      <span class="mc-att" style="background:#fff;border:1px solid var(--line);font-weight:600">Location: ${brief.location}</span>
      <span class="mc-att" style="background:#fff;border:1px solid var(--line);font-weight:600">Land size / programme: ${brief.landSize}</span>
    </div>
    <div class="mc-note" style="margin:10px 0 4px;font-weight:700;color:#374151">c&ndash;n. System to share (auto)</div>
    <div class="mc-row" style="gap:5px">${brief.share.map(s=>`<span class="mc-att" style="background:var(--blue-soft);color:var(--blue)">${s}</span>`).join('')}</div>
    <div class="mc-note" style="margin:10px 0 4px;font-weight:700;color:#374151">o&ndash;s. PPD to arrange</div>
    ${brief.arrange.map(a=>`<div class="mc-row">
      <span class="mc-link ${a.status==='arranged'?'done':''}" data-act="brief-arrange" data-key="${a.key}">
        <span class="ic">${a.status==='arranged'?'&#10003;':'&#128206;'}</span>${a.label} &mdash; ${a.status==='arranged'?'Arranged':'Click to mark arranged'}
      </span>
    </div>`).join('')}
    <div class="mc-row" style="margin-top:9px">${briefAction}</div>
  </div>`;

  const lastRound = mcFlow.rounds[mcFlow.rounds.length-1];
  const readyForMgmt = lastRound.ca.status==='feasible' && lastRound.ppdApproved && lastRound.minutes && lastRound.mp;

  const roundsHtml = mcFlow.rounds.map(r=>{
    const label = ordinal(r.n)+'-cut Masterplan';
    return `<div class="mc-step">
      <div class="mc-n">KM Meeting ${r.n} &middot; ${label}</div>
      <div class="mc-row">
        <span class="mc-date ${r.date?'set':''}" data-act="cal" data-round="${r.n}">${r.date||'Select date'}</span>
        <span class="mc-outlook" data-act="outlook" data-round="${r.n}">link to Outlook calendar</span>
        <span class="mc-attendees"><span class="mc-att">Planner</span><span class="mc-att">Architect</span><span class="mc-att">C&amp;S</span><span class="mc-att">M&amp;E</span></span>
      </div>
      <div class="mc-row">
        <span class="mc-link ${r.minutes?'done':''}" data-act="minutes" data-round="${r.n}">
          <span class="ic">${r.minutes?'&#10003;':'&#128206;'}</span>${r.minutes?'Minutes uploaded (PPD)':'Link to click (PPD to upload meeting minutes)'}
        </span>
        <span class="mc-link ${r.mp?'done':''}" data-act="mp" data-round="${r.n}">
          <span class="ic">${r.mp?'&#10003;':'&#128206;'}</span>${r.mp?label+' uploaded (Planner)':'Link to click (Planner to upload '+label+')'}
        </span>
      </div>
      <div class="mc-row">
        <span style="font-size:10.5px;color:var(--muted);font-weight:600">CA feasibility review (internal):</span>
        <span class="mc-pill-toggle">
          <span class="${r.ca.status==='feasible'?'active feasible':''}" data-act="ca-feasible" data-round="${r.n}">Feasible</span>
          <span class="${r.ca.status==='not-feasible'?'active notfeasible':''}" data-act="ca-notfeasible" data-round="${r.n}">Not feasible</span>
        </span>
      </div>
      <div class="mc-comment">${r.ca.comment} <span class="mc-outlook" data-act="ca-comment" data-round="${r.n}" style="margin-left:6px">edit</span></div>
      ${r.ca.status==='not-feasible' && r.n===lastRound.n ? '<div class="mc-note">Not feasible — loops back for another KM meeting until PPD is satisfied.</div>' : ''}
      ${r.ca.status==='feasible' ? (
        r.ppdApproved
          ? `<div class="mc-row" style="margin-top:8px"><span class="mc-link done"><span class="ic">&#10003;</span>PPD approved this masterplan cut</span></div>`
          : (r.n===lastRound.n ? `<div class="mc-row" style="margin-top:8px">
               <span style="font-size:10.5px;color:var(--muted);font-weight:600">PPD decision:</span>
               <button class="mc-btn go" data-act="ppd-approve" data-round="${r.n}">Approve this masterplan cut</button>
               <button class="mc-btn ghost" data-act="ppd-repeat" data-round="${r.n}">Repeat — open next KM meeting</button>
             </div>` : '')
      ) : ''}
    </div>`;
  }).join('');

  const addRoundBtn = `<div class="mc-row" style="margin:-2px 0 10px">
    <button class="mc-btn ghost" data-act="add-round">+ Add KM meeting ${mcFlow.rounds.length+1}</button>
  </div>`;

  let mgmtHtml = `<div class="mc-step mc-accent">
    <div class="mc-n">Management Presentation &amp; Clearance</div>`;
  if(!readyForMgmt){
    mgmtHtml += `<div class="mc-note">Available once CA marks the latest KM meeting's masterplan cut as <b>Feasible</b> (minutes &amp; masterplan uploaded) and PPD approves it.</div>`;
  } else if(!mcFlow.mgmt.presented){
    mgmtHtml += `<div class="mc-row"><button class="mc-btn submit" data-act="present-mgmt">PPD presents masterplan to management</button></div>`;
  } else if(!mcFlow.mgmt.decision){
    mgmtHtml += `<div class="mc-row">
      <button class="mc-btn go" data-act="mgmt-approve">Management approved</button>
      <button class="mc-btn warn" data-act="mgmt-amend">Management — amendment requested</button>
    </div>`;
  } else {
    mgmtHtml += `<div class="mc-row"><span class="mc-link done"><span class="ic">&#10003;</span>Management approved</span></div>
      <div class="mc-comment">${mcFlow.mgmt.comment}</div>`;
  }
  mgmtHtml += `</div>`;

  let informHtml='';
  if(mcFlow.mgmt.decision==='approved'){
    informHtml = `<div class="mc-step">
      <div class="mc-n">Inform Consultant of Outcome</div>`;
    if(!mcFlow.consultantInformed){
      informHtml += `<div class="mc-row"><button class="mc-btn submit" data-act="notify-consultant">Notify consultant (Planner, Architect, C&amp;S, M&amp;E)</button></div>`;
    } else {
      informHtml += `<div class="mc-row"><span class="mc-link done"><span class="ic">&#10003;</span>Consultants notified of management decision</span></div>`;
    }
    informHtml += `</div>`;
  }

  let confirmHtml='';
  if(mcFlow.consultantInformed){
    confirmHtml = `<div class="mc-step">
      <div class="mc-n">Confirm KM in System</div>`;
    if(!mcFlow.confirmed){
      confirmHtml += `<div class="mc-row"><button class="mc-btn go" data-act="confirm-km">PPD confirms KM approved &amp; proceeds to next step</button></div>`;
    } else {
      confirmHtml += `<div class="mc-success">&#10003; Masterplan confirmed — baseline set, proceeding to Setup &amp; Consultant LOA.</div>`;
    }
    confirmHtml += `</div>`;
  }

  const step2Html = brief.confirmed
    ? `<div class="mc-note" style="margin:2px 0 8px;font-weight:700;color:#374151">Step 2 &middot; KM Meeting</div>` + roundsHtml + addRoundBtn + mgmtHtml + informHtml + confirmHtml
    : `<div class="mc-step"><div class="mc-n">Step 2 &middot; KM Meeting</div><div class="mc-note" style="margin:0">Available once the Project Brief (Step 1) is confirmed.</div></div>`;

  const el=document.getElementById('drillSteps');
  el.insertAdjacentHTML('beforeend', briefHtml + step2Html);

  el.querySelectorAll('[data-act]').forEach(node=>{
    const act=node.dataset.act, rn=+node.dataset.round;
    const round = mcFlow.rounds.find(r=>r.n===rn);
    node.onclick=(e)=>{
      switch(act){
        case 'brief-base': if(!brief.baseUploaded){ brief.baseUploaded=true; renderDrill(MKM); } break;
        case 'brief-base-edit': brief.baseUploaded=false; brief.confirmed=false; alert('Base Plan link returned to PPD for re-upload.'); renderDrill(MKM); break;
        case 'brief-arrange': { const a=brief.arrange.find(x=>x.key===node.dataset.key); a.status = a.status==='arranged'?'pending':'arranged'; renderDrill(MKM); break; }
        case 'brief-confirm': if(brief.baseUploaded){ brief.confirmed=true; renderDrill(MKM); } break;
        case 'brief-edit': brief.confirmed=false; renderDrill(MKM); break;
        case 'cal': openCalendarPicker(e.currentTarget, label=>{ round.date=label; renderDrill(MKM); }); break;
        case 'outlook': alert('Outlook calendar invite generated for KM meeting '+rn+(round.date?' on '+round.date:'')+' and sent to Planner, Architect, C&S, M&E.'); break;
        case 'minutes': if(!round.minutes){ round.minutes=true; renderDrill(MKM); } break;
        case 'mp': if(!round.mp){ round.mp=true; renderDrill(MKM); } break;
        case 'ca-feasible': round.ca.status='feasible'; renderDrill(MKM); break;
        case 'ppd-approve': round.ppdApproved=true; renderDrill(MKM); break;
        case 'ppd-repeat':
          round.ppdApproved=false;
          if(rn===mcFlow.rounds.length){ mcFlow.rounds.push({n:rn+1,date:null,minutes:false,mp:false,ppdApproved:false,ca:{status:'pending',comment:'Awaiting CA feasibility review.'}}); }
          mcFlow.mgmt.presented=false; mcFlow.mgmt.decision=null;
          renderDrill(MKM);
          break;
        case 'ca-notfeasible':
          round.ca.status='not-feasible';
          if(rn===mcFlow.rounds.length){ mcFlow.rounds.push({n:rn+1,date:null,minutes:false,mp:false,ppdApproved:false,ca:{status:'pending',comment:'Awaiting CA feasibility review.'}}); }
          mcFlow.mgmt.presented=false; mcFlow.mgmt.decision=null;
          renderDrill(MKM);
          break;
        case 'ca-comment': { const v=prompt('CA feasibility comment:', round.ca.comment); if(v){ round.ca.comment=v; renderDrill(MKM); } break; }
        case 'add-round':
          mcFlow.rounds.push({n:mcFlow.rounds.length+1,date:null,minutes:false,mp:false,ppdApproved:false,ca:{status:'pending',comment:'Awaiting CA feasibility review.'}});
          mcFlow.mgmt.presented=false; mcFlow.mgmt.decision=null;
          renderDrill(MKM);
          break;
        case 'present-mgmt': mcFlow.mgmt.presented=true; renderDrill(MKM); break;
        case 'mgmt-approve': { const v=prompt('Management comment (optional):','Approved as presented.'); mcFlow.mgmt.decision='approved'; mcFlow.mgmt.comment=v||'Approved.'; renderDrill(MKM); break; }
        case 'mgmt-amend': {
          const v=prompt('Amendment requested — comment:','Please revise product mix per management feedback.');
          mcFlow.mgmt.comment=v||'Amendment requested.'; mcFlow.mgmt.presented=false; mcFlow.mgmt.decision=null;
          mcFlow.rounds.push({n:mcFlow.rounds.length+1,date:null,minutes:false,mp:false,ppdApproved:false,ca:{status:'pending',comment:'Awaiting CA feasibility review.'}});
          alert('Consultants (Planner, Architect, C&S, M&E) informed of the requested amendment.');
          renderDrill(MKM);
          break;
        }
        case 'notify-consultant': mcFlow.consultantInformed=true; alert('Consultants notified: masterplan approved by management.'); renderDrill(MKM); break;
        case 'confirm-km':
          mcFlow.confirmed=true; m.st=S.green; m.date=fmtToday();
          render();
          break;
      }
    };
  });
}

/* ---- KM & BP Online Submission (MKM milestone 3) — twin-track upload ---- */
const kmSubState = {
  km:{date:"01 Apr 26", ack:true, docs:true},
  bp:{date:"01 Apr 26", ack:true, docs:true}
};
function renderKMOnlineSubmission(m){
  const st=kmSubState;
  const bothReady = st.km.date && st.km.ack && st.km.docs && st.bp.date && st.bp.ack && st.bp.docs;

  const box=(key,label)=>{
    const t=st[key];
    return `<div class="mc-step kmsub-box">
      <div class="mc-n">${label}<span class="kmsub-tag">Consultant / Planner</span></div>
      <div class="mc-row">
        <span class="mc-date ${t.date?'set':''}" data-act="kms-date" data-track="${key}">${t.date||'Select date'}</span>
        <span style="font-size:10.5px;color:var(--muted)">submitted date</span>
      </div>
      <div class="mc-row">
        <span class="mc-link ${t.ack?'done':''}" data-act="kms-ack" data-track="${key}">
          <span class="ic">${t.ack?'&#10003;':'&#128206;'}</span>${t.ack?'Acknowledgement screenshot uploaded':'Upload online submission acknowledgement screenshot'}
        </span>
      </div>
      <div class="mc-row">
        <span class="mc-link ${t.docs?'done':''}" data-act="kms-docs" data-track="${key}">
          <span class="ic">${t.docs?'&#10003;':'&#128206;'}</span>${t.docs?'Submitted doc / dwgs uploaded':'Upload the submitted doc / dwgs'}
        </span>
      </div>
    </div>`;
  };

  const html = `<div class="mc-note" style="margin:0 0 9px">a. Consultant to upload screenshot of online submission acknowledgement for KM &amp; BP submission, and the respective submitted doc/dwgs.</div>
    <div class="kmsub-grid">${box('km','KM')}${box('bp','BP')}</div>
    <div class="mc-step kmsub-auto ${bothReady?'active':''}" style="margin-top:10px">
      <div class="mc-n">System (auto)</div>
      <div class="kmsub-note" style="margin-bottom:0">System forwards the online submitted DO layout to the land surveyor to prepare the precom plan, and notifies in Task List (PPD, land surveyor, Planner, Architect).${bothReady?' <b style="color:var(--blue)">— forwarded &amp; notified.</b>':' <span class="muted">Triggers once KM &amp; BP submission dates and uploads are complete.</span>'}</div>
    </div>`;

  const el=document.getElementById('drillSteps');
  el.insertAdjacentHTML('beforeend', html);

  el.querySelectorAll('[data-act]').forEach(node=>{
    const act=node.dataset.act, track=node.dataset.track;
    const t=st[track];
    node.onclick=(e)=>{
      switch(act){
        case 'kms-date': openCalendarPicker(e.currentTarget, label=>{ t.date=label; renderDrill(MKM); }); break;
        case 'kms-ack': if(!t.ack){ t.ack=true; renderDrill(MKM); } break;
        case 'kms-docs': if(!t.docs){ t.docs=true; renderDrill(MKM); } break;
      }
    };
  });
}

function renderDrill(d){
  const m=d.milestones.find(x=>x.n===selMilestone);
  document.getElementById('drillTitle').textContent = `Step ${m.n} · ${m.label.replace(/&amp;/g,'&')}`;
  document.getElementById('drillHint').innerHTML = `Status: <b>${statusLabel[m.st]}</b>${m.date&&m.date!=='—'?' · '+m.date:''}`;

  if(d===MKM && m.pc){ renderPreConsult(); return; }
  document.querySelector('.drill').style.gridTemplateColumns='';

  // steps
  if(d===MKM && m.mc){
    document.getElementById('drillSteps').innerHTML =
      `<div style="font-size:11px;color:#6b7280;margin-bottom:8px">Masterplan Confirmation — kick-off, iterative masterplan cuts &amp; internal feasibility review, then management clearance</div>`;
    renderMasterplanConfirm(m);
  } else if(d===MKM && m.kmsub){
    document.getElementById('drillSteps').innerHTML =
      `<div style="font-size:11px;color:#6b7280;margin-bottom:8px">KM &amp; BP Online Submission — twin-track acknowledgement &amp; document upload</div>`;
    renderKMOnlineSubmission(m);
  } else {
    document.getElementById('drillSteps').innerHTML =
      `<div style="font-size:11px;color:#6b7280;margin-bottom:8px">Actions in this milestone</div>
       <ol class="steps">`+ m.steps.map(s=>{
        const [txt,tg]=s; const [lbl,cls]=tagFor(tg);
        return `<li>${txt}<span class="step-tag ${cls}">${lbl}</span></li>`;
       }).join('') + `</ol>`;
  }

  // side: dept grid if any + doc/status
  let side='';
  if(m.depts){
    let set, heading;
    if(m.depts==='trait'){ set = TRAIT_AUTH[d.traits[currentTrait]]||DEPTS_INFRA;
      heading = d.traits[currentTrait]+" — Authority Clearance"; }
    else if(m.depts==='km'){ set = DEPTS_KM; heading = "Agency Clearance (G1–G8 gate)"; }
    else { set = DEPTS_INFRA; heading = "Department Clearance"; }
    side += `<div style="font-size:11px;font-weight:700;margin-bottom:8px">${heading}
      <span class="muted" style="font-weight:400">(dot-status per authority)</span></div>
      <div class="dept-grid">`+ set.map(x=>
        `<div class="dept ${x.s}" title="${statusLabel[x.s]}">${x.c}<small>${statusLabel[x.s].split(' ')[0]}</small></div>`).join('')+`</div>`;
  }
  // sample document checklist
  side += `<div style="font-size:11px;font-weight:700;margin:14px 0 4px">Document Checklist
    <span class="ping" onclick="alert('Manual ping sent to consultant: kindly update status.')">Ping consultant</span></div>`;
  const docs = sampleDocs(m);
  side += docs.map(dc=>
    `<div class="doc-row"><span class="chk ${dc.s}">${dc.done?'✓':''}</span>${dc.name}
      <span class="pill ${dc.p}">${dc.tag}</span></div>`).join('');

  side += `<div class="info">Timeline is baseline <b>R0</b>; revised programs (R1, R2…) approved by CDO show below R0 for comparison.
    System auto-pings every 3 days on pending items and auto-redistributes duration on delay without moving the AP target.</div>`;
  document.getElementById('drillSide').innerHTML = side;
}

function sampleDocs(m){
  // deterministic-ish sample by status
  const base=[
    {name:"Layout drawings (PDF)"},{name:"Reports / calculation"},
    {name:"Cover letter / Borang"},{name:"Acknowledgement copy"}
  ];
  return base.map((b,i)=>{
    let done,p,tag;
    if(m.st===S.green){done=true;p='green';tag='Uploaded';}
    else if(m.st===S.orange){done=i<2;p=i<2?'green':'amber';tag=i<2?'Uploaded':'Pending';}
    else if(m.st===S.amber){done=i<1;p=i<1?'green':'amber';tag=i<1?'Uploaded':'In progress';}
    else if(m.st===S.red){done=i<1;p=i<1?'green':'red';tag=i<1?'Uploaded':'Overdue';}
    else {done=false;p='grey';tag='Not started';}
    return {...b,done,p,tag};
  });
}

/* ---- tab wiring ---- */
document.querySelectorAll('#subTabs .tab[data-dash]').forEach(t=>t.onclick=()=>{
  currentDash=t.dataset.dash; currentTrait=0; selMilestone=1; render();
});

buildProjTree();
render();
