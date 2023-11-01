import * as utils  from '../math/utils.js';
import {Polygon}   from './polygon.js';

export class Envelope{
    constructor(skeleton = {p1: 0, p2: 0}){
        this.envelopData = utils.findObjData('envelope');
        
        this.skeleton    = skeleton;

        this.width       = utils.getValidValue(this.envelopData.width, 0);
        this.current     = utils.getValidValue(Math.floor(this.envelopData.current), 1);
        this.colorStroke = this.envelopData.colorStroke;
        this.colorFill   = this.envelopData.colorFill;
      
        this.points =  [];
        
        this.segmentRoad        = this.#generateRoad();
    };

    #generateRoad(){
        const {p1, p2} = this.skeleton;
        
        const radius = this.width * .5;
        const result = utils.operate(p1, '-', p2);
        const alpha  = Math.atan2(result.y, result.x);

        const alpha_cw     = alpha + Math.PI * .5;
        const alpha_ccw    = alpha - Math.PI * .5;
        const roundedAlpha = Math.ceil(alpha_cw * 100) / 100;   // заокруглюємо в більшу сторону 2 знаки після коми
        const step         = Math.PI / this.current;
        
        for(let i = alpha_ccw; i <= roundedAlpha; i += step){
            this.points.push(utils.translateMetod(p1, i, radius));
        }
        for(let i = alpha_ccw; i <= roundedAlpha; i += step){
            this.points.push(utils.translateMetod(p2, Math.PI + i, radius));
        }
        return new Polygon(this.points) || {}
    };

    draw(ctx, configuration){
        this.segmentRoad.draw(ctx, configuration);
        // this.segmentRoad.drawSegments(ctx);
      
    };

}