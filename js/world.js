import {data}      from './constants.js';
import {Envelope}  from './primitives/envelope.js';
import {Polygon}   from './primitives/polygon.js';

export class World{
    constructor(graph = {}){
        this.graph          = graph;
        this.config         = data.world || {};

        this.sortedSegments = this.graph.sortedSegments;
        this.sortedPoints   = this.graph.sortedPoints;

        this.roads          = [];
        this.roadBorders    = [];
        this.buildings      = [];
        this.generateRoad();
    };

    generateRoad(){
        this.roads.length = 0;
        this.roadSegments = this.sortedSegments.road || [];
        for(const segment of this.roadSegments){
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
        for(const road of this.roads)                  road.draw(ctx,    this.config.road);
        for(const border of this.roadBorders)          border.draw(ctx,  this.config.road.border); 
        for(const segment of this.sortedSegments.road) segment.draw(ctx, this.config.road.marking );
        for(const point of this.sortedPoints.road)     point.draw(ctx,   this.config.road.point);
    };

}