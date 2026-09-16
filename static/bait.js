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
const baitLayer = L.tileLayer(
  'https://kb.dbca.wa.gov.au/geoserver/gwc/service/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=mercator&tilematrix=mercator:{z}&tilecol={x}&tilerow={y}&format=image/png&layer=kaartdijin-boodja-public:Western_Shield_Program_Permitted_Bait_Areas',
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
  layers: [openStreetMap, baitLayer],
  attributionControl: false,
});
