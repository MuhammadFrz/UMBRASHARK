/** The page never supplies profile data. The worker validates the sender and reads storage. */
(function() {
  function refresh() {
    chrome.runtime.sendMessage({ type: 'REFRESH_ENGINE' }).catch(() => {
      // Navigation or extension reload can invalidate this document's context.
    });
  }
  refresh();
  window.addEventListener('pageshow', event => { if (event.persisted) refresh(); });
  chrome.storage.onChanged.addListener((changes, area) => { if (area === 'local') refresh(); });
})();
