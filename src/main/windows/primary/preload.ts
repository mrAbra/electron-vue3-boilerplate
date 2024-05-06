import { contextBridge, ipcRenderer } from "electron";

/*
暴露primary窗口主进程的方法到primary窗口的渲染进程
*/
contextBridge.exposeInMainWorld("primaryWindowAPI", {
  sendMessage: (message: string) => ipcRenderer.send("message", message),
  showFramelessSampleWindow: () => ipcRenderer.send("show-frameless-sample-window"),
  openExternalLink: (url: string) => ipcRenderer.send("open-external-link", url),
  clearAppConfiguration: () => ipcRenderer.send("clear-app-configuration"),
  onShowExitAppMsgbox: (callback) => ipcRenderer.on("show-exit-app-msgbox", () => {
    callback();
  }),
  onShowClosePrimaryWinMsgbox: (callback) => ipcRenderer.on("show-close-primary-win-msgbox", () => {
    callback();
  }),
  //LandingPage
  openWin: (data: any) => ipcRenderer.invoke("open-win", data),
  //Monitor
  readDevaddrsByGroup: (selectedGroup: any) => ipcRenderer.invoke("read-devaddrs-by-group", selectedGroup),
  readLastDataByDevaddrs: (selectedDevaddrs: any, emulate: any) =>  ipcRenderer.invoke("read-last-data-by-devaddrs", selectedDevaddrs, emulate),
  openMoreInfo: (id: any) => ipcRenderer.invoke("open-more-info", id),
  //Form
  readRowsFromDeviceTable: (columns: any ) => ipcRenderer.invoke("read-rows-from-device-table", columns),
  setGroup: (selectedDevaddr: any, devgroup: any ) => ipcRenderer.invoke("set-group", selectedDevaddr, devgroup),
  //Emulator
  inserRowByDevaddr: (selectedDevaddr : any , generatedFeature: any ) => ipcRenderer.invoke('db-handle-insert-row-by-devaddr', selectedDevaddr, generatedFeature),
  asyncExitApp: () => ipcRenderer.invoke("async-exit-app"),
  minToTray: () => ipcRenderer.send("min-to-tray"),
  httpGetRequest: (url:string) => ipcRenderer.send("http-get-request", url),
});
