const fs = require('fs');
const _ = require('lodash');
/* const imported = `COM)B
B)C
C)D
D)E
E)F
B)G
G)H
D)I
E)J
J)K
K)L`.split("\n"); */

/* const imported = `COM)B
B)C
C)D
D)E
E)F
B)G
G)H
D)I
E)J
J)K
K)L
K)YOU
I)SAN`.split("\n"); */

const imported = fs.readFileSync('./input.txt', { encoding: 'utf8' }).split("\r\n")

const input = imported.map((rel => {
    const [from, to] = rel.split(")")
    return { from, to };
})).reduce((acc, cur) => {
    acc[cur.to] = cur.from
    return acc
}, {});

function countOrbiters(elems, planet, current) {
    if(elems[planet]) {
        //console.log(`Counting ${planet}, orbits ${elems[planet]} => current = ${current} to ${current+1}`);
        return countOrbiters(elems, elems[planet], current+1);
    }
    else {
        //console.log(`Counting ${planet}, orbits nothing => current = ${current}`)
        return current;
    };
}

function getOrbitLine(elems, planet, orbitLine) {
    if(elems[planet]) {
        orbitLine.push(elems[planet]);
        return getOrbitLine(elems, elems[planet], orbitLine);
    } else return orbitLine;
}

const totalOrbiters = Object.keys(input).reduce((acc, cur) => {
    const res = countOrbiters(input, cur, 0);
    const newRes = acc + res 
    console.log(`Counting\t${cur}, orbiting\t${res}, total\t${newRes}`);
    return newRes;
}, 0);

const myLine = getOrbitLine(input, "YOU", []);
const santasLine = getOrbitLine(input, "SAN", []);
const shared = _.intersection(myLine, santasLine);
const jumps = (myLine.length + santasLine.length) - (shared.length * 2);

//console.log(input);
console.log(totalOrbiters);
console.log(myLine.length, santasLine.length, shared.length);
console.log(jumps);