(function () {
  document.addEventListener("DOMContentLoaded", function(event) {
    var element = document.getElementById('urlInput');
    if (element && element.focus) {
      element.focus();
    }
  });
})();

function playAudioOnPage(url) {
  if (!url) {
    return console.log('No URL provided - aborting playAudioOnPage');
  }
  console.log('playAudioOnPage triggered with URL', url);

  var audio = document.getElementById('audio');
  if (!audio) {
    return console.log('No audio tag present on page - aborting playAudioOnPage', url);
  }

  stopVideoOnPage();
  stopAudioOnPage();

  var source = document.createElement('source');
  source.setAttribute('src', url);
  audio.appendChild(source);
  audio.play();
  audio.className = '';
}

function playVideoOnPage(url) {
  if (!url) {
    return console.log('No URL provided - aborting playVideoOnPage');
  }
  console.log('playVideoOnPage triggered with URL', url);

  var video = document.getElementById('video');
  if (!video) {
    return console.log('No video tag present on page - aborting playVideoOnPage', url);
  }

  stopVideoOnPage();
  stopAudioOnPage();

  var source = document.createElement('source');
  source.setAttribute('src', url);
  video.appendChild(source);
  video.play();
  video.className = '';
}

function stopAudioOnPage() {
  var audio = document.getElementById('audio');
  audio.pause();
  audio.className = 'hidden';
}

function stopVideoOnPage() {
  var video = document.getElementById('video');
  video.pause();
  video.className = 'hidden';
}

function toggleDarkMode() {
  var body = document.body;
  var currentClass = body.className;
  if (currentClass.indexOf('dark') !== -1) {
    body.className = currentClass.replace('dark', '');
  } else {
    body.className = currentClass + ' dark';
  }
}
