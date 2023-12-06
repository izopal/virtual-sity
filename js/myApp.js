import {Graph}           from './math/graph.js';
import {Point}           from './primitives/point.js';
import {Segment}         from './primitives/segment.js';
import { GraphEditor }   from "./editors/graphEditor.js";
import { MarkingEditor } from "./editors/markingEditors.js";
import { Osm }           from './math/osm.js';
import { MapHandler }    from './math/miniMap.js';

const buttonSave         = document.getElementById('buttonSave');
const buttonload         = document.getElementById('buttonload');
const buttonInputSave    = document.getElementById('buttonInputSave');
const buttonDispose      = document.getElementById('buttonDispose');

const input         = document.querySelector('.fail .input-wrapper input');
const maxLength     = input.getAttribute('maxlength');                             // параметр максимальної довжини вводу тексту
const inputLine     = document.querySelector('.fail .input-wrapper .line');
const iconClose     = document.querySelector('.fail .input-wrapper .icon.close');


const buttonMap        = document.getElementById('openOsmPanel');
const sendData         = document.getElementById('sendDataOsm');
const osmPanel         = document.querySelector('.osmPanel');
const osmDatacontainer = document.getElementById('osmDatacontainer');
const closeOsmPanel    = osmPanel.querySelector('.icon.close');

const selectElement = document.getElementById('load');

let appState = {
        saveButton:  false,
        loadButton:  false,
        dispose:     false,
        save:        false,
};

