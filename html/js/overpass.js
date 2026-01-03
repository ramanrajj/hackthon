/* overpass.js — queries Overpass API for POIs and returns marker data */
(function () {
  function findPlaces(type, radius = 5000) {
    return new Promise((resolve, reject) => {
      if (!window.App || !window.App.userLocation) return reject(new Error('Map or user location not ready'));

      const q = `[out:json][timeout:25];
(
  node["amenity"="${type}"](around:${radius},${window.App.userLocation.lat},${window.App.userLocation.lng});
  way["amenity"="${type}"](around:${radius},${window.App.userLocation.lat},${window.App.userLocation.lng});
  relation["amenity"="${type}"](around:${radius},${window.App.userLocation.lat},${window.App.userLocation.lng});
);
out center;`;

      fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: q
      })
        .then(res => res.json())
        .then(data => {
          if (!data.elements) return resolve([]);

          const results = [];

          data.elements.forEach(el => {
            const lat = el.lat || (el.center && el.center.lat);
            const lon = el.lon || (el.center && el.center.lon);
            if (!lat || !lon) return;
            const name = (el.tags && (el.tags.name || el.tags['name:en'])) || 'Unnamed';

            results.push({ name, lat, lon, raw: el });
          });

          resolve(results);
        })
        .catch(err => reject(err));
    });
  }

  window.Overpass = { findPlaces };
})();