import { localizedField, localizedTitle, localizedDescription } from "./record-locale.js";
function appendScientific(parent,value,taxon=""){const text=String(value??"");parent.replaceChildren();const name=String(taxon||"").trim();let at=name?text.indexOf(name):-1;if(at<0){const m=text.match(/(?:\b(?:de|do|da|of)\s+)([A-Z][a-z]{2,}\s+[a-z][a-z-]{2,})/u);if(m){at=m.index+m[0].length-m[1].length;}}if(at<0){parent.textContent=text;return parent;}if(at>0)parent.append(document.createTextNode(text.slice(0,at)));const el=document.createElement("i");el.className="scientific-name";el.textContent=name&&text.includes(name)?name:text.slice(at).match(/^[A-Z][a-z]{2,}\s+[a-z][a-z-]{2,}/u)?.[0]||"";parent.append(el);const end=at+el.textContent.length;if(end<text.length)parent.append(document.createTextNode(text.slice(end)));return parent;}

let dataset=[], canonicalRecords=[],reviewedPoints=[], language="pt", map=null, pins=[], mapReady=false, mapLoaded=false, activeId=null, fallbackLayer=null, fallbackTiles=null, fallbackPins=null, fallbackCenter=[-53,-12], fallbackZoom=4, mapAttempted=false;
const rasterCache=new Map();let rasterFrame=null;
const el=id=>document.getElementById(id);
const trans={
 pt:{k:"EXPLORADOR GEOGRÁFICO",title:"Mercados de fauna: mapa e filtros",desc:"Mapeamento aproximado, não a localização de vendedores. Combine os filtros para explorar anúncios.",reset:"Limpar filtros",search:"Busca livre",species:"Espécie",state:"Estado / região",city:"Município",source:"Fonte",status:"Verificação",product:"Produto",matches:"registros correspondentes",map:"no mapa",unmapped:"sem localização mapeável",results:"Resultados",notice:"Marcadores indicam posições aproximadas, nunca endereços de vendedores.",searchPlaceholder:"Espécie, fonte, cidade, produto...",fallbackLabel:"Texto disponível em outro idioma",resetMap:"Centralizar registros",mapUnavailable:"O mapa está parcialmente indisponível. O restante do painel permanece acessível.",empty:"Nenhum registro corresponde aos filtros.",all:"Todos",more:"Detalhes",close:"Fechar",link:"Fonte original",precision:"Precisão geográfica",price:"Preço anunciado",quantity:"Quantidade",review:"Situação",observation:"Contexto da observação",noDate:"Data não informada",country:"País",unlocated:"Sem coordenadas verificadas para este registro. O mapa permanece na posição atual.",layers:"Camadas",fullscreen:"Tela cheia",exitFullscreen:"Sair da tela cheia",layerNames:{advertisement:"Anúncios",platform:"Plataformas",fair:"Feiras",physical_market:"Vendedores físicos"},layersHeading:"Camadas do mapa",layersHint:"Selecione as categorias exibidas no mapa.",layersLegend:"Categorias de registros",layersSafety:"Localizações aproximadas de registros revisados; não identificam pessoas nem comprovam irregularidades.",layersClose:"Fechar camadas",evidence:"Evidência",corroborated:"Corroborada",sourceDraft:"Registro administrativo revisado"},
 en:{k:"GEOGRAPHIC EXPLORER",title:"Wildlife markets: map and filters",desc:"Approximate mapping, not seller locations. Combine filters to explore listings.",reset:"Clear filters",search:"Free search",species:"Species",state:"State / region",city:"Municipality",source:"Source",status:"Verification",product:"Product",matches:"matching records",map:"on map",unmapped:"without mappable location",results:"Results",notice:"Markers show approximate locations, never seller addresses.",searchPlaceholder:"Species, source, city, product...",fallbackLabel:"Text available in another language",resetMap:"Center on records",mapUnavailable:"Part of the map is unavailable. The rest of the dashboard remains accessible.",empty:"No records match these filters.",all:"All",more:"Details",close:"Close",link:"Original source",precision:"Spatial accuracy",price:"Advertised price",quantity:"Quantity",review:"Status",observation:"Observation context",noDate:"Date not available",country:"Country",unlocated:"No verified coordinates for this record. The map remains at its current location.",layers:"Layers",fullscreen:"Fullscreen",exitFullscreen:"Exit fullscreen",layerNames:{advertisement:"Listings",platform:"Platforms",fair:"Fairs",physical_market:"Physical sellers"},layersHeading:"Map layers",layersHint:"Choose which categories appear on the map.",layersLegend:"Record categories",layersSafety:"Approximate locations of reviewed records; they do not identify people or establish wrongdoing.",layersClose:"Close layers",evidence:"Evidence",corroborated:"Corroborated",sourceDraft:"Reviewed administrative record"},
 es:{k:"EXPLORADOR GEOGRÁFICO",title:"Mercados de fauna: mapa y filtros",desc:"Georreferenciación aproximada, no ubicaciones de vendedores. Combine filtros para explorar anuncios.",reset:"Limpiar filtros",search:"Búsqueda",species:"Especie",state:"Estado / región",city:"Municipio",source:"Fuente",status:"Verificación",product:"Producto",matches:"registros coincidentes",map:"en el mapa",unmapped:"sin ubicación cartografiable",results:"Resultados",notice:"Los marcadores indican posiciones aproximadas, nunca direcciones de vendedores.",searchPlaceholder:"Especie, fuente, ciudad, producto...",fallbackLabel:"Texto disponible en otro idioma",resetMap:"Centrar registros",mapUnavailable:"Una parte del mapa no está disponible. El resto del panel sigue accesible.",empty:"Ningún registro coincide con los filtros.",all:"Todos",more:"Detalles",close:"Cerrar",link:"Fuente original",precision:"Precisión geográfica",price:"Precio anunciado",quantity:"Cantidad",review:"Estado",observation:"Contexto de observación",noDate:"Fecha no disponible",country:"País",unlocated:"Este registro no tiene coordenadas verificadas. El mapa permanece en su posición actual.",layers:"Capas",fullscreen:"Pantalla completa",exitFullscreen:"Salir de pantalla completa",layerNames:{advertisement:"Anuncios",platform:"Plataformas",fair:"Ferias",physical_market:"Vendedores físicos"},layersHeading:"Capas del mapa",layersHint:"Seleccione las categorías visibles en el mapa.",layersLegend:"Categorías de registros",layersSafety:"Ubicaciones aproximadas de registros revisados; no identifican personas ni demuestran irregularidades.",layersClose:"Cerrar capas",evidence:"Evidencia",corroborated:"Corroborada",sourceDraft:"Registro administrativo revisado"}
};
const layerNames=["advertisement","platform","fair","physical_market"];
const activeLayers=()=>new Set([...document.querySelectorAll("#explorer-layers input:checked")].map(e=>e.value));
function rebuildDataset(){
 const canonical=canonicalRecords.map(r=>({...r,layer_type:r.record_kind==="platform"?"platform":"advertisement"}));
 const points=reviewedPoints.filter(r=>r.published===true && layerNames.includes(r.layer_type)).map(r=>({
  ...r,id:"point-"+r.id,source:trans[language].sourceDraft,
  scientific_name:r.scientific_name||"",status:r.evidence_status==="corroborated"?"Verificado":"Em revisão",
  product_type:r.layer_type,
  description_pt:r.notes||"", // Administrative source note is labelled if no translation is present.
  description_en:"",description_es:""
 }));
 dataset=[...canonical,...points];
}
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
  for(const value of values){const caption=(id==="status"||id==="product")?localizedField({[key]:value},key,language):value.replaceAll("_"," ");element.add(new Option(caption,value));}
  element.value=values.includes(old)?old:"";
 }
 refreshSpeciesPicker();
}

