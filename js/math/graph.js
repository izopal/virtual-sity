


export default class Graph{
    constructor(points   = [], segments = []){
        this.points      = points;
        this.segments    = segments;
    };

    addPoint(point){
        this.points.push(point)
    };
    removePoint(point){
        const index = this.points.indexOf(point)  
        this.points.splice(index, 1)
    }
    
    // Блок додавання-видалення сигменів 
    addSegment(line){
        this.segments.push(line)
        // console.log(this.segments)
    };
    removeSegment(point) {
        const index = this.segments.findIndex(segment => segment.p1.equals(point));
        console.log(index)
        this.segments.splice(index, 1);
       
    }


    draw(ctx){
        for(const point of this.points){
            point.draw(ctx);
        };
        
        for(const seg of this.segments){
            seg.draw(ctx);
        };
        
        

    }
}