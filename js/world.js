import {Envelope}  from './primitives/envelope.js';

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
        }
    };

    removeRoad(point){
        this.sortedSegments.road = this.sortedSegments.road.filter(segment => !segment.p1.equals(point) && !segment.p2.equals(point))
    };
    
    removeAll(){
        this.sortedSegments.road = [];
    }

    draw(ctx){
        for(const env of this.roads) env.draw(ctx);
    };

}