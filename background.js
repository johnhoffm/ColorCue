// open extension page on installation
function handleInstalled() {
  browser.storage.local.set({
    enabled: false,
    images: false
  })
  browser.tabs.create({
    url: "/index.html"
  })
}

browser.runtime.onInstalled.addListener(handleInstalled)