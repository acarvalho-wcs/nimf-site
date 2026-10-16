import {appendScientific,appendScientificTerm} from "./scientific-format.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, sendPasswordResetEmail, reload } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, getDocs, limit, query, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getStorage, ref as storageRef, getBlob, uploadBytes } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js?v=internal-storage-20261016";
import {localizedField, localizedTitle} from "./record-locale.js?v=login-recovery-20261015-2";
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
let reportStorage=null;
function switchWorkspace(view){
 if($("dashboard-panel").hidden || !auth?.currentUser || !auth.currentUser.emailVerified || !activeUser || auth.currentUser.uid!==activeUser.uid)return;
 workspaceView=["reports","internal"].includes(view)?view:"dashboard";
 $("dashboard-primary").hidden=workspaceView!=="dashboard";
 $("intelligence-reports-view").hidden=workspaceView!=="reports";
 $("internal-reports-view").hidden=workspaceView!=="internal";
 $("reports-nav").classList.toggle("active",workspaceView==="reports");
 $("internal-reports-nav").classList.toggle("active",workspaceView==="internal");
 $("dashboard-nav").classList.toggle("active",workspaceView==="dashboard");
 $("dashboard-nav").setAttribute("aria-current",workspaceView==="dashboard"?"page":"false");
 $("reports-nav").setAttribute("aria-current",workspaceView==="reports"?"page":"false");
 $("internal-reports-nav").setAttribute("aria-current",workspaceView==="internal"?"page":"false");
 if(workspaceView==="reports")$("intelligence-reports-view").focus({preventScroll:true});
 if(workspaceView==="internal")$("internal-reports-view").focus({preventScroll:true});
}
$("reports-nav").addEventListener("click",()=>switchWorkspace("reports"));
$("internal-reports-nav").addEventListener("click",()=>switchWorkspace("internal"));
$("dashboard-nav").addEventListener("click",()=>switchWorkspace("dashboard"));

