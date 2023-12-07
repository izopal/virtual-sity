import * as utils       from './utils.js';
import { Point }        from '../primitives/point.js';
import { Segment }      from '../primitives/segment.js';

export class Osm  {
  constructor(canvas, cityCoordinates, osmData, graph){
    console.log(osmData)
    this.canvas  = canvas;
    this.cityCoordinates = cityCoordinates;
    this.osmData = osmData;
    this.graph   = graph;


    this.initializeCanvas();
    this.initializeMapData();
  };

  initializeCanvas(){
    const { width, height } = this.canvas;
    this.canvasCentre = { 
      x: width * 0.5,
      y: height * 0.5 
    };
  };

  initializeMapData(){
    this.nodes = this.osmData.elements.filter((n) => n.type === 'node');
    this.calculateMapDimensions();
    this.calculateMapOffset();
  };
  calculateMapDimensions() {
    const lons = this.nodes.map((n) => n.lon);
    const lats = this.nodes.map((n) => n.lat);

    this.minLon = Math.min(...lons);
    this.maxLon = Math.max(...lons);
    this.minLat = Math.min(...lats);
    this.maxLat = Math.max(...lats);

    const deltaLon = this.maxLon - this.minLon;
    const deltaLat = this.maxLat - this.minLat;
    const ar = deltaLon / deltaLat;

    this.height = deltaLat * 111000 ;
    this.width = this.height * ar * Math.cos(this.maxLat * Math.PI / 180);
  };
  calculateMapOffset() {
    this.coordinatesCenter = {
      x: utils.invLerp(this.minLon, this.maxLon, this.cityCoordinates.lon) * this.width,
      y: utils.invLerp(this.maxLat, this.minLat, this.cityCoordinates.lat) * this.height,
    };

    this.offset = utils.operate(this.coordinatesCenter, '-', this.canvasCentre);
  }

  parse(){
    this.#parsePoint();
    this.#parseRoads();
    this.#parseBuildings();
  };
  #parsePoint(){
    for(const node of this.nodes){
      const coordinates = {
          x: utils.invLerp(this.minLon, this.maxLon, node.lon) * this.width - this.offset.x,
          y: utils.invLerp(this.maxLat, this.minLat,  node.lat) * this.height - this.offset.y,
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
      // console.log(buildings)
      for(const building of buildings ){
          const points = building.nodes;

      }
  };
  draw(){
  };
}

