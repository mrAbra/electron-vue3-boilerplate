import axios from 'axios'
import { ElMessage } from 'element-plus'

const server = axios.create({
  baseURL: process.env.userConfig.BASE_API,
  timeout: 5000
})

// Устанавливаем перехватчик запросов перед отправкой
server.interceptors.request.use(config => {
  // Делаем какие-то обработки перед отправкой запроса
  return config
}, err => Promise.reject(err))

// Устанавливаем перехватчик ответов после получения
server.interceptors.response.use(res => {
  // Делаем обработку данных после получения ответа
  if (res.data.code === 50000) {
    ElMessage.error(res.data.data)
  }
  return res
}, err => {
  // Проверяем, содержит ли сообщение об ошибке строку 'timeout'
  if (err.message.includes('timeout')) {
    console.log('Ошибка обработки:', err)
    ElMessage.error('Сетевое время ожидания истекло')
  }
  if (err.message.includes('Network Error')) {
    console.log('Ошибка обработки:', err)
    ElMessage.error('Сервер не запущен или ошибка соединения с сетью')
  }
  return Promise.reject(err)
})

// Экспортируем сервер
export default server
