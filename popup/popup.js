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
  const toggleExtension = document.getElementById('toggleExtension')
  const toggleImages = document.getElementById('toggleImages')

  browser.storage.local.get().then((item) => {
    toggleExtension.checked = item.enabled || false;
    toggleImages.checked = item.images || false;
    if (item.enabled) {
      toggleImages.disabled = false
    }
  })

  toggleExtension.addEventListener('change', async function () {
    let isEnabled = toggleExtension.checked
    let tabs = await browser.tabs.query({ active: true, currentWindow: true })
    browser.storage.local.set({ enabled: isEnabled })
    if (!isEnabled) {
      browser.storage.local.set({ images: false })
    }
    browser.tabs.sendMessage(tabs[0].id, { enabled: isEnabled })
  })

  toggleImages.addEventListener('change', async function() {
    let isEnabled = toggleImages.checked
    let tabs = await browser.tabs.query({ active: true, currentWindow: true })
    browser.storage.local.set({ images: isEnabled })
    browser.tabs.sendMessage(tabs[0].id, { images: isEnabled })
  })

}

document.addEventListener('DOMContentLoaded', handleEnableDisable)