for(const [language,translations] of Object.entries({"pt":{"sideTitle":"Sobre esta seção de investigação","sideCopy":"A Investigação de Mercados de Fauna integra o Observatório Global de Tráfico de Animais. O acesso às ferramentas, análises e informações desta seção é restrito a usuários autorizados pela administração do projeto.","sideFooter":"Criado e gerenciado pelo Programa de Inteligência para Conservação da WCS Brasil.","brand":"Investigação de Mercados de Fauna","sideKicker":"SEÇÃO RESTRITA","reportsNav":"Relatórios de inteligência","contact":"Entre em contato com os desenvolvedores","program":"Programa de Inteligência para Conservação","reportsKicker":"BIBLIOTECA RESTRITA","reportsTitle":"Relatórios de inteligência","reportsDesc":"Página interna para organização de relatórios, pastas e arquivos de inteligência, disponíveis somente a usuários autorizados.","reportsEmptyTitle":"Biblioteca em preparação","reportsEmptyDesc":"Pastas e documentos serão adicionados em uma próxima etapa. Nenhum arquivo está disponível no momento.","authTitle":"Acessar Investigação de Mercados de Fauna","authKicker":"INVESTIGAÇÃO DE MERCADOS DE FAUNA / ACESSO","intakeKicker":"INVESTIGAÇÃO DE MERCADOS DE FAUNA / CONTRIBUIÇÕES","mapKicker":"INVESTIGAÇÃO DE MERCADOS DE FAUNA / MAPA REVISADO"},"en":{"sideTitle":"About this investigation section","sideCopy":"Wildlife Market Investigations is part of the Illegal Wildlife Trafficking Global Observatory. Access to the tools, analyses and information in this section is restricted to users authorized by the project's administration.","sideFooter":"Created and managed by the WCS Brazil Conservation Intelligence Program.","brand":"Wildlife Market Investigations","sideKicker":"RESTRICTED SECTION","reportsNav":"Intelligence reports","contact":"Contact the developers","program":"Conservation Intelligence Program","reportsKicker":"RESTRICTED LIBRARY","reportsTitle":"Intelligence reports","reportsDesc":"Internal page for organizing intelligence reports, folders and files, available only to authorized users.","reportsEmptyTitle":"Library in preparation","reportsEmptyDesc":"Folders and documents will be added at a later stage. No files are currently available.","authTitle":"Access Wildlife Market Investigations","authKicker":"WILDLIFE MARKET INVESTIGATIONS / ACCESS","intakeKicker":"WILDLIFE MARKET INVESTIGATIONS / CONTRIBUTIONS","mapKicker":"WILDLIFE MARKET INVESTIGATIONS / REVIEWED MAP"},"es":{"sideTitle":"Sobre esta sección de investigación","sideCopy":"Investigación de Mercados de Fauna forma parte del Observatorio Global de Tráfico de Animales. El acceso a las herramientas, los análisis y la información de esta sección está restringido a usuarios autorizados por la administración del proyecto.","sideFooter":"Creado y gestionado por el Programa de Inteligencia para la Conservación de WCS Brasil.","brand":"Investigación de Mercados de Fauna","sideKicker":"SECCIÓN RESTRINGIDA","reportsNav":"Informes de inteligencia","contact":"Contacte a los desarrolladores","program":"Programa de Inteligencia para la Conservación","reportsKicker":"BIBLIOTECA RESTRINGIDA","reportsTitle":"Informes de inteligencia","reportsDesc":"Página interna para organizar informes, carpetas y archivos de inteligencia, disponibles únicamente para usuarios autorizados.","reportsEmptyTitle":"Biblioteca en preparación","reportsEmptyDesc":"Las carpetas y los documentos se agregarán en una próxima etapa. Actualmente no hay archivos disponibles.","authTitle":"Acceder a Investigación de Mercados de Fauna","authKicker":"INVESTIGACIÓN DE MERCADOS DE FAUNA / ACCESO","intakeKicker":"INVESTIGACIÓN DE MERCADOS DE FAUNA / CONTRIBUCIONES","mapKicker":"INVESTIGACIÓN DE MERCADOS DE FAUNA / MAPA REVISADO"}}))Object.assign(txt[language],translations);
Object.assign(txt.pt,{waitingKicker:"CONTROLE DE ACESSO",authEmailPlaceholder:"usuario@instituicao.org",institutionPlaceholder:"Ex.: Universidade, órgão público ou ONG",justificationPlaceholder:"Explique a finalidade profissional do acesso e como pretende utilizar a plataforma.",retryTitle:"Complete sua solicitação para avaliação administrativa."});
Object.assign(txt.en,{waitingKicker:"ACCESS CONTROL",authEmailPlaceholder:"user@institution.org",institutionPlaceholder:"e.g. University, government agency or NGO",justificationPlaceholder:"Explain the professional purpose of your request and how you intend to use the platform.",retryTitle:"Complete your request for administrative review."});
Object.assign(txt.es,{waitingKicker:"CONTROL DE ACCESO",authEmailPlaceholder:"usuario@institucion.org",institutionPlaceholder:"Ej.: Universidad, organismo público u ONG",justificationPlaceholder:"Explique la finalidad profesional del acceso y cómo pretende utilizar la plataforma.",retryTitle:"Complete su solicitud para evaluación administrativa."});
txt.pt.dashboardNav="Painel";txt.en.dashboardNav="Dashboard";txt.es.dashboardNav="Panel";
const reportStrings={
 pt:{methodTitle:"Como são construídos",methodBody:"Relatórios de inteligência organizam evidências de fontes abertas, documentos e registros verificados, confrontando informações, registrando incertezas e distinguindo observação de comprovação de comércio ou ilícito. Informações sensíveis são tratadas sob controles adicionais de acesso.",none:"Nenhum relatório foi disponibilizado para sua conta.",open:"Consultar relatório"},
 en:{methodTitle:"How reports are prepared",methodBody:"Intelligence reports organize evidence from open sources, documents and verified records, cross-check facts, record uncertainty and distinguish observation from proven trade or wrongdoing. Sensitive information is handled under additional access controls.",none:"No intelligence reports are available to your account.",open:"View report"},
 es:{methodTitle:"Cómo se elaboran",methodBody:"Los informes de inteligencia organizan evidencias de fuentes abiertas, documentos y registros verificados, contrastan información, registran incertidumbres y distinguen observaciones de comercio o infracciones comprobadas. La información sensible está sujeta a controles adicionales.",none:"No hay informes disponibles para su cuenta.",open:"Consultar informe"}
};
const internalStrings={
 pt:{nav:"Relatórios Internos",kicker:"BIBLIOTECA INTERNA",title:"Relatórios Internos",description:"Relatórios de evolução do Observatório e outros produtos destinados à distribuição interna para membros da WCS e parceiros autorizados.",methodTitle:"Finalidade e acesso",methodBody:"Esta seção reúne relatórios de evolução do Observatório, documentação técnica, balanços de atividades e outros produtos institucionais de circulação interna. O acesso exige autenticação e autorização. A redistribuição requer permissão expressa.",empty:"Nenhum documento interno foi disponibilizado para sua conta."},
 en:{nav:"Internal Reports",kicker:"INTERNAL LIBRARY",title:"Internal Reports",description:"Observatory progress reports and other products intended for internal distribution to WCS staff and authorized partners.",methodTitle:"Purpose and access",methodBody:"This section brings together Observatory progress reports, technical documentation, activity reviews and other institutional products for internal circulation. Access requires authentication and authorization. Redistribution requires explicit permission.",empty:"No internal documents have been made available to your account."},
 es:{nav:"Informes Internos",kicker:"BIBLIOTECA INTERNA",title:"Informes Internos",description:"Informes de evolución del Observatorio y otros productos destinados a la distribución interna entre miembros de WCS y socios autorizados.",methodTitle:"Finalidad y acceso",methodBody:"Esta sección reúne informes de evolución del Observatorio, documentación técnica, balances de actividades y otros productos institucionales de circulación interna. El acceso requiere autenticación y autorización. La redistribución requiere permiso expreso.",empty:"No se han puesto documentos internos a disposición de su cuenta."}
};
const accessStrings={
pt:{institution:"Instituição / organização",justification:"Justificativa para solicitar acesso",privacy:"As informações serão utilizadas exclusivamente para avaliar sua solicitação.",retry:"Complete sua solicitação para avaliação administrativa.",send:"Enviar solicitação",adminTitle:"Solicitações de novos usuários",adminDescription:"Avalie instituição e justificativa. A autorização de relatórios é separada.",approve:"Aprovar acesso",emailVerified:"E-mail verificado",confirm:"Confirma a autorização de acesso ao painel para este usuário? Isso não libera relatórios de inteligência.",pending:"Aguardando aprovação",submitted:"Solicitação registrada. Aguarde avaliação administrativa.",error:"Não foi possível registrar sua solicitação. Tente novamente.",approved:"Acesso aprovado.",review:"Abrir solicitação"},
en:{institution:"Institution / organization",justification:"Reason for requesting access",privacy:"This information is used only to assess your access request.",retry:"Complete your request for administrative review.",send:"Submit request",adminTitle:"New user access requests",adminDescription:"Review institution and rationale. Intelligence report authorization is separate.",approve:"Approve access",emailVerified:"Email verified",confirm:"Approve this user's dashboard access? This does not grant intelligence report access.",pending:"Awaiting approval",submitted:"Your request was recorded. Await administrative review.",error:"Unable to submit your request. Please try again.",approved:"Access approved.",review:"Open request"},
es:{institution:"Institución / organización",justification:"Motivo de la solicitud de acceso",privacy:"Esta información se utiliza únicamente para evaluar su solicitud.",retry:"Complete su solicitud para la evaluación administrativa.",send:"Enviar solicitud",adminTitle:"Solicitudes de nuevos usuarios",adminDescription:"Revise institución y justificación. El acceso a informes requiere autorización independiente.",approve:"Aprobar acceso",emailVerified:"Correo verificado",confirm:"¿Aprueba el acceso de este usuario al panel? Esto no autoriza informes de inteligencia.",pending:"Pendiente de aprobación",submitted:"Solicitud registrada. Espere la evaluación administrativa.",error:"No fue posible registrar la solicitud. Inténtelo nuevamente.",approved:"Acceso aprobado.",review:"Abrir solicitud"}
};
const t=k=>txt[locale][k]||k;
function show(id){for(const p of ["config-panel","auth-panel","waiting-panel","dashboard-panel"])$(p).hidden=p!==id;const allowed=id==="dashboard-panel";$("reports-nav").disabled=!allowed;$("internal-reports-nav").disabled=!allowed;$("dashboard-nav").disabled=!allowed;document.body.dataset.privateReady=allowed?"true":"false";if(!allowed){workspaceView="dashboard";$("reports-nav").classList.remove("active");$("internal-reports-nav").classList.remove("active");$("dashboard-primary").hidden=false;$("intelligence-reports-view").hidden=true;$("internal-reports-view").hidden=true;}}
function message(id,text){$(id).textContent=text;$(id).hidden=!text;}
function translate(){
 document.documentElement.lang=locale==="pt"?"pt-BR":locale;
 refreshInterfaceThemeLabel();
  document.title="IWT Global Observatory | "+(locale==="pt"?"Área restrita":locale==="en"?"Restricted area":"Área restringida");
 const items={"waiting-kicker":"waitingKicker","side-title":"sideTitle","side-copy":"sideCopy","side-footer":"sideFooter","back-public":"back","auth-title":"authTitle","auth-subtitle":"authSubtitle","login-tab":"login","signup-tab":"signup","email-label":"email","password-label":"password","confirm-label":"confirm","forgot-password":"forgot","auth-note":"note","config-title":"configTitle","config-body":"configBody","refresh-access":"refresh","resend-verification":"resend","waiting-logout":"logout","private-title":"privateTitle","private-description":"privateDescription","private-logout":"logout","records-label":"recordsLabel","account-label":"account","account-status":"approved","records-title":"recordsTitle","records-subtitle":"recordsSubtitle","search-label":"search","col-title":"colTitle","col-type":"colType","col-source":"colSource","col-status":"colStatus","privacy-footer":"footer"};
 items["private-kicker"]="privateKicker";
 Object.assign(items,{"side-brand-name":"brand","side-kicker":"sideKicker","dashboard-nav-label":"dashboardNav","reports-nav-label":"reportsNav","contact-label":"contact","program-name":"program","reports-page-kicker":"reportsKicker","reports-page-title":"reportsTitle","reports-page-description":"reportsDesc","reports-empty-description":"reportsEmptyDesc","auth-kicker":"authKicker","intake-kicker":"intakeKicker","admin-map-kicker":"mapKicker"});
 for(const [id,key] of Object.entries(items))$(id).textContent=t(key);
 for(const [id,key] of Object.entries({"internal-reports-nav-label":"nav","internal-reports-kicker":"kicker","internal-reports-title":"title","internal-reports-description":"description","internal-reports-method-title":"methodTitle","internal-reports-method-body":"methodBody","internal-reports-empty":"empty"}))$(id).textContent=internalStrings[locale][key];
 $("record-search").placeholder=t("searchPlaceholder");
 $("auth-email").placeholder=t("authEmailPlaceholder");$("auth-institution").placeholder=t("institutionPlaceholder");$("auth-justification").placeholder=t("justificationPlaceholder");$("retry-request-title").textContent=t("retryTitle");
 for(const [id,key] of [["institution-label","institution"],["justification-label","justification"],["signup-privacy-note","privacy"],["retry-institution-label","institution"],["retry-justification-label","justification"],["retry-request-button","send"],["admin-requests-title","adminTitle"],["admin-requests-description","adminDescription"]]){const target=$(id);if(target)target.textContent=accessStrings[locale][key];}
 document.querySelector(".secure-brand")?.setAttribute("aria-label",t("back"));document.querySelector(".secure-brand")?.setAttribute("title",t("back"));
 $("account-role").textContent=approvalAdmin?t("roleAdmin"):t("roleContributor");
 if(intakeModule){try{intakeModule.setIntakeLanguage(locale);}catch(e){console.warn("Intake locale update failed",e);}}
  if(mapModule){try{mapModule.setMapPointLanguage(locale);}catch(e){console.warn("Map admin locale update failed",e);}}
 renderInternalReport();
 $("submit-button").textContent=t(mode);$("auth-confirm").autocomplete=mode==="signup"?"new-password":"off";
 $("auth-password").autocomplete=mode==="signup"?"new-password":"current-password";
 if(activeUser && $("waiting-panel").hidden===false)displayWaiting(activeUser,!activeUser.emailVerified,false);
 if(!$("dashboard-panel").hidden){drawRecords();if(explorerModule){try{explorerModule.setExplorerLanguage(locale);}catch(e){console.warn("Explorer locale update failed",e);}}} if(window.__nimfRefreshUtilityPanels)window.__nimfRefreshUtilityPanels(); if(window.__nimfMapFilterTranslate)window.__nimfMapFilterTranslate();
}
const internalReportRecord={
 titles:{pt:"Relatório de evolução mensal — Observatório Global de Tráfico de Animais",en:"Monthly evolution report — Illegal Wildlife Trafficking Global Observatory",es:"Informe de evolución mensual — Observatorio Global del Tráfico de Animales"},
 descriptions:{pt:"Edição inaugural sobre a evolução tecnológica e metodológica de 21/09 a 15/10/2026: dados, repositórios, mapas 2D/3D, inteligência de mercados, auditorias e próximas etapas com Aurum.",en:"Inaugural account of technological and methodological progress, 21 September–15 October 2026: datasets, repositories, 2D/3D mapping, market intelligence, quality assurance and Aurum integration plans.",es:"Edición inaugural sobre los avances tecnológicos y metodológicos, del 21 de septiembre al 15 de octubre de 2026: datos, repositorios, mapas 2D/3D, inteligencia de mercados, auditorías e integración prevista con Aurum."}
};
const internalFileNames={pt:"Observatorio_Relatorio_Evolucao_2026-09-21_a_10-15_PT.pdf",en:"Observatorio_Relatorio_Evolucao_2026-09-21_a_10-15_EN.pdf",es:"Observatorio_Relatorio_Evolucao_2026-09-21_a_10-15_ES.pdf"};
const internalReportLabels={
 pt:{download:"Baixar PDF em português",upload:"Enviar PDF em português",waiting:"PDF ainda não enviado ao armazenamento privado.",error:"Falha ao acessar o PDF protegido.",success:"PDF enviado. O download está disponível para usuários aprovados.",invalid:"Selecione o PDF original correspondente ao idioma."},
 en:{download:"Download English PDF",upload:"Upload English PDF",waiting:"The PDF has not been uploaded to private storage yet.",error:"Could not access the protected PDF.",success:"PDF uploaded. Approved users can download it.",invalid:"Select the original PDF for this language."},
 es:{download:"Descargar PDF en español",upload:"Subir PDF en español",waiting:"El PDF aún no se ha cargado al almacenamiento privado.",error:"No se pudo acceder al PDF protegido.",success:"PDF cargado. Los usuarios aprobados pueden descargarlo.",invalid:"Seleccione el PDF original de este idioma."}
};
function renderInternalReport(){
 const list=$("internal-reports-folders");if(!list)return;
 list.replaceChildren();
 const lang=["pt","en","es"].includes(locale)?locale:"pt";
 const labels=internalReportLabels[lang],filename=internalFileNames[lang];
 const path="internal-reports/evolution-2026-09-21-2026-10-15/"+filename;
 const card=document.createElement("article");card.className="reports-folder-card";
 const heading=document.createElement("h3");heading.textContent=internalReportRecord.titles[lang];card.append(heading);
 const summary=document.createElement("p");summary.textContent=internalReportRecord.descriptions[lang];card.append(summary);
 const status=document.createElement("p");status.className="reports-empty-description";status.setAttribute("role","status");
 const download=document.createElement("button");download.className="secure-button";download.type="button";download.textContent=labels.download;
 download.addEventListener("click",async()=>{
  if(!reportStorage||!auth?.currentUser?.emailVerified||!activeUser)return;
  download.disabled=true;status.textContent="";
  try{
   const file=await getBlob(storageRef(reportStorage,path),10485760);
   const objectUrl=URL.createObjectURL(file),link=document.createElement("a");
   link.href=objectUrl;link.download=filename;document.body.append(link);link.click();link.remove();
   setTimeout(()=>URL.revokeObjectURL(objectUrl),30000);
  }catch(error){status.textContent=error?.code==="storage/object-not-found"?labels.waiting:labels.error;}
  finally{download.disabled=false;}
 });
 card.append(download);
 if(approvalAdmin){
  const picker=document.createElement("input");picker.type="file";picker.accept=".pdf,application/pdf";picker.hidden=true;
  const upload=document.createElement("button");upload.className="secure-secondary";upload.type="button";upload.textContent=labels.upload;upload.addEventListener("click",()=>picker.click());
  picker.addEventListener("change",async()=>{
   const file=picker.files?.[0];if(!file)return;
   if(file.name!==filename||file.size>10485760){status.textContent=labels.invalid;return;}
   upload.disabled=true;status.textContent="";
   try{await uploadBytes(storageRef(reportStorage,path),file,{contentType:"application/pdf",cacheControl:"private, no-store"});status.textContent=labels.success;}
   catch(error){status.textContent=labels.error;}finally{upload.disabled=false;picker.value="";}
  });
  card.append(upload,picker);
 }
 card.append(status);list.append(card);$("internal-reports-empty").hidden=true;
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
 $("password-confirm-wrap").hidden=next!=="signup";$("signup-details").hidden=next!=="signup";$("auth-confirm").required=next==="signup";
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
 link.href="https://cdn.jsdelivr.net/npm/maplibre-gl@5.10.0/dist/maplibre-gl.css";
 document.head.append(link);
 const sources=[
  "https://cdn.jsdelivr.net/npm/maplibre-gl@5.10.0/dist/maplibre-gl.js",
  "https://unpkg.com/maplibre-gl@5.10.0/dist/maplibre-gl.js"
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
   const mod=await import("./explorer.js?v=search49");
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
   const mod=await import("./intake.js?v=filter42");
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
 const snap=await getDocs(collection(db,"records"));
 if(epoch!==authEpoch||auth.currentUser?.uid!==user.uid)return;
 records=snap.docs.filter(d=>d.id!=="abelhas-org-30683").map(d=>({id:d.id,...d.data()}));
 $("account-email").textContent=user.email||"";
 $("account-role").textContent=approvalAdmin?t("roleAdmin"):t("roleContributor");
 renderInternalReport();
 $("record-search").value="";show("dashboard-panel");switchWorkspace("dashboard");message("records-error","");drawRecords();enablePrivateWidgets(user,epoch);void loadReportGrants(user,epoch);void loadAdminApplications(user,epoch);
}
async function ensureApplication(user){
 try{
  const requestRef=doc(db,"access_requests",user.uid);
  const existing=await getDoc(requestRef);
  if(existing.exists()){$("access-request-retry").hidden=true;sessionStorage.removeItem("nimf-pending-request-"+user.uid);return;}
  const stored=sessionStorage.getItem("nimf-pending-request-"+user.uid);
  if(stored){
   const values=JSON.parse(stored);
   await setDoc(requestRef,{email:user.email,institution:values.institution,justification:values.justification,status:"pending",created_at:serverTimestamp(),updated_at:serverTimestamp()});
   sessionStorage.removeItem("nimf-pending-request-"+user.uid);
   $("access-request-retry").hidden=true;return;
  }
  $("access-request-retry").hidden=false;
 }catch(e){console.warn("Application registration not yet available",e?.code||e);$("access-request-retry").hidden=false;}
}
$("access-request-retry").addEventListener("submit",async e=>{
 e.preventDefault();const user=auth?.currentUser;if(!user||!user.emailVerified)return;
 const institution=$("retry-institution").value.trim(),justification=$("retry-justification").value.trim();
 if(institution.length<3||justification.length<20){message("waiting-error",accessStrings[locale].error);return;}
 try{
  await setDoc(doc(db,"access_requests",user.uid),{email:user.email,institution,justification,status:"pending",created_at:serverTimestamp(),updated_at:serverTimestamp()});
  $("access-request-retry").hidden=true;message("waiting-error",accessStrings[locale].submitted);
 }catch(err){message("waiting-error",accessStrings[locale].error);}
});
async function loadAdminApplications(user,epoch){
 if(!approvalAdmin)return;
 $("admin-access-requests").hidden=false;
 const container=$("admin-requests-list");container.replaceChildren();
 try{
  const snap=await getDocs(query(collection(db,"access_requests"),limit(100)));
  if(epoch!==authEpoch||auth.currentUser?.uid!==user.uid)return;
  const deepLink=new URLSearchParams(location.search).get("request");
  for(const d of snap.docs.filter(x=>x.data().status==="pending")){
   const data=d.data();const article=document.createElement("article");article.className="access-request-card";
   if(d.id===deepLink)article.classList.add("access-request-highlight");
   const heading=document.createElement("strong");heading.textContent=data.email||d.id;article.append(heading);
   const organization=document.createElement("p");organization.textContent=accessStrings[locale].institution+": "+(data.institution||"");article.append(organization);
   const purpose=document.createElement("p");purpose.textContent=accessStrings[locale].justification+": "+(data.justification||"");article.append(purpose);
   const button=document.createElement("button");button.type="button";button.className="secure-button";button.textContent=accessStrings[locale].approve;
   // A link never approves a user. Explicit administrator confirmation and a trusted backend are required.
   button.onclick=async()=>{if(!window.confirm(accessStrings[locale].confirm))return;button.disabled=true;try{const token=await auth.currentUser.getIdToken(true);const endpoint="https://us-central1-"+firebaseConfig.projectId+".cloudfunctions.net/approveAccessRequest";if(!endpoint)throw Error("Approval service not deployed");const response=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({requestId:d.id})});if(!response.ok)throw Error("Approval failed");article.remove();$("admin-requests-feedback").textContent=accessStrings[locale].approved;}catch(err){$("admin-requests-feedback").textContent=accessStrings[locale].error;}finally{button.disabled=false;}};
   article.append(button);container.append(article);
   if(d.id===deepLink)article.scrollIntoView({block:"center"});
  }
 }catch(err){$("admin-requests-feedback").textContent=accessStrings[locale].error;}
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
const interfaceThemeLabels={pt:{dark:"Escuro",light:"Claro",name:"Tema da interface"},en:{dark:"Dark",light:"White",name:"Interface theme"},es:{dark:"Oscuro",light:"Claro",name:"Tema de la interfaz"}};
function refreshInterfaceThemeLabel(){
 const mode=document.body.dataset.theme==="light"?"light":"dark";
 const labels=interfaceThemeLabels[locale]||interfaceThemeLabels.pt;
 const legacy=$("secure-theme");if(legacy){legacy.textContent=mode==="dark"?labels.light:labels.dark;legacy.setAttribute("aria-label",labels.name);}
 for(const [id,value] of [["interface-theme-dark","dark"],["interface-theme-light","light"]]){
  const button=$(id);if(button){button.textContent=labels[value];button.setAttribute("aria-pressed",String(mode===value));button.classList.toggle("is-active",mode===value);}
 }
 $("secure-theme-switch")?.setAttribute("aria-label",labels.name);
}
function setInterfaceTheme(mode){if(mode!=="dark"&&mode!=="light")return;document.body.dataset.theme=mode;refreshInterfaceThemeLabel();}
$("secure-theme").addEventListener("click",()=>setInterfaceTheme(document.body.dataset.theme==="dark"?"light":"dark"));
for(const [id,mode] of [["interface-theme-dark","dark"],["interface-theme-light","light"]])$(id)?.addEventListener("click",()=>setInterfaceTheme(mode));
refreshInterfaceThemeLabel();
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
  auth=getAuth(app);db=getFirestore(app);reportStorage=getStorage(app);
  show("auth-panel");window.__nimfAppStarted=true;
  onAuthStateChanged(auth,user=>{
   const epoch=++authEpoch;void evaluateUser(user,epoch);
  },()=>show("auth-panel"));
 }catch(e){show("config-panel");window.__nimfAppStarted=true;}
}

