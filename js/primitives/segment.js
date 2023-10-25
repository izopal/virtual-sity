export default class Segment{
    constructor(p1, p2, data, tool = {}){
        this.data = data;
        this.p1 = p1;
        this.p2 = p2;
                
        this.width = this.data.line.width;
        this.color = this.data.line.color;

        // параметри штрих-пунтирної лінії
        this.dashWidth    = this.data.dash.width;
        this.dashColor    = this.data.dash.color;
        this.dashLength   = this.data.dash.length;
        this.dashInterval = this.data.dash.interval;

        // параметри інструментів графічного редактора
        this.tool  = tool;
        // параметри при вкл. крива лінія
        if(this.tool.curve){
            this.width = this.data.paint.width;
            this.color = this.data.paint.color
        };
    };
    
    draw(ctx, {dash = false} = {}){
        ctx.beginPath();
            ctx.lineWidth   = !dash ? this.width : this.dashWidth;
            if(dash) ctx.setLineDash([this.dashLength, this.dashInterval]);           //штрихпунтрина лінія
            ctx.strokeStyle = !dash ? this.color : this.dashColor;
            ctx.moveTo(this.p1.x, this.p1.y);
            ctx.lineTo(this.p2.x, this.p2.y);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.beginPath();
        ctx.arc(this.p2.x,
                this.p2.y,
                this.width * .5,
                0,
                Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}