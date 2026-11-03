(() => {
"use strict";
const STORE="gradebook.website.v1";
const starter=[
 {id:"math",name:"Advanced Functions",mark:62,items:[]},
 {id:"english",name:"English",mark:78,items:[]},
 {id:"religion",name:"Religion",mark:73,items:[]},
 {id:"cs",name:"Computer Science",mark:95,items:[]},
 {id:"outdoor",name:"Outdoor Education",mark:84,items:[]},
 {id:"accounting",name:"Accounting",mark:94,items:[]}
];
let courses=load(),page="overview",selected=null;
const $=s=>document.querySelector(s);
function load(){try{const x=JSON.parse(localStorage.getItem(STORE));return Array.isArray(x)?x:starter}catch{return starter}}
function persist(){localStorage.setItem(STORE,JSON.stringify(courses));$("#sync-label").textContent="Saved on this device"}
function average(c){if(!c.items.length)return Number(c.mark)||0;const w=c.items.reduce((s,a)=>s+a.weight,0);return w?c.items.reduce((s,a)=>s+a.score*a.weight,0)/w:0}
function fmt(n){return `${Number(n).toFixed(1).replace(/\\.0$/,"")}%`}
function safe(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function color(n){return n>=85?"var(--green)":n>=70?"#5594e8":"#e4a348"}
function courseCard(c){const n=average(c);return `<article class="course-card"><div class="course-top"><div><div class="course-name">${safe(c.name)}</div><div class="course-meta">${c.items.length} assessment${c.items.length===1?"":"s"} recorded</div></div><div class="grade" style="color:${color(n)}">${fmt(n)}</div></div><div class="progress"><span style="width:${Math.max(0,Math.min(100,n))}%;background:${color(n)}"></span></div><div class="course-bottom"><span>${c.items.length?"Weighted assessment average":"Starting grade"}</span><button class="text-btn" data-open="${c.id}">Manage course →</button></div></article>`}
function render(){
document.querySelectorAll("[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
const area=$("#page-content");
$("#page-title").textContent=page==="overview"?"Overview":page==="courses"?"My courses":"Goal simulator";
if(page==="overview"){
const avg=courses.length?courses.reduce((s,c)=>s+average(c),0)/courses.length:0;
const high=courses.length?courses.reduce((a,b)=>average(a)>average(b)?a:b):null;
area.innerHTML=`<div class="welcome"><div><h2>Welcome back, Mohamed.</h2><p class="sub muted">Here's your academic snapshot. Keep building momentum.</p></div><button class="btn primary" id="add-course">＋ Add course</button></div><div class="stats"><div class="stat"><div class="stat-label">AVERAGE ACROSS COURSES</div><div class="stat-value">${fmt(avg)}</div><div class="stat-note">Equal weight per course</div></div><div class="stat"><div class="stat-label">COURSES TRACKED</div><div class="stat-value">${courses.length}</div><div class="stat-note">Active gradebooks</div></div><div class="stat"><div class="stat-label">HIGHEST COURSE</div><div class="stat-value" style="font-size:21px">${high?safe(high.name):"—"}</div><div class="stat-note">${high?fmt(average(high)):"Add a course to begin"}</div></div></div><div class="section-head"><h3>Your courses</h3><button class="text-btn" id="see-courses">VIEW ALL →</button></div><div class="course-grid">${courses.length?courses.map(courseCard).join(""):'<div class="empty">No courses yet. Add your first course to get started.</div>'}</div>`;
}else if(page==="courses"){
area.innerHTML=`<div class="welcome"><div><h2>All courses</h2><p class="sub muted">Manage your classes, tests, quizzes and assignments.</p></div><button class="btn primary" id="add-course">＋ Add course</button></div><div class="course-grid">${courses.length?courses.map(courseCard).join(""):'<div class="empty">No courses yet.</div>'}</div>`;
}else{
area.innerHTML=`<div class="page-intro"><h2>Goal simulator</h2><p>Find out what average you need on the remaining coursework.</p></div><div class="calculator-card"><div class="field"><label for="sim-course">COURSE</label><select id="sim-course">${courses.map(c=>`<option value="${c.id}">${safe(c.name)}</option>`).join("")}</select></div><div class="field"><label for="sim-current">CURRENT GRADE (%)</label><input id="sim-current" type="number" min="0" max="100" step=".1" value="${courses.length?average(courses[0]):0}"></div><div class="field"><label for="sim-target">TARGET FINAL GRADE (%)</label><input id="sim-target" type="number" min="0" max="100" value="85"></div><div class="field"><label for="sim-done">COURSEWORK COMPLETED (%)</label><input id="sim-done" type="number" min="0" max="100" value="60"></div><button class="btn primary" id="calculate">Calculate required grade</button><div class="result" id="sim-result">Your result will appear here.</div><p class="notice">Assumes your current grade represents the completed portion of the course. For an exact Ontario course calculation, enter the actual category weights and remaining assessments in your course plan.</p></div>`;
}
}
function modal(title,body,submitText="Save"){
$("#modal-root").innerHTML=`<div class="modal-backdrop"><form class="modal" id="modal-form"><div class="modal-head"><h3>${title}</h3><button type="button" class="close" id="close-modal">×</button></div>${body}<div class="modal-actions"><button type="button" class="btn" id="cancel-modal">Cancel</button><button class="btn primary">${submitText}</button></div></form></div>`;
$("#close-modal").onclick=closeModal;$("#cancel-modal").onclick=closeModal;$("#modal-form").addEventListener("submit",e=>e.preventDefault());
}
function closeModal(){$("#modal-root").innerHTML=""}
function addCourse(){
modal("Add a course",`<div class="field"><label>COURSE NAME</label><input name="name" required maxlength="70" placeholder="e.g. Biology"></div><div class="field"><label>STARTING GRADE (%)</label><input name="mark" type="number" min="0" max="100" step=".1" value="0" required></div>`,"Create course");
$("#modal-form").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);courses.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),name:f.get("name").trim(),mark:Number(f.get("mark")),items:[]});persist();closeModal();render()};
}
function openCourse(id){
const c=courses.find(x=>x.id===id);if(!c)return;
const rows=c.items.map((a,i)=>`<div class="assessment-row"><div class="assessment-info"><strong>${safe(a.name)}</strong><span class="muted">Weight ${a.weight} · ${fmt(a.score)}</span></div><div class="assessment-actions"><button type="button" class="text-btn" data-edit-assessment="${i}">Edit</button><button type="button" class="text-btn danger-text" data-delete-assessment="${i}">Delete</button></div></div>`).join("");
modal(safe(c.name),`<div class="field"><label>STARTING GRADE (%)</label><input name="mark" type="number" min="0" max="100" step=".1" value="${Number(c.mark)||0}" required></div><div class="section-head"><h3>Assessments</h3><button type="button" class="text-btn" id="add-assessment">＋ ADD</button></div><div>${rows||'<p class="muted">No assessments recorded yet.</p>'}</div><p class="notice">You can edit or delete any assessment. Scores are averaged using their relative weights.</p><button type="button" class="btn" id="delete-course" style="color:var(--red);margin-top:12px">Delete course</button>`,"Save changes");
$("#modal-form").onsubmit=e=>{e.preventDefault();c.mark=Number(new FormData(e.target).get("mark"));persist();closeModal();render()};
$("#add-assessment").onclick=()=>addAssessment(id);
document.querySelectorAll("[data-edit-assessment]").forEach(b=>b.onclick=()=>editAssessment(id,Number(b.dataset.editAssessment)));
document.querySelectorAll("[data-delete-assessment]").forEach(b=>b.onclick=()=>{const i=Number(b.dataset.deleteAssessment);if(confirm(`Delete "${c.items[i].name}"?`)){c.items.splice(i,1);persist();openCourse(id)}});
$("#delete-course").onclick=()=>{if(confirm("Delete this course and all its assessments?")){courses=courses.filter(x=>x.id!==id);persist();closeModal();render()}};
}
function assessmentFields(a={name:"",score:"",weight:10}){return `<div class="field"><label>ASSESSMENT NAME</label><input name="name" required maxlength="80" value="${safe(a.name)}" placeholder="Unit 1 test"></div><div class="field"><label>SCORE (%)</label><input name="score" type="number" min="0" max="100" step=".1" value="${a.score}" required></div><div class="field"><label>RELATIVE WEIGHT</label><input name="weight" type="number" min=".01" step=".01" value="${a.weight}" required></div><p class="notice">Relative weights determine how much each assessment contributes compared with other assessments.</p>`}
function addAssessment(id){
const c=courses.find(x=>x.id===id);if(!c)return;
modal("Add assessment",assessmentFields(),"Add assessment");
$("#modal-form").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);c.items.push({name:f.get("name").trim(),score:Number(f.get("score")),weight:Number(f.get("weight"))});persist();openCourse(id);render()};
}
function editAssessment(id,index){
const c=courses.find(x=>x.id===id),a=c?.items[index];if(!a)return;
modal("Edit assessment",assessmentFields(a),"Save assessment");
$("#modal-form").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);a.name=f.get("name").trim();a.score=Number(f.get("score"));a.weight=Number(f.get("weight"));persist();openCourse(id);render()};
}
function calculate(){
const current=Number($("#sim-current").value),target=Number($("#sim-target").value),done=Number($("#sim-done").value),out=$("#sim-result");
if([current,target,done].some(n=>!Number.isFinite(n)||n<0||n>100)){out.textContent="Enter values between 0 and 100.";return}
if(done===100){out.textContent="All coursework is complete. There is no remaining weight to change the grade.";return}
const needed=(target-current*done/100)/(1-done/100);
out.innerHTML=needed>100?`<b>Target is mathematically out of reach.</b><p>You would need ${fmt(needed)} on the remaining work.</p>`:needed<=0?"<b>You've already reached this target.</b>":`<span class="eyebrow">REQUIRED AVERAGE ON REMAINING WORK</span><strong>${fmt(needed)}</strong><span class="muted">Across the remaining ${100-done}% of the course.</span>`;
}
document.addEventListener("click",e=>{
const b=e.target.closest("button");if(!b)return;
if(b.dataset.page){page=b.dataset.page;render()}
if(b.id==="add-course")addCourse();
if(b.id==="see-courses"){page="courses";render()}
if(b.dataset.open)openCourse(b.dataset.open);
if(b.id==="calculate")calculate();
});
document.addEventListener("change",e=>{
if(e.target.id==="sim-course"){const c=courses.find(x=>x.id===e.target.value);if(c)$("#sim-current").value=average(c).toFixed(1)}
});
$("#theme-toggle").onclick=()=>{document.documentElement.classList.toggle("light");$("#theme-toggle").textContent=document.documentElement.classList.contains("light")?"☾":"☀"};
$("#export-data").onclick=()=>{const blob=new Blob([JSON.stringify({version:1,courses},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="gradebook-backup.json";a.click();URL.revokeObjectURL(a.href)};
$("#import-data").onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const parsed=JSON.parse(await file.text());const incoming=parsed.courses;if(!Array.isArray(incoming)||incoming.some(c=>!c.name||!Array.isArray(c.items)))throw Error();if(confirm("Replace your current courses with this backup?")){courses=incoming;persist();render()}}catch{alert("That backup file is not valid.")}e.target.value=""};
render();
})();