
 





const containerInfo         = document.getElementById('map');
const searchInput           = document.getElementById('searchInput');

let coordinatesContainer           = document.createElement('div');
let locationContainer              = document.createElement('div');
containerInfo.append(coordinatesContainer, locationContainer)




export class MapHandler {
    constructor() {
        this.zoomStart       = 13;
        const homeCoordinates = [49.028894, 24.3613198];
        const options = {
                draggable: true,
                opacity: .6,
                pane: 'markerPane',
                shadowPane: 'shadowPane',
                title: 'sityName',
                autoPanOnFocus: true,
        };

        const map       = L.map('map').setView(homeCoordinates, this.zoomStart);

        const osmUrl    = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        const osmAttrib = '&copy; OpenStreetMap contributors';
        const mapLayer  = L.tileLayer(osmUrl, { attribution: osmAttrib }).addTo(map);
        this.elementToRemove       = document.querySelector('#map .leaflet-control-container .leaflet-bottom.leaflet-right');
        
        
        this.coordinates = {};
        this.marker = {};
        this.locationName = '';
      
        this.init(map, options);
         
    }
    
    init(map, options) {
        const boundInput = () => this.updateCoordinates(map, options);
        searchInput.removeEventListener('change', boundInput);
        searchInput.addEventListener('change',    boundInput);
        
        if (this.elementToRemove) this.elementToRemove.remove();
    }
    
    async updateCoordinates(map, options) {
        this.locationName  = searchInput.value;
        const apiUrl       = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(this.locationName)}&format=json`;
        // if (this.marker)     this.marker.remove();           // Видаляємо попередній маркер, якщо він існує
        try {
            const response    = await fetch(apiUrl);
            const data        = await response.json();
            this.coordinates  = {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
            }
            console.log(this.coordinates)
            
            const latLon = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
          
            locationContainer.innerHTML     = `Назва місцевості: ${this.locationName}`;
            coordinatesContainer.innerHTML  = `Широта: ${latLon[0]}, Довгота: ${latLon[1]}`;
            
            map.setView(latLon, this.zoomStart);
            
            this.marker = L.marker(latLon, options).addTo(map);

            this.marker.on('dragend', () => this.getNameLocation());

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
        console.log(this.marker)
        
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
        coordinatesContainer.innerHTML  = `Широта: ${this.coordinates.lat}, Довгота: ${this.coordinates.lon}`;
    };
}

