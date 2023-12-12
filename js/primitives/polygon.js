import * as utils  from '../math/utils.js';
import { Point }   from './point.js';
import { Segment } from './segment.js';

export class Polygon {
    constructor(points = []){
        this.points = points;
        // console.log(points)
        this.segments = [];
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
    // функція запуску break для більше чим два полігона
    static multiBreak (roads){
        for(let i = 0; i < roads.length - 1; ++i){
            for(let j = i + 1; j < roads.length; ++j){
                Polygon.break(roads[i], roads[j])
            }
        }
    }
    // функція переривання двох полігонів в місцях перехрестя 
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
    //  функція визначення чи точка всередині полігона чи ні (якщо counter непарний вона всередині(перехрестя відбулося тільки з одніє із сторін полігона) )
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

    intersectsPoly(polygon){
        for(let s1 of this.segments){
            for(let s2 of polygon.segments){
                if(utils.getIntersection(s1.p1, s1.p2, s2.p1, s2.p2)) return true
            }
        }
        return false
    }
    
    distanceToPoint(point){
        return Math.min(...this.segments.map((s) => s.distanceToPoint(point)))
    };
    distanceToPolygon(polygon){
        return Math.min(...this.points.map(p => polygon.distanceToPoint(p)));
    }

    draw(ctx, options = {}){
        const {
            lineWidth    = NaN,
            fill         = '',
            colorStroke  = '',
            globalAlpha  = NaN,
        } = options;
        
        ctx.save();
        ctx.globalAlpha = globalAlpha;
            ctx.beginPath();
                ctx.strokeStyle = colorStroke;
                ctx.fillStyle   = fill;
                ctx.lineWidth   = lineWidth;
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