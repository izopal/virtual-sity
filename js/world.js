import {Envelope}  from './primitives/envelope.js';
import {Polygon}  from './primitives/polygon.js';

export class World{
    constructor(graph){
        this.graph = graph;
        this.sortedSegments = this.graph.sortedSegments;
        this.sortedPoints   = this.graph.sortedPoints;
        this.envelop  = new Envelope()
        this.roads = [];
        this.generateRoad();
        
        
    };
    generateRoad(){
        this.segmentsRoad = this.sortedSegments.road || [];
        this.roads.length = 0;
        for(const segment of this.segmentsRoad){
            this.roads.push(new Envelope(segment))
        };
        console.log(this.roads)
        перехрестя
        this.intersections = Polygon.break(
            this.roads[0].road,
            this.roads[1].road,
        )

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
        for(const env of this.roads) env.draw(ctx);
        for(const int of this.intersections) int.draw(ctx);
    };

}