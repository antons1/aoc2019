const readline = require('readline-sync');
const _ = require('lodash');

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

let lastOutput = null;

function getValue(memory, { type, value }) {
    switch (type) {
        default:
        case POSITION: return parseInt(memory[value]);
        case IMMEDIATE: return parseInt(value);
    }
}

actionHandlers[ADD] = (memory, [a, b, c], inputs) => {
    const newMemory = [...memory];
    newMemory[c.value] = getValue(memory, a) + getValue(memory, b);
    //console.log(`Handling ADD, adding ${[getValue(memory, a)]} with ${getValue(memory, b)} storing at ${[c.value]}`)
    return { memory: newMemory, pointerModifier: 3, changedPointer: false, inputs };
}

actionHandlers[MULTIPLY] = (memory, [a, b, c], inputs) => {
    const newMemory = [...memory];
    newMemory[c.value] = getValue(memory, a) * getValue(memory, b);
    //console.log(`Handling MULTIPLY, multiplying ${[getValue(memory, a)]} with ${getValue(memory, b)} storing at ${[c.value]}`)
    return { memory: newMemory, pointerModifier: 3, changedPointer: false, inputs };
}

actionHandlers[INPUT] = (memory, [a], inputs) => {
    const input = inputs.length > 0 ? inputs.shift() : readline.question("Need input:");
    const newMemory = [...memory];
    newMemory[a.value] = parseInt(input);
    //console.log(`Handling INPUT, storing ${[parseInt(input)]} at ${[a.value]}`);
    return { memory: newMemory, pointerModifier: 1, changedPointer: false, inputs };
}

actionHandlers[OUTPUT] = (memory, [a], inputs) => {
    //console.log("Output:", memory[a.value]);
    lastOutput = memory[a.value];
    //console.log(`Handling OUTPUT, getting ${[memory[a.value]]} from ${[a.value]}`);
    return { memory, pointerModifier: 1, changedPointer: false, inputs }
}

actionHandlers[JUMPIFTRUE] = (memory, [a, b], inputs) => {
    //console.log(`Handling JUMPIFTRUE, jump ${!!getValue(memory, a)}/${getValue(memory, a)}, jump to ${getValue(memory, b)}`)
    if (getValue(memory, a) === 0) return { memory, pointerModifier: 2, changedPointer: false };
    else return { memory, pointerModifier: getValue(memory, b), changedPointer: true, inputs };
}

actionHandlers[JUMPIFFALSE] = (memory, [a, b], inputs) => {
    //console.log(`Handling JUMPIFFALSE, jump ${!!!getValue(memory, a)}/${getValue(memory, a)}, jump to ${getValue(memory, b)}`)
    if (getValue(memory, a) === 0) return { memory, pointerModifier: getValue(memory, b), changedPointer: true };
    else return { memory, pointerModifier: 2, changedPointer: false, inputs };
}

actionHandlers[LESSTHAN] = (memory, [a, b, c], inputs) => {
    const newMemory = [...memory];
    newMemory[c.value] = getValue(memory, a) < getValue(memory, b) ? 1 : 0;
    //console.log(`Handling LESSTHAN, is ${[getValue(memory, a)]} less than ${getValue(memory, b)}? storing ${getValue(memory, a) < getValue(memory, b) ? 1 : 0} at ${[c.value]}`)
    return { memory: newMemory, pointerModifier: 3, changedPointer: false, inputs };
}

actionHandlers[EQUALS] = (memory, [a, b, c], inputs) => {
    const newMemory = [...memory];
    newMemory[c.value] = getValue(memory, a) === getValue(memory, b) ? 1 : 0;
    //console.log(`Handling EQUALS, is ${[getValue(memory, a)]} equal to ${getValue(memory, b)}? storing ${getValue(memory, a) < getValue(memory, b) ? 1 : 0} at ${[c.value]}`)
    return { memory: newMemory, pointerModifier: 3, changedPointer: false, inputs };
}

function getInstString(instructionInt) {
    let stringified = "" + instructionInt;
    for (let i = 5; i > stringified.length;) {
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
    instruction.args = instruction.args.map((arg, index) => Object.assign(arg, { value: memory[instructionIndex + index + 1] }));
    return instruction;
}

function handleInstruction(memory, instruction, inputs) {
    try {
        return actionHandlers[instruction.opCode](memory, instruction.args, inputs);
    } catch (e) {
        console.log("Error handling instruction:");
        console.log(instruction);
        throw e;
    }
}

function runProgram(initialMemory, inputs) {
    let currentInputs = inputs;
    let i = 0;
    while (i < initialMemory.length) {
        const instruction = initialMemory[i];
        const parsedInstruction = parseArguments(initialMemory, parseInstruction(instruction), i);
        if (parsedInstruction.opCode === EXIT) break;

        const { memory, pointerModifier, changedPointer, inputs } = handleInstruction(initialMemory, parsedInstruction, currentInputs);
        //console.log("Handling", parsedInstruction, "with mem", initialMemory.slice(i, i+10));
        //console.log("Result", memory.slice(i, i+10), pointerModifier);
        initialMemory = memory;
        currentInputs = inputs;
        if (changedPointer) i = pointerModifier;
        else i += pointerModifier + 1;

        //readline.question("Continue");
    }
}

function runAmplifierSequence(initialMemory, sequence) {
    let init = 0;
    for(let i = 0; i < sequence.length; i++) {
        runProgram([...initialMemory], [sequence[i], init]);
        init = lastOutput;
    }

    return init;
}

function findHighestAmplifierSequence(initialMemory, sequenceStart, sequenceStop) {
    let highestResult = 0;
    let highestSeq = [];
    for(let i = sequenceStart; i <= sequenceStop; i++) {
        const seq = ("" + i).split("").map((s) => parseInt(s));
        while(seq.length < 5) seq.unshift(0);
        if(_.uniq(seq).filter((s) => s <= 4).length < 5) continue;
        let res = runAmplifierSequence([...initialMemory], seq);
        if(res > highestResult) {
            highestResult = res;
            highestSeq = seq;
        }
    }

    return {highestResult, highestSeq};
}


let input = require('./input.js')
let {highestResult, highestSeq} = findHighestAmplifierSequence(input, 01234, 43210);

console.log(highestResult, highestSeq);
//console.log(input);
//4,3,2,1,0