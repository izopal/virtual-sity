import * as utils       from './utils.js';
import { Point }        from '../primitives/point.js';
import { Segment }      from '../primitives/segment.js';
import { Polygon }      from '../primitives/polygon.js';
import { Building }     from '../items/building.js';
import { Road }         from '../items/road.js';
import { Envelope }     from '../primitives/envelope.js';

export class Osm  {
  constructor(config, cityCoordinates, graph){
    
    this.config  = config;
    this.canvas       = this.config.canvas;
    // this.renderRadius = this.config.renderRadius;
    this.renderRadius = 300;

    this.ctx = this.canvas.getContext('2d');
    this.cityCoordinates = cityCoordinates;
   
    this.graph           = graph;




    this.crossing  = [];
    this.bus_stop  = [];
    this.traffic_signals = []
    
    
    
    this.points    = [];
    this.markers   = [];
    this.roads     = [];
    this.buildings = [];
    this.areals    = [];
    this.naturals  = [];
    this.relationPolygons = [];
 

    this.sizeRemove   = 30;


    const canvasSize    = this.canvas.getBoundingClientRect();
    const bbox =  [
          {x:canvasSize.right, y:canvasSize.bottom},
          {x:canvasSize.right, y:canvasSize.top},
          {x:canvasSize.left, y:canvasSize.top},
          {x:canvasSize.left, y:canvasSize.bottom},
    ];
    this.monitor = new Polygon(bbox);
    console.log(this.monitor)

    this.initializeCanvas();
  };
  initializeCanvas(){
    const { width, height } = this.canvas;
    this.canvasCentre = { 
      x: width * 0.5,
      y: height * 0.5 
    };
  };

 
  parse(osmData){
    const parse = {
        nodes:          [],
        roadsPolygons:  [],
        wayPolygons:    [],
        relations:      [],
        wayNotTags:     [],
    }
    const result = this.parseDataElement(osmData, parse);
    
    this._parsePoint(result);
    this._parseSegments(result);
    this._parsePolygons(result);
  };
  parseDataElement(osmData, data){
    for(const e of osmData.elements){
      switch(true){
        case (e.type === 'node' ):
          data.nodes.push(e)
          break;
        case (e.type === 'way' && e.tags && 'highway' in e.tags):
          data.roadsPolygons.push(e)
          break;
        case (e.type === 'way'  && e.tags && !('highway' in e.tags)):
          data.wayPolygons.push(e)
          break;
        case (e.type === 'way'  && !e.tags ):
          data.wayNotTags.push(e)
          break;
        case (e.type === 'relation' ):
          data.relations.push(e)
          break;
      }
    };
    return data
  }
  _parsePoint(result){
    this.__initializeMapData(result);
    for(const node of result.nodes){
      const coordinates = {
          x: utils.invLerp(this.minLon, this.maxLon, node.lon) * this.width - this.offset.x,
          y: utils.invLerp(this.maxLat, this.minLat, node.lat) * this.height - this.offset.y,
      };
      const point = new Point(coordinates);
      point.id     = node.id;
      if(node.tags) {
        point.tags   = node.tags
        this.markers.push(point);
      };
      this.points.push(point);
    };
  };
  __initializeMapData(result){
    this.#calculateMapDimensions(result);
    this.#calculateMapOffset();
  };
  
