export default class Point {
    constructor(x, y, data, tools = {}){
        this.x    = x;
        this.y    = y;
        this.data = data;
        // параметри точки
        this.width   = this.data.point.width;
        this.radius  = this.data.point.radius;
        this.color   = this.data.point.color;
        // параметри останьої точки
        this.lastPointWidth  = this.data.lastPoint.width;
        this.lastPointRadius = this.data.lastPoint.radius;
        this.lastPointColor  = this.data.lastPoint.color;
        // параметри активної точки
        this.activePointWidth  = this.data.activePoint.width;
        this.activePointRadius = this.data.activePoint.radius;
        this.activePointColor  = this.data.activePoint.color;

        // параметри інструментів
        this.tools  = tools;
        this.radius = !this.tools.curve ? this.radius : 0;
    };
    
    equals(point){
        return this.x === point.x && this.y === point.y;
    };


    draw(ctx, {lastPoint = false, activePoint = false} = {} ){
        // малюємо point при умові що flaf = false
        ctx.beginPath();
        ctx.arc(this.x,
            this.y,
            this.radius,
            0,
            Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

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