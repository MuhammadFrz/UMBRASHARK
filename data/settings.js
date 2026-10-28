/** Validation shared by the privileged worker and its tests. */
(function(root) {
  function domain(value) {
    if (typeof value !== 'string' || !value.trim() || /[\s@*?#]/.test(value)) throw new Error('Enter a hostname such as example.com.');
    const url = new URL(value.includes('://') ? value : 'https://' + value);
    if (!['http:', 'https:'].includes(url.protocol) || url.port || url.pathname !== '/' || url.search || url.hash) throw new Error('Use a hostname without a port, path, or query.');
    return url.hostname.toLowerCase().replace(/\.$/, '');
  }
  function matches(host, domains) {
    host = host.toLowerCase().replace(/\.$/, '');
    return domains.some(d => host === d || host.endsWith('.' + d));
  }
  function whitelist(values) {
    return [...new Set((Array.isArray(values) ? values : []).flatMap(value => {
      try { return [domain(value)]; } catch (e) { return []; }
    }))];
  }
  function profile(value) {
    if (!value || typeof value !== 'object') throw new Error('No saved profile.');
    const next = {};
    for (const key of ['id','name','os','ua','platform','chPlatform','chPlatformVersion','architecture','bitness','gpuVendor','gpuRenderer','timezone','locale','acceptLanguage']) {
      if (typeof value[key] !== 'string' || !value[key].trim() || value[key].length > 1024 || /[\r\n\0]/.test(value[key])) throw new Error('Invalid profile field: ' + key);
      next[key] = value[key];
    }
    next.locale = Intl.getCanonicalLocales(next.locale)[0];
    new Intl.DateTimeFormat('en-US', { timeZone: next.timezone });
    if (!Array.isArray(value.languages) || !value.languages.length || value.languages.length > 20) throw new Error('Invalid language list.');
    next.languages = Intl.getCanonicalLocales(value.languages);
    if (next.languages[0] !== next.locale) throw new Error('Primary language and locale must agree.');
    if (!Array.isArray(value.brands) || !value.brands.length || value.brands.length > 10) throw new Error('Invalid browser brands.');
    next.brands = value.brands.map(b => {
      if (!b || typeof b.brand !== 'string' || !/^[\w .\/;)=-]{1,80}$/.test(b.brand) || !/^\d{1,4}$/.test(b.version)) throw new Error('Invalid browser brand.');
      return { brand: b.brand, version: b.version };
    });
    for (const [key, min, max] of [['cores',1,256],['memory',.25,1024],['screenWidth',1,32768],['screenHeight',1,32768],['availWidth',1,32768],['availHeight',1,32768],['dpr',.25,16],['colorDepth',1,64],['lat',-90,90],['lon',-180,180]]) {
      if (typeof value[key] !== 'number' || !Number.isFinite(value[key]) || value[key] < min || value[key] > max) throw new Error('Invalid profile field: ' + key);
      next[key] = value[key];
    }
    if (next.availWidth > next.screenWidth || next.availHeight > next.screenHeight) throw new Error('Available screen dimensions exceed the screen.');
    return next;
  }
  function state(data, hosts = []) {
    const excluded = whitelist(data.whitelist);
    const bypass = hosts.some(host => matches(host, excluded));
    if (data.cloakEnabled === false || bypass) return { enabled: false, whitelisted: bypass };
    try { return Object.assign(profile(data.cloakProfile), { enabled: true, whitelisted: false, canvasNoise: data.canvasNoise !== false, audioNoise: data.audioNoise !== false }); }
    catch (e) { return { enabled: false, whitelisted: false, error: e.message }; }
  }
  const api = { domain, matches, whitelist, profile, state };
  root.CLOAK_SETTINGS = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
