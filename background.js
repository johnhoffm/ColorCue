// open extension page on installation
function handleInstalled(details) {
  console.log(details.reason)
  browser.tabs.create({
    url: "/index.html"
  })
}

browser.runtime.onInstalled.addListener(handleInstalled)