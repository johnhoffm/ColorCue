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

// applies adjustSingleColor to all color properties of input element and all child elements that haven't been adjusted
function adjustColors(element, options) {
    const allElements = element.querySelectorAll("*:not(img):not([data-colorcue-normal=true])");
    let numAdjusted = 0;

    allElements.forEach(element => {
        let isAdjusted = false
        colorProperties.forEach(property => {
            const color = window.getComputedStyle(element).getPropertyValue(property);
            if (color && color !== "none") {
                const adjustedColor = adjustSingleColor(color, options);
                if (adjustedColor) {
                    element.style.setProperty(property, adjustedColor);
                    element.dataset.colorcueNormal = "true";
                    isAdjusted = true;
                }
            }
        });
        if (isAdjusted) numAdjusted++;
    });
    console.log(`[ColorCue] ${numAdjusted}/${allElements.length} elements adjusted`);
}

// applies adjustImage to all img tags in the input element that haven't been adjusted
function adjustImages(element, options) {
    const images = element.querySelectorAll("img:not([data-colorcue-image=true])");
    let numAdjusted = 0;

    images.forEach((element) => {
        const result = adjustImage(element, options);
        if (result) numAdjusted++;
    });
    console.log(`[ColorCue] ${numAdjusted}/${images.length} images adjusted`)
}

// assumes the element that input color belongs to doesn't have dataset colorcueNormal = true
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
        console.error(`[ColorCue] Invalid color type: ${input}`)
    }
    return resultString;
}

// assumes input element does not have dataset value colorcueImage = true
function adjustImage(element, options) {
    // edge case for document.body which does not have a class list
    if (element.nodeType !== Node.ELEMENT_NODE) {
        console.log("[ColorCue] Skipped adjusting element of node type " + element.nodeType)
        return false
    }

    // edge case for 0x0 image
    if (element.width === 0 || element.height === 0) {
        console.log("[ColorCue] Skipped adjusting 0x0 image")
        return false;
    }

    element.crossOrigin = "anonymous"; // THIS IS REQUIRED
    // 
    // TODO: come up with a way to return if the element failed to be adjusted?
    // the callback occurs async so there's no way to tell if it actually worked or not
    // maybe we can change the way we call daltonizeImage??
    element.onload = function () {
        daltonizeImage(element, {
            type: options.type,
            callback: function (processedCanvas) {
                // at this point, the image has been processed successfully.
                // Create a new Image element
                let newImg = new Image();
                newImg.crossOrigin = "anonymous";
                newImg.src = processedCanvas.toDataURL();
                newImg.alt = element.alt; // Copy alt text from original image
                newImg.title = element.title; // Copy title from original image
                newImg.className = element.className;
                newImg.dataset.colorcueImage = "true";

                element.parentNode.replaceChild(newImg, element);
            }
        });
    };

    return true
}

// ===== listen for message from popup or background script to apply changes
browser.runtime.onMessage.addListener(async (request) => {
    if ('action' in request && (request.action === 'enableFilter' || request.action === 'enableImageFilter' || request.action === 'changeType')) {
        location.reload()
    } else if (request.action === "adjustSingleImage") {
        let image;
        if (request.targetElementId) {
            image = browser.menus.getTargetElement(request.targetElementId);
        } else {
            console.error("[ColorCue] Error: could not find selected image");
            return
        }

        // do not adjust images that are already adjusted
        if (image.dataset.colorcueImage === "true") {
            console.log("[ColorCue] Image has already been adjusted");
            return
        }

        const options = await getOptions();
        const result = adjustImage(image, options)
        console.log(`[ColorCue] ${result ? 1 : 0}/1 image adjusted manually`);
    }
});

async function getOptions() {
    let storage = await browser.storage.local.get()
    let options = {
        type: storage.type || "Deuteranopia",
        isExtensionEnabled: storage.extensionEnabled || false,
        isImagesEnabled: storage.imagesEnabled || false
    }
    return options;
}

// ===== apply filters on initial load
async function applyFilters() {
    const options = await getOptions();
    if (options.isExtensionEnabled) {
        console.log("[ColorCue] applyFilters for " + options.type);
        adjustColors(document.body, options);
        if (options.isImagesEnabled) {
            adjustImages(document.body, options)
        }
        console.log("[ColorCue] applyFilters done");
    }
}

// if (document.readyState !== 'loading') {
//     applyFilters();
// } else {
//     document.addEventListener('DOMContentLoaded', applyFilters);
// }

// ===== setup mutation observer to adjust lazily loaded images
// TODO: may have to do this for single colors also?
async function handleMutation(records, observer) {
    let options = await getOptions()

    records.forEach((record) => {
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
                if (options.isExtensionEnabled && options.isImagesEnabled) {
                    let numAdjusted = 0;
                    lazyImages.forEach((element) => {
                        if (adjustImage(element, options)) {
                            numAdjusted++
                        }
                    })
                    console.log(`[ColorCue] ${numAdjusted}/${lazyImages.length} images adjusted lazily`)
                }
            }
        }
    })
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
    const options = await getOptions();

    if (options.isExtensionEnabled) {
        console.log("[ColorCue] Intersection Observer applying filters for " + options.type);
        records.forEach(record => {
            if (record.isIntersecting) {
                if (record.target.matches("*:not(img):not([data-colorcue-normal=true])")) {
                    adjustColors(record.target, options)
                } else if (options.isImagesEnabled && record.target.matches("img:not([data-colorcue-image=true])")) {
                    adjustImage(record.target, options)
                } else {
                    console.log("[ColorCue] skipped " + record.target)
                }
            }
        })
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
