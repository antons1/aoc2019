const input = require('./testinput.json');
const fs = require('fs');

const realInput = fs.readFileSync('./input.txt', { encoding: 'utf8' });
//input.push({ input: realInput, result: "x" })

function translateInputString(inputString) {
    return inputString.split("\n").map((line) =>
        line.split(",").map((instruction) => {
            const regexes = instruction.match(/(.)(\d*)/);
            return {direction: regexes[1], length: parseInt(regexes[2])}
        }))
}

function getCoordsAndCurrentPosition(initX, initY, {direction, length}) {
    switch(direction) {
        case "U": return { from: initY, to: initY + length, y: initY + length, x: initX}
        case "D": return { from: initY - length, to: initY, y: initY - length, x: initX}
        case "R": return { from: initX, to: initX + length, y: initY, x: initX + length}
        case "L": return { from: initX - length, to: initX, y: initY, x: initX - length}
    }
}

function getXCoords(from, to, y) {
    const coords = [];
    for(let i = from; i <= to; i++) coords.push(`${i},${y}`);
    return coords;
}

function getYCoords(from, to, x) {
    const coords = [];
    for(let i = from; i <= to; i++) coords.push(`${x},${i}`);
    return coords;
}

function getAllCoords(instructionLine) {
    let curX = 0;
    let curY = 0;

    return instructionLine.map((instruction) => {
        const {from, to, y, x} = getCoordsAndCurrentPosition(curX, curY, instruction);
        curX = x;
        curY = y;
        switch(instruction.direction) {
            case "U": case "D": return getYCoords(from, to, x);
            case "R": case "L": return getXCoords(from, to, y);
        }
    }).reduce((acc, curr) => acc.concat(curr));
}

function getLowestCollision(collisions) {
    let manhattans = collisions.map((coll) => {
        const match = coll.match(/(-?\d*),(-?\d*)/);
        const [ _, x, y ] = match;
        return Math.abs(parseInt(x)) + Math.abs(parseInt(y));
    }).sort((a, b) => parseInt(a) > parseInt(b));
    return { manhattans, lowest: manhattans[0] }
}

function doInstructionSet({input, result}) {
    const parsedInput = translateInputString(input);
    const coords = getAllCoords(parsedInput[0]);
    const coords2 = getAllCoords(parsedInput[1]);
    coords.shift();
    coords2.shift();
    const collisions = coords.filter((coord) => -1 !== coords2.indexOf(coord));//getCollisions(parsedInput[1], coords);
    const {manhattans, lowest} = getLowestCollision(collisions);
    //console.log(coords);
    console.log(collisions);
    console.log(manhattans);
    console.log(`${result} ? => ${lowest}`);
}

input.forEach(doInstructionSet);