(function(){

  var myForm;
  var inputs;
  myForm = document.getElementById('myform');
  inputs = document.getElementsByClassName('input');
  var url;
  var shortcut;
  var formatUrl;

  setShortcut = function(shortcut, url){
    if(shortcut && url){
      if(localStorage[shortcut] != url){
        localStorage[shortcut] = url;
      }
    }
    return localStorage[shortcut] != undefined && localStorage[shortcut] != '';
  }

  formatUrl = function (input){
    var url = input;
    if(url.indexOf('http') == -1){
      url = "http://" + url;
    }
    return url;
  }

  myForm.onclick = function (evt) {
    evt.preventDefault();
    linkify();
  };

  document.onkeypress = function(e){
    if (e.keyCode == 13) {
      linkify();
     }
  }

  var showLinks = document.querySelector('#show-links');

  if(showLinks){
    showLinks.addEventListener('click', function(event) {
        chrome.tabs.create({ url: "list.html"});
    });
  }

  function linkify(){
    url = document.getElementById('url').value;
    shortcut = document.getElementById('shortcut').value;
    var isSet = setShortcut(shortcut, url);

    if(isSet){
      var short = localStorage[shortcut];
      url = formatUrl(short);
    } else {
      url = formatUrl(url);
    }
    window.open(url, '_blank');
  }

  function grabUrl(){
      var urlInput = document.getElementById('url');
      urlInput.value = currentUrl;
  }

  var currentUrl;

  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
      currentUrl = tabs[0].url;
  });

  var grab = document.getElementById('grab');

  if (grab) {
    grab.addEventListener('click', function(e){
        grabUrl();
        e.preventDefault();
    });
  }

})();
