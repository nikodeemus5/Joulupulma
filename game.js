// game.js

// Määrätään oikeat vastaukset jokaiselle pulmavaiheelle
const CORRECT_CODES = {
    1: '5024',
    2: '1225', 
    3: '5024',
    4: '5024' 
};

// **UUDET MUUTTUJAT CRYPTEXIÄ VARTEN**
const CRYPTEX_CHARACTERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']; 
const CRYPTEX_LENGTH = 4;
// Pitää kirjaa jokaisen rullan nykyisestä indeksistä (esim. [1, 2, 2, 5] tarkoittaa koodia 1225)
let cryptexState = Array(CRYPTEX_LENGTH).fill(0); 

// **UUSI FUNKTIO: CRYPTEXIN ALUSTUS**
function initCryptex() {
    const cryptexLock = document.getElementById('cryptex-lock');
    if (!cryptexLock) return; 

    cryptexLock.innerHTML = ''; 
    cryptexState = Array(CRYPTEX_LENGTH).fill(0); 

    // Luo jokainen rulla
    for (let i = 0; i < CRYPTEX_LENGTH; i++) {
        const rollContainer = document.createElement('div');
        rollContainer.classList.add('cryptex-roll-container');
        
        const rollInner = document.createElement('div');
        rollInner.classList.add('cryptex-roll-inner');

        // Luo kaikki mahdolliset merkit (0-9) rullan sisään
        CRYPTEX_CHARACTERS.forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            rollInner.appendChild(span);
        });

        rollContainer.appendChild(rollInner);
        
        // Aseta klikkikuuntelija koko rullakontille
        // Funktio, joka kutsuu cycleRollia ja päivittää rullan visuaalisen tilan
        rollContainer.addEventListener('click', () => {
            cycleRoll(i, rollInner); // Lähetä rullan indeksi ja inner-elementti
        });
        
        cryptexLock.appendChild(rollContainer);
        // Aseta rullat oikeaan alkuasentoon
        updateCryptexRollVisual(i, rollInner);
    }
}

// **UUSI FUNKTIO: RULLAN KÄÄNTÄMINEN JA VISUAALINEN PÄIVITYS**
function cycleRoll(index, rollInnerElement) {
    // Kasvata rullan indeksilukua
    cryptexState[index] = (cryptexState[index] + 1) % CRYPTEX_CHARACTERS.length;
    
    // Päivitä rullan visuaalinen asento CSS transform: translateY() avulla
    updateCryptexRollVisual(index, rollInnerElement);
}

// **UUSI FUNKTIO: PÄIVITTÄÄ CRYPTEX RULLAN VISUAALISEN SIJAINNIN**
function updateCryptexRollVisual(index, rollInnerElement) {
    // Yhden merkin korkeus on 90px (määritelty CSS:ssä)
    const charHeight = 90; 
    // Laske kuinka paljon sisempää rullaa pitää siirtää ylöspäin
    const translateYValue = -cryptexState[index] * charHeight;
    rollInnerElement.style.transform = `translateY(${translateYValue}px)`;
}


/**
 * PÄIVITETTY checkAnswer-funktio käsittelemään Cryptexin tilaa Pulmassa 2
 */
function checkAnswer(puzzleId) {
    const feedbackElement = document.getElementById(`p${puzzleId}-feedback`);
    let userAnswer = '';
    let correctAnswer = CORRECT_CODES[puzzleId];
    
    // 1. Hanki käyttäjän vastaus pulman tyypin mukaan
    if (puzzleId === 2) {
        // **CRYPTEX PULMA:** Kasaa koodi rullien nykyisistä tiloista
        userAnswer = cryptexState.map(index => CRYPTEX_CHARACTERS[index]).join('');
        
    } else {
        // **TEKSTIPULMA (1, 3, 4):** Lue koodi syötekentästä
        const inputElement = document.getElementById(`p${puzzleId}-input`);
        userAnswer = inputElement.value.toUpperCase().trim();
    }
    
    // 2. Yhteinen tarkistuslogiikka
    
    if (userAnswer === correctAnswer) {
        // Oikein!
        
        feedbackElement.textContent = 'Koodi oikein! Salalukko avattu!';
        feedbackElement.className = 'feedback-text success';
        
        // 3. Avaa seuraava osio
        const nextPuzzleId = puzzleId + 1;

        if (puzzleId < 4) {
            const nextPuzzleElement = document.getElementById(`puzzle-${nextPuzzleId}`);
            if (nextPuzzleElement) {
                setTimeout(() => {
                    nextPuzzleElement.classList.remove('hidden');
                    nextPuzzleElement.scrollIntoView({ behavior: 'smooth' }); 
                    
                    // Alusta Cryptex heti kun Pulma 2 on avattu!
                    // Tämä varmistaa, että Cryptex luodaan vasta kun sen aika on.
                    if (nextPuzzleId === 2) {
                         initCryptex();
                    }
                    
                }, 500); 
            }
        } else if (puzzleId === 4) {
            // Viimeinen pulma, aukaise onnitteluosio
            const congratulationsElement = document.getElementById('congratulations');
            if (congratulationsElement) {
                setTimeout(() => {
                    congratulationsElement.classList.remove('hidden');
                    congratulationsElement.scrollIntoView({ behavior: 'smooth' });
                }, 500);
            }
        }

    } else {
        // Väärin!
        feedbackElement.textContent = 'Väärin. Yritä uudelleen.';
        feedbackElement.className = 'feedback-text error';
        if (puzzleId !== 2) {
            // Tyhjennä tekstikenttä, mutta älä Cryptexin tilaa
            const inputElement = document.getElementById(`p${puzzleId}-input`);
            inputElement.value = '';
        }
    }
}