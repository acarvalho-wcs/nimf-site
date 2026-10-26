// Restricted, administrator-only, read-only language parity assessment.
// Never writes to Firestore or exports private data automatically.
const LANGUAGES=["pt","en","es"];
const FIELDS=["title","description"];
const translated={pt:{title:"Auditoria PT / EN / ES",summary:"Registros com possíveis problemas de idioma",empty:"Nenhum problema estrutural detectado",missing:"Campo ausente",copied:"Texto possivelmente copiado",legacy:"Texto de origem sem tradução declarada",download:"Exportar CSV (uso interno)",type:"Coleção"},en:{title:"PT / EN / ES audit",summary:"Records with possible language problems",empty:"No structural problems detected",missing:"Missing field",copied:"Possibly copied text",legacy:"Original text without declared translation",download:"Export CSV (internal use)",type:"Collection"},es:{title:"Auditoría PT / EN / ES",summary:"Registros con posibles problemas de idioma",empty:"Ningún problema estructural detectado",missing:"Campo ausente",copied:"Texto posiblemente copiado",legacy:"Texto original sin traducción declarada",download:"Exportar CSV (uso interno)",type:"Colección"}};
let rows=[],locale="pt";
function norm(v){return typeof v==="string"?v.normalize("NFKC").trim().replace(/\s+/g," ").toLowerCase():"";}
function meaningfullyTranslatable(v){return norm(v).length>=28 && norm(v).split(" ").length>=5;}
function recordIssues(r,collection){
 const issues=[];
 const hasLocalized=FIELDS.some(f=>LANGUAGES.some(l=>norm(r[f+"_"+l])));
 for(const field of FIELDS){
  const vals=LANGUAGES.map(l=>norm(r[field+"_"+l]));
  const base=norm(r[field])||norm(field==="description"?r.notes:"");
  if(!hasLocalized && !base)continue;
  for(let i=0;i<3;i++)if(!vals[i])issues.push(field+"_"+LANGUAGES[i]+":missing");
  if(vals.every(Boolean)&&meaningfullyTranslatable(vals[0])){
   if(vals[0]===vals[1])issues.push(field+"_en:copied");
   if(vals[0]===vals[2])issues.push(field+"_es:copied");
  }
 }
 if(!hasLocalized&&(norm(r.title)||norm(r.notes)||norm(r.description)))issues.push("legacy:original");
 return issues.map(issue=>({collection,id:String(r.id||r.record_id||""),issue}));
}
export function inspectLanguageRecords(records,points,lang="pt"){
 locale=translated[lang]?lang:"pt";
 const issues=[...(records||[]).flatMap(r=>recordIssues(r,"records")),...(points||[]).flatMap(r=>recordIssues(r,"map_points"))];
 rows=issues;
 render();
}
function render(){
 const host=document.getElementById("language-audit");
 if(!host)return;
 const t=translated[locale];host.replaceChildren();
 const heading=document.createElement("h3");heading.textContent=t.title;
 const summary=document.createElement("p");summary.textContent=t.summary+": "+rows.length+" ("+new Set(rows.map(r=>r.collection+"/"+r.id)).size+" IDs)";
 host.append(heading,summary);
 const button=document.createElement("button");button.type="button";button.className="secure-secondary";button.textContent=t.download;
 button.disabled=!rows.length;
 button.addEventListener("click",()=>{
  const q=x=>'"'+String(x).replaceAll('"','""')+'"';
  const csv="collection,id,issue\n"+rows.map(r=>[r.collection,r.id,r.issue].map(q).join(",")).join("\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob);const a=document.createElement("a");
  a.href=url;a.download="nimf-language-audit.csv";a.click();URL.revokeObjectURL(url);
 });host.append(button);
 const list=document.createElement("div");list.className="tip-list";
 if(!rows.length){const p=document.createElement("p");p.textContent=t.empty;list.append(p);}
 for(const r of rows.slice(0,100)){
  const p=document.createElement("p");p.className="secure-small";p.textContent=r.collection+" · "+r.id+" · "+r.issue;list.append(p);
 }
 host.append(list);
}
