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

function runProgram(initialMemory, inputs, initialI = 0) {
    let currentInputs = inputs;
    let i = initialI;
    while (i < initialMemory.length) {
        const instruction = initialMemory[i];
        const parsedInstruction = parseArguments(initialMemory, parseInstruction(instruction), i);
        if (parsedInstruction.opCode === EXIT) return {status: 0, initialMemory, i, inputs: currentInputs};
        if (parsedInstruction.opCode === INPUT && currentInputs.length === 0) return {status: 1, initialMemory, i, inputs: currentInputs}

        const { memory, pointerModifier, changedPointer, inputs } = handleInstruction(initialMemory, parsedInstruction, currentInputs);
        //console.log("Handling", parsedInstruction, "with mem", initialMemory.slice(i, i+10));
        //console.log("Result", memory.slice(i, i+10), pointerModifier);
        initialMemory = memory;
        currentInputs = inputs || [];
        if (changedPointer) i = pointerModifier;
        else i += pointerModifier + 1;

        //readline.question("Continue");
    }
}

function getPrevProgIndex(i) {
    if(i === 0) return 4;
    else return i-1;
}

function runAmplifierSequence(initialMemory, sequence) {
    let programs = [];
    
    for(let i = 0; i < sequence.length; i++) {
        programs.push({
            memory: [...initialMemory],
            inputs: [sequence[i]],
            output: 0,
            state: -1,
            i: 0
        });
    }

    let curProg = 0;
    while(programs.reduce((acc, prog) => acc += prog.state, 0) !== 0) {
        const prog = programs[curProg];
        prog.inputs.push(programs[getPrevProgIndex(curProg)].output);
        //console.log("Starting program", curProg, "inputs", prog.inputs, "prevProg", getPrevProgIndex(curProg), "output", programs[getPrevProgIndex(curProg)].output)
        let {status, initialMemory, i, inputs} = runProgram(prog.memory, prog.inputs, prog.i);
        //console.log("Halting program", curProg, "status", status);
        prog.state = status;
        prog.memory = initialMemory;
        prog.output = lastOutput;
        prog.i = i;
        prog.inputs = inputs;
        curProg++;
        if(curProg === 5) curProg = 0;
    }

    return lastOutput;
}

function findHighestAmplifierSequence(initialMemory, sequenceStart, sequenceStop) {
    let highestResult = 0;
    let highestSeq = [];
    for(let i = sequenceStart; i <= sequenceStop; i++) {
        const seq = ("" + i).split("").map((s) => parseInt(s));
        while(seq.length < 5) seq.unshift(0);
        if(_.uniq(seq).filter((s) => s >= 5).length < 5) continue;
        let res = runAmplifierSequence([...initialMemory], seq);
        if(res > highestResult) {
            highestResult = res;
            highestSeq = seq;
        }
    }

    return {highestResult, highestSeq};
}

let input = require('./input.js')
let {highestResult, highestSeq} = findHighestAmplifierSequence(input, 56789, 98765);
//runAmplifierSequence(input, [0, 1, 2, 3, 4]);

console.log(highestResult, highestSeq);
//console.log(input);
//4,3,2,1,0