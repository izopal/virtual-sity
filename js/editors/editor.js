

const body               = document.body;

export default class Editor{
    constructor(myApp, key){
        this.body         = body;
        this.myApp        = myApp;
        this.canvas       = this.myApp.canvas;
        this.saveInfo     = this.myApp.saveInfo;

        // параметри інструментів графічного редагування  
        this.toolsMeneger          = this.myApp.toolsMeneger;
        this.tools                 = this.toolsMeneger.tools[`${key}`];
        this.editorState           = this.toolsMeneger.editorState; 

        this.data           = this.myApp.data;
        this.config         = this.data.editor;

        this.configPolygon  = this.data.primitives.polygon 
        
        this.minDicnance   = this.config.minDistance;
        this.sizeRemove    = this.config.sizeRemove;
      
        this.point = null;

        this.minDicnance   = this.config.minDistance;
        this.sizeRemove    = this.config.sizeRemove;

        // підключаємо необхідні нам класи
        this.vieport       = this.myApp.vieport;
        this.graph         = this.myApp.graph;
    };


    inputMouseMove(e){
        this.point       = this.vieport.getPoint(e, {subtractDragOffset: true});
    };
  
    removeEventListeners(){
        this.body.removeEventListener  ('keydown',    this.boudKeydown);
        this.canvas.removeEventListener('contextmenu', this.boundContextMenu)
    };
    addEventListeners(){
        this.boudKeydown      = this.#inputKeydown.bind(this);
        this.boundContextMenu = (e) => e.preventDefault();
        
        this.body.addEventListener  ('keydown',    this.boudKeydown);
        this.canvas.addEventListener('contextmenu', this.boundContextMenu);
    };
    #inputKeydown(e){
        if(['D', 'd', 'В', 'в'].includes(e.key)) this.data.debug.state = !this.data.debug.state;
        if(['=', '+'].includes(e.key)) zoom('plus');
        if(['-', '_'].includes(e.key)) zoom('minus');
        if(e.key === 'Escape') this.lastPoint = null;
    };
    
    dispose(){
        this.graph.removeAll();
    }
}