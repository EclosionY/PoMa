'use strict'

import {app, protocol, BrowserWindow, globalShortcut, Menu,Tray} from 'electron'
import {createProtocol} from 'vue-cli-plugin-electron-builder/lib'
// import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    {scheme: 'app', privileges: {secure: true, standard: true}}
])

var template = [
    {
        label: '系统设置',
        role: 'sysSetting',
    },
    {
        label: '帮助',
        role: 'help',
        submenu: [{
            label: '操作文档',
        }, {
            label: '关于'
        }]
    }
];

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1366,
        height: 768,
        icon:__static+'/icon/icon.png',
        webPreferences: {
            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
            enableRemoteModule: true
        }
    })
    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    } else {
        createProtocol('app')
        // Load the index.html when not in development
        win.loadURL('app://./index.html')
    }
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
    win.on('closed', () => {
        win = null
    })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})


app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    createWindow();
    globalShortcut.register('ctrl+l', function () {
        if (win.webContents.isDevToolsOpened()) {
            win.webContents.closeDevTools()
        } else {
            win.webContents.openDevTools()
        }

    })
    const tray = new Tray(__static+'/icon/icon.png');
    const trayContextMenu = Menu.buildFromTemplate([
        {
            label: '打开',
            click: () => {
                win.show();
            }
        }, {
            label: '退出',
            click: () => {
                app.quit();
            }
        }
    ]);

    tray.setToolTip('project manager正在运行......');
    tray.on('click', () => {
        win.show();
    });
    tray.on('right-click', () => {
        tray.popUpContextMenu(trayContextMenu);
    });
})
app.on('will-quit', function () {
    // Unregister a shortcut.
    globalShortcut.unregister('ctrl+x');

    // Unregister all shortcuts.
    globalShortcut.unregisterAll();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                app.quit()
            }
        })
    } else {
        process.on('SIGTERM', () => {
            app.quit()
        })
    }
}
