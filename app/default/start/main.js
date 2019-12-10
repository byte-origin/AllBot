const rootPath = require("electron").remote.getGlobal('rootPath');
const path = require("fs");
const gm = require('gm').subClass({imageMagick: true});
const AllBotUtils = require(`${rootPath}/app/tools/allbot/utils`);
let utils = new AllBotUtils();
let htmlFiles = [];
let totalFunctionCount = 0;

async function loadFunctions(functionSet) {
    let functionSetFolder = path.readdirSync(`${rootPath}/app/${functionSet}/`, "utf8");
    functionSetFolder.forEach(function (functionName) {
        let albiFunction = path.readdirSync(`${rootPath}/app/${functionSet}/${functionName}/`);
        albiFunction.forEach(function (file) {
            if(file == `${functionName}.abdesc`) {
                let functionDescription = path.readFileSync(`${rootPath}/app/${functionSet}/${functionName}/${file}`).toString();
                if(functionDescription.length > 300) {
                    functionDescription = functionDescription.slice(0, 397) + "...";
                }
                if(path.existsSync(`${rootPath}/app/${functionSet}/${functionName}/${functionName}.op.png`) == true) {
                    htmlFiles[totalFunctionCount] = `<div class="albi-flexbox-child albi-pointer w3-shadow" functionType="${functionSet}" hideAndSeek="false" onClick="utils.executeFunction('${functionName}', '${functionSet}', '${functionName}')"><div class="w3-row"><div class="albi-function-type w3-right">${utils.toTitle(functionSet)}</div><h2 class="w3-left">${utils.toTitle(functionName)}</h2></div><br><div class="w3-row"><div class="w3-col s12 m6 l6 w3-left">${functionDescription}</div><img src="${rootPath}/app/${functionSet}/${functionName}/${functionName}.op.png" class="w3-col m6 l6 w3-right w3-image w3-circle" style="width:200px;height:200px;">`;
                } else if(path.existsSync(`${rootPath}/app/${functionSet}/${functionName}/${functionName}.abpic`) == true) {
                    htmlFiles[totalFunctionCount] = `<div class="albi-flexbox-child albi-pointer w3-shadow" functionType="${functionSet}" hideAndSeek="false" onClick="utils.executeFunction('${functionName}', '${functionSet}', '${functionName}')"><div class="w3-row"><div class="albi-function-type w3-right">${utils.toTitle(functionSet)}</div><h2 class="w3-left">${utils.toTitle(functionName)}</h2></div><br><div class="w3-row"><div class="w3-col s12 m6 l6 w3-left">${functionDescription}</div><img src="${rootPath}/app/${functionSet}/${functionName}/${functionName}.abpic" class="w3-col m6 l6 w3-right w3-image w3-circle" style="width:200px;height:200px;">`;
                    utils.reconImage(200, 200, "png", functionSet, functionName);
                } else {
                    htmlFiles[totalFunctionCount] = `<div class="albi-flexbox-child albi-pointer w3-shadow" functionType="${functionSet}" hideAndSeek="false" onClick="utils.executeFunction('${functionName}', '${functionSet}', '${functionName}')"><div class="w3-row"><div class="albi-function-type w3-right">${utils.toTitle(functionSet)}</div><h2 class="w3-left">${utils.toTitle(functionName)}</h2></div><p>${functionDescription}</p></div>`;
                }
                totalFunctionCount++;
            }
        });
    });
    document.getElementById("tabs").insertAdjacentHTML('beforeend', `<div class="w3-col m2 l2 w3-card w3-black w3-padding-small w3-margin-right w3-hover-dark-grey albi-pointer" onClick="switchFunctionTypes('${functionSet}')">${functionSet.charAt(0).toUpperCase() + functionSet.substring(1)}</div>`);
    htmlFiles.sort();
    for(let i = 0; i < totalFunctionCount; i++) {
        document.getElementById("functions").insertAdjacentHTML('beforeend', htmlFiles[i]);
    }
    htmlFiles = new Array();
    totalFunctionCount = 0;
}

function switchFunctionTypes(functionType) {
    let hideAndSeek = document.querySelectorAll('[hideAndSeek=false]');
    if(functionType != "all") {
        let showFunctions = document.querySelectorAll(`[functionType="${functionType}"]`);
        for(let i = 0; i < hideAndSeek.length; ++i) {
            if(hideAndSeek[i].className.split(' ').indexOf('w3-hide') < 0) hideAndSeek[i].classList.add('w3-hide');
        }
        for(let i = 0; i < showFunctions.length; ++i) {
            if(hideAndSeek[i].className.split(' ').indexOf('w3-hide') > 0) showFunctions[i].classList.remove('w3-hide');
        }
    } else {
        let showFunctions = document.querySelectorAll(`[functionType]`);
        for(let i = 0; i < showFunctions.length; ++i) {
            if(hideAndSeek[i].className.split(' ').indexOf('w3-hide') > 0) showFunctions[i].classList.remove('w3-hide');
        }
    }
}
loadFunctions("default");
loadFunctions("custom");