import Point  from './primitives/point.js';
import Segment  from './primitives/segment.js';
import Vieport from './vieport.js';


// const vieportInstance = new Vieport()

const data =      { game:     { },


// =============================================================================================>
                vieport:       {name:                   'vieport',
                                class:                  Vieport,
                                scale: {zoom:           1,
                                        min:            0.1,
                                        max:            10,
                                        step:           0.05},    
                },
                primitives:    {point: {name:           'point',
                                        class:          Point,
                                        point:          {width: 2,
                                                         radius: 10,
                                                         color: 'blue'},
                                        activePoint:    {width: 2,
                                                         radius: 8,
                                                         color: 'yellow'},
                                        lastPoint:      {width: 2,
                                                         radius: 6,
                                                         color: 'yellow'}
                                },
                                            
                                segment: {name:         'segment',
                                          class:        Segment,
                                          line:         {width: 4,
                                                         color: 'red'},
                                          paint:        {width: 2,
                                                         color: 'yellow'},
                                          dash:         {width:  1,
                                                         color:  'green',
                                                         length:  4,
                                                         interval: 2}
                                },
                },
};
export default data;

