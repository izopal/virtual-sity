import * as utils       from '../math/utils.js';
import { data }     from '../constants.js';
import { Segment }  from "../primitives/segment.js";
import { Envelope } from "../primitives/envelope.js";


export class Markings{
    constructor(parameters = {}){
        this.data            = data;
        this.autoHeight      = data.markings.start.height;
        
        this.parameters      = parameters;
        this.center          = parameters.point;
        this.directionVector = parameters.directionVector;
        this.roadWidth       = parameters.width *.5;
        this.key             = parameters.key;
        // console.log(this.data)

        this.dataConfig      = this.data.markings[`${this.key }`];
        this.dh              = this.dataConfig.dh;
        this.dw              = this.dataConfig.dw;
        this.width           = this.roadWidth * this.dw;
        this.height          = this.autoHeight * this.dh;
        
        this.angel        = utils.angel(this.directionVector);
        this.perpedicular = utils.perpedicular(this.directionVector);
        
        this.line   = this.updateLine();
        this.polygon = new Envelope(this.line, {width: this.width}).polygon;
        // this.polygon = {}
        
    };

    updatePolygon(){
        const support = new Segment(
            utils.translateMetod(this.center, this.angel,  this.height * .5),
            utils.translateMetod(this.center, this.angel, -this.height * .5),
        );
        const polygon = new Envelope(support, {width: this.width}).polygon;
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

    drawDebug(ctx, debug){
        if(this.polygon) this.polygon.draw(ctx, debug);
    }
}