/* Mobile sign-in: show institutional disclaimer and WCS identity after the login card. */
(function arrangeMobileLoginInstitutional(){
 const disclaimer=document.querySelector(".secure-side-content.secure-disclaimer");
 const institutional=document.querySelector(".secure-side-bottom");
 const authCard=document.getElementById("auth-panel");
 if(!disclaimer||!institutional||!authCard)return;
 const a=document.createComment("sidebar disclaimer location"),b=document.createComment("sidebar institutional location");
 disclaimer.before(a);institutional.before(b);
 const mq=window.matchMedia("(max-width: 920px)");
 const sync=()=>{
  const move=mq.matches && !authCard.hidden && document.body.dataset.privateReady!=="true";
  if(move){
   authCard.after(disclaimer);
   disclaimer.after(institutional);
   disclaimer.classList.add("mobile-login-disclaimer");
   institutional.classList.add("mobile-login-institutional");
  }else{
   a.after(disclaimer);b.after(institutional);
   disclaimer.classList.remove("mobile-login-disclaimer");
   institutional.classList.remove("mobile-login-institutional");
  }
 };
 mq.addEventListener("change",sync);
 new MutationObserver(sync).observe(authCard,{attributes:true,attributeFilter:["hidden"]});
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:["data-private-ready"]});
 sync();
})();

