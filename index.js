"use strict";

// Constants
const LAST_READ = 'lastRead';
const DATE_FORMAT = new Intl.DateTimeFormat(navigator.language, { dateStyle: 'medium' });
const EMAIL_ADDRESS = ['h_c_._n_i_w_e_u_l_b', 'm_a_p_s_._r_e_n_h_c_r_i_k_._n_i_p_s_i_r_c'];
const DEFAULT_ZOOM_LEVEL = 15;
const TRANSITION_DELAY_MS = 250;
const OVERLAYS = ['about', 'privacy', '404'];

// State
let currentKey;

// Initialization
const KEYS = Object.keys(ENTRIES)
  .sort((k1, k2) => k2.localeCompare(k1));

const MAP = L.map('map');
L.tileLayer('https://c.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Kartendaten: © <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende, SRTM | Kartendarstellung: © <a href="http://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
}).addTo(MAP);
const ALL_ENTRIES_BOUNDS = L.latLngBounds();
KEYS.forEach(key => {
  let entry = ENTRIES[key];
  ALL_ENTRIES_BOUNDS.extend(L.latLng(entry.latLon));
  entry.dateFormatted = DATE_FORMAT.format(new Date(key.substr(0, 10)));
  L.marker(entry.latLon)
    .on('click', evt => location = `#/${key}`)
    .bindTooltip(`<img src="images/thumbs/${entry.img}"/><br/>${entry.dateFormatted} ${entry.title}`)
    .addTo(MAP);
});

document.getElementById('map-visible').checked = localStorage.getItem('mapVisible') === 'true';
document.getElementById('read-more').checked = localStorage.getItem('readMore') === 'true';

document.getElementById('map-visible').onchange = evt => {
    localStorage.setItem('mapVisible', evt.target.checked);
};
document.getElementById('read-more').onchange = evt => {
    localStorage.setItem('readMore', evt.target.checked);
};
document.getElementById('fullscreen-map').onchange = evt => {
  setTimeout(() => MAP.invalidateSize(), TRANSITION_DELAY_MS);
};

Array.prototype.forEach.call(
    document.getElementsByClassName('subscribe-link'),
    a => a.href = `mailto:${EMAIL_ADDRESS.join('_@_').split('_').reverse().join('')}?subject=%22Bilder%20und%20Koordinaten%22%20abonnieren&body=Hi%20Crispin%0A%0AKannst%20du%20mir%20bitte%20eine%20E-Mail%20schreiben,%20wenn%20du%20ein%20neues%20Bild%20ver%C3%B6ffentlichst%3F%0A%0AMerci,%0A`);

function getLastUnreadKey() {
  let index = 0;
  const lastRead = localStorage.getItem(LAST_READ);
  if (lastRead) {
    let lastReadIndex = KEYS.findIndex(el => el === lastRead);
    if (lastReadIndex >= 0) {
      index = Math.max(lastReadIndex - 1, 0);
    }
  }
  return KEYS[index];
}

function goToNewestEntry() {
  localStorage.removeItem(LAST_READ);
  location = '#';
}

function zoomMapToAllEntries() {
    MAP.fitBounds(ALL_ENTRIES_BOUNDS);
}

function zoomToCurrentEntry() {
    MAP.setView(ENTRIES[currentKey].latLon, DEFAULT_ZOOM_LEVEL);
}

