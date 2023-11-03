import * as utils  from '../math/utils.js';
import { data }    from '../constants.js';
import { Point }   from './point.js';
import { Segment } from './segment.js';

export class Polygon {
    constructor(points = []){

        // параметри полігону
        const polygon       = data.primitives.polygon || {};
        this.width       = utils.getValidValue(polygon.width, 0);
        this.colorFill   = polygon.colorFill;
        this.colorStroke = polygon.colorStroke; 
        this.globalAlpha = utils.getValidValue(polygon.globalAlpha, 0, 1); 
        
        this.segments = [];
        this.points = points;

        for(let i = 1; i <= points.length; ++i){
            this.segments.push(new Segment(points[i - 1], points[i % points.length]))
        }
    };

    static union(roads){
        Polygon.multiBreak(roads);
        const keptSegments = [];
        for(let i = 0; i < roads.length; ++i){
            for(const segment of roads[i].segments){
                let keep = true;
                for(let j = 0; j < roads.length; ++j){
                    if(i !== j)  {
                        if(roads[j].containsSegment(segment)){
                            keep = false;
                            break;
                        }
                    }
                };
                if(keep) keptSegments.push(segment);
            }
        };
        return keptSegments;
    }

    static multiBreak (roads){
        // console.log(roads)
        for(let i = 0; i < roads.length - 1; ++i){
            for(let j = i + 1; j < roads.length; ++j){
                Polygon.break(roads[i], roads[j])
            }
        }
    }


    static break(road1 = {}, road2 = {}){
        const segments1    = road1.segments || [];
        const segments2    = road2.segments || [];

        for(let i = 0; i < segments1.length; ++i){
            for(let j = 0; j < segments2.length; ++j){
                const intersection = utils.getIntersection(segments1[i].p1, segments1[i].p2, segments2[j].p1, segments2[j].p2)
                
                if(intersection && intersection.offset !==1 && intersection.offset !==0){
                    const point = new Point(intersection);

                    let aux = segments1[i].p2;
                    segments1[i].p2 = point;
                    segments1.splice(i+1, 0, new Segment(point, aux));

                    aux = segments2[j].p2;
                    segments2[j].p2 = point;
                    segments2.splice(j+1, 0, new Segment(point, aux)); // додаємо новий сегмент 
                }
            }
        };
    };

    containsSegment(segment){
        const coordinates = utils.operate(segment.p1, 'average', segment.p2)
        const midpoint = new Point(coordinates);
        return this.containsPoint(midpoint);
    };

    containsPoint(point){
        const coordinatesOuterPoint = { x: -10000, y: -10000 };
        const outerPoint = new Point(coordinatesOuterPoint);
        let counter = 0;
        for(const segment of this.segments){
            const int = utils.getIntersection(outerPoint, point, segment.p1, segment.p2);
            if(int) ++ counter;
        };
        return counter % 2 === 1;
    };

    
    // drawSegments(ctx){
    //      for(const segment of this.segments){
    //         segment.draw(ctx, {color: utils.getRandomColor(), size: 5})
    //      }
    // }
    
    draw(ctx, configuration = {}){
        const {
            fill         = '',
            stroke       = '',
            lineWidth    = NaN,
            globalAlpha  = NaN,

        } = configuration;

        this.colorFill   = fill        || this.colorFill; 
        this.colorStroke = stroke      || this.colorStroke; 
        this.width       = lineWidth   || this.width; 
        this.globalAlpha = globalAlpha || this.globalAlpha; 

        ctx.save();
        ctx.globalAlpha = this.globalAlpha;
        ctx.beginPath();
            ctx.fillStyle   = this.colorFill;
            ctx.strokeStyle = this.colorStroke;
            ctx.lineWidth   = this.width;
            // малюємо лінію
            if (this.points.length > 0){
                ctx.moveTo(this.points[0].x, this.points[0].y);
                for(let i = 0; i < this.points.length; ++i){
                    ctx.lineTo(this.points[i].x, this.points[i].y);
                }
            }
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    };
   
}