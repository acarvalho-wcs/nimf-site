import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, sendPasswordResetEmail, reload } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, getDocs, limit, query } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";
import {localizedField, localizedTitle} from "./record-locale.js";
function appendScientific(parent,value,taxon=""){const text=String(value??"");parent.replaceChildren();const name=String(taxon||"").trim();let at=name?text.indexOf(name):-1;if(at<0){const m=text.match(/(?:\b(?:de|do|da|of)\s+)([A-Z][a-z]{2,}\s+[a-z][a-z-]{2,})/u);if(m){at=m.index+m[0].length-m[1].length;}}if(at<0){parent.textContent=text;return parent;}if(at>0)parent.append(document.createTextNode(text.slice(0,at)));const el=document.createElement("i");el.className="scientific-name";el.textContent=name&&text.includes(name)?name:text.slice(at).match(/^[A-Z][a-z]{2,}\s+[a-z][a-z-]{2,}/u)?.[0]||"";parent.append(el);const end=at+el.textContent.length;if(end<text.length)parent.append(document.createTextNode(text.slice(end)));return parent;}
// Load optional map and intake modules only after authentication and authorization.
// A failure in either module must never prevent the login screen from appearing.

const $=id=>document.getElementById(id);
const txt={
 pt:{sideTitle:"Inteligência de mercados de fauna silvestre",sideCopy:"Acesso individual, verificação de e-mail e autorização administrativa. Os dados só são consultados após validação da conta.",sideFooter:"Acesso exclusivo a usuários autorizados",back:"Retorne ao Observatório Global de Tráfico de Animais",authTitle:"Acessar o NIMF",authSubtitle:"Seu e-mail e sua senha são administrados pelo serviço de autenticação, nunca pelo GitHub Pages.",login:"Entrar",signup:"Solicitar acesso",email:"E-mail",password:"Senha",confirm:"Confirmar senha",forgot:"Esqueceu sua senha?",note:"Criar uma conta não concede acesso aos dados. É necessária aprovação do administrador.",configTitle:"Área restrita em configuração",configBody:"O administrador precisa conectar o Firebase e aplicar as regras de segurança. Nenhuma informação privada está disponível neste momento.",unverifiedTitle:"Confirme seu e-mail",unverifiedText:"Enviamos um link para confirmar o endereço. Depois, volte aqui e verifique novamente.",pendingTitle:"Aguardando aprovação",pendingText:"Seu e-mail foi verificado. O administrador ainda precisa aprovar sua conta antes de você consultar registros.",blockedTitle:"Acesso ainda não autorizado",blockedText:"A conta não possui autorização válida para consultar os dados. Solicite aprovação ao administrador.",refresh:"Verificar novamente",resend:"Reenviar verificação",logout:"Sair",privateTitle:"Painel privado",privateDescription:"Dados carregados somente após autenticação, e-mail confirmado e autorização no Firestore.",recordsLabel:"Registros disponíveis",account:"Conta",approved:"Autorizada",roleAdmin:"Administrador de triagem",roleContributor:"Usuário colaborador",recordsTitle:"Registros privados",recordsSubtitle:"Registros aprovados para consulta, com controle de acesso aplicado no banco.",search:"Pesquisar",colTitle:"Título",colType:"Categoria",colSource:"Fonte",colStatus:"Verificação",empty:"Nenhum registro privado disponível ainda.",footer:"Dados internos. Não redistribua sem autorização.",searchPlaceholder:"Buscar nos registros carregados",privateKicker:"PAINEL RESTRITO - APENAS USUÁRIOS AUTORIZADOS",mapError:"O serviço cartográfico está parcialmente indisponível. Os filtros e registros continuam acessíveis.",explorerError:"Não foi possível abrir o explorador geográfico. Os registros continuam acessíveis na tabela.",intakeError:"A área de contribuições está temporariamente indisponível. Os demais dados continuam acessíveis.",genericError:"Não foi possível concluir esta ação. Confira seus dados ou tente novamente.",mismatch:"As senhas não coincidem.",weak:"Use uma senha com pelo menos 8 caracteres.",resetSent:"Se o e-mail estiver cadastrado, você receberá orientações para redefinir a senha.",resent:"Se a conta for elegível, um novo e-mail de verificação será enviado.",created:"Conta criada. Confirme seu e-mail e aguarde aprovação.",failedRead:"Falha ao consultar registros. Confira as regras de acesso."},
 en:{sideTitle:"Wildlife market intelligence",sideCopy:"Individual access with verified email and administrator approval before any private data can be accessed.",sideFooter:"Authorized users only",back:"Return to the Illegal Wildlife Trafficking Global Observatory",authTitle:"Access NIMF",authSubtitle:"Email and passwords are handled by the authentication service, never GitHub Pages.",login:"Sign in",signup:"Request access",email:"Email",password:"Password",confirm:"Confirm password",forgot:"Forgot password?",note:"Creating an account does not grant data access. Administrator approval is required.",configTitle:"Restricted area not configured",configBody:"The administrator must configure Firebase and deploy security rules. No private data is available yet.",unverifiedTitle:"Verify your email",unverifiedText:"An email verification link has been sent. Confirm your address and check again.",pendingTitle:"Awaiting approval",pendingText:"Your email is verified, but an administrator must approve this account.",blockedTitle:"Access not approved",blockedText:"Your account has no valid data access authorization.",refresh:"Check again",resend:"Resend verification",logout:"Sign out",privateTitle:"Private dashboard",privateDescription:"Data loads only after authentication, email verification and Firestore authorization.",recordsLabel:"Available records",account:"Account",approved:"Approved",roleAdmin:"Review administrator",roleContributor:"Contributor",recordsTitle:"Private records",recordsSubtitle:"Records available only after database access verification.",search:"Search",colTitle:"Title",colType:"Category",colSource:"Source",colStatus:"Verification",empty:"No private records yet.",footer:"Internal data. Do not redistribute without authorization.",searchPlaceholder:"Search loaded records",privateKicker:"RESTRICTED DASHBOARD - AUTHORIZED USERS ONLY",mapError:"Part of the map service is unavailable. Filters and records remain accessible.",explorerError:"Could not load the geographic explorer. Records remain accessible in the table.",intakeError:"Contributions are temporarily unavailable. Other data remain accessible.",genericError:"Unable to complete this action. Check your details or try again.",mismatch:"Passwords do not match.",weak:"Use at least 8 characters.",resetSent:"If this email is registered, you will receive password reset instructions.",resent:"If eligible, another verification message will be sent.",created:"Account created. Verify your email and await approval.",failedRead:"Could not load records. Check database security rules."},
 es:{sideTitle:"Inteligencia de mercados de fauna silvestre",sideCopy:"Acceso individual, correo verificado y aprobación administrativa antes de consultar datos privados.",sideFooter:"Solo usuarios autorizados",back:"Regrese al Observatorio Global de Tráfico de Animales",authTitle:"Ingresar a NIMF",authSubtitle:"El correo y la contraseña son administrados por el servicio de autenticación, nunca por GitHub Pages.",login:"Ingresar",signup:"Solicitar acceso",email:"Correo",password:"Contraseña",confirm:"Confirmar contraseña",forgot:"¿Olvidó su contraseña?",note:"Crear una cuenta no otorga acceso. Se requiere aprobación del administrador.",configTitle:"Área restringida sin configurar",configBody:"El administrador debe configurar Firebase y publicar las reglas de seguridad. No hay datos privados disponibles todavía.",unverifiedTitle:"Verifique su correo",unverifiedText:"Enviamos un enlace de confirmación. Verifique su dirección e inténtelo de nuevo.",pendingTitle:"Esperando aprobación",pendingText:"Su correo fue verificado, pero el administrador debe aprobar la cuenta.",blockedTitle:"Acceso no autorizado",blockedText:"Esta cuenta no tiene autorización válida para acceder a los datos.",refresh:"Verificar nuevamente",resend:"Reenviar confirmación",logout:"Salir",privateTitle:"Panel privado",privateDescription:"Los datos se cargan solamente tras autenticación, verificación del correo y autorización en Firestore.",recordsLabel:"Registros disponibles",account:"Cuenta",approved:"Autorizada",roleAdmin:"Administrador de revisión",roleContributor:"Usuario colaborador",recordsTitle:"Registros privados",recordsSubtitle:"Registros accesibles únicamente tras verificación en la base.",search:"Buscar",colTitle:"Título",colType:"Categoría",colSource:"Fuente",colStatus:"Verificación",empty:"No hay registros privados todavía.",footer:"Datos internos. No redistribuir sin autorización.",searchPlaceholder:"Buscar en los registros cargados",privateKicker:"PANEL RESTRINGIDO - SOLO USUARIOS AUTORIZADOS",mapError:"Una parte del servicio cartográfico no está disponible. Los filtros y registros siguen accesibles.",explorerError:"No fue posible abrir el explorador geográfico. Los registros siguen accesibles en la tabla.",intakeError:"Las contribuciones no están disponibles temporalmente. Los demás datos siguen accesibles.",genericError:"No se pudo completar la acción. Revise los datos o inténtelo nuevamente.",mismatch:"Las contraseñas no coinciden.",weak:"Utilice por lo menos 8 caracteres.",resetSent:"Si el correo está registrado, recibirá instrucciones para cambiar la contraseña.",resent:"Si es elegible, se enviará otra verificación.",created:"Cuenta creada. Verifique su correo y espere aprobación.",failedRead:"No fue posible consultar los registros. Revise las reglas de seguridad."}
};
let locale="pt",mode="login",auth=null,db=null,activeUser=null,records=[],authEpoch=0,approvalAdmin=false,reportGrants=[];
let explorerModule=null,intakeModule=null,mapModule=null,pointsBuffer=[];
let workspaceView="dashboard";
function switchWorkspace(view){
 if($("dashboard-panel").hidden || !auth?.currentUser || !auth.currentUser.emailVerified || !activeUser || auth.currentUser.uid!==activeUser.uid)return;
 workspaceView=view==="reports"?"reports":"dashboard";
 $("dashboard-primary").hidden=workspaceView!=="dashboard";
 $("intelligence-reports-view").hidden=workspaceView!=="reports";
 $("reports-nav").classList.toggle("active",workspaceView==="reports");
 $("dashboard-nav").classList.toggle("active",workspaceView==="dashboard");
 $("dashboard-nav").setAttribute("aria-current",workspaceView==="dashboard"?"page":"false");
 $("reports-nav").setAttribute("aria-current",workspaceView==="reports"?"page":"false");
 if(workspaceView==="reports")$("intelligence-reports-view").focus({preventScroll:true});
}
$("reports-nav").addEventListener("click",()=>switchWorkspace("reports"));
$("dashboard-nav").addEventListener("click",()=>switchWorkspace("dashboard"));

