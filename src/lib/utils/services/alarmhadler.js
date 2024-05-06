import { ipcMain } from 'electron';
import { lorawandataparser} from './lorawandataparser';
import {loradataparser} from './loradataparser'; //TODO import only waitForKeys


const ST_AVIS_ERR = {
    ST_BIT_LIMIT1: 0,                             // бит 0  - Порог 1 +
    ST_BIT_LIMIT2: 1,                             // бит 1  - Порог 2 +
    ST_BIT_LIMIT3: 2,                             // бит 2  - Порог 3 +
    ST_BIT_LIMIT_STEL: 3,                         // бит 3  - Порог STEL +
    ST_BIT_LIMIT_TWA: 4,                          // бит 4  - Порог TWA +
    ST_BIT_EXCEEDED_THE_RANGE: 5,                 // бит 5  - Превышение диапазона +
    ST_BIT_SENSOR_FAILED: 6,                      // бит 6  - Сенсор вышел из строя или не подключен
    ST_BIT_AUTO_ZERO_ERR: 7,                      // бит 7  - Ошибка при калибровке нуля(выставляется на третий раз как в ТЗ) +
    ST_BIT_AUTO_SPAN_ERR: 8,                      // бит 8  - Ошибка при калибровке диапазона(выставляется на третий раз как в ТЗ) +
    ST_BIT_CALIB_INTERVAL: 9,                     // бит 9  - Время калибровки(err) +
    ST_BIT_ERR_ADC: 10,                           // бит 10 - Ошибка микросхемы ADC
    ST_BIT_ERR_MCP4652: 11,                       // бит 11 - Ошибка микросхемы mcp4652
    ST_BIT_ERR_MCP47: 12                          // бит 12 - Ошибка микросхемы mcp47c
  };


export default {
// Проверка предупреждение на приборе
async checkErr(stateErr, devAddr, stateErrAck){ 
    let alarmsAndWarnings = 0;

    if (stateErr & ST_AVIS_ERR.ST_BIT_LIMIT1) {
        alarmsAndWarnings = alarmsAndWarnings || ST_AVIS_ERR.ST_BIT_LIMIT1;
    }
    if (stateErr & ST_AVIS_ERR.ST_BIT_LIMIT2) {
        alarmsAndWarnings = alarmsAndWarnings || ST_AVIS_ERR.ST_BIT_LIMIT2;
    }
    if (stateErr & ST_AVIS_ERR.ST_BIT_LIMIT3) {
        alarmsAndWarnings = alarmsAndWarnings || ST_AVIS_ERR.ST_BIT_LIMIT3;
    }
    //TODO: не возвращать обьект
    let testxor = alarmsAndWarnings;
    alarmsAndWarnings = await this.syncGroupStatus(devAddr, alarmsAndWarnings, stateErrAck);

    //console.log("AFTER sync :", testxor ^ alarmsAndWarnings,alarmsAndWarnings );
    return testxor ^ alarmsAndWarnings;
},

async syncGroupStatus(devAddr, alarmsAndWarnings, statusAck){
    return new Promise((resolve, reject) => {
        ipcMain.emit('db-sync-group-status', 
            devAddr,
            alarmsAndWarnings,
            statusAck,
            (groupStatus) => {
                if (groupStatus) {
                    console.log("Статус группы:", groupStatus);
                    // Вызываем resolve и передаем ключи для обработки дальше
                    resolve(groupStatus);
                } else {
                    // Если ключи не были получены, вызываем reject
                    reject(new Error("Не удалось получить статус группы"));
                }
            }
        );
    });
},

getAllGroupsDevices(devaddr){
    return new Promise((resolve, reject) => {
        ipcMain.emit('db-all-groups-devices', 
            devaddr,
            (devaddrs) => {
                if (devaddrs) {
                    //console.log("Получены устройства:", devaddrs);
                    // Вызываем resolve и передаем ключи для обработки дальше
                    resolve(devaddrs);
                } else {
                    // Если ключи не были получены, вызываем reject
                    reject(new Error("Не удалось получить ключи"));
                }
            }
        );
    });
},
// Проверка оповещение об предупреждениях
checkErrAck(stateErrAck){
    
}

}

