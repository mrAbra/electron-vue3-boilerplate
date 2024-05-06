<template>
  <div class="app-container">
    <button @click="refreshData">Обновить данные</button>

    <el-table
        :data="tableData"
        >
        <el-table-column
          prop="date"
          label="Дата">
        </el-table-column>
        <el-table-column label="Информация о устройстве">
          <el-table-column
            prop="deviceeui"
            label="DevEUI">
          </el-table-column>
          <el-table-column
              prop="joineui"
              label="JoinEUI">
          </el-table-column>
          <el-table-column
              prop="devaddr"
              label="DevAddr">
          </el-table-column>
          <el-table-column
              prop="status"
              label="Статус">
            </el-table-column>
        </el-table-column>   
        </el-table>   
  </div>
</template>

<script>
function getElectronApi(){
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return window.primaryWindowAPI;
}

export default {
  data() {
    return {
      tableData: [] // Добавляем свойство для хранения данных таблицы
    };
  },
  async mounted() {
    // Вызываем метод openDocument() при монтировании компонента
    this.getData();
  },
  methods:{
    async getData() {
      try {
        const columns = ['date', 'joineui', 'deviceeui','devaddr'];
        const row = await getElectronApi().readRowsFromDeviceTable(columns);
        console.log("ROW ACCEPTED:", row);        
        // Обновляем данные таблицы
        this.tableData = row;
      } catch (error) {
        console.error('Ошибка при получении данных из базы данных:', error);
      }
    },
    refreshData() {
      this.getData(); // Вызываем метод получения данных
    }
  }
};
</script>
<style>
.app-container ::-webkit-scrollbar {
    display: block !important;
    background-color: #fff;
    width: 10px;
}
.el-table__body-wrapper::-webkit-scrollbar-thumb {
    border-radius:5px;
    -webkit-box-shadow: inset 0 0 6px rgba(70, 57, 57, 0.3);
    background-color: rgba(0, 0, 0, .1)
}
</style>
