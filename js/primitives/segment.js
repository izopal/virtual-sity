import * as utils from '../math/utils.js';
import { data }   from '../constants.js';

export class Segment{
    constructor(p1, p2, tools = {}){
        this.segment = data.primitives.segment;
        this.p1 = p1;
        this.p2 = p2;
                

        // параметри лінії 
        const line = this.segment.line;
        this.color       = line.color;
        this.size        = utils.getValidValue(line.size, 0);
        this.globalAlpha = utils.getValidValue(line.globalAlpha, 0, 1);

        // параметри штрих-пунтирної лінії
        const dash = this.segment.dash;
        this.dashColor       = dash.color;
        this.dashSize        = utils.getValidValue(dash.size, 0);
        this.dashLength      = utils.getValidValue(dash.length, 0);
        this.dashInterval    = utils.getValidValue(dash.interval, 0);
        this.dashGlobalAlpha = utils.getValidValue(dash.globalAlpha, 0, 1);

        // параметри інструментів графічного редактора
        this.tools  = tools;
        // параметри при вкл. інструменту ручка
        if(this.tools.curve){
            const paint = this.segment.paint
            this.color       = paint.color;    
            this.size        = utils.getValidValue(paint.size, 0);
            this.globalAlpha = utils.getValidValue(paint.globalAlpha, 0, 1);
        };
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
            color       = '',
            size        = NaN,
            globalAlpha = NaN,
            dash  = {
                active:   false,
                line:     this.dashLength,
                interval: this.dashInterval,
            },
        } = options;

        this.color         = color        || this.color; 
        this.size          = size         || this.size; 
       
            ctx.save();
            ctx.globalAlpha = globalAlpha  || this.globalAlphal;
            ctx.beginPath();
   
                // малюємо штрихпунтрина лінія
                if (dash.active){
                    dash.line       = dash.line || this.dashLength;
                    dash.interval   = dash.interval || this.dashInterval;
                    ctx.lineWidth   = size || this.dashSize;
                    ctx.strokeStyle = color || this.dashColor;
                    ctx.setLineDash([dash.line, dash.interval]);
                    ctx.moveTo(this.p1.x, this.p1.y);
                    ctx.lineTo(this.p2.x, this.p2.y);
                }else if(!this.tools.road){
                    ctx.lineWidth   =  this.size;
                    ctx.strokeStyle =  this.color;
                    ctx.moveTo(this.p1.x, this.p1.y);
                    ctx.lineTo(this.p2.x, this.p2.y);
                }
            
            ctx.stroke();
            ctx.setLineDash([]);
           
            ctx.beginPath();
                ctx.arc(this.p2.x,
                        this.p2.y,
                        this.size * .5,
                        0,
                        Math.PI * 2);
                ctx.fillStyle = this.color;
            ctx.fill();
            
            ctx.restore();
      
    }
}