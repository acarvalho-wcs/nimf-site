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
 // Use consistent image tiles so tests validate geographic positioning, not external tile uptime.
 await page.route("https://tile.openstreetmap.org/**",route=>route.fulfill({
  status:200,contentType:"image/svg+xml",
  body:'<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#629fc4"/><path d="M0 140L90 90L170 105L256 50L256 256L0 256Z" fill="#dce4c8"/></svg>'
 }));
 // This fixture renders the actual explorer in a browser without Firebase credentials.
 await page.goto("http://127.0.0.1:8751/tests/map-explorer.html",{waitUntil:"domcontentloaded",timeout:30000});
 await page.waitForFunction(()=>window.__demoReady===true,{timeout:15000});
 assert.ok(await page.locator(".nimf-raster-layer").isVisible(),"Raster fallback must render when MapLibre is absent");
 assert.ok(await page.locator("canvas.nimf-raster-tiles").count()===1,"Raster tiles must compose into a single canvas");
 await page.waitForFunction(()=>Number(document.getElementById("explorer-map").dataset.loadedTiles)>0,{timeout:14000});
 const camera=await page.locator("#explorer-map").evaluate(el=>({lat:Number(el.dataset.centerLatitude),lon:Number(el.dataset.centerLongitude),zoom:Number(el.dataset.zoom),count:Number(el.dataset.mappedCount),tile:el.dataset.centerTile}));
 console.log("MAP_CAMERA: "+JSON.stringify(camera));
 assert.ok(Math.abs(camera.lat+3.119)<0.005 && Math.abs(camera.lon+60.0217)<0.005,"Map must center on Manaus, not another continent");
 assert.equal(camera.zoom,7,"Single municipality must be shown at regional zoom");
 assert.equal(camera.count,1);
 assert.equal(camera.tile,"7/42/65","Web Mercator tile for Manaus must be correct");

 assert.equal(await page.locator(".nimf-raster-pin").count(),1,"Georeferenced synthetic record must have a map marker");
 await page.locator("#species-trigger").click();
 const italic=page.locator("#species-menu .scientific-name").first();
 assert.equal(await italic.isVisible(),true,"Species choice must be visible and italic");
 assert.equal(await italic.evaluate(el=>getComputedStyle(el).fontStyle),"italic");
 await page.locator("#species-menu button").filter({hasText:"Testudo ficticia"}).click();
 assert.equal(await page.locator("#explorer-species").inputValue(),"Testudo ficticia");
 assert.equal(await page.locator("#explorer-cards .scientific-name").count(),1);
 assert.equal(await page.locator("#explorer-count").textContent(),"1");

 // Locale switch updates the entire map explorer, record title, status, precision, and source context.
 for(const [lang,headline,status,cat] of [["en","Wildlife markets: map and filters","Under review","Commercial listing"],["es","Mercados de fauna: mapa y filtros","En revisión","Anuncio comercial"],["pt","Mercados de fauna: mapa e filtros","Em revisão","Anúncio comercial"]]){
  await page.evaluate(l=>window.__demoSetLanguage(l),lang);
  assert.equal((await page.locator("#explorer-title").textContent()).trim(),headline);
  assert.ok((await page.locator("#explorer-cards .explorer-card small").textContent()).includes(status));
  assert.equal(await page.evaluate(l=>window.__demoLocalized("category",l),lang),cat);
  assert.equal(await page.evaluate(l=>window.__demoLocalized("status",l),lang),status);
  assert.ok(Math.abs(Number(await page.locator("#explorer-map").getAttribute("data-center-latitude"))+3.119)<0.005);
 }

 console.log("PASS: "+browserName+" OSM composite map and PT EN ES filters");
 // Test the actual intake form, with a browser-side stub for the Firebase import.
 await page.route("https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js",route=>route.fulfill({
  status:200,contentType:"application/javascript",headers:{"access-control-allow-origin":"*"},
  body:"export const collection=()=>null,query=()=>null,where=()=>null,limit=()=>null,onSnapshot=()=>null,addDoc=()=>null,doc=()=>null,serverTimestamp=()=>null,writeBatch=()=>null;"
 }));
 await page.goto("http://127.0.0.1:8751/tests/intake-languages.html",{waitUntil:"domcontentloaded",timeout:30000});
 await page.waitForFunction(()=>window.__intakeTestReady===true,{timeout:15000});
 for(const [lang,title,button,placeholder] of [
  ["en","Investigation contributions","Submit for review","Scientific or common name"],
  ["es","Contribuciones para investigación","Enviar para evaluación","Nombre científico o común"],
  ["pt","Contribuições para investigação","Enviar para triagem","Nome científico ou comum"]
 ]){
  await page.evaluate(l=>window.__setIntakeLanguage(l),lang);
  assert.equal((await page.locator(".private-contributions .explorer-head h3").textContent()).trim(),title);
  assert.equal((await page.locator("#tip-submit").textContent()).trim(),button);
  assert.equal(await page.locator("#tip-species").getAttribute("placeholder"),placeholder);
 }
 console.log("PASS: "+browserName+" investigation intake changes fully across three languages");


}finally{await browser.close();}
}
