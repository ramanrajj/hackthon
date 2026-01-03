/* init.js — initializes the map, handles geolocation and buttons */
(function () {
  const App = {
    map: null,
    userLocation: null,
    markers: []
  };

  function init() {
    if (!navigator.geolocation) {
      loadFallbackLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        App.userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
        initializeMap(App.userLocation);
      },
      () => loadFallbackLocation()
    );
  }

  function loadFallbackLocation() {
    App.userLocation = { lat: 27.7172, lng: 85.3240 }; // Kathmandu
    // Non-blocking: add a subtle notice in console and let UI show fallback marker
    console.info('Location access denied. Using fallback location (Kathmandu).');
    initializeMap(App.userLocation);
  }

  function initializeMap(location) {
    App.map = L.map('map').setView([location.lat, location.lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(App.map);

    L.marker([location.lat, location.lng]).addTo(App.map).bindPopup('Current Location');

    // Ensure map renders correctly when inside a flex container
    setTimeout(() => { if (App.map) App.map.invalidateSize(); }, 50);
    window.addEventListener('resize', () => { if (App.map) App.map.invalidateSize(); });

    enableButtons();
  }

  function enableButtons() {
    document.getElementById('btn-hospital').disabled = false;
    document.getElementById('btn-police').disabled = false;
    document.getElementById('btn-fire').disabled = false;
  }

  // Expose for other modules
  window.App = App;
  window.AppInit = { init, initializeMap, loadFallbackLocation };

  document.addEventListener('DOMContentLoaded', init);
})();