  _parseSegments(result){
    for(const road of result.roadsPolygons){
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
  _parsePolygons(result) {
    this.__parseBuildings(result.wayPolygons);
    this.__parseAreal(result.wayPolygons);
    this.__parseNatural(result.wayPolygons);
  
    this.__parsePolygon_relation(result);
  };
  __parseBuildings(osmData){
    this.#parsePolygon_way(osmData, this.buildings, 'building');
  };
  __parseAreal(osmData){
    this.#parsePolygon_way(osmData, this.areals, 'landuse');
  };
  __parseNatural(osmData){
    this.#parsePolygon_way(osmData, this.naturals, 'leisure', 'natural');
  };
  __parsePolygon_relation(result) {
    for (const relationData of result.relations) {
        const members = relationData.members;
        const ways    = [];
       
        for (const member of members) {
          const wayData = result.wayNotTags.find((m) => m.id === member.ref);
          console.log(wayData)
          ways.push(wayData.nodes)
        };

        const sortedPoints = this.#getSortedPoints(ways);
        const sceleton = sortedPoints.map((id) => this.points.find((p) => p.id === id));
        
        const polygon = new Polygon(sceleton);
        polygon.tags = { ...relationData.tags };
        this.relationPolygons.push(polygon);
    }
  };

  #parsePolygon_way(data, arrey, name_1, name_2){
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
  #getSortedPoints(ways){
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
  #calculateMapDimensions(result) {
    const lons = result.nodes.map((n) => n.lon);
    const lats = result.nodes.map((n) => n.lat);

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
  #calculateMapOffset() {
    this.coordinatesCenter = {
      x: utils.invLerp(this.minLon, this.maxLon, this.cityCoordinates.lon) * this.width,
      y: utils.invLerp(this.maxLat, this.minLat, this.cityCoordinates.lat) * this.height,
    };
    this.offset = utils.operate(this.coordinatesCenter, '-', this.canvasCentre);
  };

  draw(ctx, viewPoint, zoom){
    this._drawRoads(ctx, viewPoint, zoom);
    // this._drawMarker(ctx, viewPoint, zoom);
    this._drawBuildings(ctx, viewPoint, zoom);
    this._drawPolygons(ctx, viewPoint, zoom);
  };
  _drawBuildings(ctx, viewPoint, zoom){
    // малюємо будівлі в 3D графіці
    const B = this.buildings.filter(polygon => 
      polygon.distanceToPoint(viewPoint) < this.renderRadius * zoom)
      .map(b => {
      const Level = parseInt(b.tags["building:levels"]) || 1
      return new Building(b, Level)
    });
   
    B.sort((a, b) => b.base.distanceToPoint(viewPoint) - a.base.distanceToPoint(viewPoint))
    
    // малюємо будівлі в 2D графіці
    // const B = this.buildings.filter(i => i.distanceToPoint(viewPoint) < this.renderRadius * zoom);
    
    for (const b of B) {
      const options = this.#getBuilding(b.base);
      b.draw(ctx, viewPoint, zoom, options);
    };
  };
  _drawRoads(ctx, viewPoint, zoom){
    const R = this.roads.filter(i => i.distanceToPoint(viewPoint) < this.renderRadius * zoom);
   
    const optionsRoads = {
        lineWidth  : 3,
        lineCap:   'round',
        fill       : '',
        color: 'yellow',
        globalAlpha: .8,
    };


    const road = {key:           'road',
            current:        5,
            width:          10,
            lineWidth:      2,
            colorStroke:    'black',
            lineCap:        'round',
            fill:           '#BBB',
            colorStroke:    '#BBB',
            globalAlpha:    1,
            border:         {size:         .5,
                            lineCap:      'round',
                            color:        'white',
                            globalAlpha:  1},
            dash:           {globalAlpha:  .8,
                            dash:{
                                    size:     .5,
                                    length:   3,
                                    interval: 2,
                                    color:    'white',
                            }},
            point:          {radius:        5,
                            color:        'white', 
                            globalAlpha:   .3},
        };



    // const road = new Road(this.roads,  this.points,  'road')
    // road.draw(ctx)
    // console.log(road)
    const layers  = R.map(segment => new Envelope(segment, road))       || [];
    // const Border = layers.map(road => road.polygon)
    // const borders = Polygon.union(Border)        || [];

    for(const layer  of layers)   {
      // console.log(layer)
      layer.draw(ctx,  road)
    };
    for(const line   of R)             {line.draw(ctx,   road.dash)};
    // for(const border of borders)  {border.draw(ctx, road.border)}; 
    // for(const r of R) r.draw(ctx, optionsRoads);
  };
  _drawMarker(ctx, viewPoint, zoom){
    for(const marker of this.markers){
      if      (marker.tags.highway === 'traffic_signals' ) this.traffic_signals.push(marker);
      else if (marker.tags.highway === 'crossing' )        this.crossing.push(marker);
      else if (marker.tags.highway === 'bus_stop' )        this.bus_stop.push(marker);
    };
  }
  _drawPolygons(ctx, viewPoint, zoom){
    const options = { 
      areal: {
        lineWidth  : 3,
        fill       : 'red',
        colorStroke: 'red',
        globalAlpha: .4,
      },
      natural: {
        lineWidth  : 3,
        fill       : '#328037',
        colorStroke: '#2d592f',
        globalAlpha: .3,
      },
    };
      
    const RP = this.#filterPolygons(this.relationPolygons, viewPoint, zoom)
    const N  = this.#filterPolygons(this.naturals, viewPoint, zoom)
    const A  = this.#filterPolygons(this.areals, viewPoint, zoom)

    for(const n of N)  n.draw(ctx, options.natural);
    for(const r of RP) r.draw(ctx, options.areal);
    for(const a of A) {
      const tags =  a.tags.landuse === 'industrial' ||
                    a.tags.landuse === 'garages'    ||
                    a.tags.landuse === 'commercial'
      tags ? a.draw(ctx, options.areal) : a.draw(ctx, options.natural)
    }
  };
  #filterPolygons(A, viewPoint, zoom){
    return A.map(polygon => {
      const sceleton = polygon.points.filter(point => 
        point.distanceToPoint(viewPoint) < this.renderRadius * zoom);
      return Object.assign(new Polygon(sceleton), { tags: { ...polygon.tags } });
    });
  }
  #getBuilding(b){
      const options = {
        ceiling: {
          lineWidth: null,
          fill: '',
          globalAlpha: 1,
        },
        side: {
          lineWidth: null,
          fill: '',
          globalAlpha: 1,
        },
      }
     
