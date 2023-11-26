const body               = document.body;

export default class Editor{
    constructor(myApp, key){
        this.body         = body;
        this.myApp        = myApp;
        this.canvas       = this.myApp.canvas;
        this.saveInfo     = this.myApp.saveInfo;

        // підключаємо необхідні нам класи
        this.vieport       = this.myApp.vieport;

        // параметри інструментів графічного редагування  
        this.toolsMeneger          = this.myApp.toolsMeneger;
        this.tools                 = this.toolsMeneger.tools[`${key}`];
        this.editorState           = this.toolsMeneger.editorState; 

        this.data           = this.myApp.data;
        this.config         = this.data.editor;
        
        this.minDicnance   = this.config.minDistance;
        this.sizeRemove    = this.config.sizeRemove;
      
        this.point = null;

        this.minDicnance   = this.config.minDistance;
        this.sizeRemove    = this.config.sizeRemove;

        this.graph         = this.myApp.graph;
        this.OldGraphHash  = this.graph.hash();    //параметри запуска малювання 
    };

  

    inputMouseMove(e){
        this.point       = this.vieport.getPoint(e, {subtractDragOffset: true});
    };
    draw(ctx){
        this.graph.draw(ctx);
    }
    
    dispose(){
        this.graph.removeAll();
    }

}