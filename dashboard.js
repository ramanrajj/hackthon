const map = L.map('map').setView([27.7172, 85.3240], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const socket = io('http://localhost:3000');
const markers = {};

fetch('http://localhost:3000/api/users')
  .then(res => res.json())
  .then(users => users.forEach(updateMarker));

socket.on('location-update', user => {
  updateMarker(user);
});

function updateMarker(user) {
  if (markers[user.userId]) {
    markers[user.userId].setLatLng([user.lat, user.lng]);
  } else {
    markers[user.userId] = L.marker([user.lat, user.lng])
      .addTo(map)
      .bindPopup(`<b>${user.name}</b><br>Phone: ${user.phone}`);
  }
}