      switch (true) {
        // умова для комерційних преміщень і магазинів
        case (
          b.tags.building === 'commercial' ||
          b.tags.shop     === 'mall'       ||
          b.tags.shop     === 'supermarket'
        ):
          options.ceiling.fill = 'brown';
          options.side.fill = 'brown';
          options.side.globalAlpha = .8;
          break;

        // умова для шкіл, садіків і лікарень
        case (
          b.tags.building === 'kindergarten' ||
          b.tags.building === 'college'      ||
          b.tags.building === 'school'       ||
          b.tags.amenity  === 'music_school' ||
          b.tags.sport    === 'swimming'     ||

          b.tags.building === 'hospital'     ||
          b.tags.amenity  === 'clinic' 
        ):
          options.ceiling.fill = 'orange';
          options.side.fill = 'orange';
          options.side.globalAlpha = .4;
          break;
          
        // умова для адміністративних
        case (
          b.tags.office   === 'yes'                  ||
          b.tags.office   === 'government'           ||
          b.tags.amenity  === 'townhall'             ||
          b.tags.amenity  === 'community_centre'     ||
          b.tags.amenity  === 'fire_station'         ||
          b.tags.amenity  === 'police'               ||
          b.tags.amenity  === 'arts_centre'          ||
          b.tags.amenity  === 'post_office'          
        ):
          options.ceiling.fill = 'orange';
          options.side.fill = 'orange';
          options.side.globalAlpha = .8;
          break;

        // умова церков
        case b.tags.building === 'church':
          options.ceiling.fill = 'blue';
          options.side.fill = 'blue';
          options.side.globalAlpha = .8;
          break;

        // умова для будинків які будуються
        case (
          b.tags.building === 'construction' ||
          b.tags.building === 'roof'         ||
          b.tags.power    === 'plant'        ||
          b.tags.building === 'service' 
        ):
          options.ceiling.fill = 'black';
          options.side.fill = 'black';
          options.side.globalAlpha = .4;
          break;

        // умова для промислових преміщень
        case (
          b.tags.building === 'industrial' ||
          b.tags.building === 'garages'
        ):
          options.ceiling.fill = 'red';
          options.side.fill = 'red';
          options.side.globalAlpha = .8;
          break;

        // умова для приватних будинків і які мають менше 3 поперхів
        case (
          !b.tags['building:levels']      &&
          b.tags.building === 'yes'       ||
          b.tags['building:levels'] < 3   ||
          b.tags.building === 'house'     
        ):
          options.ceiling.fill = 'green';
          options.side.fill = 'green';
          options.side.globalAlpha = .6;
          break;
          
        // умова для багатоповерхівок
        case (
          b.tags['building:levels'] >= 3 || 
          b.tags.building === 'apartments'
        ):
          options.ceiling.fill = 'brown';
          options.side.fill = 'brown';
          options.side.globalAlpha = .4;
          break;
        
        // умова длоя решти типів будинків
        default:
          options.ceiling.fill = 'green';
          options.side.fill = 'green';
          options.side.globalAlpha = .6;
          break;
      };
      return options;
  };





  remove(point){
    const removePoint = utils.getNearestPoint(point, this.points, this.sizeRemove)
   
    if(removePoint){
      this._removePoint(removePoint);
      this._removeSegment(removePoint);
      this._removePolygons(removePoint);
    }
  };
  _removePoint(point) {
    this.points = this.points.filter(p => !p.equals(point));
  }
  _removeSegment(point) {
    this.roads = this.roads.filter(s => s.distanceToPoint(point) > this.sizeRemove);
  };
  _removePolygons(point){
    this.buildings        = this.__remove(this.buildings,        point);
    this.areals           = this.__remove(this.areals,           point);
    this.naturals         = this.__remove(this.naturals,         point);
    this.relationPolygons = this.__remove(this.relationPolygons, point);
  };
  __remove(arrey, point){
    return arrey.filter(polygon => polygon && polygon.distanceToPoint(point) > this.sizeRemove);
  };


  dispose(){
    this.crossing  = [];
    this.bus_stop  = [];
    this.traffic_signals = []
    
    
    
    this.points    = [];
    this.roads     = [];
    this.buildings = [];
    this.areals    = [];
    this.naturals  = [];
    this.relationPolygons = [];
  };
}

