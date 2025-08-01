'use strict';

const openStreetMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png');

const map = L.map('map', {
  center: [-24, 120],
  zoom: 5,
  minZoom: 4,
  maxZoom: 17,
  layers: [openStreetMap],
  attributionControl: false,
});

// Function to set the style, label and popup for each burn feature added to the layer.
function setBurnStyle(feature, layer) {
  const centroid = turf.centroid(feature).geometry.coordinates;
  new L.CircleMarker([centroid[1], centroid[0]], { stroke: false, fill: false })
    .bindTooltip(feature.properties.burn_id, { permanent: true, direction: 'right', offset: [-10, 0], className: 'burn-label' })
    .addTo(map);
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

// Define the (initially empty) Today's Burns layer and add it to the map.
const todaysBurnsLayer = L.geoJSON('', {
  // style: { opacity: 0 },
  style: function (feature) {
    let color = '#3388ff';
    switch (feature.properties.burn_stat) {
      case 'Planned - No Prior Ignitions':
        color = '#ffaa00';
        break;
      case 'Active - Planned Ignitions Today':
        color = '#e60000';
        break;
      case 'Active - No Planned Ignitions Today':
        color = '#730000';
        break;
    }
    return {
      color: color,
      opacity: 0.8,
      fillOpacity: 0.4,
    };
  },
  onEachFeature: setBurnStyle,
}).addTo(map);

// Function to load burn details from the WFS endpoint.
function loadTodaysBurnsDetails(burnsDetailsLayer) {
  // Remove any existing data from the layer.
  burnsDetailsLayer.clearLayers();
  // Query the WFS endpoint for burns details.
  const todaysBurnsWFS =
    'https://kb.dbca.wa.gov.au/geoserver/kaartdijin-boodja-public/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=kaartdijin-boodja-public:todays_burns&outputFormat=application/json';
  fetch(todaysBurnsWFS)
    // Parse the response as JSON.
    .then((resp) => resp.json())
    // Replace the data in the burns details layer.
    .then(function (data) {
      // Add the device data to the GeoJSON layer.
      burnsDetailsLayer.addData(data);
    });
}
// Immediately run the function to populate the burns layer.
loadTodaysBurnsDetails(todaysBurnsLayer);
