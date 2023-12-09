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

    this.points    = [];
    this.roads     = [];
    this.buildings = [];
 
    this.waterways = [];


    this.renderRadius = 1000 ;
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
   
    // this._parseWaterway();
  };
  _parsePoint(){
    for(const node of this.nodes){
      
      const coordinates = {
          x: utils.invLerp(this.minLon, this.maxLon, node.lon) * this.width - this.offset.x,
          y: utils.invLerp(this.maxLat, this.minLat, node.lat) * this.height - this.offset.y,
      };
      const point = new Point(coordinates);
      point.id     = node.id;
      this.points.push(point);
    };
  };
  _parseRoads(){
    const roads = this.osmData.elements.filter(m => m.tags && 'highway' in m.tags);
    for(const road of roads){
      const ids = road.nodes;
      for(let i = 1; i < ids.length; ++i){
          const perw = this.points.find(p => p.id == ids[i - 1]);
          const next = this.points.find(p => p.id == ids[i]);
          const segment = new Segment (perw, next);
          segment.tags  = {...road.tags};
          this.roads.push(segment)
      };
    };
  };
  _parseBuildings(){
     const buildings = this.osmData.elements.filter(m => m.tags && 'building' in m.tags);
      for(const building of buildings ){
          const ids = building.nodes;
          let skeleton  = []
          for(let i = 1; i < ids.length; ++i){
            const point = this.points.find(p => p.id == ids[i - 1]);
            skeleton.push(point);
          };
          const polygon = new Polygon (skeleton);
          polygon.tags  = {...building.tags};
          this.buildings.push(polygon);
        };
  };

  draw(ctx, viewPoint, zoom){
  const B = this.buildings.filter(polygon => polygon.distanceToPoint(viewPoint) < this.renderRadius * zoom);
 
  const optionsBuilding = {
      lineWidth  : 1,
      fill       : 'red',
      colorStroke: '',
      globalAlpha: .6,
  };
  




  
  for(const b of B) {
    if(!b.tags['building:levels'] && b.tags.building === "yes" || b.tags['building:levels'] <= 3) 
    b.draw(ctx, {
      lineWidth  : 1,
      fill       : 'green',
      globalAlpha: .6,}
      );
    if (b.tags['building:levels'] > 3 || b.tags.building === 'apartments') 
      b.draw(ctx, {
        lineWidth  : 1,
        fill       : 'brown',
        globalAlpha: .4,}
      );
    if (b.tags.building === 'commercial' || 
        b.tags.shop) 
      b.draw(ctx, {
        lineWidth  : 1,
        fill       : 'brown',
        globalAlpha: .6,}
      );
    if(b.tags.building === 'school'       || 
       b.tags.building === 'kindergarten' ||
       b.tags.amenity  === 'music_school' ||
       b.tags.building === 'hospital'      ) 
    b.draw(ctx, {
      lineWidth  : 1,
      fill       : 'orange',
      globalAlpha: .4,}
    );
    if(b.tags.building === 'church') 
    b.draw(ctx, {
      lineWidth  : 1,
      fill       : 'blue',
      globalAlpha: .8,}
    );
    if (b.tags.building === "industrial") 
    b.draw(ctx, {
      lineWidth  : 1,
      fill       : 'red',
      globalAlpha: .8,}
    );  

  };
  
  const R = this.roads.filter(i => i.distanceToPoint(viewPoint) < this.renderRadius * zoom);
  const optionsRoads = {
      lineWidth  : 3,
      fill       : '',
      color: 'yellow',
      globalAlpha: .8,
  };
  for(const r of R) {
   
    r.draw(ctx, optionsRoads)
  };

 

  
  };
  dispose(){
    this.buildings = [];
  }
}

