
let dataset=[], language="pt", map=null, pins=null, mapReady=false, activeId=null;
const el=id=>document.getElementById(id);
const trans={
 pt:{k:"EXPLORADOR GEOGRÁFICO",title:"Mercados de fauna: mapa e filtros",desc:"Mapeamento aproximado, não a localização de vendedores. Combine os filtros para explorar anúncios.",reset:"Limpar filtros",search:"Busca livre",species:"Espécie",state:"Estado / região",city:"Município",source:"Fonte",status:"Verificação",product:"Produto",matches:"registros correspondentes",map:"no mapa",unmapped:"sem localização mapeável",results:"Resultados",notice:"Marcadores indicam posições aproximadas, nunca endereços de vendedores.",empty:"Nenhum registro corresponde aos filtros.",all:"Todos",more:"Detalhes",close:"Fechar",link:"Fonte original",precision:"Precisão geográfica",price:"Preço anunciado",quantity:"Quantidade",review:"Situação",observation:"Contexto da observação",noDate:"Data não informada"},
 en:{k:"GEOGRAPHIC EXPLORER",title:"Wildlife markets: map and filters",desc:"Approximate mapping, not seller locations. Combine filters to explore listings.",reset:"Clear filters",search:"Free search",species:"Species",state:"State / region",city:"Municipality",source:"Source",status:"Verification",product:"Product",matches:"matching records",map:"on map",unmapped:"without mappable location",results:"Results",notice:"Markers show approximate locations, never seller addresses.",empty:"No records match these filters.",all:"All",more:"Details",close:"Close",link:"Original source",precision:"Spatial accuracy",price:"Advertised price",quantity:"Quantity",review:"Status",observation:"Observation context",noDate:"Date not available"},
 es:{k:"EXPLORADOR GEOGRÁFICO",title:"Mercados de fauna: mapa y filtros",desc:"Georreferenciación aproximada, no ubicaciones de vendedores. Combine filtros para explorar anuncios.",reset:"Limpiar filtros",search:"Búsqueda",species:"Especie",state:"Estado / región",city:"Municipio",source:"Fuente",status:"Verificación",product:"Producto",matches:"registros coincidentes",map:"en el mapa",unmapped:"sin ubicación cartografiable",results:"Resultados",notice:"Los marcadores indican posiciones aproximadas, nunca direcciones de vendedores.",empty:"Ningún registro coincide con los filtros.",all:"Todos",more:"Detalles",close:"Cerrar",link:"Fuente original",precision:"Precisión geográfica",price:"Precio anunciado",quantity:"Cantidad",review:"Estado",observation:"Contexto de observación",noDate:"Fecha no disponible"}
};
const controls={species:"scientific_name",state:"state",city:"municipality",source:"source",status:"status",product:"product_type"};
const normalize=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase().trim();
const safe=r=>r && typeof r==="object"&&!Array.isArray(r);
function textNode(tag,value,cls){const n=document.createElement(tag);n.textContent=value??"";if(cls)n.className=cls;return n;}
function coords(r){return Number.isFinite(r.latitude)&&Number.isFinite(r.longitude)&&r.latitude>=-90&&r.latitude<=90&&r.longitude>=-180&&r.longitude<=180&&["municipality","state","country","regional"].includes(r.location_precision)?[r.latitude,r.longitude]:null;}
function options(filtered=dataset){
 for(const [id,key] of Object.entries(controls)){
  const element=el("explorer-"+id),old=element.value;
  let values=[...new Set(filtered.map(r=>typeof r[key]==="string"?r[key].trim():"").filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  element.replaceChildren(new Option(trans[language].all,""));
  for(const value of values)element.add(new Option(value.replaceAll("_"," "),value));
  element.value=values.includes(old)?old:"";
 }
}
function matches(r){
 const term=normalize(el("explorer-search").value);
 if(term && !["title","scientific_name","source","source_url","state","municipality","country","product_type","status","description_pt","description_en","description_es"].some(k=>normalize(r[k]).includes(term)))return false;
 return Object.entries(controls).every(([id,key])=>!el("explorer-"+id).value||r[key]===el("explorer-"+id).value);
}
function addField(wrap,label,value){if(value===null||value===undefined||value==="")return;const d=document.createElement("div");d.append(textNode("span",label),textNode("strong",String(value)));wrap.append(d);}
function showDetail(r){
 activeId=r.id;const d=el("explorer-detail");d.replaceChildren();
 const header=document.createElement("div");header.className="explorer-detail-head";
 header.append(textNode("h3",r.title||r.scientific_name||r.id));
 const close=textNode("button",trans[language].close);close.type="button";close.className="secure-secondary";close.addEventListener("click",()=>{activeId=null;d.hidden=true;});header.append(close);d.append(header);
 const info=document.createElement("div");info.className="explorer-detail-grid";
 for(const [key,label] of [["scientific_name",trans[language].species],["source",trans[language].source],["state",trans[language].state],["municipality",trans[language].city],["product_type",trans[language].product],["status",trans[language].review],["location_precision",trans[language].precision]])addField(info,label,r[key]);
 if(Number.isFinite(r.advertised_price))addField(info,trans[language].price,new Intl.NumberFormat(language==="en"?"en-US":language==="es"?"es-ES":"pt-BR",{style:"currency",currency:r.currency||"BRL"}).format(r.advertised_price));
 if(Number.isFinite(r.advertised_quantity))addField(info,trans[language].quantity,r.advertised_quantity);
 d.append(info);
 const context=r["description_"+language]||r.description_pt||"";
 if(context){d.append(textNode("h4",trans[language].observation));d.append(textNode("p",context));}
 if(typeof r.source_url==="string"&&/^https:\/\/[^/]+/.test(r.source_url)){const link=textNode("a",trans[language].link+" ↗");link.href=r.source_url;link.target="_blank";link.rel="noopener noreferrer";d.append(link);}
 d.hidden=false;
}
function setupMap(){
 if(mapReady)return;
 if(!window.L){el("explorer-map-notice").textContent=trans[language].notice+" (Mapa indisponível neste momento.)";return;}
 const L=window.L; map=L.map("explorer-map",{worldCopyJump:true,scrollWheelZoom:false,attributionControl:true}).setView([-12,-53],3);
 L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; OpenStreetMap contributors',maxZoom:18}).addTo(map);
 pins=L.layerGroup().addTo(map);mapReady=true;
}
function render(){
 const f=dataset.filter(matches),m=f.filter(r=>coords(r)),T=trans[language];
 el("explorer-count").textContent=String(f.length);
 el("explorer-map-count").textContent=m.length+" "+T.map;
 el("explorer-unmapped-count").textContent=(f.length-m.length)+" "+T.unmapped;
 const list=el("explorer-cards");list.replaceChildren();
 if(!f.length)list.append(textNode("p",T.empty,"secure-small"));
 for(const r of f){
   const card=document.createElement("button");card.type="button";card.className="explorer-card";
   card.append(textNode("strong",r.scientific_name||r.title||r.id),textNode("span",[r.municipality,r.state].filter(Boolean).join(", ")||r.country||""),textNode("small",[r.source,r.status].filter(Boolean).join(" · ")),textNode("em",T.more+" →"));
   card.addEventListener("click",()=>{showDetail(r);if(mapReady&&coords(r))map.flyTo(coords(r),Math.max(map.getZoom(),6),{duration:.45});});
   list.append(card);
 }
 if(activeId&&!f.some(r=>r.id===activeId)){activeId=null;el("explorer-detail").hidden=true;}
 if(activeId){const item=f.find(r=>r.id===activeId);if(item)showDetail(item);}
 if(!mapReady)setupMap();
 if(mapReady){
  pins.clearLayers();let marks=[];
  for(const r of m){const point=coords(r);
   const marker=window.L.circleMarker(point,{radius:8,color:"#245e4c",weight:2,fillColor:"#9ad6a1",fillOpacity:.9});
   marker.bindTooltip([r.scientific_name||r.title,r.municipality||r.state||r.country].filter(Boolean).join(" · "));
   marker.on("click",()=>showDetail(r));pins.addLayer(marker);marks.push(point);
  }
  if(marks.length===1)map.setView(marks[0],6);
  else if(marks.length>1)map.fitBounds(window.L.latLngBounds(marks).pad(.28),{maxZoom:7});
  else map.setView([-12,-53],3);
  requestAnimationFrame(()=>map.invalidateSize());
 }
}
export function initExplorer(rows,lang="pt"){
 language=trans[lang]?lang:"pt";
 dataset=(Array.isArray(rows)?rows:[]).filter(safe).map((r,i)=>({...r,id:r.id||r.record_id||String(i)}));
 for(const id of Object.keys(controls))el("explorer-"+id).value="";
 el("explorer-search").value="";activeId=null;el("explorer-detail").hidden=true;
 options();setExplorerLanguage(language);render();
}
export function setExplorerLanguage(lang){
 language=trans[lang]?lang:"pt";const t=trans[language];
 for(const [id,key] of Object.entries({kicker:"k",title:"title",desc:"desc",reset:"reset","search-label":"search","species-label":"species","state-label":"state","city-label":"city","source-label":"source","status-label":"status","product-label":"product","count-label":"matches","results-title":"results","map-notice":"notice"})){const target=el("explorer-"+id);if(target)target.textContent=t[key];}
 options();render();
}
export function clearExplorer(){
 dataset=[];activeId=null;el("explorer-detail").hidden=true;el("explorer-cards").replaceChildren();if(pins)pins.clearLayers();
}
for(const id of Object.keys(controls))el("explorer-"+id).addEventListener("change",render);
el("explorer-search").addEventListener("input",render);
el("explorer-reset").addEventListener("click",()=>{el("explorer-search").value="";for(const id of Object.keys(controls))el("explorer-"+id).value="";render();});
