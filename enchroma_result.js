// when test is finished, redirect back to extension page
// https://enchroma.com/pages/get-result?v=2&color-blindness-test-result=tritan&lv=3&l=12.5&m=37.5&s=0&wearing=&session_id=20240203-da51ccac-d0d2-411c-ad8a-c590dc25d7c9
function handleGetResult() {
  let newUrlParams

  if (window.location.href.startsWith("https://enchroma.com/pages/get-result")) {
    // colorblind result
    querystring = window.location.search
    urlParams = new URLSearchParams(querystring)
    newUrlParams = new URLSearchParams({
      result: urlParams.get('color-blindness-test-result'),
      red: urlParams.get('l'),
      green: urlParams.get('m'),
      blue: urlParams.get('s')
    })
  } else {
    // normal vision result
    newUrlParams = new URLSearchParams({
      result: 'normal'
    })
  }
  window.location.href = browser.runtime.getURL("/result.html") + "?" + newUrlParams.toString()
}

handleGetResult()