// elements constants

const start_screen = document.getElementById('start_screen');
const game_screen = document.getElementById('game_screen');

const player1 = document.getElementById('player1');
const player2 = document.getElementById('player2');


const config_color1 = document.getElementById('config_color1');
const config_color2 = document.getElementById('config_color2');
const btn_config_player1_icon = document.getElementById('btn_config_player1_icon');
const btn_config_player2_icon = document.getElementById('btn_config_player2_icon');
const config_icons_list = document.getElementById('config_icons_list');

const config_size_w = document.getElementById('config_size_w');
const config_size_h = document.getElementById('config_size_h');
const config_count = document.getElementById('config_count');
const text_size_w = document.getElementById('size_w');
const text_size_h = document.getElementById('size_h');
const text_count = document.getElementById('count_in_row');

const game_field = document.querySelector('.game-field');
const game_number = document.getElementById('game_number');
const game_text = document.getElementById('game_text');

// variables

let current_config_icon = '';

let color1 = default_color1;
let color2 = default_color2;
let icon1 = default_icon1;
let icon2 = default_icon2;
let size_w = default_size_w;
let size_h = default_size_h;
let count_in_row = default_count_in_row;

let new_color1 = default_color1;
let new_color2 = default_color2;
let new_icon1 = default_icon1;
let new_icon2 = default_icon2;
let new_size_w = default_size_w;
let new_size_h = default_size_h;
let new_count_in_row = default_count_in_row;

let game_matrix = [];
let games_count = 1;
let whose_step = 1;
let whose_step_first = 1;

let win_array = [];
let win_type = '';

// functions

const updateConfig = () => { // set values on start screen
	document.documentElement.style.setProperty('--icon1', 'url(' + icon1 + ')');
	document.documentElement.style.setProperty('--icon2', 'url(' + icon2 + ')');
	document.documentElement.style.setProperty('--color1', color1);
	document.documentElement.style.setProperty('--color2', color2);

	text_size_w.innerText = size_w;
	text_size_h.innerText = size_h;
	text_count.innerText = count_in_row;
};

const setLimits = () => { // set limits on config screen
	config_size_w.setAttribute('max', size_limit);
	config_size_h.setAttribute('max', size_limit);
	config_count.setAttribute('max', Math.min(count_limit, config_size_h.value, config_size_w.value));
	config_size_w.setAttribute('min', 3);
	config_size_h.setAttribute('min', 3);
	config_count.setAttribute('min', 3);
	// установить дополнительные лимиты: размеры не могут быть меньше ряда, ряд не может быть больше размеров
};

const genIconsList = () => { // generate icons list on config screen
	let icon_item;
	ICONS.forEach((icon_url, index) => {
		icon_item = document.createElement('button');
		icon_item.value = icon_url;
		icon_item.style.setProperty('--icon1', 'url(' + icon_url + ')');
		icon_item.classList.add('player-icon');
		config_icons_list.querySelector('form').appendChild(icon_item);
	});
};

const calcSteps = () => {
	let steps = (size_w*size_h)/2;
	//console.log(steps);
	if(steps != Math.floor(steps)) {
		document.getElementById(`player${whose_step_first}_step`).innerText = Math.floor(steps) + 1;
	}
	else{
		document.getElementById(`player${whose_step_first}_step`).innerText = steps;
	}
	if(whose_step_first == 1) {
		document.getElementById('player2_step').innerText = Math.floor(steps);
	}
	else{
		document.getElementById('player1_step').innerText = Math.floor(steps);
	}
};

const createGameMatrix = () => {
	game_matrix = [];
	game_matrix = [...Array(size_h)].map(e => Array(size_w).fill(0));
	//console.log(game_matrix);
};

const createGameField = () => {
	let row, square, i, j; 
	
	game_field.innerHTML = '';
	for (i = 0; i < size_h; i++){
		row = document.createElement('div');
		row.classList.add('game-row');
		for(j = 0; j < size_w; j++){
			square = document.createElement('div');
			square.id = i + ':' + j;
			square.classList.add('game-box');
			square.classList.add('free');
			row.appendChild(square);
			square.ondrop = (event) => drop(event);
			square.ondragover = (event) => allowDrop(event);

		};
		game_field.appendChild(row);
	};

	/*document.querySelectorAll('.game-box').forEach((box) => {
		box.addEventListener('dropover',function(event) {allowDrop(event);});
		box.addEventListener('drop',function(event) {drop(event);});
	});*/
};

/*const toggleStep = () => {
	return whose_step==1?2:1;
}*/

