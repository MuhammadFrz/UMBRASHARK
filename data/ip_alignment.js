/** Shared IP-location validation and profile alignment. No network or storage side effects. */
(function(root) {
  'use strict';

  function timezoneDetails(timezone, date = new Date()) {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone, year: 'numeric', era: 'short', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
    });
    const parts = Object.fromEntries(formatter.formatToParts(date).map(p => [p.type, p.value]));
    const wall = new Date(0);
    wall.setUTCFullYear(parts.era === 'BC' ? 1 - Number(parts.year) : Number(parts.year), +parts.month - 1, +parts.day);
    wall.setUTCHours(+parts.hour, +parts.minute, +parts.second, 0);
    const offset = (Math.floor(date.getTime() / 1000) * 1000 - wall.getTime()) / 60000;
    const abbr = new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'short' })
      .formatToParts(date).find(p => p.type === 'timeZoneName').value;
    return { offset, abbr };
  }

  function normalizeLookup(data) {
    if (!data || data.success !== true) throw new Error('The location provider could not locate this connection.');
    const string = (value, max = 100) => typeof value === 'string' && value.length <= max ? value.trim() : '';
    const countryCode = string(data.country_code, 2).toUpperCase();
    const timezone = string(data.timezone && data.timezone.id);
    const ip = string(data.ip, 45);
    if (!/^[A-Z]{2}$/.test(countryCode) || !string(data.country) || !timezone ||
        !/^[\da-f:.]+$/i.test(ip) ||
        typeof data.latitude !== 'number' || !Number.isFinite(data.latitude) || Math.abs(data.latitude) > 90 ||
        typeof data.longitude !== 'number' || !Number.isFinite(data.longitude) || Math.abs(data.longitude) > 180) {
      throw new Error('The location provider returned incomplete or invalid data. No settings were changed.');
    }
    try { timezoneDetails(timezone); } catch (e) {
      throw new Error('This browser does not recognize the detected timezone. No settings were changed.');
    }
    const locale = new Intl.Locale('und-' + countryCode).maximize();
    const suggestedLocale = locale.language + '-' + countryCode;
    return {
      ip, countryCode, country: string(data.country), city: string(data.city),
      timezone, lat: data.latitude, lon: data.longitude, suggestedLocale,
      detectedAt: Date.now()
    };
  }

  function alignProfile(profile, location, matchLanguage, date = new Date()) {
    const { offset, abbr } = timezoneDetails(location.timezone, date);
    const next = Object.assign({}, profile, {
      id: 'ip-aligned', name: location.country + ' · IP-aligned profile',
      timezone: location.timezone, offset, timezoneAbbr: abbr,
      lat: location.lat, lon: location.lon
    });
    if (matchLanguage) {
      const locale = location.suggestedLocale;
      const language = new Intl.Locale(locale).language;
      next.locale = locale;
      next.languages = [locale, language];
      next.acceptLanguage = locale + ',' + language + ';q=0.9';
    }
    return next;
  }

  const api = { timezoneDetails, normalizeLookup, alignProfile };
  root.IP_ALIGNMENT = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
