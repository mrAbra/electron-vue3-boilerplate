import { Buffer } from "buffer";
import { ipcMain, dialog } from 'electron';
import payloadparser from "./payloadparser";
import alarmhadler from "./alarmhadler";

const AppKey = Buffer.from("C1FE94B0F5F6A50E83015B3C45C933A9", "hex");
const debugMode = false;
let devAddr = null;

class LoRaKeys {
    constructor() {
        this.AppKey = null;
        this.AppSKey = null;
        this.NwkSKey = null;
    }

    setAppKey(AppKey) {
        this.AppKey = AppKey;
    }

    setSessionKeys(AppSKey, NwkSKey) {
        this.AppSKey = AppSKey;
        this.NwkSKey = NwkSKey;
    }

    getAppKey() {
        return Buffer.from(this.AppKey, "hex");
    }

    getAppSKey() {
        return Buffer.from(this.AppSKey, "hex");
    }

    getNwkSKey() {
        return Buffer.from(this.NwkSKey, "hex");
    }
}

function getCurrentDateTimeString() {
    const currentDate = new Date(); // Создаем объект Date, представляющий текущую дату и время

    const year = currentDate.getFullYear(); // Получаем текущий год
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Получаем текущий месяц (добавляем 1, так как отсчет месяцев начинается с 0, и добавляем ведущий ноль)
    const day = String(currentDate.getDate()).padStart(2, '0'); // Получаем текущий день (добавляем ведущий ноль, если нужно)

    const hours = String(currentDate.getHours()).padStart(2, '0'); // Получаем текущие часы
    const minutes = String(currentDate.getMinutes()).padStart(2, '0'); // Получаем текущие минуты
    const seconds = String(currentDate.getSeconds()).padStart(2, '0'); // Получаем текущие секунды

    const dateTimeString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; // Собираем строку в формате "год-месяц-день часы:минуты:секунды"

    return dateTimeString; // Возвращаем строку, содержащую текущую дату и время
}



async function regenerateKeys(packet, lora_packet, NetIdBuffer, AppNonceBuffer, devNonce) {
    return new Promise((resolve, reject) => {
        ipcMain.emit('db-insert-row-dev-table',
            getCurrentDateTimeString(),
            packet.AppEUI.toString('hex'),
            packet.DevEUI.toString('hex'),
            devAddr,
            (keys) => {
                console.log("Пересоздаем ключи.");
                const sessionKeys = lora_packet.generateSessionKeys10(AppKey, NetIdBuffer, AppNonceBuffer, Buffer.from(devNonce, "hex"));
                if (debugMode) {
                    console.log("AppSKey:", sessionKeys.AppSKey.toString("hex"));
                    console.log("NwkSKey:", sessionKeys.NwkSKey.toString("hex"));
                }
                keysInstance.setSessionKeys(sessionKeys.AppSKey, sessionKeys.NwkSKey);
                ipcMain.emit('set-session-keys-by-devaddr', devAddr, sessionKeys.AppSKey, sessionKeys.NwkSKey);
                resolve(true);
            }
        );
    });
}


let keysInstance = new LoRaKeys();
keysInstance.setAppKey(AppKey);

