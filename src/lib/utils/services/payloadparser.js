import alarmhadler  from "./alarmhadler";

const gasTable = {
    1: 'Метан CH4',
    2: 'Этилен C2H4',
    3: 'Пропан C3H8',
    4: 'н-бутан C4H10',
    5: '1-бутен C4H8',
    6: '2-метилпропан (изобутан) i-C4H10',
    7: 'н-пентан C5H12',
    8: 'Циклопентан С5Н10',
    9: 'н-гексан C6H14',
    10: 'Циклогексан С6Н12',
    11: 'Этан C2H6',
    12: 'Метанол СН3OH',
    13: 'Бензол С6Н6',
    14: 'Пропилен (пропен)C3H6',
    15: 'Этанол С2Н5ОН',
    16: 'н-гептан С7Н16',
    17: 'Оксид этилена С2Н4О',
    18: 'Диоксид углерода СО2',
    19: '2-пропанон (ацетон) C3H6O',
    20: '2-метилпропен (изобутилен) i-C4H8',
    21: '2-метил-1,3- бутадиен (изопрен) C5H8',
    22: 'Ацетилен С2Н2',
    23: 'Акрилонитрил C3H3N',
    24: 'Метилбензол (толуол) С7Н8',
    25: 'Этилбензол С8Н10',
    26: 'н-октан С8Н18',
    27: 'Этилацетат С4Н8О2',
    28: 'Бутилацетат С6Н12О2',
    29: '1,3-бутадиен (дивинил) С4Н6',
    30: '1,2-дихлорэтан С2Н4Cl2',
    31: 'Диметилсульфид C2H6S',
    32: '1-гексен С6Н12',
    33: '2-бутанол (втор-бутанол) sec-C4H9OH',
    34: 'Винилхлорид С2Н3Cl',
    35: 'Циклопропан С3Н6',
    36: 'Диметиловый эфир С2Н6О',
    37: 'Диэтиловый эфир С4Н10О',
    38: 'Оксид пропилена С3Н6О',
    39: 'Хлорбензол C6H5Cl',
    40: '2-бутанон (метилэтилкетон) C4H8O',
    41: '2-метил-2-пропанол (трет-бутанол) tert-С4Н9ОH',
    42: '2-метокси-2- метилпропан (метилтретбутиловый эфир) Tert-С5Н12О',
    43: '2-пропанол (изопропанол) i-С3Н7ОН',
    44: 'Октен С8Н16',
    45: '2-метилбутан (изопентан) i-С5Н12',
    46: 'Метантиол (метилмеркаптан) СН3SH',
    47: 'Этантиол (этилмеркаптан) С2Н5SH',
    48: 'Ацетонитрил С2Н3N',
    49: 'Диметилдисульфид С2Н6S2',
    50: 'Бензин',
    51: 'Дизельное топливо',
    52: 'Керосин',
    53: 'Уайт-спирит',
    54: 'Аммиак NH3',
    55: 'Сумма углеводородов по метану С2-С10 (поверочный компонент метан)',
    56: 'Сумма углеводородов С2-С10 (поверочный компонент пропан)',
    57: 'Сероводород Н2S',
    58: 'Хлористый водород HCL',
    59: 'Фтористый водород HF',
    60: 'Озон O3',
    61: 'Моносилан (силан) SiH4',
    62: 'Оксид азота NO',
    63: 'Диоксид азота NO2',
    64: 'Цианистый водород HCN',
    65: 'Оксид углерода CO',
    66: 'Диоксид серы SO2',
    67: 'Хлор Cl2',
    68: 'Кислород О2',
    69: 'Водород Н2',
    70: 'Формальдегид СН2О2',
    71: 'Несимметричный диметилгидразин С2Н8N2',
    72: 'Карбонилхлорид (фосген) СOCl2',
    73: 'Фтор F2',
    74: 'Фосфин PH3',
    75: 'Арсин AsH3',
    76: 'Уксусная кислота C2H4O2',
    77: 'Гидразин N2H4',
    78: 'Фенилэтилен (стирол) (винилбензол) C8H8',
    79: 'н-пропилацетат C5H10O2',
    80: 'Эпихлоргидрин C3H5СlO',
    81: 'Хлористый бензил C7H7Сl',
    82: 'Фурфуриловый спирт C5H6O2',
    83: 'Моноэтанолами н (2- аминоэтанол) C2H7NO',
    84: '1-бутанол C4H9OH',
    85: 'Диэтиламин C4H11N',
    86: 'Фенол C6H5OH',
    87: '1,3- диметилбензол (м-ксилол) m-C8H10',
    88: '1,2- диметилбензол (о-ксилол) o-C8H10',
    89: '1,4- диметилбензол (п-ксилол) p-C8H10',
    90: 'Нафталин С10Н8',
    91: 'Бром Br2',
    92: '2,3-дитиабутан (диметилдисуль фид) С2Н6S2',
    93: '2,5-фурандион (малеиновый ангидрид) C4H2O3',
    94: 'Дисульфид углерода (сероуглерод) CS2',
    95: 'Диметилсульфид C2H6S',
    96: 'Муравьиная кислота CH2O2',
    97: 'Этилцеллозольв (2- этоксиэтанол) С4Н10O2',
    98: '2-метил-1- пропанол (изобутанол) i- C4H9OH',
    99: 'Циклогексанон C6H10O',
    100: 'Tетраэтилортосиликат (TEOС) C8H20O4Si',
    101: 'Акролеин C3H4O',
};

