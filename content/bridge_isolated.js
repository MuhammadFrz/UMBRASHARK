/** The page never supplies profile data. The worker validates the sender and reads storage. */
(function() {
  if (typeof globalThis.__umbraBridgeCleanup === 'function') {
    try { globalThis.__umbraBridgeCleanup(); } catch (e) {}
  }
  function refresh() {
    chrome.runtime.sendMessage({ type: 'REFRESH_ENGINE' }).catch(() => {
      // Navigation or extension reload can invalidate this document's context.
    });
  }
  refresh();
  const onShow = event => { if (event.persisted) refresh(); };
  const onChange = (changes, area) => { if (area === 'local') refresh(); };
  window.addEventListener('pageshow', onShow);
  chrome.storage.onChanged.addListener(onChange);
  globalThis.__umbraBridgeCleanup = () => {
    window.removeEventListener('pageshow', onShow);
    chrome.storage.onChanged.removeListener(onChange);
  };
})();
