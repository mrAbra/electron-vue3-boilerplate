import loradataparser from './loradataparser'
import { Buffer } from "buffer";
import { ipcMain, dialog } from 'electron';


const crypto = require('crypto');
let portB = null;
const PacketIdentifier = {
    PUSH_DATA: 0x00,
    PUSH_ACK: 0x01,
    PULL_DATA: 0x02,
    PULL_ACK: 0x04,
    PULL_RESP: 0x03,
    TX_ACK: 0x05
};

const pushDataFormat = { //0x00
    gatewayIdentifier: "Gateway unique identifier (MAC address)",
    payload: "JSON object, starting with {, ending with }, see section 4"
};
/*
  const pushAckPacketFormat = { //0x01
  };

  const pullDataPacketFormat = {  //0x02
    gatewayIdentifier: "Gateway unique identifier (MAC address)",
  };
  

  const pullRespPacketFormat = { //0x04
    payload: "JSON object, starting with {, ending with }, see section 6",
  };


  const txAckPacketFormat = { //0x05
    gatewayIdentifier: "Gateway unique identifier (MAC address)",
    payload: "[optional] JSON object, starting with {, ending with }, see section 6",
  };
  */
let pullACKsended = false;

export default {
    async parse(data, rinfo) {
        let packetHeader = { // Создание нового объекта packetHeader
            protocolVersion: 0x02,
            token: null,
            identifier: null
        };

        // console.log('Received data from server:', data, rinfo);

        if (packetHeader.protocolVersion !== data[0]) {
            console.log('Wrong protocol version');
        }

        packetHeader.token = data.slice(1, 3);
        packetHeader.identifier = data[3];

        switch (packetHeader.identifier) {
            case PacketIdentifier.PUSH_DATA:
                // Handle PULL_ACK packet
                //console.log("PUSH_DATA");
                let pushDataPacket = pushDataFormat;
                pushDataPacket.gatewayIdentifier = data.slice(4, 12);
                console.log('GateAway:', pushDataPacket.gatewayIdentifier);

                let pushAckPayload = Buffer.from(packetHeader.protocolVersion.toString('32').padStart(2, '0') + packetHeader.token.toString('hex') + '01', 'hex');
                //console.log("PUSHACK: ", pushAckPayload);
                ipcMain.emit('messageToServer', pushAckPayload, rinfo);

                if (data && data.length > 12) {
                    pushDataPacket.payload = data.slice(12).toString('utf-8');
                    const payloadJSON = JSON.parse(pushDataPacket.payload);
                    const rxpkArray = payloadJSON.rxpk;
                    console.log("JSON: ", pushDataPacket.payload);
                    // Проверка наличия объектов rxpk
                    if (rxpkArray && rxpkArray.length > 0) {
                        // Получение первого объекта rxpk из массива
                        const firstRxpk = rxpkArray[0];

                        // Получение данных из первого объекта rxpk
                        const data = firstRxpk.data;

                        // Вывод данных в консоль
                        let message = await loradataparser.decode(data.toString());
                        let tmst = firstRxpk.tmst;
                        switch (message.mType) {
                            case "Join Accept":
                                tmst = tmst + 5000000;
                                break;
                            case "Unconfirmed Data Down":
                                tmst = tmst + 1000000; //TODO check minimal latency
                                break;
                            default:
                                console.log('Unknown packet identifier:', message.mType);
                        }
                        if (message.base64 != null) {
                            const binaryData = Buffer.from(message.base64, "base64");
                            // Получение размера бинарных данных
                            const sizeInBytes = binaryData.length;
                            const txpk = {
                                "imme": false,
                                "freq": firstRxpk.freq,
                                "tmst": tmst,
                                "rfch": 0,
                                "powe": 16,
                                "ant": 0,
                                "brd": 0,
                                "modu": firstRxpk.modu,
                                "datr": firstRxpk.datr,
                                "codr": firstRxpk.codr,
                                "ipol": true,
                                "size": sizeInBytes,
                                "data": message.base64  //PHYPayload // Используйте значение PHYPayload здесь
                            };
                            // Преобразование JSON в строку
                            const txpkString = JSON.stringify({ txpk });
                            const txpkDataBuffer = Buffer.from(txpkString);
                            console.log("txpk буфер: " + txpkDataBuffer);
                            let pullRespPayload = Buffer.concat([Buffer.from(packetHeader.protocolVersion.toString('32').padStart(2, '0') + crypto.randomBytes(2).toString('hex') + '03', 'hex'), txpkDataBuffer]);
                            if (pullACKsended) {
                                rinfo.port = portB;
                                ipcMain.emit('messageToServer', pullRespPayload, rinfo);
                            } else {
                                console.log("NO PULLACK");
                            }
                        }
                    } else {
                        console.log('No rxpk objects found.');
                    }
                }
                break;
            case PacketIdentifier.PULL_ACK:
                //console.log("PULL_ACK");
                // Handle PULL_ACK packet
                break;
            case PacketIdentifier.PULL_DATA:
                //console.log("PULL_DATA");
                //console.log('GateAway:', data.slice(4,12));
                if (!pullACKsended || rinfo.port != portB) {
                    let payload = Buffer.from(packetHeader.protocolVersion.toString('32').padStart(2, '0') + packetHeader.token.toString('hex') + '04', 'hex'); // Исправлено
                    //console.log("PAYLOAD: ", portB, payload);
                    portB = rinfo.port;
                    ipcMain.emit('messageToServer', payload, rinfo);
                    pullACKsended = true;
                }
                // Handle PULL_ACK packet
                break;
            case PacketIdentifier.PULL_RESP:
                console.log("PULL_RESP");
                // Handle PULL_ACK packet
                break;
            case PacketIdentifier.PUSH_DATA:
                console.log("PUSH_DATA");
                // Handle PULL_ACK packet
                break;
            case PacketIdentifier.TX_ACK:
                console.log("TX_ACK");
                console.log(data);
                if (data && data.length > 12) {
                    let txackPacket = pushDataFormat;
                    txackPacket.payload = data.slice(12).toString('utf-8');
                    const payloadJSON = JSON.parse(txackPacket.payload);
                    console.log("JSON TX_ACK: ", payloadJSON);
                }
                // Проверка наличия объектов rxpk

                // Handle PULL_ACK packet
                break;
            // Add cases for other packet identifiers as needed
            default:
                console.log('Unknown packet identifier:', packetHeader.identifier);
        }
    }
}