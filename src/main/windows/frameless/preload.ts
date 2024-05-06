import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("framelessWindowAPI", {
  minimizeWindow: () => ipcRenderer.send("minimize-window"),
  restoreWindow: () => ipcRenderer.send("restore-window"),
  closeWindow: () => ipcRenderer.send("close-window"),
  readRowsFromDeviceTable: (columns: any ) => ipcRenderer.invoke("read-rows-from-device-table", columns),
  setGroup: (selectedDevaddr: any, devgroup: any ) => ipcRenderer.invoke("set-group", selectedDevaddr, devgroup),
  //Emulator
  inserRowByDevaddr: (selectedDevaddr : any , generatedFeature: any ) => ipcRenderer.invoke('db-handle-insert-row-by-devaddr', selectedDevaddr, generatedFeature),
});
