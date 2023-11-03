import * as utils from './utils.js';

export class Graph{
    constructor(points   = [], sortedPoints = {}, segments = [], sortedSegments = {},){
        this.points         = points;
        this.sortedPoints   = sortedPoints;
       
        this.segments       = segments;
        this.sortedSegments = sortedSegments;
    };
    
    addPoint(point, tools){
        this.sortedPoints = utils.sortObject(point, tools, this.sortedPoints)
        this.points.push(point);

    };
    // Блок додавання сигменів 
    addSegment(line, tools){
        this.sortedSegments = utils.sortObject(line, tools, this.sortedSegments);
        this.segments.push(line);
    };
    
    removePoint(point){
        const index = this.points.indexOf(point)  
        this.points.splice(index, 1)
    }
    
    removeSegment(point) {
        this.segments = this.segments.filter(segment => !segment.p1.equals(point) && !segment.p2.equals(point));  
    }


    draw(ctx){
        for(const seg of this.segments){
            if(seg.tools.point) {seg.draw(ctx)};
            if(seg.tools.curve) {seg.draw(ctx)};
        }

        for(const point of this.points) {
            if(point.tools.point) {point.draw(ctx)};
        };
    };
    removeAll(){
        this.points         = [];
        this.segments       = [];
    }
}