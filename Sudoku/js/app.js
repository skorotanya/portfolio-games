
document.querySelector('#dark-mode-toggle').addEventListener('click', () => {
	document.body.classList.toggle('dark');
	const isDarkMode = document.body.classList.contains('dark');  
	localStorage.setItem('darkmode', isDarkMode);
	document.querySelector('meta[name="theme-color"').setAttribute('content', isDarkMode ? '#1a1a2e':'#fff');
});

document.querySelector('#hint-toggle').addEventListener('click', (event) => {
	document.body.classList.toggle('hint-on');
	const isHint = document.body.classList.contains('hint-on');
	event.currentTarget.title = isHint ? 'Подсказки включены' : 'Подсказки выключены';
	localStorage.setItem('hint', isHint);
});

// initial values

const inputName = document.querySelector('#input-name')
const startScreen = document.querySelector('#start-screen');
const gameScreen = document.querySelector('#game-screen');
const pauseScreen = document.querySelector('#pause-screen');
const resultScreen = document.querySelector('#result-screen');
const championsScreen = document.querySelector('#champions-screen');


const popup = document.querySelector('#delete-game');
const popupYes = document.querySelector('#btn-yes');
const popupNo = document.querySelector('#btn-no');

const cells = document.querySelectorAll('.main-grid-cell');
const numberInputs = document.querySelectorAll('.number');


const playerNameElem = document.querySelector('#player-name');
const gameLevelElem = document.querySelector('#game-level');
const gameTimeElem = document.querySelector('#game-time');

let levelIndex = 0;
let level = CONSTANT.LEVEL[levelIndex];
let playerName;

let timer = null;
let pause = false;
let seconds = 0;

let hasSavedGame = false;

let sudokuObject = undefined;
let sudokuAnswer = undefined;

let selectedIndex = -1;

let invalidValuesCount = 0;

let champions = undefined;
let championsChanged = true;

// ------



// add space for each 9 cells
const initGameGrid = () => {
	let index = 0;

	for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE,2); i++) {
		let row = Math.floor(i/CONSTANT.GRID_SIZE);
		let col = i % CONSTANT.GRID_SIZE;
		if(row === 2 || row === 5) cells[i].style.marginBottom = '10px';
		if(col === 2 || col === 5) cells[i].style.marginRight = '10px';
	}
}
// ----------

const setPlayerName = (name) => localStorage.setItem('player_name', name);
const getPlayerName = () => localStorage.getItem('player_name');
const removePlayerName = () => localStorage.removeItem('player_name');
const getGameInfo = () => JSON.parse(localStorage.getItem('game'));
const showTime = (seconds) => new Date(seconds*1000).toISOString().substr(11,8);

const showGame = () => {
	// show info
	playerName = inputName.value.trim();
	playerNameElem.innerText = playerName;
	gameLevelElem.innerText = CONSTANT.LEVEL_NAME[levelIndex];
	//showTime(seconds);



	// show sudoku to div
	for (let i = 0;i < Math.pow(CONSTANT.GRID_SIZE,2); i++) {
		let row = Math.floor(i / CONSTANT.GRID_SIZE);
		let col = i % CONSTANT.GRID_SIZE;

		//clear old values
		cells[i].innerText = '';
		cells[i].classList.remove('filled');
		cells[i].classList.remove('selected');
		cells[i].classList.remove('hover');
		cells[i].classList.remove('cell-invalid');

		cells[i].setAttribute('answer-value', sudokuAnswer[row][col]);
		cells[i].setAttribute('original-value', sudokuObject.original[row][col]);

		if(sudokuObject.question[row][col] != 0){
			cells[i].classList.add('filled');
		}
		if(sudokuAnswer[row][col] != 0){
			cells[i].innerText = sudokuAnswer[row][col];
		}

		if(sudokuAnswer[row][col] != 0 && sudokuAnswer[row][col] != sudokuObject.original[row][col]) {
			cells[i].classList.add('cell-invalid');
			invalidValuesCount ++;
		}
	}
}

const initSudoku = () => {
	seconds = 0;
	// generate sudoku pazzle
	sudokuObject = sudokuGen(level);
	sudokuAnswer = [];
	for(let i = 0; i < CONSTANT.GRID_SIZE; i++) sudokuAnswer[i] = [...sudokuObject.question[i]];
	console.table(sudokuObject.original);
	console.table(sudokuAnswer);
	showGame();
}