const init = () => { // initial game preparation
	setLimits();
	genIconsList();
	updateConfig();
};

init();

const calcBorder = (i,j) =>{
	return {start_i : i-count_in_row+1<0?0:i-count_in_row+1,
		end_i : i+count_in_row>=size_w?size_w-1:i+count_in_row-1,
		start_j : j-count_in_row+1<0?0:j-count_in_row+1,
		end_j : j+count_in_row>size_h?size_h-1:j+count_in_row-1}
};

const checkRow = (cur_i,cur_j,check_borders) => {
	//проверяем строки
	let lmax = check_borders.end_j - check_borders.start_j - count_in_row + 2;
	let row = new Set();
	//console.log('Check rows. lmax = ' + check_borders.end_j + ' - ' + check_borders.start_j + ' - ' + count_in_row + ' + 2 =' + lmax);
	for( let l = 0; l < lmax;l++){
		for(let k=0;k< count_in_row;k++){
			//console.log('l = ' + l + ', k = ' + k);
			//console.log('game_martix[' + cur_i + ']['+ (check_borders.start_j + l + k) +'] =' + game_matrix[cur_i][check_borders.start_j + l + k])
			row.add(game_matrix[cur_i][check_borders.start_j + l + k]);
			win_array.push(cur_i + ':' + (check_borders.start_j + l + k));
		}
		//console.table(row);
		if(row.size == 1) {
			win_type = 'win-row';
			return true;
		}
		row.clear();
		win_array = [];
	}
	row.clear();
	win_array = [];
	return false;
};

const checkColumn = (cur_i,cur_j,check_borders) => {
	//проверяем столбцы
	let lmax = check_borders.end_i - check_borders.start_i - count_in_row + 2;
	let column = new Set();
	for( let l = 0; l < lmax;l++){
		for(let k=0;k<count_in_row;k++){
			column.add(game_matrix[check_borders.start_i + l + k][cur_j]);
			win_array.push((check_borders.start_i + l + k) + ':' + cur_j);
		}
		//console.table(column);
		if(column.size == 1) {
			win_type = 'win-column';
			return true;
		}
		column.clear();
		win_array = [];
	}
	column.clear();
	win_array = [];
	return false;
};

const checkDiagonal = (cur_i,cur_j,check_borders) => {
	//проверяем диагональ = обратный слэш
	let r = Math.min(cur_i - check_borders.start_i, cur_j - check_borders.start_j);
	let lmax = Math.min(check_borders.end_i - cur_i + r - count_in_row + 2, check_borders.end_j - cur_j + r - count_in_row + 2);
	
	let diagonal = new Set();
	for( let l = 0; l < lmax;l++){
		
		for(let k = 0;k<count_in_row;k++){
			diagonal.add(game_matrix[cur_i - r + l + k][cur_j - r + l + k]);
			win_array.push((cur_i - r + l + k) + ':' + (cur_j - r + l + k));
		}
		//console.table(diagonal);
		if(diagonal.size == 1) {
			win_type = 'win-diagonal';
			return true;
		}
		diagonal.clear();
		win_array = [];
	}
	diagonal.clear();
	win_array = [];
	return false;
};

const checkSlash = (cur_i,cur_j,check_borders) => {
	//проверяем диагональ = прямой слэш
	let r = Math.min(cur_i - check_borders.start_i, check_borders.end_j - cur_j);
	let lmax = Math.min(check_borders.end_i - cur_i + r - count_in_row + 2, cur_j - check_borders.start_j + r - count_in_row + 2);
	let slash = new Set();
	for( let l = 0; l < lmax;l++){
		for(let k=0;k<count_in_row;k++){
			slash.add(game_matrix[cur_i - r + l + k][cur_j + r - l - k]);
			win_array.push((cur_i - r + l + k) + ':' + (cur_j + r - l - k));
		}
		//console.table(slash);
		if(slash.size == 1) {
			win_type = 'win-slash';
			return true;
		}
		slash.clear();
		win_array = [];
	}
	slash.clear();
	win_array = [];
	return false;
};

const checkWin = (box_id) => {
	let cur_i = parseInt(box_id.split(':')[0]);
	let cur_j = parseInt(box_id.split(':')[1]);
	game_matrix[cur_i][cur_j] = whose_step;
	//console.log(`${cur_i} и ${cur_j}`);
	let check_borders = calcBorder(cur_i,cur_j);
	//console.log(check_borders);
	//console.table(game_matrix);
	if(checkRow(cur_i, cur_j, check_borders) || checkColumn(cur_i, cur_j, check_borders) || checkDiagonal(cur_i, cur_j, check_borders) || checkSlash(cur_i, cur_j, check_borders)) return true;
	return false;
}

