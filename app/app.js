function app() {
    'use strict';

    var seed = location.hash.substr(1) || 'random';


    var seeds = {
        glider: 'https://fletchto99.com/other/pebble/rocky/app/boards/glider.json'
    };
    var interval = null;
    var board = [];

    var buttons = document.getElementsByTagName('button');

    for (var i = 0; i < buttons.length; i++) {
        buttons[i].onclick = function (event) {
            seed = event.target.dataset.seed;
            window.location.hash = seed;
            if (interval != null) {
                clearInterval(interval);
            }
            go();
        };
    }

    var go = function () {
        board = [];
        if (seed == 'random') {
            for (var i = 0; i < 48; i++) {
                var row = [];
                for (var j = 0; j < 48; j++) {
                    row.push(Math.floor(Math.random() * 2));
                }
                board.push(row);
            }
            interval = setInterval(function () {
                rocky.mark_dirty();
            }, 100);
        } else {
            if (seeds[seed] === undefined) {
                console.error('Invalid seed!');
                return;
            }

            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.readyState == 4 && request.status == 200) {
                    var response = JSON.parse(request.responseText);
                    var fill = response.Mode == 'enable';
                    for (var i = 0; i < 48; i++) {
                        var row = [];
                        for (var j = 0; j < 48; j++) {
                            var found = false;
                            response.Points.forEach(function (point) {
                                if (!found && point.y == i && point.x == j) {
                                    row.push(fill ? 1 : 0);
                                    found = true;
                                }
                            });
                            if (!found) {
                                row.push(fill ? 0 : 1);
                            }
                        }
                        board.push(row);
                    }
                    interval = setInterval(function () {
                        rocky.mark_dirty();
                    }, 100);
                }
            };
            request.open("GET", seeds[seed], true);
            request.send();
        }
    };


    /**
     * Some really inefficient way of calculating all of the neighbours
     */
    var countNeighbours = function (x, y, board) {
        var neighbours = [];

        if (board[y - 1]) {
            neighbours.push(board[y - 1][x - 1]);
            neighbours.push(board[y - 1][x]);
            neighbours.push(board[y - 1][x + 1]);
        }

        neighbours.push(board[y][x - 1]);
        neighbours.push(board[y][x + 1]);

        if (board[y + 1]) {
            neighbours.push(board[y + 1][x - 1]);
            neighbours.push(board[y + 1][x]);
            neighbours.push(board[y + 1][x + 1]);
        }

        var filtered = neighbours.filter(function (neighbour) {
            return neighbour !== undefined && neighbour == 1;
        });
        return filtered.length;

    };

    var rocky = Rocky.bindCanvas(document.getElementById("pebble"));
    rocky.export_global_c_symbols();
    rocky.update_proc = function (ctx) {

        var nextGenBoard = board.map(function (arr) {
            return arr.slice();
        });

        for (var row = 0; row < board.length; row++) {
            for (var column = 0; column < board[row].length; column++) {
                board[row][column] == 1 ? graphics_context_set_fill_color(ctx, GColorBlack) : graphics_context_set_fill_color(ctx, GColorWhite);
                graphics_fill_rect(ctx, GRect(column * 3, row * 3, 3, 3));
                var neighbourCount = countNeighbours(column, row, board);
                if (neighbourCount < 2 && board[row][column] === 1) {
                    nextGenBoard[row][column] = 0;
                } else if (neighbourCount > 3 && board[row][column] === 1) {
                    nextGenBoard[row][column] = 0;
                } else if (neighbourCount == 3 && board[row][column] === 0) {
                    nextGenBoard[row][column] = 1;
                }
            }
        }

        board = nextGenBoard;

        graphics_context_set_fill_color(ctx, GColorBlack);
        graphics_draw_line(ctx, GPoint(0, 144), GPoint(144, 144));

    };

    go();
}