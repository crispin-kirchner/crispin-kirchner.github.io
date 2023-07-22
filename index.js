"use strict";

// Constants
const LAST_READ = 'lastRead';
const MAP_VISIBLE = 'mapVisible';
const READ_MORE = 'readMore';
const MAP_OPT_IN = 'mapOptIn';
const CONVENIENCE_OPT_IN = 'convenienceOptIn';
const DATE_FORMAT = new Intl.DateTimeFormat(navigator.language, { dateStyle: 'short' });
const EMAIL_ADDRESS = ['h_c_._n_i_w_e_u_l_b', 'm_a_p_s_._r_e_n_h_c_r_i_k_._n_i_p_s_i_r_c'];
const DEFAULT_ZOOM_LEVEL = 15;
const TRANSITION_DELAY_MS = 250;
const OVERLAYS = ['about', 'privacy', 'impressum', '404', 'share-popup'];

// State
let currentKey;

// Initialization
const KEYS = Object.keys(ENTRIES)
  .sort((k1, k2) => k2.localeCompare(k1));

const MAP = L.map('map', {zoomControl: false});
let TILE_LAYER;
setupMap(localStorage.getItem(MAP_OPT_IN) === 'true');
const ALL_ENTRIES_BOUNDS = L.latLngBounds();
for(let i = KEYS.length - 1; i >= 0; --i) {
  let key = KEYS[i];
  let entry = ENTRIES[key];
  ALL_ENTRIES_BOUNDS.extend(L.latLng(entry.latLon));
  entry.dateFormatted = DATE_FORMAT.format(new Date(key.substr(0, 10)));

  let popup = new L.Popup(entry.latLon, {
    closeButton: false,
    content: `<a href="#/${key}"><img class="rounded" src="images/96w/${entry.img}" srcset="images/32w/${entry.img} 32w, images/64w/${entry.img} 64w, images/96w/${entry.img} 96w" sizes="32px"></a>`,
    minWidth: 29,
    closeOnEscapeKey: false,
    closeOnClick: false,
    autoClose: false,
    interactive: true,
    autoPan: false,
    offset: L.point(0, 14)
  });
  MAP.addLayer(popup);
};

if(localStorage.getItem(CONVENIENCE_OPT_IN) === 'true') {
  document.getElementById('map-visible').checked = localStorage.getItem(MAP_VISIBLE) === 'true';
  document.getElementById('read-more').checked = localStorage.getItem(READ_MORE) === 'true';
}

document.getElementById('nav-end').href =`#/${KEYS[KEYS.length - 1]}`;

// event handlers
registerConvenienceEventHandlers();
document.getElementById('fullscreen-map').onchange = evt => {
  setTimeout(() => MAP.invalidateSize(), TRANSITION_DELAY_MS);
};

Array.prototype.forEach.call(
  document.getElementsByClassName('subscribe-link'),
  a => a.href = `mailto:${EMAIL_ADDRESS.join('_@_').split('_').reverse().join('')}?subject=%22Bilder%20und%20Koordinaten%22%20abonnieren&body=Hi%20Crispin%0A%0AKannst%20du%20mir%20bitte%20eine%20E-Mail%20schreiben,%20wenn%20du%20ein%20neues%20Bild%20ver%C3%B6ffentlichst%3F%0A%0AMerci,%0A`);

function setupMap(active) {
  if(!!active === !!TILE_LAYER) {
    return;
  }
  if(active) {
    TILE_LAYER = L
      .tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'Kartendaten: © <a href="https://openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>-Mitwirkende, SRTM | Kartendarstellung: © <a href="http://opentopomap.org" target="_blank">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank">CC-BY-SA</a>)'
      })
      .addTo(MAP);
  }
  else {
    TILE_LAYER.remove();
    TILE_LAYER = null;
  }
  toggleClass(document.getElementById('map-opt-out-notice'), 'd-none', active);
}

function registerConvenienceEventHandlers() {
  if(localStorage.getItem(CONVENIENCE_OPT_IN) === 'true') {
    document.getElementById('map-visible').onchange = evt => {
      localStorage.setItem(MAP_VISIBLE, evt.target.checked);
    };
    document.getElementById('read-more').onchange = evt => {
      localStorage.setItem(READ_MORE, evt.target.checked);
    };
  }
  else {
    document.getElementById('map-visible').onchange = null;
    document.getElementById('read-more').onchange = null;
  }
}

