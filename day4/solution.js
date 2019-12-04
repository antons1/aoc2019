const input = require('./testinput.json');
const from = 236491;
const to = 713787;

function numberComparison(a, b) {
    if(a > b) return [false, false];
    else if(a === b) return [true, true];
    else if(a < b) return [true, false];
}

function checkCode(code) {
    const digits = code.split("").map((i) => parseInt(i));
    let result = true;
    let double = false;
    let sameInARow = 1;
    for(let i = 0; i < digits.length-1; i++) {
        const [passed, sameAsPrevious] = numberComparison(digits[i], digits[i+1]);
        //console.log(`Comparing ${digits[i]} and ${digits[i+1]}. Passed? ${passed}. Same? ${sameAsPrevious}`);
        if(sameAsPrevious) sameInARow++;
        
        if(!sameAsPrevious || !(i < digits.length-2)){
            if(sameInARow === 2) double = true;
            sameInARow = 1;
        }
        if(!passed) {
            result = false;
            break;
        }
        //console.log(`DoubleStatus: ${sameInARow} similar numbers in a row. Double found? ${double}`);
    }

    if(result && double) return true;
    else return false;
}

input.forEach(({input, result}) => {
    let res = checkCode(input);
    console.log(`${input} should be ${result} => ${res}`);
})

const codes = [];
for(let i = from; i <= to; i++) {
    if(checkCode("" + i)) codes.push(i);
}

console.log(codes);
console.log(codes.length);