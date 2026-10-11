import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, sendPasswordResetEmail, reload } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, getDocs, limit, query } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";
import {localizedField, localizedTitle} from "./record-locale.js";
// Load optional map and intake modules only after authentication and authorization.
// A failure in either module must never prevent the login screen from appearing.

const $=id=>document.getElementById(id);
const txt={
 pt:{sideTitle:"Inteligência de mercados de fauna silvestre",sideCopy:"Acesso individual, verificação de e-mail e autorização administrativa. Os dados só são consultados após validação da conta.",sideFooter:"Acesso exclusivo a usuários autorizados",back:"← Voltar à demonstração pública",authTitle:"Acessar o NIMF",authSubtitle:"Seu e-mail e sua senha são administrados pelo serviço de autenticação, nunca pelo GitHub Pages.",login:"Entrar",signup:"Solicitar acesso",email:"E-mail",password:"Senha",confirm:"Confirmar senha",forgot:"Esqueceu sua senha?",note:"Criar uma conta não concede acesso aos dados. É necessária aprovação do administrador.",configTitle:"Área restrita em configuração",configBody:"O administrador precisa conectar o Firebase e aplicar as regras de segurança. Nenhuma informação privada está disponível neste momento.",unverifiedTitle:"Confirme seu e-mail",unverifiedText:"Enviamos um link para confirmar o endereço. Depois, volte aqui e verifique novamente.",pendingTitle:"Aguardando aprovação",pendingText:"Seu e-mail foi verificado. O administrador ainda precisa aprovar sua conta antes de você consultar registros.",blockedTitle:"Acesso ainda não autorizado",blockedText:"A conta não possui autorização válida para consultar os dados. Solicite aprovação ao administrador.",refresh:"Verificar novamente",resend:"Reenviar verificação",logout:"Sair",privateTitle:"Painel privado",privateDescription:"Dados carregados somente após autenticação, e-mail confirmado e autorização no Firestore.",recordsLabel:"Registros disponíveis",account:"Conta",approved:"Autorizada",recordsTitle:"Registros privados",recordsSubtitle:"Registros aprovados para consulta, com controle de acesso aplicado no banco.",search:"Pesquisar",colTitle:"Título",colType:"Categoria",colSource:"Fonte",colStatus:"Verificação",empty:"Nenhum registro privado disponível ainda.",footer:"Dados internos. Não redistribua sem autorização.",searchPlaceholder:"Buscar nos registros carregados",privateKicker:"NIMF / PAINEL RESTRITO",mapError:"O serviço cartográfico está parcialmente indisponível. Os filtros e registros continuam acessíveis.",explorerError:"Não foi possível abrir o explorador geográfico. Os registros continuam acessíveis na tabela.",intakeError:"A área de contribuições está temporariamente indisponível. Os demais dados continuam acessíveis.",genericError:"Não foi possível concluir esta ação. Confira seus dados ou tente novamente.",mismatch:"As senhas não coincidem.",weak:"Use uma senha com pelo menos 8 caracteres.",resetSent:"Se o e-mail estiver cadastrado, você receberá orientações para redefinir a senha.",resent:"Se a conta for elegível, um novo e-mail de verificação será enviado.",created:"Conta criada. Confirme seu e-mail e aguarde aprovação.",failedRead:"Falha ao consultar registros. Confira as regras de acesso."},
 en:{sideTitle:"Wildlife market intelligence",sideCopy:"Individual access with verified email and administrator approval before any private data can be accessed.",sideFooter:"Authorized users only",back:"← Back to public preview",authTitle:"Access NIMF",authSubtitle:"Email and passwords are handled by the authentication service, never GitHub Pages.",login:"Sign in",signup:"Request access",email:"Email",password:"Password",confirm:"Confirm password",forgot:"Forgot password?",note:"Creating an account does not grant data access. Administrator approval is required.",configTitle:"Restricted area not configured",configBody:"The administrator must configure Firebase and deploy security rules. No private data is available yet.",unverifiedTitle:"Verify your email",unverifiedText:"An email verification link has been sent. Confirm your address and check again.",pendingTitle:"Awaiting approval",pendingText:"Your email is verified, but an administrator must approve this account.",blockedTitle:"Access not approved",blockedText:"Your account has no valid data access authorization.",refresh:"Check again",resend:"Resend verification",logout:"Sign out",privateTitle:"Private dashboard",privateDescription:"Data loads only after authentication, email verification and Firestore authorization.",recordsLabel:"Available records",account:"Account",approved:"Approved",recordsTitle:"Private records",recordsSubtitle:"Records available only after database access verification.",search:"Search",colTitle:"Title",colType:"Category",colSource:"Source",colStatus:"Verification",empty:"No private records yet.",footer:"Internal data. Do not redistribute without authorization.",searchPlaceholder:"Search loaded records",privateKicker:"NIMF / RESTRICTED DASHBOARD",mapError:"Part of the map service is unavailable. Filters and records remain accessible.",explorerError:"Could not load the geographic explorer. Records remain accessible in the table.",intakeError:"Contributions are temporarily unavailable. Other data remain accessible.",genericError:"Unable to complete this action. Check your details or try again.",mismatch:"Passwords do not match.",weak:"Use at least 8 characters.",resetSent:"If this email is registered, you will receive password reset instructions.",resent:"If eligible, another verification message will be sent.",created:"Account created. Verify your email and await approval.",failedRead:"Could not load records. Check database security rules."},
 es:{sideTitle:"Inteligencia de mercados de fauna silvestre",sideCopy:"Acceso individual, correo verificado y aprobación administrativa antes de consultar datos privados.",sideFooter:"Solo usuarios autorizados",back:"← Volver a la vista pública",authTitle:"Ingresar a NIMF",authSubtitle:"El correo y la contraseña son administrados por el servicio de autenticación, nunca por GitHub Pages.",login:"Ingresar",signup:"Solicitar acceso",email:"Correo",password:"Contraseña",confirm:"Confirmar contraseña",forgot:"¿Olvidó su contraseña?",note:"Crear una cuenta no otorga acceso. Se requiere aprobación del administrador.",configTitle:"Área restringida sin configurar",configBody:"El administrador debe configurar Firebase y publicar las reglas de seguridad. No hay datos privados disponibles todavía.",unverifiedTitle:"Verifique su correo",unverifiedText:"Enviamos un enlace de confirmación. Verifique su dirección e inténtelo de nuevo.",pendingTitle:"Esperando aprobación",pendingText:"Su correo fue verificado, pero el administrador debe aprobar la cuenta.",blockedTitle:"Acceso no autorizado",blockedText:"Esta cuenta no tiene autorización válida para acceder a los datos.",refresh:"Verificar nuevamente",resend:"Reenviar confirmación",logout:"Salir",privateTitle:"Panel privado",privateDescription:"Los datos se cargan solamente tras autenticación, verificación del correo y autorización en Firestore.",recordsLabel:"Registros disponibles",account:"Cuenta",approved:"Autorizada",recordsTitle:"Registros privados",recordsSubtitle:"Registros accesibles únicamente tras verificación en la base.",search:"Buscar",colTitle:"Título",colType:"Categoría",colSource:"Fuente",colStatus:"Verificación",empty:"No hay registros privados todavía.",footer:"Datos internos. No redistribuir sin autorización.",searchPlaceholder:"Buscar en los registros cargados",privateKicker:"NIMF / PANEL RESTRINGIDO",mapError:"Una parte del servicio cartográfico no está disponible. Los filtros y registros siguen accesibles.",explorerError:"No fue posible abrir el explorador geográfico. Los registros siguen accesibles en la tabla.",intakeError:"Las contribuciones no están disponibles temporalmente. Los demás datos siguen accesibles.",genericError:"No se pudo completar la acción. Revise los datos o inténtelo nuevamente.",mismatch:"Las contraseñas no coinciden.",weak:"Utilice por lo menos 8 caracteres.",resetSent:"Si el correo está registrado, recibirá instrucciones para cambiar la contraseña.",resent:"Si es elegible, se enviará otra verificación.",created:"Cuenta creada. Verifique su correo y espere aprobación.",failedRead:"No fue posible consultar los registros. Revise las reglas de seguridad."}
};
let locale="pt",mode="login",auth=null,db=null,activeUser=null,records=[],authEpoch=0,approvalAdmin=false;
let explorerModule=null,intakeModule=null;
const t=k=>txt[locale][k]||k;
function show(id){for(const p of ["config-panel","auth-panel","waiting-panel","dashboard-panel"])$(p).hidden=p!==id;}
function message(id,text){$(id).textContent=text;$(id).hidden=!text;}
function translate(){
 document.documentElement.lang=locale==="pt"?"pt-BR":locale;
 const items={"side-title":"sideTitle","side-copy":"sideCopy","side-footer":"sideFooter","back-public":"back","auth-title":"authTitle","auth-subtitle":"authSubtitle","login-tab":"login","signup-tab":"signup","email-label":"email","password-label":"password","confirm-label":"confirm","forgot-password":"forgot","auth-note":"note","config-title":"configTitle","config-body":"configBody","refresh-access":"refresh","resend-verification":"resend","waiting-logout":"logout","private-title":"privateTitle","private-description":"privateDescription","private-logout":"logout","records-label":"recordsLabel","account-label":"account","account-status":"approved","records-title":"recordsTitle","records-subtitle":"recordsSubtitle","search-label":"search","col-title":"colTitle","col-type":"colType","col-source":"colSource","col-status":"colStatus","privacy-footer":"footer"};
 items["private-kicker"]="privateKicker";
 for(const [id,key] of Object.entries(items))$(id).textContent=t(key);
 $("record-search").placeholder=t("searchPlaceholder");
 if(intakeModule)intakeModule.setIntakeLanguage(locale);
 $("submit-button").textContent=t(mode);$("auth-confirm").autocomplete=mode==="signup"?"new-password":"off";
 $("auth-password").autocomplete=mode==="signup"?"new-password":"current-password";
 if(activeUser && $("waiting-panel").hidden===false)displayWaiting(activeUser,!activeUser.emailVerified,false);
 if(!$("dashboard-panel").hidden){drawRecords();if(explorerModule)explorerModule.setExplorerLanguage(locale);}
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
   const td=document.createElement("td");if(key==="title" && r.scientific_name && String(localizedTitle(r,locale)||"").includes(r.scientific_name)){const parts=String(localizedTitle(r,locale)).split(r.scientific_name);td.append(document.createTextNode(parts.shift()));const sci=document.createElement("i");sci.textContent=r.scientific_name;td.append(sci,document.createTextNode(parts.join(r.scientific_name)));}else td.textContent=docCell(r,key);tr.append(td);
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
   const mod=await import("./explorer.js?v=20261011e");
   if(!valid())return;
   explorerModule=mod;
   mod.initExplorer(records,locale);
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
   const mod=await import("./intake.js?v=20261011e");
   if(!valid())return;
   intakeModule=mod;
   await mod.openIntake(db,user,approvalAdmin,locale);
  }catch(e){
   if(valid())$("tip-feedback").textContent=t("intakeError");
   console.error("NIMF intake initialization error",e);
  }
 })();
}

async function loadPrivateRecords(user,epoch){
 const snap=await getDocs(query(collection(db,"records"),limit(200)));
 if(epoch!==authEpoch||auth.currentUser?.uid!==user.uid)return;
 records=snap.docs.map(d=>({id:d.id,...d.data()}));
 $("record-search").value="";show("dashboard-panel");message("records-error","");drawRecords();enablePrivateWidgets(user,epoch);
}
async function evaluateUser(user,epoch){
 activeUser=user;records=[];if(explorerModule)explorerModule.clearExplorer();if(intakeModule)intakeModule.closeIntake();
 if(!user){show("auth-panel");return;}
 if(!user.emailVerified){displayWaiting(user,true);return;}
 try{
  const approval=await getDoc(doc(db,"access",user.uid));
  if(epoch!==authEpoch||auth.currentUser?.uid!==user.uid)return;
  if(approval.exists() && approval.data().approved===true){
    approvalAdmin=approval.data().admin===true;
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
