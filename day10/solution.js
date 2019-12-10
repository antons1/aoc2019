const input = `.#..##.###...#######
##.############..##.
.#.######.########.#
.###.#######.####.#.
#####.##.#.##.###.##
..#####..#.#########
####################
#.####....###.#.#.##
##.#################
#####.##.###..####..
..######..##.#######
####.##.####...##..#
.#####..#.######.###
##...#.##########...
#.##########.#######
.####.#.###.###.#.##
....##.##.###..#####
.#.#.###########.###
#.#.#.#####.####.###
###.##.####.##.#..##`;

const parsedInput = input.split("\n").map((l) => l.split(""));
//console.log(parsedInput);

function checkLosPattern(map, xJump, yJump, xFrom, yFrom) {
    //console.log("Checking", xFrom + xJump, yFrom + yJump)
    if(map.length-1 < yFrom + yJump || map[0].length-1 < xFrom + xJump || yFrom + yJump < 0 || xFrom + xJump < 0) return 0;
    else if(map[yFrom + yJump][xFrom + xJump] === "#" || Number.isInteger(map[yFrom + yJump][xFrom + xJump])) {
        //console.log("Detected sight at", xFrom + xJump, yFrom + yJump, "checking pattern", xJump, yJump);
        return 1;
    }
    else return checkLosPattern(map, xJump, yJump, xFrom + xJump, yFrom + yJump);
}

function vaporizeAsteroidAtLos(map, xJump, yJump, xFrom, yFrom) {
    //console.log("Checking", xFrom + xJump, yFrom + yJump)
    if(map.length-1 < yFrom + yJump || map[0].length-1 < xFrom + xJump || yFrom + yJump < 0 || xFrom + xJump < 0) return 0;
    else if(map[yFrom + yJump][xFrom + xJump] === "#") {
        //console.log("Detected sight at", xFrom + xJump, yFrom + yJump, "checking pattern", xJump, yJump);
        map[yFrom + yJump][xFrom + xJump] = ".";
        return {dy: yFrom + yJump, dx: xFrom + xJump, val: 1 };
    } else return {dy: yFrom + yJump, dx: xFrom + xJump, val: 1 };
}

function vaporizeArea(map, fromX, fromY, toX, toY, pointX, pointY) {
    let loses = 0;
    let checkedDiffs = {};

    for(let y = fromY; Math.abs(y) < Math.abs(toY); fromY > toY ? y-- : y++) {
        for(let x = fromX; Math.abs(x) < Math.abs(toX); fromX > toX ? x-- : x++) {
            if(y === x && y !== 1) continue;
            else if(x === 0 && y !== 1) continue;
            else if(y === 0 && x !== 1) continue;
            
            const diff = x/y;
            if(checkedDiffs[diff]) continue;
            else checkedDiffs[diff] = true;

            const {dx, dy, val} = vaporizeAsteroidAtLos(map, x, y, pointX, pointY);
            if(val > 0) {
                loses++;
                if(loses === 1) console.log("Deleted 1st at ", dx, dy);
            }
        }
    }

    return loses;
}

function vaporizeAsteroids(map, pointX, pointY) {
    const xMax = map[0].length;
    const yMax = map.length;
    let loses = 0;
    let checkedDiffs = {};

    loses += vaporizeArea(map, 0, 0, xMax, (yMax * -1), pointX, pointY);
    loses += vaporizeArea(map, 0, 0, xMax, yMax, pointX, pointY);
    loses += vaporizeArea(map, 0, 0, (xMax * -1), yMax, pointX, pointY);
    loses += vaporizeArea(map, 0, 0, (xMax * -1), (yMax * -1), pointX, pointY);

    return loses;
}

function checkLosForPoint(map, pointX, pointY) {
    const xMax = map[0].length;
    const yMax = map.length;
    let loses = 0;
    const checkedDiffs = {};

    for(let y = 0; y < yMax; y++) {
        for(let x = 0; x < xMax; x++) {
            if(y === x && y !== 1) continue;
            else if(x === 0 && y !== 1) continue;
            else if(y === 0 && x !== 1) continue;
            
            const diff = x/y;
            if(checkedDiffs[diff]) continue;
            else checkedDiffs[diff] = true;

            loses += checkLosPattern(map, x, y, pointX, pointY);
            if(x !== 0) loses += checkLosPattern(map, x * -1, y, pointX, pointY);
            if(y !== 0) loses += checkLosPattern(map, x, y * -1, pointX, pointY);
            if(x !== 0 && y !== 0) loses += checkLosPattern(map, x * -1, y * -1, pointX, pointY);
        }
    }

    return loses;
}

console.log(vaporizeAsteroids(parsedInput, 11, 13));

const losMap = parsedInput.map((line, y) => line.map((point, x) => point === "#" ? checkLosForPoint(parsedInput, x, y) : point));
const highest = losMap.reduce((highest, currentLine, y) => 
    currentLine.reduce((currentHighest, currentPoint, x) => {
        if(currentPoint > currentHighest.val) return { val: currentPoint, x, y };
        else return currentHighest;
    }, highest), { val: -1, x: -1, y: -1 })

//console.log(losMap);
//console.log(highest);