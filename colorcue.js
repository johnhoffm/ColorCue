// At the beginning of your content script
async function init() {
    const url = new URL(window.location.href);
    const domain = url.hostname; // Get the domain of the current page
    let storedData = await browser.storage.local.get(domain);
    let enabled = storedData[domain]; // Use domain-specific enabled state

    if (enabled !== false) { // Default to true if not set
        adjustColors(document.body);
    }
}

init();

// Inside the message listener of colorcue.js
browser.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    const url = new URL(window.location.href);
    const currentDomain = url.hostname; // Get current domain

    // Check if the message's domain matches the current domain
    if (request.enabled !== undefined && request.domain === currentDomain) {
        if (request.enabled) {
            adjustColors(document.body);
        } else {
            location.reload(); // Or implement a more nuanced way to revert changes
        }
    }
});

function adjustColors(element) {
    // Recursively adjust colors on all child nodes of the given element.
    if (element.childNodes.length) {
        element.childNodes.forEach(function(child) {
            adjustColors(child);
        });
    }

    if (element.nodeType === Node.ELEMENT_NODE) {
        // Adjust text color
        const textColor = window.getComputedStyle(element).color;
        if (needsAdjustment(textColor)) {
            element.style.color = adjustColor(textColor);
            console.log("Text color changed");
        }

        // Adjust background color
        const backgroundColor = window.getComputedStyle(element).backgroundColor;
        if (needsAdjustment(backgroundColor)) {
            element.style.backgroundColor = adjustColor(backgroundColor);
            console.log("Background color changed");
        }

        // Adjust border color
        const borderColor = window.getComputedStyle(element).borderColor;
        if (needsAdjustment(borderColor)) {
            element.style.borderColor = adjustColor(borderColor);
            console.log("Border color changed");
        }
    }
}

function needsAdjustment(color) {
    // Convert color to a standard format (remove spaces, convert to lowercase) for comparison
    color = color.replace(/\s+/g, '').toLowerCase();

    // Check if the color is black, represented in RGB format
    return (color === 'rgb(0,0,0)' || color === 'rgba(0,0,0,1)'); // Check for black in RGB/RGBA format
}

function adjustColor(color) {
    // Adjust the given color to a more suitable one
    return '#0000FF'; // Example: change color to blue
}
