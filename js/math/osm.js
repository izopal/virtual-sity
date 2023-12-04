import * as utils       from './utils.js';
import { Point }        from '../primitives/point.js';
import { Segment }       from '../primitives/segment.js';

export class Osm  {
  constructor(cityCoordinates, osmData, graph){

    this.osmData = osmData;
    this.graph   = graph;
    this.nodes = this.osmData.elements.filter(n => n.type === 'node');
        
    const lons = this.nodes.map(n => n.lon);
    const lats = this.nodes.map(n => n.lat);

    this.minLon = Math.min(...lons);   
    this.maxLon = Math.max(...lons);
    this.minLat = Math.min(...lats);
    this.maxLat = Math.max(...lats);

    const deltaLon = this.maxLon - this.minLon;
    const deltaLat = this.maxLat - this.minLat;
    const ar       = deltaLon / deltaLat;

    this.height = deltaLat * 111000  ; // один градус довготи дорівнює 111 км, конвертуємо один піксель в метри
    this.width  = this.height * ar * Math.cos(this.maxLat * Math.PI / 180) // корегуємо ширину полотна відносно широти
    

    const coordinatesCenter = {
      x: utils.invLerp(this.minLon, this.maxLon, cityCoordinates.lon) * this.width ,
      y: utils.invLerp(this.maxLat, this.minLat, cityCoordinates.lat) * this.height,
    };
    console.log(coordinatesCenter)

   
    
  };
 
  parse(){
    this.#parsePoint();
    this.#parseRoads();
    this.#parseBuildings();
  };
  #parsePoint(){
    for(const node of this.nodes){
      const coordinates = {
          x: utils.invLerp(this.minLon, this.maxLon, node.lon) * this.width ,
          y: utils.invLerp(this.maxLat, this.minLat,  node.lat) * this.height,
      };
      const point = new Point(coordinates);
      point.id     = node.id;
      this.graph.addPoint(point)
    };
    console.log(this.graph.points)
  };
  #parseRoads(){
    // створюємо масив із дорогами
    const ways = this.osmData.elements.filter(m => m.type === 'way');
    for(const way of ways){
        const ids = way.nodes;
        for(let i = 1; i < ids.length; ++i){
            const perw = this.graph.points.find(p => p.id == ids[i - 1]);
            const next = this.graph.points.find(p => p.id == ids[i]);
            const segment = new Segment (perw, next);
            this.graph.addSegment(segment)
        };
    };
  };
  #parseBuildings(){
      const buildings = this.osmData.elements.filter(m => m.tags && 'building' in m.tags);
      for(const building of buildings ){
          const points = building.nodes;
      }
  };
  draw(){
  };
}

