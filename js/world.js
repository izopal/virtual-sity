import {data}      from './constants.js';
import {Envelope}  from './primitives/envelope.js';
import {Polygon}   from './primitives/polygon.js';

export class World{
    constructor(graph){
        this.graph          = graph;
       
        this.config         = data.world || {};
        this.configRoad     = this.config.road;
        this.configBuilding = this.config.building;

        this.configPolygon  = data.primitives.polygon 
        
        this.polygons       = [];
        this.roads          = [];
        this.cities         = [];
        this.roadBorders    = [];
        this.cityBorders    = [];
        this.buildings      = [];
        
        this.generate()
    };
    
    generate(){
        this.generateRoad();
        this.generateCity();
    }

    generateCity(){
        const citySegments = this.graph.sortedSegments.city || [];
        this.cities        = citySegments.map(segment => new Envelope(segment, this.config.road));
        this.cityBorders   = Polygon.union(this.cities.map(road => road.segmentRoad));

        this.buildings = this.#generateBuilding();
    };

    generateRoad(){
        const roadSegments = this.graph.sortedSegments.road || [];
        this.roads         = roadSegments.map(segment => new Envelope(segment, this.config.road));
        this.roadBorders   = Polygon.union(this.roads.map(road => road.segmentRoad));
    };

    #generateBuilding(){
        const citySegments = this.graph.sortedSegments.city || [];
        const tmpEnvelopes = [];
        const config = {
            width:   this.configRoad.width + this.configBuilding.width + this.configBuilding.spacing * 2,
            current: this.configRoad.current,
        };
        for(const segment of citySegments){
            tmpEnvelopes.push(new Envelope(segment, config))
        };
       
        const guides = Polygon.union(tmpEnvelopes.map(e => e.segmentRoad));
        for(let i = 0; i < guides.length; ++i){
            const seg = guides[i];
            if(seg.length() < this.configBuilding.minLenght){
                guides.splice(i, 1);
                --i;
            }
        }
        return guides
    }
    
    removeRoad(point){
        if(point.tools.road){
            this.graph.sortedPoints.road   = this.graph.sortedPoints.road.filter(p => !p.equals(point));
            this.graph.sortedSegments.road = this.graph.sortedSegments.road.filter(segment => !segment.p1.equals(point) && !segment.p2.equals(point));
        }
    };

    removeCity(point){
        if(point.tools.city){
            this.graph.sortedPoints.city   = this.graph.sortedPoints.city.filter(p => !p.equals(point));
            this.graph.sortedSegments.city = this.graph.sortedSegments.city.filter(segment => !segment.p1.equals(point) && !segment.p2.equals(point))
        }
    }


    
    removeAll(){
        for(const key in  this.graph.sortedSegments){this.graph.sortedSegments[key] = []};
        for(const key in  this.graph.sortedPoints)  {this.graph.sortedPoints[key] = []};
    }

    draw(ctx){
        const polygonPoints   = this.graph.sortedPoints.polygon || [];

        const roadPoints      = this.graph.sortedPoints.road    || [];
        const roadSegments    = this.graph.sortedSegments.road  || [];

        const cityPoints      = this.graph.sortedPoints.city    || [];
        const citySegments    = this.graph.sortedSegments.city  || [];
        
        // console.log(roadSegments)


        new Polygon(polygonPoints).draw(ctx)
        for(const point    of polygonPoints )    {point.draw(ctx,   this.configPolygon)};

        for(const road     of this.roads)        {road.draw(ctx,    this.configRoad)};
        for(const border   of this.roadBorders)  {border.draw(ctx,  this.configRoad.border)}; 
        for(const segment  of roadSegments)      {segment.draw(ctx, this.configRoad.marking)};
        for(const point    of roadPoints )       {point.draw(ctx,   this.configRoad.point)};
        

        for(const road     of this.cities)       {road.draw(ctx,    this.configRoad)};
        for(const border   of this.cityBorders)  {border.draw(ctx,  this.configRoad.border)}; 
        for(const segment  of citySegments)      {segment.draw(ctx, this.configRoad.marking)};
        for(const point    of cityPoints )       {point.draw(ctx,   this.configRoad.point)};

        for(const building of this.buildings )    {building.draw(ctx)};

    };

}