function mountConsentForm(container, close) {
  document.getElementById(container).innerHTML = `
      <form id="consent-form">
        <p>Bestimmte Funktionalitäten kann ich aus Datenschutzgründen nur mit deiner Zustimmung aktivieren. Deine Datenschutzeinstellungen werden auf deinem Gerät gespeichert.</p>
        <div class="form-check form-switch h5">
          <input class="form-check-input" type="checkbox" id="map-opt-in"></input>
          <label class="form-check-label h2" for="map-opt-in">Landkarte anzeigen</label>
        </div>
        <p>
          Ich kann eine Landkarte anzeigen, damit du zu jedem Foto siehst, wo es aufgenommen wurde. Die Landkarte wird vom Dienst <a href="https://opentopomap.org" target="_blank">OpenTopoMap</a> abgerufen. Es gelten deren Datenschutzbestimmungen.
        </p>
        <div class="form-check form-switch h5">
          <input class="form-check-input" type="checkbox" id="convenience-opt-in"></input>
          <label class="form-check-label h2" for="convenience-opt-in">Daten auf deinem Gerät speichern</label>
        </div>
        <p>
          Wenn du das wünschst, speichere ich gewisse Daten auf deinem Gerät, um dir die Bedienung zu erleichtern. Das sind:
          <ul>
            <li>Neuster gelesener Beitrag</li>
            <li>Karte an/aus</li>
            <li><em>Mehr lesen</em> an/aus</li>
          </ul>
          Die Daten verbleiben auf deinem Gerät und werden nicht gesammelt oder ausgewertet.
        </p>
        <div class="d-flex flex-column-reverse flex-sm-row justify-content-between mt-4">
          <div class="mt-2 mt-sm-0 d-flex d-sm-block">
            <button type="button" class="btn btn-secondary flex-fill me-2" onclick="optAll(false)">Alles ablehnen</button>
            <button type="button" class="btn btn-secondary flex-fill" onclick="optAll(true)">Alles akzeptieren</button>
          </div>
          <button type="submit" class="btn btn-primary">Speichern</button>
        </div>
      </form>`;
  document.getElementById('consent-form').onsubmit = onConsentFormSubmit(close);
  document.getElementById('map-opt-in').checked = localStorage.getItem(MAP_OPT_IN) === 'true';
  document.getElementById('convenience-opt-in').checked = localStorage.getItem(CONVENIENCE_OPT_IN) === 'true';
}

function isOptInsUndefined() {
  return (localStorage.getItem(CONVENIENCE_OPT_IN)  === null)
    || (localStorage.getItem(MAP_OPT_IN)  === null);
}

function optAll(optIn) {
  document.getElementById('map-opt-in').checked = optIn;
  document.getElementById('convenience-opt-in').checked = optIn;
  document.getElementById('consent-form').requestSubmit();
}

function onConsentFormSubmit(close) {
  return evt => {
    const convenienceOptIn = document.getElementById('convenience-opt-in').checked;
    localStorage.setItem(CONVENIENCE_OPT_IN, convenienceOptIn);
    if(!convenienceOptIn) {
      localStorage.removeItem(LAST_READ);
      localStorage.removeItem(MAP_VISIBLE);
      localStorage.removeItem(READ_MORE);
    }
    else {
      localStorage.setItem(MAP_VISIBLE, document.getElementById('map-visible').checked);
      localStorage.setItem(READ_MORE, document.getElementById('read-more').checked);
      if(localStorage.getItem(LAST_READ) === null) {
        localStorage.setItem(LAST_READ, KEYS[0]);
      }
    }
    registerConvenienceEventHandlers();

    const mapOptIn = document.getElementById('map-opt-in').checked;
    const changed = (localStorage.getItem(MAP_OPT_IN) === 'true') !== !!mapOptIn;
    setMapOptIn(mapOptIn);
    if(!mapOptIn && changed) {
      document.getElementById('map-visible').checked = false;
    }

    close();
    evt?.preventDefault();
  }
}

