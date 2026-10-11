import {collection,query,where,orderBy,limit,getDocs,onSnapshot,addDoc,doc,updateDoc,serverTimestamp,writeBatch} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
let db=null,user=null,admin=false,started=false,unsubOwn=null,unsubAdmin=null;
const $=id=>document.getElementById(id);
const states=["received","triage","checking","investigating","resolved","closed"];
const names={received:"Recebido",triage:"Em triagem",checking:"Em verificação",investigating:"Investigação iniciada",resolved:"Concluído",closed:"Encerrado"};
const node=(tag,content)=>{const n=document.createElement(tag);n.textContent=content??"";return n;};
function summary(item,canEdit){
 const block=document.createElement("article");block.className="tip-item";
 const top=node("strong",item.title||"Sem título");block.append(top);
 block.append(node("small",[(item.type||""),item.species||"",item.location||""].filter(Boolean).join(" · ")));
 const status=node("span",names[item.status]||item.status);status.className="tip-status";block.append(status);
 if(item.url&&/^https:\/\/[^\s]+$/i.test(item.url)){const a=node("a","Abrir referência ↗");a.href=item.url;a.target="_blank";a.rel="noopener noreferrer";block.append(a);}
 if(item.details)block.append(node("p",item.details));
 if(item.review_note)block.append(node("p","Atualização: "+item.review_note));
 if(canEdit){
  const select=document.createElement("select");
  for(const k of states){const o=new Option(names[k],k);select.add(o);}
  select.value=item.status;
  const note=document.createElement("textarea");note.rows=2;note.maxLength=1500;note.value=item.review_note||"";note.placeholder="Nota de acompanhamento visível ao autor";
  const save=node("button","Registrar andamento");save.type="button";save.className="secure-secondary";
  save.addEventListener("click",async()=>{
   save.disabled=true;
   try{
    const ref=doc(db,"submissions",item.id);
    const batch=writeBatch(db);
    batch.update(ref,{status:select.value,review_note:note.value.trim(),updated_at:serverTimestamp()});
    batch.set(doc(collection(db,"submissions",item.id,"history")),{status:select.value,note:note.value.trim(),created_at:serverTimestamp(),actor_uid:user.uid});
    await batch.commit();
   }catch(e){alert("Não foi possível atualizar. Confira as regras administrativas do Firestore.");}
   finally{save.disabled=false;}
  });
  block.append(select,note,save);
 }
 return block;
}
async function refresh(){
 if(!db||!user)return;
 const own=await getDocs(query(collection(db,"submissions"),where("owner_uid","==",user.uid),limit(100)));
 if(!user)return;
 const target=$("my-tips");target.replaceChildren();
 const my=own.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.created_at?.seconds||0)-(a.created_at?.seconds||0));
 if(!my.length)target.append(node("p","Nenhuma contribuição enviada ainda."));
 for(const item of my)target.append(summary(item,false));
 if(admin){
  const box=$("admin-review");box.hidden=false;
  const all=await getDocs(query(collection(db,"submissions"),limit(150)));
  const adminBox=$("admin-tips");adminBox.replaceChildren();
  const items=all.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.created_at?.seconds||0)-(a.created_at?.seconds||0));
  if(!items.length)adminBox.append(node("p","Nenhum envio para avaliação."));
  for(const item of items)adminBox.append(summary(item,true));
 }else{$("admin-review").hidden=true;$("admin-tips").replaceChildren();}
}
export async function openIntake(database,currentUser,isAdmin){
 db=database;user=currentUser;admin=isAdmin===true;
 if(unsubOwn)unsubOwn();if(unsubAdmin)unsubAdmin();unsubOwn=null;unsubAdmin=null;
 $("admin-review").hidden=!admin;
 const uid=user.uid;
 unsubOwn=onSnapshot(query(collection(db,"submissions"),where("owner_uid","==",uid),limit(100)),snap=>{
   if(!user||user.uid!==uid)return;
   const target=$("my-tips");target.replaceChildren();
   const items=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.created_at?.seconds||0)-(a.created_at?.seconds||0));
   if(!items.length)target.append(node("p","Nenhuma contribuição enviada ainda."));
   for(const item of items)target.append(summary(item,false));
 },()=>{$("tip-feedback").textContent="Não foi possível carregar suas contribuições. Confirme as regras de acesso.";});
 if(admin)unsubAdmin=onSnapshot(query(collection(db,"submissions"),limit(150)),snap=>{
   if(!user||user.uid!==uid)return;
   const target=$("admin-tips");target.replaceChildren();
   const items=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.created_at?.seconds||0)-(a.created_at?.seconds||0));
   if(!items.length)target.append(node("p","Nenhum envio para avaliação."));
   for(const item of items)target.append(summary(item,true));
 },()=>{$("tip-feedback").textContent="Não foi possível carregar a triagem administrativa.";});
 if(started)return;started=true;
 $("tip-form").addEventListener("submit",async ev=>{
  ev.preventDefault();if(!user)return;
  const send=$("tip-submit");send.disabled=true;$("tip-feedback").textContent="";
  try{
   const values={owner_uid:user.uid,type:$("tip-type").value,title:$("tip-title").value.trim(),url:$("tip-url").value.trim(),species:$("tip-species").value.trim(),location:$("tip-location").value.trim(),details:$("tip-details").value.trim(),status:"received",review_note:"",created_at:serverTimestamp(),updated_at:serverTimestamp()};
   if(!/^https:\\/\\/[^\\s]+$/i.test(values.url))throw new Error("invalid url");
   await addDoc(collection(db,"submissions"),values);
   $("tip-form").reset();$("tip-feedback").textContent="Recebido para triagem.";
  }catch(e){$("tip-feedback").textContent="Não foi possível enviar. Verifique o link e as permissões do Firestore.";}
  finally{send.disabled=false;}
 });
}
export function closeIntake(){
 if(unsubOwn)unsubOwn();if(unsubAdmin)unsubAdmin();unsubOwn=null;unsubAdmin=null;
 user=null;db=null;admin=false;$("my-tips").replaceChildren();$("admin-tips").replaceChildren();$("admin-review").hidden=true;$("tip-feedback").textContent="";
}
