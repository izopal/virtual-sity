import {Envelope}  from './primitives/envelope.js';
import {Polygon}   from './primitives/polygon.js';

export class World{
    constructor(graph = {}){
        this.graph          = graph;
        this.sortedSegments = this.graph.sortedSegments;
        this.sortedPoints   = this.graph.sortedPoints;
        this.roads          = [];
        this.roadBorders    = [];
        this.generateRoad();
    };

    generateRoad(){
        this.roads.length = 0;
        this.roadSegments = this.sortedSegments.road || [];
        for(const segment of this.roadSegments){
            this.roads.push(new Envelope(segment))
        };
        // перехрестя
        this.roadBorders = Polygon.union(this.roads.map(road => road.segmentRoad));
    };

    removeRoad(point){
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
        for(const road of this.roads)                  road.draw(ctx,    {fill: '#BBB', stroke: '#BBB', lineWidth: 15});
        for(const border of this.roadBorders)          border.draw(ctx,  {color: 'white', size: 2}); 
        for(const segment of this.sortedSegments.road) segment.draw(ctx, {color: 'white', size: 1, globalAlpha: .8, dash: {active: true, line: 15, interval: 10}});
        for(const point of this.sortedPoints.road)     point.draw(ctx,   {color: 'white', radius: 5, globalAlpha: 0.1});
    };

}