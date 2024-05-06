<template>
  <div class="app-container">
    <ol-map data-projection="EPSG:4326" style="height: 400px">
      <ol-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></ol-view>

      <ol-tile-layer>
      <ol-source-osm />
    </ol-tile-layer>
      <ol-feature>
        <ol-geom-point :coordinates="pointCoordinates"></ol-geom-point>
      </ol-feature>
    </ol-map>

    <el-form ref="form" :model="formData" label-width="120px">
      <el-form-item label="Device Address">
        <el-select v-model="formData.selectedDevaddr" placeholder="Выберите устройство" required>
          <el-option v-for="item in devinfo" :key="item.devaddr" :label="item.devaddr"
            :value="item.devaddr"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Device ID">
        <el-input-number v-model="formData.deviceId" placeholder="Введите серийный номер"></el-input-number>
      </el-form-item>
      <el-form-item label="Latitude">
        <el-button @click="moveUp">Вверх</el-button>
        <el-button @click="moveDown">Вниз</el-button>
      </el-form-item>
      <el-form-item label="Longitude">
        <el-button @click="moveLeft">Влево</el-button>
        <el-button @click="moveRight">Вправо</el-button>
      </el-form-item>
      <el-form-item label="Количество включенных каналов">
        <el-select v-model="formData.sensorsEnabled" placeholder="Число каналов" @change="updateAvailableChannels">
          <el-option label="1" :value="1"></el-option>
          <el-option label="2" :value="2"></el-option>
          <el-option label="3" :value="3"></el-option>
          <el-option label="4" :value="4"></el-option>
          <el-option label="5" :value="5"></el-option>
          <el-option label="6" :value="6"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Информация сенсора">
        <el-select v-model="selectedChannel" placeholder="Выберите канал">
          <el-option v-for="channel in availableChannels" :key="channel.value" :label="channel.label"
            :value="channel.value"></el-option>
        </el-select>
        <el-input-number v-model="formData.sensor_data[selectedChannel].Concentration" :min="0" :max="100"
          placeholder="Выберите концентрацию"></el-input-number>
        <el-select v-model="formData.sensor_data[selectedChannel].Setting" placeholder="Выберите единицы измерения">
          <el-option label="ppm" value="ppm"></el-option>
          <el-option label="мг/м³" value="мг/м³"></el-option>
          <el-option label="НКПР" value="НКПР"></el-option>
          <el-option label="об/д" value="об/д"></el-option>
        </el-select>
        <el-select v-model="formData.sensor_data[selectedChannel].num_formula_gas" placeholder="Выберите газ">
          <el-option label="Метан CH4" value="Метан CH4"></el-option>
          <el-option label="Этилен C2H4" value="Этилен C2H4"></el-option>
          <el-option label="Пропан C3H8" value="Пропан C3H8"></el-option>
          <el-option label="н-бутан C4H10" value="н-бутан C4H10"></el-option>
          <el-option label="1-бутен C4H8" value="1-бутен C4H8"></el-option>
          <el-option label="2-метилпропан (изобутан) i-C4H10" value="2-метилпропан (изобутан) i-C4H10"></el-option>
        </el-select>
        <el-button-group>
          <el-switch @change="changeStateErr(1)" :value="isBitSet(formData.sensor_data[selectedChannel].StateErr, 1)"
            active-text="Порог 1"></el-switch>
          <el-switch @change="changeStateErr(2)" :value="isBitSet(formData.sensor_data[selectedChannel].StateErr, 2)"
            active-text="Порог 2"></el-switch>
          <el-switch @change="changeStateErr(4)" :value="isBitSet(formData.sensor_data[selectedChannel].StateErr, 4)"
            active-text="Порог 3"></el-switch>
          <el-switch @change="changeStateErr(8)" :value="isBitSet(formData.sensor_data[selectedChannel].StateErr, 8)"
            active-text="Порог STEL"></el-switch>
          <el-switch @change="changeStateErr(16)" :value="isBitSet(formData.sensor_data[selectedChannel].StateErr, 16)"
            active-text="Порог TWA"></el-switch>
          <el-switch @change="changeStateErr(32)" :value="isBitSet(formData.sensor_data[selectedChannel].StateErr, 32)"
            active-text="Превышение диапазона"></el-switch>
          <el-switch @change="changeStateErr(64)" :value="isBitSet(formData.sensor_data[selectedChannel].StateErr, 64)"
            active-text="Ошибка сенсора"></el-switch>
          <el-switch @change="changeStateErr(128)"
            :value="isBitSet(formData.sensor_data[selectedChannel].StateErr, 128)"
            active-text="Ошибка калибровки нуля"></el-switch>
          <el-switch @change="changeStateErr(256)"
            :value="isBitSet(formData.sensor_data[selectedChannel].StateErr, 256)"
            active-text="Ошибка калибровки диапазона"></el-switch>
          <el-switch @change="changeStateErr(512)"
            :value="isBitSet(formData.sensor_data[selectedChannel].StateErr, 512)"
            active-text="Интервал калибровки"></el-switch>
          <el-switch @change="changeStateErr(1024)"
            :value="isBitSet(formData.sensor_data[selectedChannel].StateErr, 1024)"
            active-text="Ошибка микросхемы ADC"></el-switch>
          <el-switch @change="changeStateErr(2048)"
            :value="isBitSet(formData.sensor_data[selectedChannel].StateErr, 2048)"
            active-text="Ошибка микросхемы MCP4652"></el-switch>
          <el-switch @change="changeStateErr(4096)"
            :value="isBitSet(formData.sensor_data[selectedChannel].StateErr, 4096)"
            active-text="Ошибка микросхемы MCP47"></el-switch>
        </el-button-group>
      </el-form-item>
      <el-form-item label="Состояние аварии">
        <el-select v-model="formData.stateErrAck" placeholder="Тип аварии">
          <el-option label="Нет оповещение" :value="0"></el-option>
          <el-option label="Сработал порог в группе" :value="1"></el-option>
          <el-option label="Все на выход" :value="2"></el-option>
          <el-option label="Нужна помощь" :value="4"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">Сэмулировать пакет</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
