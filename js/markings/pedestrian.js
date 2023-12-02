import {Markings}     from './markings.js';

export class Pedestrian extends Markings{
    constructor(parameters){
        super(parameters);
    };
    draw(ctx){
        this.line.draw(ctx, this.dataConfig)
   };
   drawDebug(ctx){
        super.drawDebug(ctx)
   };
}