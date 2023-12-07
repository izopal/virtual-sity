import { Osm } from './math/osm.js';
import * as utils  from './math/utils.js';
const parameters =   {  editor:   {name:                   'remove',
                                        class:                  'GraphEditor',
                                        minDistance:            10,
                                        sizeRemove:             30,
                                },     
                        debug:          {state:         false,
                                        color:          'red',
                                        fill:           'red',
                                        colorStroke:    'red',
                                        lineWidth:       2,
                                        globalAlpha:     .4
                        },
                        vieport:       {name:                   'vieport',
                                        class:                  'Vieport',
                                        angle:                 null,
                                        scale: {zoom:           1,
                                                minZoom:        0.25,
                                                maxZoom:        4,
                                                step:           .25},    
                        },
                        world:         {key:            'city',
                                        class:          'World',
                                        road:           {key:           'road',
                                                        current:        20,
                                                        width:          100,
                                                        lineWidth:      15,
                                                        lineCap:        'round',
                                                        fill:           '#BBB',
                                                        colorStroke:    '#BBB',
                                                        globalAlpha:    1,
                                                        border:         {size:         2,
                                                                        lineCap:        'round',
                                                                        color:        'white',
                                                                        globalAlpha:  1},
                                                        dash:           {globalAlpha:  .8,
                                                                        dash:{
                                                                                size:     1,
                                                                                length:   15,
                                                                                interval: 10,
                                                                                color:    'white',
                                                                        }},
                                                        point:          {radius:        5,
                                                                        color:        'white', 
                                                                        globalAlpha:   .3},
                                        },
                                        building:       {key:           'building',
                                                        class:          'Building',
                                                        width:          125,
                                                        coefficient:    .15,   //коефіцієнт висоти 

                                                        minLenght:      125,
                                                        spacing:        125,

                                                        ceiling:{
                                                                fill:           'rgba(84,44,29,1)',
                                                                colorStroke:    '',
                                                                lineWidth:       NaN,
                                                                globalAlpha:     .8,
                                                        },
                                                        side:{
                                                                fill:           'red',
                                                                colorStroke:    'red',
                                                                lineWidth:       2,
                                                                globalAlpha:     .4,
                                                        },
                                                        fill:           'yellow',
                                                        colorStroke:    'red',
                                                        lineWidth:       2,
                                                        globalAlpha:     .4,
                                        },
                                        tree:           {key:           'tree',
                                                        class:          'Tree',
                                                        count:          100,
                                                        radius:         {
                                                                max: 80,
                                                                min: 5
                                                        },
                                                        forestDensity:  40,
                                                        coefficient:    .25,
                                                        levelCount:     7,
                                                        typOfTree:      36,

                                                        size:           60,
                                                        spacing:        30,
                                                        numberRows:     2,
                                                        color:          'green',
                                                        globalAlpha:    1,
                                        },
                        },
                        openStreetMap: {name:   'osm',
                                        point:  {radius:       6,
                                                color:         'red',
                                                globalAlpha:   1},
                                        line:   {size:          4,
                                                color:          'blue',
                                                lineCap:        'round',
                                                globalAlpha:    1},

                        },
                        markings:       {stop:          {key:           'stop',
                                                        current:        0,
                                                        width:          NaN,
                                                        height:         NaN,
                                                        dw:             1,
                                                        dh:             .3,
                                                        lineWidth:      4,
                                                        scale: {
                                                                max:            2,
                                                                min:            1,
                                                        },
                                                        color:          'white',
                                                        fill:           '',
                                                        fillStyle:      'white',
                                                        colorStroke:    '',
                                                        globalAlpha:    .8,
                                        },
                                        start:          {key:           'start',
                                                        current:        0,
                                                        img:    {
                                                                autoWidth:  25,
                                                                autoHeight: 47,
                                                        },
                                                        width:          NaN,
                                                        height:         80,
                                                        dw:             1,
                                                        dh:             1,
                                                        lineWidth:      4,
                                                        scale: {
                                                                max:            2,
                                                                min:            1,
                                                        },
                                                        color:          'white',
                                                        fill:           '',
                                                        fillStyle:      'white',
                                                        colorStroke:    '',
                                                        globalAlpha:    .8,
                                        },
                                        parking:        {key:           'parking',
                                                        current:        0,
                                                        width:          NaN,
                                                        height:         NaN,
                                                        dw:             1,
                                                        dh:             1,
                                                        lineWidth:      4,
                                                        scale: {
                                                                max:            2,
                                                                min:            1,
                                                        },
                                                        color:          'white',
                                                        fill:           '',
                                                        fillStyle:      'white',
                                                        colorStroke:    '',
                                                        globalAlpha:    .8,
                                        },
                                        pedestrian:    {key:           'pedestrian',
                                                        current:        0,
                                                        width:          NaN,
                                                        height:         NaN,
                                                        dw:             1,
                                                        dh:             1,
                                                        lineWidth:      60,
                                                        scale: {
                                                                max:            NaN,
                                                                min:            NaN,
                                                        },
                                                        color:          'white',
                                                        fill:           'red',
                                                        fillStyle:      'white',
                                                        colorStroke:    'red',
                                                        globalAlpha:    .6,
                                                        dash:{  size:           NaN,
                                                                length:         11,
                                                                interval:       11,
                                                                color:          '',
                                                        },
                                        },
                                        trafficLights:  {key:           'trafficLights',
                                                        current:        0,
                                                        width:          NaN,
                                                        height:         NaN,
                                                        dw:             .5,
                                                        dh:             1,
                                                        lineWidth:      10,
                                                        lineCap:        'round',
                                                        color:          '',
                                                        fill:           'black',
                                                        fillStyle:      '',
                                                        colorStroke:    'black',
                                                        globalAlpha:    .8,
                                                      
                                        },

                        },
                        primitives:    {point: {key:            'point',
                                                class:          'Point',
                                                point:          {radius:        10,
                                                                 color:         'blue',
                                                                 globalAlpha:   1},
                                                activePoint:    {radius:        6,
                                                                 color:         'red',
                                                                 globalAlpha:   1},
                                                lastPoint:      {radius:        NaN,
                                                                 color:         'blue',
                                                                 lineWidth:     4,
                                                                 colorStroke:   'yellow',
                                                                 globalAlpha:   1}
                                        },
                                        segment:{key:          'segment',
                                                 class:        'Segment',
                                                 line:         {size:           4,
                                                                color:          'red',
                                                                globalAlpha:    1},
                                                 curve:        {size:           6,
                                                                lineCap:        'round',
                                                                color:          'yellow',
                                                                globalAlpha:    1},
                                                 dash:         {globalAlpha:    1,
                                                                dash:{  size:           2,
                                                                        length:         4,
                                                                        interval:       2,
                                                                        color:          'green',
                                                                }}
                                        },
                                        polygon:{key:           'polygon',
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



const scale = Math.min((screenWidth / 1280), (screenHeight / 800)) * .75;
console.log(scale)

// Параметри які будуть змінюватися взалежності від розмірів екрану
const options = {
        radius:         NaN,
        width:          NaN,
        height:         NaN,
        size:           NaN,

        max:            NaN,
        min:            NaN,

        lineWidth:      NaN,
        length:         NaN,
        interval:       NaN,
   
        minLenght:      NaN,
        spacing:        NaN, 

        coefficient:    NaN,
};

export const data = utils.multiplyKeys(parameters, scale, options)
console.log(data)