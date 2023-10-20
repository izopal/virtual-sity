
export default class Segment{
    constructor(p1, p2, data){
        this.data = data
        this.p1 = p1;
        this.p2 = p2;
                
        this.width = this.data.width;
        this.color = this.data.color
    };
    

 

    draw(ctx, {dash = [], color = null} = {}){
        ctx.beginPath();
            ctx.lineWidth  = this.width;
            ctx.strokeStyle = color === null ? this.color : color;
            ctx.setLineDash(dash);               //штрихпунтрина лінія
            ctx.moveTo(this.p1.x, this.p1.y);
            ctx.lineTo(this.p2.x, this.p2.y);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}