(function () {
  let url
  let shortcut
  let formatUrl
  let preTabUrl = false
  let preTabId = false
  let currentUrl = false
  let currentTabId = false

  document.getElementById('shortcut').focus();

  // wrap this in if to debug popup.html without extension
  if (window.location.href.indexOf('file://') < 0) {
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, (tabs) => {
      if (!preTabUrl) {
        preTabUrl = tabs[0].url
        preTabId = tabs[0].id
      }
      currentUrl = tabs[0].url
      currentTabId = tabs[0].id
    })
  }

  let localKeys = () => {
    let keys = Object.keys(localStorage)
    return keys.filter(function (k) { return k !== 'lastSynced'})
  }

  let checkSyncData = () => {
    let lastChecked = localStorage['lastSynced']
    if (!lastChecked || minsSinceSync(lastChecked) > 5) {
      console.log('you should sync')
      let now = new Date()


      for (let i = 0; i < localStorage.length; i++){
        localStorage[i]
      }
      setSyncStorage()
      localStorage['lastSynced'] = now
    }
  }

  let minsSinceSync = (lastTime) => {
    let now = new Date()
    return Math.round((now - lastTime) / 1000 / 60)
  }

  document.body.onload = () => {
    checkSyncData()
  }

  let setSyncStorage = (key, value) => {
    if (chrome.storage) {
      // chrome.storage.sync.set({lastSynced: now})
    }
  }

  let setShortcut = (shortcut, url) => {
    if (shortcut && url) {
      if (localStorage[shortcut] !== url) {
        localStorage[shortcut] = url
        setSyncStorage({shortcut: url})
        // chrome.storage.sync.set({value: url});
      }
    }
    return localStorage[shortcut] !== undefined && localStorage[shortcut] !== ''
  }

  formatUrl = (input) => {
    let url = input
    if (url.indexOf('http') === -1) {
      url = 'http://' + url
    }
    return url
  }

  document.getElementById('myform').onclick = (evt) => {
    evt.preventDefault()
    linkify()
  }

  document.onkeypress = (e) => {
    if (e.keyCode === 13) {
      linkify()
    }
  }

  let showLinks = document.querySelector('#show-links')

  if (showLinks) {
    showLinks.addEventListener('click', (event) => {
      chrome.tabs.create({url: 'list.html'})
    })
  }

  let openUrl = (url) => {
    if (preTabUrl !== 'chrome://newtab/') {
      window.open(url, '_blank')
    } else {
      chrome.tabs.update(preTabId, {url: url})
      this.close()
    }
  }

  let linkify = () => {
    url = document.getElementById('url').value
    shortcut = document.getElementById('shortcut').value
    let isSet = setShortcut(shortcut, url)

    if (isSet) {
      let short = localStorage[shortcut]
      url = formatUrl(short)
    } else {
      url = formatUrl(url)
    }
    openUrl(url)
  }

  let grabUrl = () => {
    let urlInput = document.getElementById('url')
    urlInput.value = currentUrl
  }

  let grab = document.getElementById('grab')

  if (grab) {
    grab.addEventListener('click', (e) => {
      grabUrl()
      e.preventDefault()
    })
  }
})()
