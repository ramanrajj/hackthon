let map, userLocation;
let markers = [];

const icons = {
    hospital: L.icon({iconUrl:'icons/hospital.png',iconSize:[32,32]}),
    police: L.icon({iconUrl:'icons/police.png',iconSize:[32,32]}),
    fire_station: L.icon({iconUrl:'icons/fire.png',iconSize:[32,32]}),
    bridge: L.icon({iconUrl:'icons/bridge.png',iconSize:[32,32]})
};

// Initialize map
document.addEventListener('DOMContentLoaded', () => {
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(pos=>{
            userLocation={lat:pos.coords.latitude,lng:pos.coords.longitude};
            loadMap(userLocation);
        }, ()=>{
            userLocation={lat:27.7172,lng:85.3240}; // Kathmandu fallback
            alert('Location denied. Showing Kathmandu.');
            loadMap(userLocation);
        });
    } else {
        userLocation={lat:27.7172,lng:85.3240};
        loadMap(userLocation);
    }

    // Attach button events
    const hb = document.getElementById('btn-hospital'); if (hb) hb.onclick = () => findPlaces('hospital');
    const pb = document.getElementById('btn-police'); if (pb) pb.onclick = () => findPlaces('police');
    const fb = document.getElementById('btn-fire'); if (fb) fb.onclick = () => findPlaces('fire_station');
    const bb = document.getElementById('btn-bridge'); if (bb) bb.onclick = () => findPlaces('bridge');
});

function loadMap(loc){
    map = L.map('map').setView([loc.lat, loc.lng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    L.marker([loc.lat, loc.lng]).addTo(map).bindPopup('Your Location').openPopup();
}

// Clear markers and results
function clearMarkers(){
    markers.forEach(m=>map.removeLayer(m.marker));
    markers=[];
    const rd = document.getElementById('results'); if (rd) rd.innerHTML='';
}

// Fetch nearby places
function findPlaces(type){
    clearMarkers();
    const radiusEl = document.getElementById('radius');
    const radius = radiusEl ? radiusEl.value : 5000;
    let query;

    // Build Overpass query; limit output to 50 results to reduce server load
    if (type === 'bridge') {
        query = `[out:json][timeout:25];
        (
            node["bridge"="yes"](around:${radius},${userLocation.lat},${userLocation.lng});
            way["bridge"="yes"](around:${radius},${userLocation.lat},${userLocation.lng});
        );
        out center 50;`;
    } else {
        query = `[out:json][timeout:25];
        (
            node["amenity"="${type}"](around:${radius},${userLocation.lat},${userLocation.lng});
            way["amenity"="${type}"](around:${radius},${userLocation.lat},${userLocation.lng});
            relation["amenity"="${type}"](around:${radius},${userLocation.lat},${userLocation.lng});
        );
        out center 50;`;
    }

    const resultsDiv = document.getElementById('results');
    if (resultsDiv) resultsDiv.innerHTML = '<em>Searching...</em>';

    const OVERPASS_ENDPOINTS = [
        'https://overpass-api.de/api/interpreter',
        'https://lz4.overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter'
    ];

    function timeout(ms) {
        return new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));
    }

    // Try each endpoint with exponential backoff retries
    async function tryFetch(query) {
        const maxAttempts = 3;
        const baseDelay = 1000; // ms
        for (const ep of OVERPASS_ENDPOINTS) {
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    const res = await Promise.race([
                        fetch(ep, { method: 'POST', body: query }),
                        timeout(20000)
                    ]);
                    if (!res.ok) {
                        console.warn(`Overpass endpoint ${ep} returned ${res.status} (attempt ${attempt})`);
                        // fall through to retry
                    } else {
                        const text = await res.text();
                        try { return JSON.parse(text); } catch (e) { console.warn('Non-JSON response from', ep); }
                    }
                } catch (err) {
                    console.warn(`Fetch to ${ep} failed (attempt ${attempt}):`, err.message || err);
                }

                // backoff before next attempt
                const delay = baseDelay * Math.pow(2, attempt - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            // after attempts for this endpoint, try next endpoint
        }
        throw new Error('All Overpass endpoints failed or timed out after retries');
    }

    tryFetch(query)
        .then(data => {
            const results=[];
            (data.elements||[]).forEach(el=>{
                const lat=el.lat || (el.center && el.center.lat);
                const lon=el.lon || (el.center && el.center.lon);
                if(!lat||!lon) return;
                const name=(el.tags && (el.tags.name)) || (type==='bridge'?'Bridge':'Unnamed');
                const icon = icons[type] || null;
                const marker = L.marker([lat,lon], icon ? {icon} : {}).addTo(map)
                    .bindPopup(`<b>${name}</b><br>Lat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)}`);
                markers.push({marker, name, lat, lon, type});
                results.push({name, lat, lon});
            });

            // Fit map to markers
            if(markers.length>0){
                const group=L.featureGroup(markers.map(m=>m.marker));
                map.fitBounds(group.getBounds(), {maxZoom:16});
            }

            // Display results below map
            const resultsDiv = document.getElementById('results');
            if(resultsDiv){
                resultsDiv.innerHTML='';
                results.forEach(item=>{
                    const el = document.createElement('div');
                    el.className='result-item';
                    el.innerHTML=`<b>${item.name}</b> <br>Lat: ${item.lat.toFixed(5)}, Lon: ${item.lon.toFixed(5)}`;
                    el.onclick = () => {
                        map.setView([item.lat, item.lon], 16);
                        const found = markers.find(m => m.lat === item.lat && m.lon === item.lon);
                        if(found) found.marker.openPopup();
                    };
                    resultsDiv.appendChild(el);
                });
            }
        })
        .catch(err=>{
            console.error(err);
            const resultsDiv = document.getElementById('results');
            if (resultsDiv) resultsDiv.innerHTML = '<div style="color:#900">Error loading data. Overpass API may be down or rate-limited. Try again later.</div>';
            alert('Error fetching data from Overpass API. See console for details.');
        });
}