/* Admin workspace: only one expanded by default, optional multi-column comparison. */
(function initializeUtilityPanels(){
 const container=document.getElementById("utility-panel-grid"),compare=document.getElementById("utility-compare");
 if(!container||!compare)return;
 const definitions=[["exchange","information-exchange-panel","utility-open-exchange"],["mine","my-contributions-panel","utility-open-mine"],["triage","admin-review","utility-open-triage"],["history","admin-history","utility-open-history"],["layers","admin-map-panel","utility-open-layers"],["records","private-records-panel","utility-open-records"]];
 const open=new Set(), nodes=definitions.map(([key,id,buttonId])=>({key,node:document.getElementById(id),button:document.getElementById(buttonId)}));
 for(const entry of nodes){
  if(!entry.node||!entry.button)continue;
  if(entry.key==="triage"||entry.key==="history"||entry.key==="layers")entry.node.dataset.adminAvailable="false";
  entry.node.dataset.collapsed="true";
  entry.node.classList.add("utility-managed");
  container.append(entry.node);
 }
 const labels={pt:{exchange:"Troca de informações",mine:"Minhas contribuições",triage:"Triagem",history:"Histórico de triagens",layers:"Cadastro de camadas",records:"Registros privados",compare:"Comparar lado a lado"},en:{exchange:"Information exchange",mine:"My contributions",triage:"Review queue",history:"Triage history",layers:"Layer administration",records:"Private records",compare:"Compare side by side"},es:{exchange:"Intercambio de información",mine:"Mis contribuciones",triage:"Revisión",history:"Historial de evaluaciones",layers:"Administrar capas",records:"Registros privados",compare:"Comparar lado a lado"}};
 const redraw=()=>{
  const lang=typeof locale==="string"&&labels[locale]?locale:"pt";
  for(const entry of nodes){
   if(!entry.node||!entry.button)continue;
   const available=entry.key==="records"||entry.key==="mine"||entry.key==="exchange"||entry.node.dataset.adminAvailable==="true";
   entry.button.hidden=!available;
   if(!available)open.delete(entry.key);
   const expanded=available&&open.has(entry.key);
   entry.button.setAttribute("aria-expanded",String(expanded));
   entry.button.classList.toggle("is-active",expanded);
   entry.node.dataset.collapsed=String(!expanded);
   entry.button.textContent=labels[lang][entry.key]+" "+(expanded?"▴":"▾");
  }
  const count=open.size;container.style.setProperty("--utility-count",String(Math.max(1,count)));
  container.classList.toggle("utility-compare-enabled",compare.checked);
  document.getElementById("utility-compare-label").textContent=labels[lang].compare;
 };
 for(const entry of nodes){
  if(!entry.node||!entry.button)continue;
  entry.button.addEventListener("click",()=>{
   if(open.has(entry.key))open.delete(entry.key);
   else{if(!compare.checked)open.clear();open.add(entry.key);}
   redraw();
  });
  if(entry.key==="triage"||entry.key==="history"||entry.key==="layers"){
   const observer=new MutationObserver(()=>{
    if(!entry.node.hidden){entry.node.dataset.adminAvailable="true";entry.node.hidden=false;}
    else if(entry.node.dataset.adminAvailable==="true"){entry.node.dataset.adminAvailable="false";open.delete(entry.key);}
    redraw();
   });
   observer.observe(entry.node,{attributes:true,attributeFilter:["hidden"]});
  }
 }
 compare.addEventListener("change",()=>{
  if(!compare.checked&&open.size>1){
   const first=[...open][open.size-1];open.clear();open.add(first);
  }
  redraw();
 });
 const observer=new MutationObserver(()=>{
  if(document.getElementById("dashboard-panel")?.hidden||document.body.dataset.privateReady!=="true"){open.clear();compare.checked=false;}
  redraw();
 });
 observer.observe(document.body,{attributes:true,attributeFilter:["data-private-ready"]});
 window.__nimfRefreshUtilityPanels=redraw;
 redraw();
})();

