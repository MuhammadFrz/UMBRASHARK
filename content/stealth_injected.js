/** Installed only by chrome.scripting with settings from the service worker. */
function installStealthEngine(initialState, controlKey, controlToken) {
  'use strict';
  const define = Object.defineProperty;
  const descriptor = Object.getOwnPropertyDescriptor;
  const existing = window[controlKey];
  if (typeof existing === 'function') return existing(controlToken, initialState);
  let state = initialState;
  const active = () => state.enabled === true && state.whitelisted !== true;
  const patches = [];
  const nativeDateTimeFormat = Intl.DateTimeFormat;
  const NativeDate = Date;
  const nativeParse = Date.parse;
  const nativeUTC = Date.UTC;
  const nativeSetTime = Date.prototype.setTime;
  const nativeGetTime = Date.prototype.getTime;
  const nativeToString = Function.prototype.toString;
  const functions = new WeakMap();
  const audioBuffers = new Set();
  const audioSamples = new WeakMap();

  function nativeLooking(fn, name) {
    functions.set(fn, `function ${name}() { [native code] }`);
    return fn;
  }
  function patch(object, key, replacement) {
    const original = descriptor(object, key);
    if (!original || !original.configurable) return;
    patches.push({ object, key, original, replacement: Object.assign({}, original, replacement) });
  }
  function method(object, key, factory) {
    const original = object && descriptor(object, key);
    if (original && typeof original.value === 'function') patch(object, key, { value: nativeLooking(factory(original.value), key) });
  }
  function getter(proto, key, value) {
    const original = descriptor(proto, key);
    if (!original || !original.get) return;
    patch(proto, key, { get: nativeLooking(function() {
      // Delegate first to retain native receiver validation.
      const nativeValue = original.get.call(this);
      return active() ? value(nativeValue) : nativeValue;
    }, 'get ' + key) });
  }

  method(Function.prototype, 'toString', () => function toString() {
    return functions.get(this) || nativeToString.call(this);
  });
  for (const [key, field] of Object.entries({
    userAgent: 'ua', platform: 'platform', language: 'locale',
    hardwareConcurrency: 'cores', deviceMemory: 'memory'
  })) getter(Navigator.prototype, key, () => state[field]);
  getter(Navigator.prototype, 'appVersion', () => state.ua.replace(/^Mozilla\//, ''));
  getter(Navigator.prototype, 'languages', () => Object.freeze([...state.languages]));

  const uaData = navigator.userAgentData;
  if (uaData) {
    const hints = data => {
      if (!active()) return data;
      const values = {
        brands: state.brands, mobile: false, platform: state.chPlatform,
        platformVersion: state.chPlatformVersion, architecture: state.architecture,
        bitness: state.bitness, model: '',
        fullVersionList: state.brands.map(b => ({ brand: b.brand, version: b.brand === 'Chromium' || /Chrome|Edge|Brave/.test(b.brand)
          ? (state.ua.match(/(?:Chrome|Edg)\/([\d.]+)/) || [0, b.version + '.0.0.0'])[1] : b.version + '.0.0.0' }))
      };
      return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, active() && values[key] !== undefined ? structuredClone(values[key]) : value]));
    };
    const proxy = new Proxy(uaData, { get(target, key) {
      if (key === 'getHighEntropyValues') return function getHighEntropyValues(requested) {
        return target.getHighEntropyValues(requested).then(hints);
      };
      if (key === 'toJSON') return () => hints(target.toJSON());
      if (active() && key === 'brands') return structuredClone(state.brands);
      if (active() && key === 'mobile') return false;
      if (active() && key === 'platform') return state.chPlatform;
      const value = Reflect.get(target, key, target);
      return typeof value === 'function' ? value.bind(target) : value;
    }});
    getter(Navigator.prototype, 'userAgentData', () => proxy);
  }
  for (const [key, field] of Object.entries({ width: 'screenWidth', height: 'screenHeight',
    availWidth: 'availWidth', availHeight: 'availHeight', colorDepth: 'colorDepth', pixelDepth: 'colorDepth' })) {
    getter(Screen.prototype, key, () => state[field]);
  }
  const dpr = descriptor(window, 'devicePixelRatio');
  if (dpr && dpr.get) getter(window, 'devicePixelRatio', () => state.dpr);

  // Real formatters carry the selected timezone; resolvedOptions itself stays native.
  function optionsWithTimezone(options) {
    if (options === null) return null;
    return new Proxy(Object(options), { get(target, key) {
      const value = Reflect.get(target, key);
      return key === 'timeZone' && value === undefined ? state.timezone : value;
    }});
  }
  function formatterArgs(args) {
    return active() ? [args[0] === undefined ? state.locale : args[0], optionsWithTimezone(args[1])] : args;
  }
  const formatterProxy = new Proxy(nativeDateTimeFormat, {
    apply(target, receiver, args) { return Reflect.apply(target, receiver, formatterArgs(args)); },
    construct(target, args, newTarget) { return Reflect.construct(target, formatterArgs(args), newTarget); }
  });
  patch(Intl, 'DateTimeFormat', { value: formatterProxy });

  function dateParts(date) {
    const time = nativeGetTime.call(date);
    if (!Number.isFinite(time)) return null;
    const parts = new nativeDateTimeFormat('en-US-u-ca-gregory-nu-latn', {
      timeZone: state.timezone, year: 'numeric', era: 'short', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short', hourCycle: 'h23', timeZoneName: 'long'
    }).formatToParts(date);
    const p = Object.fromEntries(parts.map(part => [part.type, part.value]));
    const year = p.era === 'BC' ? 1 - Number(p.year) : Number(p.year);
    const wall = new NativeDate(0);
    wall.setUTCFullYear(year, Number(p.month) - 1, Number(p.day));
    wall.setUTCHours(Number(p.hour), Number(p.minute), Number(p.second), 0);
    p.offsetMilliseconds = Math.floor(time / 1000) * 1000 - wall.getTime();
    p.offset = p.offsetMilliseconds / 60000;
    p.yearNumber = year;
    return p;
  }
  method(Date.prototype, 'getTimezoneOffset', original => function getTimezoneOffset() {
    if (!active()) return original.call(this);
    const parts = dateParts(this);
    return parts ? parts.offset : NaN;
  });
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function dateString(date, includeDate, includeTime) {
    const p = dateParts(date);
    if (!p) return 'Invalid Date';
    const year = p.yearNumber < 0 ? '-' + String(-p.yearNumber).padStart(4, '0') : String(p.yearNumber).padStart(4, '0');
    const dateText = `${p.weekday} ${months[Number(p.month) - 1]} ${p.day} ${year}`;
    const offset = Math.abs(Math.trunc(p.offset));
    const timeText = `${p.hour}:${p.minute}:${p.second} GMT${p.offset > 0 ? '-' : '+'}${String(Math.floor(offset / 60)).padStart(2, '0')}${String(offset % 60).padStart(2, '0')} (${p.timeZoneName})`;
    return [includeDate ? dateText : '', includeTime ? timeText : ''].filter(Boolean).join(' ');
  }
  for (const [name, date, time] of [['toString', true, true], ['toDateString', true, false], ['toTimeString', false, true]]) {
    method(Date.prototype, name, original => function() {
      return active() ? dateString(this, date, time) : original.call(this);
    });
  }
  for (const name of ['toLocaleString', 'toLocaleTimeString', 'toLocaleDateString']) {
    method(Date.prototype, name, original => function(locales, options) {
      return !active() ? original.apply(this, arguments)
        : original.call(this, locales === undefined ? state.locale : locales, optionsWithTimezone(options));
    });
  }
  for (const [name, value] of Object.entries({
    getFullYear: p => p.yearNumber, getYear: p => p.yearNumber - 1900,
    getMonth: p => Number(p.month) - 1, getDate: p => Number(p.day), getDay: p => weekdays.indexOf(p.weekday),
    getHours: p => Number(p.hour), getMinutes: p => Number(p.minute), getSeconds: p => Number(p.second)
  })) method(Date.prototype, name, original => function() {
    if (!active()) return original.call(this);
    const p = dateParts(this);
    return p ? value(p) : NaN;
  });

  function wallToEpoch(wall) {
    if (!Number.isFinite(wall)) return NaN;
    const offsets = new Set();
    for (const hours of [-48, -24, 0, 24, 48]) {
      const candidate = new NativeDate(wall + hours * 3600000);
      const p = dateParts(candidate);
      if (p) offsets.add(p.offsetMilliseconds);
    }
    const candidates = [...offsets].map(offset => wall + offset).flatMap(time => {
      const p = dateParts(new NativeDate(time));
      return p ? [{ time, local: time - p.offsetMilliseconds }] : [];
    });
    // Native-compatible disambiguation: earlier instant in a fold; forward in a gap.
    const exact = candidates.filter(candidate => candidate.local === wall);
    if (exact.length) return Math.min(...exact.map(candidate => candidate.time));
    const future = candidates.filter(candidate => candidate.local > wall).sort((a, b) => a.local - b.local);
    return future.length ? future[0].time : NaN;
  }
  function parseLocalDate(value) {
    if (typeof value === 'symbol') return nativeParse(value);
    const text = String(value).trim();
    // ISO date-only forms are UTC. Explicit offsets and recognized zone names stay native.
    if (/^(?:[+-]\d{6}|\d{4})(?:-\d{2}(?:-\d{2})?)?$/.test(text) ||
        /\b(?:GMT|UTC|UT|EST|EDT|CST|CDT|MST|MDT|PST|PDT)\b|z$|[T\s]\d{1,2}:.*[+-]\d{2}(?::?\d{2})?(?:\s|$)/i.test(text)) return nativeParse(text);
    const iso = /^(?:[+-]\d{6}|\d{4})-\d{2}-\d{2}T/i.test(text);
    const wall = nativeParse(text + (iso ? 'Z' : ' UTC'));
    // Legacy parsing is browser-defined; retain native rejection for unsupported syntax.
    return Number.isFinite(wall) ? wallToEpoch(wall) : nativeParse(text);
  }
  function primitive(value) {
    if (value === null || typeof value !== 'object' && typeof value !== 'function') return value;
    const exotic = value[Symbol.toPrimitive];
    if (exotic !== undefined && exotic !== null) {
      if (typeof exotic !== 'function') throw new TypeError('Cannot convert object to primitive value');
      const result = exotic.call(value, 'default');
      if (result === null || typeof result !== 'object' && typeof result !== 'function') return result;
      throw new TypeError('Cannot convert object to primitive value');
    }
    for (const key of ['valueOf', 'toString']) {
      const convert = value[key];
      if (typeof convert !== 'function') continue;
      const result = convert.call(value);
      if (result === null || typeof result !== 'object' && typeof result !== 'function') return result;
    }
    throw new TypeError('Cannot convert object to primitive value');
  }
  const dateProxy = new Proxy(NativeDate, {
    apply(target, receiver, args) {
      return active() ? dateString(new NativeDate(), true, true) : Reflect.apply(target, receiver, args);
    },
    construct(target, args, newTarget) {
      if (!active() || !args.length) return Reflect.construct(target, args, newTarget);
      let time;
      if (args.length > 1) time = wallToEpoch(Reflect.apply(nativeUTC, NativeDate, args));
      else {
        try { time = nativeGetTime.call(args[0]); }
        catch (e) {
          const value = primitive(args[0]);
          if (typeof value !== 'string') return Reflect.construct(target, [value], newTarget);
          time = parseLocalDate(value);
        }
      }
      return Reflect.construct(target, [time], newTarget);
    }
  });
  patch(window, 'Date', { value: dateProxy });
  patch(NativeDate.prototype, 'constructor', { value: dateProxy });
  method(NativeDate, 'parse', original => function parse(value) {
    return active() ? parseLocalDate(value) : original.apply(this, arguments);
  });
  for (const [name, utcName] of Object.entries({
    setFullYear: 'setUTCFullYear', setYear: 'setUTCFullYear', setMonth: 'setUTCMonth', setDate: 'setUTCDate',
    setHours: 'setUTCHours', setMinutes: 'setUTCMinutes', setSeconds: 'setUTCSeconds', setMilliseconds: 'setUTCMilliseconds'
  })) {
    const utcSetter = NativeDate.prototype[utcName];
    method(NativeDate.prototype, name, original => function() {
      if (!active()) return original.apply(this, arguments);
      const time = nativeGetTime.call(this);
      const p = dateParts(this);
      const wall = p ? time - p.offsetMilliseconds : name === 'setFullYear' || name === 'setYear' ? 0 : NaN;
      const local = new NativeDate(wall);
      let args = [...arguments];
      if (name === 'setYear') {
        let year = +args[0];
        const integer = Math.trunc(year);
        if (integer >= 0 && integer <= 99) year = integer + 1900;
        args = [year];
      }
      const changed = utcSetter.apply(local, args);
      const result = wallToEpoch(changed);
      return nativeSetTime.call(this, result);
    });
  }

  if (typeof Geolocation !== 'undefined') {
    function position(nativePosition) {
      if (!active()) return nativePosition;
      const coords = { latitude: state.lat, longitude: state.lon, accuracy: 25000,
        altitude: null, altitudeAccuracy: null, heading: null, speed: null };
      const proxyCoords = new Proxy(nativePosition.coords, { get(target, key) {
        if (key === 'toJSON') return () => Object.assign({}, coords);
        return Object.prototype.hasOwnProperty.call(coords, key) ? coords[key] : Reflect.get(target, key, target);
      }});
      return new Proxy(nativePosition, { get(target, key) {
        if (key === 'coords') return proxyCoords;
        if (key === 'toJSON') return () => ({ coords, timestamp: target.timestamp });
        return Reflect.get(target, key, target);
      }});
    }
    for (const name of ['getCurrentPosition', 'watchPosition']) method(Geolocation.prototype, name, original => function(success, error, options) {
      if (!active() || typeof success !== 'function') return original.apply(this, arguments);
      return original.call(this, value => success(position(value)), error, options);
    });
  }

  for (const constructor of [globalThis.WebGLRenderingContext, globalThis.WebGL2RenderingContext]) {
    if (!constructor) continue;
    method(constructor.prototype, 'getParameter', original => function(param) {
      const result = original.apply(this, arguments);
      if (!active()) return result;
      if (param === 0x9245 && result !== null) return state.gpuVendor;
      if (param === 0x9246 && result !== null) return state.gpuRenderer;
      return result;
    });
  }
  // Voice and media-device APIs remain native. No mock objects or fixed IDs.

  let seed = 0;
  for (const char of location.origin) seed = (Math.imul(seed, 31) + char.charCodeAt(0)) >>> 0;
  if (typeof HTMLCanvasElement !== 'undefined') {
    const getContext = HTMLCanvasElement.prototype.getContext;
    const createElement = Document.prototype.createElement;
    function noisyCopy(canvas) {
      if (!active() || !state.canvasNoise || !canvas.width || !canvas.height) return canvas;
      if (!getContext.call(canvas, '2d')) return canvas;
      const copy = createElement.call(document, 'canvas');
      copy.width = canvas.width; copy.height = canvas.height;
      const ctx = getContext.call(copy, '2d');
      ctx.drawImage(canvas, 0, 0);
      const x = seed % canvas.width, y = (seed >>> 3) % canvas.height;
      const pixel = ctx.getImageData(x, y, 1, 1);
      pixel.data[0] ^= 1;
      ctx.putImageData(pixel, x, y);
      return copy;
    }
    for (const name of ['toDataURL', 'toBlob']) method(HTMLCanvasElement.prototype, name, original => function() {
      let source = this;
      try { source = noisyCopy(this); } catch (e) { /* Native export retains taint and receiver errors. */ }
      return original.apply(source, arguments);
    });
  }
  function restoreAudio() {
    for (const reference of audioBuffers) {
      const buffer = reference.deref();
      if (!buffer) { audioBuffers.delete(reference); continue; }
      const samples = audioSamples.get(buffer);
      for (const sample of samples.values()) {
        if (sample.view.length && Object.is(sample.view[0], sample.noisy)) sample.view[0] = sample.raw;
      }
      samples.clear();
    }
  }
  const nativeAudioData = globalThis.AudioBuffer && AudioBuffer.prototype.getChannelData;
  const nativeChannelCount = globalThis.AudioBuffer && descriptor(AudioBuffer.prototype, 'numberOfChannels').get;
  if (nativeAudioData) method(AudioBuffer.prototype, 'getChannelData', original => function(channel) {
    if (!active() || !state.audioNoise || !arguments.length) return original.apply(this, arguments);
    const count = nativeChannelCount.call(this);
    const index = +channel >>> 0;
    if (index >= count) return original.call(this, index);
    let samples = audioSamples.get(this);
    if (!samples) { samples = new Map(); audioSamples.set(this, samples); audioBuffers.add(new WeakRef(this)); }
    const previous = samples.get(index);
    // Reuse the live native view. Re-entering Brave's native getter can farble it again.
    const data = previous && previous.view.length ? previous.view : original.call(this, index);
    if (!data.length) return data;
    if (previous && Object.is(data[0], previous.noisy)) { previous.view = data; return data; }
    const raw = data[0];
    if (!Number.isFinite(raw)) return data;
    data[0] = raw + ((seed % 97) + 1) * 1e-9;
    samples.set(index, { raw, noisy: data[0], view: data });
    return data;
  });

  function update(token, next) {
    if (token !== controlToken) return { ok: false };
    restoreAudio();
    state = next;
    let failed = 0;
    for (const p of patches) {
      try { define(p.object, p.key, active() ? p.replacement : p.original); } catch (e) { failed++; }
    }
    return { ok: failed === 0, enabled: active(), failed };
  }
  define(globalThis, controlKey, { value: update, writable: false, configurable: false, enumerable: false });
  return update(controlToken, initialState);
}
if (typeof module !== 'undefined' && module.exports) module.exports = { installStealthEngine };
