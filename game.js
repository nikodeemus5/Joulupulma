// Oikeat vastaukset
const CORRECT_CODES = {
    1: '7898',          
    2: 'PORO',
    3: '2758',          
    4: '➡️➡️⬆️⬅️',    
    5: '2412',
    6: 'JOULU',      // UUSI PULMA 6
    7: 'RANTASAUNA'  // ENTINEN PULMA 6 (nyt 7)
};

// Määritellään eri symbolit eri lukoille
const SYMBOLS_NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const SYMBOLS_ARROWS = ['⬆️','➡️','⬇️','⬅️'];
const SYMBOLS_CRYPTEX = ['A','J','S','O','K','H','U','L','R','P'];

// Tallennetaan lukkojen tilat tähän (avain on pulman ID)
let lockStates = {
    1: [0, 0, 0, 0], 
    4: [0, 0, 0, 0],
    5: [0, 0, 0, 0], // Lisätty, jos se puuttui
    6: [0, 0, 0, 0, 0] // UUSI Pulma 6: 5 symbolia 'JOULU'
};

/**
 * VAIHTAA TAUSTAKUVAN PELIN VAIHEEN MUKAAN
 */
function updateBackground(puzzleId) {
    const body = document.body;
    
    // Poistetaan ensin kaikki vanhat taustaluokat
    body.classList.remove('bg-outdoor', 'bg-interior', 'bg-cellar', 'bg-office');

    // Lisätään uusi luokka vaiheen mukaan
    if (puzzleId === 1) {
        body.classList.add('bg-outdoor');
    } 
    else if (puzzleId === 2 || puzzleId === 3) {
        body.classList.add('bg-interior');
    } 
    else if (puzzleId === 4) {
        body.classList.add('bg-cellar');
    } 
    else if (puzzleId >= 5) {
        body.classList.add('bg-office');
    }
}

// game.js - Lisää tämä funktio
function preloadImages(imageArray) {
    imageArray.forEach(url => {
        const img = new Image(); // Luo uuden kuvaobjektin
        img.src = url;          // Lataa kuvan selaimen muistiin
    });
}

// game.js - KUTSU: Lisää tämä kutsu DOMContentLoaded-tapahtuman sisään
document.addEventListener('DOMContentLoaded', () => {
    
    // Kutsutaan esilatausta heti alussa:
    preloadImages([
        'outdoor.png',
        'interior.png',
        'cellar.png',
        'office.png'
        // Voit lisätä tähän listaan myös muut kuvat, joita käytät pelissä
    ]);
    
    // ... muu DOMContentLoaded-koodi jatkuu tästä ...
    updateBackground(1);
    createCryptex(1, 'cryptex-1', SYMBOLS_NUMBERS);
    setupDragAndDrop(); 
});

/**
 * GENERIC CRYPTEX CREATOR
 * Luo lukon haluttuun HTML-elementtiin halutuilla symboleilla
 */
function createCryptex(puzzleId, containerId, symbols, rollCount = 4) { // LISÄYS: rollCount = 4
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = ''; // Tyhjennä vanha jos on
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.gap = '10px';
    container.style.margin = '20px auto';

    // Nollataan tila
    lockStates[puzzleId] = new Array(rollCount).fill(0);

    for (let i = 0; i < rollCount; i++) { // MUUTOS: Käytä rollCountia
        const rollContainer = document.createElement('div');
        rollContainer.classList.add('cryptex-roll-container');
        
        const rollInner = document.createElement('div');
        rollInner.classList.add('cryptex-roll-inner');

        symbols.forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            rollInner.appendChild(span);
        });

        rollContainer.appendChild(rollInner);
        
        // Klikkaus pyörittää tätä rullaa
        rollContainer.addEventListener('click', () => {
            cycleRoll(puzzleId, i, rollInner, symbols);
        });
        
        container.appendChild(rollContainer);
        updateVisuals(rollInner, 0); // Aseta nolla-asentoon
    }
}

