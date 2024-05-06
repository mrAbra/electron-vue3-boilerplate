const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');


function getCurrentDateTimeString(i) {
  const currentDate = new Date(); // Создаем объект Date, представляющий текущую дату и время

  const year = currentDate.getFullYear(); // Получаем текущий год
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Получаем текущий месяц (добавляем 1, так как отсчет месяцев начинается с 0, и добавляем ведущий ноль)
  const day = String(currentDate.getDate()).padStart(2, '0'); // Получаем текущий день (добавляем ведущий ноль, если нужно)

  const hours = String(currentDate.getHours()).padStart(2, '0'); // Получаем текущие часы
  const minutes = String(currentDate.getMinutes()).padStart(2, '0'); // Получаем текущие минуты
  const seconds = String(currentDate.getSeconds()).padStart(2, '0'); // Получаем текущие секунды

  const dateTimeString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds + i}`; // Собираем строку в формате "год-месяц-день часы:минуты:секунды"

  return dateTimeString; // Возвращаем строку, содержащую текущую дату и время
}

function generateRandomData(deviceId, baseCoordinates) {
  // Генерируем случайные смещения для координат
  const deltaLatitude = (Math.random() * 0.001) - 0.0001; // Пример: от -0.0005 до 0.0005 градусов (эквивалентно 5-10 метрам на север/юг)
  const deltaLongitude = (Math.random() * 0.001) - 0.0001; // Пример: от -0.0005 до 0.0005 градусов (эквивалентно 5-10 метрам на восток/запад)

  // Рассчитываем новые координаты на основе смещений
  const newLatitude = baseCoordinates[1] + deltaLatitude;
  const newLongitude = baseCoordinates[0] + deltaLongitude;

  return {
    type: 'Feature',
    id: deviceId,
    properties: {
      status: 1,
    },
    hw_version: 1,
    fw_version: 1,
    sensor_data: {
      Channel: Math.floor(Math.random() * 100), // Пример генерации случайных данных
      Concentration: Math.floor(Math.random() * 100) + "%",
      State: Math.random() < 0.5 ? "Active" : "Inactive",
      StateErr: Math.random() < 0.5 ? "YES" : "NO",
      Setting: "Reserved"
    },
    geometry: {
      type: "Point",
      coordinates: [newLongitude, newLatitude]
    }
  };
}

class DataBase {
  mainWindow;
  db;

  constructor() {
    // Проверяем существование файла базы данных
    if (!fs.existsSync('database.db')) {
      this.db = new sqlite3.Database('database.db');
      this.createTable();
    } else {
      this.db = new sqlite3.Database('database.db');
    }
  }

  createTable() {
    this.db.serialize(() => {
      this.db.run("CREATE TABLE DeviceTable (date TEXT, joineui TEXT, deviceeui TEXT, devaddr TEXT, devgroup INTEGER, appSKey TEXT, nwkSKey TEXT, statusAck INTEGER)");
      this.db.run("CREATE TABLE GroupsTable (index INTEGER, status INTEGER)");
    });
  }

  insertRowIfNotExsist(dateValue, joineuiValue, deviceeuiValue, devaddr) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Проверяем, существует ли уже устройство с таким devaddr
        this.db.get("SELECT * FROM DeviceTable WHERE devaddr = ?", [devaddr], (err, row) => {
          if (err) {
            console.error('Ошибка при выполнении запроса SELECT:', err);
            reject(err);
          } else {
            // Если устройство с таким devaddr уже существует
            if (row) {
              //console.log('Устройство с таким devaddr уже существует:', devaddr, row.appSKey, row.nwkSKey);
              resolve({ appSKey: row.appSKey, nwkSKey: row.nwkSKey });
            } else {
              // Устройство с таким devaddr еще не существует, выполняем операцию вставки
              const stmt = this.db.prepare("INSERT INTO DeviceTable (date, joineui, deviceeui, devaddr) VALUES (?, ?, ?, ?)");
              stmt.run(dateValue, joineuiValue, deviceeuiValue, devaddr);
              stmt.finalize();
              console.log('Устройство успешно добавлено:', devaddr);
              resolve({});
            }
          }
        });
      });
    });
  }


  async syncGroupStatus(devAddr, alarmsAndWarnings, statusAck) {
    return new Promise(async (resolve, reject) => {
      //console.log(devAddr);
      // Получение строки из таблицы DeviceTable
      const rowDevTable = await this.readRowFromDeviceTable(devAddr);


      if (!rowDevTable) {
        throw new Error("Устройство с указанным devaddr не найдено");
      }

      // Получение строки из таблицы GroupsTable
      const rowGroup = await this.readRowFromGroupsTable(rowDevTable.devgroup);


      alarmsAndWarnings = rowGroup.status || alarmsAndWarnings;
      //console.log("IN DATABASE:", alarmsAndWarnings, rowDevTable, rowGroup);

      // Обновление строки в таблице GroupsTable
      await new Promise((resolve, reject) => {
        const updateQuery = "UPDATE GroupsTable SET status = ? WHERE groupIndex = ?";
        this.db.get(updateQuery, [alarmsAndWarnings, rowDevTable.devgroup], (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      // Обновление строки в таблице DeviceTable
      alarmsAndWarnings = (statusAck ^ 0xFFFF) & alarmsAndWarnings;
      await new Promise((resolve, reject) => {
        const updateQuery = "UPDATE DeviceTable SET statusAck = ? WHERE devaddr = ?";
        this.db.get(updateQuery, [statusAck, devAddr], (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      resolve(alarmsAndWarnings);
    });
  }

  insertRowByDevaddr(devaddr, data) {
    this.db.serialize(() => {
      this.db.run(`CREATE TABLE IF NOT EXISTS ${devaddr} (date TEXT, jsondata TEXT)`);
    });
    const dateValue = getCurrentDateTimeString(0);
    try {
      // Создаем объект данных для таблицы
      const stmt = this.db.prepare(`INSERT INTO ${devaddr} (date, jsondata) VALUES (?, ?)`);
      stmt.run(dateValue, JSON.stringify(data));
      stmt.finalize();

      //console.log(`Пакет данных добавлен в таблицу для устройства с идентификатором ${deviceId}`);
    } catch (error) {
      console.error('Произошла ошибка при добавлении пакета данных:', error);
    }

  }

  fillDeviceTableWithRandomData(deviceId, numOfPackets) {
    this.db.serialize(() => {
      this.db.run(`CREATE TABLE IF NOT EXISTS ${deviceId} (date TEXT, jsondata TEXT)`);
    });


    for (let i = 0; i < numOfPackets; i++) {

      const dateValue = getCurrentDateTimeString(i);
      if (i == 0) {
        this.insertRowIfNotExsist(dateValue, "joineuiValue", "deviceeuiValue", deviceId);
      }
      const baseCoordinates = [37.6477, 55.732];
      const randomData = generateRandomData(deviceId, baseCoordinates);
      //console.log(deviceId);
      try {
        // Создаем объект данных для таблицы
        const stmt = this.db.prepare(`INSERT INTO ${deviceId} (date, jsondata) VALUES (?, ?)`);
        stmt.run(dateValue, JSON.stringify(randomData));
        stmt.finalize();

        //console.log(`Пакет данных добавлен в таблицу для устройства с идентификатором ${deviceId}`);
      } catch (error) {
        console.error('Произошла ошибка при добавлении пакета данных:', error);
      }
    }
  }



  updateKeysByDevAddr(devaddr, appSKey, nwkSKey) {
    return new Promise((resolve, reject) => {
      // Выполняем запрос к базе данных для обновления ключей
      const query = "UPDATE DeviceTable SET appSKey = ?, nwkSKey = ? WHERE devaddr = ?";
      this.db.run(query, [appSKey, nwkSKey, devaddr], function (err) {
        if (err) {
          console.error('Ошибка при обновлении ключей в базе данных:', err);
          reject(err); // Отклоняем промис при ошибке
        } else {
          // Проверяем, была ли обновлена хотя бы одна строка
          if (this.changes > 0) {
            console.log('Ключи успешно обновлены для устройства с devaddr:', devaddr);
            resolve(); // Разрешаем промис при успешном обновлении
          } else {
            console.log('Устройство c devaddr', devaddr, 'не найдено');
            reject(new Error('Устройство c указанным devaddr не найдено')); // Отклоняем промис, если строка не найдена
          }
        }
      });
    });
  }

  setGroupByDevaddr(devaddr, devgroup) {
    return new Promise((resolve, reject) => {
      const query = "UPDATE DeviceTable SET devgroup = ? WHERE devaddr = ?";
      this.db.run(query, [devgroup, devaddr], function (err) {
        if (err) {
          console.error('Ошибка при обновлении группы:', err);
          reject(err); // Отклоняем промис при ошибке
        } else {
          // Проверяем, была ли обновлена хотя бы одна строка
          if (this.changes > 0) {
            console.log('Группа успещно обновлена для:', devaddr);
            resolve(); // Разрешаем промис при успешном обновлении
          } else {
            console.log('Устройство c devaddr', devaddr, 'не найдено');
            reject(new Error('Устройство c указанным devaddr не найдено'));
          }
        }
      });
    });
  }

  readRowFromGroupsTable(index) {
    return new Promise((resolve, reject) => {
      //console.log("INDEX: ", index);
      const query = "SELECT * FROM GroupsTable WHERE groupIndex = ?";
      this.db.get(query, [index], (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row) {
            resolve(row);
          } else {
            reject(new Error("Группа с указанным groupIndex не найдена"));
          }
        }
      });
    });
  }

  readRowFromDeviceTable(devaddr) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM DeviceTable WHERE devaddr = ?`;

      this.db.get(query, [devaddr], (err, row) => {
        if (err) {
          console.error('Ошибка при получении данных из базы данных:', err);
          reject(err);
        } else {
          if (row) {
            resolve(row);
          } else {
            resolve({});
          }
        }
      });
    });
  }

  readDevaddrsByGroup(devgroup, devAddr) {
    return new Promise((resolve, reject) => {
      const rows = []; // Создаем массив для хранения результатов
      const executeQuery = (devgroup) => {
        // Запрос SQL для извлечения devaddr по devgroup
        const query = "SELECT devaddr FROM DeviceTable WHERE devgroup = ?";
        this.db.each(query, [devgroup], (err, row) => {

          if (err) {
            console.error('Ошибка при получении данных из базы данных:', err);
            reject(err); // Отклоняем промис при ошибке
          } else {
            rows.push(row); // Добавляем строку в массив
          }
        }, (err, rowCount) => {
          if (err) {
            console.error('Ошибка при получении данных из базы данных:', err);
            reject(err); // Отклоняем промис при ошибке
          } else {
            //console.log(rows);
            resolve(rows); // Разрешаем промис и передаем массив строк
          }
        });
      }
      if (devgroup === undefined) {
        // Если devgroup не определен, выполняем запрос для извлечения группы по devaddr
        const queryDevgroup = "SELECT devgroup FROM DeviceTable WHERE devaddr = ?";
        this.db.get(queryDevgroup, [devAddr], (error, results) => {
          if (error) {
            console.error("Ошибка выполнения запроса:", error);
            reject(error);
          } else {
            // Если запрос выполнен успешно, присваиваем значение devgroup
            devgroup = results[0].devgroup;
            executeQuery(devgroup);
          }
        });
      } else {
        executeQuery(devgroup);
      }


    });
  }


  readLastDataByDevaddrs(devaddrs) {
    return new Promise((resolve, reject) => {
      const promises = []; // Массив для хранения промисов запросов

      const results = {}; // Создаем объект для хранения результатов

      // Проходимся по каждому объекту в массиве devaddrs
      devaddrs.forEach(item => {
        const devaddr = item.devaddr; // Получаем devaddr из текущего объекта

        // Формируем запрос SQL для выбора последней строки из таблицы с текущим devaddr
        const query = `SELECT * FROM ${devaddr} ORDER BY date DESC LIMIT 1`;

        // Создаем новый промис для каждого запроса и добавляем его в массив промисов
        const promise = new Promise((resolve, reject) => {
          this.db.get(query, (err, row) => {
            if (err) {
              console.error(`Ошибка при получении данных из таблицы ${devaddr}:`, err);
              reject(err); // Отклоняем промис при ошибке
            } else {
              // Добавляем результат в объект, используя devaddr в качестве ключа
              results[devaddr] = row;
              resolve(); // Разрешаем промис после получения данных
            }
          });
        });

        promises.push(promise); // Добавляем промис в массив
      });

      // Дожидаемся завершения всех промисов
      Promise.all(promises)
        .then(() => {
          // После завершения выполнения всех запросов разрешаем промис и передаем объект с результатами
          resolve(results);
        })
        .catch(err => {
          // Если хотя бы один запрос завершился с ошибкой, отклоняем промис
          reject(err);
        });
    });
  }

  readRowsByDevaddr(devaddr, numberOfRows) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM ${devaddr} ORDER BY date DESC LIMIT ${numberOfRows}`; // Формируем запрос SQL

      this.db.all(query, (err, rows) => { // Используем db.all для получения всех строк
        if (err) {
          console.error(`Ошибка при получении ${numberOfRows} строк из таблицы ${devaddr}:`, err);
          reject(err); // Отклоняем промис при ошибке
        } else {
          resolve(rows); // Разрешаем промис и передаем массив строк
        }
      });
    });
  }


  readRowsFromDeviceTable(columns) {
    return new Promise((resolve, reject) => {
      const rows = []; // Создаем массив для хранения результатов
      const query = `SELECT ${columns.join(', ')} FROM DeviceTable`; // Формируем запрос SQL

      this.db.each(query, (err, row) => { // Убираем передачу columns здесь
        if (err) {
          console.error('Ошибка при получении данных из базы данных:', err);
          reject(err); // Отклоняем промис при ошибке
        } else {
          rows.push(row); // Добавляем строку в массив
        }
      }, (err, rowCount) => {
        if (err) {
          console.error('Ошибка при получении данных из базы данных:', err);
          reject(err); // Отклоняем промис при ошибке
        } else {
          resolve(rows); // Разрешаем промис и передаем массив строк
        }
      });
    });
  }

  close() {
    this.db.close();
  }
}

export default DataBase;
