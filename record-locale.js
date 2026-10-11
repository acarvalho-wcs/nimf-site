// Localized presentation of canonical Firestore record fields.
// Never alters source evidence, taxon names, identifiers, or Firestore documents.
export const langs=["pt","en","es"];
export const useLang=l=>langs.includes(l)?l:"pt";
const dictionaries={
 pt:{
  status:{"Em revisão":"Em revisão","Verificado":"Verificado",pending_review:"Pendente de revisão",verified:"Verificado"},
  category:{"Anúncio comercial":"Anúncio comercial","Anuncio comercial":"Anúncio comercial",listing:"Anúncio comercial"},
  precision:{municipality:"Município (aproximado)",state:"Estado (aproximado)",country:"País (aproximado)",regional:"Região (aproximada)"},
  product:{colonia_abelhas_sem_ferrao:"Colônia de abelhas sem ferrão",colony:"Colônia",stingless_bee_colony:"Colônia de abelhas sem ferrão"},
  titlePrefix:"Colônia anunciada de ",generic:"Anúncio de fauna",fallback:"Não informado"
 },
 en:{
  status:{"Em revisão":"Under review","Verificado":"Verified",pending_review:"Pending review",verified:"Verified"},
  category:{"Anúncio comercial":"Commercial listing","Anuncio comercial":"Commercial listing",listing:"Commercial listing"},
  precision:{municipality:"Municipality (approximate)",state:"State (approximate)",country:"Country (approximate)",regional:"Region (approximate)"},
  product:{colonia_abelhas_sem_ferrao:"Stingless bee colony",colony:"Colony",stingless_bee_colony:"Stingless bee colony"},
  titlePrefix:"Advertised colony of ",generic:"Wildlife listing",fallback:"Not specified"
 },
 es:{
  status:{"Em revisão":"En revisión","Verificado":"Verificado",pending_review:"Pendiente de revisión",verified:"Verificado"},
  category:{"Anúncio comercial":"Anuncio comercial","Anuncio comercial":"Anuncio comercial",listing:"Anuncio comercial"},
  precision:{municipality:"Municipio (aproximado)",state:"Estado (aproximado)",country:"País (aproximado)",regional:"Región (aproximada)"},
  product:{colonia_abelhas_sem_ferrao:"Colonia de abejas sin aguijón",colony:"Colonia",stingless_bee_colony:"Colonia de abejas sin aguijón"},
  titlePrefix:"Colonia anunciada de ",generic:"Anuncio de fauna",fallback:"No informado"
 }
};
export function localizedField(record,key,lang="pt"){
 const d=dictionaries[useLang(lang)];
 if(key==="title")return localizedTitle(record,lang);
 const raw=record?.[key];
 if(raw==null||raw==="")return d.fallback;
 if(key==="category")return d.category[raw]??String(raw).replaceAll("_"," ");
 if(key==="status"||key==="verification_status")return d.status[raw]??String(raw).replaceAll("_"," ");
 if(key==="product_type")return d.product[raw]??String(raw).replaceAll("_"," ");
 if(key==="location_precision")return d.precision[raw]??String(raw).replaceAll("_"," ");
 return String(raw);
}
export function localizedTitle(record,lang="pt"){
 const sci=record?.scientific_name;
 if(sci && typeof sci==="string"){
  // The canonical title is specifically generated for advertised colonies;
  // retain unknown titles instead of inferring product types.
  if(/^Col[oô]nia anunciada de /i.test(record.title??"")||/^(advertised colony|colonia anunciada)/i.test(record.title??""))return dictionaries[useLang(lang)].titlePrefix+sci;
 }
 return record?.title||sci||dictionaries[useLang(lang)].generic;
}
export function localizedDescription(record,lang="pt"){
 const value=record?.["description_"+useLang(lang)];
 if(typeof value==="string"&&value.trim())return {text:value,sourceLanguage:useLang(lang)};
 // Do not silently present Portuguese source narratives as English translations.
 const alternatives=["pt","en","es"].filter(l=>l!==useLang(lang));
 for(const l of alternatives){
  const text=record?.["description_"+l];
  if(typeof text==="string"&&text.trim())return {text,sourceLanguage:l};
 }
 return {text:"",sourceLanguage:null};
}
