const data =  { graphEditor:   {name:                   'graphEditor',
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
                world:         {name:                   'world',
                                class:                  'World',
                },
                primitives:    {point: {name:           'point',
                                        class:          'Point',
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
                                segment:{name:         'segment',
                                         class:        'Segment',
                                         line:         {width: 4,
                                                        color: 'red'},
                                         paint:        {width: 2,
                                                        color: 'yellow'},
                                         dash:         {width:  1,
                                                        color:  'green',
                                                        length:  4,
                                                        interval: 2}
                                },
                                polygon:{name:         'polygon',
                                        class:         'Polygon', 
                                        width:         2,
                                        colorFill:     'rgba(0, 0, 255, .3)',
                                        colorStroke:   'blue'
                                },
                                envelope:{name:          'envelope',
                                         class:         'Envelope', 
                                         width:         50,
                                         current:       20,
                                         colorFill:     'green',
                                         colorStroke:   'yellow',
                                },
                },
};
export default data;

