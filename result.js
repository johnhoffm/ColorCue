function main() {
  querystring = window.location.search
  if (querystring.length != 0) {
    updateContent()
  }
  render()
}

function updateContent() {
  console.log("updating content from querystring")
  querystring = window.location.search
  urlParams = new URLSearchParams(querystring)

  // update local storage
  browser.storage.local.set({
    result: urlParams.get('result'),
    red: urlParams.get('red'),
    blue: urlParams.get('blue'),
    green: urlParams.get('green')
  })
}

function render() {
  console.log("rendering page")
  browser.storage.local.get().then((item) => {
    result = item.result
    resultCapitalized = result.charAt(0).toUpperCase() + result.substr(1)

    // update text
    document.getElementById('result').innerHTML = resultCapitalized
    document.getElementById('red').innerHTML = item.red + '%'
    document.getElementById('blue').innerHTML = item.blue + '%'
    document.getElementById('green').innerHTML = item.green + '%'

    // update .result-container
    // let backgroundColor;
    // switch (result) {
    //   case 'tritan':
    //     backgroundColor = 'linear-gradient(90deg, rgba(255,0,0,0.8) 10%, rgba(0,163,255,0.10) 50%, rgba(0,163,255,0.8) 90%)'
    //     break;
    //   // case 'deutan':
    //   //   backgroundColor = 'red'
    //   //   break;
    //   // case 'protan':
    //   //   backgroundColor = 'red'
    //   //   break;
    // }
    // document.getElementById('result-container').style.background = backgroundColor
  })
}

document.addEventListener('DOMContentLoaded', main)