function refreshSpeciesPicker(){
 const select=el("explorer-species"),trigger=el("species-trigger"),menu=el("species-menu");
 if(!select||!trigger||!menu)return;
 const active=select.value,selected=select.options[select.selectedIndex];
 trigger.replaceChildren();
 if(active)trigger.append(textNode("i",selected?.textContent||active,"scientific-name"));
 else trigger.append(document.createTextNode(trans[language].all));
 menu.replaceChildren();
 for(const choice of select.options){
  const btn=document.createElement("button");btn.type="button";btn.role="option";
  btn.setAttribute("aria-selected",String(choice.value===active));
  if(choice.value)btn.append(textNode("i",choice.textContent,"scientific-name"));
  else btn.textContent=trans[language].all;
  btn.addEventListener("click",()=>{
    select.value=choice.value;menu.hidden=true;trigger.setAttribute("aria-expanded","false");
    refreshSpeciesPicker();select.dispatchEvent(new Event("change",{bubbles:true}));
    trigger.focus();
  });
  menu.append(btn);
 }
}
function setupSpeciesPicker(){
 const trigger=el("species-trigger"),menu=el("species-menu");
 if(!trigger||!menu||trigger.dataset.wired)return;
 trigger.dataset.wired="1";
 trigger.addEventListener("click",()=>{menu.hidden=!menu.hidden;trigger.setAttribute("aria-expanded",String(!menu.hidden));});
 trigger.addEventListener("keydown",event=>{
  if(event.key==="Escape"){menu.hidden=true;trigger.setAttribute("aria-expanded","false");}
  if(event.key==="ArrowDown"){event.preventDefault();menu.hidden=false;trigger.setAttribute("aria-expanded","true");menu.querySelector("button")?.focus();}
 });
 menu.addEventListener("keydown",event=>{
  if(event.key==="Escape"){menu.hidden=true;trigger.setAttribute("aria-expanded","false");trigger.focus();}
 });
 document.addEventListener("click",event=>{
  if(!event.target.closest(".species-filter")){menu.hidden=true;trigger.setAttribute("aria-expanded","false");}
 });
}
function matchesOtherFilters(r){
 const term=normalize(el("explorer-search").value);
 if(term && !["title","scientific_name","source","source_url","state","municipality","country","product_type","status","description_pt","description_en","description_es"].some(k=>normalize(r[k]).includes(term)))return false;
 return Object.entries(controls).every(([id,key])=>!el("explorer-"+id).value||r[key]===el("explorer-"+id).value);
}
function matches(r){
 return activeLayers().has(r.layer_type||"advertisement")&&matchesOtherFilters(r);
}
function updateLayerCounts(){
 for(const layer of layerNames){
  const count=dataset.filter(r=>(r.layer_type||"advertisement")===layer&&matchesOtherFilters(r)&&coords(r)).length;
  const badge=document.querySelector('[data-layer-count="'+layer+'"]');
  if(badge){badge.textContent=String(count);badge.setAttribute("aria-label",String(count));}
 }
}
function keyAsScientific(label){return label===trans[language].species;}
function addField(wrap,label,value){if(value===null||value===undefined||value==="")return;const d=document.createElement("div");d.append(textNode("span",label),keyAsScientific(label)?appendScientific(document.createElement("strong"),String(value),String(value)):textNode("strong",String(value)));wrap.append(d);}
function closeMapCard(){
 activeId=null;
 const d=el("explorer-map-card");
 if(d){d.hidden=true;d.replaceChildren();}
 const legacy=el("explorer-detail");if(legacy)legacy.hidden=true;
}
function showDetail(r){
 activeId=r.id;
 const d=el("explorer-map-card");d.replaceChildren();
 d.dataset.recordId=r.id;
 const header=document.createElement("div");header.className="explorer-detail-head";
 const head=appendScientific(document.createElement("h3"),r.layer_type && r.layer_type!=="advertisement" ? (r.title||r.source||r.id) : (localizedTitle(r,language)||r.id),r.scientific_name);
 head.id="explorer-map-card-title";
 header.append(head);
 const close=textNode("button","×","explorer-map-card-close");close.type="button";
 close.setAttribute("aria-label",trans[language].close);close.title=trans[language].close;
 close.addEventListener("click",closeMapCard);header.append(close);d.append(header);
 const category=trans[language].layerNames[r.layer_type||"advertisement"];
 if(category)d.append(textNode("div",category,"explorer-map-card-category"));
 const info=document.createElement("div");info.className="explorer-detail-grid";
 for(const [key,label] of [
   ["scientific_name",trans[language].species],
   ["source",trans[language].source],
   ["state",trans[language].state],
   ["municipality",trans[language].city],
   ["country",trans[language].country],
   ["product_type",trans[language].product],
   ["status",trans[language].review],
   ["location_precision",trans[language].precision]
 ])addField(info,label,localizedField(r,key,language));
 if(Number.isFinite(r.advertised_price)){
  try{addField(info,trans[language].price,new Intl.NumberFormat(language==="en"?"en-US":language==="es"?"es-ES":"pt-BR",{style:"currency",currency:r.currency||"BRL"}).format(r.advertised_price));}catch{}
 }
 if(Number.isFinite(r.advertised_quantity))addField(info,trans[language].quantity,r.advertised_quantity);
 d.append(info);
 const context=localizedDescription(r,language);
 if(context.text){
  d.append(textNode("h4",trans[language].observation));
  if(context.sourceLanguage!==language)d.append(textNode("small",trans[language].fallbackLabel+" ("+context.sourceLanguage.toUpperCase()+")"));
  d.append(appendScientific(document.createElement("p"),context.text,r.scientific_name));
 }
 if(!coords(r))d.append(textNode("p",trans[language].unlocated,"explorer-map-no-location"));
 if(typeof r.source_url==="string"&&/^https:\/\/[^/]+/.test(r.source_url)){
  const link=textNode("a",trans[language].link+" ↗");link.href=r.source_url;link.target="_blank";link.rel="noopener noreferrer";d.append(link);
 }
 d.hidden=false;
}
function focusRecord(r){
 showDetail(r);
 const location=coords(r);
 if(!location)return; // A worldwide directory or location-free listing must not move the map.
 const [lat,lng]=location;
 if(mapReady&&mapLoaded&&map){
  map.flyTo({center:[lng,lat],zoom:Math.max(map.getZoom(),7),speed:1.2,essential:true});
 }else if(fallbackLayer){
  fallbackCenter=[lng,lat];
  fallbackZoom=Math.max(fallbackZoom,7);
  renderRasterMarkers(dataset.filter(matches).filter(item=>coords(item)),false);
 }
}

