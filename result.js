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
}

function render() {
  browser.storage.local.get().then((item) => {
    result = item.result
    console.log(result)
    resultCapitalized = result.charAt(0).toUpperCase() + result.substr(1)

    // update text
    document.getElementById('result').innerHTML = resultCapitalized
    document.getElementById('red').innerHTML = item.red + '%'
    document.getElementById('blue').innerHTML = item.blue + '%'
    document.getElementById('green').innerHTML = item.green + '%'

    // update .result-container
    let backgroundColor;
    switch (result) {
      case 'tritan':
        backgroundColor = 'linear-gradient(45deg, rgba(255,0,0,1) 100%, rgba(0,163,255,1) 10%, rgba(0,163,255,1) 100%)'
        break;
      // case 'deutan':
      //   backgroundColor = 'red'
      //   break;
      // case 'protan':
      //   backgroundColor = 'red'
      //   break;
    }
    document.getElementById('result-container').style.background = backgroundColor
  })
}

document.addEventListener('DOMContentLoaded', render)