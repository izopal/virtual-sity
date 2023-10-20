import Point  from './js/primitives/point.js';
import Segment  from './js/primitives/segment.js';


const data =      { game:     { },


// =============================================================================================>
                    primitives: { point:  { name:        'point',
                                            class:       Point,
                                            size:        10,
                                            minDicnance: 10,
                                            width:         2,
                                            color:       'red',
                                            lastPoint: { name: 'lastPoint',
                                                         width: 2,
                                                         radius: .6,
                                                         color: 'yellow'},
                                            },
                                            
                                 segment: { name: 'segment',
                                            class: Segment,
                                            width:  2,
                                            color: 'red',
                                            dash:  {length:   3,
                                                    interval: 3,
                                                    color: 'green'}
                                            },
                                },
                    };
export default data;

