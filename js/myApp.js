import { GraphEditor } from "./graphEditor.js";

const graphEditor        = document.getElementById('graphEditor');
const nameGraph          = document.querySelector('.editor-bar span')
const arrowBar           = document.querySelector('.arrow-bar');

const buttonSave         = document.getElementById('buttonSave');
const buttonload         = document.getElementById('buttonload');
const buttonInputSave    = document.getElementById('buttonInputSave');
const buttonDispose      = document.getElementById('buttonDispose');

const input         = document.querySelector('.fail .input-wrapper input');
const inputLine     = document.querySelector('.fail .input-wrapper .line');
const iconClose     = document.querySelector('.fail .input-wrapper .icon.close');

const selectElement = document.getElementById('load');

export class App{
    constructor(canvas, toolsMeneger, data) {
        this.canvas = canvas;
        this.toolsMeneger = toolsMeneger
        this.buttonTools  = toolsMeneger.buttonTools;
        this.data    = data;

        this.graphEditor     = graphEditor;

        this.buttonSave      = buttonSave;
        this.buttonload      = buttonload;
        this.buttonInputSave = buttonInputSave;
        this.buttonDispose   = buttonDispose;
        
        this.input     = input;
        this.inputLine = inputLine;
        this.iconClose = iconClose;
        this.maxLength = input.getAttribute('maxlength');   // параметр максимальної довжини вводу тексту
        
        this.selectElement = selectElement;
        
        this.saveName  = '';
        this.saveNames =  Object.keys(localStorage);         // отримуємо всі ключі з localStorage і поміщаємо їх в окремий масив;

        this.appState = {
            saveButton:  false,
            loadButton:  false,
            dispose:     false,
            save:        false,
            toolsBar:    false,
            graphEditor: false,
        };

        this.initialize();
        this.graphEditor =  this.initializeGraphEditor();
    };

    
    initialize() {
        this.initializeCanvas();
        this.initializeDOMElements();
        this.setupEventListeners();
    };
    initializeGraphEditor(saveName) {
        const graphString = localStorage.getItem(saveName);
        const saveInfo = graphString ? JSON.parse(graphString) : null;
        return new GraphEditor(this.canvas, saveInfo,  this.toolsMeneger, this.data);
    }

