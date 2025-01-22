/* #################### Tableau des transitions #################### */

function createHead(headContent){
    const table = document.querySelector('#dataTable');
    const thead = document.createElement('thead');

    emptyTr = document.createElement('th')
    thead.appendChild(emptyTr);
    
    headContent.forEach(element => {
        const th = document.createElement('th');
        th.id = element;
        th.textContent = element;
        thead.appendChild(th);
    });
    table.appendChild(thead);
}

function createStates(states){
    const table = document.querySelector('#dataTable');
    const tbody = document.createElement('tbody');

    states.forEach(element => {
        const tr = document.createElement('tr');
        const th = document.createElement('th');
        th.textContent = element;
        if (element.includes("'")){element = element[0] + 'p' + element[2]}
        tr.id = element;
        tr.appendChild(th);
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
}

function createCell(alphabet,states){
    for (let i = 0; i < states.length; i++) {
        let state = states[i]
        if (state.includes("'")){state = state[0] + 'p' + state[2]}

        const tr = document.querySelector("#"+state)
        for (let j = 0; j < alphabet.length; j++) {
            let char = alphabet[j]
            if (char === "#"){ // # ne fonctionne pas pour un querySelector
                char = '_'
            }
            const td = document.createElement('td')
            td.id = state+char
            tr.appendChild(td)
        }
    }
}

function formatTransitions(transitions){
    let transitionsFormat = [];
    transitions.forEach(element => {
        const coordTrans = element.split('->');
        const tmp = coordTrans[0].split(',');
        if (tmp[1] === '#'){tmp[1] = '_'}
        coordTrans[0] = tmp[0] + tmp[1]
        transitionsFormat.push(coordTrans);

    });

    return transitionsFormat;
}

function placeTransition(transitionsFormat){
    transitionsFormat.forEach(element => {
        let coord = element[0]
        let transition = element[1]
        if (coord.includes("'")){coord = coord[0] + 'p' + coord[2] + coord[3]}
        let td = document.querySelector("#"+coord)
        td.textContent = transition
    })
}

/* #################### Affichage de certaines infos #################### */

function infosMachine(inputSymbols, finalStates){
    document.querySelector('#input').textContent += inputSymbols
    document.querySelector('#final').textContent += finalStates
}



/* #################### Traitement du fichier #################### */

function getSection(contentFile, section){
    const lines = contentFile.split('\n');
    let sectionContent = [];
    let inSection = false;

    let i = 0;
    let line = lines[i].trim();

    if (line === section){
        inSection = true;
    }else{
        while(!inSection && i < lines.length){
            i++;
            line = lines[i].trim();
            if (line === section){
                inSection = true;
            }
        }
    }

    while (inSection) {
        i++;

        line = lines[i].trim();
        if (section === '/**  Transitions **/') { // cas spécifique des transitions
            if (i === lines.length-1) {
                inSection = false;
            }else{
                if (line !== '') {
                    sectionContent.push(line);
                }
            }

        }else{
            if (line === '') {
                inSection = false;
            }else{
                if (line !== ''){
                    sectionContent.push(line);
                }

            }
        }

    }

    return sectionContent;
}


let tapeAlphabet = []
let states = []
let transitions = []
let inputSymbols = []
let finalStates = []
let initialState = ""

const fileName = document.querySelector('#labelFileInput');

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.mt')) {
        const p = document.querySelector('#p')
        const infoSymbols = document.querySelector('#input')
        const infoFinal = document.querySelector('#final')

        if (p.textContent !== ''){p.textContent = ''}
        if (infoSymbols !== ''){infoSymbols.textContent = ''}
        if (infoFinal !== ''){infoFinal.textContent = ''}

        fileName.textContent = file.name

        const reader = new FileReader();
        reader.onload = function(e) {
            
            const content = e.target.result;
            
            const thead = document.querySelector('thead');
            const tbody = document.querySelector('tbody');
            if (thead && tbody){thead.remove();tbody.remove();}

            tapeAlphabet = getSection(content, '/**  Tape alphabet **/');
            createHead(tapeAlphabet);

            states = getSection(content, '/**  States **/');
            createStates(states);

            transitions = getSection(content, '/**  Transitions **/');
            createCell(tapeAlphabet, states);
            placeTransition(formatTransitions(transitions))

            inputSymbols = getSection(content, '/**  Input symbols **/');

            finalStates = getSection(content, '/**  Final states **/');

            initialState = getSection(content, '/**  Initial state **/')[0];

            infosMachine(inputSymbols, finalStates)

        };
        reader.readAsText(file);
    }else{
        alert('Please select a file with .mt extension');
        event.target.value = '';
    }
});