const newGame = (restart = false) => {
	//почистить поле
	let box;
	for(let i = 0; i<size_h; i++){
		for(let j = 0; j<size_w; j++){
			box = document.getElementById(i+':'+j);
			box.innerHTML = '';
			box.classList.remove('win-box');
			box.classList.add('free');
			box.ondrop = (event) => drop(event);
			box.ondragover = (event) => allowDrop(event);
		}
	}
	game_field.className = 'game-field';
	//почистить матрицу
	game_matrix.map(e => e.fill(0));
	//console.table(game_matrix);
	//почистить шаги, первый и следующий ход 
	if(!restart){
		whose_step_first = whose_step_first==1?2:1;
		whose_step = whose_step_first;
		games_count++;
	}else{
		whose_step_first = 1;
		whose_step = 1;
		games_count = 1;
	}
	
	game_number.innerText = `Игра ${games_count}: `;
	game_text.innerText = 'Ходит ' + document.getElementById('player' + whose_step).value;
	calcSteps();
}

//button event listeners

//start screen

document.getElementById('btn_config').addEventListener('click', () => {
	config_color1.value = color1;
	config_color2.value = color2;
	btn_config_player1_icon.style.setProperty('--color1', color1 );
	btn_config_player2_icon.style.setProperty('--color2', color2 );
	btn_config_player1_icon.style.setProperty('--icon1', 'url(' + icon1 + ')' );
	btn_config_player2_icon.style.setProperty('--icon2', 'url(' + icon2 + ')' );
	config_size_w.value = size_w;
	config_size_h.value = size_h;
	config_count.value = count_in_row;
	window.config.showModal();
});

document.getElementById('btn_instruction').addEventListener('click', () => {
	window.instruction.showModal();
});

document.getElementById('btn_instruction_close').addEventListener('click', () => {
	window.instruction.close();
});

document.getElementById('btn_start').addEventListener('click', () => {
	let game_name = document.getElementById('game_name');
	if(size_w == 3 && size_h == 3 && count_in_row == 3){
		game_name.innerText = 'Крестики-нолики';
	}else{
		game_name.innerText = 'Собери ' + count_in_row + ' в ряд';
	}
	document.getElementById('player_name1').innerText = player1.value.trim();
	document.getElementById('player_name2').innerText = player2.value.trim();
	whose_step = 1;
	games_count = 1;
	game_number.innerText = 'Игра 1: ';
	game_text.innerText = 'Ходит ' + player1.value.trim();
	calcSteps();
	createGameField();
	createGameMatrix();

	start_screen.classList.remove('active');
	game_screen.classList.add('active');
});

document.getElementById('btn_icon_swap').addEventListener('click', () => {
	new_icon1 = icon2;
	new_icon2 = icon1;
	new_color1 = color2;
	new_color2 = color1;

	document.documentElement.style.setProperty('--icon1', 'url(' + new_icon1 + ')');
	document.documentElement.style.setProperty('--icon2', 'url(' + new_icon2 + ')');
	document.documentElement.style.setProperty('--color1', new_color1);
	document.documentElement.style.setProperty('--color2', new_color2);

	icon1 = new_icon1;
	icon2 = new_icon2;
	color1 = new_color1;
	color2 = new_color2;
});

//config screen

btn_config_player1_icon.addEventListener('click',()=>{
	current_config_icon = '1';
	config_icons_list.style.setProperty('position-anchor', '--icons-list1' );
	window.config_icons_list.show();
});

btn_config_player2_icon.addEventListener('click',()=>{
	current_config_icon = '2';
	config_icons_list.style.setProperty('position-anchor', '--icons-list2' );
	window.config_icons_list.show();
});

document.getElementById('btn_default').addEventListener('click', () => {
	config_color1.value = default_color1;
	config_color2.value = default_color2;
	btn_config_player1_icon.style.setProperty('--color1', default_color1 );
	btn_config_player2_icon.style.setProperty('--color2', default_color2 );
	btn_config_player1_icon.style.setProperty('--icon1', 'url(' + default_icon1 + ')' );
	btn_config_player2_icon.style.setProperty('--icon2', 'url(' + default_icon2 + ')' );
	config_size_w.value = default_size_w;
	config_size_h.value = default_size_h;
	config_count.value = default_count_in_row;

	new_color1 = default_color1;
	new_color2 = default_color2;
	new_icon1 = default_icon1;
	new_icon2 = default_icon2;
	new_size_w = default_size_w;
	new_size_h = default_size_h;
	new_count_in_row = default_count_in_row;
});

