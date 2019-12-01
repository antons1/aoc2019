const fs = require('fs');
const input = fs.readFileSync("./input.txt", { encoding: 'utf8' });

const masses = input.split('\n');

function calculateFuelNeed(mass) {
    const fuelNeed = Math.floor(mass/3)-2
    if(fuelNeed > 0) return fuelNeed + calculateFuelNeed(fuelNeed);
    else return 0;
}

const result1 = masses.map((mass) => Math.floor(mass/3)-2).reduce((acc, curr) => curr += acc);
const result2 = masses.map(calculateFuelNeed).reduce((acc, curr) => curr += acc);
console.log(result1, result2);