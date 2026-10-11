import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {initializeTestEnvironment,assertFails,assertSucceeds} from "@firebase/rules-unit-testing";
import {doc,collection,getDoc,getDocs,query,where,setDoc,updateDoc,addDoc,serverTimestamp} from "firebase/firestore";

const env=await initializeTestEnvironment({
 projectId:"demo-nimf-access-tests",
 firestore:{host:"127.0.0.1",port:8080,rules:readFileSync("firestore.rules","utf8")}
});
let count=0;
try {
 const alice=env.authenticatedContext("alice",{email_verified:true,email:"alice@example.org"});
 const bob=env.authenticatedContext("bob",{email_verified:true,email:"bob@example.org"});
 const admin=env.authenticatedContext("admin",{email_verified:true,email:"admin@example.org"});
 const pending=env.authenticatedContext("pending",{email_verified:true,email:"pending@example.org"});
 const anon=env.unauthenticatedContext();
 await env.withSecurityRulesDisabled(async ctx=>{
  const f=ctx.firestore();
  for(const [uid,data] of [["alice",{approved:true}],["bob",{approved:true}],["admin",{approved:true,admin:true}],["pending",{approved:false}]]){
   await setDoc(doc(f,"access",uid),data);
  }
  await setDoc(doc(f,"records","reviewed-001"),{title:"Test market record"});
  await setDoc(doc(f,"submissions","alice-001"),{
   owner_uid:"alice",type:"platform",title:"Fictitious reference",
   url:"https://example.org/demo",species:"",location:"",details:"",
   status:"received",review_note:"",created_at:new Date(),updated_at:new Date()
  });
 });
 async function test(label,promise,allowed){
  if(allowed)await assertSucceeds(promise);else await assertFails(promise);
  count++;console.log("PASS: "+label);
 }
 await test("anonymous private record denied",getDoc(doc(anon.firestore(),"records","reviewed-001")),false);
 await test("approved user private record allowed",getDoc(doc(alice.firestore(),"records","reviewed-001")),true);
 await test("pending user record denied",getDoc(doc(pending.firestore(),"records","reviewed-001")),false);
 await test("approved browser cannot update canonical record",updateDoc(doc(alice.firestore(),"records","reviewed-001"),{title:"Tampered"}),false);
 await test("owner can read own submission",getDoc(doc(alice.firestore(),"submissions","alice-001")),true);
 await test("other approved user cannot read submission",getDoc(doc(bob.firestore(),"submissions","alice-001")),false);
 await test("owner query constrained by owner_uid is allowed",getDocs(query(collection(alice.firestore(),"submissions"),where("owner_uid","==","alice"))),true);
 await test("approved user cannot list all submissions",getDocs(collection(bob.firestore(),"submissions")),false);
 await test("admin can read submissions",getDoc(doc(admin.firestore(),"submissions","alice-001")),true);
 await test("admin can list all submissions",getDocs(collection(admin.firestore(),"submissions")),true);
 await test("owner cannot modify workflow status",updateDoc(doc(alice.firestore(),"submissions","alice-001"),{status:"investigating",updated_at:serverTimestamp()}),false);
 await test("admin can set triage status",updateDoc(doc(admin.firestore(),"submissions","alice-001"),{status:"triage",review_note:"Under review",updated_at:serverTimestamp()}),true);
 const valid={owner_uid:"bob",type:"group",title:"Fictitious group",url:"https://example.org/fake",
 species:"",location:"",details:"Test only",status:"received",review_note:"",created_at:serverTimestamp(),updated_at:serverTimestamp()};
 await test("approved user can submit source for review",addDoc(collection(bob.firestore(),"submissions"),valid),true);
 await test("author cannot impersonate other user",addDoc(collection(bob.firestore(),"submissions"),{...valid,owner_uid:"alice"}),false);
 await test("pending user cannot submit",addDoc(collection(pending.firestore(),"submissions"),{...valid,owner_uid:"pending"}),false);
 const owner=await getDoc(doc(alice.firestore(),"submissions","alice-001"));
 assert.equal(owner.data().status,"triage");
 console.log("All "+count+" Firestore security rule assertions passed.");
}finally{await env.cleanup();}
