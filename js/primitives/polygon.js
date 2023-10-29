import {findObjData} from '../math/utils.js'

export class Polygon {
    constructor(points){
        this.data        = findObjData('polygon');

        this.width       = this.data.width;
        this.colorFill   = this.data.colorFill;
        this.colorStroke = this.data.colorStroke; 
        
        this.points = points;
    };

    remove
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

    }
}