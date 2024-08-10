/*
    Algorithm Source: https://galactic.ink/labs/Color-Vision/Javascript/Color.Vision.Daltonize.js
    Accessed At: http://www.daltonize.org/ 
                 "There is not just one colorblindness"
                 05-18-2024
    Author: Michael
    Accessed On: 02-03-2024

    The program is refactored into two functions and updated to use modern JavaScript syntax.
*/


function daltonizeRGB ([red, green, blue], options) {
  if (!options) options = {};
  let type = typeof options.type == "string" ? options.type : "Deuteranopia";

  const CVDMatrix = {
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
  const cvd = CVDMatrix[type],
      cvd_a = cvd[0],
      cvd_b = cvd[1],
      cvd_c = cvd[2],
      cvd_d = cvd[3],
      cvd_e = cvd[4],
      cvd_f = cvd[5],
      cvd_g = cvd[6],
      cvd_h = cvd[7],
      cvd_i = cvd[8];
  let L, M, S, l, m, s, R, G, B, RR, GG, BB;
  // RGB to LMS matrix conversion
  L = (17.8824 * red) + (43.5161 * green) + (4.11935 * blue);
  M = (3.45565 * red) + (27.1554 * green) + (3.86714 * blue);
  S = (0.0299566 * red) + (0.184309 * green) + (1.46709 * blue);
  // Simulate color blindness
  l = (cvd_a * L) + (cvd_b * M) + (cvd_c * S);
  m = (cvd_d * L) + (cvd_e * M) + (cvd_f * S);
  s = (cvd_g * L) + (cvd_h * M) + (cvd_i * S);
  // LMS to RGB matrix conversion
  R = (0.0809444479 * l) + (-0.130504409 * m) + (0.116721066 * s);
  G = (-0.0102485335 * l) + (0.0540193266 * m) + (-0.113614708 * s);
  B = (-0.000365296938 * l) + (-0.00412161469 * m) + (0.693511405 * s);
  // Isolate invisible colors to color vision deficiency (calculate error matrix)
  R = red - R;
  G = green - G;
  B = blue - B;
  // Shift colors towards visible spectrum (apply error modifications)
  RR = (0.0 * R) + (0.0 * G) + (0.0 * B);
  GG = (0.7 * R) + (1.0 * G) + (0.0 * B);
  BB = (0.7 * R) + (0.0 * G) + (1.0 * B);
  // Add compensation to original values
  R = RR + red;
  G = GG + green;
  B = BB + blue;
  // Clamp values
  if (R < 0) R = 0;
  if (R > 255) R = 255;
  if (G < 0) G = 0;
  if (G > 255) G = 255;
  if (B < 0) B = 0;
  if (B > 255) B = 255;
  // Record color
  let data = [0,0,0];
  // Why shift?
  data[0] = R >> 0;
  data[1] = G >> 0;
  data[2] = B >> 0;
  return data
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

module.exports = {
    daltonizeImage,
    daltonizeRGB
}