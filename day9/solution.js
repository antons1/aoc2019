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
const MODIFYBASE = 9;
const EXIT = 99;

const POSITION = 0;
const IMMEDIATE = 1;
const RELATIVE = 2;

function getValue(memory, { type, value }, base) {
    switch (type) {
        default:
        case POSITION: 
            if(memory[value] === undefined) memory[value] = 0;
            return { val: parseInt(memory[value]), ind: value };
        case IMMEDIATE: return { val: parseInt(value), ind: "DIR" };
        case RELATIVE:
            if(memory[base + value] === undefined) memory[base + value] = 0;
            return { val: parseInt(memory[base + value]), ind: base + value };
    }
}

actionHandlers[ADD] = (memory, [a, b, c], { base }) => {
    const { val: aVal, ind: aInd } = getValue(memory, a, base);
    const { val: bVal, ind: bInd } = getValue(memory, b, base);
    const { val: cVal, ind: cInd } = getValue(memory, c, base);
    //console.log(`Handling ADD, adding ${aVal} with ${bVal} storing at ${cInd}`)
    const newMemory = [...memory];
    newMemory[cInd] = aVal + bVal;
    return { memory: newMemory, pointerModifier: 4, changedPointer: false, extra: {} };
}

actionHandlers[MULTIPLY] = (memory, [a, b, c], { base }) => {
    const { val: aVal, ind: aInd } = getValue(memory, a, base);
    const { val: bVal, ind: bInd } = getValue(memory, b, base);
    const { val: cVal, ind: cInd } = getValue(memory, c, base);
    //console.log(`Handling MULTIPLY, multiplying ${aVal} with ${bVal} storing at ${cInd}`)
    const newMemory = [...memory];
    newMemory[cInd] = aVal * bVal;
    return { memory: newMemory, pointerModifier: 4, changedPointer: false, extra: {} };
}

actionHandlers[INPUT] = (memory, [a], { inputs, base }) => {
    const { val: aVal, ind: aInd } = getValue(memory, a, base);
    const input = inputs && inputs.length > 0 ? inputs.shift() : readline.question("Need input:");
    //console.log(`Handling INPUT, storing ${[parseInt(input)]} at ${aInd}`);
    const newMemory = [...memory];
    newMemory[aInd] = parseInt(input);
    return { memory: newMemory, pointerModifier: 2, changedPointer: false, extra: { inputs } };
}

actionHandlers[OUTPUT] = (memory, [a], { base }) => {
    const { val: aVal, ind: aInd } = getValue(memory, a, base);
    //console.log(`Handling OUTPUT, getting ${aVal} from ${aInd}`);
    console.log("Output:", aVal);
    return { memory, pointerModifier: 2, changedPointer: false, extra: { output: getValue(memory, a, base).val } }
}

actionHandlers[JUMPIFTRUE] = (memory, [a, b], { base }) => {
    const { val: aVal, ind: aInd } = getValue(memory, a, base);
    const { val: bVal, ind: bInd } = getValue(memory, b, base);
    //console.log(`Handling JUMPIFTRUE, jump ${!!aVal}/${aVal}, jump to ${bVal}`)
    if (aVal === 0) return { memory, pointerModifier: 3, changedPointer: false, extra: {} };
    else return { memory, pointerModifier: bVal, changedPointer: true, extra: {} };
}

actionHandlers[JUMPIFFALSE] = (memory, [a, b], { base }) => {
    const { val: aVal, ind: aInd } = getValue(memory, a, base);
    const { val: bVal, ind: bInd } = getValue(memory, b, base);
    //console.log(`Handling JUMPIFFALSE, jump ${!!!aVal}/${aVal}, jump to ${bVal}`)
    if (aVal === 0) return { memory, pointerModifier: bVal, changedPointer: true, extra: {} };
    else return { memory, pointerModifier: 3, changedPointer: false, extra: {} };
}

