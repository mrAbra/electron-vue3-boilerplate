<template>
  <div class="app-container">

    <!-- Панель оператора -->
    <el-row>
      <el-col :span="18" class="operator-controls">
        <label for="group-select">Выберите группу:</label>
        <el-select id="group-select" v-model="selectedGroup" @change="loadGroupData">
          <el-option v-for="group in groups" :value="group.id" :key="group.id">{{ group.name }}</el-option>
        </el-select>
      </el-col>
      <el-col :span="6" class="operator-controls">
        <el-switch id="emulationSwitch" v-model="emulate" active-text="Эмулятор" inline></el-switch>
        <el-button @click="makeTestData">Тестовые данные</el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="6">
        <el-descriptions title="Устройство" :column="0">
          <el-descriptions-item v-if="selectedFeature" label="ID устройства">{{ selectedFeature.id
            }}</el-descriptions-item>
          <el-descriptions-item v-if="selectedFeature" label="Координаты">{{ selectedFeature.geometry.coordinates
            }}</el-descriptions-item>
          <el-descriptions-item v-if="selectedFeature" label="Каналы">
            <el-row>
              <el-tag v-for="(data, index) in selectedFeature.sensor_data" :key="index"
                v-if="data.Concentration !== undefined && data.num_formula_gas !== undefined"
                :type="data.StateErr !== 0 ? 'warning' : 'success'">
                {{ data.num_formula_gas }}: {{ data.Concentration }} {{ data.Setting }}
              </el-tag>
            </el-row>
          </el-descriptions-item>
        </el-descriptions>
        <el-button v-if="selectedFeature" @click="openMoreInfo(selectedFeature.id)">Показать маршрут</el-button>
      </el-col>
      <el-col :span="18">
        <ol-map ref="map" data-projection="EPSG:4326" style="width: 100%; height: 400px">
          <ol-view :zoom.sync="zoom" :center.sync="center"></ol-view>
          <ol-layer-tile>
            <ol-source-osm></ol-source-osm>
          </ol-layer-tile>
          <ol-layer-vector ref="featuresLayer">
            <ol-source-vector :features="features">
            </ol-source-vector>
          </ol-layer-vector>
          <ol-interaction-select @select="onSelect">
            <ol-overlay v-if="selectedFeature" :key="selectedFeature.id" :id="'overlay-' + selectedFeature.id"
              :position="selectedFeature.geometry.coordinates" :auto-pan="true">
              <el-tag>
                {{ selectedFeature.id }}
              </el-tag>
            </ol-overlay>
          </ol-interaction-select>
        </ol-map>
      </el-col>
    </el-row>

    <el-row>
      <el-table :data="features" highlight-current-row @current-change="handleCurrentChange" style="width: 100%">
        <el-table-column label="Время записи последнего пакета" prop="date">
        </el-table-column>
        <el-table-column label="Адресс устройства" prop="devaddr">
        </el-table-column>
        <el-table-column label="Координаты" prop="geometry.coordinates">
          <template #default="{ row }">
            <span>{{ formatCoordinates(row.geometry.coordinates) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Статус" prop="stateErrAck">
        </el-table-column>
      </el-table>
    </el-row>


  </div>
</template>

<script setup>

const formatCoordinates = (coordinates) => {
  return `[${coordinates.join(', ')}]`;
};

</script>
<script>
function getElectronApi(){
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return window.primaryWindowAPI;
}
export default {

  data() {
    return {
      emulate: false,
      zoom: 18,
      center: [37.6477, 55.732 + 0.00036],
      features: [],
      selectedFeature: null,
      timerId: null,
      groups: [
        { id: 1, name: "Группа 1" },
        { id: 2, name: "Группа 2" },
        { id: 3, name: "Группа 3" },
      ],
      emergency: false,
      selectedGroup: 1,
      selectedDevaddrs: null,
      timerState: false,
      currentRow: null
    }
  },
  created() {
    // Запускаем функцию для обновления массива features раз в три секунды
    //this.timerId = setInterval(this.updateFeatures, 3000);
    this.loadGroupData();
  },
  deactivated() {
    clearInterval(this.timerId);
  },
  methods: {
    onSelect(feature) {
      this.setSelectedFeature(feature.json.id);
    },
    setSelectedFeature(id) {
      this.selectedFeature = this.features.find(feature => feature.id === id);
      this.currentRow = this.selectedFeature;
    },
    async loadGroupData() {
      this.selectedDevaddrs = await getElectronApi().readDevaddrsByGroup(this.selectedGroup);
      try {
        // Логика загрузки данных
        // this.selectedFeatures = ...; // Обновление списка устройств после загрузки
      } catch (error) {
        console.error('Ошибка при загрузке данных группы:', error);
      }
    },
    async updateFeatures() {
      try {
        const clonedArray = this.selectedDevaddrs.map(obj => ({ ...obj })); // WTF TODO
        const data = await getElectronApi().readLastDataByDevaddrs(clonedArray, this.emulate);
        // Преобразование строк JSON в объекты JavaScript и сохранение только содержимого jsondata
        const newFeatures = Object.values(data).map(item => {
          const newItem = JSON.parse(item.jsondata);
          newItem.date = item.date; // Добавляем поле date к newItem
          this.checkAlarms(newItem.sensor_data, newItem.devaddr);
          return newItem;
        }
        );
        // Проверка, есть ли selectedFeature в новых данных
        if (this.selectedFeature) {
          const selectedFeatureIndex = newFeatures.findIndex(feature => feature.id === this.selectedFeature.id);
          if (selectedFeatureIndex !== -1) {
            // Если selectedFeature найден, обновляем его
            this.selectedFeature = newFeatures[selectedFeatureIndex];
          }
          else {
            this.selectedFeature = null;
          }
        }
        // Добавление новых данных к существующему массиву features
        this.features = newFeatures;
      } catch (error) {
        console.error('Ошибка при загрузке последних данных:', error);
      }
    },
    handleCurrentChange(val) {
      if (val == null) {
        return;
      }
      console.log(this.$refs.map.$refs.selectInteraction);
      this.setSelectedFeature(val.devaddr);
    },
    makeTestData() {
      if (this.timerState) {
        console.log("stoped");
        clearInterval(this.timerId);
        this.timerState = false;
      } else {
        this.timerId = setInterval(this.updateFeatures, 3000);
        this.timerState = true;
      }

    },
    checkAlarms(sensor_data, devAddr) {
      Object.values(sensor_data).forEach(sensor => {
        // Проверяем, установлен ли первый бит (младший) в поле StateErr
        if (sensor.StateErr & 1) {
          // Если первый бит установлен, выводим предупреждение
          this.$notify({
            title: 'Предупреждение',
            message: devAddr + 'Превышение порога 1',
            duration: 0
          });
        }
        // Проверяем, установлен ли второй бит в поле StateErr
        if (sensor.StateErr & 2) {
          // Если второй бит установлен, выводим другое предупреждение
          this.$notify({
            title: 'Предупреждение',
            message: devAddr + 'Превышение порога 2',
            duration: 0
          });
        }
      });
    },
    openMoreInfo(id) {
      getElectronApi().openMoreInfo(id);
    }

  }
}
</script>

<style scoped>
/* Стили для панели оператора */
.operator-panel {
  background-color: #f0f0f0;
  padding: 10px;
  border-bottom: 1px solid #ccc;
}

.inline-button {
  display: inline-block;
}

/* Дополнительные стили по необходимости */
</style>

<style>
.app-container ::-webkit-scrollbar {
  display: block !important;
  background-color: #fff;
  width: 10px;
}
</style>
