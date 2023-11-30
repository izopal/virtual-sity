import {Markings}     from './markings.js';

export class Parking extends Markings{
    constructor(parameters){
        super(parameters);
        this.borders = [this.polygon.segments[2], this.polygon.segments[0]];
    };

    draw(ctx){
        this.borders.forEach(border => border.draw(ctx, this.dataConfig));
        
        // промалбовуємо текст на дорозі
        const options = {
            text:            'firstLetter',
            angel:           this.angel,
            fontSize:        this.height * .8,
            verticalOffsetY: this.dataConfig.scale.max,
        };
        super.drawText(ctx, options);
   };

   drawDebug(ctx){
        super.drawDebug(ctx)
   }
}