// Rullan pyöritys
function cycleRoll(puzzleId, rollIndex, element, symbols) {
    // Päivitä tilaa
    lockStates[puzzleId][rollIndex] = (lockStates[puzzleId][rollIndex] + 1) % symbols.length;
    
    // Päivitä näkymä
    const currentIndex = lockStates[puzzleId][rollIndex];
    updateVisuals(element, currentIndex);
}

// Visuaalinen päivitys (CSS transform)
function updateVisuals(element, index) {
    const charHeight = 90; // Sama kuin CSS:ssä
    element.style.transform = `translateY(${-index * charHeight}px)`;
}

/**
 * TARKISTUSLOGIIKKA
 */
function checkAnswer(puzzleId) {
    const feedbackElement = document.getElementById(`p${puzzleId}-feedback`);
    let userAnswer = '';
    let correctAnswer = CORRECT_CODES[puzzleId];

// -- HAE VASTAUS --
    
    if (puzzleId === 1) {
        // Pulma 1: Lue tila lockStates[1] ja muuta numeroiksi
        userAnswer = lockStates[1].map(i => SYMBOLS_NUMBERS[i]).join('');
    } 
    else if (puzzleId === 2) {
        // **UUSI LOGIIKKA PULMA 2: DRAG & DROP**
        const targets = document.querySelectorAll('#drop-zone-2 .drop-target:not(.extra-spot)'); // Vain 4 ensimmäistä
        let correctSequence = '';
        let userSequence = '';
        
        targets.forEach(target => {
            // Oikea järjestys on aina sama (PETTERI, OSKARI, ROOPE, ONNI)
            correctSequence += target.dataset.correctName; 
            
            // Tarkista, mikä elementti pudotettiin tähän (jos joku)
            if (target.children.length > 0 && target.children[0].classList.contains('draggable')) {
                userSequence += target.children[0].dataset.name;
            } else {
                userSequence += 'TYHJÄ'; // Jos laatikko on tyhjä
            }
        });
        
        userAnswer = userSequence; // Vastaus on pudotettu sanajärjestys
        correctAnswer = correctSequence; // Oikea vastaus on POROjen järjestys PETTERIOSKARIROOPEONNI
        
        // Huom: Koska correct_codes[2] oli 'PORO', vaihdamme sen vain täällä
        // Tai sitten otamme vain ensimmäiset kirjaimet, kuten tarinassa!
        // Muokataan tarkistusta vastaamaan tarinaa (ensin. kirjaimet)
        if (userAnswer === correctAnswer) {
            // Jos järjestys on oikein, luomme 'PORO' sanan
            userAnswer = 'PORO'; 
            correctAnswer = CORRECT_CODES[2]; // Joka on 'PORO'
        }
        
    }
    else if (puzzleId === 4) {
        userAnswer = lockStates[4].map(i => SYMBOLS_ARROWS[i]).join('');
    } 
    else if (puzzleId === 5) {
        userAnswer = lockStates[5].map(i => SYMBOLS_NUMBERS[i]).join('');
    } 
    else if (puzzleId === 6) {
        userAnswer = lockStates[6].map(i => SYMBOLS_CRYPTEX[i]).join('');
    }
    else {
        // Tekstikentät (3, 7)
        const inputElement = document.getElementById(`p${puzzleId}-input`);
        if(inputElement) userAnswer = inputElement.value.toUpperCase().trim();
    }

    // -- TARKISTA --

    if (userAnswer === correctAnswer) {
        // OIKEIN
        feedbackElement.textContent = getSuccessMessage(puzzleId);
        feedbackElement.className = 'feedback-text success';

        const nextPuzzleId = puzzleId + 1;
        
        updateBackground(nextPuzzleId);
        
        if (puzzleId < 7) {
            const nextPuzzleElement = document.getElementById(`puzzle-${nextPuzzleId}`);
            if (nextPuzzleElement) {
                setTimeout(() => {
                    nextPuzzleElement.classList.remove('hidden');
                    nextPuzzleElement.scrollIntoView({ behavior: 'smooth' });

                    // ERIKOISTAPAUS: Jos avaamme sokkelon (4), luodaan sen lukko nyt
                    if (nextPuzzleId === 4) {
                        createCryptex(4, 'cryptex-4', SYMBOLS_ARROWS);
                    }
                    if (nextPuzzleId === 5) {
                        createCryptex(5, 'cryptex-5', SYMBOLS_NUMBERS);
                    }
                    if (nextPuzzleId === 6) {
                        createCryptex(6, 'cryptex-6', SYMBOLS_CRYPTEX, 5);
                    }
                }, 1000);
            }
        } else {
            // Peli läpi
            document.getElementById('congratulations').classList.remove('hidden');
            document.getElementById('congratulations').scrollIntoView({ behavior: 'smooth' });
        }

    } else {
        // VÄÄRIN
        feedbackElement.textContent = 'Väärin menee. Tarkista vihjeet!';
        feedbackElement.className = 'feedback-text error';
    }
}

