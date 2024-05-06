// Здесь определяется меню, подробности смотрите по ссылке https://electronjs.org/docs/api/menu
const { dialog } = require('electron')
const os = require('os')
const version = require('../../../package.json').version
const menu = [
  {
    label: 'Настройки',
    submenu: [{
      label: 'Быстрый перезапуск',
      accelerator: 'F5',
      role: 'reload'
    }, {
      label: 'Выход',
      accelerator: 'CmdOrCtrl+F4',
      role: 'close'
    }]
  },
  {
    label: 'Правка',
    submenu: [{
      label: 'Отменить',
      accelerator: 'CmdOrCtrl+Z',
      role: 'undo'
    },
    {
      label: 'Повторить',
      accelerator: 'Shift+CmdOrCtrl+Z',
      role: 'redo'
    },
    {
      label: 'Вырезать',
      accelerator: 'CmdOrCtrl+X',
      role: 'cut'
    },
    {
      label: 'Копировать',
      accelerator: 'CmdOrCtrl+C',
      role: 'copy'
    },
    {
      label: 'Вставить',
      accelerator: 'CmdOrCtrl+V',
      role: 'paste'
    }
    ]
  },

  {
    label: 'Помощь',
    submenu: [{
      label: 'О программе',
      role: 'about',
      click: function () {
        info()
      }
    }]
  }]
function info() {
  dialog.showMessageBox({
    title: 'О программе',
    type: 'info',
    message: 'Фреймворк electron-Vue',
    detail: `Версия: ${version}\nВерсия движка: ${process.versions.v8}\nТекущая система: ${os.type()} ${os.arch()} ${os.release()}`,
    noLink: true,
    buttons: ['Посмотреть на GitHub', 'ОК']
  })
}
export default menu
