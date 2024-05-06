<template>
  <div class="app-container">
    <el-form ref="form" :model="formData" label-width="120px">
      <el-form-item >
        <el-select v-model="formData.selectedDevaddr" placeholder="Выберите устройство" @change="updateSelectedGroup">
          <el-option
            v-for="item in devinfo"
            :key="item.devaddr" 
            :label="item.devaddr" 
            :value="item.devaddr" 
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item >
        <el-select v-model="formData.selectedGroup" placeholder="Выберите группу" @change="setNewGroup">
          <el-option
            v-for="group in groups"
            :key="group.id" 
            :label="group.name" 
            :value="group.id" 
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">Сохранить</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
//import { ipcRenderer } from "electron";


function getElectronApi(){
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return window.primaryWindowAPI;
}

export default {
  data() {
    return {
      formData: { 
        selectedDevaddr: "",
        selectedGroup: "",
        date1: "",
        date2: "",
        delivery: false,
        type: [],
        resource: "",
        desc: ""
      },
      devinfo: [], 
      groups: [
        { id: 1, name: "Группа 1" },
        { id: 2, name: "Группа 2" },
        { id: 3, name: "Группа 3" },
        // Добавьте другие группы при необходимости
      ],
    };
  },
  async mounted() {
    this.getData();
  },
  methods:{
    async fetchGroups() {
      try {
        // Ваш код для получения списка групп из базы данных или другого источника данных
        // Пример:
        // const response = await axios.get('/api/groups');
        // this.groups = response.data;
      } catch (error) {
        console.error('Ошибка при получении списка групп:', error);
      }
    },
    async getData() {
      try {
        const columns = ['devaddr', 'devgroup'];
        const row = await getElectronApi().readRowsFromDeviceTable(columns);
        console.log("ROW ACCEPTED:", row);        
        this.devinfo = row;
        this.fetchGroups(); 
      } catch (error) {
        console.error('Ошибка при получении данных из базы данных:', error);
      }
    },
    async updateSelectedGroup() {
      const selectedDevice = this.devinfo.find(device => device.devaddr === this.formData.selectedDevaddr);
      if (selectedDevice) {
        this.formData.selectedGroup = selectedDevice.devgroup;
      }
    },
    async setNewGroup() {
      const selectedDevice = this.devinfo.find(device => device.devaddr === this.formData.selectedDevaddr);
      if (selectedDevice) {
        selectedDevice.devgroup = this.formData.selectedGroup;
        const row = await getElectronApi().setGroup(this.formData.selectedDevaddr, selectedDevice.devgroup);
        console.log(this.devinfo);
      }
    },
    onSubmit() {
      // Обработка нажатия на кнопку "Сохранить"
    }
  }
};
</script>

<style scoped>
.line {
  text-align: center;
}
</style>