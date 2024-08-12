// ===== initialize settings on installation
async function handleInstalled() {
  await browser.storage.local.set({
    extensionEnabled: true,
    imagesEnabled: true,
    type: "Deuteranopia" // default
  })

  // open extension page on installation
  // browser.tabs.create({
  //   url: "/index.html"
  // })
}

browser.runtime.onInstalled.addListener(handleInstalled)

// ===== initialize context menu for single image adjustment on right click
browser.menus.create(
  {
    id: "colorcue-adjust-single-image",
    title: "Adjust Single Image",
    contexts: ["image"],
    enabled: true
  }
)

browser.menus.onClicked.addListener((info, tab) => {
  browser.tabs.sendMessage(tab.id, {
    action: 'adjustSingleImage',
    targetElementId: info.targetElementId
  })
})