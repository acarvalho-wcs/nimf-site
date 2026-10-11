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
 // This fixture renders the actual explorer in a browser without Firebase credentials.
 await page.goto("http://127.0.0.1:8751/tests/map-explorer.html",{waitUntil:"domcontentloaded",timeout:30000});
 await page.waitForFunction(()=>window.__demoReady===true,{timeout:15000});
 assert.ok(await page.locator(".nimf-raster-layer").isVisible(),"Raster fallback must render when MapLibre is absent");
 assert.ok(await page.locator(".nimf-raster-tiles img").count()>0,"At least one OSM map tile must be requested");
 assert.equal(await page.locator(".nimf-raster-pin").count(),1,"Georeferenced synthetic record must have a map marker");
 await page.locator("#species-trigger").click();
 const italic=page.locator("#species-menu .scientific-name").first();
 assert.equal(await italic.isVisible(),true,"Species choice must be visible and italic");
 assert.equal(await italic.evaluate(el=>getComputedStyle(el).fontStyle),"italic");
 await page.locator("#species-menu button").filter({hasText:"Testudo ficticia"}).click();
 assert.equal(await page.locator("#explorer-species").inputValue(),"Testudo ficticia");
 assert.equal(await page.locator("#explorer-cards .scientific-name").count(),1);
 assert.equal(await page.locator("#explorer-count").textContent(),"1");
 console.log("PASS: "+browserName+" OSM fallback renders a map, filters species and formats scientific names");

}finally{await browser.close();}
}
