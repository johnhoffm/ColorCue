/*
    Color.Vision.Daltonize : v0.1
    ------------------------------
    "Analysis of Color Blindness" by Onur Fidaner, Poliang Lin and Nevran Ozguven.
    http://scien.stanford.edu/class/psych221/projects/05/ofidaner/project_report.pdf
	
    "Digital Video Colourmaps for Checking the Legibility of Displays by Dichromats" by FranÃ§oise ViÃ©not, Hans Brettel and John D. Mollon
    http://vision.psychol.cam.ac.uk/jdmollon/papers/colourmaps.pdf

*/

let daltonizeImage = function (image, options) {
    var CVDMatrix = { // Color Vision Deficiency
        "Protanope": [ // reds are greatly reduced (1% men)
            0.0, 2.02344, -2.52581,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
        ],
        "Deuteranope": [ // greens are greatly reduced (1% men)
            1.0, 0.0, 0.0,
            0.494207, 0.0, 1.24827,
            0.0, 0.0, 1.0
        ],
        "Tritanope": [ // blues are greatly reduced (0.003% population)
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            -0.395913, 0.801109, 0.0
        ]
    };

    if (!options) options = {};
    var type = typeof options.type == "string" ? options.type : "Normal";
    // this line is useless
    // amount = typeof options.amount == "number" ? options.amount : 1.0;
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;
    // console.log(image.width);
    // console.log(image.naturalWidth);
    // console.log(image.height);
    // console.log(image.naturalHeight);
    // console.log(image);
    // arguments: (image, xoffset, yoffset, width, height)
    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
    ctx.drawImage(image, 0, 0, image.width, image.height);
    try {
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height),
            data = imageData.data;
    } catch (e) {
        console.error(e);
    }
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
    for (var id = 0, length = data.length; id < length; id += 4) {
        var r = data[id],
            g = data[id + 1],
            b = data[id + 2];
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
        data[id] = R >> 0;
        data[id + 1] = G >> 0;
        data[id + 2] = B >> 0;
    }
    // Record data
    ctx.putImageData(imageData, 0, 0);
    if (typeof options.callback == "function") {
        options.callback(canvas);
    }
};

let daltonizeRGB = function ([red, green, blue], options) {
    var CVDMatrix = { // Color Vision Deficiency
        "Protanope": [ // reds are greatly reduced (1% men)
            0.0, 2.02344, -2.52581,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
        ],
        "Deuteranope": [ // greens are greatly reduced (1% men)
            1.0, 0.0, 0.0,
            0.494207, 0.0, 1.24827,
            0.0, 0.0, 1.0
        ],
        "Tritanope": [ // blues are greatly reduced (0.003% population)
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            -0.395913, 0.801109, 0.0
        ]
    };

    if (!options) options = {};
    var type = typeof options.type == "string" ? options.type : "Normal";
    // this line is useless
    // var amount = typeof options.amount == "number" ? options.amount : 1.0;

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
    console.log(data);
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

// ==== recursively adjust colors on document.body
function adjustColors(element, options) {
    // Recursively adjust colors on all child nodes of the given element.
    if (element.childNodes.length) {
        element.childNodes.forEach(function (child) {
            adjustColors(child, options);
        });
    }

    if (element.nodeType === Node.ELEMENT_NODE) {
        // Adjust text color
        const textColor = window.getComputedStyle(element).color;
        element.style.color = adjustSingleColor(textColor, options);

        // Adjust background color
        const backgroundColor = window.getComputedStyle(element).backgroundColor;
        element.style.backgroundColor = adjustSingleColor(backgroundColor, options);

        // Adjust border color
        const borderColor = window.getComputedStyle(element).borderColor;
        element.style.borderColor = adjustSingleColor(borderColor, options);

        // Adjust image colors
        if (element.tagName === "IMG") {
            element.onload = function () {
                daltonizeImage(element, {
                    type: "Deuteranope",
                    callback: function (processedCanvas) {
                        // console.log("Image color changed");
                        // Create a new Image element
                        let newImg = new Image();
                        newImg.src = processedCanvas.toDataURL();
                        newImg.alt = element.alt; // Copy alt text from original image
                        newImg.title = element.title; // Copy title from original image

                        // Want to copy other attributes so the page still makes sense
                        // There are probably some that I missed
                        // This one doesn't work:
                        // newImg.style = imgElement.style.cssText;
                        newImg.className = element.className;


                        // Replace the old image with the new one in the DOM
                        element.parentNode.replaceChild(newImg, element);
                    }
                });
            };
            // If the image is already loaded (e.g., from cache), manually trigger the load handling.
            if (element.complete) {
                element.onload();
            }
        }
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

// ===== listen for message from popup
browser.runtime.onMessage.addListener(async (request) => {
    let enabled = (await browser.storage.local.get()).enabled
    let images = (await browser.storage.local.get()).images
    // TODO: hardcoded options for now, change to pull from local storage
    options = {type: "Deuteranope"};
    if (enabled) {
        // TODO: turn on filter for only text and colors
        adjustColors(document.body, options);
        if (images) {
            // TODO: turn on filter for only images
        }
    } else {
        location.reload()
    }
});

// ===== adjust colors on initial load
async function init() {
    let enabled = (await browser.storage.local.get()).enabled
    let images = (await browser.storage.local.get()).images
    // TODO: options are hardcoded, change later
    options = {type: "Deuteranope"};
    if (enabled) {
        // TODO: turn on filter for only text and colors
        adjustColors(document.body, options);
        if (images) {
            // TODO: turn on filter for only images
        }
    }
}

init();