actionHandlers[LESSTHAN] = (memory, [a, b, c], { base }) => {
    const { val: aVal, ind: aInd } = getValue(memory, a, base);
    const { val: bVal, ind: bInd } = getValue(memory, b, base);
    const { val: cVal, ind: cInd } = getValue(memory, c, base);
    //console.log(`Handling LESSTHAN, is ${aVal} less than ${bVal}? storing ${aVal < bVal ? 1 : 0} at ${cInd}`)
    const newMemory = [...memory];
    newMemory[cInd] = aVal < bVal ? 1 : 0;
    return { memory: newMemory, pointerModifier: 4, changedPointer: false, extra: {} };
}

actionHandlers[EQUALS] = (memory, [a, b, c], { base }) => {
    const { val: aVal, ind: aInd } = getValue(memory, a, base);
    const { val: bVal, ind: bInd } = getValue(memory, b, base);
    const { val: cVal, ind: cInd } = getValue(memory, c, base);
    //console.log(`Handling EQUALS, is ${aVal} equal to ${bVal}? storing ${aVal < bVal ? 1 : 0} at ${cInd}`)
    const newMemory = [...memory];
    newMemory[cInd] = aVal === bVal ? 1 : 0;
    return { memory: newMemory, pointerModifier: 4, changedPointer: false, extra: {} };
}

actionHandlers[MODIFYBASE] = (memory, [a], { base }) => {
    const { val: aVal, ind: aInd } = getValue(memory, a, base);
    //console.log(`Handling MODIFYBASE, base ${base} increase by ${aVal} => ${base + aVal}`);
    return { memory, pointerModifier: 2, changedPointer: false, extra: { base: base + aVal } };
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

function handleInstruction(memory, instruction, inputs, base) {
    try {
        return actionHandlers[instruction.opCode](memory, instruction.args, { inputs, base });
    } catch (e) {
        console.log("Error handling instruction:");
        console.log(instruction);
        throw e;
    }
}

function runProgramLegacy(initialMemory, inputs) {
    let currentInputs = inputs;
    const outputs = [];
    let base = 0;
    let i = 0;
    while (true) {
        const instruction = initialMemory[i];
        const parsedInstruction = parseArguments(initialMemory, parseInstruction(instruction), i);
        if (parsedInstruction.opCode === EXIT) break;

        const { memory, pointerModifier, changedPointer, extra } = handleInstruction(initialMemory, parsedInstruction, currentInputs, base);
        //console.log("Handling", parsedInstruction, "with mem", initialMemory.slice(i, i+10));
        //console.log("Result", memory.slice(i, i+10), pointerModifier);
        initialMemory = memory;
        if(extra.inputs) currentInputs = extra.inputs;
        if(extra.output) outputs.push(extra.output);
        if(extra.base) base = extra.base;
        if (changedPointer) i = pointerModifier;
        else i += pointerModifier + 1;

        //readline.question("Continue");
    }

    return { memory: initialMemory, inputs: currentInputs, outputs, base}
}


function* runProgram(mainMemory, inputs, outputs, base, currentIndex) {
    const instruction = mainMemory[currentIndex];
    const parsedInstruction = parseArguments(mainMemory, parseInstruction(instruction), currentIndex);
    if (parsedInstruction.opCode === EXIT) return { memory: mainMemory, inputs, outputs, base, currentIndex };
    else {
        //console.log(`inp\t${inputs} out\t${outputs} bas\t${base} ind\t${currentIndex} inst\t${instruction} mem\t${mainMemory.slice(currentIndex, currentIndex+10)}`);
        const { memory, pointerModifier, changedPointer, extra } = handleInstruction(mainMemory, parsedInstruction, inputs, base);
        //console.log("Handling", parsedInstruction, "with mem", mainMemory.slice(currentIndex, currentIndex+10));
        //console.log("Result", memory.slice(currentIndex, currentIndex+10), pointerModifier);
        if(extra.output) outputs.push(extra.output);
        //readline.question("Continue");
        yield runProgram(memory, extra.inputs || inputs, outputs, extra.base || base, changedPointer ? pointerModifier : currentIndex + pointerModifier);
    }
}

let input = require('./input.js')
for(const r of runProgram(input, [], [], 0, 0)) {
    console.log(r);
}

//console.log(inputs, outputs, base);
//console.log(input);
//4,3,2,1,0