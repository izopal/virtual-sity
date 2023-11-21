import { GraphEditor } from "./editors/graphEditor.js";
import { StopEditor } from "./editors/stopEditor.js";
import { timeAnimate } from './animateList.js';

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
        this.toolsMeneger       = toolsMeneger;
       

        this.data    = data;

       
        // Парамтри часу для анімації
        this.timeAnimate = timeAnimate
            

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
        };

        
        this.stopEditor  = this.initializeStopEditor();
        this.graphEditor = this.initializeGraphEditor();
        this.initialize();
    };
    
    initializeStopEditor(saveName) {
        const graphString = localStorage.getItem(saveName);
        const saveInfo = graphString ? JSON.parse(graphString) : null;
        return new StopEditor(this.canvas, saveInfo,  this.toolsMeneger, this.data);
    };
    initializeGraphEditor(saveName) {
        const graphString = localStorage.getItem(saveName);
        const saveInfo = graphString ? JSON.parse(graphString) : null;
        return new GraphEditor(this.canvas, saveInfo,  this.toolsMeneger, this.data);
    };
    initialize() {
        this.removeEventListeners() 
        this.addEventListeners();
    };
    removeEventListeners() {
        this.buttonSave.removeEventListener     ('click',   this.boundSave)
        this.buttonload.removeEventListener     ('click',   this.boundLoad);
        this.buttonInputSave.removeEventListener('click',   this.boundNewSave);
        this.buttonDispose.removeEventListener  ('click',   this.boudDisponse);
        
        this.input.removeEventListener          ('keydown', this.boudSaveInput);
        this.input.removeEventListener          ('click',   this.boundInputLine);
        this.iconClose.removeEventListener      ('click',   this.boundClear);

        this.selectElement.removeEventListener  ('change',  this.boundSelecting);
    };
    addEventListeners() {
        this.boundSave      = ()  => this.#save();
        this.boundLoad      = ()  => this.#load();
        this.boundNewSave   = ()  => this.#newSave();
        this.boudDisponse   = ()  => this.#disponce();
        this.boudSaveInput  = (e) => this.#saveInputKeydown(e);
        this.boundInputLine = ()  => this.#inputLine();
        this.boundClear     = ()  => this.#clearInput();
        this.boundSelecting = (e) => this.#selectingSaveFile(e);

        this.buttonSave.addEventListener     ('click',   this.boundSave)
        this.buttonload.addEventListener     ('click',   this.boundLoad);
        this.buttonInputSave.addEventListener('click',   this.boundNewSave);
        this.buttonDispose.addEventListener  ('click',   this.boudDisponse);
        
        this.input.addEventListener          ('keydown', this.boudSaveInput);
        this.input.addEventListener          ('click',   this.boundInputLine);
        this.iconClose.addEventListener      ('click',   this.boundClear);

        this.selectElement.addEventListener  ('change',  this.boundSelecting);
    };
   
 
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
            this.selectElement.style.animation = `slideRight ${this.timeAnimate.failBar}s ease forwards`;
            this.buttonload.innerHTML          = "<i class='bx bx-folder-open'></i>";
        } else {            this.selectElement.style.animation = `slideLeft ${this.timeAnimate.failBar}s ease forwards`;
            this.buttonload.innerHTML          = "<i class='bx bx-folder'></i>";
    }
    };
    // фукція збереження нового graph при натисканні на кнопку
    #newSave() {
        this.appState.saveButton = !this.appState.saveButton;
        if (this.appState.saveButton) {
            this.input.style.display       = 'block';
            this.input.style.animation     = `slideRight ${this.timeAnimate.failBar}s ease forwards`;
            this.buttonInputSave.innerHTML = '<i class="bx bx-bookmark-alt-plus"></i>';
        } 
        if (!this.appState.saveButton){
            if (this.input.value.trim() !== '') this.newSave();
       
            this.clear();
            setTimeout(() => this.input.style.display = 'none', `${this.timeAnimate.failBar * 1000}`);
            this.input.style.animation = `slideLeft ${this.timeAnimate.failBar}s ease forwards`;
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
            this.toolsMeneger.resetButtonStyles();        //деактивуємо всі кнопки інструментів
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
            setTimeout(() => this.input.style.display = 'none', `${this.timeAnimate.failBar * 1000}`);
            this.input.style.animation     = `slideLeft ${this.timeAnimate.failBar}s ease forwards`;
            this.buttonInputSave.innerHTML = '<i class="bx bx-bookmark-alt-plus"></i>';
            this.appState.saveButton       = false;
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
        this.toolsMeneger.resetButtonStyles();
        // загрузка вибраного saveName
        this.saveName    = e.target.value;
        // Оновлення GraphEditor з новим saveName
        this.graphEditor = this.initializeGraphEditor(this.saveName);
        // блок закриття меню загрузки
        setTimeout(() => this.selectElement.style.display = 'none', `${this.timeAnimate.failBar * 1000}`);
        this.selectElement.style.animation = `slideLeft ${this.timeAnimate.failBar}s ease forwards`;
        this.buttonload.innerHTML          = "<i class='bx bx-folder'></i>";
        this.appState.loadButton           = false;
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