const latLimit=latitude=>Math.max(-85.05112878,Math.min(85.05112878,latitude));
function projection(lon,lat,zoom){
 const scale=256*Math.pow(2,zoom),p=latLimit(lat)*Math.PI/180;
 return [((lon+180)/360)*scale,(1-Math.log(Math.tan(p)+1/Math.cos(p))/Math.PI)*scale/2];
}
function inverseProjection(x,y,zoom){
 const scale=256*Math.pow(2,zoom);
 const yy=Math.max(0,Math.min(scale,y)),n=Math.PI*(1-2*yy/scale);
 return [(x/scale*360-180+540)%360-180,Math.atan(Math.sinh(n))*180/Math.PI];
}
function initializeRasterFallback(){
 if(fallbackLayer)return;
 const host=el("explorer-map");host.replaceChildren();
 const layer=document.createElement("div");layer.className="nimf-raster-layer";
 const tiles=document.createElement("canvas");tiles.className="nimf-raster-tiles";tiles.setAttribute("aria-hidden","true");
 const pinsLayer=document.createElement("div");pinsLayer.className="nimf-raster-pins";
 const controls=document.createElement("div");controls.className="nimf-raster-controls";
 for(const [symbol,change] of [["+",1],["−",-1]]){
  const button=document.createElement("button");button.type="button";button.textContent=symbol;
  button.setAttribute("aria-label",change===1?"Ampliar mapa":"Reduzir mapa");
  button.addEventListener("click",()=>{
   fallbackZoom=Math.max(2,Math.min(11,fallbackZoom+change));
   renderRasterMarkers(dataset.filter(matches).filter(r=>coords(r)),false);
  });
  controls.append(button);
 }
 const reset=document.createElement("button");reset.type="button";reset.textContent="◎";reset.id="nimf-map-reset";
 reset.addEventListener("click",()=>renderRasterMarkers(dataset.filter(matches).filter(r=>coords(r)),true));
 controls.append(reset);
 const credit=textNode("div","© OpenStreetMap contributors","nimf-raster-attribution");
 const at=textNode("div","","nimf-raster-coordinates");
 layer.append(tiles,pinsLayer,controls,credit,at);host.append(layer);
 fallbackLayer=layer;fallbackTiles=tiles;fallbackPins=pinsLayer;
 let gesture=null;
 layer.addEventListener("pointerdown",event=>{
  if(event.target.closest("button"))return;
  gesture={x:event.clientX,y:event.clientY,centre:projection(fallbackCenter[0],fallbackCenter[1],fallbackZoom)};
  layer.setPointerCapture(event.pointerId);
 });
 layer.addEventListener("pointermove",event=>{
  if(!gesture)return;
  const lonlat=inverseProjection(gesture.centre[0]-(event.clientX-gesture.x),gesture.centre[1]-(event.clientY-gesture.y),fallbackZoom);
  fallbackCenter=lonlat;renderRasterMarkers(dataset.filter(matches).filter(r=>coords(r)),false);
 });
 const stop=()=>{gesture=null;};
 layer.addEventListener("pointerup",stop);layer.addEventListener("pointercancel",stop);
 layer.addEventListener("wheel",event=>{
  if(event.ctrlKey)return;event.preventDefault();
  fallbackZoom=Math.max(2,Math.min(11,fallbackZoom+(event.deltaY<0?1:-1)));
  renderRasterMarkers(dataset.filter(matches).filter(r=>coords(r)),false);
 },{passive:false});
 if(typeof ResizeObserver!=="undefined"){
  const observer=new ResizeObserver(()=>{if(fallbackLayer)renderRasterMarkers(dataset.filter(matches).filter(r=>coords(r)),false);});
  observer.observe(host);
 }
}

