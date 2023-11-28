import * as utils       from '../math/utils.js';
import { Segment } from "../primitives/segment.js";
import { Envelope } from "../primitives/envelope.js";


export class Stop{
    constructor(coordinates = { x: 0, y: 0 }, directionVector, data){
        this.center          = coordinates;
        this.directionVector = directionVector;
        this.data            = data;
        this.configDebug     = this.data.debug;
        this.dataConfig      = this.data.markings.stop;
        this.data.markings.stop.width = this.data.world.road.width * .5;
        this.height          = this.dataConfig.height;
    
        console.log(this.height)
       
        this.angel = utils.angel(this.directionVector);
       
        this.support = new Segment(
            utils.translateMetod(this.center, this.angel,  this.height),
            utils.translateMetod(this.center, this.angel, -this.height)
            );

        this.polygon = new Envelope(this.support, this.dataConfig).polygon;
        this.border = this.polygon.segments[2]
    };
    draw(ctx){
        this.border.draw(ctx, this.dataConfig);
        // промалбовуємо текст на дорозі
        ctx.save();
            ctx.translate(this.center.x, this.center.y);
            ctx.rotate(this.angel - Math.PI * .5);
            ctx.scale(1, 2);
            ctx.beginPath();
                ctx.textBaseLine = 'middle';
                ctx.textAlign    = 'center';
                ctx.fillStyle    = this.dataConfig.fillStyle;
                ctx.font         = 'bold' + this.height * .3 + 'px Arial';
                ctx.fillText(`${this.dataConfig.key.toUpperCase()}`, 0, this.height * .1);
        ctx.restore();
   };
   drawDebug(ctx){
        this.polygon.draw(ctx, this.configDebug);
   }
}