<template>
    <div class="app-container">
      <p>{{ devAddr }}</p>
      <button @click="readRecentData">Прочитать последние 10 строк</button>
      <vl-map data-projection="EPSG:4326" style="height: 400px">
        <vl-view :zoom.sync="zoom" :center.sync="center" :rotation.sync="rotation"></vl-view>
      
        <vl-layer-tile>
          <vl-source-osm></vl-source-osm>
        </vl-layer-tile>
      
        <vl-feature>
          <vl-geom-line-string :coordinates="coord"></vl-geom-line-string>
        </vl-feature>
        <vl-feature>
            <vl-geom-point :coordinates="pointCoordinates"></vl-geom-point>
        </vl-feature>
      </vl-map>
  <!--
      <vue-horizontal>
            <section v-for="(item, index) in recentData" :key="index" class="block" @click="SelectItemCoordinates(item.jsondata.geometry.coordinates)">
                <p>Дата: {{ item.date }}</p>
                <p v-if="item.jsondata">Статус устройства: {{ item.jsondata.properties.status }}</p>
                <p>Версия аппаратного обеспечения: {{ item.jsondata.hw_version }}</p>
                <p>Версия программного обеспечения: {{ item.jsondata.fw_version }}</p>
                <p v-if="item.jsondata.sensor_data">Данные сенсора:</p>
                <ul v-if="item.jsondata.sensor_data">
                    <li v-if="item.jsondata.sensor_data.Channel">Канал: {{ item.jsondata.sensor_data.Channel }}</li>
                    <li v-if="item.jsondata.sensor_data.Concentration">Концентрация: {{ item.jsondata.sensor_data.Concentration }}</li>
                    <li v-if="item.jsondata.sensor_data.State">Состояние: {{ item.jsondata.sensor_data.State }}</li>
                    <li v-if="item.jsondata.sensor_data.StateErr">Ошибка состояния: {{ item.jsondata.sensor_data.StateErr }}</li>
                    <li v-if="item.jsondata.sensor_data.Setting">Настройка: {{ item.jsondata.sensor_data.Setting }}</li>
                </ul>
                <p v-if="item.jsondata.geometry.coordinates">Координаты:{{ item.jsondata.geometry.coordinates }}</p>
            </section>
        </vue-horizontal>
        -->
    </div>
  </template>
  
  <script>
  import { ipcRenderer } from 'electron';

  export default {
    components: {VueHorizontal},
    data () {
      return {
        devAddr: null,
        zoom: 17,
        center: [116.54875,40.45064],
        rotation: 0,
        coord: [[116.544921,40.451633],[116.545264,40.451649],[116.545865,40.451698],[116.546144,40.451551],[116.546337,40.451274],[116.546788,40.451143],[116.547324,40.451078],[116.547539,40.450996],[116.547839,40.450719],[116.548440,40.450506],[116.548933,40.450604],[116.549448,40.450604],[116.550242,40.450376],[116.550865,40.450163],[116.551702,40.449935],[116.552581,40.449576]],
        recentData: [], // Пустой массив для последних данных
        pointCoordinates: [116.544921,40.451633]
      }
    },
    async created() {
      this.devAddr = await ipcRenderer.invoke("read-devaddr-for-more-info");
      await this.readRecentData();
    },
    methods:{
      async readRecentData() {
        if (this.devAddr) {
          const recentData = await ipcRenderer.invoke("read-rows-by-devaddr", this.devAddr, 10);
          console.log(recentData); // Вывести последние 10 строк в консоль
          this.coord = recentData.map(item => {
            item.jsondata = JSON.parse(item.jsondata);
            return item.jsondata.geometry.coordinates;
          });
          this.center = this.coord[0];
          this.recentData = recentData; // Присваиваем полученные данные переменной recentData

        } else {
          console.error("devAddr не определен");
        }
      },
      SelectItemCoordinates(coordinates){
        this.center = coordinates;
        this.pointCoordinates = coordinates;
      }
    }
  }
  </script>
  <style>
  .app-container {
    display: flex;
    flex-direction: column;
  }
  .line-container {
    display: flex;
    overflow-x: scroll;
    border-bottom: 1px solid #ccc; /* Добавляем границу снизу */
    padding-bottom: 5px; /* Добавляем небольшой отступ снизу */
    overflow-y: hidden; /* Добавьте это свойство */
  }
  .block {
    border: 1px solid #ccc;
    padding: 10px;
    margin: 10px;
    cursor: pointer;
    width: 300px; /* Укажите нужную ширину блока */
    /* Добавьте еще стилей по вашему усмотрению */
  }
  section,
    .item {
    background: #f3f3f3;
    padding: 16px 24px;
    margin-right: 24px;
    }
</style>