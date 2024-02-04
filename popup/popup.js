// ===== disable toggleImages when toggleFilter is unchecked
function handleToggle() {
  var toggleExtension = document.getElementById('toggleExtension');
  var toggleImages = document.getElementById('toggleImages');

  toggleExtension.addEventListener('change', function () {
    if (!toggleExtension.checked) {
      // If toggleExtension is unchecked, set toggleImages to unchecked and disabled
      toggleImages.checked = false;
      toggleImages.disabled = true;
    } else {
      // If toggleExtension is checked, enable toggleImages
      toggleImages.disabled = false;
    }
  });
}

document.addEventListener('DOMContentLoaded', handleToggle)

// ===== send message to context script on enable/disable filters
function handleEnableDisable() {
  const toggle = document.getElementById('toggleExtension')

  browser.storage.local.get().then((item) => {
    toggle.checked = item.enabled || false;
  })

  toggle.addEventListener('change', async function () {
    let isEnabled = toggle.checked
    let tabs = await browser.tabs.query({ active: true, currentWindow: true })
    browser.storage.local.set({ enabled: isEnabled })
    browser.tabs.sendMessage(tabs[0].id, { enabled: isEnabled })
  })

}

document.addEventListener('DOMContentLoaded', handleEnableDisable)