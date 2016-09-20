var life = {

	grid: document.getElementById('grid'),

	generations: [],

	checkRules: function() {
		var deadCells = 0,
			countRows = this.grid.rows.length,
			countCellsInRow = this.grid.rows[0].cells.length,
			countCells = countRows * countCellsInRow;

		for (var i = 0; i <= countRows-1; i++) {
			for (var j = 0; j <= countCellsInRow-1; j++) {
				
				// Текущая клетка
				var cell = this.grid.rows[i].cells[j]; 

				// Получение численного значения соседей клетки
				var neighbors = cell.getAttribute('data-neibors');
				neighbors = parseInt(neighbors,10);

				// Проверка правил игры
				if ((cell.getAttribute('data-existence') == 'true') && (neighbors < 2) || (neighbors > 3)) {
					cell.setAttribute('data-existence', 'false');

				} else if ((neighbors == 3) && (cell.getAttribute('data-existence') == 'false')) {
					cell.setAttribute('data-existence', 'true');

				} else if ((cell.getAttribute('data-existence') == 'true') && (neighbors == 2) || (neighbors == 3) ) {
					cell.setAttribute('data-existence', 'true');

				} else if (cell.getAttribute('data-existence') == 'false') deadCells++;
			};
			
		};

		if (countCells == deadCells) return false;

		return true;
	},

	checkNeighbors: function() {

		var neighbors;

		// Получение количества соседей текущей клетки
		function getNeighbors(grid, row, cell) {
			var prevRow, prevCell,
				nextRow, nextCell,
				neighbors = [];

			// Поле представляет из себя бесконечную сетку
			prevRow = (row-1 < 0) ? grid.rows.length-1 : row-1;
			nextRow = (row+1 > grid.rows.length-1) ? 0 : row+1;

			prevCell = (cell-1 < 0) ? grid.rows[row].cells.length-1 : cell-1;
			nextCell = (cell+1 > grid.rows[row].cells.length-1) ? 0 : cell+1;

			neighbors.push(grid.rows[prevRow].cells[prevCell]);
			neighbors.push(grid.rows[prevRow].cells[cell]);
			neighbors.push(grid.rows[prevRow].cells[nextCell]);
			neighbors.push(grid.rows[row].cells[prevCell]);
			neighbors.push(grid.rows[row].cells[nextCell]);
			neighbors.push(grid.rows[nextRow].cells[prevCell]);
			neighbors.push(grid.rows[nextRow].cells[cell]);
			neighbors.push(grid.rows[nextRow].cells[nextCell]);

			var neighborsCount = 0;
			for (var i = 0; i < neighbors.length; i++) {
				if (neighbors[i].className == 'live') neighborsCount++;
			};

			return neighborsCount;
		}

		// Запоминание количества соседей для каждой клетки
		for (var i = 0; i <= this.grid.rows.length - 1; i++) {
			for (var j = 0; j <= this.grid.rows[i].cells.length - 1; j++) {
				neighbors = getNeighbors(this.grid, i, j);
				this.grid.rows[i].cells[j].setAttribute('data-neibors',neighbors);
			};
		};
	},

	createNewGeneration: function() {
		// На основе анализа текущего пололения клеток создаем новое поколение
		for (var i = 0; i <= this.grid.rows.length - 1; i++) {
			for (var j = 0; j <= this.grid.rows[i].cells.length - 1; j++) {

				if (this.grid.rows[i].cells[j].getAttribute('data-existence') == 'true') {
					this.grid.rows[i].cells[j].className = 'live';
				} else {
					this.grid.rows[i].cells[j].className = '';
				}
			};
		};
	},

	addGenerationStatistics: function() {
		// Занести данные текущего поколенияв массив
		var countLivingCells = 0;
		for (var i = 0; i <= this.grid.rows.length - 1; i++) {
			for (var j = 0; j <= this.grid.rows[i].cells.length - 1; j++) {

				if (this.grid.rows[i].cells[j].getAttribute('data-existence') == 'true') countLivingCells++;
			};
		};
		this.generations.push(countLivingCells);
	}
}


document.addEventListener('click', function(e) {
	if (e.target.nodeName == 'TD') {
		if (e.target.className == 'live') {
			e.target.setAttribute('data-existence', 'false');
			e.target.className = '';
		} else {
			e.target.className = 'live';
			e.target.setAttribute('data-existence', 'true');
		}
		
	};
});

document.getElementById('grid').addEventListener('mousedown', addMousemoveListener);

document.getElementById('grid').addEventListener('mouseup',function() {
	this.removeEventListener('mousemove',addLiveCell);
});

var c_out = document.getElementById('console_output');
var c_in = document.getElementById('console_input');