const loadSudoku = () => {
	let game = getGameInfo();

	sudokuObject = {
		original: game.sudoku.original, 
		question: game.sudoku.question
	};
	sudokuAnswer = game.sudoku.answer;

	console.table(sudokuObject.original);
	console.table(sudokuAnswer);

	seconds = game.seconds;
	levelIndex = game.level;
	//document.querySelector('#btn-level').innerText = 
	showGame();
}

const hoverBg = (index) => {
	let row = Math.floor(index / CONSTANT.GRID_SIZE);
	let col = index % CONSTANT.GRID_SIZE;

	let boxStartRow = row - row % CONSTANT.BOX_SIZE;
	let boxStartCol = col - col % CONSTANT.BOX_SIZE;



	for (let i = 0; i < CONSTANT.BOX_SIZE; i++) {
		for (let j = 0; j < CONSTANT.BOX_SIZE; j++) {
			let cell = cells[CONSTANT.GRID_SIZE * (boxStartRow + i) + (boxStartCol + j)];
			cell.classList.add('hover');
		}
	}

	for(let step = 0; step < CONSTANT.GRID_SIZE; step++){
		cells[col+(CONSTANT.GRID_SIZE*step)].classList.add('hover');
		cells[step+(CONSTANT.GRID_SIZE*row)].classList.add('hover');
	}

}

const resetBg = () => {
	cells.forEach((e) => {
		e.classList.remove('hover');
		e.classList.remove('selected');
	});
}
const removeErr = () => { cells.forEach((e) => e.classList.remove('err'))};

const checkErr = (value) => {

	const addErr = (cell) => {
		if(parseInt(cell.getAttribute('answer-value')) === value) {
			cell.classList.add('err');
			cell.classList.add('cell-err');
			setTimeout(() => {
				cell.classList.remove('cell-err');
			}, 500);
		}
	};

	let index = selectedIndex;

	let row = Math.floor(index / CONSTANT.GRID_SIZE);
	let col = index % CONSTANT.GRID_SIZE;

	let boxStartRow = row - row % CONSTANT.BOX_SIZE;
	let boxStartCol = col - col % CONSTANT.BOX_SIZE;
	let cell;
	removeErr();
	//console.log('check!');
	for (let i = 0; i < CONSTANT.BOX_SIZE; i++) {
		for (let j = 0; j < CONSTANT.BOX_SIZE; j++) {
			cell = cells[CONSTANT.GRID_SIZE * (boxStartRow + i) + (boxStartCol + j)];
			if(!cell.classList.contains('selected')){
				addErr(cell);
			}
		}
	}

	for(let step = 0; step < CONSTANT.GRID_SIZE; step++){
		if(step != row) addErr(cells[col+(CONSTANT.GRID_SIZE*step)]);
		if(step != col) addErr(cells[step+(CONSTANT.GRID_SIZE*row)]);
	}

	cell = cells[selectedIndex];
	if(parseInt(cell.getAttribute('answer-value')) != parseInt(cell.getAttribute('original-value'))){
		if(!cell.classList.contains('cell-invalid')){
			cell.classList.add('cell-invalid');
			invalidValuesCount ++;
		}
	}
	else {
		if(cell.classList.contains('cell-invalid')){
			cell.classList.remove('cell-invalid');
			invalidValuesCount --;
		}
	}
}

const saveGameInfo = () => {
	let game = {
		level: levelIndex,
		seconds: seconds,
		sudoku: {
			original: sudokuObject.original,
			question: sudokuObject.question,
			answer: sudokuAnswer
		}
	}

	localStorage.setItem('game', JSON.stringify(game));
	hasSavedGame = true;
	document.querySelector('#btn-continue').style.display = 'grid';
}

const removeGameInfo = () => {
	localStorage.removeItem('game');
	hasSavedGame = false;
	document.querySelector('#btn-continue').style.display = 'none';
}

const getChampions = () => JSON.parse(localStorage.getItem('champions'));

const saveToChampions = (champion) => {
	//console.log(champion);
	if(getChampions()!=null) {champions = getChampions();}
	else {champions = [[],[],[],[],[],[]];}
	//if(!champions) champions = ;

	//check champion
	let levelChampions = [...champions[champion.level]];
	console.log(levelChampions);
	console.log(levelChampions.length);
	console.log(CONSTANT.CHAMPIONS_COUNT);
	if(levelChampions.length == CONSTANT.CHAMPIONS_COUNT) {
		if(champion.seconds > levelChampions[levelChampions.length-1].seconds){
			return false;
		}
	}
	levelChampions.push(champion);

	if(levelChampions.length > 1) levelChampions.sort((a, b) => a.seconds - b.seconds);
	if(levelChampions.length > CONSTANT.CHAMPIONS_COUNT) levelChampions.pop();
	champions[champion.level] = [...levelChampions];
	console.log(champions);
	localStorage.setItem('champions', JSON.stringify(champions));
	championsChanged = true;
}

