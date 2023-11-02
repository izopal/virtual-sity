import {data}      from './constants.js';
import {Envelope}  from './primitives/envelope.js';
import {Polygon}   from './primitives/polygon.js';

export class World{
    constructor(graph = {}){
        this.graph          = graph;
       
        this.config         = data.world || {};
        this.configRoad     = this.config.road;

        this.roadPoints      = this.graph.sortedPoints.road || [];
       
        this.sortedSegments    = {...this.graph.sortedSegments} || {};

        this.roads          = [];
        this.roadBorders    = [];
        this.buildings      = [];

        this.generateRoad();
    };
    
    generateRoad(){
        const roadSegments    = this.graph.sortedSegments.road || [];
        this.roads.length = 0;
        for(const segment of roadSegments){
            this.roads.push(new Envelope(segment, this.config.road))
          
        };
     
        // перехрестя
        this.roadBorders = Polygon.union(this.roads.map(road => road.segmentRoad));
    };
    
    removeRoad(point){
        const index = this.sortedPoints.road.indexOf(point);  
        this.sortedPoints.road.splice(index, 1);
        this.sortedSegments.road = this.sortedSegments.road.filter(segment => !segment.p1.equals(point) && !segment.p2.equals(point))
    };
    
    removeAll(){
        for(const key in  this.graph.sortedSegments){
            this.graph.sortedSegments[key] = [];
        }
        for(const key in  this.graph.sortedPoints){
            this.graph.sortedPoints[key] = [];
        }
    }

    draw(ctx){
        const roadSegments    = this.graph.sortedSegments.road || [];
        const roadPoints      = this.graph.sortedPoints.road || [];
        for(const road of this.roads)                  road.draw(ctx,    this.configRoad );
        for(const border of this.roadBorders)          border.draw(ctx,  this.configRoad.border); 
        for(const segment of roadSegments)        segment.draw(ctx, this.configRoad.marking );
        for(const point of roadPoints )                point.draw(ctx,   this.configRoad.point);
       
    };

}