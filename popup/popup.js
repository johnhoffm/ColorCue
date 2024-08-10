function handleToggles() {
  const toggleExtension = document.getElementById('toggleExtension')
  const toggleImages = document.getElementById('toggleImages')

  async function initToggles() {
    let storage = await browser.storage.local.get();
    toggleExtension.checked = storage.extensionEnabled || false;
    toggleImages.checked = storage.imagesEnabled || false;

    // when toggleExtension is false, toggleImages is disabled
    if (!toggleExtension.checked) {
      toggleImages.checked = false;
      toggleImages.disabled = true;
    } else {
      toggleImages.disabled = false;
    }
  }

  initToggles();

  toggleExtension.addEventListener('change', async function () {
    let isEnabled = toggleExtension.checked
    let tabs = await browser.tabs.query({ active: true, currentWindow: true })
    if (!isEnabled) {
      toggleImages.checked = false;
      toggleImages.disabled = true;
      await browser.storage.local.set({ imagesEnabled: false })
    } else {
      toggleImages.checked = false;
      toggleImages.disabled = false;
    }

    await browser.storage.local.set({ extensionEnabled: isEnabled });
    browser.tabs.sendMessage(tabs[0].id, { action: 'enableFilter', extensionEnabled: isEnabled })
  })

  toggleImages.addEventListener('change', async function () {
    if (toggleExtension.checked) {
      let isEnabled = toggleImages.checked
      let tabs = await browser.tabs.query({ active: true, currentWindow: true })

      await browser.storage.local.set({ imagesEnabled: isEnabled });
      browser.tabs.sendMessage(tabs[0].id, { action: 'enableImageFilter', imagesEnabled: isEnabled })
    }
  })
}

function handleSelect() {
  let type = document.getElementById('type');

  async function initSelect() {
    let storage = await browser.storage.local.get();
    type.value = storage.type || "Deuteranopia";
  }

  initSelect();

  type.addEventListener('change', async function () {
    let value = type.value;
    let tabs = await browser.tabs.query({ active: true, currentWindow: true })

    await browser.storage.local.set({ type: value });
    browser.tabs.sendMessage(tabs[0].id, { action: 'changeType', type: value })
  })

}

document.addEventListener('DOMContentLoaded', handleToggles)
document.addEventListener('DOMContentLoaded', handleSelect)