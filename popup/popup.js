document.addEventListener('DOMContentLoaded', async function() {
    const toggle = document.getElementById('toggleExtension');
    const label = document.getElementById('toggleLabel');
  
    let tabs = await browser.tabs.query({active: true, currentWindow: true});
    if (tabs[0] && tabs[0].url) {
        const url = new URL(tabs[0].url);
        const domain = url.hostname;
        label.textContent = `Enable ColorCue on: ${domain}`;
    }
  
    // Get the current tab URL to use as a key for storing the state
    if (!tabs[0]) return;
    const url = new URL(tabs[0].url);
    const domain = url.hostname; // Use the domain as a key for simplicity
  
    // Load the current state from storage based on the current URL/domain
    try {
      let result = await browser.storage.local.get(domain);
      // If the domain is not in storage, default to true (enabled)
      toggle.checked = result[domain] !== undefined ? result[domain] : true;
    } catch (error) {
      console.error(`Error retrieving 'enabled' state from storage for ${domain}: ${error}`);
    }
  
    // Listen for toggle changes to enable/disable the extension
    toggle.addEventListener('change', async function() {
      const enabled = toggle.checked;
      try {
        // Store the enabled state based on the current domain
        await browser.storage.local.set({[domain]: enabled});
        console.log(`Extension enabled state for ${domain} is now: ${enabled}`);
        // Send a message to the content script to enable/disable functionality
        if (tabs[0]) {
          await browser.tabs.sendMessage(tabs[0].id, {enabled: enabled, domain: domain});
        }
      } catch (error) {
        console.error(`Error in setting enabled state or messaging content script for ${domain}: ${error}`);
      }
    });
});


document.getElementById('toggleButton').addEventListener('click', function () {
  browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      browser.tabs.sendMessage(tabs[0].id, { action: 'toggleBlueBlindFilter' });
  });
});