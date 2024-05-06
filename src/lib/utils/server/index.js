import server from './server';
import { ipcMain, dialog } from 'electron';
const port = 1700;

export default {
  StartServer() {
    return new Promise((resolve, reject) => {
      server.bind(port); // Запуск UDP сервера
      server.on('listening', () => {
        resolve('Сервер запущен');
      });
      server.on('message', (msg, rinfo) => {
        // Отправляем сообщение в главный процесс Electron
        // Здесь вместо console.log вы можете добавить код для отправки сообщения в главный процесс
        // Например, вызов callback с данными или использование IPC для отправки сообщения
        ipcMain.emit('messageFromServer', msg, rinfo); // Отправляем сообщение с данными msg
      });
      server.on('error', (error) => {
        switch (error.code) {
          case 'EACCES':
            reject('Ошибка: Недостаточно прав для запуска сервера. Пожалуйста, запустите с правами администратора.');
            break;
          case 'EADDRINUSE':
            reject('Ошибка: Порт сервера уже используется. Пожалуйста, проверьте настройки порта.');
            break;
          default:
            reject('Ошибка при запуске сервера: ' + error.message);
        }
      });
    });
  },
  SendMessage(message, rinfo) {
    console.log("MESSAGE SENDED TO : ", rinfo.address, rinfo.port);
    server.send(message, rinfo.port, rinfo.address, (error) => {
        if (error) {
            console.error('Ошибка при отправке сообщения:', error);
        } else {
        }
    });
  },
  StopServer() {
    return new Promise((resolve, reject) => {
      if (server) {
        server.close(() => {
          resolve('Сервер остановлен');
        });
      } else {
        reject('Сервер не был запущен');
      }
    });
  },
  handleMessage(callback) {
    ipcMain.on('message', (event, data) => {
      callback(data);
    });
  }
};
