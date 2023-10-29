import {findObjData, translateMetod, operate} from '../math/utils.js'
import {Polygon} from './polygon.js';



export class Envelope{
    constructor(skeleton = {p1: 0, p2: 0}){
        this.envelopData = findObjData('envelope');
        this.skeleton    = skeleton;

        this.width       = this.envelopData.width;
        this.current     = this.envelopData.current;
        this.colorStroke = this.envelopData.colorStroke;
        this.colorFill = this.envelopData.colorFill;
      
        this.points =  [] ;
        this.polygon     = this.#generatePolygon();

    };

    #generatePolygon(){
        const {p1, p2} = this.skeleton;
        
        const radius = this.width * .5;
        const result = operate(p1, '-', p2)
        const alpha  = Math.atan2(result.y, result.x);

        const alpha_cw     = alpha + Math.PI * .5;
        const alpha_ccw    = alpha - Math.PI * .5;
        const roundedAlpha = Math.ceil(alpha_cw * 100) / 100;   // заокруглюємо в більшу сторону 2 знаки після коми
        const step      = Math.PI / Math.max(1, Math.floor(this.current));
        
        for(let i = alpha_ccw; i <= roundedAlpha; i += step){
            this.points.push(translateMetod(p1, i, radius));
        }
        for(let i = alpha_ccw; i <= roundedAlpha; i += step){
            this.points.push(translateMetod(p2, Math.PI + i, radius));
        }
        return new Polygon(this.points)
    };
    

    remove(){
        this.points = [];
    }
    draw(ctx){
        this.polygon.draw(ctx, this.colorStroke, this.colorFill)
    }
}