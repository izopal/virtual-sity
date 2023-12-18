import {Markings}     from './markings.js';

export class Stop extends Markings{
    constructor(parameters){
        super(parameters);
        this.polygon = super.updatePolygon();
        this.border = this.polygon.segments[2];
    };
    draw(ctx){
        this.border.draw(ctx, this.dataConfig);
        // промалбовуємо текст на дорозі
        const options = {
            text:            'all',
            angel:           this.angel - Math.PI * .5,
            fontSize:        this.width * .4,
            verticalOffsetY: this.width * .2,
        }
        super.drawText(ctx, options); 
        
   };
   drawDebug(ctx, debug){
        super.drawDebug(ctx, debug)
   }
}