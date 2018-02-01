(function () {
  document.addEventListener("DOMContentLoaded", function(event) {
    var element = document.getElementById('lookupInput');
    if (element && element.focus) {
      element.focus();
    }
  });
})();
