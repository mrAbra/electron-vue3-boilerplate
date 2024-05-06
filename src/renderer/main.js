import { createApp } from "vue";
import "./style.css";

import "./icons"

// 导入 FontAwesome 图标
import { library as fontAwesomeLibrary } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import { fas } from "@fortawesome/free-solid-svg-icons"; 
import SvgIcon from '@/components/SvgIcon';
import { createPinia } from 'pinia'
import { usePermission } from './permission'
fontAwesomeLibrary.add(fas);
import "vue3-openlayers/styles.css";

import OpenLayersMap from "vue3-openlayers";

import {

  Map,
  Layers,
  Sources,
} from "vue3-openlayers";


import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/index.css'

import App from "./App.vue";
import router from "./router";
import { nextTick } from 'vue';

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

const options = {
  debug: true,
};
app.use(OpenLayersMap, options);
const pinia = createPinia()
app.use(pinia);
usePermission() 

app.component('svg-icon', SvgIcon);


app.config.errorHandler = function (err, vm, info) {
  nextTick(() => {
      console.group('%c >>>>>> Информация об ошибке >>>>>>', 'color:red');
      console.log(`%c ${info}`, 'color: red');
      console.groupEnd();
      console.group('%c >>>>>> Объект Vue, в котором произошла ошибка >>>>>>', 'color:red');
      console.log(vm);
      console.groupEnd();
      //console.group('%c >>>>>> Причина и место возникновения ошибки >>>>>>', 'color:red');
      //console.error(err);
      console.groupEnd();
  });
};

app.use(router);
app.use(ElementPlus);
app.component("FontAwesomeIcon", FontAwesomeIcon);
app.mount("#app");
