(function () {
  document.addEventListener("DOMContentLoaded", function(event) {
    var element = document.getElementById('urlInput');
    if (element && element.focus) {
      element.focus();
    }
  });
})();
