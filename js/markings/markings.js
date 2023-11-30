import * as utils       from '../math/utils.js';
import { Segment } from "../primitives/segment.js";
import { Envelope } from "../primitives/envelope.js";


export class Markings{
    constructor(parameters){
        console.log(parameters.key)
        this.center          = parameters.point;
        this.directionVector = parameters.directionVector;
        
        this.data            = parameters.data;
        this.configDebug     = this.data.debug;
        this.dataConfig      = this.data.markings[`${parameters.key}`];
        this.height          = this.dataConfig.height;
        this.width           = this.dataConfig.width = this.data.world.road.width * .5;
        
        this.angel        = utils.angel(this.directionVector);
        this.perpedicular = utils.perpedicular(this.directionVector);

        this.polygon = this.updatePolygon()
    };

    updatePolygon(){
        const support = new Segment(
            utils.translateMetod(this.center, this.angel,  this.width ),
            utils.translateMetod(this.center, this.angel, -this.width ),
        );
        const polygon = new Envelope(support, this.dataConfig).polygon;
        return polygon
    };

    updateLine(){
        const line = new Segment(
            utils.operate(this.center, '+', utils.operate(this.perpedicular, '*',  this.width)),
            utils.operate(this.center, '+', utils.operate(this.perpedicular, '*', -this.width)),
        );
        return line
    };


    draw(ctx){
        
    };

    drawText(ctx, options = {}){
        const {
            text            = '',
            angel           = NaN,
            fontSize        = NaN,
            verticalOffsetX = 0,
            verticalOffsetY = 0,
        } = options;

        ctx.save();
            let name = this.dataConfig.key;
            if(text === 'all')         name = this.dataConfig.key.toUpperCase();
            if(text === 'firstLetter') name = this.dataConfig.key[0].toUpperCase();

            ctx.translate(this.center.x, this.center.y);
            ctx.rotate(angel);
            ctx.scale(this.dataConfig.scale.min, this.dataConfig.scale.max);
            ctx.beginPath();
                ctx.textBaseline = 'middle';
                ctx.textAlign    = 'center';
                ctx.fillStyle    = this.dataConfig.fillStyle;
                ctx.font         = `bold ${fontSize}px Arial`;
                ctx.fillText(`${name}`, verticalOffsetX, verticalOffsetY);
        ctx.restore();
    };

    drawDebug(ctx){
        if(this.polygon) this.polygon.draw(ctx, this.configDebug);
    }
}