export class App{
    constructor(canvas, toolsMeneger, data, timeAnimate, vieport) {
        this.canvas = canvas;
        this.toolsMeneger       = toolsMeneger;

        this.data    = data;

        // Парамтри часу для анімації
        this.timeAnimate = timeAnimate
            
        this.saveName  = '';
        this.saveNames =  Object.keys(localStorage);         // отримуємо всі ключі з localStorage і поміщаємо їх в окремий масив;
        this.saveInfo  = '';
        
        this.vieport     = vieport;

        this.graph         = new Graph(this);
        this.markingEditor = new MarkingEditor(this);
        this.graphEditor   = new GraphEditor(this);

        this.initialize();
    };
    
    
    initialize() {
        this.removeEventListeners() 
        this.addEventListeners();
    };
    removeEventListeners() {
        buttonSave.removeEventListener     ('click',   this.boundSave)
        buttonload.removeEventListener     ('click',   this.boundLoad);
        buttonInputSave.removeEventListener('click',   this.boundNewSave);
        buttonDispose.removeEventListener  ('click',   this.boudDisponse);
        buttonMap.removeEventListener      ('click',   this.boundOpenMap);
        
        input.removeEventListener          ('keydown', this.boudSaveInput);
        input.removeEventListener          ('click',   this.boundInputLine);
        iconClose.removeEventListener      ('click',   this.boundClear);

        selectElement.removeEventListener  ('change',  this.boundSelecting);

        closeOsmPanel.removeEventListener  ('click',   this.boundCloseMap);
        sendData.removeEventListener       ('click',   this.boundSend);
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

        this.boundOpenMap   = ()  => this.#openOsmPanel();
        this.boundSend      = ()  => this.#parseOsmData();
        this.boundCloseMap  = ()  => this.#closeOsmPanel();

        buttonSave.addEventListener     ('click',   this.boundSave)
        buttonload.addEventListener     ('click',   this.boundLoad);
        buttonInputSave.addEventListener('click',   this.boundNewSave);
        buttonDispose.addEventListener  ('click',   this.boudDisponse);
        buttonMap.addEventListener      ('click',   this.boundOpenMap);
        
        input.addEventListener          ('keydown', this.boudSaveInput);
        input.addEventListener          ('click',   this.boundInputLine);
        iconClose.addEventListener      ('click',   this.boundClear);

        selectElement.addEventListener  ('change',  this.boundSelecting);

        closeOsmPanel.addEventListener  ('click',   this.boundCloseMap);
        sendData.addEventListener       ('click',   this.boundSend);
    };
   
 
    // функція збереження поточного graph
    #save() {
        if(appState.dispose){
                appState.save = true;
                buttonSave.innerHTML = "<i class='bx bx-save'></i>" ;
        }
        if (this.saveNames.includes(this.saveName) && this.saveName !== '') {
                localStorage.setItem(this.saveName, JSON.stringify(this.graph));
                appState.dispose = false;
        }else if(this.saveName === ''){
                buttonInputSave.innerHTML = "<i class='bx bx-bookmark-alt bx-tada'></i>";
        }
    };
    // фукція загрузки graph
    #load() {
        appState.loadButton = !appState.loadButton;
        if (appState.loadButton && this.saveNames.length !== 0) {
            this.getListDownloads();
            selectElement.style.display   = 'block';
            selectElement.style.animation = `slideRight ${this.timeAnimate.failBar}s ease forwards`;
            buttonload.innerHTML          = "<i class='bx bx-folder-open'></i>";
        } else {            selectElement.style.animation = `slideLeft ${this.timeAnimate.failBar}s ease forwards`;
            buttonload.innerHTML          = "<i class='bx bx-folder'></i>";
        }
    };
   
    // фукція збереження нового graph при натисканні на кнопку
    #newSave() {
        appState.saveButton = !appState.saveButton;
        if (appState.saveButton) {
            input.style.display       = 'block';
            input.style.animation     = `slideRight ${this.timeAnimate.failBar}s ease forwards`;
            buttonInputSave.innerHTML = '<i class="bx bx-bookmark-alt-plus"></i>';
        } 
        if (!appState.saveButton){
            if (input.value.trim() !== '') this.newSave();
       
            this.clear();
            setTimeout(() => input.style.display = 'none', `${this.timeAnimate.failBar * 1000}`);
            input.style.animation = `slideLeft ${this.timeAnimate.failBar}s ease forwards`;
        }
    };
    // функція очищення graph
    #disponce(){
        if(this.saveName === ''){
            buttonInputSave.innerHTML = "<i class='bx bx-bookmark-alt bx-tada'></i>";
        }
        if(this.saveName !== '' && !appState.save){
            appState.dispose = true
            buttonSave.innerHTML = "<i class='bx bx-save bx-burst'></i>";
        }
        if(appState.save){
            this.saveName = ''
            this.graphEditor.dispose();
            this.markingEditor.dispose();
            this.toolsMeneger.reset();               //деактивуємо всі кнопки інструментів
            localStorage.setItem(this.saveName, JSON.stringify(this.graph));
            this.saveNames  = Object.keys(localStorage)
            appState.save = false;
        };
    }
    // блок функції для роботи з картою openStreetMap
    #openOsmPanel(){
        osmPanel.style.display = 'block';
        if(!this.mapHandler) this.mapHandler = new MapHandler();
    };
    #closeOsmPanel(){
        this.toolsMeneger.reset();               //деактивуємо всі кнопки інструментів
        osmPanel.style.display = 'none';

    };
    async #parseOsmData(){
       
        this.graphEditor.dispose();
        this.markingEditor.dispose();
        // this.toolsMeneger.tools.graph.road = true;      // обираємо що тип інструменту для автоматичної
       // Створюємо екземпляр класу
        
        const radius = 1000; // Radius in meters
       
        const cityCoordinates = this.mapHandler.coordinates;
          
        const result          = await this.getFetch(cityCoordinates, radius);
        const dataOsm         = JSON.parse(result);
        console.log(cityCoordinates)

        new Osm(this.canvas, cityCoordinates, dataOsm, this.graph).parse();
        
        this.#closeOsmPanel();
    };

    async  getFetch(cityCoordinates, radius) {
        const q = ` 
                   [out:json];
                    (
                    way['highway'](around:${radius},${cityCoordinates.lat},${cityCoordinates.lon})
                        ['highway' !~'pedestrian']
                        ['highway' !~'footway']
                        ['highway' !~'path'];
                    way['building'](around:${radius},${cityCoordinates.lat},${cityCoordinates.lon});
                    );
                    out body;
                    >;
                    out skel;`;

        const url = "https://overpass-api.de/api/interpreter";

        try {
            const response = await fetch(url, { method: 'POST', body: q });
            const result   = await response.text();
            return result;
        } catch (error) {
            console.error('Помилка отримання даних...', error);
        }
    };



    // фукція збереження нового graph при натисканні на Enter
    #saveInputKeydown(e) {
        if (e.key === 'Enter') {
            if (input.value.trim() !== '') this.newSave();
            
            this.clear();
            setTimeout(() => input.style.display = 'none', `${this.timeAnimate.failBar * 1000}`);
            input.style.animation     = `slideLeft ${this.timeAnimate.failBar}s ease forwards`;
            buttonInputSave.innerHTML = '<i class="bx bx-bookmark-alt-plus"></i>';
            appState.saveButton       = false;
        }
    };
    // умова появи/зникнення лінії під полем для збереження
    #inputLine() {
        if(input.value.trim() !== '') {
            inputLine.style.transform       = 'scaleX(1)';
            inputLine.style.transformOrigin = 'left';
            iconClose.style.transform       = 'scale(1)';
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
        // загрузка вибраного saveName
        this.saveName    = e.target.value;
        // деактивація всіх кнопок при загрузці
        this.graphEditor.dispose();
        this.markingEditor.dispose();
        this.toolsMeneger.reset();               //деактивуємо всі кнопки інструментів
        // Оновлення GraphEditor з новим saveName
        const graphString = localStorage.getItem(this.saveName);
        this.saveInfo = graphString ? JSON.parse(graphString) : null;
        this.graph          = this.#loadGraph(this.saveInfo)
        this.markingEditor  = new MarkingEditor(this);
        this.graphEditor    = new GraphEditor(this);
        // блок закриття меню загрузки
        setTimeout(() => selectElement.style.display = 'none', `${this.timeAnimate.failBar * 1000}`);
        selectElement.style.animation = `slideLeft ${this.timeAnimate.failBar}s ease forwards`;
        buttonload.innerHTML          = "<i class='bx bx-folder'></i>";
        appState.loadButton           = false;
    };
    #loadGraph(saveInfo){
        const points        = saveInfo.points.map((point) => new Point(point, point.tools, point.radius));
       
        const segments    = saveInfo.segments.map((line) => new Segment(
            points.find(point => point.equals(line.p1)),
            points.find(point => point.equals(line.p2)),
            line.tools,
            line.size));
            
        const sortedPoints = {};
        points.forEach((point) => {
            for (const tool in point.tools) {
                if (point.tools[tool]) {
                    sortedPoints[tool] = sortedPoints[tool] || []
                    sortedPoints[tool].push(point);
                };
            };
        });

        const sortedSegments = {};
        for(const key in saveInfo.sortedSegments){
            sortedSegments[key]    = saveInfo.sortedSegments[key].map((line) => new Segment(
                points.find(point => point.equals(line.p1)),
                points.find(point => point.equals(line.p2)),
                line.tools));
        };
        return new Graph (this, points, sortedPoints, segments, sortedSegments);
    };

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
        const text = input.value;
        if (text.length > maxLength) {
            input.value = text.slice(0, maxLength);                          // Обрізаємо текст, якщо він занадто довгий
        }
    };
    // функція створення списку з усіх отриманих ключів saveNames
    getListDownloads() {
        selectElement.innerHTML = "";

        let option = document.createElement("option");
        option.text = 'Список загрузки';
        selectElement.appendChild(option);

        for (let name in this.saveNames) {
            if (this.saveNames[name] !== '') {
                option = document.createElement("option");
                option.value = this.saveNames[name];
                option.text = this.saveNames[name];
                selectElement.appendChild(option);
            }
        }
    };


    draw(ctx, viewPoint){
        this.graph.draw(ctx, viewPoint);
        this.graphEditor.draw(ctx, viewPoint);
        this.markingEditor.draw(ctx, viewPoint);
    };
    drawDebug(ctx){
        this.graphEditor.drawDebug(ctx)
        this.markingEditor.drawDebug(ctx)
    };
}
