function handleToggle() {
  var toggleExtension = document.getElementById('toggleExtension');
  var toggleImages = document.getElementById('toggleImages');

  toggleExtension.addEventListener('change', function () {
    if (!toggleExtension.checked) {
      // If toggleExtension is unchecked, set toggleImages to unchecked and disabled
      toggleImages.checked = false;
      toggleImages.disabled = true;
    } else {
      // If toggleExtension is checked, enable toggleImages
      toggleImages.disabled = false;
    }
  });
}

document.addEventListener('DOMContentLoaded', handleToggle)
