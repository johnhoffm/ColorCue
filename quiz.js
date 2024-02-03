// when test is finished, redirect back to extension page
// https://enchroma.com/pages/get-result?v=2&color-blindness-test-result=tritan&lv=3&l=12.5&m=37.5&s=0&wearing=&session_id=20240203-da51ccac-d0d2-411c-ad8a-c590dc25d7c9
function handleGetResult() {
  querystring = window.location.search
  urlParams = new URLSearchParams(querystring)

  newUrlParams = new URLSearchParams({
    result: urlParams.get('color-blindness-test-result'),
    red: urlParams.get('l'),
    green: urlParams.get('m'),
    blue: urlParams.get('s')
  })

  // redirect back to extension page
  // browser.runtime.getURL() gets extension domain
  document.body.style.border = "5px solid blue";
  window.location.href = browser.runtime.getURL("/result.html") + "?" + newUrlParams.toString()
}

handleGetResult()