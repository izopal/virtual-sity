const buttonTools        = document.querySelectorAll(`.button[data-tool]`);

export class ToolsMeneger{
    constructor(){
        this.buttonTools = buttonTools;
        
        this.tools = {
            dragging: false,        // параметри вкл.-викл. редактора (пересування точок)
            remove:   false,        // параметр вкл.-викл резинки
            curve:    false,        // парамет малювання кривої лінії
            point:    false,        // параметр малювання точки;
            polygon:  false,        // параметр малювання полігону;
            road:     false,        // параметр малювання дороги;
            tree:     false,        // параметр малювання дерев;
            building: false,        // параметр малювання будинків;
            city:     false,        // параметр малювання міста;
        };
        this.initialize();
    };
    initialize(){
        this.buttonTools.forEach((button) => {
            button.addEventListener('click', () => this.setTool(button));
        });
    }
    // Блок керування кнопками 
    setTool(button) {
        const buttonActive = button.getAttribute('data-tool');
        this.#setTool(buttonActive);
        this.#updateButtonStyles();
    };

    // зміна значення кнопок на true/false приактивації деактивації  
    #setTool(toolActive) {
        for (const tool in this.tools) {
            this.tools[tool] = tool === toolActive ? !this.tools[tool] : false
        };
    } 
    // зміна стилю кнопок приактивації деактивації    
    #updateButtonStyles () {
        this.buttonTools.forEach((button) => {
            const tool = button.getAttribute('data-tool');
            const toolIsTrue = this.tools[tool];
            toolIsTrue ? button.classList.add('active') : button.classList.remove('active');
        });
    }
}





export function dispose(){
    for (const key in this.tools) this.tools[key] = false;
}
