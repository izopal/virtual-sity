


const containerInfo         = document.getElementById('map');
const searchInput           = document.getElementById('searchInput');

const coordinatesContainer  = document.getElementById('coordinatesContainer');
const locationContainer     = document.getElementById('locationContainer');


export class MapHandler {
    constructor() {
        this.zoomStart       = 13;
        const homeCoordinates = [49.028894, 24.3613198];
        const options = {
                draggable:     true,
                opacity:        .6,
                pane:           'markerPane',
                shadowPane:     'shadowPane',
                title:          'sityName',
                autoPanOnFocus: true,
        };

        const map       = L.map('map').setView(homeCoordinates, this.zoomStart);

        const osmUrl     = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        const osmAttrib  = '&copy; OpenStreetMap contributors';
        const mapLayer   = L.tileLayer(osmUrl, { attribution: osmAttrib }).addTo(map);
        this.bottomRight = document.querySelector('#map .leaflet-control-container .leaflet-bottom.leaflet-right');
        
        
        this.coordinates = {};
        this.marker = {};
        this.locationName = '';
      
        this.init(map, options);
         
    }
    
    init(map, options) {
        const boundInput = () => this.updateCoordinates(map, options);
        searchInput.removeEventListener('change', boundInput);
        searchInput.addEventListener('change',    boundInput);
        
        if (this.bottomRight) this.bottomRight.remove();

    }
    
    async updateCoordinates(map, options) {
        this.locationName  = searchInput.value;
        const apiUrl       = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(this.locationName)}&format=json`;
        try {
            const response    = await fetch(apiUrl);
            const data        = await response.json();
            
            this.coordinates  = {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
            }
            
            // if (this.marker)  this.marker.remove();           // Видаляємо попередній маркер, якщо він існує
            const latLon = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            
            locationContainer.innerHTML     = `Назва місцевості: ${this.locationName}`;
            coordinatesContainer.innerHTML  = `Координати: ${latLon[0].toFixed(2)}°N, ${latLon[1].toFixed(2)}°E`;
            
            map.setView(latLon, this.zoomStart);
            
            this.marker = L.marker(latLon, options).addTo(map);
            this.marker.on('dragend', () => this.getNameLocation());

            const radius = 1000; // Radius in meters
            const result          = await this.getFetch(this.coordinates, radius);
            this.dataOsm         = JSON.parse(result);

        } catch (error) {
            console.error('Помилка пошуку локації:', error);
        };
        
        
    };    
    async getNameLocation() {
        const latLon      = this.marker.getLatLng();
        this.coordinates  = {
            lat: latLon.lat,
            lon: latLon.lng,
        }
        const radius = 500; // Radius in meters
        const result          = await this.getFetch(this.coordinates, radius);
        this.dataOsm         = JSON.parse(result);
        
        const url                    = `https://nominatim.openstreetmap.org/reverse?lat=${this.coordinates.lat}&lon=${this.coordinates.lon}&format=json`;
        const response               = await fetch(url);
        const data                   = await response.json();
    
        this.NAME                    =` ${data.address.road }, 
                                        ${data.address.house_number }       
                                        ${data.address.village }, 
                                        ${data.address.municipality },
                                        ${data.address.state}`;
        this.locationName               = data.display_name;

        locationContainer.innerHTML     = `Назва місцевості: ${this.locationName}`;
        coordinatesContainer.innerHTML  = `Координати: ${this.coordinates.lat.toFixed(2)}°N, ${this.coordinates.lon.toFixed(2)}°E`;
    };


    async  getFetch(cityCoordinates, radius) {
        const q = ` 
                   [out:json];
                    (
                    way['highway'](around:${radius},${cityCoordinates.lat},${cityCoordinates.lon})
                        ['highway' !~'pedestrian']
                        ['highway' !~'footway']
                        ['highway' !~'path'];
                    way['building'](around:${radius},${cityCoordinates.lat},${cityCoordinates.lon});
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