for(const [language,translations] of Object.entries({"pt":{"sideTitle":"Sobre esta seção de investigação","sideCopy":"A Investigação de Mercados de Fauna integra o Observatório Global de Tráfico de Animais. O acesso às ferramentas, análises e informações desta seção é restrito a usuários autorizados pela administração do projeto.","sideFooter":"Criado e gerenciado pelo Programa de Inteligência para Conservação da WCS Brasil.","brand":"Investigação de Mercados de Fauna","sideKicker":"SEÇÃO RESTRITA","reportsNav":"Relatórios de inteligência","contact":"Entre em contato com os desenvolvedores","program":"Programa de Inteligência para Conservação","reportsKicker":"BIBLIOTECA RESTRITA","reportsTitle":"Relatórios de inteligência","reportsDesc":"Página interna para organização de relatórios, pastas e arquivos de inteligência, disponíveis somente a usuários autorizados.","reportsEmptyTitle":"Biblioteca em preparação","reportsEmptyDesc":"Pastas e documentos serão adicionados em uma próxima etapa. Nenhum arquivo está disponível no momento.","authTitle":"Acessar Investigação de Mercados de Fauna","authKicker":"INVESTIGAÇÃO DE MERCADOS DE FAUNA / ACESSO","intakeKicker":"INVESTIGAÇÃO DE MERCADOS DE FAUNA / CONTRIBUIÇÕES","mapKicker":"INVESTIGAÇÃO DE MERCADOS DE FAUNA / MAPA REVISADO"},"en":{"sideTitle":"About this investigation section","sideCopy":"Wildlife Market Investigations is part of the Illegal Wildlife Trafficking Global Observatory. Access to the tools, analyses and information in this section is restricted to users authorized by the project's administration.","sideFooter":"Created and managed by the WCS Brazil Conservation Intelligence Program.","brand":"Wildlife Market Investigations","sideKicker":"RESTRICTED SECTION","reportsNav":"Intelligence reports","contact":"Contact the developers","program":"Conservation Intelligence Program","reportsKicker":"RESTRICTED LIBRARY","reportsTitle":"Intelligence reports","reportsDesc":"Internal page for organizing intelligence reports, folders and files, available only to authorized users.","reportsEmptyTitle":"Library in preparation","reportsEmptyDesc":"Folders and documents will be added at a later stage. No files are currently available.","authTitle":"Access Wildlife Market Investigations","authKicker":"WILDLIFE MARKET INVESTIGATIONS / ACCESS","intakeKicker":"WILDLIFE MARKET INVESTIGATIONS / CONTRIBUTIONS","mapKicker":"WILDLIFE MARKET INVESTIGATIONS / REVIEWED MAP"},"es":{"sideTitle":"Sobre esta sección de investigación","sideCopy":"Investigación de Mercados de Fauna forma parte del Observatorio Global de Tráfico de Animales. El acceso a las herramientas, los análisis y la información de esta sección está restringido a usuarios autorizados por la administración del proyecto.","sideFooter":"Creado y gestionado por el Programa de Inteligencia para la Conservación de WCS Brasil.","brand":"Investigación de Mercados de Fauna","sideKicker":"SECCIÓN RESTRINGIDA","reportsNav":"Informes de inteligencia","contact":"Contacte a los desarrolladores","program":"Programa de Inteligencia para la Conservación","reportsKicker":"BIBLIOTECA RESTRINGIDA","reportsTitle":"Informes de inteligencia","reportsDesc":"Página interna para organizar informes, carpetas y archivos de inteligencia, disponibles únicamente para usuarios autorizados.","reportsEmptyTitle":"Biblioteca en preparación","reportsEmptyDesc":"Las carpetas y los documentos se agregarán en una próxima etapa. Actualmente no hay archivos disponibles.","authTitle":"Acceder a Investigación de Mercados de Fauna","authKicker":"INVESTIGACIÓN DE MERCADOS DE FAUNA / ACCESO","intakeKicker":"INVESTIGACIÓN DE MERCADOS DE FAUNA / CONTRIBUCIONES","mapKicker":"INVESTIGACIÓN DE MERCADOS DE FAUNA / MAPA REVISADO"}}))Object.assign(txt[language],translations);
txt.pt.dashboardNav="Painel";txt.en.dashboardNav="Dashboard";txt.es.dashboardNav="Panel";
const reportStrings={
 pt:{methodTitle:"Como são construídos",methodBody:"Relatórios de inteligência organizam evidências de fontes abertas, documentos e registros verificados, confrontando informações, registrando incertezas e distinguindo observação de comprovação de comércio ou ilícito. Informações sensíveis são tratadas sob controles adicionais de acesso.",none:"Nenhum relatório foi disponibilizado para sua conta.",open:"Consultar relatório"},
 en:{methodTitle:"How reports are prepared",methodBody:"Intelligence reports organize evidence from open sources, documents and verified records, cross-check facts, record uncertainty and distinguish observation from proven trade or wrongdoing. Sensitive information is handled under additional access controls.",none:"No intelligence reports are available to your account.",open:"View report"},
 es:{methodTitle:"Cómo se elaboran",methodBody:"Los informes de inteligencia organizan evidencias de fuentes abiertas, documentos y registros verificados, contrastan información, registran incertidumbres y distinguen observaciones de comercio o infracciones comprobadas. La información sensible está sujeta a controles adicionales.",none:"No hay informes disponibles para su cuenta.",open:"Consultar informe"}
};
const t=k=>txt[locale][k]||k;
function show(id){for(const p of ["config-panel","auth-panel","waiting-panel","dashboard-panel"])$(p).hidden=p!==id;const allowed=id==="dashboard-panel";$("reports-nav").disabled=!allowed;$("reports-nav").hidden=!allowed;$("dashboard-nav").disabled=!allowed;$("dashboard-nav").hidden=!allowed;$("side-navigation").hidden=!allowed;if(!allowed){workspaceView="dashboard";$("reports-nav").classList.remove("active");$("dashboard-primary").hidden=false;$("intelligence-reports-view").hidden=true;}}
function message(id,text){$(id).textContent=text;$(id).hidden=!text;}
function translate(){
 document.documentElement.lang=locale==="pt"?"pt-BR":locale;
  document.title="IWT Global Observatory | "+(locale==="pt"?"Área restrita":locale==="en"?"Restricted area":"Área restringida");
 const items={"side-title":"sideTitle","side-copy":"sideCopy","side-footer":"sideFooter","back-public":"back","auth-title":"authTitle","auth-subtitle":"authSubtitle","login-tab":"login","signup-tab":"signup","email-label":"email","password-label":"password","confirm-label":"confirm","forgot-password":"forgot","auth-note":"note","config-title":"configTitle","config-body":"configBody","refresh-access":"refresh","resend-verification":"resend","waiting-logout":"logout","private-title":"privateTitle","private-description":"privateDescription","private-logout":"logout","records-label":"recordsLabel","account-label":"account","account-status":"approved","records-title":"recordsTitle","records-subtitle":"recordsSubtitle","search-label":"search","col-title":"colTitle","col-type":"colType","col-source":"colSource","col-status":"colStatus","privacy-footer":"footer"};
 items["private-kicker"]="privateKicker";
 Object.assign(items,{"side-brand-name":"brand","side-kicker":"sideKicker","dashboard-nav-label":"dashboardNav","reports-nav-label":"reportsNav","contact-label":"contact","program-name":"program","reports-page-kicker":"reportsKicker","reports-page-title":"reportsTitle","reports-page-description":"reportsDesc","reports-empty-description":"reportsEmptyDesc","auth-kicker":"authKicker","intake-kicker":"intakeKicker","admin-map-kicker":"mapKicker"});
 for(const [id,key] of Object.entries(items))$(id).textContent=t(key);
 $("record-search").placeholder=t("searchPlaceholder");
 $("account-role").textContent=approvalAdmin?t("roleAdmin"):t("roleContributor");
 if(intakeModule)intakeModule.setIntakeLanguage(locale);
  if(mapModule)mapModule.setMapPointLanguage(locale);
 $("submit-button").textContent=t(mode);$("auth-confirm").autocomplete=mode==="signup"?"new-password":"off";
 $("auth-password").autocomplete=mode==="signup"?"new-password":"current-password";
 if(activeUser && $("waiting-panel").hidden===false)displayWaiting(activeUser,!activeUser.emailVerified,false);
 if(!$("dashboard-panel").hidden){drawRecords();if(explorerModule)explorerModule.setExplorerLanguage(locale);}
}
function renderGrantedReports(){
 const box=$("reports-folders");box.replaceChildren();
 for(const item of reportGrants){
  const article=document.createElement("article");article.className="reports-folder-card";
  const h=document.createElement("h3");h.textContent=item["title_"+locale]||item.title||item.id;article.append(h);
  const p=document.createElement("p");p.textContent=item["description_"+locale]||item.description||"";article.append(p);
  // No direct static file URLs: report bytes must be served via an access-checked backend.
  box.append(article);
 }
 $("reports-empty-description").hidden=reportGrants.length>0;
}
async function loadReportGrants(user,epoch){
 reportGrants=[];renderGrantedReports();
 try{
  const grants=await getDocs(query(collection(db,"report_grants",user.uid,"items"),limit(100)));
  if(epoch!==authEpoch||auth?.currentUser?.uid!==user.uid)return;
  for(const g of grants.docs){
   if(g.data().allowed!==true)continue;
   try{
    const metadata=await getDoc(doc(db,"intelligence_reports",g.id));
    if(epoch!==authEpoch||auth?.currentUser?.uid!==user.uid)return;
    if(metadata.exists())reportGrants.push({id:g.id,...metadata.data()});
   }catch(error){console.warn("Restricted report metadata unavailable",error?.code||error);}
  }
 }catch(error){console.warn("Restricted report entitlements unavailable",error?.code||error);}
 if(epoch!==authEpoch||auth?.currentUser?.uid!==user.uid)return;
 renderGrantedReports();
}
function switchMode(next){
 mode=next;$("login-tab").classList.toggle("active",next==="login");$("signup-tab").classList.toggle("active",next==="signup");
 $("login-tab").setAttribute("aria-selected",String(next==="login"));$("signup-tab").setAttribute("aria-selected",String(next==="signup"));
 $("password-confirm-wrap").hidden=next!=="signup";$("auth-confirm").required=next==="signup";
 message("auth-error","");$("auth-password").value="";$("auth-confirm").value="";translate();
}
function displayWaiting(user,unverified,denied=false){
 show("waiting-panel");$("waiting-title").textContent=t(unverified?"unverifiedTitle":denied?"blockedTitle":"pendingTitle");
 $("waiting-text").textContent=t(unverified?"unverifiedText":denied?"blockedText":"pendingText");
 $("waiting-address").textContent=user?.email||"";
 $("resend-verification").hidden=!unverified;message("waiting-error","");
}
function docCell(row,field){
 if(["title","category","status"].includes(field))return localizedField(row,field,locale);
 const val=row[field];return typeof val==="string" ? val : "";
}
function drawRecords(){
 const search=$("record-search").value.trim().toLocaleLowerCase(locale);
 const matched=records.filter(r=>Object.values(r).some(v=>typeof v==="string"&&v.toLocaleLowerCase(locale).includes(search)));
 $("records-count").textContent=String(records.length);
 $("records-empty").hidden=matched.length>0;
 const body=$("record-rows");body.replaceChildren();
 for(const r of matched){
  const tr=document.createElement("tr");
  for(const key of ["title","category","source","status"]){
   const td=document.createElement("td");if(key==="title")appendScientific(td,localizedTitle(r,locale),r.scientific_name);else td.textContent=docCell(r,key);tr.append(td);
  }body.append(tr);
 }
}

