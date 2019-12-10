const {app, BrowserWindow, Menu, MenuItem} = require('electron');
// @ts-ignore
global.rootPath = __dirname;
let mainWindow;
function createWindow() {
    const menu = new Menu();
    menu.append(new MenuItem({
        label: "Reload",
        accelerator: "CmdOrCtrl+R",
        click: function() {BrowserWindow.getFocusedWindow().reload();}
    }));
    menu.append(new MenuItem({
        label: "Dev Tools",
        accelerator: "CmdOrCtrl+Shift+I",
        click: function() {BrowserWindow.getFocusedWindow().webContents.openDevTools()}
    }));
    mainWindow = new BrowserWindow({
        width: 900,
        height: 700,
        minWidth: 900,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
            webviewTag: true
        },
        icon: "app/tools/allbot/logo"
    });
    Menu.setApplicationMenu(menu);
    mainWindow.loadFile('./app/default/start/start.html')
    mainWindow.on('closed', function() {
        mainWindow = null
    });
}

app.on('ready', createWindow);
app.on('window-all-closed', function() {
    if(process.platform !== 'darwin') app.quit();
})

app.on('activate', function() {
    if(mainWindow === null) createWindow()
});