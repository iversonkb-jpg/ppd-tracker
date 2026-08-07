/* ============ SAMPLE DATA MODEL ============ */
const AP_TARGET = new Date('2027-09-05');
const TODAY = new Date('2026-08-01');

const projects = ["Eco Business Park 7","Utopia East","Esplanad Square","Utopia South","Wellington Garden Home",
  "Wellington Terrace Home","Norton Garden Home","Norton Courtyard Home","Sterling West"];
let currentProj = "Eco Business Park 7";

const S = {green:"st-green",amber:"st-amber",orange:"st-orange",red:"st-red",grey:"st-grey",appeal:"st-appeal"};
const statusLabel = {"st-green":"Completed","st-amber":"In progress / Ulasan","st-orange":"Submitted & pending",
  "st-red":"Delayed / Overdue","st-grey":"Not started","st-appeal":"Appeal case"};

/* ---- MASTER KM (r2: Kebenaran Merancang via OSC 3.0 Plus) ---- */
const MKM = {
  name:"Master KM", title:"Master KM (Kebenaran Merancang) Submission Tracking · OSC 3.0 Plus",
  sub:"Carried over from CEO-cleared Masterplan (Stage B) → KM approval · management approval carried over; timeline auto-generated from pre-set durations",
  gauges:[
    {cap:"Setup & Coordination",done:6,total:6},
    {cap:"Agency Gate (G1–G8)",done:5,total:8},
    {cap:"OSC Submission",done:3,total:6},
    {cap:"Deliberation & Approval",done:0,total:6}
  ],
  milestones:[
    {n:1,label:"Masterplan Confirmation",st:S.green,date:"12 Jan 26",mc:true,
      steps:[["PPD sets up KM kick-off meeting to brief consultants (Planner, Architect, C&amp;S, M&amp;E)","ppd"],
        ["PPD uploads meeting minutes; Planner uploads the masterplan cut","ppd"],
        ["Contract Admin (CA) runs feasibility study on the masterplan cut — internal review","con"],
        ["Repeat for KM meeting 2 onward until PPD is satisfied the masterplan is feasible","auto"],
        ["PPD presents the approved masterplan to management for clearance","ppd"],
        ["Once cleared (with any amendment), PPD informs the consultant of the outcome","ppd"],
        ["PPD confirms KM approved in system; proceeds to Setup &amp; Consultant LOA","auto"]]},
    {n:2,label:"Pre-consultation & Upload Doc",st:S.amber,date:"05 Feb 26",pc:true,
      steps:[["Consultant selects the pre-consultation date per authority; PPD sets revised-drawing dates","con"],
        ["Consultant uploads pre-consultation comments, meeting notes / sketch per authority","con"],
        ["Consultant uploads draft drawings (R0); PPD reviews → Accept / Reject with remarks","ppd"],
        ["If accepted → proceed to submission; if rejected → revise (R1, R2…) until accepted","auto"]]},
    {n:3,label:"KM Online Submission",st:S.orange,date:"01 Apr 26",kmsub:true,
      steps:[["GATE: all external technical agency approvals (G1–G8 — JKR, IWK, Water, JPS, TNB, Telco, JMG, Land) must be cleared first","ppd"],
        ["Consultant uploads screenshot of online submission acknowledgement for KM &amp; BP, plus the respective submitted doc/dwgs","con"],
        ["System forwards the submitted DO layout to the land surveyor to prepare the precom plan; notifies PPD, land surveyor, Planner &amp; Architect","auto"]],
      depts:"km"},
    {n:4,label:"Hardcopy Submission",st:S.grey,date:"—",
      steps:[["FEE: upon online submission approved (complete), PSP pays processing / application fee","con"],
        ["PSP submits the HARDCOPY set to the OSC counter (after online approval &amp; fee payment)","con"],
        ["System records OSC submission date / reference no. &amp; tracks statutory processing period","auto"]]},
    {n:5,label:"Clearance (Ext & Int Depts)",st:S.grey,date:"—",
      steps:[["OSC circulates KM to internal departments; PPD / consultants confirm all external agency approvals in","con"],
        ["Consultants upload responses / amended plans for each OSC / agency query","con"],
        ["Repeat until all comments cleared &amp; all agency approvals confirmed","auto"],
        ["PPD-HOD updates management on KM processing status (periodic)","ppd"]]},
    {n:6,label:"OSC Meeting",st:S.grey,date:"—",
      steps:[["OSC Technical Committee / Full Board (Mesyuarat JK OSC) deliberates the KM","auto"],
        ["OSC issues decision: (a) Approved; (b) Approved with conditions; (c) Deferred / rejected","auto"]]},
    {n:7,label:"Comply / Appeal",st:S.grey,date:"—",
      steps:[["COMPLY path: consultants amend plans, resubmit for re-deliberation","con"],
        ["APPEAL path: PPD-HOD evaluates &amp; lodges appeal (checks WIKI for similar successful cases)","ppd"],
        ["OSC / Appeal Board re-deliberates; repeat comply-or-appeal until KM approved","auto"]]},
    {n:8,label:"KM Approval Endorsement",st:S.grey,date:"—",
      steps:[["FEE: PBT issues KM approval (Kebenaran Merancang) with conditions (syarat C1 / C2)","auto"],
        ["Pay KM / development charge (Caj Pemajuan) &amp; any bank guarantee as billed","con"],
        ["Town Planner uploads the KM approval letter &amp; conditions into the system","con"]]},
    {n:9,label:"Conditions Review & Handover",st:S.grey,date:"—",
      steps:[["PPD-HOD reviews KM conditions, registers compliance items, briefs CDO / GM / S&amp;M","ppd"],
        ["System notifies Consultant, PPD, HOD, TH: “Master KM approval obtained”","auto"],
        ["PPD-HOD hands over to next stage — Building Plan / Earthworks / Infrastructure works","ppd"]]}
  ]
};

