'use strict';

const openStreetMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
const ibpLayer = L.tileLayer(
  'https://kmi.dbca.wa.gov.au/geoserver/public/gwc/service/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=mercator&tilematrix=mercator:{z}&tilecol={x}&tilerow={y}&format=image/png&layer=public:latest_indicative_burn_program2&style=public:latest_indicative_burn_program2_ShowPinpoint'
);

const map = L.map('map', {
  center: [-24, 131],
  zoom: 5,
  minZoom: 4,
  maxZoom: 18,
  layers: [openStreetMap, ibpLayer],
  attributionControl: false,
});
