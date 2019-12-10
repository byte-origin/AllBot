const gm = require('gm').subClass({imageMagick: true});
const {remote, BrowserWindow} = require("electron");
const path = require("path");
const fs = require("fs");
const rootPath = remote.getGlobal("rootPath");
class AllBotUtils {

    /**
     * Loads the listeners for the titlebar. I.E Maximize, minimize, close, reload, etc.
     */
    constructor() {
        console.log("AllBot Utils are ready!");
        this.childWindow = {};
    }

    /**
     * Resize and convert the image to png for the main menu.
     * @param {Number} imageWidth The width to set the image.
     * @param {Number} imageHeight The height to set the image.
     * @param {"png"|"jpg"|"jpeg"} imageFormat The format to set the image.
     * @param {String} functionSet The function set that holds the function.
     * @param {String} folder The folder/function name that holds the image.
     * @returns {Promise<void>} Resizes the image, and saves it 
     */
    async reconImage(imageWidth, imageHeight, imageFormat, functionSet, folder) {
        console.log(`Optimizing '${functionSet}/${folder}'s image...`);
        gm(`app/${functionSet}/${folder}/${folder}.abpic`)
            .resize(imageWidth, imageHeight, "!")
            .noProfile()
            .setFormat(imageFormat)
            .write(`app/${functionSet}/${folder}/${folder}.op.png`, function(err) {
                if(err) {
                    console.log(err);
                } else {
                    console.log(`Optimized '${functionSet}/${folder}'s image.`);
                }
            });

    }

    /**
     * Executes the main menu functions.
     * @param {String} processName The name of the process.
     * @param {String} functionSet The function set that the function is in.
     * @param {String} functionName The name of the function to execute.
     */
    async executeFunction(processName, functionSet, functionName) {
        //Tests if logo exists.
        let opLogoExists = fs.existsSync(path.resolve(rootPath, "app/", functionSet, functionName, `${functionName}.op.png`));
        if(opLogoExists == true) {
            this.picture = path.resolve(rootPath, "app/", functionSet, functionName, `${functionName}.op.png`);
        } else if(opLogoExists == false) {
            let logoExists = fs.existsSync(path.resolve(rootPath, "app/", functionSet, functionName, `${functionName}.abpic`));
            if(logoExists == true) {
                this.picture = path.resolve(rootPath, "app/", functionSet, functionName, `${functionName}.abpic`);
            } else if(logoExists == false) {
                this.picture = path.resolve(rootPath, "app/tools/allbot/logo");
            }
        };
        //Import app settings
        let settingsExists = fs.existsSync(path.resolve(rootPath, "app/", functionSet, functionName, "settings.json"));
        if(settingsExists == true) {
            this.settings = require(path.resolve(rootPath, "app/", functionSet, functionName, "settings.json"));
            if(this.settings.loadFile != null) {
                this.loadFile = this.settings.loadFile;
            }
        } else {
            this.settings = {
                width: 800,
                height: 600,
                webPreferences: {
                    nodeIntegration: true,
                    nodeIntegrationInWorker: false,
                    webviewTag: true,
                    webSecurity: false,
                    preload: null
                },
                menuBarVisibility: false
            };
            this.loadFile = `file://${path.resolve(rootPath, "app/", functionSet, functionName, "main.html")}`
            this.menu = new remote.Menu();
            this.menu.append(new remote.MenuItem({
                label: "Reload",
                accelerator: "CmdOrCtrl+R",
                click: function() {BrowserWindow.getFocusedWindow().reload();}
            }));
            this.menu.append(new remote.MenuItem({
                label: "Exit",
                accelerator: "CmdOrCtrl+W",
                click: function() {BrowserWindow.getFocusedWindow().close();}
            }));
        }
        this.childWindow[processName] = new remote.BrowserWindow({
            width: this.settings.width,
            height: this.settings.height,
            webPreferences: {
                nodeIntegration: this.settings.webPreferences.nodeIntegration,
                nodeIntegrationInWorker: this.settings.webPreferences.nodeIntegrationInWorker,
                webviewTag: this.settings.webPreferences.webviewTag,
                webSecurity: this.settings.webPreferences.webSecurity
            },
            icon: this.picture
        });
        if(String(this.settings.loadFile.pathname).startsWith("localDir") == true) {
            this.settings.loadFile.pathname = path.resolve(rootPath, "app", functionSet, functionName, this.settings.loadFile.pathname.slice(9))
        }
        this.childWindow[processName].setMenuBarVisibility(this.settings.menuBarVisibility);
        this.childWindow[processName].setTitle(`${this.toTitle(functionName)} - AllBot`);
        this.childWindow[processName].loadURL(require("url").format({
            protocol: this.settings.loadFile.protocol,
            slashes: this.settings.loadFile.slashes,
            pathname: this.settings.loadFile.pathname
        }));
    }

    /**
     * Converts each word in the string into it's respective capital form.
     * @param {String} title - The string to be converted to a title.
     * @returns {String} Returns the uppercased title.
     */
    toTitle(title) {
        let convertedTitle = title.split(" ");
        title = "";
        convertedTitle.forEach(function(word) {
            word = word.charAt(0).toUpperCase() + word.substring(1)
            title = title + word + ' ';
        });
        return title;
    }
}

module.exports = AllBotUtils;