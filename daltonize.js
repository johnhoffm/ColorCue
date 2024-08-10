/*
    Algorithm Source: https://galactic.ink/labs/Color-Vision/Javascript/Color.Vision.Daltonize.js
    Accessed At: http://www.daltonize.org/ 
                 "There is not just one colorblindness"
                 05-18-2024
    Author: Michael
    Accessed On: 02-03-2024

    The program is refactored into two functions and updated to use modern JavaScript syntax and glMatrix functions.
*/
const vec3 = glMatrix.vec3;
const mat3 = glMatrix.mat3;

const protanopiaMatrix = mat3.fromValues(
    0.0, 0.0, 0.0,
    2.02344, 1.0, 0.0,
    -2.52581, 0.0, 1.0
);

const deuteranopiaMatrix = mat3.fromValues(
    1.0, 0.494207, 0.0,
    0.0, 0.0, 0.0,
    0.0, 1.24827, 1.0
);

const tritanopiaMatrix = mat3.fromValues(
    1.0, 0.0, -0.395913,
    0.0, 1.0, 0.801109,
    0.0, 0.0, 0.0
);

const RGBtoLMSMatrix = mat3.fromValues(
    17.8824, 3.45565, 0.0299566,
    43.5161, 27.1554, 0.184309,
    4.11935, 3.86714, 1.46709
);

const LMStoRGBMatrix = mat3.fromValues(
    0.0809444479, -0.0102485335, -0.000365296938,
    -0.130504409, 0.0540193266, -0.00412161469,
    0.116721066, -0.113614708, 0.693511405
)

const errorModificationMatrix = mat3.fromValues(
    0.0, 0.7, 0.7,
    0.0, 1.0, 0.0,
    0.0, 0.0, 1.0
);

const CVDMatrix = {
    "Protanopia": protanopiaMatrix, // reds are greatly reduced (1% men)
    "Deuteranopia": deuteranopiaMatrix, // greens are greatly reduced (1% men)
    "Tritanopia": tritanopiaMatrix // blues are greatly reduced (0.003% population)
}

function daltonizeRGB([red, green, blue], options) {
    if (!options) options = {};
    let type = typeof options.type == "string" ? options.type : "Deuteranopia"; // default
    const cvd = CVDMatrix[type]

    // 1. Convert RGB to LMS color space
    const rgb = vec3.fromValues(red, green, blue);
    const lms = vec3.create();
    vec3.transformMat3(lms, rgb, RGBtoLMSMatrix);

    // 2. Simulate colorblindness based on the set colorblindness type
    const lms_simulated = vec3.create();
    vec3.transformMat3(lms_simulated, lms, cvd);

    // 3. Transform simulated LMS back to RGB
    const rgb_simulated = vec3.create();
    vec3.transformMat3(rgb_simulated, lms_simulated, LMStoRGBMatrix);

    // 4. Calculate error matrix as the difference between the real RGB and simulated RGB with colorblindness
    const rgb_error = vec3.create();
    vec3.subtract(rgb_error, rgb, rgb_simulated);

    // 5. Shift colors towards visible spectrum (apply error modifications)
    const rgb_errorModification = vec3.create();
    vec3.transformMat3(rgb_errorModification, rgb_error, errorModificationMatrix)

    // 6. Add compensation to original RGB values
    const rgb_compensated = vec3.create();
    vec3.add(rgb_compensated, rgb_errorModification, rgb);

    // 7. Shift to convert any floating point values to integer quickly
    const result = [
        rgb_compensated[0] >> 0,
        rgb_compensated[1] >> 0,
        rgb_compensated[2] >> 0
    ]

    // 8. Clamp resulting RGB values to [0, 255]
    for (let i = 0; i < 3; i++) {
        result[i] = Math.max(0, Math.min(255, result[i]));
    }

    return result;
};


function daltonizeImage(image, options) {
    if (image.width === 0 || image.height === 0) return;

    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;

    // arguments: (image, xoffset, yoffset, width, height)
    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
    ctx.drawImage(image, 0, 0, image.width, image.height);
    let imageData;
    try {
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } catch (e) {
        console.error("Unable to access image data with error: " + e);
    }
    let rawData = imageData.data;

    // Iterate through each pixel's RGBA values
    // R, G, B, A are stored in 4 consecutive array indices, hence the 4 step size
    for (let id = 0, length = rawData.length; id < length; id += 4) {
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