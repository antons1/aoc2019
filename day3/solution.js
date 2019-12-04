const input = require('./testinput.json');
const fs = require('fs');

const realInput = fs.readFileSync('./input.txt', { encoding: 'utf8' });
input.push({ input: realInput, result: "x" })

function translateInputString(inputString) {
    return inputString.split("\n").map((line) =>
        line.split(",").map((instruction) => {
            const regexes = instruction.match(/(.)(\d*)/);
            return {direction: regexes[1], length: parseInt(regexes[2])}
        }))
}

function getAllCoords(instructionLine) {
    let x = 0;
    let y = 0;

    return instructionLine.map((instruction) => {
        const coords = [];
        for(let i = 1; i <= instruction.length; i++) {
            switch(instruction.direction) {
                case "U": coords.push(`${x},${++y}`); break;
                case "D": coords.push(`${x},${--y}`); break;
                case "R": coords.push(`${++x},${y}`); break;
                case "L": coords.push(`${--x},${y}`); break;
            }
            //console.log(`Direction ${instruction.direction}, length ${instruction.length} => ${x},${y}`)
        }
        return coords;
    }).reduce((acc, curr) => acc.concat(curr));
}

function getLowestCollision(collisions) {
    let manhattans = collisions.map(({coord, length}) => {
        const match = coord.match(/(-?\d*),(-?\d*)/);
        const [ _, x, y ] = match;
        return Math.abs(parseInt(x)) + Math.abs(parseInt(y));
    }).sort((a, b) => a-b);
    return { manhattans, lowest: manhattans[0] }
}

function doInstructionSet({input, result, length}) {
    const parsedInput = translateInputString(input);
    const coords = getAllCoords(parsedInput[0]);
    const coords2 = getAllCoords(parsedInput[1]);
    const collisions = [];
    coords.forEach((coord, index) => {
        const collision = coords2.indexOf(coord);
        if(collision !== -1) {
            collisions.push({ coord, length: index + collision + 2});
        }
    })
    const {manhattans, lowest} = getLowestCollision(collisions);
    const {coords: shortestDistanceCoords, length: shortestDistance } = collisions.sort((a, b) => a.length - b.length)[0];
    //console.log(coords);
    //console.log(coords2)
    console.log(collisions.sort((a, b) => a.length - b.length));
    //console.log(manhattans);
    console.log(`${result} ? => ${lowest} && ${length} ? => ${shortestDistance}`);
}

input.forEach(doInstructionSet);