function drawRasterFrame(){
 if(!fallbackTiles||!rasterFrame)return;
 const {cells,width,height}=rasterFrame,ctx=fallbackTiles.getContext("2d");
 if(!ctx)return;
 const dpr=Math.min(2,window.devicePixelRatio||1);
 fallbackTiles.width=Math.round(width*dpr);fallbackTiles.height=Math.round(height*dpr);
 fallbackTiles.style.width=width+"px";fallbackTiles.style.height=height+"px";
 ctx.setTransform(dpr,0,0,dpr,0,0);
 ctx.clearRect(0,0,width,height);
 ctx.fillStyle="#b9d8de";ctx.fillRect(0,0,width,height);
 let loaded=0;
 for(const cell of cells){
  let entry=rasterCache.get(cell.key);
  if(!entry){
   const image=new Image();image.decoding="async";
   entry={image,ready:false,failed:false};
   rasterCache.set(cell.key,entry);
   // Keep cache bounded for extended browsing sessions.
   if(rasterCache.size>240)rasterCache.delete(rasterCache.keys().next().value);
   image.onload=()=>{entry.ready=true;if(fallbackLayer && fallbackLayer.style.display!=="none")drawRasterFrame();};
   image.onerror=()=>{entry.failed=true;if(fallbackLayer && fallbackLayer.style.display!=="none")drawRasterFrame();};
   image.src="https://tile.openstreetmap.org/"+cell.key+".png";
  }
  if(entry.ready){loaded++;ctx.drawImage(entry.image,Math.round(cell.left),Math.round(cell.top),257,257);}
  else{ctx.fillStyle="#e5e7e0";ctx.fillRect(cell.left,cell.top,256,256);}
 }
 el("explorer-map").dataset.loadedTiles=String(loaded);
}
// Fit the actual filtered geographic extent, not a fixed global zoom.
 // The widest longitude gap is excluded so locations near the antimeridian
 // remain grouped rather than centring the map on the other hemisphere.
