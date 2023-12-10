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
        this.bbox        = [];
        this.dataOsm     = {};
        this.coordinates = {};
        this.marker      = {};
    
        this.init();
    };
    
    init() {
        const boundInput = () => this.updateFromInput();
        const boundZoom  = this.updateBoundZoom()
        
        searchInput.removeEventListener('change', boundInput);
        searchInput.addEventListener('change',    boundInput);
        this.map.on("zoomend", boundZoom)
      
        if (this.bottomRight) this.bottomRight.remove();
    };

    update(name, coordinates){
        this.updateTextInfo(name, coordinates);
        this.updateCenterMarker();
    };

    updateBbox(map) {
        const visibleBounds = map.getBounds();
        const bbox          = utils.bbox(visibleBounds);
        return bbox   
    };
    updateBoundZoom() {
        return async () => {
            this.bbox    = this.updateBbox(this.map);
            const result = await this.getFetch(this.bbox);
            this.dataOsm = JSON.parse(result);
        };
    }


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
        

        this.update(locationName, this.coordinates);
        this.bbox           = this.updateBbox(this.map);
        const result        = await this.getFetch(this.bbox);
        this.dataOsm        = JSON.parse(result);

        // if (this.marker)  this.marker.remove();           // Видаляємо попередній маркер, якщо він існує
        searchInput.value = '';
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
        
        this.update(locationName, this.coordinates);
        this.bbox           = this.updateBbox(this.map);
        const result        = await this.getFetch(this.bbox);
        this.dataOsm        = JSON.parse(result);
    };

    async  getFetch(bbox) {
        const q = ` [bbox: ${bbox}]
                    [out:json]
                    [timeout:90];
                    (
                    
                    way['highway']
                        ['highway'!~'pedestrian|footway|steps|platform|cycleway|path|track']
                        ['surface' !~'gravel'];

                    way['building'];
                    way['landuse'~'industrial|garages|commercial'];
                    relation['landuse'~'industrial|garages|commercial'];

                    way['landuse'~'forest|wood|grass|meadow|flowerbed|vineyard|recreation_ground'];
                    way['leisure'~'park|garden|grassland'];
                    way['natural'~'wood|tree_row|scrub|heath|fell'];

                    );
                    out body;
                    >;
                    out skel;`;
       
        const url = "https://overpass-api.de/api/interpreter";
        try {
            const response = await fetch(url, { method: 'POST', body: q });
            console.log('Відповідь:', response.status, response.headers);

            const result   = await response.text();
            return result;
        } catch (error) {
            console.error('Помилка отримання даних...', error);
        }
    };
}

