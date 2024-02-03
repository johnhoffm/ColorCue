// let blueBlindFilterActive = false;
// let blueWeakFilterActive = false;
// let RedBlindFilterActive = false;
// let RedWeakFilterActive = false;
// let GreenBlindFilterActive = false;
// let GreenWeakFilterActive = false;
// let MonochromeFilterActive = false;
// let BlueConeMonochromacyFilterActive = false;

const filters = {
    'blue-blind': false,
    'blue-weak': false,
    'red-blind': false,
    'red-weak': false,
    'green-blind': false,
    'green-weak': false,
    'monochrome': false,
    'blue-cone-monochromacy': false
};

function applyFilter() {
    const body = document.body;
    for (let filter in filters) {
        if (filters[filter]) {
            body.classList.add(filter);
        } else {
            body.classList.remove(filter);
        }
    }
}

browser.runtime.onMessage.addListener(function (message) {
    // if (message.action in filters) {
    //     filters[message.action] = !filters[message.action];
    //     applyFilter();
    // }
    if (message.action === 'toggleFilter') {
        filters['blue-blind'] = !filters['blue-blind'];
        applyFilter();
    }
});

applyFilter();

// let blueBlindFilterActive = false;
// function applyBlueBlindFilter() {
//     const body = document.body;
//     if (blueBlindFilterActive) {
//         body.classList.add('blue-blind');
//     } else {
//         body.classList.remove('blue-blind');
//     }
// }

// browser.runtime.onMessage.addListener(function (message) {
//     if (message.action === 'toggleBlueBlindFilter') {
//         blueBlindFilterActive = !blueBlindFilterActive;
//         applyBlueBlindFilter();
//     }
// });

// applyBlueBlindFilter();


// browser.runtime.onMessage.addListener(function (message) {
//     if (message.action === 'toggleBlueBlindFilter') {
//         blueBlindFilterActive = !blueBlindFilterActive;
//         applyBlueBlindFilter();
//     }
// });

// applyBlueBlindFilter();