export default {
    async waitForKeys(devAddr) {
        return new Promise((resolve, reject) => {
            ipcMain.emit('db-insert-row-dev-table',
                getCurrentDateTimeString(),
                undefined,
                undefined,
                devAddr,
                (keys) => {
                    if (keys.appSKey && keys.nwkSKey) {
                        console.log("Получены ключи:", keys.appSKey.toString("hex"), keys.nwkSKey.toString("hex"));
                        // Вызываем resolve и передаем ключи для обработки дальше
                        resolve(keys);
                    } else {
                        // Если ключи не были получены, вызываем reject
                        reject(new Error("Не удалось получить ключи"));
                    }
                }
            );
        });
    },
    async decode(payload) {
        const lora_packet = require("lora-packet");
        const buffer = Buffer.from((payload.toString("hex")), 'base64');
        const packet = lora_packet.fromWire(buffer);
        console.log(packet.getMType());
        if (debugMode) {
            console.log("packet.toString()=\n" + packet);
        }

        if (packet.getMType() == "Join Request") {
            if (debugMode) {
                console.log(packet.getMType());
            }

            devAddr = packet.AppEUI.toString('hex').slice(-8);
            let devNonce = packet.DevNonce.toString('hex');
            const NetIdHexString = "001122"; //network identifier
            const AppNonceHexString = "334455"; // or JoinNonce non-repeating value provided by Join Server
            const NetIdBuffer = Buffer.from(NetIdHexString, "hex");
            const AppNonceBuffer = Buffer.from(AppNonceHexString, "hex");

            if (lora_packet.verifyMIC(packet, undefined, keysInstance.getAppKey())) {
                if (debugMode) {
                    console.log("VERIFIED");
                }
            } else {
                if (debugMode) {
                    console.log("NOT VERIFIED");
                }
                return;
            }

            const res = await regenerateKeys(packet, lora_packet, NetIdBuffer, AppNonceBuffer, devNonce);



            console.log("DEVADDR: ", packet.AppEUI.toString("hex").slice(-8));
            const constructedPacket = lora_packet.fromFields(
                {
                    MType: "Join Accept", // (default)
                    NetID: NetIdBuffer,
                    DevNonce: Buffer.from(devNonce, "hex"),
                    AppEUI: Buffer.from(packet.AppEUI, "hex"),
                    AppNonce: AppNonceBuffer,
                    DevAddr: Buffer.from(packet.AppEUI.toString("hex").slice(-8), "hex"), // big-endian
                    DLSettings: 0,
                    RxDelay: 1
                },
                null, // AppSKey
                null, // NwkSKey
                AppKey

            );

            const base64 = constructedPacket.getPHYPayload().toString('base64');
            if (debugMode) {
                console.log("wireFormatPacket.toString()=" + constructedPacket.getPHYPayload().toString("hex") + " base64= " + base64 + " wireFormatPacket length:" + constructedPacket.MACPayloadWithMIC.length);
            }

            return { base64: base64, mType: constructedPacket.getMType() };

        } else if (packet.getMType() == "Unconfirmed Data Up") {
            if (debugMode) {
                console.log("UNCONFIRMED_DATA_UP");
            }

            if (debugMode) {
                console.log("packet MIC=" + packet.MIC.toString("hex"));
                console.log("FRMPayload=" + packet.FRMPayload.toString("hex"));
            }
            let appSKey = null;
            let nwkSKey = null;
            const keys = await this.waitForKeys(packet.DevAddr.toString("hex"),);
            appSKey = keys.appSKey;
            nwkSKey = keys.nwkSKey;

            if (debugMode) {
                console.log("packet.toString()=\n", packet.toString());
                // check MIC
                console.log("MIC check=" + (lora_packet.verifyMIC(packet, nwkSKey) ? "OK" : "fail"));

                // calculate MIC based on contents
                console.log("calculated MIC=" + lora_packet.calculateMIC(packet, nwkSKey).toString("hex"));
            }
            // decrypt payload
            const data = lora_packet.decrypt(packet, appSKey, nwkSKey).toString("hex");
            if (debugMode) {
                console.log("Decrypted (hex)='0x" + data + "'");
            }

            //const data = "01009501006E0000000000000000000003000000000000000000000090000000000000000000000090000000F230A741000000009F00000";

            const parsedData = await payloadparser.avisParse(Buffer.from(data, "hex"), packet.DevAddr.toString("hex"));
            console.log(parsedData);

            ipcMain.emit('db-insert-row-by-devaddr',
                parsedData.toDataBase.devaddr,
                parsedData.toDataBase
            );

            if (parsedData.message != null) {
                // Создание буфера размером 2 байта
                const buffer = Buffer.allocUnsafe(2);
                // Запись числа в буфер как беззнаковое целое 16-битное число little-endian
                buffer.writeUInt16LE(parsedData.message, 0);
                console.log("PAYLOAD:", buffer);
                //alarmhadler.sendWarningMessages(parsedData.toDataBase.devaddr, parsedData.message, keys, packet.FCnt);
                const constructedPacket = lora_packet.fromFields(
                    {
                        MType: "Unconfirmed Data Down",
                        DevAddr: packet.DevAddr,
                        FCnt: packet.FCnt,
                        FPort: 0x0f,
                        //FOpts: Buffer.from([0x02, 0x07, 0x01]),
                        payload: buffer,
                    },
                    appSKey,
                    nwkSKey,
                );

                const base64 = constructedPacket.getPHYPayload().toString('base64');
                if (debugMode) {

                    console.log("packet.toString()=\n", constructedPacket.toString());
                    console.log("wireFormatPacket.toString()=" + constructedPacket.getPHYPayload().toString("hex") + " base64= " + base64);
                }
                return { base64: base64, mType: constructedPacket.getMType() };
            } else {
                return { base64: null, mType: "None" };
            }


        }
        return null;
    }
}

