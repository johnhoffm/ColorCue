// ===== functions to apply daltonization to images and single colors
/*
    Algorithm Source:

    Color.Vision.Daltonize : v0.1
    ------------------------------
    "Analysis of Color Blindness" by Onur Fidaner, Poliang Lin and Nevran Ozguven.
    Note: the original link is broken, below is an archive of the paper
    https://web.archive.org/web/20090731011248/http://scien.stanford.edu/class/psych221/projects/05/ofidaner/project_report.pdf
	
    "Digital Video Colourmaps for Checking the Legibility of Displays by Dichromats" by FranÃ§oise ViÃ©not, Hans Brettel and John D. Mollon
    http://vision.psychol.cam.ac.uk/jdmollon/papers/colourmaps.pdf

*/

let daltonizeImage = function (image, options) {
    if (image.width === 0 || image.height === 0) return;

    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;

    // arguments: (image, xoffset, yoffset, width, height)
    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
    ctx.drawImage(image, 0, 0, image.width, image.height);
    try {
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var rawData = imageData.data;
    } catch (e) {
        console.error("Unable to access image data with error: " + e);
    }

    // Iterate through each pixel's RGBA values
    // R, G, B, A are stored in 4 consecutive array indices, hence the 4 step size
    for (var id = 0, length = rawData.length; id < length; id += 4) {
        let [r, g, b, a] = rawData.slice(id, id + 4);

        let data = daltonizeRGB([r, g, b], options);

        rawData[id] = data[0];
        rawData[id + 1] = data[1];
        rawData[id + 2] = data[2];
        // Do nothing with alpha value
    }
    // Record data
    ctx.putImageData(imageData, 0, 0);
    if (typeof options.callback == "function") {
        options.callback(canvas);
    }
};

let daltonizeRGB = function ([red, green, blue], options) {
    if (!options) options = {};
    var type = typeof options.type == "string" ? options.type : "Normal";

    var CVDMatrix = {
        "Protanopia": [ // reds are greatly reduced (1% men)
            0.0, 2.02344, -2.52581,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
        ],
        "Deuteranopia": [ // greens are greatly reduced (1% men)
            1.0, 0.0, 0.0,
            0.494207, 0.0, 1.24827,
            0.0, 0.0, 1.0
        ],
        "Tritanopia": [ // blues are greatly reduced (0.003% population)
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            -0.395913, 0.801109, 0.0
        ]
    };

    // Apply Daltonization
    var cvd = CVDMatrix[type],
        cvd_a = cvd[0],
        cvd_b = cvd[1],
        cvd_c = cvd[2],
        cvd_d = cvd[3],
        cvd_e = cvd[4],
        cvd_f = cvd[5],
        cvd_g = cvd[6],
        cvd_h = cvd[7],
        cvd_i = cvd[8];
    var L, M, S, l, m, s, R, G, B, RR, GG, BB;
    data = [red, green, blue];
    var r = data[0],
        g = data[1],
        b = data[2];
    // RGB to LMS matrix conversion
    L = (17.8824 * r) + (43.5161 * g) + (4.11935 * b);
    M = (3.45565 * r) + (27.1554 * g) + (3.86714 * b);
    S = (0.0299566 * r) + (0.184309 * g) + (1.46709 * b);
    // Simulate color blindness
    l = (cvd_a * L) + (cvd_b * M) + (cvd_c * S);
    m = (cvd_d * L) + (cvd_e * M) + (cvd_f * S);
    s = (cvd_g * L) + (cvd_h * M) + (cvd_i * S);
    // LMS to RGB matrix conversion
    R = (0.0809444479 * l) + (-0.130504409 * m) + (0.116721066 * s);
    G = (-0.0102485335 * l) + (0.0540193266 * m) + (-0.113614708 * s);
    B = (-0.000365296938 * l) + (-0.00412161469 * m) + (0.693511405 * s);
    // Isolate invisible colors to color vision deficiency (calculate error matrix)
    R = r - R;
    G = g - G;
    B = b - B;
    // Shift colors towards visible spectrum (apply error modifications)
    RR = (0.0 * R) + (0.0 * G) + (0.0 * B);
    GG = (0.7 * R) + (1.0 * G) + (0.0 * B);
    BB = (0.7 * R) + (0.0 * G) + (1.0 * B);
    // Add compensation to original values
    R = RR + r;
    G = GG + g;
    B = BB + b;
    // Clamp values
    if (R < 0) R = 0;
    if (R > 255) R = 255;
    if (G < 0) G = 0;
    if (G > 255) G = 255;
    if (B < 0) B = 0;
    if (B > 255) B = 255;
    // Record color
    data[0] = R >> 0;
    data[1] = G >> 0;
    data[2] = B >> 0;
    return data
};

// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Applying_color
const colorOptions = [
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
    // Recursively adjust colors on all child nodes of the given element.
    if (element.childNodes.length) {
        element.childNodes.forEach(function (child) {
            adjustColors(child, options);
        });
    }

    if (element.nodeType === Node.ELEMENT_NODE) {
        colorOptions.forEach((property) => {
            const color = window.getComputedStyle(element)[property]
            if (color == 'none') {
                return
            }
            element.style[property] = adjustSingleColor(color, options)
        })
    }
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
    element.setAttribute('colorcue', true)
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

// ===== apply filters on initial load
async function applyFilters() {
    let storage = await browser.storage.local.get()
    let isEnabled = storage.enabled
    let isImagesEnabled = storage.images

    if (isEnabled) {
        let type = storage.result
        options = { type: type };
        adjustColors(document.body, options);
        if (isImagesEnabled) {
            var toReplace = Array.from(document.getElementsByTagName("img"));
            toReplace.forEach((element) => { adjustImage(element, options) });
        }
    }
}

document.addEventListener('DOMContentLoaded', applyFilters())

// ===== setup mutation observer to adjust lazily loaded images
// TODO: may have to do this for single colors also?
const observer = new MutationObserver((records, observer) => {
    records.forEach(async (record) => {
        if (record.type == 'childList') {
            const addedNodes = Array.from(record.addedNodes)
            const lazyImages = addedNodes.reduce((acc, node) => {
                // do not add TEXT_NODE's which are added on loading more images
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const imgElements = Array.from(node.querySelectorAll('img:not([colorcue])'));
                    return acc.concat(imgElements);
                } else {
                    return acc
                }
            }, []);
            if (lazyImages.length > 0) {
                // process lazy loaded images
                let storage = await browser.storage.local.get()
                let isEnabled = storage.enabled
                let isImagesEnabled = storage.images

                if (isEnabled && isImagesEnabled) {
                    let type = storage.result
                    options = { type: type };
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