/* Map filters drawer: reparent the existing global controls, preserving listeners. */
(function setupMapFiltersDrawer(){
 const toggle=document.getElementById("map-filters-toggle");
 const panel=document.getElementById("map-filters-panel");
 const close=document.getElementById("map-filters-close");
 const language=document.getElementById("secure-language");
 if(!toggle||!panel||!close||!language)return;
 const labels={pt:{filter:"Filtros",heading:"Controles do mapa",lang:"Idioma",close:"Fechar filtros"},en:{filter:"Filters",heading:"Map controls",lang:"Language",close:"Close filters"},es:{filter:"Filtros",heading:"Controles del mapa",lang:"Idioma",close:"Cerrar filtros"}};
 function setOpen(open){
  const active=Boolean(open);
  panel.hidden=!active;
  panel.inert=!active;
  toggle.setAttribute("aria-expanded",String(active));
  toggle.classList.toggle("is-active",active);
 }
 const translateDrawer=()=>{
  const l=labels[locale]||labels.pt;
  document.getElementById("map-filters-toggle-label").textContent=l.filter;
  document.getElementById("map-filters-heading").textContent=l.heading;
  close.setAttribute("aria-label",l.close);close.title=l.close;
  language.setAttribute("aria-label",l.lang);
  refreshInterfaceThemeLabel();
 };
 toggle.addEventListener("click",()=>{setOpen(panel.hidden);if(!panel.hidden)document.getElementById("explorer-search")?.focus({preventScroll:true});});
 close.addEventListener("click",()=>{setOpen(false);toggle.focus({preventScroll:true});});
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!panel.hidden){setOpen(false);toggle.focus({preventScroll:true});}});
 document.addEventListener("pointerdown",e=>{if(!panel.hidden&&!panel.contains(e.target)&&!toggle.contains(e.target))setOpen(false);});
 window.__nimfMapFilterTranslate=translateDrawer;
 translateDrawer();
})();
