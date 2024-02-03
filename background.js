function handleInstalled(details) {
  console.log(details.reason)
  browser.tabs.create({
    url: "/extension_page/extension_page.html"
  })
}

browser.runtime.onInstalled.addListener(handleInstalled)