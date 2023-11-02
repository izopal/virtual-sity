import { data } from '../constants.js';
import * as utils from '../math/utils.js';

export class Point {
    constructor(coordinates = { x: 0, y: 0 }, tools = {}) {
        this.x    = coordinates.x;
        this.y    = coordinates.y;
        this.data = data.primitives.point || {};

        // параметри точки
        const point      = this.data.point
        this.color       = point.color;
        this.radius      = utils.getValidValue(point.radius, 0);
        this.globalAlpha = utils.getValidValue(point.globalAlpha, 0, 1);

        // параметри останьої точки
        const lastPoint = this.data.lastPoint;
        this.multiplierLastRadius    = utils.getValidValue(lastPoint.radius, 0, 1);
        this.multiplierLastWidth     = utils.getValidValue(lastPoint.width, 0, 1);
        this.lastPointRadius         = this.radius * this.multiplierLastRadius;
        this.lastPointWidth          = this.lastPointRadius * this.multiplierLastWidth;
        this.lastPointColor          = lastPoint.color;
        this.lastGlobalAlpha         = utils.getValidValue(lastPoint.globalAlpha, 0, 1);

        // параметри активної точки
        const activePoint           = this.data.activePoint;
        this.multiplierActiveRadius = utils.getValidValue(activePoint.radius, 0, 1);
        this.activePointColor       = activePoint.color;
        this.activeGlobalAlpha      = utils.getValidValue(activePoint.globalAlpha, 0, 1);

        // параметри інструментів
        this.tools = tools;
    }

    equals(point) {
        return this.x === point.x && this.y === point.y;
    }

    draw(ctx, options = {}) {

        const { 
            lastPoint   = false, 
            activePoint = false, 
            color       = '',
            radius      = null,
            globalAlpha = null,
        } = options

        this.color       = color        || this.color; 
        this.radius      = radius       || this.radius; 
        this.globalAlpha = globalAlpha  || this.globalAlpha; 

        this.activePointRadius     = this.radius * this.multiplierActiveRadius;
        this.lastPointRadius       = this.radius * this.multiplierLastRadius;

        if (this.tools.point)                 this.drawCircle(ctx, this.radius, this.color);
        if (this.tools.polygon)               this.drawCircle(ctx, this.radius, this.color);
        if (this.tools.road)                  this.drawCircle(ctx, this.radius, this.color, this.globalAlpha)
        if (lastPoint && !this.tools.curve)   this.drawCircle(ctx, this.lastPointRadius,    this.lastPointColor, {lineWidth: this.lastPointWidth});
        if (activePoint && !this.tools.curve) this.drawCircle(ctx, this.activePointRadius,  this.activePointColor);
    }

    drawCircle(ctx, radius, fillColor,  globalAlpha = 1, {lineWidth = 0} = {}) {
        ctx.save();
        ctx.globalAlpha = globalAlpha;
        ctx.beginPath();
            ctx.arc(this.x, 
                    this.y, 
                    radius, 
                    0, 
                    Math.PI * 2);
            ctx.fillStyle = fillColor;
        ctx.fill();
        
        if (lineWidth > 0) {
            ctx.lineWidth   = lineWidth;
            ctx.strokeStyle = fillColor;
            ctx.stroke();
        };
        ctx.restore();
    }
}