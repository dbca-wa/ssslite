'use strict';

const openStreetMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
const ibpLayer = L.tileLayer(
  'https://kmi.dbca.wa.gov.au/geoserver/public/gwc/service/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=mercator&tilematrix=mercator:{z}&tilecol={x}&tilerow={y}&format=image/png&layer=public:latest_indicative_burn_program2&style=public:latest_indicative_burn_program2_ShowPinpoint'
);

const map = L.map('map', {
  center: [-24, 120],
  zoom: 5,
  minZoom: 4,
  maxZoom: 17,
  layers: [openStreetMap, ibpLayer],
  attributionControl: false,
});

// Function to set the popup for each burn feature added to the layer.
function setBurnStyle(feature, layer) {
  layer.bindPopup(`
<table class="table table-bordered table-striped table-sm">
  <tbody>
    <tr>
      <th>Burn ID:</th>
      <td>${feature.properties.burnid}</td>
    </tr>
    <tr>
      <th>Region:</th>
      <td>${feature.properties.region}</td>
    </tr>
    <tr>
      <th>District:</th>
      <td>${feature.properties.district}</td>
    </tr>
    <tr>
      <th>Location:</th>
      <td>${feature.properties.location}</td>
    </tr>
    <tr>
      <th>Purpose:</th>
      <td>${feature.properties.purpose}</td>
    </tr>
    <tr>
      <th>Area (ha):</th>
      <td>${Number(feature.properties.area_ha).toFixed(0)}</td>
    </tr>
    <tr>
      <th>Perimeter (km):</th>
      <td>${Number(feature.properties.perim_km).toFixed(0)}</td>
    </tr>
  </tbody>
</table>
  `);
}

// Define the (initially) empty burns detail popup layer and add it to the map.
const indicativeBurnPlanLayer = L.geoJSON('', {
  style: { opacity: 0 },
  onEachFeature: setBurnStyle,
}).addTo(map);

// Function to load burn details from the WFS endpoint.
function loadTodaysBurnsDetails(burnsDetailsLayer) {
  // Remove any existing data from the layer.
  burnsDetailsLayer.clearLayers();
  // Query the WFS endpoint for burns details.
  const ibpWFS =
    'https://kmi.dbca.wa.gov.au/geoserver/public/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=public%3Alatest_indicative_burn_program2&outputFormat=application%2Fjson';
  fetch(ibpWFS)
    // Parse the response as JSON.
    .then((resp) => resp.json())
    // Replace the data in the burns details layer.
    .then(function (data) {
      // Add the device data to the GeoJSON layer.
      burnsDetailsLayer.addData(data);
    });
}
// Immediately run the function to populate the details layer.
loadTodaysBurnsDetails(indicativeBurnPlanLayer);
