import {data}      from './constants.js';
import {Envelope}  from './primitives/envelope.js';
import {Polygon}   from './primitives/polygon.js';

export class World{
    constructor(graph){
        this.graph          = graph;
       
        this.config         = data.world || {};
        this.configRoad     = this.config.road;

        this.configPolygon  = data.primitives.polygon 
        
        this.polygons       = [];
        this.roads          = [];
        this.roadBorders    = [];
        this.buildings      = [];
        
        this.generateRoad();
    };
    
    generateRoad(){
       
        const roadSegments = this.graph.sortedSegments.road || [];
        this.roads         = roadSegments.map(segment => new Envelope(segment, this.config.road));
        this.roadBorders   = Polygon.union(this.roads.map(road => road.segmentRoad));
    };
    
    removeRoad(point){
        this.graph.sortedPoints.road   = this.graph.sortedPoints.road.filter(p => !p.equals(point));
        this.graph.sortedSegments.road = this.graph.sortedSegments.road.filter(segment => !segment.p1.equals(point) && !segment.p2.equals(point))
    };
    
    removeAll(){
        for(const key in  this.graph.sortedSegments){this.graph.sortedSegments[key] = []};
        for(const key in  this.graph.sortedPoints)  {this.graph.sortedPoints[key] = []};
    }

    draw(ctx){
        const roadPoints      = this.graph.sortedPoints.road    || [];
        const polygonPoints   = this.graph.sortedPoints.polygon || [];
        const roadSegments    = this.graph.sortedSegments.road  || [];
        


        new Polygon(polygonPoints).draw(ctx)
        for(const road    of this.roads)        {road.draw(ctx,    this.configRoad)};
        for(const border  of this.roadBorders)  {border.draw(ctx,  this.configRoad.border)}; 
        for(const segment of roadSegments)      {segment.draw(ctx, this.configRoad.marking)};
        for(const point   of roadPoints )       {point.draw(ctx,   this.configRoad.point)};
        for(const point   of polygonPoints )    {point.draw(ctx,   this.configPolygon)};

    };

}