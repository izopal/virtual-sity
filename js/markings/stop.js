import {Markings}     from './markings.js';

export class Stop extends Markings{
    constructor(parameters){
        super(parameters);
        this.border = this.polygon.segments[2];
    };
    draw(ctx){
        this.border.draw(ctx, this.dataConfig);
        // промалбовуємо текст на дорозі
        const options = {
            text:            'all',
            angel:           this.angel - Math.PI * .5,
            fontSize:        this.height * .7,
            verticalOffsetY: this.height * .1,
        }
        super.drawText(ctx, options); 
        
   };
   drawDebug(ctx){
        super.drawDebug(ctx)
   }
}