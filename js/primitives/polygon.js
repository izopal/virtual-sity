import {findObjData} from '../math/utils.js'
import { Segment } from './segment.js';

export class Polygon {
    constructor(points = []){
        this.data        = findObjData('polygon') || {};

        this.width       = Math.max(0, this.data.width);
        this.colorFill   = this.data.colorFill;
        this.colorStroke = this.data.colorStroke; 
        
        this.points = points;

        this.segments = [];
        for(let i = 0; i <= points.length; ++i){
            this.segments.push(new Segment(points[i - 1], points[i % points.length]))
        }
    };

   
    draw(ctx, colorStroke, colorFill){
        ctx.beginPath();
            ctx.fillStyle   = colorFill   ? colorFill   : this.colorFill;
            ctx.strokeStyle = colorStroke ? colorStroke : this.colorStroke;
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
    };
   
}