/* #################### Machine de Turing #################### */

/* Fonction qui fait défiler la div vers le bas */
function scrollToBottom() {
    const div = document.querySelector('#logTuring');
    div.scrollTop = div.scrollHeight;
}

function showTuringExec(message){
    const log = document.querySelector('#logTuring')
    const txt = document.createElement('p')

    txt.className = "ruban"
    txt.innerHTML = message
    log.appendChild(txt)

    scrollToBottom() // scroll automatique
}

function formatRuban(curseur,wordArray){
    return newWord = wordArray.slice(0,curseur).join('') + '<span class="curseur">'+wordArray[curseur]+'</span>'+wordArray.slice(curseur+1).join('')
}

function validWord(inputSymbols, word){
    let valid = true
    if (word === null || word === undefined || word === ''){
        valid = false
    }else{
        let i = 0
        while (valid && i < word.length){
            let char = word[i]
            if(!inputSymbols.includes(word[i])){valid = false}
            i++
        }
    }
    return valid
}

function turing(word){
    document.querySelector('#logTuring').textContent = ''

    let wordArray = word.split('')
    wordArray = ['#', ...wordArray] // '#' au début du tableau
    wordArray = [...wordArray, '#'] // '#' en fin de tableau

    let state = initialState
    let i = 1

    /* Parcourt du tableau de transition */
    const intervalId = setInterval(() => {
        if(finalStates.includes(state)){
            clearInterval(intervalId)
            showTuringExec(state + " : " + formatRuban(i, wordArray))
            showTuringExec("<span id='reconnu'>Mot reconnu !</span>")
            confettis()
            confettis() // un max de confettis
            return; // Sors de la fonction
        }

        let char = wordArray[i] // Case en cours de lecture

        showTuringExec(state + " : " + formatRuban(i, wordArray)) // Affichage du ruban avec le curseur

        if (state.includes("'")){state = state[0] + 'p' + state[2]}
        if (char === '#'){char = '_'}

        let transition = document.querySelector("#" + state + char).textContent // accès à la transition à faire

        if (transition === ""){ // si on tombe sur une case du tableau de transition vide alors le mot n'est pas reconnu
            showTuringExec("<span id='nonReconnu'>Mot non reconnu !</span>")
            state = null
            clearInterval(intervalId)
            return;
        }else{
            let spltTransition = transition.split(',')
            /* traitement de la transition */

            state = spltTransition[0] // état suivant
            wordArray[i] = spltTransition[1] // case sous le curseur changée

            if (spltTransition[2] === 'R' && i < wordArray.length-1){ // Si R on va à droite sinon à gauche
                i++
            }else if (spltTransition[2] === 'L' && i > 0){
                i--
            }
        }
    },400)
}

/* Affichage texte d'erreur si le symbole entré n'est pas valide */
document.querySelector("#wordInput").addEventListener("input", e => {
    let word = e.target.value
    const p = document.querySelector('#p')
    if (inputSymbols.length === 0){
        p.textContent = "Merci de choisir un fichier"
        p.className += " text-red-400"
    }else{
        if (!validWord(inputSymbols, word) && word !== ''){
            p.innerHTML = "Symbole(s) non valide !"
            p.className += " text-red-400"
        }else{
            p.textContent = ''
        }
    }
})


document.querySelector("form").addEventListener("submit", e =>{
    e.preventDefault()
    let word = document.querySelector("#wordInput").value // récupère le mot entré par l'utilisateur
    if (inputSymbols.length === 0){
        const p = document.querySelector('#p')
        p.textContent = "Merci de choisir un fichier"
        p.className += " text-red-400"
    }
    /* vértification du mot entré par l'utilisateur */
    const p = document.querySelector('#p')
    if (validWord(inputSymbols, word)) {
        turing(word)
    }
})






