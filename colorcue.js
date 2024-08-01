// Import daltonize.js is not possible and does not seem to be necessary

// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Applying_color
const colorProperties = [
    'color',
    'background-color',
    'text-shadow',
    'text-decoration-color',
    'text-emphasis-color',
    'caret-color',
    'column-rule-color',
    'outline-color',
    'border-color',
    'border-left-color',
    'border-right-color',
    'border-top-color',
    'border-bottom-color',
    'border-block-start-color',
    'border-block-end-color',
    'border-inline-start-color',
    'border-inline-end-color',
    'fill',
    'stroke'
]

function adjustColors(element, options) {
    const allElements = element.querySelectorAll("*:not([data-colorcue-normal=true])");
    
    allElements.forEach(element => {
        colorProperties.forEach(property => {
            const color = window.getComputedStyle(element).getPropertyValue(property);
            if (color) {
                const adjustedColor = adjustSingleColor(color, options);
                element.style.setProperty(property, adjustedColor);
                element.dataset.colorcueNormal = true;
            }
        });
    });
}

function adjustSingleColor(input, options) {
    const rgbRegex = /rgb\((\s*\d+\s*,\s*\d+\s*,\s*\d+\s*)\)/g;
    const rgbaRegex = /rgba\((\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+(\.\d+)?\s*)\)/g;

    let resultString
    if (rgbRegex.test(input)) {
        resultString = input.replace(rgbRegex, (match) => {
            // split rgb() string into r, g, b integers
            const valuesArray = match.split(',').map((value, i) => {
                if (i == 0) {
                    value = value.substr(4)
                }
                return parseInt(value.trim(), 10)
            }
            );
            // daltonize single color
            const resultArray = daltonizeRGB(valuesArray, options);
            return `rgb(${resultArray.join(', ')})`;
        });
    } else if (rgbaRegex.test(input)) {
        resultString = input.replace(rgbaRegex, (match) => {
            // split rgba() string into r, g, b, a integers
            const valuesArray = match.split(',').map((value, i) => {
                if (i == 0) {
                    value = value.substr(4)
                }
                return parseInt(value.trim(), 10)
            }
            );
            // daltonize single color
            const resultArray = daltonizeRGB(valuesArray.slice(0, 3), options);
            return `rgba(${resultArray.join(', ')}, ${valuesArray[3]})`;
        });
    } else {
        console.log(`invalid color type: ${input}`)
    }
    return resultString
}

function adjustImage(element, options) {
    // edge case for document.body which does not have a class list
    if (element.nodeType !== Node.ELEMENT_NODE) {
        console.log("error: got element of node type " + element.nodeType)
        return
    }
    // do not adjust images that have already been adjusted
    if (element.hasAttribute('colorcue')) {
        return
    }
    element.dataset.colorcueImage = true;
    element.crossOrigin = "anonymous"; // THIS IS REQUIRED
    element.onload = function () {
        try {
            daltonizeImage(element, {
                type: options.type,
                callback: function (processedCanvas) {
                    // Create a new Image element
                    let newImg = new Image();
                    newImg.crossOrigin = "anonymous";
                    newImg.src = processedCanvas.toDataURL();
                    newImg.alt = element.alt; // Copy alt text from original image
                    newImg.title = element.title; // Copy title from original image
                    newImg.className = element.className;

                    element.parentNode.replaceChild(newImg, element);
                }
            });
        } catch (err) {
            console.log(err);
            console.log(element.src);
        }
    };
}

// ===== listen for message from popup or background script to apply changes
browser.runtime.onMessage.addListener(async (request) => {
    console.log("got msg: " + request.action)
    if ('action' in request && (request.action === 'enableFilter' || request.action === 'enableImageFilter')) {
        location.reload()
    }
});

async function getSettings() {
    let storage = await browser.storage.local.get()
    let settings = {
        type: storage.result,
        isEnabled: storage.enabled || false,
        isImagesEnabled: storage.images || false
    }
    return settings;
}

// ===== apply filters on initial load
async function applyFilters() {
    const settings = await getSettings();
    if (settings.isEnabled) {
        options = { type: settings.type };
        adjustColors(document.body, options);
        if (settings.isImagesEnabled) {
            let images = document.querySelectorAll("img:not([data-colorcue-image=true])");
            images.forEach((element) => {
                adjustImage(element, options);
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', applyFilters())

// ===== setup mutation observer to adjust lazily loaded images
// TODO: may have to do this for single colors also?
const observer = new MutationObserver((records, observer) => {
    let settings = getSettings()

    records.forEach(async (record) => {
        if (record.type == 'childList') {
            const addedNodes = Array.from(record.addedNodes)
            const lazyImages = addedNodes.reduce((acc, node) => {
                // do not add TEXT_NODE's which are added on loading more images
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const imgElements = Array.from(node.querySelectorAll("img:not([data-colorcue-image=true])"));
                    return acc.concat(imgElements);
                } else {
                    return acc
                }
            }, []);
            if (lazyImages.length > 0) {
                // process lazy loaded images
                if (settings.isEnabled && settings.isImagesEnabled) {
                    let options = { type: settings.type };
                    lazyImages.forEach((element) => {
                        adjustImage(element, options)
                    })
                }
            }
        }
    })
})

// prevent memory leaks by disconnecting observer
window.addEventListener('beforeunload', () => {
    if (observer) {
        observer.disconnect()
    }
})

observer.observe(document.body, {
    childList: true,
    subtree: true
})