const unitTable = {
    1: 'ppm',
    2: 'мг/м³',
    3: 'НКПР',
    4: 'об/д',
};
export default {

/*
    typedef struct{
        float     Concentration;
        uint16_t  StateErr;
        uint16_t  num_formula_gas;  // Номер формулы газа
        uint8_t   Setting;
      }sensor_data_lora_t;
      
      typedef struct{
        uint16_t   data_struct_ver;
        uint16_t   dev_id;
        uint8_t   dev_hw_ver;
        uint8_t   dev_fw_ver;
        float    longitude;
        float     latitude;
        uint8_t   sensors_enabled;
        uint8_t    Alarm;
        sensor_data_lora_t   sensors[COUNT_CHAN];
      }str_lora_data_set_t;
*/


async avisParse(data, devAddr) {
    const dataStructVer = data.readUInt8(0);
    const deviceId = data.readUInt16LE(1);
    const hwVersion = data.readUInt8(3);
    const fwVersion = data.readUInt8(4);
    const longitude = data.readFloatLE(5).toFixed(6);
    const latitude = data.readFloatLE(9).toFixed(6);
    const sensorsEnabled = data.readUInt8(13);
    const stateErrAck = data.readUInt8(14);

    let sensorData = [];
    let alarmsAndWarnings = 0;

    for (let i = 15; i + 9 <= data.length; i += 9) {
        const sensorPacket = {
            Concentration: data.readFloatLE(i),
            StateErr: data.readUInt16LE(i + 4),
            num_formula_gas: gasTable[data.readUInt16LE(i + 6)],
            Setting:   unitTable[data.readUInt8(i + 8) ^ 0x3],
        };
        console.log("STATEERR:", sensorPacket.StateErr)
        alarmsAndWarnings = alarmsAndWarnings || sensorPacket.StateErr;

        sensorData.push(sensorPacket);
    }
    alarmsAndWarnings = await alarmhadler.checkErr(alarmsAndWarnings, devAddr);

    if(alarmsAndWarnings == stateErrAck){
        alarmsAndWarnings = null;
    }
    console.log("alarmsAndWarnings message :",alarmsAndWarnings );
    return {
        toDataBase: {
            type: 'Feature',
            dataStructVer: dataStructVer,
            devaddr: devAddr,
            devid: deviceId,
            id: devAddr,
            sensorsEnabled: sensorsEnabled,
            properties: {
                status: 1,
            },
            hw_version: hwVersion,
            fw_version: fwVersion,
            sensor_data: sensorData,
            stateErrAck: stateErrAck,
            geometry: {
                type: "Point",
                coordinates: [longitude, latitude]
            }
        },
        message: alarmsAndWarnings,
    };
}

}