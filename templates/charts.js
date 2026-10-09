// Linked figures use the same published model records as the leaderboard.
const modelOptions=DATA.models.slice().sort((a,b)=>b.scores.overall.rall-a.scores.overall.rall);
const requestedModel=new URLSearchParams(location.search).get('model');
let chartModel=DATA.models.some(r=>r.id===requestedModel)?requestedModel:modelOptions[0].id;
const chartRecord=()=>DATA.models.find(r=>r.id===chartModel);
const compactTokens=n=>(n/1000).toFixed(1)+'k';
$('chart-model').innerHTML=modelOptions.map(r=>`<option value="${esc(r.id)}">${esc(r.name)}</option>`).join('');

function chartReadout(r){
 $('chart-readout').innerHTML=`<strong>${esc(r.name)}</strong> · ${compactTokens(r.tokens)} tokens · Recall@All ${fmt(r.scores.overall.rall)}`;
}
function selectChartModel(id){
 if(!DATA.models.some(r=>r.id===id))return;
 chartModel=id;$('chart-model').value=id;
 document.querySelectorAll('[data-chart-model]').forEach(p=>p.setAttribute('aria-pressed',p.dataset.chartModel===id));
 const r=chartRecord();
 $('intent-bars').innerHTML=intentKeys.map(k=>`<li title="${esc(UI.valid_column+': '+r.scores[k].valid+' / 25')}"><div class="intent-label"><span>${esc(UI.columns[k])}</span><span class="intent-value">${fmt(r.scores[k].rall)}</span></div><div class="intent-track" aria-hidden="true"><span class="intent-fill" style="width:${r.scores[k].rall*100}%"></span></div></li>`).join('');
 chartReadout(r);
}
function renderScatter(){
 const svg=$('token-scatter'),w=Math.round(svg.getBoundingClientRect().width);
 if(w<1)return;
 const h=278,L=39,R=w-22,T=28,B=228;
 // Fixed recall scale; the focused token scale has explicit numeric ticks.
 const values=DATA.models.map(r=>r.tokens),low=Math.floor(Math.min(...values)/10000)*10000-10000,high=Math.ceil(Math.max(...values)/10000)*10000;
 const x=n=>L+(n-low)/(high-low)*(R-L),y=n=>B-n*(B-T);
 const compact=w<470;
 svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.dataset.compact=compact;
 const xticks=[];for(let n=low;n<=high;n+=10000)xticks.push(n);
 const grid=[0,.25,.5,.75,1].map(n=>`<line class="grid-line" x1="${L}" y1="${y(n)}" x2="${R}" y2="${y(n)}"/><text x="${L-9}" y="${y(n)+4}" text-anchor="end">${n===0?'0':n===1?'1.0':String(n)}</text>`).join('');
 const ticks=xticks.map(n=>`<text x="${x(n)}" y="${B+19}" text-anchor="middle">${n/1000}k</text>`).join('');
 // Small, stable offsets separate the closely spaced Qwen, Kimi and PaperScout labels.
 const offsets={qwen:[-10,-19,'end'],'4b':[-10,29,'end'],kimi:[9,-30,'start'],glm:[9,31,'start'],gemini:[10,-17,'start'],gpt:[10,-15,'start'],deepseek:[-10,30,'end']};
 const points=DATA.models.map(r=>{
  const px=x(r.tokens),py=y(r.scores.overall.rall),o=offsets[r.id]||[10,-12,'start'];
  const width=r.name.length*6.2,anchor=compact?'middle':o[2];
  let tx=compact?px:px+o[0],ty=compact?py-20:py+o[1];
  if(anchor==='start')tx=Math.min(tx,w-width-4);
  else if(anchor==='end')tx=Math.max(tx,width+4);
  else tx=Math.max(width/2+4,Math.min(w-width/2-4,tx));
  const target=anchor==='end'?tx-3:anchor==='start'?tx+3:tx;
  const label=`${r.name}: ${Math.round(r.tokens).toLocaleString('en-US')} ${UI.chart_tokens_accessible}; Recall@All ${fmt(r.scores.overall.rall)}; ${UI.valid_column} ${r.valid}/100`;
  return `<g class="chart-point" role="button" tabindex="0" data-chart-model="${esc(r.id)}" aria-pressed="${r.id===chartModel}" aria-label="${esc(label)}"><title>${esc(label)}</title><circle class="point-hit" cx="${px}" cy="${py}" r="13"/><g class="point-label"><path class="label-line" d="M${px},${py} L${target},${ty+(ty<py?4:-7)}"/><text x="${tx}" y="${ty}" text-anchor="${anchor}">${esc(r.name)}</text></g><circle class="point-ring" cx="${px}" cy="${py}" r="9"/><circle class="point-mark" cx="${px}" cy="${py}" r="5"/></g>`;
 }).join('');
 svg.innerHTML=`<text class="axis-title" x="${L}" y="14">Recall@All ↑</text>${grid}<path class="axis-line" fill="none" d="M${L},${T}V${B}H${R}"/>${ticks}<text class="axis-title" x="${(L+R)/2}" y="${h-7}" text-anchor="middle">${esc(UI.chart_x_axis)}</text>${points}`;
}
function syncModelCharts(){
 $('model-charts').hidden=state.track!=='model';
 if(state.track==='model'){renderScatter();selectChartModel(chartModel);}
}
$('chart-model').addEventListener('change',e=>selectChartModel(e.target.value));
$('token-scatter').addEventListener('click',e=>{const p=e.target.closest('[data-chart-model]');if(p)selectChartModel(p.dataset.chartModel);});
$('token-scatter').addEventListener('keydown',e=>{const p=e.target.closest('[data-chart-model]');if(p&&(e.key==='Enter'||e.key===' ')){e.preventDefault();selectChartModel(p.dataset.chartModel);}});
$('token-scatter').addEventListener('pointerover',e=>{const p=e.target.closest('[data-chart-model]');if(p)chartReadout(DATA.models.find(r=>r.id===p.dataset.chartModel));});
$('token-scatter').addEventListener('pointerleave',()=>chartReadout(chartRecord()));
$('token-scatter').addEventListener('focusin',e=>{const p=e.target.closest('[data-chart-model]');if(p)chartReadout(DATA.models.find(r=>r.id===p.dataset.chartModel));});
$('token-scatter').addEventListener('focusout',()=>chartReadout(chartRecord()));
if('ResizeObserver' in window)new ResizeObserver(()=>{if(state.track==='model')renderScatter();}).observe($('token-scatter'));
else window.addEventListener('resize',renderScatter);