function loadMapEngine(){
 if(window.maplibregl)return Promise.resolve();
 if(window.__nimfMapEnginePromise)return window.__nimfMapEnginePromise;
 const link=document.createElement("link");link.rel="stylesheet";
 link.href="https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.css";
 document.head.append(link);
 const sources=[
  "https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.js",
  "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"
 ];
 window.__nimfMapEnginePromise=new Promise((resolve,reject)=>{
  const next=i=>{
   if(i>=sources.length){reject(new Error("MapLibre unavailable"));return;}
   const tag=document.createElement("script");tag.src=sources[i];tag.async=true;
   tag.onload=()=>window.maplibregl?resolve():next(i+1);
   tag.onerror=()=>next(i+1);
   document.head.append(tag);
  };
  next(0);
 });
 return window.__nimfMapEnginePromise;
}
function enablePrivateWidgets(user,epoch){
 const valid=()=>epoch===authEpoch&&auth?.currentUser?.uid===user.uid&&!$("dashboard-panel").hidden;
 void (async()=>{
  try{
   const mod=await import("./explorer.js?v=20261011physical11");
   if(!valid())return;
   explorerModule=mod;
   mod.initExplorer(records,locale);mod.setMapPoints(pointsBuffer);
   try{
    await loadMapEngine();
    if(valid())mod.setExplorerLanguage(locale);
   }catch(e){
    if(valid())$("explorer-map-notice").textContent=t("mapError");
    console.warn("NIMF map initialization unavailable",e?.message||e);
   }
  }catch(e){
   if(valid())$("explorer-map-notice").textContent=t("explorerError");
   console.error("NIMF explorer initialization error",e);
  }
 })();
 void (async()=>{
  try{
   const mod=await import("./map-points.js?v=20261011k");
   if(!valid())return;
   mapModule=mod;
   mod.startMapPoints(db,user,approvalAdmin,items=>{
    if(!valid())return;
    pointsBuffer=items;
    if(explorerModule)explorerModule.setMapPoints(items);
   },locale);
  }catch(e){console.warn("Map point review module unavailable",e?.code||e);}
 })();
 void (async()=>{
  try{
   const mod=await import("./intake.js?v=20261011k");
   if(!valid())return;
   intakeModule=mod;
   await mod.openIntake(db,user,approvalAdmin,locale,tip=>mapModule?.promoteTip(tip));
  }catch(e){
   if(valid())$("tip-feedback").textContent=t("intakeError");
   console.error("NIMF intake initialization error",e);
  }
 })();
}

