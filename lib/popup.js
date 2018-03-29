(function () {
  var url
  var shortcut
  var formatUrl
  var preTabUrl = false
  var preTabId = false
  var currentUrl = false
  var currentTabId = false

  // wrap this in if to debug popup.html without extension
  if (window.location.href.indexOf('file://') < 0) {
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
      if (!preTabUrl) {
        preTabUrl = tabs[0].url
        preTabId = tabs[0].id
      }
      currentUrl = tabs[0].url
      currentTabId = tabs[0].id
    })
  }

  var localKeys = function() {
    var keys = Object.keys(localStorage)
    return keys.filter(function (k) { return k !== 'lastSynced'})
  }

  function checkSyncData () {
    var lastChecked = localStorage['lastSynced']
    if (!lastChecked || minsSinceSync(lastChecked) > 5) {
      console.log('you should sync')
      var now = new Date()


      for (var i = 0; i < localStorage.length; i++){
        localStorage[i]
      }
      setSyncStorage()
      localStorage['lastSynced'] = now
    }
  }

  function minsSinceSync (lastTime) {
    var now = new Date()
    return Math.round((now - lastTime) / 1000 / 60)
  }

  document.body.onload = function () {
    checkSyncData()
  }

  function setSyncStorage (key, value) {
    if (chrome.storage) {
      // chrome.storage.sync.set({lastSynced: now})
    }
  }

  var setShortcut = function (shortcut, url) {
    if (shortcut && url) {
      if (localStorage[shortcut] !== url) {
        localStorage[shortcut] = url
        setSyncStorage({shortcut: url})
        // chrome.storage.sync.set({value: url});
      }
    }
    return localStorage[shortcut] !== undefined && localStorage[shortcut] !== ''
  }

  formatUrl = function (input) {
    var url = input
    if (url.indexOf('http') === -1) {
      url = 'http://' + url
    }
    return url
  }

  document.getElementById('myform').onclick = function (evt) {
    evt.preventDefault()
    linkify()
  }

  document.onkeypress = function (e) {
    if (e.keyCode === 13) {
      linkify()
    }
  }

  var showLinks = document.querySelector('#show-links')

  if (showLinks) {
    showLinks.addEventListener('click', function (event) {
      chrome.tabs.create({url: 'list.html'})
    })
  }

  function openUrl (url) {
    if (preTabUrl !== 'chrome://newtab/') {
      window.open(url, '_blank')
    } else {
      chrome.tabs.update(preTabId, {url: url})
      this.close()
    }
  }

  function linkify () {
    url = document.getElementById('url').value
    shortcut = document.getElementById('shortcut').value
    var isSet = setShortcut(shortcut, url)

    if (isSet) {
      var short = localStorage[shortcut]
      url = formatUrl(short)
    } else {
      url = formatUrl(url)
    }
    openUrl(url)
  }

  function grabUrl () {
    var urlInput = document.getElementById('url')
    urlInput.value = currentUrl
  }

  var grab = document.getElementById('grab')

  if (grab) {
    grab.addEventListener('click', function (e) {
      grabUrl()
      e.preventDefault()
    })
  }
})()
