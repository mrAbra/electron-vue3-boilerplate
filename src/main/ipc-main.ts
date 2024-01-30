import { app, BrowserWindow, ipcMain } from "electron";
import { appState } from "./app-state";
import * as fd from "./util/file-download";
import * as fdTypes from "../shared/file-download-types";
import { GetErrorMessage } from "../shared/error-utils";
import { CreateFramelessWindow } from "./frameless-window";

function RegisterIPCHandler(){
  ipcMain.on("message", (event, message) => {
    console.log(message);
  });

  ipcMain.on("show-frameless-sample-window", () => {
    if(appState.framelessWindow){
      appState.framelessWindow.show();
    }else{
      appState.framelessWindow = CreateFramelessWindow();
    }
  });
  
  function delay(time){
    return new Promise(resolve => setTimeout(resolve, time));
  }
  
  ipcMain.handle("async-exit-app", async() => {
    await delay(1500);
    appState.willExitApp = true;
    app.quit();
  });

  // According to bug https://github.com/electron/electron/issues/25196
  // Electron can not pass rejected promise to renderer correctly.
  // So we do not throw exception in handle function.
  ipcMain.handle("async-download-file", async(event, options : fdTypes.Options) => {
    const win = BrowserWindow.getFocusedWindow();
    try {
      const result = await fd.Download(options, win);
      return result;
    } catch (err){
      const result : fdTypes.Result = {
        uuid: options.uuid,
        success: false,
        canceled: false,
        error: GetErrorMessage(err),
        fileSize: 0,
      };
      return result;
    }
  });

  ipcMain.on("cancel-download-file", (event, uuid) => {
    if(uuid){
      fd.Cancel(uuid);
    }
  });
}

export { RegisterIPCHandler };