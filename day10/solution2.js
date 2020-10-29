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



function vaporizeAsteroidAtLos(map, xJump, yJump, xFrom, yFrom) {
    //console.log("Checking", xFrom + xJump, yFrom + yJump)
    if(map.length-1 < yFrom + yJump || map[0].length-1 < xFrom + xJump || yFrom + yJump < 0 || xFrom + xJump < 0) return {y: yFrom + yJump, x: xFrom + xJump, val: 0, map };
    else if(map[yFrom + yJump][xFrom + xJump] === "#") {
        //console.log("Detected sight at", xFrom + xJump, yFrom + yJump, "checking pattern", xJump, yJump);
        map[yFrom + yJump][xFrom + xJump] = ".";
        return {y: yFrom + yJump, x: xFrom + xJump, val: 1, map };
    } else return {y: yFrom + yJump, x: xFrom + xJump, val: 0, map };
}

function vaporizeArea(map, fromX, fromY, toX, toY, pointX, pointY) {
    let loses = 0;
    let checkedDiffs = {};

    for(let x = fromX; Math.abs(x) < Math.abs(toX); fromX > toX ? x-- : x++) {
        for(let y = fromY; Math.abs(y) < Math.abs(toY); fromY > toY ? y-- : y++) {
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

/* function vaporizeAsteroids(map, pointX, pointY) {
    let nMap = [...map];
    const xMax = map[0].length;
    const yMax = map.length;
    let loses = 0;
    let patX = 0;
    let patY = -1;
    let checkedDiffs = {};
    let quadrant = 0;

    while(loses !== 200) {
        const {x, y, val, map: newMap} = vaporizeAsteroidAtLos(nMap, patX, patY, pointX, pointY);
        if(val > 0) {
            console.log("Removed asteroid no", loses, "at", x, y, val, "(", patX, patY, ")");
            loses += val;
            nMap = newMap;
        } 

        switch(quadrant) {
            case 0:
                if(patX === 0) patX++;
                else if(Math.abs(patY) === patX && patX !== -1) patY--;
                else if(Math.abs(patY) === nMap.length) patY = -1, patX++;
                else if(Math.abs(patX) === nMap[0].length) quadrant++;
                else patY--;
                break;
            case 1:
                loses = 200;
        }
    }

    loses += vaporizeArea(map, 0, 0, xMax, (yMax * -1), pointX, pointY);
    loses += vaporizeArea(map, 0, 0, xMax, yMax, pointX, pointY);
    loses += vaporizeArea(map, 0, 0, (xMax * -1), yMax, pointX, pointY);
    loses += vaporizeArea(map, 0, 0, (xMax * -1), (yMax * -1), pointX, pointY);

    return loses;
} */

function touchMap(map, xJump, yJump, xFrom, yFrom) {
    //console.log("Checking", xFrom + xJump, yFrom + yJump)
    if(map.length-1 < yFrom + yJump || map[0].length-1 < xFrom + xJump || yFrom + yJump < 0 || xFrom + xJump < 0) return 0;
    else {
        //console.log("Detected sight at", xFrom + xJump, yFrom + yJump, "checking pattern", xJump, yJump);
        if(Number.isInteger(map[yFrom + yJump][xFrom + xJump])) map[yFrom + yJump][xFrom + xJump]++;
        else map[yFrom + yJump][xFrom + xJump] = 1;
        return touchMap(map, xJump, yJump, xFrom + xJump, yFrom + yJump);
    }// else return {y: yFrom + yJump, x: xFrom + xJump, val: 0, map };
}

function vaporizeAsteroids(map, pointX, pointY) {
    const quadrantWidth = map[0].length - pointX;
    const quadrantHeight = map.length -pointY;
    let x = 0;
    let y = -1;
    let quadrant = 0;
    let quadrantPass = 0;

    while(true) {
        const res = touchMap(map, x, y, pointX, pointY);

        switch(quadrant) {
            case 0:
                if(quadrantPass === 0) {
                    y = quadrantHeight * -1;
                    x = 1;
                    quadrantPass = 1;
                } else if(x === quadrantWidth) {
                    quadrant++;
                } else {
                    y++;
                    if(y === 0){
                        y = quadrantHeight * -1;
                        x++;
                    }
                }
                break;
        }

        if(quadrant > 0) break;
    }

    console.log(quadrant);
    
}

console.log(vaporizeAsteroids(parsedInput, 11, 13));
console.log(parsedInput.reduce((acc, line) => acc + line.reduce((acc, symbol) => acc + symbol) + "\n", ""), "");

//console.log(losMap);
//console.log(highest);