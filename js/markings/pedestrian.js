import {Markings}     from './markings.js';

export class Pedestrian extends Markings{
    constructor(parameters){
        super(parameters);
        this.numberIntervals = this.dataConfig.numberIntervals
        this. options = {
            lineWidth:  this.roadWidth * this.dh,
            color:      'white',
            fillStyle:  'white',
            dash:   {
                length:     this.roadWidth / this.numberIntervals,
                interval:   this.roadWidth / this.numberIntervals,
                color:      '',
            },
        };
    };
    draw(ctx){
        this.line.draw(ctx, this.options)
   };
  
   drawDebug(ctx, debug){
        super.drawDebug(ctx, debug)
   };
}