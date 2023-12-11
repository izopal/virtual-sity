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
    this.osmData         = osmData;
    this.graph           = graph;

    this.points    = [];
    this.roads     = [];
    this.buildings = [];
    this.areals    = [];
    this.naturals  = [];

    this.relationPolygons = [];
 
    this.waterways = [];

    this.nodes = this.osmData.elements.filter((n) => n.type === 'node');
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
  };

  parse(){
    this._parsePoint();
    this._parseSegments();
    this._parsePolygons();
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
  _parseSegments(){
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
  _parsePolygons() {
    const wayPolygons      = this.osmData.elements.filter(w => w.type === 'way');
    const relationPolygons = this.osmData.elements.filter(r => r.type === 'relation');
  
    this.#parseBuildings(wayPolygons);
    this.#parseAreal(wayPolygons);
    this.#parseNatural(wayPolygons);
    
    this._parsePolygon_relation(relationPolygons);
  };
  #parseBuildings(osmData){
    this._parsePolygon_way(osmData, this.buildings, 'building');
  };
  #parseAreal(osmData){
    this._parsePolygon_way(osmData, this.areals, 'landuse');
  };
  #parseNatural(osmData){
    this._parsePolygon_way(osmData, this.naturals, 'leisure', 'natural');
  };
  _parsePolygon_way(data, arrey, name_1, name_2){
    const buildings = data.filter(m => m.tags && (`${name_1}` in m.tags || `${name_2}` in m.tags));
    for(const building of buildings ){
        const ids = building.nodes;
        let skeleton  = []
        for(let i = 1; i < ids.length; ++i){
          const point = this.points.find(p => p.id == ids[i-1]);
          if(point) skeleton.push(point);
        };
        const polygon = new Polygon (skeleton);
        polygon.tags  = {...building.tags};
        arrey.push(polygon);
      };
  };
  _parsePolygon_relation(relationPolygons) {
    for (const relationData of relationPolygons) {
        const members = relationData.members;
        const ways    = [];
       
        for (const member of members) {
          const wayData = this.osmData.elements.find((m) => m.type === 'way' && m.id === member.ref);
          ways.push(wayData.nodes)
        };

        const sortedPoints = this._getSortedPoints(ways);
        const sceleton = sortedPoints.map((id) => this.points.find((p) => p.id === id));
        
        const polygon = new Polygon(sceleton);
        polygon.tags = { ...relationData.tags };
        this.relationPolygons.push(polygon);
    }
  };
  _getSortedPoints(ways){
    const sort = [ways[0]];
    let perw  = ways[0][ways[0].length - 1];

    for(let i = 1; i < ways.length; ++i){
      const way= ways[i];
      if(perw === way[0] ){
        perw = way[way.length - 1];
        sort.push(way);
      }
      else if(perw === way[way.length - 1]){
        perw = way[0];
        sort.push(way.slice().reverse());
      }
      else {
        ways.push(way);
      };
    };
    return  sort.flat();
  };
  
  _getBuilding(b){
      const options = {
        lineWidth: 1,
        fill: '',
        globalAlpha: 1,
      };
    
      switch (true) {
        // умова для комерційних преміщень і магазинів
        case (
          b.tags.building === 'commercial' ||
          b.tags.shop     === 'mall'       ||
          b.tags.shop     === 'supermarket'
        ):
          options.fill = 'brown';
          options.globalAlpha = 0.8;
          break;
        // умова для шкіл, садіків і лікарень
        case (
          b.tags.building === 'school'       ||
          b.tags.building === 'kindergarten' ||
          b.tags.amenity  === 'music_school' ||
          b.tags.building === 'college'      ||
          b.tags.building === 'hospital'     ||
          b.tags.sport    === 'swimming'     ||
          b.tags.amenity  === 'clinic' 
        ):
          options.fill = 'orange';
          options.globalAlpha = 0.4;
          break;
        // умова церков
        case b.tags.building === 'church':
          options.fill = 'blue';
          options.globalAlpha = 0.8;
          break;
        // умова для промислових преміщень
        case (
          b.tags.building === 'industrial' ||
          b.tags.building === 'garages'
        ):
          options.fill = 'red';
          options.globalAlpha = 0.8;
          break;
        // умова для приватних будинків і які мають менше 3 поперхів
        case (
          !b.tags['building:levels']      &&
          b.tags.building === 'yes'       ||
          b.tags['building:levels'] < 3   ||
          b.tags.building === 'house'     
        ):
          options.fill = 'green';
          options.globalAlpha = 0.6;
          break;
        // умова для багатоповерхівок
        case (
          b.tags['building:levels'] >= 3 || 
          b.tags.building === 'apartments'
        ):
          options.fill = 'brown';
          options.globalAlpha = 0.4;
          break;
        // умова для будинків які будуються
        case (
          b.tags.building === 'construction' ||
          b.tags.building === 'roof'         ||
          b.tags.building === 'service' 
        ):
          options.fill = 'black';
          options.globalAlpha = 0.4;
          break;
        // умова длоя рештт типів будинків
        default:
          options.fill        = 'green';
          options.globalAlpha = 0.6;
          break;
      };
      return options;
  };

  draw(ctx, viewPoint, zoom){
    const R = this.roads.filter(i => i.distanceToPoint(viewPoint) < this.renderRadius * zoom);
    const optionsRoads = {
        lineWidth  : 3,
        fill       : '',
        color: 'yellow',
        globalAlpha: .8,
    };
    for(const r of R) r.draw(ctx, optionsRoads);

    const optionsAreals = {
      lineWidth  : 3,
      fill       : 'red',
      colorStroke: 'red',
      globalAlpha: .4,
    };
    const optionsNatural = {
      lineWidth  : 3,
      fill       : '#328037',
      colorStroke: '#2d592f',
      globalAlpha: .3,
    };

    for(const a of this.relationPolygons)  a.draw(ctx, optionsAreals);
    for(const a of this.areals) {
      if( a.tags.landuse === 'industrial' ||
          a.tags.landuse === 'garages'    ||
          a.tags.landuse === 'commercial') 
        {
          a.draw(ctx, optionsAreals)
          }else{
          a.draw(ctx, optionsNatural)
        }
    };
   
    for(const n of this.naturals) n.draw(ctx, optionsNatural);

    const B = this.buildings.filter(polygon => polygon.distanceToPoint(viewPoint) < this.renderRadius * zoom);
    for (const b of B) {
      const options = this._getBuilding(b);
      b.draw(ctx, options);
    };
  };

  dispose(){
    this.points    = [];
    this.roads     = [];
    this.buildings = [];
    this.areals    = [];
    this.naturals  = [];

    this.relationPolygons = [];
  }
}