    initializeCanvas(){};
    initializeDOMElements(){};
    setupEventListeners() {
        this.graphEditor.addEventListener    ('click',   ()  => this.#getToolsBar())

        this.buttonSave.addEventListener     ('click',   ()  => this.#save())
        this.buttonload.addEventListener     ('click',   ()  => this.#load());
        this.buttonInputSave.addEventListener('click',   ()  => this.#newSave());
        this.buttonDispose.addEventListener  ('click',   ()  => this.#disponce());
        
        this.input.addEventListener          ('keydown', (e) => this.#saveInputKeydown(e));
        this.input.addEventListener          ('click',   ()  => this.#inputLine());
        this.iconClose.addEventListener      ('click',   ()  => this.#clearInput());

        this.selectElement.addEventListener  ('change',  (e) =>this.#selectingSaveFile(e))
        // Додайте інші обробники подій за потреби
    };
    // функція появи панелі інструментів
    #getToolsBar(){
        this.appState.graphEditor = !this.appState.graphEditor
        if (this.appState.graphEditor) {
            nameGraph.style.animation = 'slideRight 2s ease forwards';
            nameGraph.innerHTML = 'Graph Editor';
        }else{
            nameGraph.style.animation = 'slideLeft 2s ease forwards';
            // nameGraph.innerHTML = 'nameEditor';
           
        }    
        graphEditor.classList.toggle('active');
        arrowBar.classList.toggle('inactive');
        this.buttonTools.forEach(button => button.classList.toggle('inactive'));
    }
    // функція збереження поточного graph
    #save() {
        if(this.appState.dispose){
                this.appState.save = true;
                this.buttonSave.innerHTML = "<i class='bx bx-save'></i>" ;
        }
        if (this.saveNames.includes(this.saveName) && this.saveName !== '') {
                localStorage.setItem(this.saveName, JSON.stringify(this.graphEditor.graph));
                this.appState.dispose = false;
        }else if(this.saveName === ''){
                this.buttonInputSave.innerHTML = "<i class='bx bx-bookmark-alt bx-tada'></i>";
        }
    };
    // фукція загрузки graph
    #load() {
        this.appState.loadButton = !this.appState.loadButton;
        if (this.appState.loadButton && this.saveNames.length !== 0) {
            this.getListDownloads();
            this.selectElement.style.display   = 'block';
            this.selectElement.style.animation = 'slideRight 2s ease forwards';
            this.buttonload.innerHTML          = "<i class='bx bx-folder-open'></i>";
        } else {
            setTimeout(() =>   this.selectElement.style.display = 'none', 1000);
            this.selectElement.style.animation = 'slideLeft 2s ease forwards';
            this.buttonload.innerHTML          = "<i class='bx bx-folder'></i>";
    }
    };
    // фукція збереження нового graph при натисканні на кнопку
    #newSave() {
        this.appState.saveButton = !this.appState.saveButton;
        if (this.appState.saveButton) {
            this.input.style.display       = 'block';
            this.input.style.animation     = 'slideRight 1s ease forwards';
            this.buttonInputSave.innerHTML = '<i class="bx bx-bookmark-alt-plus"></i>';
        } 
        if (!this.appState.saveButton){
            if (this.input.value.trim() !== '') this.newSave();
       
            this.clear();
            this.input.style.animation = 'slideLeft 1s ease forwards';
            setTimeout(() => this.input.style.display = 'none', 1000);
        }
    };
    // функція очищення graph
    #disponce(){
        if(this.saveName === ''){
            this.buttonInputSave.innerHTML = "<i class='bx bx-bookmark-alt bx-tada'></i>";
        }
        if(this.saveName !== '' && !this.appState.save){
            this.appState.dispose = true
            this.buttonSave.innerHTML = "<i class='bx bx-save bx-burst'></i>";
        }
        if(this.appState.save){
            this.saveName = ''
            this.graphEditor.dispose();
            this.buttonTools.forEach(button => button.classList.remove('active'));        //деактивуємо всі кнопки інструментів
            localStorage.setItem(this.saveName, JSON.stringify(this.graphEditor.graph));
            this.saveNames  = Object.keys(localStorage)
            this.appState.save = false;
        };
    }

    // фукція збереження нового graph при натисканні на Enter
    #saveInputKeydown(e) {
        if (e.key === 'Enter') {
            if (this.input.value.trim() !== '') this.newSave();
          
            this.clear();
            this.input.style.animation     = 'slideLeft 1s ease forwards';
            this.buttonInputSave.innerHTML = '<i class="bx bx-bookmark-alt-plus"></i>';
            this.appState.saveButton       = false;
            setTimeout(() => this.input.style.display = 'none', 1000);
        }
    };
    // умова появи/зникнення лінії під полем для збереження
    #inputLine() {
        if(this.input.value.trim() !== '') {
            this.inputLine.style.transform       = 'scaleX(1)';
            this.inputLine.style.transformOrigin = 'left';
            this.iconClose.style.transform       = 'scale(1)';
            this.limitInputLength()
        } else {
            this.clear()
        }
    };
    // очищаємо поле для введення "input" і зникнення лінії підкреслення при натисканні на іконку закриття
    #clearInput() {
        this.clear();
    };
    // вибір збереженого файлу
    #selectingSaveFile(e){
        // деактивація всіх кнопок при загрузці
        this.buttonTools.forEach(button =>  button.classList.remove('active'));
        // загрузка вибраного saveName
        this.saveName    = e.target.value;
        // Оновлення GraphEditor з новим saveName
        this.graphEditor = this.initializeGraphEditor(this.saveName);
        // блок закриття меню загрузки
        this.selectElement.style.animation = 'slideLeft 2s ease forwards';
        this.buttonload.innerHTML          = "<i class='bx bx-folder'></i>";
        this.appState.loadButton           = false;
    
        setTimeout(() => this.selectElement.style.display = 'none', 1000);
     
    }

    newSave(){
        this.saveName = input.value;
        localStorage.setItem(this.saveName, JSON.stringify(this.graphEditor.graph));
        this.saveNames  = Object.keys(localStorage)
        this.clear();
    };
    // функція очищення поля і зникнення лінії 
    clear(){
        input.value = '';
        iconClose.style.transform           = 'scale(0)';
        inputLine.style.transform           = 'scaleX(0)';
        inputLine.style.transformOrigin     = 'right';
    };
    // функція для обмеження кількості символів у полі "input"
    limitInputLength() {
        const text = this.input.value;
        if (text.length > this.maxLength) {
            this.input.value = text.slice(0, this.maxLength);                          // Обрізаємо текст, якщо він занадто довгий
        }
    };
    // функція створення списку з усіх отриманих ключів saveNames
    getListDownloads() {
        this.selectElement.innerHTML = "";

        let option = document.createElement("option");
        option.text = 'Список загрузки';
        this.selectElement.appendChild(option);

        for (let name in this.saveNames) {
            if (this.saveNames[name] !== '') {
                option = document.createElement("option");
                option.value = this.saveNames[name];
                option.text = this.saveNames[name];
                this.selectElement.appendChild(option);
            }
        }
    };


    draw(ctx){
        this.graphEditor.draw(ctx)
    }
}

