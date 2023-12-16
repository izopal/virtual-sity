import {data}      from '../constants.js';
import * as utils  from '../math/utils.js';

export class Point {
    constructor(coordinates = { x: 0, y: 0 }, tools = {}, radius) {
        this.coordinates = coordinates;
        this.x    = this.coordinates.x;
        this.y    = this.coordinates.y;

        this.config = data.primitives.point;
        this.radius = radius || this.config.point.radius;
        
        this.tools = tools;
    };

    equals(point) {
        return point && 
            point.x !== undefined && 
            point.y !== undefined && 
            this.x === point.x && 
            this.y === point.y;
    };
    distanceToPoint(point){
        const c =  utils.operate(point, '-', this.coordinates);
        return Math.sqrt(c.x * c.x + c.y * c.y)
    };

    draw(ctx, options = {}) {
        const { 
            color       = '',
            radius      = NaN,
            globalAlpha = NaN,
            lineWidth   = NaN,
            colorStroke = '',
        } = options

        this.radius = radius || this.radius;

        if(!this.tools.curve){

            ctx.save();
            ctx.globalAlpha = globalAlpha;
            ctx.beginPath();
                ctx.arc(this.x, 
                        this.y, 
                        this.radius, 
                        0, 
                        Math.PI * 2);
                ctx.fillStyle =  color;
            ctx.fill();
            
            if (lineWidth > 0) {
                ctx.lineWidth   = lineWidth;
                ctx.strokeStyle = colorStroke;
                ctx.fillStyle = '';
                ctx.stroke();
                ctx.fill();
            };
            ctx.restore();
        }
                     
    }
}