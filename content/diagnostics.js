/** Runs in a selected ordinary page or frame, never in the dashboard. */
async function runPageDiagnostics(expected) {
  const checks = [];
  const check = async (name, expectation, task) => {
    try {
      const result = await task();
      checks.push({ name, expectation, observed: result.observed, status: result.status || (result.pass ? 'pass' : 'fail') });
    } catch (error) { checks.push({ name, expectation, observed: error.name + ': ' + error.message, status: 'fail' }); }
  };
  await check('Configured identity', expected.enabled ? 'Page values match the saved profile' : 'Overrides disabled for this frame', () => ({
    pass: !expected.enabled || navigator.userAgent === expected.ua && navigator.language === expected.locale && JSON.stringify(navigator.languages) === JSON.stringify(expected.languages),
    observed: expected.enabled ? navigator.language + ' · ' + navigator.platform : 'Bypass: configured identity comparison skipped'
  }));
  await check('Timezone', 'Formatter output and date offset agree', () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const date = new Date();
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(date).map(p=>[p.type,p.value]));
    const offset = Math.round((Math.floor(date.getTime()/1000)*1000-Date.UTC(+parts.year,+parts.month-1,+parts.day,+parts.hour,+parts.minute,+parts.second))/60000);
    return { pass: date.getTimezoneOffset() === offset && (!expected.enabled || timezone === expected.timezone), observed: timezone + ' · offset ' + date.getTimezoneOffset() + ' min' };
  });
  await check('Explicit timezone options', 'Explicit UTC is preserved', () => ({
    pass: new Intl.DateTimeFormat('en-US', {timeZone:'UTC'}).resolvedOptions().timeZone === 'UTC', observed: new Intl.DateTimeFormat('en-US', {timeZone:'UTC'}).resolvedOptions().timeZone
  }));
  await check('Invalid dates', 'Invalid Date and NaN are preserved', () => ({
    pass: new Date(NaN).toString() === 'Invalid Date' && Number.isNaN(new Date(NaN).getTimezoneOffset()), observed: new Date(NaN).toString()
  }));
  await check('Repeated canvas export', 'Same object stays stable; source pixels do not change', () => {
    const canvas = document.createElement('canvas'); canvas.width=64; canvas.height=64;
    const ctx=canvas.getContext('2d'); ctx.fillStyle='#265b72'; ctx.fillRect(0,0,64,64);
    const before=Array.from(ctx.getImageData(0,0,64,64).data);
    const a=canvas.toDataURL(), b=canvas.toDataURL(), c=canvas.toDataURL();
    const after=ctx.getImageData(0,0,64,64).data;
    const unchanged=before.every((v,i)=>v===after[i]);
    return {pass:a===b&&b===c&&unchanged,observed:'Repeated exports '+(a===b&&b===c?'stable':'differ')+'; source '+(unchanged?'unchanged':'modified')};
  });
  await check('Repeated audio reads', 'Same channel stays stable and retains writable view behavior', () => {
    const buffer=new AudioBuffer({length:64,sampleRate:44100,numberOfChannels:1});
    buffer.getChannelData(0)[0]=.25;
    const a=buffer.getChannelData(0), first=a[0], second=buffer.getChannelData(0)[0], third=buffer.getChannelData(0)[0];
    a[1]=.5; const copied=new Float32Array(2); buffer.copyFromChannel(copied,0);
    const reference=new AudioBuffer({length:64,sampleRate:44100,numberOfChannels:1});
    reference.copyToChannel(new Float32Array([0,.5]),0);
    const nativeCopy=new Float32Array(2);reference.copyFromChannel(nativeCopy,0);
    return {pass:first===second&&second===third&&copied[1]===nativeCopy[1]&&a[1]===.5,observed:first===second&&second===third?'Stable reads; writable view matches native copy behavior':'Sample changed on repeated reads'};
  });
  await check('Media device objects', 'Native device objects; no fixed mock list', async () => {
    if(!navigator.mediaDevices) return {status:'skip',observed:'API unavailable in this frame'};
    const devices=await navigator.mediaDevices.enumerateDevices();
    return {pass:devices.every(d=>d instanceof MediaDeviceInfo),observed:devices.length+' native devices (permissions affect visibility)'};
  });
  await check('Speech voice objects', 'Native SpeechSynthesisVoice objects', () => {
    if(!window.speechSynthesis) return {status:'skip',observed:'Speech API unavailable'};
    const voices=speechSynthesis.getVoices();
    return {pass:voices.every(v=>v instanceof SpeechSynthesisVoice),observed:voices.length+' native voices; an empty list may load later'};
  });
  await check('WebRTC local candidates', 'Observation only; no public-IP concealment claim', async () => {
    if(!window.RTCPeerConnection) return {status:'skip',observed:'WebRTC unavailable'};
    const pc=new RTCPeerConnection({iceServers:[]}); const candidates=[];
    try {
      pc.onicecandidate=e=>{if(e.candidate)candidates.push(e.candidate.candidate);};
      pc.createDataChannel('diagnostic'); await pc.setLocalDescription(await pc.createOffer());
      await new Promise(resolve=>{const timer=setTimeout(resolve,1600);pc.onicegatheringstatechange=()=>{if(pc.iceGatheringState==='complete'){clearTimeout(timer);resolve();}};});
      return {status:'info',observed:candidates.length?candidates.join('\n'):'No local candidates observed. No external STUN server was queried.'};
    } finally {pc.close();}
  });
  return {checks};
}
if(typeof module!=='undefined'&&module.exports) module.exports={runPageDiagnostics};