/* ---- MASTER INFRA (r2: per-trait G1–G7, post-KM approval) ---- */
const MINFRA = {
  name:"Master Infra", title:"Master Infra Submission Tracking · per-trait (G1–G7)",
  sub:"Triggered upon Master KM approval · each trait demarcated separately; timeline auto-generated from Infra Doc-Checklist durations",
  traits:["Earthwork","Road & Drainage","Streetlighting","Sewerage","Water Supply","Power","Telekom"],
  gauges:[
    {cap:"Setup & Doc Prep",done:3,total:3},
    {cap:"Pre-Consultation",done:2,total:3},
    {cap:"Submission & Fee",done:1,total:3},
    {cap:"Approval / Comply",done:0,total:3}
  ],
  milestones:[
    {n:1,label:"Setup & Demarcation",st:S.green,date:"15 Jun 26",
      steps:[["TRIGGER: upon Master KM approval, PPD-HOD flags the trait submission &amp; demarcates the boundary","ppd"],
        ["System auto-generates the timeline (pre-set durations) &amp; notifies consultant, CA &amp; PI","auto"]]},
    {n:2,label:"Document Preparation",st:S.green,date:"22 Jun 26",
      steps:[["Consultant / PPD prepare the documents per the Infra Doc Checklist","con"],
        ["System auto-ticks the checklist as items are uploaded to Data Storage","auto"]]},
    {n:3,label:"Pre-Consultation & Design Coordination",st:S.amber,date:"—",
      steps:[["PRE-CONSULTATION: consultant makes the pre-consultation appointment with the authority","con"],
        ["Combined Infra Design-Coordination Meeting — single joint session for G1–G7","con"],
        ["PPD checks revised drawings — if OK proceed to submission (green); if not, revise","ppd"]],
      depts:"trait"},
    {n:4,label:"Fee Prep & Submission",st:S.orange,date:"—",
      steps:[["FEE: consultant uploads the fee calculation; PPD verifies → Payment Requisition flow","con"],
        ["SUBMIT: consultant compiles per checklist &amp; submits the plan / report to the authority","con"],
        ["System records the submission; consultant follows up with the authority","auto"]],
      depts:"trait"},
    {n:5,label:"Statutory Fee Payment",st:S.grey,date:"—",
      steps:[["FEE: payment of processing / statutory fee (per checklist) — consultant uploads the slip","con"],
        ["System links to Payment Requisition flow (auto notification-letter template)","auto"]]},
    {n:6,label:"Comments — Comply / Appeal",st:S.grey,date:"—",
      steps:[["COMMENTS: consultant uploads the ulasan / comments; system flows to HOD-PPD","con"],
        ["COMPLY: update drawings; PPD sets resubmission days; consultant resubmits","ppd"],
        ["APPEAL: HOD-PPD lodges the appeal (checks WIKI); consultant discusses with the authority","ppd"],
        ["Repeat until the authority clears the submission","auto"]],
      depts:"trait"},
    {n:7,label:"Approval & Endorsement",st:S.grey,date:"—",
      steps:[["APPROVAL: consultant uploads the endorsement set; client signs; consultant proceeds","con"],
        ["System reflects colour status update on approval","auto"]]},
    {n:8,label:"Work Commencement / Registration",st:S.grey,date:"—",
      steps:[["Earthwork — consultant submits Borang B (Notis Mula Kerja Tanah) &amp; uploads to system","con"],
        ["PPD-HOD registers the approval &amp; conditions and updates the township dashboard","ppd"],
        ["Sewerage / Water — repeat Setup→Approval for subsequent stages (PDC2, PDC3-5 / Detail)","auto"]]}
  ]
};

