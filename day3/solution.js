const input = require('./testinput.json');

function translateInputString(inputString) {
    return inputString.split("\n").map((line) =>
        line.split(",").map((instruction) => {
            const spInst = instruction.split("");
            const direction = spInst.shift();
            const length = parseInt(spInst.join());
            return {direction, length}
        }))
}

function setGrid(grid, {x, y}) {
    const portx = Math.round(x/2);
    const porty = Math.round(y/2);
    for(let i = 0; i < y; i++) {
        grid[i] = new Array(x);
    }

    grid[porty][portx] = "o";

    return {grid, portx, porty};
}

function getGridSizeRequirement(input) {
    return input.reduce((acc, line) => acc.concat(line), []).reduce((acc, {direction, length}) => {
        switch(direction) {
            case "U": case "D": acc.y += length; break;
            case "R": case "L": acc.x += length; break;
        }
        return acc;
    }, {x: 0, y: 0});
}

function drawYLength(grid, from, to, x) {
    for(let i = from; i <= to; i++) {
        grid[i][x] = "|";
    }
}

function drawXLength(grid, from, to, y) {
    for(let i = from; i <= to; i++) {
        grid[y][i] = "-";
    }
}

function drawInstruction(grid, currentX, currentY, {direction, length}) {
    switch(direction) {
        case "U": drawYLength(grid, currentY, currentY+length, currentX); break;
        case "D": drawYLength(grid, currentY-length, currentY, currentX); break;
        case "R": drawXLength(grid, currentX, currentX+length, currentY); break;
        case "L": drawXLength(grid, currentX-length, currentX, currentY); break;
    }
}

function getNewCurrentXY(currentX, currentY, {direction, length}) {
    switch(direction) {
        case "U": return { y: currentY+length, x: currentX };
        case "D": return { y: currentY-length, x: currentX };
        case "R": return { y: currentY, x: currentX+length };
        case "L": return { y: currentY, x: currentX-length };
        default: throw new Error(`Unknown instruction ${direction} of length ${length}`);
    }
}

function drawInstructions(grid, portX, portY, instructions) {
    let currentX = portX;
    let currentY = portY;

    while(instructions.length > 0) {
        let instruction = instructions.shift();
        drawInstruction(grid, currentX, currentY, instruction);
        let {x, y} = getNewCurrentXY(currentX, currentY, instruction);
        currentX = x;
        currentY = y;
    }
} 

function printGrid(grid) {
    for(let i = 0; i < grid.length; i++) {
        let row = "";
        for(let j = 0; j < grid[i].length; j++) {
            row += grid[i][j] === null || grid[i][j] === undefined ? "." : grid[i][j];
        }
        console.log(row);
    }
}


const inp = translateInputString(input[0].input);
const req = getGridSizeRequirement(inp);
const {grid, portx, porty} = setGrid([], req);
console.log(inp, req, portx, porty);
printGrid(grid);
inp.forEach((instLine) => drawInstructions(grid, portx, porty, instLine));
printGrid(grid);