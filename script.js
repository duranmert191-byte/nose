document.addEventListener("DOMContentLoaded",()=>{
flatpickr("#date",{dateFormat:"Y-m-d",defaultDate:"today"});

const els={
amount:document.getElementById("amount"),
purchase:document.getElementById("purchase"),
current:document.getElementById("current"),
date:document.getElementById("date"),
source:document.getElementById("source"),
notes:document.getElementById("notes"),
currency:document.getElementById("currency"),
table:document.getElementById("tableBody"),
tAmount:document.getElementById("tAmount"),
tPurchase:document.getElementById("tPurchase"),
tCurrent:document.getElementById("tCurrent"),
tPL:document.getElementById("tPL"),
tROI:document.getElementById("tROI"),
cardTotalPurchase:document.getElementById("cardTotalPurchase"),
cardTotalCurrent:document.getElementById("cardTotalCurrent"),
cardTotalPL:document.getElementById("cardTotalPL"),
cardROI:document.getElementById("cardROI")
};

let data=JSON.parse(localStorage.getItem("portfolio"))||[];
let currentCurrency=localStorage.getItem("currency")||"EUR";
els.currency.value=currentCurrency;
if(localStorage.getItem("theme")==="dark") document.body.classList.add("dark");

function formatMoney(v){return new Intl.NumberFormat("en-US",{style:"currency",currency:currentCurrency}).format(v);}
function calculatePL(d){return d.current-d.purchase;}
function calculateROI(d){return ((calculatePL(d)/d.purchase)*100).toFixed(2);}
function save(){localStorage.setItem("portfolio",JSON.stringify(data));localStorage.setItem("currency",currentCurrency);render();}
function updateCards(){const totalPurchase=data.reduce((a,d)=>a+d.purchase,0);const totalCurrent=data.reduce((a,d)=>a+d.current,0);const totalPL=totalCurrent-totalPurchase;const roi=totalPurchase?((totalPL/totalPurchase)*100).toFixed(2):0;els.cardTotalPurchase.textContent=`Total Purchase: ${formatMoney(totalPurchase)}`;els.cardTotalCurrent.textContent=`Total Current: ${formatMoney(totalCurrent)}`;els.cardTotalPL.textContent=`Total P/L: ${formatMoney(totalPL)}`;els.cardROI.textContent=`ROI: ${roi}%`;}

function render(filtered=data){
els.table.innerHTML="";
let totalAmount=0,totalPurchase=0,totalCurrent=0;
filtered.forEach((d,i)=>{
const pl=calculatePL(d),roi=calculateROI(d);
totalAmount += d.amount;
totalPurchase+=d.purchase;totalCurrent+=d.current;
const tr=document.createElement("tr");
tr.innerHTML=`<td><span>${d.date}</span><input hidden value="${d.date}"></td>
<td><span>${d.amount}</span><input hidden type="number" value="${d.amount}"></td>
<td><span>${formatMoney(d.purchase)}</span><input hidden type="number" value="${d.purchase}"></td>
<td><span>${formatMoney(d.current)}</span><input hidden type="number" value="${d.current}"></td>
<td style="color:${pl>=0?'green':'red'}">${formatMoney(pl)}</td>
<td>${roi}%</td>
<td><span>${d.source||"-"}</span><input hidden value="${d.source||""}"></td>
<td><span>${d.notes||"-"}</span><input hidden value="${d.notes||""}"></td>
<td class="actions-cell">
<button class="edit"><i class="fa fa-pen"></i></button>
<button class="save" hidden><i class="fa fa-check"></i></button>
<button class="cancel" hidden><i class="fa fa-xmark"></i></button>
<button class="delete"><i class="fa fa-trash"></i></button>
<button class="duplicate"><i class="fa fa-copy"></i></button>
</td>`;

const spans=tr.querySelectorAll("span");
const inputs=tr.querySelectorAll("input");

tr.querySelector(".edit").onclick=()=>{spans.forEach(s=>s.hidden=true);inputs.forEach(i=>i.hidden=false);tr.querySelector(".edit").hidden=true;tr.querySelector(".save").hidden=false;tr.querySelector(".cancel").hidden=false;};
tr.querySelector(".save").onclick=()=>{data[i]={date:inputs[0].value,amount:+inputs[1].value,purchase:+inputs[2].value,current:+inputs[3].value,source:inputs[4].value,notes:inputs[5].value};save();};
tr.querySelector(".cancel").onclick=render;
tr.querySelector(".delete").onclick=()=>{data.splice(i,1);save();};
tr.querySelector(".duplicate").onclick=()=>{data.splice(i+1,0,{...data[i]});save();};

els.table.appendChild(tr);
});

els.tAmount.textContent=totalAmount;
els.tPurchase.textContent=formatMoney(totalPurchase);
els.tCurrent.textContent=formatMoney(totalCurrent);
els.tPL.textContent=formatMoney(totalCurrent-totalPurchase);
els.tROI.textContent=totalPurchase?((totalCurrent-totalPurchase)/totalPurchase*100).toFixed(2)+"%":"0%";

updateCards();
}

document.getElementById("filterText").addEventListener("input",e=>{const val=e.target.value.toLowerCase();render(data.filter(d=>(d.source||"").toLowerCase().includes(val)||(d.notes||"").toLowerCase().includes(val)));});
document.getElementById("add").onclick=()=>{if(!els.amount.value||!els.purchase.value||!els.current.value||!els.date.value){alert("Fill all required fields!");return;}data.push({date:els.date.value,amount:+els.amount.value,purchase:+els.purchase.value,current:+els.current.value,source:els.source.value,notes:els.notes.value});save();};
document.getElementById("exportCSV").onclick=()=>{let csv="Date,Amount,Purchase,Current,P/L,ROI,Source,Notes\n";data.forEach(d=>{const pl=calculatePL(d),roi=calculateROI(d);csv+=`${d.date},${d.amount},${d.purchase},${d.current},${pl},${roi},${d.source||""},${d.notes||""}\n`;});const blob=new Blob([csv],{type:"text/csv"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="gold-portfolio.csv";a.click();};
document.getElementById("darkModeToggle").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("theme",document.body.classList.contains("dark")?"dark":"light");};
els.currency.onchange=()=>{currentCurrency=els.currency.value;save();};

render();
});