function getElectronApi(){
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return window.framelessWindowAPI;
}

export default {
  async mounted() {
    this.getData();
    this.updateAvailableChannels();
  },
  rules: {
    selectedDevaddr: [
      { required: true, message: 'Выберите устройство', trigger: 'change' }
    ]
  },
  computed: {
    availableChannels() {
      const channels = [];
      if (this.formData.sensorsEnabled) {
        for (let i = 0; i < this.formData.sensorsEnabled; i++) {
          channels.push({
            label: `Канал ${i + 1}`,
            value: i
          });
        }
      }

      return channels;
    }
  },
  data() {
    return {
      formData: {
        selectedDevaddr: "",
        selectedGroup: "",
        deviceId: "",
        latitude: 37.6477,
        longitude: 55.732,
        status: 1,
        hw_version: 1,
        fw_version: 1,
        sensorsEnabled: 1,
        sensor_data: [],
        stateErrAck: 0,
      },
      selectedChannel: 0,
      measurementUnits: [
        { value: 0, label: 'ppm' },
        { value: 1, label: 'мг/м³' },
        { value: 2, label: 'НКПР' },
        { value: 3, label: 'об/д' }
      ],
      pointCoordinates: [37.6477, 55.732],
      zoom: 18,
      center: [37.6477, 55.732],
      rotation: 0,
      bitStates: {
        ST_BIT_LIMIT1: false,
        ST_BIT_LIMIT2: false,
        ST_BIT_LIMIT3: false,
        ST_BIT_LIMIT_STEL: false,
        ST_BIT_LIMIT_TWA: false,
        ST_BIT_EXCEEDED_THE_RANGE: false,
        ST_BIT_SENSOR_FAILED: false,
        ST_BIT_AUTO_ZERO_ERR: false,
        ST_BIT_AUTO_SPAN_ERR: false,
        ST_BIT_CALIB_INTERVAL: false,
        ST_BIT_ERR_ADC: false,
        ST_BIT_ERR_MCP4652: false,
        ST_BIT_ERR_MCP47: false
      },
      devinfo: [],
    };
  },
  methods: {
    onSubmit() {

      for (const [key, value] of Object.entries(this.bitStates)) {
        if (value === true) {
          switch (key) {
            case 'ST_BIT_LIMIT1':
              this.setBit(0);
              break;
            case 'ST_BIT_LIMIT2':
              this.setBit(1);
              break;
            case 'ST_BIT_LIMIT3':
              this.setBit(2);
              break;
            case 'ST_BIT_LIMIT_STEL':
              this.setBit(3);
              break;
            case 'ST_BIT_LIMIT_TWA':
              this.setBit(4);
              break;
            case 'ST_BIT_EXCEEDED_THE_RANGE':
              this.setBit(5);
              break;
            case 'ST_BIT_SENSOR_FAILED':
              this.setBit(6);
              break;
            case 'ST_BIT_AUTO_ZERO_ERR':
              this.setBit(7);
              break;
            case 'ST_BIT_AUTO_SPAN_ERR':
              this.setBit(8);
              break;
            case 'ST_BIT_CALIB_INTERVAL':
              this.setBit(9);
              break;
            case 'ST_BIT_ERR_ADC':
              this.setBit(10);
              break;
            case 'ST_BIT_ERR_MCP4652':
              this.setBit(11);
              break;
            case 'ST_BIT_ERR_MCP47':
              this.setBit(12);
              break;
          }
        }
      }

      this.generatedFeature = {
        type: "Feature",
        dataStructVer: 1,
        devid: this.formData.deviceId,
        id: this.formData.selectedDevaddr,
        devaddr: this.formData.selectedDevaddr,
        sensorsEnabled: this.formData.sensorsEnabled,
        properties: {
          status: this.formData.status
        },
        hw_version: this.formData.hw_version,
        fw_version: this.formData.fw_version,
        sensor_data: { ...this.formData.sensor_data },
        stateErrAck: this.formData.stateErrAck,
        geometry: {
          type: "Point",
          coordinates: this.pointCoordinates
        }
      };
      getElectronApi().inserRowByDevaddr(this.formData.selectedDevaddr, this.generatedFeature);
      //ipcRenderer.invoke('db-handle-insert-row-by-devaddr', this.formData.selectedDevaddr, this.generatedFeature);
      console.log(this.generatedFeature);
    },
    updateAvailableChannels() {
      const selectedChannels = parseInt(this.formData.sensorsEnabled);

      // Создаем массив для хранения sensor_data
      const sensorDataArray = [];

      // Заполняем массив sensor_data пустыми объектами в количестве, соответствующем выбранному числу каналов
      for (let i = 0; i < selectedChannels; i++) {
        sensorDataArray.push({
          Concentration: 0,
          StateErr: 0,
          num_formula_gas: "",
          Setting: ""
        });
      }

      // Обновляем formData, заменяя существующий sensor_data новым массивом sensorDataArray
      this.formData.sensor_data = sensorDataArray;
    },
    isBitSet(number, bitPosition) {
      return (number & (1 << (bitPosition - 1))) !== 0;
    },
    changeStateErr(bitPosition) {
      this.formData.sensor_data[this.selectedChannel].StateErr ^= 1 << (bitPosition - 1);
    },
    moveUp() {
      this.formData.longitude += 0.00002;
      this.pointCoordinates = [Number(this.formData.latitude).toFixed(6), Number(this.formData.longitude).toFixed(6)];
    },
    moveDown() {
      this.formData.longitude -= 0.00002;
      this.pointCoordinates = [Number(this.formData.latitude).toFixed(6), Number(this.formData.longitude).toFixed(6)];
    },
    moveLeft() {
      this.formData.latitude -= 0.00002;
      this.pointCoordinates = [Number(this.formData.latitude).toFixed(6), Number(this.formData.longitude).toFixed(6)];
    },
    moveRight() {
      this.formData.latitude += 0.00002;
      this.pointCoordinates = [Number(this.formData.latitude).toFixed(6), Number(this.formData.longitude).toFixed(6)];
    },
    async getData() {
      try {
        const columns = ['devaddr', 'devgroup'];
        console.log(getElectronApi());
        const row = await getElectronApi().readRowsFromDeviceTable(columns);
        //const row = await ipcRenderer.invoke("read-rows-from-device-table", columns);
        console.log("ROW ACCEPTED:", row);
        this.devinfo = row;
      } catch (error) {
        console.error('Ошибка при получении данных из базы данных:', error);
      }
    },
  }
};
</script>

<style scoped>
.line {
  text-align: center;
}
</style>
