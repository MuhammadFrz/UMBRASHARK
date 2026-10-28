/* Optional integration suite: npm install --no-save playwright, then configure BROWSER_EXECUTABLE for Edge/Chromium if needed. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const presets = require('../data/profiles.js');
const root = path.resolve(__dirname, '..');
(async () => {
  let context, server;
  try {
    server = http.createServer((req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      if (req.url.startsWith('/headers')) { res.setHeader('Content-Type','application/json'); res.end(JSON.stringify(req.headers)); return; }
      const port = server.address().port;
      let frames = '';
      if (req.url.startsWith('/frames')) frames = '<iframe src="http://localhost:' + port + '/child"></iframe>';
      if (req.url.startsWith('/child')) frames = '<iframe src="http://127.0.0.1:' + port + '/grandchild"></iframe>';
      res.setHeader('Content-Type','text/html');
      res.end('<!doctype html><html><head><script>window.firstIdentity={ua:navigator.userAgent,language:navigator.language,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone};</script></head><body>' + frames + '</body></html>');
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = 'http://127.0.0.1:' + server.address().port;
    const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'umbra-correctness-'));
    context = await chromium.launchPersistentContext(profileDir, {
      executablePath: process.env.BROWSER_EXECUTABLE || undefined, headless:true,
      ignoreDefaultArgs:['--disable-extensions'], args:['--disable-extensions-except='+root,'--load-extension='+root],
      geolocation:{latitude:1,longitude:2}, permissions:['geolocation'], viewport:{width:1280,height:900}
    });
    const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker',{timeout:15000});
    const id = new URL(worker.url()).host;
    await worker.evaluate(async () => { for(let n=0;n<200;n++){if((await chrome.storage.local.get('cloakProfile')).cloakProfile)return;await new Promise(resolve=>setTimeout(resolve,20));}throw Error('Installation did not initialize'); });
    async function save(settings) {
      await worker.evaluate(async settings => { await chrome.storage.local.set(settings); await syncBrowserSettings(); }, settings);
    }
    const configured = {...presets.DEFAULT_PROFILE,timezone:'America/New_York',locale:'ja-JP',languages:['ja-JP','ja'],acceptLanguage:'ja-JP,ja;q=0.9'};
    await save({cloakProfile:configured,cloakEnabled:false,whitelist:[],canvasNoise:true,audioNoise:true,webRtcProtect:true});
    const page = await context.newPage(); const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(() => { try{sessionStorage.setItem('__cloak_sync_cache__',JSON.stringify({enabled:true,ua:'FORGED CACHE',locale:'xx-XX'}));}catch(e){/* Brave may deny third-party storage; the engine must not depend on it. */} });
    await page.goto(base+'/frames'); await page.waitForFunction(()=>window.frames.length===1);
    const native = await page.evaluate(() => {
      window.baseline={ua:navigator.userAgent,language:navigator.language,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,
        uaDescriptor:Object.getOwnPropertyDescriptor(Navigator.prototype,'userAgent'),uaData:navigator.userAgentData,
        offset:Date.prototype.getTimezoneOffset,dateString:Date.prototype.toString,localeString:Date.prototype.toLocaleString,
        formatter:Intl.DateTimeFormat,stringify:Function.prototype.toString,
        voices:window.speechSynthesis&&speechSynthesis.getVoices,devices:navigator.mediaDevices&&navigator.mediaDevices.enumerateDevices};
      window.audioTest=new AudioBuffer({length:64,sampleRate:44100,numberOfChannels:1});window.audioView=audioTest.getChannelData(0);audioView[0]=.25;
      return {ua:baseline.ua,language:baseline.language,timezone:baseline.timezone};
    });
    assert.notEqual(native.ua,'FORGED CACHE');
    for(const frame of page.frames()) assert.equal(await frame.evaluate(()=>navigator.userAgent),native.ua);
    await save({cloakEnabled:true});

    await page.waitForFunction(()=>navigator.language==='ja-JP');
    for(const frame of page.frames()) await frame.waitForFunction(()=>navigator.language==='ja-JP');
    const behavior = await page.evaluate(() => {
      const january=new Date('2026-01-20T12:00:00Z'),july=new Date('2026-07-20T12:00:00Z'),historical=new Date('1950-01-20T12:00:00Z');
      let badReceiver=false,missingAudioArgument=false;
      try{Date.prototype.getTimezoneOffset.call({});}catch(e){badReceiver=e instanceof TypeError;}
      try{audioTest.getChannelData();}catch(e){missingAudioArgument=e instanceof TypeError;}
      const a=audioTest.getChannelData(0)[0],b=audioTest.getChannelData(0)[0],c=audioTest.getChannelData(0)[0];
      document.dispatchEvent(new CustomEvent('__CLOAK_STATE_UPDATE__',{detail:{enabled:true,ua:'FORGED EVENT',locale:'xx-XX'}}));
      const controlKey=Object.getOwnPropertyNames(window).find(k=>k.startsWith('__umbra_'));
      const rejected=window[controlKey]('wrong-token',{enabled:true,ua:'FORGED TOKEN'});
      return {winter:january.getTimezoneOffset(),summer:july.getTimezoneOffset(),historical:historical.getTimezoneOffset(),
        winterString:january.toString(),summerString:july.toString(),hours:january.getHours(),
        explicit:new Intl.DateTimeFormat('de-DE',{timeZone:'UTC'}).resolvedOptions(),
        explicitDate:july.toLocaleString('en-US',{timeZone:'UTC'})===baseline.localeString.call(july,'en-US',{timeZone:'UTC'}),
        invalid:new Date(NaN).toString(),invalidOffset:Number.isNaN(new Date(NaN).getTimezoneOffset()),badReceiver,missingAudioArgument,
        audioValues:[a,b,c],audioStable:a===b&&b===c,language:navigator.language,ua:navigator.userAgent,rejected,
        nativeVoices:speechSynthesis.getVoices===baseline.voices,nativeDevices:navigator.mediaDevices.enumerateDevices===baseline.devices};
    });
    assert.equal(behavior.winter,300);assert.equal(behavior.summer,240);assert.equal(behavior.historical,300);
    assert.match(behavior.winterString,/GMT-0500/);assert.match(behavior.summerString,/GMT-0400/);assert.equal(behavior.hours,7);
    assert.equal(behavior.explicit.timeZone,'UTC');assert.equal(behavior.explicit.locale,'de-DE');
    for(const field of ['explicitDate','invalidOffset','badReceiver','missingAudioArgument','audioStable','nativeVoices','nativeDevices'])assert.equal(behavior[field],true,field==='audioStable'?JSON.stringify(behavior.audioValues):field);
    assert.equal(behavior.invalid,'Invalid Date');assert.equal(behavior.language,'ja-JP');assert.equal(behavior.ua,configured.ua);assert.equal(behavior.rejected.ok,false);
    const headers=await page.evaluate(()=>fetch('/headers').then(r=>r.json()));assert.equal(headers['accept-language'],configured.acceptLanguage);
    const position=await page.evaluate(()=>new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(p=>resolve({lat:p.coords.latitude,lon:p.coords.longitude,native:p instanceof GeolocationPosition,json:p.toJSON?p.toJSON():null}),reject)));
    assert.equal(position.lat,configured.lat);assert.ok(position.native);if(position.json)assert.equal(position.json.coords.latitude,configured.lat);
    const dashboard=await context.newPage();await dashboard.goto('chrome-extension://'+id+'/ui/dashboard.html');
    const testedTabId=await worker.evaluate(async base=>(await chrome.tabs.query({})).find(t=>t.url.startsWith(base)).id,base);
    const report=await dashboard.evaluate(tabId=>chrome.runtime.sendMessage({type:'RUN_PAGE_DIAGNOSTICS',tabId}),testedTabId);
    assert.ok(report.ok);assert.equal(report.frames.length,3);
    for(const frame of report.frames){assert.equal(frame.error,undefined);for(const check of frame.checks)assert.notEqual(check.status,'fail',frame.url+' '+check.name+': '+check.observed);}
    assert.equal(report.policy.value,'disable_non_proxied_udp');
    await dashboard.click('[data-tab="tab-studio"]');
    await dashboard.selectOption('#webRtcPolicySelect','default_public_interface_only');await dashboard.click('#btnSaveConfig');
    await dashboard.waitForFunction(async()=> (await chrome.storage.local.get('webRtcPolicy')).webRtcPolicy==='default_public_interface_only');
    await worker.evaluate(()=>syncBrowserSettings());assert.equal((await worker.evaluate(()=>chrome.privacy.network.webRTCIPHandlingPolicy.get({}))).value,'default_public_interface_only');
    await dashboard.selectOption('#webRtcPolicySelect','disable_non_proxied_udp');await dashboard.click('#btnSaveConfig');
    await dashboard.waitForFunction(async()=> (await chrome.storage.local.get('webRtcPolicy')).webRtcPolicy==='disable_non_proxied_udp');await worker.evaluate(()=>syncBrowserSettings());
    await dashboard.click('[data-tab="tab-diagnostics"]');
    await dashboard.waitForFunction(()=>document.getElementById('diagnosticTabSelect').options.length>0);
    await dashboard.selectOption('#diagnosticTabSelect',String(testedTabId));
    await dashboard.click('#btnRunDiagnostics');
    await dashboard.waitForFunction(()=>document.getElementById('diagSummary').textContent.includes('assertions passed'));
    assert.ok((await dashboard.textContent('#diagSummary')).includes('3 frames'));
    const blobStable=await page.evaluate(async()=>{const c=document.createElement('canvas');c.width=32;c.height=32;c.getContext('2d').fillRect(0,0,32,32);const encode=()=>new Promise(r=>c.toBlob(async b=>r(Array.from(new Uint8Array(await b.arrayBuffer())))));return JSON.stringify(await encode())===JSON.stringify(await encode());});
    assert.ok(blobStable);
    for(const sample of presets.IDENTITY_PRESETS){
      await save({cloakProfile:sample});
      await page.waitForFunction(platform=>navigator.platform===platform,sample.platform);
      const values=await page.evaluate(async()=>({ua:navigator.userAgent,platform:navigator.platform,memory:navigator.deviceMemory,cores:navigator.hardwareConcurrency,screenWidth:screen.width,hints:await navigator.userAgentData.getHighEntropyValues(['platformVersion','architecture','bitness'])}));
      assert.equal(values.ua,sample.ua);assert.equal(values.memory,sample.memory);assert.equal(values.cores,sample.cores);assert.equal(values.screenWidth,sample.screenWidth);assert.equal(values.hints.platformVersion,sample.chPlatformVersion);
      assert.equal((await page.evaluate(()=>fetch('/headers').then(r=>r.json())))['user-agent'],sample.ua);
    }
    await page.evaluate(()=>{window.originalDescriptor=Object.getOwnPropertyDescriptor;Object.getOwnPropertyDescriptor=function(target,key){if(target===window&&String(key).startsWith('__umbra_'))return {value:(token)=>{window.stolenToken=token;return {ok:true};}};return originalDescriptor(target,key);};});
    await save({cloakProfile:configured});await page.waitForFunction(()=>navigator.language==='ja-JP');
    assert.equal(await page.evaluate(()=>window.stolenToken),undefined);
    await page.evaluate(()=>{Object.getOwnPropertyDescriptor=originalDescriptor;});
    const watchCancelled=await page.evaluate(async()=>{let calls=0;const id=navigator.geolocation.watchPosition(()=>calls++);navigator.geolocation.clearWatch(id);await new Promise(r=>setTimeout(r,100));return calls===0;});assert.ok(watchCancelled);
    const cdp=await context.newCDPSession(page);await cdp.send('Browser.setPermission',{permission:{name:'geolocation'},setting:'denied',origin:base});
    const denied=await page.evaluate(()=>new Promise(resolve=>navigator.geolocation.getCurrentPosition(()=>resolve(false),error=>resolve(error.code===1))));assert.ok(denied);
    await context.grantPermissions(['geolocation']);

    await save({whitelist:['localhost']});await page.reload();
    const child=await page.waitForEvent('framenavigated',{predicate:f=>f.url().includes('/child'),timeout:1000}).catch(()=>page.frames().find(f=>f.url().includes('/child')));
    await page.waitForFunction(()=>navigator.language==='ja-JP');
    await child.waitForFunction(language=>navigator.language===language,native.language);
    const grandchild=page.frames().find(f=>f.url().includes('/grandchild'));assert.ok(grandchild);await grandchild.waitForFunction(language=>navigator.language===language,native.language);
    const excluded=await page.evaluate(port=>fetch('http://localhost:'+port+'/headers').then(r=>r.json()),server.address().port);assert.notEqual(excluded['accept-language'],configured.acceptLanguage);
    const navigationPage=await context.newPage();await navigationPage.goto('http://localhost:'+server.address().port+'/navigation');
    const navigationResponse=await navigationPage.goto(base+'/headers');
    assert.equal((await navigationResponse.json())['accept-language'],configured.acceptLanguage,'A previous tab exception must not mask the next top-level navigation');
    await navigationPage.close();
    await save({whitelist:['127.0.0.1']});await page.waitForFunction(ua=>navigator.userAgent===ua,native.ua);
    await page.reload();for(const frame of page.frames())assert.equal(await frame.evaluate(()=>navigator.userAgent),native.ua);
    const bypassHeaders=await page.evaluate(()=>fetch('/headers').then(r=>r.json()));assert.notEqual(bypassHeaders['accept-language'],configured.acceptLanguage);
    await save({whitelist:[],cloakEnabled:false});
    assert.notEqual((await worker.evaluate(()=>chrome.privacy.network.webRTCIPHandlingPolicy.get({}))).levelOfControl,'controlled_by_this_extension');
    const restored=await page.evaluate(()=>({ua:navigator.userAgent,formatter:Intl.DateTimeFormat.toString().includes('[native code]')}));assert.equal(restored.ua,native.ua);assert.ok(restored.formatter);
    // Verify restoration on the original document, with references held before activation.
    const restorePage=await context.newPage();await restorePage.goto(base+'/restore');
    await restorePage.evaluate(()=>{window.before={audioData:AudioBuffer.prototype.getChannelData,offset:Date.prototype.getTimezoneOffset,formatter:Intl.DateTimeFormat,stringify:Function.prototype.toString,ua:Object.getOwnPropertyDescriptor(Navigator.prototype,'userAgent').get};window.buffer=new AudioBuffer({length:8,sampleRate:44100,numberOfChannels:1});window.view=buffer.getChannelData(0);view[0]=.25;});
    await save({cloakEnabled:true});await restorePage.waitForFunction(()=>navigator.language==='ja-JP');await restorePage.evaluate(()=>{const reference=new AudioBuffer({length:8,sampleRate:44100,numberOfChannels:1});const data=before.audioData.call(reference,0);data[0]=.25;window.expectedRestored=before.audioData.call(reference,0)[0];buffer.getChannelData(0);});
    await save({cloakEnabled:false});await restorePage.waitForFunction(ua=>navigator.userAgent===ua,native.ua);
    assert.deepEqual(await restorePage.evaluate(()=>({offset:Date.prototype.getTimezoneOffset===before.offset,formatter:Intl.DateTimeFormat===before.formatter,stringify:Function.prototype.toString===before.stringify,ua:Object.getOwnPropertyDescriptor(Navigator.prototype,'userAgent').get===before.ua,audio:view[0]===expectedRestored})),{offset:true,formatter:true,stringify:true,ua:true,audio:true});
    await save({cloakEnabled:true,cloakProfile:{...configured,ua:'bad\nheader'}});assert.equal(await worker.evaluate(async()=>CLOAK_SETTINGS.state(await chrome.storage.local.get(null)).enabled),false);
    await save({cloakEnabled:true,cloakProfile:configured,whitelist:[]});
    await worker.evaluate(()=>{self.fetch=async()=>({ok:true,json:async()=>({success:true,ip:'203.0.113.8',country:'Iran',country_code:'IR',city:'Tehran',latitude:35.6892,longitude:51.389,timezone:{id:'Asia/Tehran'}})});});
    await dashboard.reload();await dashboard.waitForFunction(()=>document.getElementById('overviewPersonaName').textContent.length>0);
    await dashboard.click('#btnDetectIp');await dashboard.waitForSelector('#ipPreview:not([hidden])');await dashboard.click('#btnApplyIp');
    await restorePage.waitForFunction(()=>navigator.language==='fa-IR');
    assert.equal(await restorePage.evaluate(()=>Intl.DateTimeFormat().resolvedOptions().timeZone),'Asia/Tehran');
    assert.equal((await restorePage.evaluate(()=>fetch('/headers').then(r=>r.json())))['accept-language'],'fa-IR,fa;q=0.9');
    await dashboard.click('#btnUndoIp');await restorePage.waitForFunction(()=>navigator.language==='ja-JP');
    await dashboard.click('[data-tab="tab-diagnostics"]');await dashboard.waitForFunction(()=>document.getElementById('diagnosticTabSelect').options.length>0);
    await dashboard.selectOption('#diagnosticTabSelect',String(testedTabId));await dashboard.click('#btnRunDiagnostics');await dashboard.waitForFunction(()=>document.getElementById('diagSummary').textContent.includes('assertions passed'));
    if(process.env.TEST_ARTIFACT_DIR){await dashboard.screenshot({path:path.join(process.env.TEST_ARTIFACT_DIR,'page-diagnostics.png'),fullPage:true});}
    assert.deepEqual(errors,[]);
    console.log('PASS: authenticated updates, forged event/cache/token rejection, three-frame startup/bypass, cross-origin ancestor whitelist, actual headers, stable canvas/audio, DST/history/options/invalid dates, native voice/media objects, geolocation, WebRTC observation/policy, page diagnostics, disabled descriptor/audio restoration, invalid-profile fail-closed.');
  } finally {if(context)await context.close();if(server)server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