/* per-trait authority clearance sets (revised r2) */
const TRAIT_AUTH = {
  "Earthwork":      [{c:"PBT",s:S.green},{c:"JPS (ESCP)",s:S.amber},{c:"JMG (slope)",s:S.grey}],
  "Road & Drainage":[{c:"PBT",s:S.green},{c:"JKR",s:S.amber},{c:"JPS",s:S.grey}],
  "Streetlighting": [{c:"PBT",s:S.grey}],
  "Sewerage":       [{c:"IWK",s:S.amber},{c:"SPAN",s:S.grey}],
  "Water Supply":   [{c:"Air Slgr",s:S.orange},{c:"SPAN",s:S.grey}],
  "Power":          [{c:"TNB",s:S.grey}],
  "Telekom":        [{c:"TM",s:S.grey},{c:"SKMM (MCMC)",s:S.grey}]
};

/* ---- LOCAL INFRA ---- */
const LINFRA = {
  name:"Local Infra", title:"Local Infra Submission Tracking (Agency-level)",
  sub:"Per-agency infrastructure submission · auto-ping every 3 days, manual PPD ping available",
  traits:["Sewerage (IWK)","Water Supply (AIS)","Earthwork","Road & Drainage","Streetlighting","Power (TNB)","Telekom (SKMM)"],
  gauges:[
    {cap:"Sewerage (IWK)",done:6,total:6},
    {cap:"Water Supply (AIS)",done:3,total:6},
    {cap:"Road & Drainage",done:2,total:6},
    {cap:"Earthwork",done:4,total:6}
  ],
  milestones:[
    {n:1,label:"Upload Documents (per checklist)",st:S.green,date:"20 Jun 26",
      steps:[["Consultant &amp; PPD upload relevant documents required per checklist","con"],
        ["System auto-ticks submission checklist as items are uploaded","auto"],
        ["Documents pre-saved in Data Storage per document checklist","auto"]]},
    {n:2,label:"Submit for Checking",st:S.green,date:"27 Jun 26",
      steps:[["Consultant clicks “Submit for Checking”","con"],
        ["System sends notification to PPD to prompt checking","auto"]]},
    {n:3,label:"PPD Check & Comment",st:S.amber,date:"—",
      steps:[["PPD checks; if comment → clicks “Send Comment” with remarks","ppd"],
        ["System allows note &amp; sketch remark","auto"],
        ["If in order → PPD clicks “Recommended for Submission”","ppd"]]},
    {n:4,label:"SM / HOD Green Light",st:S.grey,date:"—",
      steps:[["System notifies SM / HOD / set personnel for green light to proceed","auto"],
        ["If comment → SM/HOD clicks “Send Comment”; repeat from Upload","sm"],
        ["If OK → SM/HOD clicks “Recommended for Submission”; notify consultant &amp; PPD","sm"]]},
    {n:5,label:"Actual Submission",st:S.orange,date:"—",
      steps:[["Consultant submits to agency","con"],
        ["Consultant uploads submission acknowledgement (status grey → orange)","con"],
        ["System tracks &amp; displays submission date","auto"]]},
    {n:6,label:"Follow-up & Status Tracking",st:S.grey,date:"—",
      steps:[["System auto-pings every 3 days: “Hi, it’s been 3 days, kindly update status”","auto"],
        ["PPD may ping consultant manually for update","ppd"],
        ["Consultant follows up with agency on submission status","con"]]},
    {n:7,label:"Comment / Approval Letter",st:S.grey,date:"—",
      steps:[["Consultant uploads comment or approval letter; system records date","con"],
        ["If comment letter → repeat from Upload Documents","auto"],
        ["If approval letter → PPD reviews, highlights special conditions, closes file","ppd"],
        ["System notifies Consultant, PPD, HOD, TH: “Approval for [trait] obtained”","auto"]]}
  ]
};

/* ---- department clearance sample sets ---- */
const DEPTS_KM = [
  {c:"OSC",s:S.green},{c:"JKR",s:S.green},{c:"JPS",s:S.green},{c:"IWK",s:S.amber},
  {c:"Water (AiS)",s:S.amber},{c:"TNB",s:S.green},{c:"Telco/SKMM",s:S.grey},
  {c:"JMG",s:S.red},{c:"Land (PTD)",s:S.grey}
];
const DEPTS_INFRA = [
  {c:"JPS",s:S.green},{c:"IWK",s:S.amber},{c:"Air Slgr",s:S.orange},{c:"TNB",s:S.grey},
  {c:"JKR",s:S.green},{c:"SKMM",s:S.grey},{c:"JMG",s:S.red},{c:"JKT",s:S.grey}
];

const DASHES = {mkm:MKM, minfra:MINFRA, linfra:LINFRA};
let currentDash = "mkm";
let currentTrait = 0;
let selMilestone = 1;