function setMapOptIn(optIn) {
  localStorage.setItem(MAP_OPT_IN, optIn);
  setupMap(optIn);
}

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

    let unreadIndicator = document.getElementById('unread-indicator');
  if(localStorage.getItem(CONVENIENCE_OPT_IN) === 'true') {
    // update last read
    let lastRead = localStorage.getItem(LAST_READ) || '';
    if (key > lastRead) {
        lastRead = key;
        localStorage.setItem(LAST_READ, lastRead);
    }

    // display unread count
    let lastReadIndex = KEYS.findIndex(el => el === lastRead);
    let hasUnread = lastReadIndex > 0;
    if (hasUnread) {
        unreadIndicator.textContent = lastReadIndex;
    }
    toggleClass(unreadIndicator, 'd-none', !hasUnread);
  }
  else {
    toggleClass(unreadIndicator, 'd-none', true);
  }

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
  document.getElementById('image').alt = entry.title;
  document.getElementById('caption-date').innerHTML = entry.dateFormatted;
  document.getElementById('caption-title').innerHTML = entry.title;
  document.getElementById('entry-text').innerHTML = entry.text ? entry.text : '';
  document.getElementById('entry-text').scrollTop = 0;

  let index = KEYS.findIndex(el => el === key);
  let isFirst = index === 0;
  document.getElementById('nav-left').href = index <= 1
    ? '#'
    : `#/${KEYS[index - 1]}`;
  toggleClass(document.getElementById('nav-left'), 'd-none', isFirst);
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
  if(withoutFilter === 'privacy') {
    document.getElementById('privacy-consent-form-container').innerHTML = '';
  }
}

function getCloseButtonHref() {
  return currentKey === KEYS[0]
    ? '#'
    : `#/${currentKey}`;
}

function showOverlay(name) {
  let overlay = document.getElementById(name);
  closeOverlays(name);
  const closeHref = document.getElementById('fullscreen-map').checked
    ? '#/map'
    : getCloseButtonHref();
  const closeA = overlay.getElementsByClassName('close-overlay')[0];
  if(closeA) {
    closeA.href = closeHref;
  }
  if(name === 'privacy') {
    mountConsentForm('privacy-consent-form-container', () => location = closeHref);
  }
  if(name === 'share-popup') {
    initShareOverlay();
  }
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
  document.getElementById('map-visible').checked = true;
  let fullscreenMap = document.getElementById('fullscreen-map');
  if(!fullscreenMap.checked) {
    fullscreenMap.click();
    document.getElementById('fullscreen-map-button').href = getCloseButtonHref();
  }
}

function closeConsent() {
  document.getElementById('consent').classList.add('d-none');
  document.getElementById('consent-consent-form-container').innerHTML = '';
}

function initShareOverlay() {
  showClipboardAlert();
  const input = document.getElementById('share-input');
  const url = `${location.protocol}//${location.host}/#/${currentKey}`;
  input.value = url;
  input.focus();
  input.select();
  if(!navigator.clipboard) {
    showClipboardAlert(false);
    return;
  }
  navigator.clipboard.writeText(url).then(
    () => showClipboardAlert(true),
    () => showClipboardAlert(false));
}

function showClipboardAlert(success) {
  const sharePopup = document.getElementById('share-popup');
  const alertSuccess = sharePopup.getElementsByClassName('alert-success')[0];
  const alertDanger = sharePopup.getElementsByClassName('alert-warning')[0];
  toggleClass(alertSuccess, 'd-none', !success);
  toggleClass(alertDanger, 'd-none', success || typeof(success) === 'undefined');
}

function router(evt) {
  let route = location.hash.slice(1) || '/';
  let routeSliced = route.slice(1);
  // FIXME Corner-case: geht man auf #map ist der root container gescrollt
  
  // privacy opt-ins
  if(isOptInsUndefined() && routeSliced !== 'privacy') {
    mountConsentForm('consent-consent-form-container', closeConsent);
    toggleClass(document.getElementById('consent'), 'd-none', false);
  }
  else {
    closeConsent();
  }

  if(route === '/' || !currentKey) {
    showImage(getLastUnreadKey());
    if(route === '/') {
      return;
    }
  }

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
