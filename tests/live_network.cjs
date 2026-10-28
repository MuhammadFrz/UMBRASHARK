/** Optional live smoke test: contacts ipwho.is once and Google's public STUN server. */
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const http=require('node:http');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 let context,server;
 try{
  const root=path.resolve(__dirname,'..');
  context=await chromium.launchPersistentContext(fs.mkdtempSync(path.join(os.tmpdir(),'umbra-live-')),{
   executablePath:process.env.BROWSER_EXECUTABLE||undefined,headless:true,ignoreDefaultArgs:['--disable-extensions'],args:['--disable-extensions-except='+root,'--load-extension='+root]
  });
  const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker',{timeout:15000});
  await worker.evaluate(async()=>{for(let n=0;n<200;n++){if((await chrome.storage.local.get('cloakProfile')).cloakProfile)return;await new Promise(r=>setTimeout(r,20));}throw Error('Initialization failed');});
  const id=new URL(worker.url()).host,page=await context.newPage();
  await page.goto('chrome-extension://'+id+'/ui/dashboard.html');
  await page.waitForFunction(()=>document.getElementById('overviewPersonaName').textContent.length>0);
  const before=await worker.evaluate(async()=>(await chrome.storage.local.get('cloakProfile')).cloakProfile);
  await page.click('#btnDetectIp');await page.waitForFunction(()=>['success','error'].includes(document.getElementById('ipStatus').dataset.state),{timeout:20000});
  const status=await page.getAttribute('#ipStatus','data-state');
  if(status!=='success')throw Error('Live provider check failed: '+await page.textContent('#ipStatus'));
  assert.deepEqual(await worker.evaluate(async()=>(await chrome.storage.local.get('cloakProfile')).cloakProfile),before,'Detection must not save settings');
  const timezone=(await page.textContent('#ipTimezone')).split(' · ')[0],locale=await page.textContent('#ipLanguage');
  await page.click('#btnApplyIp');await page.waitForFunction(()=>document.getElementById('ipStatus').textContent.startsWith('Profile aligned'));
  const saved=await worker.evaluate(async()=>(await chrome.storage.local.get('cloakProfile')).cloakProfile);
  assert.equal(saved.timezone,timezone);assert.equal(saved.locale,locale);
  await page.click('#btnUndoIp');await page.waitForFunction(()=>document.getElementById('ipStatus').textContent.startsWith('Previous profile restored'));
  assert.deepEqual(await worker.evaluate(async()=>(await chrome.storage.local.get('cloakProfile')).cloakProfile),before);
  server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>WebRTC smoke test</title>');});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const icePage=await context.newPage();await icePage.goto('http://127.0.0.1:'+server.address().port);
  const rtc=await icePage.evaluate(async()=>{
   const pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'}]}),candidates=[];
   pc.onicecandidate=e=>{if(e.candidate)candidates.push({type:e.candidate.type,address:e.candidate.address});};
   try{
    pc.createDataChannel('network-check');await pc.setLocalDescription(await pc.createOffer());
    await new Promise(resolve=>{const timer=setTimeout(resolve,6500);pc.onicegatheringstatechange=()=>{if(pc.iceGatheringState==='complete'){clearTimeout(timer);resolve();}};});
    const privateAddress=address=>{
     if(!address)return false;
     if(address.includes(':'))return /^(?:fc|fd|fe8|fe9|fea|feb)/i.test(address)||address==='::1';
     if(!/^\d+\.\d+\.\d+\.\d+$/.test(address))return false;
     const [a,b]=address.split('.').map(Number);return a===10||a===127||a===192&&b===168||a===172&&b>=16&&b<=31||a===169&&b===254;
    };
    return {candidateCount:candidates.length,types:[...new Set(candidates.map(c=>c.type))],privateLiteralObserved:candidates.some(c=>privateAddress(c.address)),serverReflexiveObserved:candidates.some(c=>c.type==='srflx')};
   }finally{pc.close();}
  });
  const policy=await worker.evaluate(()=>chrome.privacy.network.webRTCIPHandlingPolicy.get({}));
  assert.equal(policy.value,'disable_non_proxied_udp');assert.equal(rtc.privateLiteralObserved,false,'Strict policy must not expose a private ICE address in this live check');
  console.log(JSON.stringify({liveIpLookup:'passed',previewApplyUndo:'passed',webRtcPolicy:policy.value,externalIce:rtc}));
  if(process.env.TEST_ARTIFACT_DIR)fs.writeFileSync(path.join(process.env.TEST_ARTIFACT_DIR,'live-network-check.json'),JSON.stringify({liveIpLookup:'passed',previewApplyUndo:'passed',webRtcPolicy:policy.value,externalIce:rtc},null,2));
 }finally{if(context)await context.close();if(server)server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
