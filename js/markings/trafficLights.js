import * as utils     from '../math/utils.js';
import { Segment } from '../primitives/segment.js';
import { Envelope } from '../primitives/envelope.js';
import { Markings }   from './markings.js';

export class TrafficLights extends Markings{
    constructor(parameters){
        super(parameters);
        this.states = 'off';
        
    // Запускаємо інтервал для автоматичної зміни стану кожні 3 секунди
    setInterval(() => {
      this.changeStateAutomatically();
    }, 3000);
    };


    changeStateAutomatically() {
        // Змінюємо стан світлофора автоматично, наприклад, змінюємо між 'green', 'yellow', 'red'
        const states = ['green', 'yellow', 'red'];
        const currentIndex = states.indexOf(this.state);
        const nextIndex = (currentIndex + 1) % states.length;
        this.state = states[nextIndex];
      }

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
                yellow.draw(ctx,  {radius, color: '#FF0'});
                break;
            case 'red':
                red.draw(ctx,  {radius, color: '#F00'});
                break;
        }
      

        
    };
   drawDebug(ctx, debug){
        super.drawDebug(ctx, debug)
   }
}