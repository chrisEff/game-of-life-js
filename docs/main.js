(()=>{"use strict";const t=t=>{Object.getOwnPropertyNames(t.constructor.prototype).filter((e=>"constructor"!==e&&"function"==typeof t[e])).forEach((e=>t[e]=t[e].bind(t)))},e=t=>document.getElementById(t);class i{constructor(e,i,r,s,l,o){this.grid=e,this.canvas=i,this.context2D=i.getContext("2d"),this.width=r,this.height=s,this.intervalTime=l,this.interval=null,this.cellSize=o,this.context2D.fillStyle="#000000",i.onclick=t=>{const e=this.grid.get(Math.floor(t.offsetY/(this.cellSize+1)),Math.floor(t.offsetX/(this.cellSize+1)));e.setAlive(!e.alive),this.drawCell(e)},t(this)}init(){this.canvas.setAttribute("height",this.height*(this.cellSize+1)),this.canvas.setAttribute("width",this.width*(this.cellSize+1)),this.grid.init(this.width,this.height,this.cellSize),this.drawGuides()}reset(){this.grid.reset(),this.drawFullFrame()}drawGuides(){const t=this.cellSize+1,e=this.width*t,i=this.height*t;this.context2D.strokeStyle="#EEEEEE";for(let i=0;i<this.height;i+=5)this.context2D.moveTo(0,i*t),this.context2D.lineTo(e,i*t);for(let e=0;e<this.width;e+=5)this.context2D.moveTo(e*t,0),this.context2D.lineTo(e*t,i);this.context2D.stroke()}start(){e("start").style.display="none",e("stop").style.display="initial",this.interval=window.setInterval(this.doStep,this.intervalTime)}stop(){e("start").style.display="initial",e("stop").style.display="none",window.clearInterval(this.interval),delete this.interval}doStep(){this.grid.doStep().forEach((t=>{t.toggle(),this.drawCell(t)}))}drawFullFrame(){this.grid.cellArrayFlat.forEach(this.drawCell)}drawCell(t){t.alive?this.context2D.fillRect(t.xPos,t.yPos,this.cellSize,this.cellSize):this.context2D.clearRect(t.xPos,t.yPos,this.cellSize,this.cellSize)}changeIntervalTime(t){this.stop(),window.localStorage.intervalTime=this.intervalTime=parseInt(t),this.start()}setWidth(t){t=parseInt(t),window.localStorage.gridWidth=t;const e=this.grid.exportGrid();this.width=t,this.init(),this.grid.importGrid(e),this.drawFullFrame()}setHeight(t){t=parseInt(t),window.localStorage.gridHeight=t;const e=this.grid.exportGrid();this.height=t,this.init(),this.grid.importGrid(e),this.drawFullFrame()}setCellSize(t){t=parseInt(t),window.localStorage.cellSize=t;const e=this.grid.exportGrid();this.cellSize=t,this.init(),this.grid.importGrid(e),this.drawFullFrame()}async loadPattern(t,e=!1,i=0,r=0){if(e&&this.reset(),t){const e=await fetch(`patterns/${t}.rle`);this.grid.importRLE(await e.text(),i,r)}this.drawFullFrame()}}class r{constructor(t,e,i,r){this.grid=i,this.x=t,this.y=e,this.xPos=t*(r+1),this.yPos=e*(r+1),this.alive=!1,this.livingNeighborCount=0}initNeighbors(){this.neighbors=[],[{x:this.x-1,y:this.y-1},{x:this.x-1,y:this.y},{x:this.x-1,y:this.y+1},{x:this.x,y:this.y-1},{x:this.x,y:this.y+1},{x:this.x+1,y:this.y-1},{x:this.x+1,y:this.y},{x:this.x+1,y:this.y+1}].forEach((t=>{try{const e=this.grid.get(t.y,t.x);e&&this.neighbors.push(e)}catch(t){}}))}setAlive(t){this.alive!==t&&(this.alive=t,this.alive?this.neighbors.forEach((t=>t.livingNeighborCount++)):this.neighbors.forEach((t=>t.livingNeighborCount--)))}toggle(){this.alive=!this.alive,this.alive?this.neighbors.forEach((t=>t.livingNeighborCount++)):this.neighbors.forEach((t=>t.livingNeighborCount--))}}class s{constructor(){this.cellArray=[],this.cellArrayFlat=[],t(this)}get(t,e){return this.cellArray[t][e]}init(t,e,i){this.cellArray=[],this.cellArrayFlat=[];for(let s=0;s<e;s++){const e=[];for(let l=0;l<t;l++){const t=new r(l,s,this,i);e.push(t),this.cellArrayFlat.push(t)}this.cellArray.push(e)}this.cellArrayFlat.forEach((t=>t.initNeighbors()))}reset(){this.cellArrayFlat.forEach((t=>t.setAlive(!1)))}randomize(){this.cellArrayFlat.forEach((t=>{t.setAlive(Boolean(Math.round(Math.random())))}))}doStep(){return this.cellArrayFlat.filter((t=>t.alive?t.livingNeighborCount<2||t.livingNeighborCount>3:3===t.livingNeighborCount))}importGrid(t,e=0,i=0){-1===e&&(e=Math.max(0,Math.floor((this.cellArray[0].length-t[0].length)/2))),-1===i&&(i=Math.max(0,Math.floor((this.cellArray.length-t.length)/2)));const r=Math.min(t.length+i,this.cellArray.length),s=Math.min(t[0].length+e,this.cellArray[0].length);for(let l=i;l<r;l++)for(let r=e;r<s;r++)this.cellArray[l][r].setAlive(Boolean(t[l-i][r-e]))}exportGrid(t=!1){const e=this.cellArray.map((t=>t.map((t=>t.alive?1:0))));if(t)for(;e.length;){const t=e.pop();if(t.filter((t=>1===t)).length>0){e.push(t);break}}return e}importJson(t,e=0,i=0){this.importGrid(JSON.parse(t),e,i)}exportJson(){return JSON.stringify(this.exportGrid(!0)).replace(/],/g,"],\n").replace("[[","[\n[").replace("]]","]\n]")}importRLE(t,e=0,i=0){let r=0,s=[];t.split("\n").filter((t=>!t.startsWith("#"))).join("").replace(/\n/g,"").split("$").forEach((t=>{const e=t.split("");let i="";const l=[];for(;e.length;){const t=e.shift();if("b"===t||"o"===t){""===i&&(i=1);for(let e=0;e<parseInt(i);e++)l.push("o"===t?1:0);i=""}else i+=t}if(s.push(l),""!==i)for(let t=1;t<parseInt(i);t++)s.push([0]);r=Math.max(r,l.length)})),s=s.map((t=>{const e=t.length;return t.length=r,t.fill(0,e)})),this.importGrid(s,e,i)}exportRLE(){let t="",e=-1;return this.exportGrid(!0).forEach((i=>{if(i.filter((t=>t)).length<1)return void e++;e>0?t+=`${e+1}$`:0===e&&(t+="$"),e=0;let r=1,s=null;i.forEach((e=>{e===s?r++:(null!==s&&(t+=`${r}${s?"o":"b"}`,r=1),s=e)})),s&&(t+=`${r}o`)})),t}hflip(){const t=this.exportGrid();t.forEach((t=>t.reverse())),this.importGrid(t)}vflip(){this.importGrid(this.exportGrid().reverse())}shiftUp(){const t=this.exportGrid();t.shift(),t.push(new Array(this.cellArray[0].length).fill(0)),this.importGrid(t)}shiftDown(){const t=this.exportGrid();t.unshift(new Array(this.cellArray[0].length).fill(0)),this.importGrid(t)}shiftLeft(){const t=this.exportGrid();t.forEach((t=>{t.shift(),t.push(0)})),this.importGrid(t)}shiftRight(){const t=this.exportGrid();t.forEach((t=>t.unshift(0))),this.importGrid(t)}rotate(){const t=this.exportGrid(),e=[];for(let i=0;i<t[0].length;i++){const r=t.map((t=>t[i])).reverse();e.push(r)}this.importGrid(e)}}class l{getJson(t){const e=localStorage.getItem(t);return e?JSON.parse(e):null}setJson(t,e){localStorage.setItem(t,JSON.stringify(e))}setObjectProperty(t,e,i){const r=this.getJson(t)||{};r[e]=i,this.setJson(t,r)}}const o=t=>document.getElementById(t);document.addEventListener("DOMContentLoaded",(t=>{const e=new l,r=e.getJson("displayStates")||{};Object.entries(r).forEach((([t,e])=>{o(t).style.display=e})),HTMLElement.prototype.toggle=function(t="initial"){this.style.display=["","none"].includes(this.style.display)?t:"none",e.setObjectProperty("displayStates",this.id,this.style.display)};const h=new s,n=new i(h,o("canvas"),parseInt(window.localStorage.gridWidth)||128,parseInt(window.localStorage.gridHeight)||128,parseInt(window.localStorage.intervalTime)||1,parseInt(window.localStorage.cellSize)||4);n.init(),o("gridHeight").value=n.height,o("gridWidth").value=n.width,o("cellSize").value=n.cellSize,o("intervalTime").value=n.intervalTime;const a={s:()=>n.interval?n.stop():n.start(),t:o("step").onclick=n.doStep,r:o("reset").onclick=n.reset,h:o("hflip").onclick=()=>{h.hflip(),n.drawFullFrame()},v:o("vflip").onclick=()=>{h.vflip(),n.drawFullFrame()},o:o("rotate").onclick=()=>{h.rotate(),n.drawFullFrame()},a:o("randomize").onclick=()=>{h.randomize(),n.drawFullFrame()},ArrowDown:o("down").onclick=()=>{h.shiftDown(),n.drawFullFrame()},ArrowUp:o("up").onclick=()=>{h.shiftUp(),n.drawFullFrame()},ArrowLeft:o("left").onclick=()=>{h.shiftLeft(),n.drawFullFrame()},ArrowRight:o("right").onclick=()=>{h.shiftRight(),n.drawFullFrame()}};o("start").onclick=n.start,o("stop").onclick=n.stop,o("runBenchmark").onclick=()=>{const t=o("benchmarkSteps").value,e=performance.now();for(let e=0;e<t;e++)n.doStep();console.log(`Executing ${t} steps took ${performance.now()-e}ms.`)},Array.from(document.getElementsByClassName("pattern")).forEach((t=>t.onclick=t=>n.loadPattern(t.target.value||t.target.innerHTML,o("resetBeforeLoad").checked,document.forms.settings.offsetXcenter.value?-1:parseInt(o("offsetX").value),document.forms.settings.offsetYcenter.value?-1:parseInt(o("offsetY").value)))),o("gridWidth").onchange=t=>n.setWidth(t.target.value),o("gridHeight").onchange=t=>n.setHeight(t.target.value),o("cellSize").onchange=t=>n.setCellSize(t.target.value),o("intervalTime").onchange=t=>n.changeIntervalTime(t.target.value),o("numbersLettersLabel").onclick=()=>o("numbersLetters").toggle("block"),o("gliderGunsLabel").onclick=()=>o("gliderGuns").toggle("flex"),o("corderShipsLabel").onclick=()=>o("corderShips").toggle("flex"),o("import").onclick=()=>{const t=o("importExport").value,e=parseInt(o("offsetX").value),i=parseInt(o("offsetY").value);(t=>{try{return JSON.parse(t),!0}catch(t){return!1}})(t)?h.importJson(t,e,i):h.importRLE(t,e,i),n.drawFullFrame()},o("exportJSON").onclick=()=>o("importExport").value=h.exportJson(),o("exportRLE").onclick=()=>o("importExport").value=h.exportRLE(),document.addEventListener("keydown",(t=>{t.metaKey||t.ctrlKey||"body"!==t.target.tagName.toLowerCase()||!Object.prototype.hasOwnProperty.call(a,t.key)||(a[t.key](),t.preventDefault())}))}))})();