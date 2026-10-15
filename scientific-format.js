// Shared scientific-name rendering for secure listing cards, map cards and record tables.
// Creates text nodes (never innerHTML) to prevent markup injection from source records.
const escapeRegex=value=>String(value).replace(/[^A-Za-z0-9]/g,"\\$&");
const trimName=value=>String(value||"").trim().replace(/\s+/g," ");
function candidates(taxon){
 const supplied=Array.isArray(taxon)?taxon:[taxon],names=[];
 for(const value of supplied){
  if(value==null)continue;
  if(typeof value==="object"){
   for(const key of ["scientific_name","scientific_names","scientificName","scientific_species","taxon"]){
    if(value[key])names.push(...candidates(value[key]));
   }
   continue;
  }
  for(const segment of String(value).split(/\s*[;,|]\s*/)){
   const name=trimName(segment);
   if(/^[A-Z][a-z]+\s+(?:[a-z][a-z-]+|sp\.|spp\.)(?:\s+[a-z][a-z-]+)?$/u.test(name))names.push(name);
  }
 }
 return [...new Set(names)];
}
function scientificSpans(text,taxon){
 const value=String(text??""),ranges=[];
 // Historical records may lack verified taxon metadata. Recognize this specific
 // reported binomial and abbreviated genus in multilingual evidence safely.
 const knownFull=/\bCeratophrys\s+ornata\b/giu;
 const add=(start,end)=>{if(!ranges.some(r=>start<r[1]&&end>r[0]))ranges.push([start,end]);};
 for(const match of value.matchAll(knownFull))add(match.index,match.index+match[0].length);
 for(const match of value.matchAll(/\bC\.\s*ornata\b/giu))add(match.index,match.index+match[0].length);
 for(const name of candidates(taxon)){
  const parts=name.split(/\s+/).map(escapeRegex).join("\\s+");
  const exp=new RegExp("(?<![\\p{L}\\p{N}])"+parts+"(?![\\p{L}\\p{N}])","giu");
  for(const match of value.matchAll(exp))add(match.index,match.index+match[0].length);
 }
 // If metadata is missing, infer only a standalone Latin binomial or one
 // introduced by a clear species phrase, avoiding ordinary capitalized titles.
 const inferred=/(?<![\p{L}\p{N}])([A-Z][a-z]{2,}\s+[a-z][a-z-]{2,})(?![\p{L}\p{N}])/gu;
 for(const match of value.matchAll(inferred)){
  const before=value.slice(0,match.index).trim();
  const after=value.slice(match.index+match[0].length).trim();
  const introduced=/(?:\b(?:de|do|da|of|for|species|especie|espécie)\s*|[:(—–-]\s*)$/iu.test(before);
  if(introduced||(!before&&!after))add(match.index,match.index+match[0].length);
 }
 return ranges.sort((a,b)=>a[0]-b[0]);
}
export function appendScientific(parent,value,taxon=""){
 const text=String(value??""),ranges=scientificSpans(text,taxon);
 parent.replaceChildren();
 if(!ranges.length){parent.textContent=text;return parent;}
 let offset=0;
 for(const [start,end] of ranges){
  if(start>offset)parent.append(document.createTextNode(text.slice(offset,start)));
  const original=text.slice(start,end);
  // Taxonomic qualifiers sp. / spp. are roman (not italic), even after an italic genus.
  const qualifier=original.match(/^(.+?)(\s+)(sp\.|spp\.)$/iu);
  const name=document.createElement("i");name.className="scientific-name";
  name.textContent=qualifier?qualifier[1]:original;
  parent.append(name);
  if(qualifier)parent.append(document.createTextNode(qualifier[2]+qualifier[3]));
  offset=end;
 }
 if(offset<text.length)parent.append(document.createTextNode(text.slice(offset)));
 return parent;
}

// Use for scientific taxa in filters and list items without styling HTML directly.
export function appendScientificTerm(parent,taxon){return appendScientific(parent,taxon,taxon);}