/* #################### Confettis #################### */
/* Code ci-dessous écrit par : */
/* © Greg Robleto - cssartstudio.com */
function confettis(){
    "use strict";

    // Utility functions grouped into a single object
    const Utils = {
        // Parse pixel values to numeric values
        parsePx: (value) => parseFloat(value.replace(/px/, "")),

        // Generate a random number between two values, optionally with a fixed precision
        getRandomInRange: (min, max, precision = 0) => {
            const multiplier = Math.pow(10, precision);
            const randomValue = Math.random() * (max - min) + min;
            return Math.floor(randomValue * multiplier) / multiplier;
        },

        // Pick a random item from an array
        getRandomItem: (array) => array[Math.floor(Math.random() * array.length)],

        // Scaling factor based on screen width
        getScaleFactor: () => Math.log(window.innerWidth) / Math.log(1920),

        // Debounce function to limit event firing frequency
        debounce: (func, delay) => {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func(...args), delay);
            };
        },
    };

    // Precomputed constants
    const DEG_TO_RAD = Math.PI / 180;

    // Centralized configuration for default values
    const defaultConfettiConfig = {
        confettiesNumber: 250,
        confettiRadius: 6,
        confettiColors: [
            "#fcf403", "#62fc03", "#f4fc03", "#03e7fc", "#03fca5", "#a503fc", "#fc03ad", "#fc03c2"
        ],
        emojies: [],
        svgIcon: null, // Example SVG link
    };


    // Confetti class representing individual confetti pieces
    class Confetti {
        constructor({ initialPosition, direction, radius, colors, emojis, svgIcon }) {
            const speedFactor = Utils.getRandomInRange(0.9, 1.7, 3) * Utils.getScaleFactor();
            this.speed = { x: speedFactor, y: speedFactor };
            this.finalSpeedX = Utils.getRandomInRange(0.2, 0.6, 3);
            this.rotationSpeed = emojis.length || svgIcon ? 0.01 : Utils.getRandomInRange(0.03, 0.07, 3) * Utils.getScaleFactor();
            this.dragCoefficient = Utils.getRandomInRange(0.0005, 0.0009, 6);
            this.radius = { x: radius, y: radius };
            this.initialRadius = radius;
            this.rotationAngle = direction === "left" ? Utils.getRandomInRange(0, 0.2, 3) : Utils.getRandomInRange(-0.2, 0, 3);
            this.emojiRotationAngle = Utils.getRandomInRange(0, 2 * Math.PI);
            this.radiusYDirection = "down";

            const angle = direction === "left" ? Utils.getRandomInRange(82, 15) * DEG_TO_RAD : Utils.getRandomInRange(-15, -82) * DEG_TO_RAD;
            this.absCos = Math.abs(Math.cos(angle));
            this.absSin = Math.abs(Math.sin(angle));

            const offset = Utils.getRandomInRange(-150, 0);
            const position = {
                x: initialPosition.x + (direction === "left" ? -offset : offset) * this.absCos,
                y: initialPosition.y - offset * this.absSin
            };

            this.position = { ...position };
            this.initialPosition = { ...position };
            this.color = emojis.length || svgIcon ? null : Utils.getRandomItem(colors);
            this.emoji = emojis.length ? Utils.getRandomItem(emojis) : null;
            this.svgIcon = null;

            // Preload SVG if provided
            if (svgIcon) {
                this.svgImage = new Image();
                this.svgImage.src = svgIcon;
                this.svgImage.onload = () => {
                    this.svgIcon = this.svgImage; // Mark as ready once loaded
                };
            }

            this.createdAt = Date.now();
            this.direction = direction;
        }

        draw(context) {
            const { x, y } = this.position;
            const { x: radiusX, y: radiusY } = this.radius;
            const scale = window.devicePixelRatio;

            if (this.svgIcon) {
                context.save();
                context.translate(scale * x, scale * y);
                context.rotate(this.emojiRotationAngle);
                context.drawImage(this.svgIcon, -radiusX, -radiusY, radiusX * 2, radiusY * 2);
                context.restore();
            } else if (this.color) {
                context.fillStyle = this.color;
                context.beginPath();
                context.ellipse(x * scale, y * scale, radiusX * scale, radiusY * scale, this.rotationAngle, 0, 2 * Math.PI);
                context.fill();
            } else if (this.emoji) {
                context.font = `${radiusX * scale}px serif`;
                context.save();
                context.translate(scale * x, scale * y);
                context.rotate(this.emojiRotationAngle);
                context.textAlign = "center";
                context.fillText(this.emoji, 0, radiusY / 2); // Adjust vertical alignment
                context.restore();
            }
        }

        updatePosition(deltaTime, currentTime) {
            const elapsed = currentTime - this.createdAt;

            if (this.speed.x > this.finalSpeedX) {
                this.speed.x -= this.dragCoefficient * deltaTime;
            }

            this.position.x += this.speed.x * (this.direction === "left" ? -this.absCos : this.absCos) * deltaTime;
            this.position.y = this.initialPosition.y - this.speed.y * this.absSin * elapsed + 0.00125 * Math.pow(elapsed, 2) / 2;

            if (!this.emoji && !this.svgIcon) {
                this.rotationSpeed -= 1e-5 * deltaTime;
                this.rotationSpeed = Math.max(this.rotationSpeed, 0);

                if (this.radiusYDirection === "down") {
                    this.radius.y -= deltaTime * this.rotationSpeed;
                    if (this.radius.y <= 0) {
                        this.radius.y = 0;
                        this.radiusYDirection = "up";
                    }
                } else {
                    this.radius.y += deltaTime * this.rotationSpeed;
                    if (this.radius.y >= this.initialRadius) {
                        this.radius.y = this.initialRadius;
                        this.radiusYDirection = "down";
                    }
                }
            }
        }

        isVisible(canvasHeight) {
            return this.position.y < canvasHeight + 100;
        }
    }

    class ConfettiManager {
        constructor() {
            this.canvas = document.createElement("canvas");
            this.canvas.style = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1000; pointer-events: none;";
            document.body.appendChild(this.canvas);
            this.context = this.canvas.getContext("2d");
            this.confetti = [];
            this.lastUpdated = Date.now();
            window.addEventListener("resize", Utils.debounce(() => this.resizeCanvas(), 200));
            this.resizeCanvas();
            requestAnimationFrame(() => this.loop());
        }

        resizeCanvas() {
            this.canvas.width = window.innerWidth * window.devicePixelRatio;
            this.canvas.height = window.innerHeight * window.devicePixelRatio;
        }

        addConfetti(config = {}) {
            const { confettiesNumber, confettiRadius, confettiColors, emojies, svgIcon } = {
                ...defaultConfettiConfig,
                ...config,
            };

            const baseY = (5 * window.innerHeight) / 7;
            for (let i = 0; i < confettiesNumber / 2; i++) {
                this.confetti.push(new Confetti({
                    initialPosition: { x: 0, y: baseY },
                    direction: "right",
                    radius: confettiRadius,
                    colors: confettiColors,
                    emojis: emojies,
                    svgIcon,
                }));
                this.confetti.push(new Confetti({
                    initialPosition: { x: window.innerWidth, y: baseY },
                    direction: "left",
                    radius: confettiRadius,
                    colors: confettiColors,
                    emojis: emojies,
                    svgIcon,
                }));
            }
        }

        resetAndStart(config = {}) {
            // Clear existing confetti
            this.confetti = [];
            // Add new confetti
            this.addConfetti(config);
        }

        loop() {
            const currentTime = Date.now();
            const deltaTime = currentTime - this.lastUpdated;
            this.lastUpdated = currentTime;

            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.confetti = this.confetti.filter((item) => {
                item.updatePosition(deltaTime, currentTime);
                item.draw(this.context);
                return item.isVisible(this.canvas.height);
            });

            requestAnimationFrame(() => this.loop());
        }
    }

    const manager = new ConfettiManager();
    manager.addConfetti();

    const triggerButton = document.getElementById("show-again");
    if (triggerButton) {
        triggerButton.addEventListener("click", () => manager.addConfetti());
    }

    const resetInput = document.getElementById("reset");
    if (resetInput) {
        resetInput.addEventListener("input", () => manager.resetAndStart());
    }
};
