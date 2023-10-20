import Graph            from './js/math/graph.js';
import {findGameObject} from './js/math/utils.js';
import GraphEditor      from './js/graphEditor.js';

const canvas        = document.getElementById('canvasMS');
      canvas.width  = innerWidth;
      canvas.height = innerHeight;

const ctx = canvas.getContext('2d');

const keys        = ['point', 'segment'];


const gameObject  = findGameObject(keys[0]);
console.log(gameObject)
const Class      = gameObject.class;

const gameObject1  = findGameObject(keys[1]);
const Class1      = gameObject1.class
console.log(Class1)
    


// функція для отримання обєкту за вказаними ключем

const p1 = new Class (200, 200, gameObject);
const p2 = new Class (500, 200, gameObject);
const p3 = new Class (400, 400, gameObject);
const p4 = new Class (100, 300, gameObject);

const s1 = new Class1 (p1, p2, gameObject1);
const s2 = new Class1 (p1, p3, gameObject1);
const s3 = new Class1 (p1, p4, gameObject1);
const s4 = new Class1 (p2, p3, gameObject1);







const graph = new Graph([p1, p2, p3, p4,], [s1, s2, s3, s4]);

const graphEditor = new GraphEditor (canvas, graph, gameObject, gameObject1)


function animate(){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      graphEditor.draw(ctx)
      requestAnimationFrame(animate);
}

animate();