const startGame = () => {

	gameTimeElem.innerText = showTime(seconds);
	
	setPlayerName(playerName);

	//gameLevel.innerText = CONSTANT.LEVEL_NAME[levelIndex];

	

	timer = setInterval(()=>{
		if(!pause){
			seconds = seconds + 1;
			gameTimeElem.innerText = showTime(seconds);
		}
	}, 1000);

	startScreen.classList.remove('active');
	gameScreen.classList.add('active');
	pauseScreen.classList.remove('active');  

}

const returnStartScreen = () => {
	clearInterval(timer);
	pause = false;
	seconds = 0;
	startScreen.classList.add('active');
	gameScreen.classList.remove('active');
	pauseScreen.classList.remove('active');  
	resultScreen.classList.remove('active');
}

const getPlayerBestTime = (lvl, nm) => champions[lvl].find(({name})=>name === nm).seconds;

const getChampionBestTime = (lvl) => champions[lvl][0].seconds;

const showResult = () => {
	clearInterval(timer);

	//show result screen
	document.querySelector('#result-time').innerText = 'Ваше время: ' + showTime(seconds);
	if(getChampions() != null) {
		champions = getChampions();
		document.querySelector('#player-best-time').innerText = 'Ваш рекорд: ' + showTime(getPlayerBestTime(levelIndex,playerName));
		document.querySelector('#champion-best-time').innerText = 'Рекорд уровня:' + showTime(getChampionBestTime(levelIndex));
	}
	else {
		document.querySelector('#player-best-time').innerText = 'Ваш рекорд: -';
		document.querySelector('#champion-best-time').innerText = 'Рекорд уровня: -';
	}
	resultScreen.classList.add('active');
	startScreen.classList.remove('active');
	gameScreen.classList.remove('active');
	pauseScreen.classList.remove('active');
	//----
}

// add event button

document.querySelector('#btn-level').addEventListener('click', (e) => {
	//console.log(hasSavedGame);
	if(!hasSavedGame) {
		levelIndex = levelIndex + 1 > CONSTANT.LEVEL.length - 1 ? 0 : levelIndex + 1;
		level =  CONSTANT.LEVEL[levelIndex];
		e.target.innerText = CONSTANT.LEVEL_NAME[levelIndex];
	}
	else {
		popup.classList.add('show');
	}
	
});

document.querySelector('#btn-play').addEventListener('click', ()=>{
	if(inputName.value.trim().length > 0){
		if(!hasSavedGame){
			initSudoku();
			startGame();
		}else{
			popup.classList.add('show');
		}
		
	} else {
		inputName.classList.add('input-err');
		setTimeout(() => {
			inputName.classList.remove('input-err');
			inputName.focus(); 
		}, 500);
	}
});

document.querySelector('#btn-continue').addEventListener('click', ()=>{
	if(inputName.value.trim().length > 0){
		loadSudoku();
		startGame();
	} else {
		inputName.classList.add('input-err');
		setTimeout(() => {
			inputName.classList.remove('input-err');
			inputName.focus(); 
		}, 500);
	}
});

document.querySelector('#btn-pause').addEventListener('click', () => {
	pauseScreen.classList.add('active');
	pause = true;
});

document.querySelector('#btn-resume').addEventListener('click', () => {
	pauseScreen.classList.remove('active');
	pause = false;
});

document.querySelector('#btn-end').addEventListener('click', () => {
	removeGameInfo();
	returnStartScreen();
});

document.querySelector('#btn-exit').addEventListener('click', () => {
	returnStartScreen();
});

document.querySelector('#btn-yes').addEventListener('click', () => {
	removeGameInfo();
	popup.classList.remove('show');
});

document.querySelector('#btn-no').addEventListener('click', () => {
	popup.classList.remove('show');
});

