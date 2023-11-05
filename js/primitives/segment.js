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
    };

    
    distanceToPoint(point){
        const proj = this.projectPoint(point);
        if(proj.offset > 0 && proj.offset < 1){
            return utils.distance(point, proj.point)
        };
        const distanceToP1 = utils.distance(point, this.p1);
        const distanceToP2 = utils.distance(point, this.p2);
        return Math.min(distanceToP1, distanceToP2);
    }

    projectPoint(point){
        const a      = utils.operate  (point,   '-',    this.p1);
        const b      = utils.operate  (this.p2, '-',    this.p1);
        const normB  = utils.normalize(b);
        const scaler = utils.operate  (a,       '+dot', normB);
        const p2     = utils.operate  (normB,    '*',   scaler);
        const proj = {
            point:  utils.operate(this.p1, '+', p2),
            offset: scaler / Math.hypot(b.x, b.y)
        };
        return proj
    }
   
    draw(ctx, options = {}){
        const {
            size        = NaN,
            color       = '',
            globalAlpha = NaN,
            dash  = {
                size:       NaN,
                length:     NaN,
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