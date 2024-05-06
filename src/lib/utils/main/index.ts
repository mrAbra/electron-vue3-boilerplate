/**
 * @file 当前目录的代码只能被主进程所使用
 */
import { app, session, BrowserWindow, ipcMain, shell, dialog, OpenDialogOptions } from "electron";
import path from "path";
import * as FileUtils from "./file-util";
import appState from "../../../main/app-state";
import Server from '../server/index'
//import { winURL } from '../config/StaticPath'
import lorawandataparser from '../services/lorawandataparser'
import DataBase from '../services/database'
let devAddrForMoreInfo = null;
import FramelessWindow from "../../../main/windows/frameless";

let winURL = ''
if (app.isPackaged) {
  winURL = `${app.getAppPath()}/build/renderer/index.html#/primary`;
} else {
  const rendererPort = process.argv[2];
  winURL = `http://localhost:${rendererPort}/`;
}


const dataBase = new DataBase();

class Utils {
  public initialize() {
    this._preloadFilePath = path.join(__dirname, "utils-preload.js");
    // console.log("Utils preload path: " + this._preloadFilePath);
    this.setPreload(session.defaultSession);

    app.on("session-created", (session) => {
      this.setPreload(session);
    });
  }

  protected setPreload(session) {
    session.setPreloads([...session.getPreloads(), this._preloadFilePath]);
  }

  protected _preloadFilePath: string = "";

  // === PUBLIC METHOD FALG LINE (DO NOT MODIFY/REMOVE) ===
}

const utils = new Utils();

ipcMain.on("electron-utils-open-dev-tools", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.webContents.openDevTools();
  }
});

ipcMain.on("electron-utils-open-external-url", (event, url) => {
  if (url) {
    shell.openExternal(url);
  }
});

ipcMain.handle("electron-utils-show-open-dialog", async (event, options: OpenDialogOptions) => {
  return await dialog.showOpenDialog(options);
});

ipcMain.on("electron-utils-check-path-exist", (event, path) => {
  let exist = false;
  if (path) {
    exist = FileUtils.IsPathExist(path);
  }
  event.returnValue = exist;
});

ipcMain.handle("electron-utils-get-file-md5", async (event, filePath) => {
  return await FileUtils.GetFileMd5(filePath);
});

ipcMain.on("electron-utils-get-app-version", (event) => {
  event.returnValue = appState.appVersion;
});


ipcMain.handle('windows-mini', (event, args) => {
  BrowserWindow.fromWebContents(event.sender)?.minimize()
})
ipcMain.handle('window-max', async (event, args) => {
  if (BrowserWindow.fromWebContents(event.sender)?.isMaximized()) {
    BrowserWindow.fromWebContents(event.sender)?.unmaximize()
    return { status: false }
  } else {
    BrowserWindow.fromWebContents(event.sender)?.maximize()
    return { status: true }
  }
})
ipcMain.handle('window-close', (event, args) => {
  BrowserWindow.fromWebContents(event.sender)?.close()
})

ipcMain.handle('open-errorbox', (event, arg) => {
  dialog.showErrorBox(
    arg.title,
    arg.message
  )
})


ipcMain.on('db-all-group-devices-by-devaddr', async (devaddr, callback) => {
  try {
    const result = await dataBase.readDevaddrsByGroup(undefined, devaddr);
    callback(devaddr); // вызываем обратный вызов и передаем ключи
  } catch (error) {
    console.error('Произошла ошибка при вставке строки в базу данных:', error);
    callback({ /*error: error.message*/ }); // передаем сообщение об ошибке через обратный вызов
  }
});

ipcMain.handle('read-rows-from-device-table', async (event, columns) => {
  try {
    // Выполняем readRows с передачей массива колонок
    const result = await dataBase.readRowsFromDeviceTable(columns);
    return result; // Возвращаем результат для отправки в рендерерный процесс
  } catch (error) {
    console.error('Ошибка при выполнении операции:', error);
    return []; // В случае ошибки возвращаем пустой массив
  }
});

ipcMain.handle('read-devaddrs-by-group', async (event, devgroup) => {
  try {
    // Выполняем readRows с передачей массива колонок
    const result = await dataBase.readDevaddrsByGroup(devgroup);
    return result; // Возвращаем результат для отправки в рендерерный процесс
  } catch (error) {
    console.error('Ошибка при выполнении read-devaddrs-by-group:', error);
    return []; // В случае ошибки возвращаем пустой массив
  }
});

ipcMain.handle('read-devaddr-for-more-info', async (event) => {
  try {
    // Выполняем readRows с передачей массива колонок
    return devAddrForMoreInfo
  } catch (error) {
    console.error('Ошибка при получении devaddr for more info:', error);
    return null; // В случае ошибки возвращаем пустой массив
  }
});

ipcMain.handle('read-last-data-by-devaddrs', async (event, devaddrs, emulate) => {
  try {
    if (emulate) {
      devaddrs.forEach(item => {
        const devaddr = item.devaddr
        dataBase.fillDeviceTableWithRandomData(devaddr, 1);
      });
    }
    console.log("here");
    const result = await dataBase.readLastDataByDevaddrs(devaddrs);
    return result; // Возвращаем результат для отправки в рендерерный процесс
  } catch (error) {
    console.error('Ошибка при выполнении read-last-data-by-devaddrs:', error);
    return []; // В случае ошибки возвращаем пустой массив
  }
});

