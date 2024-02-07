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
async function handleEnableDisable() {
  const toggleExtension = document.getElementById('toggleExtension')
  const toggleImages = document.getElementById('toggleImages')

  storage = await browser.storage.local.get()
  if (storage.result !== undefined) {
    toggleExtension.checked = storage.enabled || false;
    toggleImages.checked = storage.images || false;
    if (storage.enabled) {
      toggleImages.disabled = false
    }
  } else {
    const takeTestLink = document.getElementById('take-test-link')
    toggleExtension.disabled = true
    toggleImages.disabled = true
    takeTestLink.style.display = 'block'
  }

  toggleExtension.addEventListener('change', async function () {
    let isEnabled = toggleExtension.checked
    let tabs = await browser.tabs.query({ active: true, currentWindow: true })
    browser.storage.local.set({ enabled: isEnabled })
    if (!isEnabled) {
      browser.storage.local.set({ images: false })
    }
    browser.tabs.sendMessage(tabs[0].id, { action: 'enableFilter', enabled: isEnabled })
  })

  toggleImages.addEventListener('change', async function () {
    let isEnabled = toggleImages.checked
    let tabs = await browser.tabs.query({ active: true, currentWindow: true })
    browser.storage.local.set({ images: isEnabled })
    browser.tabs.sendMessage(tabs[0].id, { action: 'enableImageFilter', images: isEnabled })
  })

}

document.addEventListener('DOMContentLoaded', handleEnableDisable)