function updateContent() {
  querystring = window.location.search
  urlParams = new URLSearchParams(querystring)

  // update local storage
  browser.storage.local.set({
    result: urlParams.get('result'),
    red: urlParams.get('red'),
    blue: urlParams.get('blue'),
    green: urlParams.get('green')
  })

  // accessing from storage is weird, it returns an object that you have to index into
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/StorageArea/get#return_value
  browser.storage.local.get('result').then((item) => console.log(item.result))

  // update web page
  document.getElementById('result').innerHTML = urlParams.get('result')
  document.getElementById('red').innerHTML = urlParams.get('red')
  document.getElementById('blue').innerHTML = urlParams.get('blue')
  document.getElementById('green').innerHTML = urlParams.get('green')
}

document.addEventListener('DOMContentLoaded', updateContent)