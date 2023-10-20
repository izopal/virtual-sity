

export default class Point {
    constructor(x, y, data, {flag = false} = {} ){
        this.x    = x;
        this.y    = y;
        this.data = data;
        // параметри точки
        this.size  = this.data.size;
        this.color = this.data.color;
        this.width = this.data.width;
        // параметри останьої точки
        this.lastPointRadius = this.data.lastPoint.radius;
        this.lastPointColor  = this.data.lastPoint.color;
        this.lineWidth       = this.data.lastPoint.width;


        this.flag = flag;
      
        this.radius = !flag ? this.size : this.width;
        this.color =  !flag ? this.color : 'blue';


    };
    
    equals(point){
        return this.x == point.x && this.y == point.y;
    };


    draw(ctx, {outline = false, fill = false} = {} ){
       if(!this.flag){
           ctx.beginPath();
               ctx.fillStyle = this.color;
               ctx.arc(this.x,
                       this.y,
                       this.radius,
                       0,
                       Math.PI * 2);
           ctx.fill();

       }

        if(outline) {
            ctx.beginPath();
                ctx.lineWidth = this.lineWidth;
                ctx.strokeStyle = this.lastPointColor;
                ctx.arc(this.x,
                    this.y,
                    this.radius * this.lastPointRadius,
                    0,
                    Math.PI * 2);
            ctx.stroke();
        };

        if(fill) {
            ctx.beginPath();
                ctx.fillStyle = 'yellow';
                ctx.arc(this.x,
                        this.y,
                        this.radius * .8,
                        0,
                        Math.PI * 2);
            ctx.fill();
        }

    }
}