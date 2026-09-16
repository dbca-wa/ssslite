'use strict';

// Helper to safely escape HTML entities in property values
function escapeHtml(text) {
  if (text == null) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return String(text).replace(/[&<>"']/g, c => map[c]);
}

// Helper to safely format numeric values
function formatNumber(value, decimals = 2) {
  const num = Number(value);
  return Number.isFinite(num) ? num.toFixed(decimals) : '—';
}

const openStreetMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
const ibpLayer = L.tileLayer(
  'https://kb.dbca.wa.gov.au/geoserver/gwc/service/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=mercator&tilematrix=mercator:{z}&tilecol={x}&tilerow={y}&format=image/png&layer=kaartdijin-boodja-public:dbca_annual_indicative_burn_program_dbca-007_public',
  {
    transparent: true,
    opacity: 0.75,
  }
);

const map = L.map('map', {
  center: [-24, 120],
  zoom: 5,
  minZoom: 4,
  maxZoom: 17,
  layers: [openStreetMap, ibpLayer],
  attributionControl: false,
});

// Click event for the map.
map.on('click', function (evt) {
  const [x, y] = [evt.latlng.lng, evt.latlng.lat];
  const queryUrl = `/query-slip/ibp?x=${x}&y=${y}`;
  // Query the proxied URL for any feature intersecting the clicked-on location.
  fetch(queryUrl)
    .then((resp) => {
      if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
      return resp.json();
    })
    .then(function (data) {
      // Safely check if features exist and is an array
      if (Array.isArray(data?.features) && data.features.length > 0) {
        const feature = data.features[0];
        // Popup content with escaped properties and safe numeric formatting
        const content = `<table class="table table-bordered table-striped table-sm">
  <tbody>
    <tr>
      <th>Burn ID:</th>
      <td>${escapeHtml(feature.properties.burnid)}</td>
    </tr>
    <tr>
      <th>Region:</th>
      <td>${escapeHtml(feature.properties.region)}</td>
    </tr>
    <tr>
      <th>District:</th>
      <td>${escapeHtml(feature.properties.district)}</td>
    </tr>
    <tr>
      <th>Location:</th>
      <td>${escapeHtml(feature.properties.location)}</td>
    </tr>
    <tr>
      <th>Purpose:</th>
      <td>${escapeHtml(feature.properties.purpose)}</td>
    </tr>
    <tr>
      <th>Area (ha):</th>
      <td>${formatNumber(feature.properties.area_ha, 0)}</td>
    </tr>
    <tr>
      <th>Perimeter (km):</th>
      <td>${formatNumber(feature.properties.perim_km, 0)}</td>
    </tr>
  </tbody>
</table>`;
        // Open the popup on the map.
        L.popup().setLatLng(evt.latlng).setContent(content).openOn(map);
      }
    })
    .catch((error) => {
      console.error('Error querying features:', error);
      L.popup()
        .setLatLng(evt.latlng)
        .setContent('<p>Error loading feature information.</p>')
        .openOn(map);
    });
});