function showImage(key) {
  // TODO only show controls while hovering
  // TODO spinner while loading images
  // TODO add sizes attribute for portrait images
  // TODO lazy initialize/maintain map only when visible
  // FIXME scrollt man in der textbox runter ist nach bildwechsel immer noch gescrollt

  closeOverlays();
  
  currentKey = key;

  let lastRead = localStorage.getItem(LAST_READ) || '';
  if (key > lastRead) {
      lastRead = key;
      localStorage.setItem(LAST_READ, lastRead);
  }
  let lastReadIndex = KEYS.findIndex(el => el === lastRead);
  let unreadIndicator = document.getElementById('unread-indicator');
  let hasUnread = lastReadIndex > 0;
  if (hasUnread) {
      unreadIndicator.textContent = lastReadIndex;
  }
  toggleClass(unreadIndicator, 'd-none', !hasUnread);

  let entry = ENTRIES[key];

  let fullscreenMap = document.getElementById('fullscreen-map');
  let delay = 0;
  if(fullscreenMap.checked) {
    delay = TRANSITION_DELAY_MS + 50;
    fullscreenMap.click();
  }
  document.getElementById('fullscreen-map-button').href = '#/map';
  setTimeout(() => {
    MAP.setView(entry.latLon, MAP.getZoom() || DEFAULT_ZOOM_LEVEL, {
        animate: true,
        duration: 1
    });
  }, delay);

  document.getElementById('bgimage').src = `images/bg/${entry.img}`;
  document.getElementById('image').srcset = `images/720w/${entry.img} 720w, images/1280w/${entry.img} 1280w, images/1920w/${entry.img} 1920w, images/2560w/${entry.img} 2560w, images/4096w/${entry.img} 4096w`;
  document.getElementById('image').src = `images/4096w/${entry.img}`;
  document.getElementById('caption-date').innerHTML = entry.dateFormatted;
  document.getElementById('caption-title').innerHTML = entry.title;
  document.getElementById('entry-text').innerHTML = entry.text ? entry.text : '';

  let index = KEYS.findIndex(el => el === key);
  let isFirst = index === 0;
  document.getElementById('nav-left').href = isFirst
    ? '#'
    : `#/${KEYS[index - 1]}`;
  toggleClass(document.getElementById('nav-left'), 'd-none', isFirst);
  toggleClass(document.getElementById('nav-start'), 'd-none', isFirst);
  let isLast = index === KEYS.length - 1;
  document.getElementById('nav-right').href = isLast
    ? '#'
    : `#/${KEYS[index + 1]}`
  toggleClass(document.getElementById('nav-right'), 'd-none', isLast);
}

function closeOverlays(withoutFilter) {
  OVERLAYS
    .filter(n => n !== withoutFilter)
    .forEach(n => toggleClass(document.getElementById(n), 'd-none', true));
}

function getCloseButtonHref() {
  return currentKey === KEYS[0]
    ? '#'
    : `#/${currentKey}`;
}

function showOverlay(name) {
  let overlay = document.getElementById(name);
  closeOverlays(name);
  // TODO map-fullscreen muss hier noch berücksichtigt werden
  overlay.getElementsByClassName('close-overlay')[0].href = document.getElementById('fullscreen-map').checked
    ? '#/map'
    : getCloseButtonHref();
  toggleClass(overlay, 'd-none', false);
}

function toggleClass(elem, clazz, toggle) {
    if (toggle) {
        elem.classList.add(clazz);
    }
    else {
        elem.classList.remove(clazz);
    }
}

function fullscreenMap() {
  closeOverlays();
  let fullscreenMap = document.getElementById('fullscreen-map');
  if(!fullscreenMap.checked) {
    fullscreenMap.click();
    document.getElementById('fullscreen-map-button').href = getCloseButtonHref();
  }
}

function router(evt) {
  let route = location.hash.slice(1) || '/';
  if(route === '/' || !currentKey) {
    showImage(getLastUnreadKey());
    if(route === '/') {
      return;
    }
  }

  let routeSliced = route.slice(1);
  if(OVERLAYS.includes(routeSliced)) {
    showOverlay(routeSliced);
    return;
  }

  if(route === '/map') {
    fullscreenMap();
    return;
  }

  if(KEYS.includes(routeSliced)) {
    showImage(routeSliced);
    return;
  }

  document.getElementById('404-address').textContent = location.hash;
  showOverlay('404');
}

onload = router;
onhashchange = router;

(function () {
    var src = 'node_modules/eruda/eruda.js';
    if (/crispin-kirchner.github.io/.test(window.location)) return;
    document.write('<script src="' + src + '"></script>');
    document.write('<script>eruda.init();</script>');
})();
