
document.getElementById('toggleButton').addEventListener('click', function () {
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        browser.tabs.sendMessage(tabs[0].id, { action: 'toggleFilter' });
    });
  });