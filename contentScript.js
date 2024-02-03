let blueBlindFilterActive = false;

// adds the blue blind filter to the body class
function applyBlueBlindFilter() {
    const body = document.body;
    if (blueBlindFilterActive) {
        body.classList.add('blue-blind');
    } else {
        body.classList.remove('blue-blind');
    }
}

browser.runtime.onMessage.addListener(function (message) {
    if (message.action === 'toggleBlueBlindFilter') {
        blueBlindFilterActive = !blueBlindFilterActive;
        applyBlueBlindFilter();
    }
});

applyBlueBlindFilter();