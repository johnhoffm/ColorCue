function handleInstalled() {
  browser.storage.local.set({
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