document.getElementById('btn_apply').addEventListener('click', () => {
	color1 = new_color1;
	color2 = new_color2;
	icon1 = new_icon1;
	icon2 = new_icon2;
	size_w = new_size_w;
	size_h = new_size_h;
	count_in_row = new_count_in_row;

	updateConfig();
	window.config.close();
});

document.getElementById('btn_cancel').addEventListener('click', () => window.config.close());

//game screen

document.getElementById('btn_draw').addEventListener('click', () => {
	newGame();
});

document.getElementById('btn_restart').addEventListener('click', () => {
	newGame(true);
	document.getElementById('score1').innerText = 0;
	document.getElementById('score2').innerText = 0;
});

document.getElementById('btn_exit').addEventListener('click', () => {
	game_screen.classList.remove('active');
	start_screen.classList.add('active');
});

document.getElementById('btn_new_game').addEventListener('click', ()=>{
	newGame();
	window.game_result.close();
});

// form elements event listeners

//config screen

config_color1.addEventListener('change', () => {
	new_color1 = config_color1.value;
	btn_config_player1_icon.style.setProperty('--color1',  new_color1);
});

config_color2.addEventListener('change', () => {
	new_color2 = config_color2.value;
	btn_config_player2_icon.style.setProperty('--color2',  new_color2);
});

config_size_w.addEventListener('change', () => {
	new_size_w = Number(config_size_w.value);
	if(config_count.value>new_size_w) {
		config_count.value = new_size_w;
		new_count_in_row = new_size_w;
	}
	config_count.setAttribute('max', Math.min(new_size_h,new_size_w));
});

config_size_h.addEventListener('change', () => {
	new_size_h = Number(config_size_h.value);
	if(config_count.value>new_size_h) {
		config_count.value = new_size_h;
		new_count_in_row = new_size_h;
	}
	config_count.setAttribute('max', Math.min(new_size_h,new_size_w));
});

config_count.addEventListener('change', () => {
	new_count_in_row = Number(config_count.value);
});

// other event listeners
// close icons list
config_icons_list.addEventListener('close',(event)=>{
	switch (current_config_icon) {
	case '1': new_icon1 = event.target.returnValue; break;
	case '2': new_icon2 = event.target.returnValue; break;
	}
	document.getElementById('btn_config_player' + current_config_icon +'_icon').style.setProperty('--icon'+current_config_icon, 'url(' + event.target.returnValue + ')' );
});

// drag and drop

const allowDrop = (event) => {
	
	//console.log('dragover');
	//console.log(event.target);
	//let data = event.dataTrasfer.getData('text');
	if(event.target.classList.contains('free')) event.preventDefault(); 
	
};

const drag = (event) => {
	//console.log(event.target.parentNode.id);
	event.dataTransfer.setData('text',event.target.parentNode.id);
	event.dataTransfer.effectAllowed = "copy";
};

const drop = (event) => {
	
	//console.log('drop');
	//console.log(event.target);
	//console.log(`Чей ход: ${whose_step}`);
	let data = event.dataTransfer.getData('text');
	if(data == `player${whose_step}_box`){

		event.preventDefault();
		//event.stopPropagation();
		let target_cell = event.target;
		let clone = document.querySelector(`#${data} .player-icon`).cloneNode();
		//console.log(clone);
		clone.draggable = false;
		clone.ondragstart='';
		clone.classList.add('player' + whose_step);
		target_cell.appendChild(clone);
		target_cell.classList.remove('free');
		target_cell.ondrop = '';
		target_cell.ondragover='';

		document.getElementById(`player${whose_step}_step`).innerText --;
		
		if(!checkWin(target_cell.id)) {
			// если ничья
			if(document.getElementById('player1_step').innerText == 0 && document.getElementById('player2_step').innerText == 0){
				game_text.innerText = 'Победила дружба!';
				setTimeout(()=>window.game_result.show(),800);
			} else {
				whose_step = whose_step==1?2:1;
				game_text.innerText = 'Ходит ' + document.getElementById('player' + whose_step).value;
			}
		} 
		else {
			//victory
			game_text.innerText = document.getElementById('player' + whose_step).value + ' - победитель!';
			//console.table(win_array);
			for(win_box of win_array) {
				document.getElementById(win_box).classList.add('win-box');
			}
			game_field.classList.add(win_type);
			document.getElementById('score'+ whose_step).innerText ++;
			setTimeout(()=>window.game_result.show(),800);
		}
	};

	
};



