import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";
for (const [browserName,engine] of [["chromium",chromium],["webkit",webkit]]) {
const browser=await engine.launch({headless:true});
try{
 const page=await browser.newPage();
 const errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 page.on("console",m=>{if(m.type()==="error")errors.push(m.text())});
 await page.goto("http://127.0.0.1:8751/secure.html",{waitUntil:"domcontentloaded",timeout:30000});
 await page.waitForFunction(()=>window.__nimfAppStarted===true,{timeout:22000});
 const shown=await page.locator("#auth-panel").isVisible()||await page.locator("#config-panel").isVisible();
 assert.ok(shown,"The page must never display only the empty sidebar");
 if(!await page.locator("#auth-panel").isVisible())throw Error("Login unavailable. Console errors: "+errors.slice(0,4).join(" | "));
 assert.equal(await page.locator("#auth-email").isVisible(),true);
 console.log("PASS: "+browserName+" private login loads with no credentials or map dependency");
}finally{await browser.close();}
}
