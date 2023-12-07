import * as utils       from './utils.js';

const searchInput           = document.getElementById('searchInput');

const coordinatesContainer  = document.getElementById('coordinatesContainer');
const locationContainer     = document.getElementById('locationContainer');

const zoomStart       = 13
const homeCoordinates = [49.028894, 24.3613198];

const myIcon =  L.icon({
    iconUrl:    '/svg/bx-current-location.png',
    iconSize:    [30, 30],
    iconAnchor:  [15, 30],
    popupAnchor: [0, -30],
  });
const options = {
        // icon:          myIcon,
        draggable:      true,
        opacity:        .6,
        pane:           'markerPane',
        shadowPane:     'shadowPane',
        title:          'sityName',
        autoPanOnFocus: true,
};     


export class MapHandler {
    constructor() {
        this.options = options;

        this.map = L.map('map').setView(homeCoordinates, zoomStart);
        
        const osmUrl     = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        const osmAttrib  = '&copy; OpenStreetMap contributors';
        L.tileLayer(osmUrl, { attribution: osmAttrib }).addTo(this.map);
        
        this.bottomRight =  document.querySelector('#map .leaflet-control-container .leaflet-bottom.leaflet-right');
        this.dataOsm     = {}
        this.coordinates = {};
        this.marker      = {};
    
        this.init();
    };
    
    init() {
        const boundInput = () => this.updateFromInput();
        const boundZoom  = async () =>  this.dataOsm = await this.updateDataOsm(); 
        
        searchInput.removeEventListener('change', boundInput);
        searchInput.addEventListener('change',    boundInput);
        this.map.on("zoomend", boundZoom)
      
        if (this.bottomRight) this.bottomRight.remove();
    };

    async update(name, coordinates){
        this.dataOsm = await  this.updateDataOsm();
        this.updateTextInfo(name, coordinates);
        this.updateCenterMarker();
    };

    async  updateDataOsm() {
        const visibleBounds = this.map.getBounds();
        const bbox          = utils.bbox(visibleBounds);
        const result        = await this.getFetch(bbox);
        return JSON.parse(result);
    };

    updateTextInfo(name, coordinates){
        locationContainer.innerHTML     = `Назва місцевості: ${name}`;
        coordinatesContainer.innerHTML  = `Координати: ${coordinates.lat.toFixed(2)}°N, ${coordinates.lon.toFixed(2)}°E`;
    };
    updateCenterMarker(){
        const latLon      = this.marker.getLatLng();
        const currentZoom = this.map.getZoom();
        this.map.setView(latLon, currentZoom);
    };

    async updateFromInput() {
        const locationName = searchInput.value;

        const apiUrl      = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json`;
        const response    = await fetch(apiUrl);
        const data        = await response.json();

        const [lat, lon] = [parseFloat(data[0].lat),parseFloat(data[0].lon)];
        this.coordinates = { lat, lon };
        
        this.marker = L.marker([lat, lon], this.options).addTo(this.map);
        this.marker.on('dragend', () => this.updateFromDragend());
        
        await this.update(locationName, this.coordinates);
        // if (this.marker)  this.marker.remove();           // Видаляємо попередній маркер, якщо він існує
    };

    async updateFromDragend() {
        const latLon      = this.marker.getLatLng();

        this.coordinates  = {
            lat: latLon.lat,
            lon: latLon.lng,
        }
        
        const url          = `https://nominatim.openstreetmap.org/reverse?lat=${this.coordinates.lat}&lon=${this.coordinates.lon}&format=json`;
        const response     = await fetch(url);
        const data         = await response.json();
        const locationName = data.display_name;
        
        await this.update(locationName, this.coordinates);
    };

    async  getFetch(bbox) {
        const q = ` [bbox: ${bbox}]
                    [out:json]
                    [timeout:90];
                    (
                    way['highway']
                        ['highway' !~'pedestrian']
                        ['highway' !~'footway']
                        ['highway' !~'path'];
                    way['building'];
                    );
                    out body;
                    >;
                    out skel;`;
       
        const url = "https://overpass-api.de/api/interpreter";
        try {
            const response = await fetch(url, { method: 'POST', body: q });
            const result   = await response.text();
            return result;
        } catch (error) {
            console.error('Помилка отримання даних...', error);
        }
    };
}

