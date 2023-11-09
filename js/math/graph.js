import * as utils from './utils.js';
import { data }    from '../constants.js';

export class Graph{
    constructor(points = [], sortedPoints = {}, segments = [], sortedSegments = {},){
        this.configPoint    = data.primitives.point;
        this.points         = points;
        this.sortedPoints   = sortedPoints;
       
        this.configSegment  = data.primitives.segment;
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
    
    remove(point){
        this.points   = this.points.filter(p => !p.equals(point));
        this.segments = this.segments.filter(segment => !segment.p1.equals(point) && !segment.p2.equals(point));  
    };
    // 
    hash(){
        return JSON.stringify(this.sortedSegments.city)
    }

    draw(ctx){
        for(const seg of this.segments){
            if(seg.tools.point) {seg.draw(ctx, this.configSegment.line)};
            if(seg.tools.curve) {seg.draw(ctx, this.configSegment.curve)};
        }

        for(const point of this.points) {
            if(point.tools.point) {point.draw(ctx, this.configPoint.point)};
        };
    };
    removeAll(){
        this.points         = [];
        this.segments       = [];
    }
}