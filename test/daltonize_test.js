/*
  Usage: node test/daltonize_test.js
*/

const {daltonizeRGB, daltonizeImage} = require("../daltonize.js");

// ===== helper functions
function generateRandomRGB() {
  return [
      Math.floor(Math.random() * 256), // red
      Math.floor(Math.random() * 256), // green
      Math.floor(Math.random() * 256)  // blue
  ];
}

// ===== performance tests
function TestDaltonizeRGBPerformance(size) {
  const t0 = performance.now();
  for (let i = 0; i < size; i++) {
    const rgb = generateRandomRGB();
    daltonizeRGB(rgb, {"type": "Deuteranopia"});
  }
  const t1 = performance.now();
  console.log(`${t1 - t0} ms`)
}

TestDaltonizeRGBPerformance(1024 * 1024);