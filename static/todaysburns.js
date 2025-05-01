'use strict';

const openStreetMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
const todaysBurnsLayer = L.tileLayer(
  'https://kmi.dbca.wa.gov.au/geoserver/public/gwc/service/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=mercator&tilematrix=mercator:{z}&tilecol={x}&tilerow={y}&format=image/png&layer=public:todays_burns&style=public:todays_burns_ShowPinpoint'
);

const map = L.map('map', {
  center: [-24, 120],
  zoom: 5,
  minZoom: 4,
  maxZoom: 17,
  layers: [openStreetMap, todaysBurnsLayer],
  attributionControl: false,
});

// Function to set the popup for each burn feature added to the layer.
function setBurnStyle(feature, layer) {
  layer.bindPopup(`
<table class="table table-bordered table-striped table-sm">
  <tbody>
    <tr>
      <th>Burn ID:</th>
      <td>${feature.properties.burn_id}</td>
    </tr>
    <tr>
      <th>Updated on:</th>
      <td>${feature.properties.burn_target_date}</td>
    </tr>
    <tr>
      <th>Status:</th>
      <td>${feature.properties.burn_stat}</td>
    </tr>
    <tr>
      <th>Location:</th>
      <td>${feature.properties.location}</td>
    </tr>
    <tr>
      <th>Purpose:</th>
      <td>${feature.properties.burn_purpose}</td>
    </tr>
    <tr>
      <th>Indicative area (ha):</th>
      <td>${Number(feature.properties.indicative_area).toFixed(0)}</td>
    </tr>
    <tr>
      <th>Estimated start:</th>
      <td>${feature.properties.burn_est_start}</td>
    </tr>
    <tr>
      <th>Planned area today (ha):</th>
      <td>${Number(feature.properties.burn_planned_area_today).toFixed(2)}</td>
    </tr>
    <tr>
      <th>Planned distance today (km):</th>
      <td>${Number(feature.properties.burn_planned_distance_today).toFixed(2)}</td>
    </tr>
  </tbody>
</table>
  `);
}

// Define the (initially) empty burns detail popup layer and add it to the map.
const todaysBurnsDetailsLayer = L.geoJSON('', {
  style: { opacity: 0 },
  onEachFeature: setBurnStyle,
}).addTo(map);

// Function to load burn details from the WFS endpoint.
function loadTodaysBurnsDetails(burnsDetailsLayer) {
  // Remove any existing data from the layer.
  burnsDetailsLayer.clearLayers();
  // Query the WFS endpoint for burns details.
  const todaysBurnsWFS =
    'https://kmi.dbca.wa.gov.au/geoserver/public/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=public%3Atodays_burns&outputFormat=application%2Fjson';
  fetch(todaysBurnsWFS)
    // Parse the response as JSON.
    .then((resp) => resp.json())
    // Replace the data in the burns details layer.
    .then(function (data) {
      // Add the device data to the GeoJSON layer.
      burnsDetailsLayer.addData(data);
    });
}
// Immediately run the function to populate the details layer.
loadTodaysBurnsDetails(todaysBurnsDetailsLayer);
