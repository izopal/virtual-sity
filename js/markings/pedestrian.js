import {Markings}     from './markings.js';


export class Pedestrian extends Markings{
    constructor(parameters){
        super(parameters);
        this.line = super.updateLine();
    };
    draw(ctx){
        this.line.draw(ctx, this.dataConfig)
   };
   drawDebug(ctx){
        this.polygon.draw(ctx, this.configDebug);
   }
}