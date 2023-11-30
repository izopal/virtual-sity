import * as utils     from '../math/utils.js';
import { Segment } from '../primitives/segment.js';
import { Markings }   from './markings.js';

export class TrafficLights extends Markings{
    constructor(parameters){
        super(parameters);
        this.state = 'yellow'
        this.width = this.width * .5;
        this.line = super.updateLine();
    };
    draw(ctx){
      
        const green  = utils.lerp2D(this.line.p1, this.line.p2, .2);
        const yellow = utils.lerp2D(this.line.p1, this.line.p2, .5);
        const red    = utils.lerp2D(this.line.p1, this.line.p2, .8);
        const radius = this.dataConfig.lineWidth * .33;

        new Segment(red, green).draw(ctx, this.dataConfig);

        green.draw(ctx,  {radius, color: '#060'});
        yellow.draw(ctx, {radius, color: '#660'});
        red.draw(ctx,    {radius, color: '#600'});

        switch (this.state){
            case 'green':
                green.draw(ctx,  {radius, color: '#0F0'});
                break;
            case 'yellow':
                yellow.draw(ctx,  {radius, color: '#0F0'});
                break;
            case 'red':
                red.draw(ctx,  {radius, color: '#0F0'});
                break;
        }
      
    };
   drawDebug(ctx){
        super.drawDebug(ctx)
   }
}