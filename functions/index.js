"use strict";
const {onDocumentCreated}=require("firebase-functions/v2/firestore");
const {onRequest}=require("firebase-functions/v2/https");
const {defineSecret}=require("firebase-functions/params");
const admin=require("firebase-admin");
const nodemailer=require("nodemailer");
admin.initializeApp();
const smtpHost=defineSecret("NIMF_SMTP_HOST");
const smtpPort=defineSecret("NIMF_SMTP_PORT");
const smtpUser=defineSecret("NIMF_SMTP_USER");
const smtpPassword=defineSecret("NIMF_SMTP_PASSWORD");
const smtpFrom=defineSecret("NIMF_SMTP_FROM");
const ADMIN_EMAIL="acarvalho@wcs.org";
const NOTICE_EMAIL="inteligencia@wcs.org";
const APP_URL="https://acarvalho-wcs.github.io/nimf-site/secure.html";
const REGION="us-central1";
const mailSecrets=[smtpHost,smtpPort,smtpUser,smtpPassword,smtpFrom];

exports.notifyAccessRequest=onDocumentCreated({document:"access_requests/{uid}",region:REGION,secrets:mailSecrets,retry:false},async event=>{
 const data=event.data?.data();if(!data || data.status!=="pending")return;
 const uid=event.params.uid;
 // Notification occurs only after creation by a verified Firebase user.
 const user=await admin.auth().getUser(uid);
 if(!user.emailVerified || user.email?.toLowerCase()!==String(data.email||"").toLowerCase())return;
 const settings={host:smtpHost.value(),port:Number(smtpPort.value()),secure:Number(smtpPort.value())===465,auth:{user:smtpUser.value(),pass:smtpPassword.value()}};
 const mail=nodemailer.createTransport(settings);
 const link=APP_URL+"?request="+encodeURIComponent(uid);
 await mail.sendMail({
   from:smtpFrom.value(),to:NOTICE_EMAIL,
   subject:"[Investigação de Mercados de Fauna] Nova solicitação de acesso",
   text:["Nova solicitação de acesso ao painel restrito.","","E-mail verificado: "+String(data.email||""),
     "Instituição: "+String(data.institution||""),
     "Justificativa: "+String(data.justification||""),
     "Status: Aguardando aprovação","",
     "Revisar solicitação (login administrativo obrigatório): "+link,
     "","Abrir o link não concede acesso. Confirme a decisão na plataforma."].join("\n")
 });
});

exports.approveAccessRequest=onRequest({region:REGION,cors:[/^https:\/\/acarvalho-wcs\.github\.io$/],invoker:"public",maxInstances:3},async(req,res)=>{
 if(req.method!=="POST"){res.set("Allow","POST");res.status(405).send("Method not allowed");return;}
 try{
  const header=req.headers.authorization||"";
  if(!header.startsWith("Bearer ")){res.status(401).send("Unauthorized");return;}
  const identity=await admin.auth().verifyIdToken(header.slice(7),true);
  if(!identity.email_verified || String(identity.email||"").toLowerCase()!==ADMIN_EMAIL){res.status(403).send("Forbidden");return;}
  const db=admin.firestore();
  const self=await db.collection("access").doc(identity.uid).get();
  if(!self.exists || self.data().approved!==true || self.data().admin!==true){res.status(403).send("Forbidden");return;}
  const requestId=req.body?.requestId;
  if(typeof requestId!=="string"||!/^[a-zA-Z0-9_-]{6,128}$/.test(requestId)){res.status(400).send("Invalid request");return;}
  const requestRef=db.collection("access_requests").doc(requestId);
  const accessRef=db.collection("access").doc(requestId);
  await db.runTransaction(async tx=>{
   const snapshot=await tx.get(requestRef);
   if(!snapshot.exists||snapshot.data().status!=="pending")throw new Error("Request not pending");
   const person=await admin.auth().getUser(requestId);
   if(!person.emailVerified || person.email?.toLowerCase()!==String(snapshot.data().email||"").toLowerCase())throw new Error("Email not verified");
   tx.set(accessRef,{approved:true,admin:false,email:person.email,approved_at:admin.firestore.FieldValue.serverTimestamp(),approved_by:identity.uid},{merge:true});
   tx.update(requestRef,{status:"approved",updated_at:admin.firestore.FieldValue.serverTimestamp(),reviewed_by:identity.uid});
  });
  res.status(200).json({approved:true});
 }catch(error){
  console.error("Access approval failed",error?.message);
  res.status(409).json({error:"Approval could not be completed"});
 }
});
