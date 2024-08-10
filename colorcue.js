// Import daltonize.js is not possible and does not seem to be necessary

// ===== methods for applying daltonization to elements and images
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

// adjust colors for a single element
function adjustColors(element, options) {
    colorProperties.forEach(property => {
        const color = window.getComputedStyle(element).getPropertyValue(property);
        if (color && color !== "none") {
            const adjustedColor = adjustSingleColor(color, options);
            element.style.setProperty(property, adjustedColor);
            element.dataset.colorcueNormal = true;
        }
    });
}

// applies daltonization on rgb or rgba colors
function adjustSingleColor(input, options) {
    const rgbRegex = /rgb\((\s*\d+\s*,\s*\d+\s*,\s*\d+\s*)\)/g;
    const rgbaRegex = /rgba\((\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+(\.\d+)?\s*)\)/g;

    let resultString;
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
        console.log(`[ColorCue] Invalid color type: ${input}`)
    }
    return resultString;
}

// adjusts colors for a single image
function adjustImage(element, options) {
    // edge case for document.body which does not have a class list
    if (element.nodeType !== Node.ELEMENT_NODE) {
        console.log("[ColorCue] Error: got element of node type " + element.nodeType)
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
            console.log("[ColorCue] " + err);
            console.log("[ColorCue] " + element.src);
        }
    };
}

// ===== listen for message from popup or background script to apply changes
browser.runtime.onMessage.addListener(async (request) => {
    console.log("[ColorCue] Got message: " + request.action)
    if ('action' in request && (request.action === 'enableFilter' || request.action === 'enableImageFilter' || request.action === 'changeType')) {
        location.reload()
    }
});

// ===== helper function for retrieving settings from local storage
async function getSettings() {
    let storage = await browser.storage.local.get()
    let settings = {
        type: storage.type,
        isExtensionEnabled: storage.extensionEnabled || false,
        isImagesEnabled: storage.imagesEnabled || false
    }
    return settings;
}

// ===== setup mutation observer to adjust lazily loaded images
// TODO: may have to do this for single colors also?
async function handleMutation(records, observer) {
    const settings = await getSettings()

    if (settings.isExtensionEnabled && settings.isImagesEnabled) {
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
                    let options = { type: settings.type };
                    lazyImages.forEach((element) => {
                        adjustImage(element, options)
                    })
                }
            }
        })
    }
}

const mutationObserver = new MutationObserver(handleMutation)

// prevent memory leaks by disconnecting observer
window.addEventListener('beforeunload', () => {
    if (mutationObserver) {
        mutationObserver.disconnect()
    }
})

mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
})

// ===== setup inspection observer to adjust content only in the viewport
async function handleIntersection(records, observer) {
    const settings = await getSettings();

    if (settings.isExtensionEnabled) {
        console.log("[ColorCue] Applying filters for " + settings.type);
        options = { type: settings.type };

        const t0 = performance.now();
        records.forEach(record => {
            if (record.isIntersecting) {
                if (record.target.matches("*:not(img):not([data-colorcue-normal=true])")) {
                    adjustColors(record.target, options)
                } else if (settings.isImagesEnabled && record.target.matches("img:not([data-colorcue-image=true])")) {
                    adjustImage(record.target, options)
                } else {
                    console.log("[ColorCue] skipped " + record.target)
                }
            }
        })
        const t1 = performance.now();
        console.log(`[ColorCue] Done in ${t1 - t0} milliseconds.`);
    }
}

const intersectionObserver = new IntersectionObserver(handleIntersection, {
    root: null, // Use the viewport as the container
    rootMargin: '0px', // No margin around the viewport
    threshold: 0.1 // Trigger when at least 10% of the element is visible
});

document.querySelectorAll('*').forEach(element => {
    intersectionObserver.observe(element);
});
