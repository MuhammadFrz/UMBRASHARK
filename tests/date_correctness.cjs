const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {installStealthEngine}=require('../content/stealth_injected.js');
const profile=require('../data/profiles.js').DEFAULT_PROFILE;
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||undefined,headless:true});
 try{
  const context=await browser.newContext();const reference=await context.newPage(),subject=await context.newPage();
  const nativeSession=await context.newCDPSession(reference),subjectSession=await context.newCDPSession(subject);
  await subjectSession.send('Emulation.setTimezoneOverride',{timezoneId:'UTC'});
  await subject.evaluate(installStealthEngineSource=>{(0,eval)(installStealthEngineSource);},installStealthEngine.toString());
  // The production path uses scripting.executeScript; this harness isolates Date behavior only.
  await subject.evaluate(({settings})=>installStealthEngine(settings,'__date_test','date-test-token'),{settings:{...profile,enabled:true,canvasNoise:false,audioNoise:false}});
  function cases(){
   const values=[];
   function read(label,task){try{const value=task();values.push({label,value:typeof value==='number'&&Number.isNaN(value)?'NaN':value});}catch(error){values.push({label,error:error.name});}}
   const components=[[2026,0,20,12,34,56,789],[2026,2,8,2,30],[2026,10,1,1,30],[2026,9,4,2,15],[2011,11,30,12],[99,0,1],[0,0,1],[2026,-1,0,25,61],[2026,0,1,undefined],[NaN,0,1],[-1,0,1]];
   for(const args of components)read('construct '+JSON.stringify(args),()=>new Date(...args).getTime());
   for(const source of ['2026-01-20','2026-01','2026','2026-03-08T02:30:00','2026-11-01T01:30:00','2011-12-30T12:00:00','2026-01-20T12:00:00.123','2026-01-20T12:00:00Z','2026-01-20T12:00:00+03:30','2026-01-20T24:00:00','Jan 20 2026 12:30:00','01/20/2026 12:30','Tue, 20 Jan 2026 12:30:00 GMT','not a date','2026-13-01T00:00:00']){
    read('parse '+source,()=>Date.parse(source));read('string constructor '+source,()=>new Date(source).getTime());
   }
   for(const source of ['2026-03-08T06:30:00Z','2026-11-01T06:30:00Z','2026-01-31T12:34:56.789Z','1950-01-01T00:00:00Z','1800-01-01T00:00:00Z']){
    for(const [setter,args] of [['setFullYear',[2027]],['setFullYear',[99,1,28]],['setYear',[99.9]],['setMonth',[2]],['setMonth',[1,31]],['setDate',[0]],['setHours',[2,30]],['setMinutes',[90]],['setSeconds',[-1]],['setMilliseconds',[1500]],['setHours',[]],['setDate',[undefined]]]){
     read(source+' '+setter+JSON.stringify(args),()=>{const date=new Date(source);const result=date[setter](...args);return [Number.isNaN(result)?'NaN':result,Number.isNaN(date.getTime())?'NaN':date.toISOString()];});
    }
    read(source+' display',()=>{const date=new Date(source);return [date.toString().replace(/ \(.*\)$/, ''),date.toDateString(),date.toTimeString().replace(/ \(.*\)$/, ''),date.getTimezoneOffset(),date.getFullYear(),date.getMonth(),date.getDate(),date.getDay(),date.getHours(),date.getMinutes(),date.getSeconds()];});
   }
   for(const setter of ['setFullYear','setYear','setMonth','setDate','setHours','setMinutes','setSeconds','setMilliseconds'])read('invalid '+setter,()=>{const date=new Date(NaN);return date[setter](2020);});
   read('date clone',()=>new Date(new Date(12345)).getTime());
   read('one numeric argument',()=>new Date(2026).getTime());
   read('invalid undefined',()=>new Date(undefined).toString());
   read('symbol constructor',()=>new Date(Symbol()).getTime());
   read('bigint constructor',()=>new Date(1n).getTime());
   read('symbol parse',()=>Date.parse(Symbol()));
   read('valueOf constructor',()=>new Date({valueOf(){return 12345;}}).getTime());
   read('primitive string',()=>new Date({[Symbol.toPrimitive](){return '2026-03-08T02:30:00';}}).getTime());
   read('subclass',()=>{class LocalDate extends Date{}const date=new LocalDate(2026,0,1);return [date.getTime(),date instanceof LocalDate,date instanceof Date,date.constructor===LocalDate];});
   read('Date prototype constructor',()=>new Date(0).constructor===Date);
   return values;
  }
  let total=0;
  for(const zone of ['America/New_York','Europe/Berlin','Asia/Tehran','Asia/Kathmandu','Australia/Lord_Howe','Pacific/Apia','UTC']){
   await nativeSession.send('Emulation.setTimezoneOverride',{timezoneId:zone});
   await subject.evaluate(settings=>window.__date_test('date-test-token',settings),{...profile,timezone:zone,enabled:true,canvasNoise:false,audioNoise:false});
   const expected=await reference.evaluate(cases),actual=await subject.evaluate(cases);
   for(let i=0;i<expected.length;i++)assert.deepEqual(actual[i],expected[i],zone+' '+expected[i].label);
   total+=expected.length;
  }
  console.log('PASS: '+total+' functional Date comparisons against native browser timezone emulation across seven zones, including DST gaps/folds, half-hour DST, skipped days, constructors, parsing, setters, history, invalid values and subclasses.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
