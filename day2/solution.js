const ADD = 1;
const MULTIPLY = 2;
const EXIT = 99;

function add(originalList, codeindex) {
    const list = [...originalList];
    //console.log("add:", list[list[codeindex+1]], list[list[codeindex+2]])
    list[list[codeindex+3]] = list[list[codeindex+1]] + list[list[codeindex+2]];
    //console.log("add:", "Result", list[list[codeindex+3]], "stored at", list[codeindex+3])
    return list;
}

function multiply(originalList, codeindex) {
    const list = [...originalList];
    //console.log("mul:", list[list[codeindex+1]], list[list[codeindex+2]])
    list[list[codeindex+3]] = list[list[codeindex+1]] * list[list[codeindex+2]];
    //console.log("mul:", "Result", list[list[codeindex+3]], "stored at", list[codeindex+3])
    return list;
}

function runCode(originalList) {
    let list = [...originalList];
    for(let i = 0; i < list.length; i+=4) {
        //console.log("Index", i, "opcode", list[i]);
        if(list[i] === EXIT) break;
        else if(list[i] === ADD) list = add(list, i);
        else if(list[i] === MULTIPLY) list = multiply(list, i);
        else console.log("Unknown opcode!", list[i]);
    }

    return list;
}

/* const testinputs = require('./testinput.json');
testinputs.forEach(({input, result}) => {
    const inputList = input.split(',').map((i) => parseInt(i));
    const processedList = runCode(inputList);
    console.log(`${input} => ${result}, ${processedList}`);
}) */

const fs = require('fs');
const input = fs.readFileSync('./input.txt', { encoding: 'utf8' }).split(",").map((i) => parseInt(i));
let result = [];
for(let i = 0; i <= 99; i++) {
    for(let j = 0; j <= 99; j++) {
        const inputCopy = [...input];
        inputCopy[1] = i;
        inputCopy[2] = j;
        result = runCode(inputCopy);
        if(result[0] === 19690720) {
            console.log("Inputs", i, j, "produces", 19690720);
            console.log("100 *", i, "+", j, "=", 100*i+j);
            break;
        }
    }
    if(result[0] === 19690720) break;
}
/* const result = runCode(input);
console.log(input[0], result[0]) */