function getSuccessMessage(id) {
    const msgs = {
        1: "Klik! Jäinen lukko aukeaa ja ovi narahtaa auki.",
        2: "Oikein! Porot on järjestetty.",
        3: "Salaluukku naksahtaa auki!",
        4: "Pääsitte sokkelon läpi!",
        5: "Salkun lukot aukeavat!",
        6: "Koodi purettu! Salainen viesti löytyy!",
        7: "Koodi purettu!"
    };
    return msgs[id] || "Oikein!";
}

// --- Drag and Drop Logiikka Pulma 2 varten ---

document.addEventListener('DOMContentLoaded', () => {
    // Asetetaan alkutausta
    updateBackground(1);

    // Luodaan Pulma 1 lukko heti (Numerot)
    createCryptex(1, 'cryptex-1', SYMBOLS_NUMBERS);
    
    // Asennetaan Drag and Drop -kuuntelijat
    setupDragAndDrop(); 
});

// Asettaa kuuntelijat kaikille vedettäville ja pudotettaville elementeille
function setupDragAndDrop() {
    const draggables = document.querySelectorAll('.draggable');
    const dropTargets = document.querySelectorAll('.drop-target');

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', (e) => {
            draggedItem = draggable;
            // Asetetaan dataTransferiin elementin nimi
            e.dataTransfer.setData('text/plain', draggable.dataset.name);
            setTimeout(() => {
                // Piilotetaan elementti raahauksen ajaksi
                draggable.style.visibility = 'hidden';
            }, 0);
        });

        draggable.addEventListener('dragend', () => {
            draggedItem.style.visibility = 'visible';
            draggedItem = null;
        });
    });

    dropTargets.forEach(target => {
        target.addEventListener('dragover', (e) => {
            e.preventDefault(); // Sallii pudotuksen
            target.classList.add('drag-over');
        });

        target.addEventListener('dragleave', () => {
            target.classList.remove('drag-over');
        });

        target.addEventListener('drop', (e) => {
            e.preventDefault();
            target.classList.remove('drag-over');
            
            // Pudotettavan elementin nimi
            const data = e.dataTransfer.getData('text/plain');
            const draggedElement = document.querySelector(`.draggable[data-name="${data}"]`);

            // Jos kohdassa on jo elementti, palautetaan se takaisin lähtöalueelle
            if (target.children.length > 0) {
                // Vie elementti takaisin alkuperäiseen konttiin
                const container = document.getElementById('drag-elements-2');
                container.appendChild(target.children[0]);
            }
            
            // Siirrä uusi elementti pudotusalueelle
            if (draggedElement) {
                // Poista vanhasta sijainnista (jos oli jo jossain drop-targetissa)
                if (draggedElement.parentElement.classList.contains('drop-target')) {
                     const oldParent = draggedElement.parentElement;
                     // Vie takaisin alkuperäiseen konttiin
                     document.getElementById('drag-elements-2').appendChild(draggedElement);
                }
                
                // Siirrä kohdealueeseen
                target.appendChild(draggedElement);
                // Varmista, että se on taas näkyvissä
                draggedElement.style.visibility = 'visible';
            }
        });
    });
}