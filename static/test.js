'use strict';

const openStreetMap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
const cogLayer = L.tileLayer(
  'https://kb-uat.dbca.wa.gov.au/geoserver/gwc/service/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=mercator&tilematrix=mercator:{z}&tilecol={x}&tilerow={y}&format=image/png&layer=kaartdijin-boodja-private:2025COG_Mosaic_GCS'
);

const map = L.map('map', {
  center: [-30, 118],
  zoom: 6,
  minZoom: 4,
  maxZoom: 17,
  layers: [openStreetMap, cogLayer],
  attributionControl: false,
});