ipcMain.handle('read-rows-by-devaddr', async (event, devaddr, numRows) => {
  try {
    const result = await dataBase.readRowsByDevaddr(devaddr, numRows);
    return result; // Возвращаем результат для отправки в рендерерный процесс
  } catch (error) {
    console.error('Ошибка при выполнении read-rows-by-devaddr:', error);
    return []; // В случае ошибки возвращаем пустой массив
  }
});

ipcMain.handle('db-handle-insert-row-by-devaddr', async (event, devAddr, data) => {
  try {
    console.log(devAddr, data);
    dataBase.insertRowByDevaddr(devAddr, data);
  } catch (error) {
    console.error('Произошла ошибка при вставке строки в базу данных:', error);
  }
});

ipcMain.handle('set-group', async (event, devaddr, devgroup) => {
  try {
    dataBase.setGroupByDevaddr(devaddr, devgroup);
  } catch (error) {
    console.error('Ошибка при выполнении set-group:', error);
  }
});
ipcMain.handle('start-server', async () => {
  try {
    const serveStatus = await Server.StartServer()
    return serveStatus
  } catch (error) {
    dialog.showErrorBox(
      'ОШИБКА',
      'ОШИБКА'
    )
    throw error; // Пробросьте ошибку, чтобы вызывающий ее процесс мог ее обработать
  }
});
ipcMain.on('db-sync-group-status', async (devAddr, alarmsAndWarnings, statusAck, callback) => {
  try {
    const groupStatus = await dataBase.syncGroupStatus(devAddr, alarmsAndWarnings, statusAck);
    callback(groupStatus);
  } catch (error) {
    console.error('Произошла ошибка при вставке строки в базу данных:', error);
    callback({});
  }
});

ipcMain.on('db-insert-row-dev-table', async (time, deveui, joineui, devaddr, callback) => {
  try {
    const keys = await dataBase.insertRowIfNotExsist(time, deveui, joineui, devaddr);
    callback(keys); // вызываем обратный вызов и передаем ключи
  } catch (error) {
    console.error('Произошла ошибка при вставке строки в базу данных:', error);
    callback({}); // передаем сообщение об ошибке через обратный вызов
  }
});

ipcMain.on('db-insert-row-by-devaddr', async (devAddr, data) => {
  try {
    dataBase.insertRowByDevaddr(devAddr, data);
  } catch (error) {
    console.error('Произошла ошибка при вставке строки в базу данных:', error);
  }
});
ipcMain.on('set-session-keys-by-devaddr', async (devAddr, appSKey, nwkSKey) => {
  dataBase.updateKeysByDevAddr(devAddr, appSKey, nwkSKey);
});
ipcMain.on('messageFromServer', (data, rinfo) => {
  lorawandataparser.parse(data, rinfo);
});

ipcMain.on('messageToServer', (data, rinfo) => {
  Server.SendMessage(data, rinfo);
});
ipcMain.handle('stop-server', async (event, arg) => {
  try {
    const serveStatus = await Server.StopServer()
    return serveStatus
  } catch (error) {
    dialog.showErrorBox(
      'ОШИБКА',
      'ОШИБКА',
    )
  }
});

ipcMain.handle('open-more-info', async (event, devaddr) => {
  devAddrForMoreInfo = devaddr
  let parentID = event.sender.id
  const childWin = new BrowserWindow({
    width: 842,
    height: 595,
    useContentSize: true,
    autoHideMenuBar: true,
    resizable: true,
    minWidth: 842,
    show: false,
    opacity: 1.0,
    //parent: parentID,
    //frame: IsUseSysTitle,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      preload: path.join(__dirname, "utils-preload.js"),
      //  enableRemoteModule: true,
      webviewTag: false,
      devTools: process.env.NODE_ENV === 'development',
      scrollBounce: process.platform === 'darwin',
      contextIsolation: false
    }
  });


  // Загрузка локального файла в окно
  childWin.loadURL(winURL + `moreInfo`);

  // Показ окна
  childWin.show();
});

ipcMain.handle('open-win', (event, arg) => {


  if(!appState.framelessWindow?.valid){
    appState.framelessWindow = new FramelessWindow();
  }
  
  const win = appState.framelessWindow?.browserWindow;
  if(win){
    // 居中到父窗体中
    const parent = win.getParentWindow();
    if(parent){
      const parentBounds = parent.getBounds();
      const x = Math.round(parentBounds.x + (parentBounds.width - win.getSize()[0]) / 2);
      const y = Math.round(parentBounds.y + (parentBounds.height - win.getSize()[1]) / 2);

      win.setPosition(x, y, false);
    }
    win.loadURL(winURL + `showChart`);
    win.show();
  }
  /*
  const childWin = new BrowserWindow({
    width: arg?.width || 842,
    height: arg?.height || 595,
    useContentSize: true,
    autoHideMenuBar: true,
    resizable: arg?.resizable ?? false,
    minWidth: arg?.minWidth || 842,
    show: arg?.show ?? false,
    opacity: arg?.opacity || 1.0,
    webPreferences: {
      preload: path.join(__dirname, "utils-preload.js"),
      nodeIntegration: true,
      webSecurity: false,
      webviewTag: arg?.webview ?? false,
      devTools: process.env.NODE_ENV === 'development',
      scrollBounce: process.platform === 'darwin',
      contextIsolation: true
    }
  });
  // Загрузка локального файла в окно
  childWin.loadURL(winURL + `showChart`);

  // Показ окна
  childWin.show();
  */
})

// === FALG LINE (DO NOT MODIFY/REMOVE) ===

export default utils;
export {
  FileUtils
};