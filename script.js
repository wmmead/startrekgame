(function(){
    'use strict';
    console.log('reading js');

    /* This sets a global variable on the stylesheet to a number that represents how tall the browser is, minus browser chrome. This is important for iOS because the 100vh does not take into account the addition of a tab bar on the iPad or the address bar on the iPhone. The properties innerHeight and visualViewport report the same numbers */
    const pageHeight = function() {
        const doc = document.documentElement;
        doc.style.setProperty('--page-height', `${window.innerHeight}px`);
        //console.log(`innerHeight: ${window.innerHeight}px`);
        //console.log(`visualViewport ${visualViewport.height}`);
    }

    /* this sets the --page-height property when the script loads */
    pageHeight();

    /* This changes pages height AFTER the user stops resizing the browser. SetTimeout is used here to hold off resetting the page height until after the pages has stopped being resized for half a second. */
    let doneResizing;
    window.addEventListener('resize', function () {
        clearTimeout(doneResizing);
        doneResizing = setTimeout(function () {
            pageHeight();
        }, 500);
    });

    // interface element variables
    const shipSelector = document.querySelector("#selector");
    const ships = document.querySelectorAll('aside ol li a');
    const options = document.querySelectorAll('.option');
    const optionParagraphs = document.querySelectorAll('#selector p');
    const scoreboard = document.querySelector('#scoreboard');
    const send = document.querySelector("#send");
    const mission = document.querySelector('#mission');
    const instructions = document.querySelector('#mission h2');
    const overlayBtns = document.querySelectorAll('.overlay .button');

    // data for the game
    const gameData = {
        answer: [],
        slots: ['open', 'open', 'open', 'open'],
        fullSlots: 0,
        vulcans: 0,
        klingons: 0,
        probes: 10
    }

    /* This funciton sets the random answer for the game, using the
    shuffleArray function defined below, to randomize the array of 
    digits from 0 - 9, then pull out the first four and set that
    as the answer */
    function setAnswer(){
        const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        shuffleArray(digits);
        for( let i=0; i<4; i++){
            gameData.answer.push(digits.shift());
        }
    }

    /* This function uses an updated syntax for the fisher-yates method */
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // sets the answer...
    setAnswer();
    // you can cheat and see the answer in the console, lol.
    console.log(gameData.answer);

    /* This loops through each of the ships and adds an event listener.
    when you click on a ship, it looks for the first open slot in the 
    gameData.slots object array and adds the number of the ship. It also
    puts the image of the ship in the selector interface. If all the 
    slots are filled, and a ship is clicked, the error overlay is shown. */
    for( const eachShip of ships){
        eachShip.addEventListener('click', function(event){
            event.preventDefault();
            switch( true ){
                case gameData.slots[0] == 'open' : 
                    options[0].innerHTML = `<img src="images/${eachShip.id}.png" class="ship">`;
                    optionParagraphs[0].innerHTML = eachShip.id.charAt(4);
                    gameData.slots[0] = parseInt(eachShip.id.charAt(4));
                    break;
                case gameData.slots[1] == 'open' : 
                    options[1].innerHTML = `<img src="images/${eachShip.id}.png" class="ship">`;
                    optionParagraphs[1].innerHTML = eachShip.id.charAt(4);
                    gameData.slots[1] = parseInt(eachShip.id.charAt(4));
                    break;
                case gameData.slots[2] == 'open' : 
                    options[2].innerHTML = `<img src="images/${eachShip.id}.png" class="ship">`;
                    optionParagraphs[2].innerHTML = eachShip.id.charAt(4);
                    gameData.slots[2] = parseInt(eachShip.id.charAt(4));
                    break;
                case gameData.slots[3] == 'open' : 
                    options[3].innerHTML = `<img src="images/${eachShip.id}.png" class="ship">`;
                    optionParagraphs[3].innerHTML = eachShip.id.charAt(4);
                    gameData.slots[3] = parseInt(eachShip.id.charAt(4));
                    break;
                default : document.querySelector('#alert').className = 'overlay showing';
            }
            //console.log(`Adding ${gameData.slots}`);

            /* each click of a ship increments the gameData.fullSlots object.
            when that object has a value of 4 (all slots filled), the button to
            send the probe is shown. */
            gameData.fullSlots++;
            if( gameData.fullSlots == 4 ){
                send.className = 'showing';
            }
        });
    }

    /* if the user changes their mind and wants to remove a ship
    from the selector, they can click it/tap it. This event handler makes that
    possible. This event handler uses "event delegation" to work because
    these images are not on the document when the page loads, this is one 
    method of making sure they get event handlers. Essentially, the event
    handler is on the whole document and fires when you click anything on the page.
    But the if statement checks to see if the thing clicked on is a an element with
    the class of ship, which are the ships in the slector. If it is, then remove
    the ship from the from the interface and set the gameData.slots back to open, where
    that ship was, so a new one can be added. Make sure the send button is hidden
    again. */
    document.addEventListener('click', function(event){
        if(event.target.className == 'ship'){
            const slotNum = (event.target.parentNode.id.charAt(6))-1;
            gameData.slots[ slotNum ] = 'open';
            event.target.remove();
            optionParagraphs[slotNum].innerHTML ='';
            gameData.fullSlots--;
            // hide the send button...
            send.className = 'hidden';
            //console.log(`Removing ${gameData.slots}`);
        }
    });

    /* clicking the send button runs threee functions... */
    send.addEventListener('click', function(event){
        event.preventDefault();
        createScoreMarkup();
        getProbeData();
        resetInterface();
    });

    /* The third of these three functions resets the interface,
    clearing out the selector of ships, hiding the send button
    and then checking to see if this combination of ships matches
    the answer in the gameData object. */
    function resetInterface(){
        for( const eachOption of options ){
            eachOption.innerHTML ='';
        }
        for( const eachP of optionParagraphs){
            eachP.innerHTML = '';
        }
        send.className = 'hidden';
        checkWinningCondition();
    }

    /* This first function to run creates the markup that shows 
    below the selector when the button is clicked. */
    function createScoreMarkup(){
        // clone the selected ships html
        const cloned = shipSelector.cloneNode(true);
        //create a div and give it an ID equal to the number of probes used
        const score = document.createElement('div');
        score.id = `score${10 - (gameData.probes-1)}`;
        //give it a class name
        score.className = 'score';
        /* create a paragraph and set the inner text to the
        number of probes used and give it a class name. */
        const probeNum = document.createElement('p');
        probeNum.innerText = 10 - (gameData.probes-1);
        probeNum.className = 'probenum';
        // create a div to hold the vulcan and klingon heads and give it a class name
        const heads = document.createElement('div');
        heads.className = 'heads';
        // Put all these elements together inside the score element.
        score.append(probeNum);
        score.append(cloned);
        score.append(heads);
        //prepend the score element to the top of the div
        scoreboard.prepend(score);
        /* Remove ID's and classes from these elements. Id's need to be
        removed or you end up with duplicate IDs. The 'ship' class needs
        to be removed or the event delegation event listener above will
        make it possible to click those and remove them fromm the interface. */
        const scoreDivs = document.querySelectorAll('.score:first-of-type div');
        const scorePs = document.querySelectorAll('.score:first-of-type p');
        const scoreImgs = document.querySelectorAll('.score:first-of-type img');
        for( const eachDiv of scoreDivs){
            eachDiv.removeAttribute('id');
        }
        for( const eachP of scorePs){
            eachP.removeAttribute('id');
        }
        for( const eachImg of scoreImgs){
            eachImg.removeAttribute('class');
        }
    }

    /* This is the second function to run and it compares the 
    numbers sent to the answer to see what the matches are. */
    function getProbeData(){
        const guess = gameData.slots;
        const answerCheck = gameData.answer;
        // loop through the game data slots
        for( let i=0; i<guess.length; i++){
           /*  If the number in the slot matches the number in the
           answer, then increment the vulcan heads. */
            if(guess[i] == answerCheck[i]){
                gameData.vulcans++;
            }
            /* If it doesn't match the slot check all the slots to see if the 
            number matches one of the other slots. If it does, increment the
            Klingon heads. */
            else {
                for( let j=0; j<answerCheck.length; j++){
                    if(guess[i] == answerCheck[j]){
                        gameData.klingons++;
                    }
                }
            }
        }
        //console.log(`# of vulcans: ${gameData.vulcans} # of klingons: ${gameData.klingons}`);

        /* This section of the function checks to see if there are any vulcan or
        klingon heads to display with this guess. If there are, add them to the
        HTML created for this in the function above.*/
        const v = gameData.vulcans;
        const k = gameData.klingons;
        const scoreId = `score${10 - (gameData.probes-1)}`;

        if ( v ){
            for( let i=0; i < v; i++ ){
                document.querySelector(`#${scoreId} .heads`).innerHTML += '<img src="images/head1.png">';
            }
        }
        if ( k ){
            for( let i=0; i < k; i++ ){
                document.querySelector(`#${scoreId} .heads`).innerHTML += '<img src="images/head0.png">';
            }
        }
    }

    /* This function runs each time a guess is made and checks to see
    if the guess matches the answer, which is determined by seeing if there
    are four vulcan heads. If so, show the winning overlay. If the user has used 
    the last probe, show the losing game overlay. In any case, reduce the
    number of probes, update the text showing how many probes are left and
    reset gameData variables so that the game is ready for the next guess. */
    function checkWinningCondition(){
        if( gameData.vulcans == 4){
            document.querySelector('#success').className = 'overlay showing';
        } else if( gameData.probes == 1) {
            document.querySelector('#failure').className = 'overlay showing';
        }
        gameData.probes--;
        document.querySelector('#probes p:nth-child(2)').innerText = gameData.probes;
        gameData.slots = ['open', 'open', 'open', 'open'];
        gameData.fullSlots = 0;
        gameData.vulcans = 0;
        gameData.klingons = 0;
    }

    /* this just moves the game instructions down 5 seconds after
    the page loads. */
    setTimeout(function(){
        mission.className = 'down';
    }, 5000);

    /* This shows and hides the game instructions */
    instructions.addEventListener('click', function(){
        if( mission.className == 'up' ){
            mission.className = 'down';
        } else {
            mission.className = 'up';
        }
    });

    /* This closes the overlays, once they are open and, in the
    case of winning or losing the game, restarts the game. */
    for( const eachBtn of overlayBtns ){
        eachBtn.addEventListener('click', function(event){
            event.preventDefault();
            event.target.parentNode.className = 'overlay hidden';
            if(event.target.classList.contains('restart')){
                setTimeout(function(){
                    location.reload();
                }, 3000);
            }
        });
    }
})();