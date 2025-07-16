'use strict';

const openStreetMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
const ibpLayer = L.tileLayer(
  'https://kb.dbca.wa.gov.au/geoserver/gwc/service/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=mercator&tilematrix=mercator:{z}&tilecol={x}&tilerow={y}&format=image/png&layer=kaartdijin-boodja-public:dbca_annual_indicative_burn_program_dbca-007_public'
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

// Click event for the map
map.on('click', function (evt) {
  const [x, y] = [evt.latlng.lng, evt.latlng.lat];
  const queryUrl = `/query-slip/ibp?x=${x}&y=${y}`;
  fetch(queryUrl)
    .then((resp) => resp.json())
    .then(function (data) {
      if (Object.hasOwn(data, 'features')) {
        const feature = data.features[0];
        const content = `
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
</table>`;
        // Open a popup on the map.
        L.popup().setLatLng(evt.latlng).setContent(content).openOn(map);
      }
    });
});
