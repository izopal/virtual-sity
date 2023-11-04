import * as utils  from '../math/utils.js';
export class Segment{
    constructor(p1, p2, tools = {}){
        this.p1 = p1;
        this.p2 = p2;
        // параметри інструментів графічного редактора
        this.tools  = tools;
    };

    length(){
        return utils.distance(this.p1, this.p2)
    };

    directionVector(){
        const p          = utils.operate(this.p2, '-', this.p1);
        const multiplier = 1 / Math.hypot(p.x, p.y);
        return utils.operate(p, '*', multiplier)
    }
   
    draw(ctx, options = {}){
        const {
            size        = NaN,
            color       = '',
            globalAlpha = NaN,
            dash  = {
                size:       NaN,
                length:       NaN,
                interval:   NaN,
                color:      '',
            },
        } = options;
       
        ctx.save();
            ctx.globalAlpha = globalAlpha  ;
            ctx.beginPath();
                    ctx.lineWidth   =  size  || dash.size;
                    ctx.strokeStyle =  color || dash.color;
                    ctx.setLineDash([dash.length, dash.interval]);
                    ctx.moveTo(this.p1.x, this.p1.y);
                    ctx.lineTo(this.p2.x, this.p2.y);
            ctx.stroke();
            ctx.setLineDash([]);
           
            ctx.beginPath();
                ctx.arc(this.p2.x,
                        this.p2.y,
                        size * .5,
                        0,
                        Math.PI * 2);
                ctx.fillStyle = color;
            ctx.fill();
        ctx.restore();
    }
}