c_in.addEventListener('keypress', function(e) {
	if (e.keyCode == 13) {
		c.write('>> ' + c_in.value);
		if (c.commands[c_in.value]) {
			c.commands[c_in.value]();
		} else {
			c.write('Комманда не известна');
		}
		c_in.value = '';
	};
});
var c = {

	helpDescription: [
		'Реализация клеточного автомата "Жизнь"',
		'Установите некоторое количество живых клеток с помощью мышки в поле слева',
		'help - Вызов справки',
		'start - Запуск игры',
		'step - Выполнение одного цикла игры',
		'stop - Остановка игры',
		'clearGrid - Очистить поле'
		],

	write: function(text) {
		c_out.value += '\n';
		c_out.value += text;
		c_out.scrollTop = c_out.scrollHeight;
	},

	commands: {

		start: function() {
			life.generations = [];
			document.getElementById('grid').removeEventListener('mousedown', addMousemoveListener);
			this.timer = setInterval(this.step, 100);
		},

		step: function() {
			life.addGenerationStatistics();
			life.checkNeighbors();

			if ( !life.checkRules() ) {
				c.commands.stop();				
			}
			life.createNewGeneration();
		},

		stop: function() {
			if (this.timer) { 
			clearInterval(this.timer);
			this.timer = null;
			c.write('Количество поколений:' + life.generations.length);
			c.write('Живых клеток в последнем поколении:' + life.generations[life.generations.length-1]);
			document.getElementById('grid').addEventListener('mousedown', addMousemoveListener);
			}
		},

		help: function() {
			for (var i = 0; i < c.helpDescription.length; i++) {
				c.write(c.helpDescription[i]);
			};

		},

		sm_grid: function() {
			var rows = 20,
				cells = 20;

			life.grid.innerHTML = '';
			var row = document.createElement('tr');
			for (var i = 0; i < cells; i++) {
				var cell = row.insertCell(-1);
				cell.setAttribute('data-existence', 'false');
			};
			for (var i = 0; i < rows; i++) {
				life.grid.appendChild(row.cloneNode(true));
			};
		},

		md_grid: function() {
			var rows = 30,
				cells = 30;

			life.grid.innerHTML = '';
			var row = document.createElement('tr');
			for (var i = 0; i < cells; i++) {
				var cell = row.insertCell(-1);
				cell.setAttribute('data-existence', 'false');
			};
			for (var i = 0; i < rows; i++) {
				life.grid.appendChild(row.cloneNode(true));
			};
		},

		lg_grid: function() {
			var rows = 40,
				cells = 40;

			life.grid.innerHTML = '';
			var row = document.createElement('tr');
			for (var i = 0; i < cells; i++) {
				var cell = row.insertCell(-1);
				cell.setAttribute('data-existence', 'false');
			};
			for (var i = 0; i < rows; i++) {
				life.grid.appendChild(row.cloneNode(true));
			};
		},

		setGrid: function(rows, cells) {
			var rows = rows || prompt('Количество строк');

			if (!rows) return;
			var cells = cells || prompt('Количество ячеек');

			if (!cells) return;
			life.grid.innerHTML = '';
			var row = document.createElement('tr');
			for (var i = 0; i < cells; i++) {
				var cell = row.insertCell(-1);
				cell.setAttribute('data-existence', 'false');
			};
			for (var i = 0; i < rows; i++) {
				life.grid.appendChild(row.cloneNode(true));
			};
		},

		clearGrid: function() {
			for (var i = 0; i < life.grid.rows.length; i++) {
				for (var j = 0; j < life.grid.rows[i].cells.length; j++) {

					if (life.grid.rows[i].cells[j].className) {
						life.grid.rows[i].cells[j].className = '';
					} 
				};
			};
		},

		fullGridRandom: function() {
			var rows = life.grid.rows.length-1;
			var cells = life.grid.rows[0].cells.length-1;

			var randomCountCells = Math.floor(Math.random() * (rows - cells + 1)) + cells;

			for (var i = 0; i < randomCountCells; i++) {
				var rowIndex = Math.floor(Math.random() * rows);
				var cellIndex = Math.floor(Math.random() * cells);
				life.grid.rows[rowIndex].cells[cellIndex].setAttribute('data-existence', 'true');
				life.grid.rows[rowIndex].cells[cellIndex].className = 'live';
			};
		}
	}
}

function addLiveCell(e) {
	if (e.target.nodeName == 'TD') {
	e.target.className = 'live';
	e.target.setAttribute('data-existence', 'true');
	};
}

function addMousemoveListener() {
	this.addEventListener('mousemove',addLiveCell);
}


document.getElementById("small_size").addEventListener("click", checkSize);
document.getElementById("medium_size").addEventListener("click", checkSize);
document.getElementById("large_size").addEventListener("click", checkSize);

function checkSize(e) {
	document.getElementsByClassName("grid-size-option")[0].getElementsByClassName("size-option-checked")[0].className = "";
	e.target.className = e.target.className + "size-option-checked";

	switch	(e.target.id) {
		case "small_size": c.commands.setGrid(20,20);
		break;
		case "medium_size": c.commands.setGrid(30,30);
		break;
		case "large_size": c.commands.setGrid(40,40);
		break;
	}
}

var ctrl_menu = document.getElementById("ctrl_menu");

for (var i = ctrl_menu.children.length - 1; i >= 0; i--) {
	ctrl_menu.children[i].addEventListener("click",function(e) {
		c.commands[e.target.id]();
	});
};

c.commands.setGrid(20,20);

