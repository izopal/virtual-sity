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
    };
    removeSegment(point) {
        const allSegmetStart = this.segments.filter(segment => segment.p1.equals(point));  //знаходимо всі сегменти початок яких дорівнює точці point
        const allSegmetEnd   = this.segments.filter(segment => segment.p2.equals(point));  //знаходимо всі сегменти кінець яких відповідає точці point
        const allSegmet      = [...allSegmetStart, ...allSegmetEnd];                       //обєднюємо отримані масиви
        allSegmet.forEach(segment => {
            const index = this.segments.indexOf(segment);                                  //знаходимо індекс в масиві всіх сегменітів
            this.segments.splice(index, 1)                                                 // видаляємо даний сегмент з масиву сегментів
        })
        allSegmet.splice(0, allSegmet.length);                                             //видаляємо всі елементи з обєднаного масиву
    }


    draw(ctx){
        for(const seg of this.segments){
            seg.draw(ctx);
        };
        for(const point of this.points){
            point.draw(ctx);
        };
    };
    removeAll(){
        this.points = [];
        this.segments = [];
    }
}