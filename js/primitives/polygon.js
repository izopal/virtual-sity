export default class Polygon {
    constructor(data, points, tools ={}){
        this.data        = data;

        this.width       = this.data.width;
        this.colorFill   = this.data.colorFill;
        this.colorStroke = this.data.colorStroke; 
        
        this.points = points;

        this.tools = tools;
    };
    draw(ctx){
        ctx.beginPath();
            ctx.fillStyle   = this.colorFill;
            ctx.strokeStyle = this.colorStroke;
            ctx.lineWidth   = this.width;
            // малюємо лінію
            if (this.points.length > 0){

                ctx.moveTo(this.points[0].x, this.points[0].y);
                for(let i = 0; i < this.points.length; ++i){
                    ctx.lineTo(this.points[i].x, this.points[i].y);
                }
            }
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

    }
}