const fs = require('fs');
const input = fs.readFileSync('./input.txt', { encoding: 'utf8' }).split("");

const Reset = "\x1b[0m"
const BgBlack = "\x1b[40m"
const BgCyan = "\x1b[46m"
const BgWhite = "\x1b[47m"

const width = 25;
const height = 6;

const layerSize = width*height;

const BLACK = 0;
const WHITE = 1;
const TRANSPARENT = 2;

function getRawLayers(input, layerSize, currentRaw) {
    if(input.length > 0) {
        currentRaw.push(input.splice(0, layerSize));
        return getRawLayers(input, layerSize, currentRaw);
    } else return currentRaw;
}

const rawLayers = getRawLayers(input, layerSize, []);

function reduceLayer(acc, cur) {
    acc[cur] ? acc[cur]++ : acc[cur] = 1;
    return acc;
}

const digitCounts = rawLayers.map((layer) => layer.reduce(reduceLayer, {})).sort((a, b) => a['0'] - b['0']);

console.log(digitCounts[0], digitCounts[0]['1'] * digitCounts[0]['2']);

const finishedImage = rawLayers.reduce((image, layer) => {
    return image.map((pixel, index) => {
        if(parseInt(pixel) === TRANSPARENT || pixel === -1){
            //console.log("Pixel is", pixel, "thus use", layer[index])
            return layer[index];
        } else {
            //console.log("Pixel was neither unset nor transparent, was", pixel)
            return pixel;
        }
    });
}, Array(rawLayers[0].length).fill(-1))

function getColoredString(color, str) {
    return `${color}${str}${Reset}`;
}

function getStringColor(code) {
    switch(parseInt(code)) {
        case BLACK: return BgCyan;
        case WHITE: return BgWhite;
        case TRANSPARENT: return BgBlack;
        default: return "\x1b[31m";
    }
}

const imageString = finishedImage.reduce((string, pixel, index) => {
    string.push(getColoredString(getStringColor(pixel), " "))
    return string;
}, [])

function printImage(pixels, width) {
    let currentString = "";
    for(let i = 0; i < pixels.length; i++) {
        if(i%width === 0) {
            console.log(currentString);
            currentString = "";
        }
        else currentString += pixels[i];
    }
    console.log(currentString);
}

printImage(imageString, width);
