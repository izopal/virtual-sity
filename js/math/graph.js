import * as utils from './utils.js';
import { data }    from '../constants.js';
import { tools }    from '../tools.js';

export class Graph{
    constructor(points = [], sortedPoints = {}, segments = [], sortedSegments = {},){
        this.tools          = tools;

        this.configPoint    = data.primitives.point;
        this.points         = points;
        this.sortedPoints   = sortedPoints;
        
       
        this.configSegment  = data.primitives.segment;
        this.segments       = segments;
        this.sortedSegments = sortedSegments;
    };
    
    addPoint(point){
        this.sortedPoints = utils.sortObject(point, this.tools , this.sortedPoints)
        this.points.push(point);
    };
    // Блок додавання сигменів 
    addSegment(line){
        this.sortedSegments = utils.sortObject(line, this.tools, this.sortedSegments);
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
        const points               = this.sortedPoints.point || []
        for(const point of points) {point.draw(ctx, this.configPoint.point)};
    };
    removeAll(){
        this.points         = [];
        this.segments       = [];
    }
}