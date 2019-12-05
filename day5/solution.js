const readline = require('readline-sync');

const actionHandlers = [];
const ADD = 1;
const MULTIPLY = 2;
const INPUT = 3;
const OUTPUT = 4;
const JUMPIFTRUE = 5;
const JUMPIFFALSE = 6;
const LESSTHAN = 7;
const EQUALS = 8;
const EXIT = 99;

const POSITION = 0;
const IMMEDIATE = 1;

function getValue(memory, {type, value}) {
    switch(type) {
        default:
        case POSITION: return parseInt(memory[value]);
        case IMMEDIATE: return parseInt(value);
    }
}

actionHandlers[ADD] = (memory, [a, b, c]) => {
    const newMemory = [...memory];
    newMemory[c.value] = getValue(memory, a) + getValue(memory, b);
    //console.log(`Handling ADD, adding ${[getValue(memory, a)]} with ${getValue(memory, b)} storing at ${[c.value]}`)
    return { memory: newMemory, pointerModifier: 3, changedPointer: false };
}

actionHandlers[MULTIPLY] = (memory, [a, b, c]) => {
    const newMemory = [...memory];
    newMemory[c.value] = getValue(memory, a) * getValue(memory, b);
    //console.log(`Handling MULTIPLY, multiplying ${[getValue(memory, a)]} with ${getValue(memory, b)} storing at ${[c.value]}`)
    return { memory: newMemory, pointerModifier: 3, changedPointer: false };
}

actionHandlers[INPUT] = (memory, [a]) => {
    const input = readline.question("Need input:");
    const newMemory = [...memory];
    newMemory[a.value] = parseInt(input);
    //console.log(`Handling INPUT, storing ${[parseInt(input)]} at ${[a.value]}`);
    return { memory: newMemory, pointerModifier: 1, changedPointer: false };
}

actionHandlers[OUTPUT] = (memory, [a]) => {
    console.log("Output:", memory[a.value]);
    //console.log(`Handling OUTPUT, getting ${[memory[a.value]]} from ${[a.value]}`);
    return { memory, pointerModifier: 1, changedPointer: false }
}

actionHandlers[JUMPIFTRUE] = (memory, [a, b]) => {
    //console.log(`Handling JUMPIFTRUE, jump ${!!getValue(memory, a)}/${getValue(memory, a)}, jump to ${getValue(memory, b)}`)
    if(getValue(memory, a) === 0) return { memory, pointerModifier: 2, changedPointer: false };
    else return { memory, pointerModifier: getValue(memory, b), changedPointer: true };
}

actionHandlers[JUMPIFFALSE] = (memory, [a, b]) => {
    //console.log(`Handling JUMPIFFALSE, jump ${!!!getValue(memory, a)}/${getValue(memory, a)}, jump to ${getValue(memory, b)}`)
    if(getValue(memory, a) === 0) return { memory, pointerModifier: getValue(memory, b), changedPointer: true };
    else return { memory, pointerModifier: 2, changedPointer: false };
}

actionHandlers[LESSTHAN] = (memory, [a, b, c]) => {
    const newMemory = [...memory];
    newMemory[c.value] = getValue(memory, a) < getValue(memory, b) ? 1 : 0;
    //console.log(`Handling LESSTHAN, is ${[getValue(memory, a)]} less than ${getValue(memory, b)}? storing ${getValue(memory, a) < getValue(memory, b) ? 1 : 0} at ${[c.value]}`)
    return { memory: newMemory, pointerModifier: 3, changedPointer: false };
}

actionHandlers[EQUALS] = (memory, [a, b, c]) => {
    const newMemory = [...memory];
    newMemory[c.value] = getValue(memory, a) === getValue(memory, b) ? 1 : 0;
    //console.log(`Handling EQUALS, is ${[getValue(memory, a)]} equal to ${getValue(memory, b)}? storing ${getValue(memory, a) < getValue(memory, b) ? 1 : 0} at ${[c.value]}`)
    return { memory: newMemory, pointerModifier: 3, changedPointer: false };
}

function getInstString(instructionInt) {
    let stringified = "" + instructionInt;
    for(let i = 5; i > stringified.length; ) {
        stringified = "0" + stringified;
    }

    return stringified;
}

function parseInstruction(instruction) {
    let instString = getInstString(instruction);
    const instructionParts = instString.match(/^(-?\d?)(-?\d?)(-?\d?)(\d?\d)$/);
    const opCode = parseInt(instructionParts[4]);
    const args = instructionParts.slice(1, 4).reverse().map((c) => ({ type: parseInt(c) }));
    return { opCode, args, instruction };
}

function parseArguments(memory, instruction, instructionIndex) {
    instruction.args = instruction.args.map((arg, index) => Object.assign(arg, { value: memory[instructionIndex + index + 1]}));
    return instruction;
}

function handleInstruction(memory, instruction) {
    try {
        return actionHandlers[instruction.opCode](memory, instruction.args);
    } catch(e) {
        console.log("Error handling instruction:");
        console.log(instruction);
        throw e;
    }
}

const fs = require('fs');
let input = fs.readFileSync('./input.txt', { encoding: 'utf8' }).split(",").map((v) => parseInt(v));//[1002,4,3,4,33];
let i = 0;
while(i < input.length) {
    const instruction = input[i];
    const parsedInstruction = parseArguments(input, parseInstruction(instruction), i);
    if(parsedInstruction.opCode === EXIT) break;

    const { memory, pointerModifier, changedPointer } = handleInstruction(input, parsedInstruction);
    //console.log("Handling", parsedInstruction, "with mem", input.slice(i, i+10));
    //console.log("Result", memory.slice(i, i+10), pointerModifier);
    input = memory;
    if(changedPointer) i = pointerModifier;
    else i += pointerModifier + 1;

    //readline.question("Continue");
}

//console.log(input);