async function main() {
  // redirect to index.html if results not set
  querystring = window.location.search
  let storage = await browser.storage.local.get()
  if (querystring.length != 0 && updateLocalStorage() === false) {
    console.log(storage.result)
    if (storage.result === undefined){
      window.location.href = browser.runtime.getURL("/index.html")
    }
  }

  // update content
  const result = storage.result
  document.getElementById('result').innerHTML = result

  if (result === 'Normal Vision') {
    // remove results from page
    document.getElementById('color-containers').style.display = 'none'
  } else if (storage.red && storage.blue && storage.green) {
    // update colorblind text
    document.getElementById('red').innerHTML = storage.red + '%'
    document.getElementById('blue').innerHTML = storage.blue + '%'
    document.getElementById('green').innerHTML = storage.green + '%'
  }
}

function updateLocalStorage() {
  console.log("updating content from querystring")
  querystring = window.location.search
  urlParams = new URLSearchParams(querystring)
  queryResult = urlParams.get('result')

  // check url params contain the correct keys
  if (!urlParams.has('result')) {
    console.log("no result param")
    return false
  } else if (!(['tritan', 'protan', 'deutan', 'normal'].includes(queryResult))) {
    console.log(!['tritan', 'protan', 'deutan', 'normal'].includes(queryResult))
    return false
  } else if (['tritan', 'protan', 'deutan'].includes(queryResult)) {
    if (!urlParams.has('red') || !urlParams.has('green') || !urlParams.has('blue')) {
      console.log("missing red, green, or blue")
      return false
    }
  }

  let result;
  switch (urlParams.get('result')) {
    case 'tritan':
      result = 'Tritanopia'
      break
    case 'protan':
      result = 'Protanopia'
      break;
    case 'deutan':
      result = 'Deuteranopia'
      break;
    case 'normal':
      result = 'Normal Vision'
      break;
  }

  browser.storage.local.set({ result: result })

  if (result !== 'Normal Vision') {
    browser.storage.local.set({
      red: urlParams.get('red'),
      blue: urlParams.get('blue'),
      green: urlParams.get('green')
    })
  }
  return true
}

document.addEventListener('DOMContentLoaded', main)