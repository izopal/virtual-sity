import {findObjData} from '../math/utils.js'

export class Point {
    constructor(coordinates = {x: 0, y: 0}, tools = {}){
        this.x    = coordinates.x;
        this.y    = coordinates.y;
        this.data = findObjData('point') || {};
        // параметри інструментів
        this.tools  = tools;
        // параметри точки
        this.radius  = Math.max(0, this.data.point.radius);
        this.color   = this.data.point.color;
        // параметри останьої точки
        this.lastPointMultiplier = Math.max(0, Math.min(1, this.data.lastPoint.radius));
        this.lastPointRadius     = this.radius * this.lastPointMultiplier;
        this.multiplierWidth     = Math.max(0, Math.min(1, this.data.lastPoint.width))
        this.lastPointWidth      = this.lastPointRadius * this.multiplierWidth;
        this.lastPointColor      = this.data.lastPoint.color;
        // параметри активної точки
        this.activePointMultiplier = Math.max(0, Math.min(1, this.data.activePoint.radius));
        this.activePointRadius     = this.radius * this.activePointMultiplier;
        this.activePointColor      = this.data.activePoint.color;
    };
    
    equals(point){
        return this.x === point.x && this.y === point.y;
    };


    draw(ctx, {lastPoint = false, activePoint = false} = {} ){
        // малюємо point при умові що flaf = false
        if(!this.tools.curve){
            ctx.beginPath();
            ctx.arc(this.x,
                this.y,
                this.radius,
                0,
                Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        // малюємо lastPoint
        if(lastPoint && !this.tools.curve) {
            ctx.beginPath();
            ctx.lineWidth   = this.lastPointWidth;
            ctx.arc(this.x,
                this.y,
                this.lastPointRadius,
                0,
                Math.PI * 2);
            ctx.strokeStyle = this.lastPointColor;
            ctx.stroke();
        };
        // малюємо activePoint
        if(activePoint && !this.tools.curve) {
            ctx.beginPath();
            ctx.arc(this.x,
                this.y,
                this.activePointRadius,
                0,
                Math.PI * 2);
            ctx.fillStyle = this.activePointColor;
            ctx.fill();
        }
    }
}