async function loadPrivateRecords(user,epoch){
 const snap=await getDocs(query(collection(db,"records"),limit(200)));
 if(epoch!==authEpoch||auth.currentUser?.uid!==user.uid)return;
 records=snap.docs.filter(d=>d.id!=="abelhas-org-30683").map(d=>({id:d.id,...d.data()}));
 $("account-email").textContent=user.email||"";
 $("account-role").textContent=approvalAdmin?t("roleAdmin"):t("roleContributor");
 $("record-search").value="";show("dashboard-panel");switchWorkspace("dashboard");message("records-error","");drawRecords();enablePrivateWidgets(user,epoch);void loadReportGrants(user,epoch);
}
async function evaluateUser(user,epoch){
 activeUser=user;records=[];reportGrants=[];if(explorerModule)explorerModule.clearExplorer();if(intakeModule)intakeModule.closeIntake();if(mapModule)mapModule.closeMapPoints();pointsBuffer=[];
 if(!user){show("auth-panel");return;}
 if(!user.emailVerified){displayWaiting(user,true);return;}
 try{
  const approval=await getDoc(doc(db,"access",user.uid));
  if(epoch!==authEpoch||auth.currentUser?.uid!==user.uid)return;
  if(approval.exists() && approval.data().approved===true){
    approvalAdmin=approval.data().admin===true && user.email?.trim().toLowerCase()==="acarvalho@wcs.org";
   try{await loadPrivateRecords(user,epoch);}
   catch(e){if(epoch===authEpoch){displayWaiting(user,false,true);message("waiting-error",t("failedRead"));}}
  }else{displayWaiting(user,false,!approval.exists());}
 }catch(e){if(epoch===authEpoch){displayWaiting(user,false,true);message("waiting-error",t("genericError"));}}
}
function readyConfig(){
 return ["apiKey","authDomain","projectId","appId"].every(k=>typeof firebaseConfig[k]==="string"&&firebaseConfig[k].trim()!=="");
}
function busy(value){$("submit-button").disabled=value;}
$("secure-language").addEventListener("change",e=>{locale=e.target.value;translate();});
$("secure-theme").addEventListener("click",()=>{document.body.dataset.theme=document.body.dataset.theme==="dark"?"light":"dark";});
$("login-tab").addEventListener("click",()=>switchMode("login"));
$("signup-tab").addEventListener("click",()=>switchMode("signup"));
$("record-search").addEventListener("input",drawRecords);
$("auth-form").addEventListener("submit",async e=>{
 e.preventDefault();if(!auth)return;
 const email=$("auth-email").value.trim(),password=$("auth-password").value;
 message("auth-error","");
 if(password.length<8){message("auth-error",t("weak"));return;}
 if(mode==="signup" && password!==$("auth-confirm").value){message("auth-error",t("mismatch"));return;}
 busy(true);
 try{
  if(mode==="signup"){
   const credential=await createUserWithEmailAndPassword(auth,email,password);
   await sendEmailVerification(credential.user);
   $("auth-password").value="";$("auth-confirm").value="";
   displayWaiting(credential.user,true);
  }else{await signInWithEmailAndPassword(auth,email,password);}
 }catch(e){message("auth-error",t("genericError"));}
 finally{busy(false);}
});
$("forgot-password").addEventListener("click",async()=>{
 if(!auth)return;const email=$("auth-email").value.trim();
 if(!email){message("auth-error",t("email"));return;}
 try{await sendPasswordResetEmail(auth,email);}catch(e){}
 message("auth-error",t("resetSent"));
});
$("refresh-access").addEventListener("click",async()=>{
 if(!auth?.currentUser)return;
 $("refresh-access").disabled=true;
 try{
  await reload(auth.currentUser);await auth.currentUser.getIdToken(true);
  const epoch=++authEpoch;await evaluateUser(auth.currentUser,epoch);
 }catch(e){message("waiting-error",t("genericError"));}
 finally{$("refresh-access").disabled=false;}
});
$("resend-verification").addEventListener("click",async()=>{
 if(!auth?.currentUser)return;
 try{await sendEmailVerification(auth.currentUser);message("waiting-error",t("resent"));}
 catch(e){message("waiting-error",t("genericError"));}
});
for(const id of ["waiting-logout","private-logout"]){
 $(id).addEventListener("click",async()=>{if(auth)await signOut(auth);});
}
translate();
if(!readyConfig()){show("config-panel");window.__nimfAppStarted=true;}
else{
 try{
  const app=initializeApp(firebaseConfig);
  auth=getAuth(app);db=getFirestore(app);
  show("auth-panel");window.__nimfAppStarted=true;
  onAuthStateChanged(auth,user=>{
   const epoch=++authEpoch;void evaluateUser(user,epoch);
  },()=>show("auth-panel"));
 }catch(e){show("config-panel");window.__nimfAppStarted=true;}
}
