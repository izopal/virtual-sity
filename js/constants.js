
import * as utils  from './math/utils.js';
const parameters =   {  graphEditor:   {name:                   'graphEditor',
                                        class:                  'GraphEditor',
                                        minDistance:            10,
                                        sizeRemove:             30,
                        },     
                        vieport:       {name:                   'vieport',
                                        class:                  'Vieport',
                                        scale: {zoom:           1,
                                                min:            0.1,
                                                max:            10,
                                                step:           0.05},    
                        },
                        world:         {name:           'world',
                                        class:          'World',
                                        road:           {current:       20,
                                                        width:          50,
                                                        lineWidth:      15,
                                                        fill:           '#BBB',
                                                        colorStroke:    '#BBB',
                                                        globalAlpha:    1,
                                                        border:         {size:         2,
                                                                        color:        'white',
                                                                        globalAlpha:  1},
                                                        marking:        {size:         1,
                                                                        color:        'white',
                                                                        globalAlpha:  .8,
                                                                        dash:{
                                                                                length:   15,
                                                                                interval: 10
                                                                        }},
                                                        point:          {radius:        5,
                                                                        color:        'white', 
                                                                        globalAlpha:   .3},
                                        },
                                        building:       {width:         150,
                                                        minLenght:      150,
                                                        spacing:        50,
                                                        fill:           'yellow',
                                                        colorStroke:    'red',
                                                        lineWidth:       6,
                                                        globalAlpha:     .4,
                                        },
                                        tree:           {count:         10,
                                                        radius:         40,
                                                        color:          'green',
                                                        globalAlpha:    1,

                                        },
                        },

                        primitives:    {point: {name:           'point',
                                                class:          'Point',
                                                point:          {radius: 10,
                                                                 color: 'blue',
                                                                 globalAlpha: 1},
                                                activePoint:    {radius: 8,
                                                                 color: 'yellow',
                                                                 globalAlpha: 1},
                                                lastPoint:      {width: 2,
                                                                 radius: 7,
                                                                 color: 'yellow',
                                                                 globalAlpha: 1}
                                        },
                                        segment:{name:         'segment',
                                                 class:        'Segment',
                                                 line:         {size:           4,
                                                                color:          'red',
                                                                globalAlpha:    1},
                                                 curve:        {size:           2,
                                                                color:          'yellow',
                                                                globalAlpha:    1},
                                                 dash:         {size:           1,
                                                                color:          'green',
                                                                globalAlpha:    1,
                                                                dash:{
                                                                        length:         4,
                                                                        interval:       2,
                                                                }}
                                        },
                                        polygon:{name:         'polygon',
                                                 class:         'Polygon',
                                                 point:{
                                                         radius:        5,
                                                         color:         'red',
                                                         globalAlpha:   .8,
                                                 },
                                                 segment: {
                                                         lineWidth:     2,
                                                         fill:          'red',
                                                         colorStroke:   'yellow',
                                                         globalAlpha:   .4,
                                                 }
                                        },
                                        envelope:{name:          'envelope',
                                                  class:         'Envelope', 
                                                  colorFill:     '',
                                                  colorStroke:   '',
                                        },
                                
                        },
};
 

// Параметр масштабування розмірів взалежності від розмірів екрану
const screenWidth = window.screen.width; // ширина екрану
const screenHeight = window.screen.height; // висота екрану
console.log(`Розміри екрану: ${screenWidth} x ${screenHeight}`);

const windowWidth = document.documentElement.clientWidth;
const windowHeight = document.documentElement.clientHeight;
console.log(`Розміри вікна браузера: ${windowWidth} x ${windowHeight}`);

const devicePixelRatio = window.devicePixelRatio
console.log(`розмір пікселів: ${devicePixelRatio}`)



const scale = Math.min((screenWidth / 1280), (screenHeight / 800)) * .5;
console.log(scale)

// Параметри які будуть змінюватися взалежності від розмірів екрану
const options = {
        radius:         NaN,
        width:          NaN,
        size:           NaN,

        lineWidth:      NaN,
        length:         NaN,
        interval:       NaN,
   
        minLenght:      NaN,
        spacing:        NaN, 
};

export const data = utils.multiplyKeys(parameters, scale, options)
console.log(data)