function filteredExtent(rows,width,height){
 if(!rows.length)return null;
 if(rows.length===1)return {center:[rows[0].longitude,rows[0].latitude],zoom:7};
 const longitudes=rows.map(r=>(r.longitude+180+360)%360/360).sort((a,b)=>a-b);
 let gap=-1,startIndex=0;
 for(let i=0;i<longitudes.length;i++){
  const next=i===longitudes.length-1?longitudes[0]+1:longitudes[i+1];
  const currentGap=next-longitudes[i];
  if(currentGap>gap){gap=currentGap;startIndex=(i+1)%longitudes.length;}
 }
 const start=longitudes[startIndex],span=1-gap,centreX=(start+span/2)%1;
 const centreLongitude=centreX*360-180;
 const normalizedY=rows.map(r=>projection(0,latLimit(r.latitude),0)[1]/256);
 const top=Math.min(...normalizedY),bottom=Math.max(...normalizedY);
 const centreLatitude=inverseProjection(centreX*256,((top+bottom)/2)*256,0)[1];
 const padding=76;
 let zoom=2;
 for(let z=8;z>=2;z--){
  const scale=256*(2**z);
  if(span*scale<=Math.max(120,width-2*padding)&&
     (bottom-top)*scale<=Math.max(120,height-2*padding)){
   zoom=z;break;
  }
 }
 return {center:[centreLongitude,centreLatitude],zoom};
}
function renderRasterMarkers(rows,fit=false){
 if(!fallbackLayer)return;
 const host=el("explorer-map"),width=Math.max(320,host.clientWidth),height=Math.max(420,host.clientHeight);
 if(fit && rows.length){
  const viewport=filteredExtent(rows,width,height);
  fallbackCenter=viewport.center;fallbackZoom=viewport.zoom;
 }
 const maxTile=2**fallbackZoom,scale=256*maxTile;
 const [cx,cy]=projection(fallbackCenter[0],fallbackCenter[1],fallbackZoom),left=cx-width/2,top=cy-height/2;
 const startX=Math.floor(left/256),endX=Math.ceil((left+width)/256),startY=Math.floor(top/256),endY=Math.ceil((top+height)/256);

 const cells=[];
 for(let y=startY;y<endY;y++){
  if(y<0||y>=maxTile)continue;
  for(let x=startX;x<endX;x++){
   cells.push({key:fallbackZoom+"/"+((x%maxTile+maxTile)%maxTile)+"/"+y,
     left:x*256-left,top:y*256-top});
  }
 }
 rasterFrame={cells,width,height};
 drawRasterFrame();
 fallbackPins.replaceChildren();
 for(const r of rows){
  const [px,py]=projection(r.longitude,r.latitude,fallbackZoom);
  let sx=px-left;const dx=sx-width/2;
  if(dx>scale/2)sx-=scale;
  if(dx<-scale/2)sx+=scale;
  const sy=py-top;
  if(sx < -20 || sx>width+20 || sy< -20 || sy>height+20)continue;
  const pin=document.createElement("button");pin.type="button";pin.className="nimf-raster-pin";
  pin.style.left=sx+"px";pin.style.top=sy+"px";
  pin.title=[r.scientific_name||localizedTitle(r,language),r.municipality||r.state].filter(Boolean).join(" · ");
  pin.setAttribute("aria-label",pin.title);pin.dataset.layer=r.layer_type||"advertisement";
  pin.addEventListener("click",()=>focusRecord(r));fallbackPins.append(pin);
 }
 fallbackLayer.querySelector(".nimf-raster-coordinates").textContent=fallbackCenter[1].toFixed(2)+"°, "+fallbackCenter[0].toFixed(2)+"° · Z"+fallbackZoom;
 host.dataset.centerLongitude=String(fallbackCenter[0]);host.dataset.centerLatitude=String(fallbackCenter[1]);
 host.dataset.zoom=String(fallbackZoom);
 host.dataset.centerTile=fallbackZoom+"/"+Math.floor(cx/256)+"/"+Math.floor(cy/256);
 host.dataset.tileCount=String(cells.length);
 host.dataset.mappedCount=String(rows.length);
}
function setupMap(){
 if(!fallbackLayer)initializeRasterFallback();
 if(mapReady||mapAttempted||!window.maplibregl||!window.maplibregl.supported())return;
 mapAttempted=true;
 const host=el("explorer-map"),glHost=document.createElement("div");
 glHost.className="nimf-gl-map";glHost.style.opacity="0";glHost.setAttribute("aria-hidden","true");
 host.append(glHost);
 let loadTimedOut=false;
 const fail=()=>{
  if(mapLoaded || loadTimedOut)return;
  loadTimedOut=true;
  if(map){try{map.remove();}catch(e){}map=null;}
  glHost.remove();fallbackLayer.style.display="";
 };
 try{
  map=new window.maplibregl.Map({
   container:glHost,
   style:{version:8,sources:{osm:{type:"raster",tiles:["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],tileSize:256,attribution:"© OpenStreetMap contributors"}},layers:[{id:"osm",type:"raster",source:"osm"}]},
   center:[fallbackCenter[0],fallbackCenter[1]],zoom:fallbackZoom,
   attributionControl:true,cooperativeGestures:true
  });
  map.addControl(new window.maplibregl.NavigationControl({showCompass:false}),"top-right");
  map.on("load",()=>{
   if(loadTimedOut)return;mapLoaded=true;mapReady=true;
   glHost.style.opacity="1";glHost.removeAttribute("aria-hidden");
   fallbackLayer.style.display="none";
   drawMarkers(dataset.filter(matches).filter(r=>coords(r)));
   requestAnimationFrame(()=>map.resize());
  });
  map.on("error",()=>{if(!mapLoaded)fail();});
  setTimeout(()=>{if(!mapLoaded)fail();},10000);
 }catch(e){fail();}
}
function drawMarkers(rows,fit=false){
 if(!mapReady||!mapLoaded)return;
 for(const p of pins)p.remove();pins=[];
 const bounds=new window.maplibregl.LngLatBounds();
 for(const r of rows){
  const [lat,lng]=coords(r);
  const dot=document.createElement("button");dot.type="button";dot.className="nimf-map-dot";
  dot.title=[r.scientific_name||localizedTitle(r,language),r.municipality||r.state].filter(Boolean).join(" · ");dot.dataset.layer=r.layer_type||"advertisement";
  dot.style.cssText="border-radius:100%;width:12px;height:12px;cursor:pointer;box-shadow:0 1px 9px #0006";
  dot.addEventListener("click",()=>focusRecord(r));
  pins.push(new window.maplibregl.Marker({element:dot}).setLngLat([lng,lat]).addTo(map));bounds.extend([lng,lat]);
 }
 if(fit && rows.length===1)map.easeTo({center:bounds.getCenter(),zoom:7,duration:350});
 else if(fit && rows.length>1)map.fitBounds(bounds,{padding:75,maxZoom:8,duration:400});
 // With zero mappable records, remove the pins without moving to a fake area.
 requestAnimationFrame(()=>map.resize());
}
function render(fitMap=false){
 const f=dataset.filter(matches),m=f.filter(r=>coords(r)),T=trans[language];
 updateLayerCounts();
 el("explorer-map").dataset.visibleMarkerCount=String(m.length);
 el("explorer-count").textContent=String(f.length);
 el("explorer-map-count").textContent=m.length+" "+T.map;
 el("explorer-unmapped-count").textContent=(f.length-m.length)+" "+T.unmapped;
 const list=el("explorer-cards");list.replaceChildren();
 if(!f.length)list.append(textNode("p",T.empty,"secure-small"));
 for(const r of f){
   const card=document.createElement("button");card.type="button";card.className="explorer-card";
   card.append(appendScientific(document.createElement("strong"),r.layer_type && r.layer_type!=="advertisement" ? r.title : (localizedTitle(r,language)||r.id),r.scientific_name),textNode("span",[r.municipality,r.state].filter(Boolean).join(", ")||r.country||""),textNode("small",[trans[language].layerNames[r.layer_type||"advertisement"],r.source,localizedField(r,"status",language)].filter(Boolean).join(" · ")),textNode("em",T.more+" →"));
   card.addEventListener("click",()=>focusRecord(r));
   list.append(card);
 }
 if(activeId&&!f.some(r=>r.id===activeId)){closeMapCard();}
 if(activeId){const item=f.find(r=>r.id===activeId);if(item)showDetail(item);}
 setupMap();
 if(fallbackLayer)renderRasterMarkers(m,fitMap);
 if(mapReady)drawMarkers(m,fitMap);
}
export function initExplorer(rows,lang="pt"){
 language=trans[lang]?lang:"pt";
 canonicalRecords=(Array.isArray(rows)?rows:[]).filter(safe).map((r,i)=>({...r,id:r.id||r.record_id||String(i)}));rebuildDataset();
 for(const id of Object.keys(controls))el("explorer-"+id).value="";
 el("explorer-search").value="";closeMapCard();
 setupSpeciesPicker();options();setExplorerLanguage(language);render(true);
}
export function setMapPoints(rows){
 reviewedPoints=(Array.isArray(rows)?rows:[]).filter(safe).filter(r=>r.published===true);
 rebuildDataset();options();render(true);
}
export function setExplorerLanguage(lang){
 language=trans[lang]?lang:"pt";const t=trans[language];rebuildDataset();
 el("layers-title").textContent=t.layersHeading;
 el("layers-toggle-label").textContent=t.layers;
 el("layers-hint").textContent=t.layersHint;
 el("layers-legend").textContent=t.layersLegend;
 el("layers-safety").textContent=t.layersSafety;
 el("layers-close").setAttribute("aria-label",t.layersClose);
 el("layers-close").title=t.layersClose;
 for(const el of document.querySelectorAll("[data-layer-title]"))el.textContent=t.layerNames[el.dataset.layerTitle];
 const expanded=el("explorer-map-wrap")?.classList.contains("is-fullscreen")||document.querySelector(".explorer-map-wrap")?.classList.contains("is-fullscreen");
 el("explorer-fullscreen").textContent=expanded?t.exitFullscreen:t.fullscreen;
 el("explorer-search").placeholder=t.searchPlaceholder;
 el("explorer-map").setAttribute("aria-label",t.title);
 el("explorer-reset").setAttribute("aria-label",t.reset);
 const reset=el("nimf-map-reset");if(reset){reset.setAttribute("aria-label",t.resetMap);reset.title=t.resetMap;}
 for(const [id,key] of Object.entries({kicker:"k",title:"title",desc:"desc",reset:"reset","search-label":"search","species-label":"species","state-label":"state","city-label":"city","source-label":"source","status-label":"status","product-label":"product","count-label":"matches","results-title":"results","map-notice":"notice"})){const target=el("explorer-"+id);if(target)target.textContent=t[key];}
 options();render();
}
export function clearExplorer(){
 dataset=[];canonicalRecords=[];reviewedPoints=[];closeMapCard();setLayersPanel(false);if(document.querySelector(".explorer-map-wrap.is-fullscreen"))toggleFullScreen(false);el("explorer-cards").replaceChildren();for(const pin of pins)pin.remove();pins=[];if(fallbackPins)fallbackPins.replaceChildren();
}
function resizeDisplayedMap(){
 const visible=dataset.filter(matches).filter(r=>coords(r));
 if(fallbackLayer)renderRasterMarkers(visible,false);
 if(mapReady)requestAnimationFrame(()=>map.resize());
}
function toggleFullScreen(force){
 const wrap=document.querySelector(".explorer-map-wrap");
 const expanded=force===undefined?!wrap.classList.contains("is-fullscreen"):!!force;
 wrap.classList.toggle("is-fullscreen",expanded);
 document.body.classList.toggle("nimf-map-fullscreen",expanded);
 el("explorer-fullscreen").setAttribute("aria-pressed",String(expanded));
 el("explorer-fullscreen").textContent=expanded?trans[language].exitFullscreen:trans[language].fullscreen;
 requestAnimationFrame(()=>{resizeDisplayedMap();setTimeout(resizeDisplayedMap,120);});
}
el("explorer-fullscreen").addEventListener("click",()=>toggleFullScreen());
function setLayersPanel(open){
 const panel=el("explorer-layers"),toggle=el("layers-toggle");
 panel.classList.toggle("open",open);
 panel.setAttribute("aria-hidden",String(!open));
 panel.inert=!open;
 toggle.setAttribute("aria-expanded",String(open));
 if(open)el("layers-close").focus();
 else if(panel.contains(document.activeElement))toggle.focus();
}
el("layers-toggle").addEventListener("click",()=>setLayersPanel(!el("explorer-layers").classList.contains("open")));
el("layers-close").addEventListener("click",()=>setLayersPanel(false));
document.addEventListener("keydown",ev=>{
 if(ev.key!=="Escape")return;
 if(el("explorer-layers").classList.contains("open")){ev.stopPropagation();setLayersPanel(false);return;}
 if(document.querySelector(".explorer-map-wrap.is-fullscreen"))toggleFullScreen(false);
});
for(const input of document.querySelectorAll("#explorer-layers input"))input.addEventListener("change",()=>{
 // Update pins, visible results and automatic camera together.
 render(true);
});
for(const id of Object.keys(controls))el("explorer-"+id).addEventListener("change",()=>render(true));
el("explorer-search").addEventListener("input",()=>render(true));
el("explorer-reset").addEventListener("click",()=>{el("explorer-search").value="";for(const id of Object.keys(controls))el("explorer-"+id).value="";render(true);});
