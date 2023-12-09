import * as utils       from './utils.js';
import { Point }        from '../primitives/point.js';
import { Segment }      from '../primitives/segment.js';
import { Polygon }      from '../primitives/polygon.js';

export class Osm  {
  constructor(canvas, cityCoordinates, osmData, graph){
    console.log(osmData)
    this.canvas  = canvas;
    this.ctx = canvas.getContext('2d');
    this.cityCoordinates = cityCoordinates;
    this.osmData = osmData;
    this.graph   = graph;

    

    this.buildings = [];
    this.waterways = [];
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
    // this.ways  = this.osmData.elements.filter(m => m.type === 'way' );
   
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
    this._parsePoint();
    // this._parseSegments();
    this._parseRoads();
    this._parseBuildings();
    this._parseWaterway();
  };
  _parsePoint(){
    for(const node of this.nodes){
      
      const coordinates = {
          x: utils.invLerp(this.minLon, this.maxLon, node.lon) * this.width - this.offset.x,
          y: utils.invLerp(this.maxLat, this.minLat, node.lat) * this.height - this.offset.y,
      };
      const point = new Point(coordinates);
      point.id     = node.id;
      this.graph.addPoint(point);
    };
    console.log(this.graph.points);
  };

  // _parseSegments(){
  //   for(const way of this.ways){
  //       const ids = way.nodes;
  //       for(let i = 1; i < ids.length; ++i){
  //           const perw = this.graph.points.find(p => p.id == ids[i - 1]);
  //           perw.tags  = {...way.tags};
  //           const next = this.graph.points.find(p => p.id == ids[i]);
  //           const segment = new Segment (perw, next);
  //           this.graph.addSegment(segment)
  //       };
  //   };
  //   console.log(this.graph.segments)
  // };
  _parseRoads(){
    const roads = this.osmData.elements.filter(m => m.tags && 'highway' in m.tags);
    for(const road of roads){
      const ids = road.nodes;
      for(let i = 1; i < ids.length; ++i){
          const perw = this.graph.points.find(p => p.id == ids[i - 1]);
          perw.tags  = {...road.tags};
          const next = this.graph.points.find(p => p.id == ids[i]);
          const segment = new Segment (perw, next);
          this.graph.addSegment(segment)
      };
  };
  }
  _parseBuildings(){
     const buildings = this.osmData.elements.filter(m => m.tags && 'building' in m.tags);
      console.log(buildings)
      for(const building of buildings ){
          const ids = building.nodes;
          let skeleton  = []
          for(let i = 1; i < ids.length; ++i){
            const point = this.graph.points.find(p => p.id == ids[i - 1]);
            point.tags  = {...building.tags};
            skeleton.push(point);
          };
          const polygon = new Polygon (skeleton);
          this.graph.polygonsBuilding.push(polygon);
        }
  };
  _parseWaterway(){
    const waterways = this.osmData.elements.filter(m => m.tags && 'natural' in m.tags);
    for(const waterway of waterways ){
      const ids = waterway.nodes;
      let skeleton  = []
      for(let i = 1; i < ids.length; ++i){
        const point = this.graph.points.find(p => p.id == ids[i - 1]);
        point.tags  = {...waterway.tags};
        skeleton.push(point);
      };
      const polygon = new Polygon (skeleton);
      this.graph.polygonsWaterway.push(polygon);
    }
};
  

  draw(ctx){
   
  };
}

