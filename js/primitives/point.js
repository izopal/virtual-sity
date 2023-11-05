import * as utils  from '../math/utils.js';
export class Point {
    constructor(coordinates = { x: 0, y: 0 }, tools = {}) {
        this.coordinates = coordinates;
        this.x    = coordinates.x;
        this.y    = coordinates.y;

        // параметри інструментів
        this.tools = tools;
    }

    equals(point) {
        return this.x === point.x && this.y === point.y;
    };
    // // функція визначення відстанні від точки до сегменту
    distanceToSegment(p1, p2) {
        const v1  = utils.operate(this.coordinates, '-', p1);
        const v2  = utils.operate(p2, '-', p1);
        const dotPlus  = utils.operate(v1, '+dot', v2);
        const dotMinus = utils.operate(v1, '-dot', v2);
        
        const lengthV1 = Math.hypot(v1.x, v1.y);
        const lengthV2 = Math.hypot(v2.x, v2.y);


        

        if (dotPlus <= 0)                    return lengthV1;
        if (dotPlus >= lengthV2 * lengthV2)  return lengthV2;

        return 2 * Math.abs(dotMinus) / lengthV2;
    }

    draw(ctx, options = {}) {
        const { 
            color       = '',
            radius      = NaN,
            globalAlpha = NaN,
            lineWidth   = NaN,
            colorStroke = '',
        } = options

        if (!this.tools.curve){
            ctx.save();
            ctx.globalAlpha = globalAlpha;
            ctx.beginPath();
                ctx.arc(this.x, 
                        this.y, 
                        radius, 
                        0, 
                        Math.PI * 2);
                ctx.fillStyle =  color;
            ctx.fill();
            
            if (lineWidth > 0) {
                ctx.lineWidth   = lineWidth;
                ctx.strokeStyle = colorStroke;
                ctx.fillStyle = '';
                ctx.stroke();
                // ctx.fill();
            };
            ctx.restore();
        }             
    }
}