document.querySelector('#btn-restart').addEventListener('click', () => {
	clearInterval(timer);
	seconds = 0;
	pause = false;
	sudokuAnswer = [];
	for(let i = 0; i < CONSTANT.GRID_SIZE; i++) sudokuAnswer[i] = [...sudokuObject.question[i]];
	removeGameInfo();
	showGame();
	removeErr();
	
	startGame();
});

cells.forEach((cell, index) => cell.addEventListener('click', () => {
	
	if(!cell.classList.contains('filled')) {
		resetBg();

		selectedIndex = index;
		hoverBg(index);
		cell.classList.add('selected');
		removeErr();
		//console.log(cell.innerText);
		//checkErr(parseInt(cell.innerText));
		//cell.classList.remove('hover');
		
	}
}) );



numberInputs.forEach((number, index) => number.addEventListener('click', () => {
	let value = index + 1;
	let cell = cells[selectedIndex];
	cell.innerText = value;
	cell.setAttribute('answer-value', value);

	let row = Math.floor(selectedIndex / CONSTANT.GRID_SIZE);
	let col = selectedIndex % CONSTANT.GRID_SIZE;
	sudokuAnswer[row][col] = value;
	// save game
	saveGameInfo();
	//----
	checkErr(value);
	cell.classList.add('zoom-in');
	setTimeout(() => {
		cell.classList.remove('zoom-in');
	}, 500);
	// check game win

	if(isFullGrid(sudokuAnswer) && invalidValuesCount == 0){
		// Win
		let date = new Date().toISOString().substr(0,10);
		let champion = {
			name: playerName,
			level: levelIndex,
			seconds: seconds,
			date: date
		}
		//console.log(champion);
		saveToChampions(champion);
		showResult();
		
		removeGameInfo();
		

	}
	// ----

}) );

document.querySelector('#btn-delete').addEventListener('click', () => {
	if(selectedIndex !=-1) {
		cells[selectedIndex].innerText = '';
		cells[selectedIndex].setAttribute('answer-value', 0);
		let row = Math.floor(selectedIndex / CONSTANT.GRID_SIZE);
		let col = selectedIndex % CONSTANT.GRID_SIZE;
		sudokuAnswer[row][col] = 0;
		saveGameInfo();

		
		if(cells[selectedIndex].classList.contains('cell-invalid')){
			removeErr();
			cells[selectedIndex].classList.remove('cell-invalid');
			invalidValuesCount --;
		}
		
		//console.log('invalidValuesCount: ' + invalidValuesCount);
	}
	
});

const showChampions = () => {
	if(championsChanged){
		champions = getChampions();
		//console.log(champions);
		let table = document.querySelector('#champions-table tbody');
		table.innerHTML = '';
		let group, row;
		for(let i= 0;i<6;i++){
			group = champions[i];
			if(group.length > 0){
				row = document.createElement('tr');
				row.innerHTML = `<th></th><th colspan=3>${CONSTANT.LEVEL_NAME[i]} уровень</th>`;
				table.appendChild(row);
				group.forEach((champion, index) => {
					row = document.createElement('tr');
					row.innerHTML = `<td>${index+1}</td><td>${champion.name}</td><td>${showTime(champion.seconds)}</td><td>${champion.date}</td>`
					table.appendChild(row);
				})
			}
		}
		championsChanged = false;
	}
}

document.querySelector('#btn-champions').addEventListener('click', () => {
	showChampions();
	championsScreen.classList.add('active');
});

document.querySelector('#btn-champions2').addEventListener('click', () => {
	showChampions();
	championsScreen.classList.add('active');
});


document.querySelector('#btn-close').addEventListener('click', () => {
	championsScreen.classList.remove('active');
});

// ---------

const init = () => {
	const darkmode = localStorage.getItem('darkmode');
	//console.log(darkmode);
	if(darkmode==='true') document.body.classList.add('dark');
	document.querySelector('meta[name="theme-color"').setAttribute('content', darkmode==='true' ? '#1a1a2e':'#fff');

	const isHint = localStorage.getItem('hint');
	if(isHint==='true') document.body.classList.add('hint-on');
	document.querySelector('#hint-toggle').setAttribute('title', isHint==='true' ? 'Подсказки включены':'Подсказки выключены');

	const game = getGameInfo();
	document.querySelector('#btn-continue').style.display = game ? 'grid' : 'none';
	hasSavedGame = game ? true : false;
	initGameGrid();

	playerName = getPlayerName();
	//console.log(playerName);
	if(playerName){
		inputName.value = playerName;
	} else {
		inputName.focus();
	}
}

init();