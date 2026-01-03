/* ui.js — handles UI events, results rendering and interaction */
(function () {
  function clearMarkersAndResults() {
    if (!window.App) return;
    window.App.markers.forEach(m => { if (m.marker && window.App.map) window.App.map.removeLayer(m.marker); });
    window.App.markers = [];
    const resultsDiv = document.getElementById('results');
    if (resultsDiv) resultsDiv.innerHTML = '';
  }

  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const toRad = v => v * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function populateResults(results, type) {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;
    resultsDiv.innerHTML = '';

    results.forEach((r, i) => {
      const dist = (window.App && window.App.userLocation) ? haversine(window.App.userLocation.lat, window.App.userLocation.lng, r.lat, r.lon) : null;

      const item = document.createElement('div');
      item.className = 'result-item';
      item.setAttribute('data-index', i);
      item.innerHTML = `<div class="result-title">${r.name}</div>` +
        (dist !== null ? `<div class="result-sub">${dist.toFixed(2)} km away</div>` : `<div class="result-sub">${r.lat.toFixed(5)}, ${r.lon.toFixed(5)}</div>`);

      item.addEventListener('click', () => {
        if (window.App && window.App.markers[i]) {
          window.App.map.setView([r.lat, r.lon], 16);
          window.App.markers[i].marker.openPopup();
        }
      });
      resultsDiv.appendChild(item);
    });
  }

  const ICON_URLS = {
    hospital: 'https://cdn-icons-png.flaticon.com/512/2967/2967350.png',
    police: 'https://cdn-icons-png.flaticon.com/512/2991/2991108.png',
    fire_station: 'https://cdn-icons-png.flaticon.com/512/482/482521.png',
    bridge: 'https://cdn-icons-png.flaticon.com/512/684/684908.png'
  };

  function addMarkers(results, type) {
    if (!window.App || !window.App.map) return;
    const icon = ICON_URLS[type] ? L.icon({ iconUrl: ICON_URLS[type], iconSize: [32, 32] }) : null;
    results.forEach(r => {
      const opts = icon ? { icon } : {};
      const dist = (window.App && window.App.userLocation) ? haversine(window.App.userLocation.lat, window.App.userLocation.lng, r.lat, r.lon) : null;
      const popupContent = `<b>${r.name}</b>` + (dist !== null ? `<br>${dist.toFixed(2)} km away` : '');
      const marker = L.marker([r.lat, r.lon], opts).addTo(window.App.map).bindPopup(popupContent);
      window.App.markers.push({ marker, name: r.name, lat: r.lat, lon: r.lon, dist });
    });
  }

  function onSearch(type) {
    if (!window.Overpass || !window.App) return;
    clearMarkersAndResults();

    const radiusEl = document.getElementById('radius');
    const radius = radiusEl ? parseInt(radiusEl.value, 10) : 5000;

    window.Overpass.findPlaces(type, radius)
      .then(results => {
        if (!results || results.length === 0) {
          alert('No nearby locations found.');
          return;
        }

        addMarkers(results, type);
          populateResults(results, type);

        // Fit to markers
        if (window.App.markers.length > 0) {
          const group = L.featureGroup(window.App.markers.map(m => m.marker));
          window.App.map.fitBounds(group.getBounds(), { maxZoom: 16 });
        }

        // If police, scroll results into view
        if (type === 'police') {
          const resultsDiv = document.getElementById('results');
          if (resultsDiv) resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      })
      .catch(err => {
        console.error(err);
        alert('Error searching for places. Try again later.');
      });
  }

  function attachHandlers() {
    const hospitalBtn = document.getElementById('btn-hospital');
    const policeBtn = document.getElementById('btn-police');
    const fireBtn = document.getElementById('btn-fire');

    if (hospitalBtn) hospitalBtn.addEventListener('click', () => onSearch('hospital'));
    if (policeBtn) policeBtn.addEventListener('click', () => onSearch('police'));
    if (fireBtn) fireBtn.addEventListener('click', () => onSearch('fire_station'));
    const bridgeBtn = document.getElementById('btn-bridge');
    if (bridgeBtn) bridgeBtn.addEventListener('click', () => onSearch('bridge'));
  }

  document.addEventListener('DOMContentLoaded', attachHandlers);

  window.UI = { clearMarkersAndResults, populateResults, addMarkers, onSearch };
})();