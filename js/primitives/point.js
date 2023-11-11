export class Point {
    constructor(coordinates = { x: 0, y: 0 }, tools = {}) {
        this.x    = coordinates.x;
        this.y    = coordinates.y;

        // параметри інструментів
        this.tools = tools;
    }

    equals(point) {
        return this.x === point.x && this.y === point.y;
    };

    draw(ctx, options = {}) {
        const { 
            color       = '',
            radius      = NaN,
            globalAlpha = NaN,
            lineWidth   = NaN,
            colorStroke = '',
        } = options

        if (!this.tools.curve){
            ctx.save();
            ctx.globalAlpha = globalAlpha;
            ctx.beginPath();
                ctx.arc(this.x, 
                        this.y, 
                        radius, 
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