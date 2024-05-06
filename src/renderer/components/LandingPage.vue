<template>
  <div id="wrapper">
    <main>
      <div class="left-side">
        <span class="title">{{("welcome") }}</span>
        <system-information></system-information>
        <div v-if="textarray.length === 0">
          <span>{{ text }}</span>
        </div>
        <div v-for="(itme, index) in textarray" :key="index" v-else>
          <span>{{ itme._id }}</span>
          <span>{{ itme.name }}</span>
          <span>{{ itme.age }}</span>
        </div>
      </div>

      <div class="right-side">
        <div class="doc">
          <div class="title alt">{{ ("buttonTips") }}</div>
          <!--<el-button type="primary" round @click="open()">{{ $t("buttons.console") }}</el-button>
          <el-button type="primary" round @click="CheckUpdate('one')">{{ $t("buttons.checkUpdate") }}</el-button>-->
        </div>
        <div class="doc">
          <!--<el-button type="primary" round @click="CheckUpdate('two')">{{ $t("buttons.checkUpdate2") }}</el-button>-->
          <el-button type="primary" round @click="StartServer">{{ ("buttons.startServer") }}</el-button>
          <el-button type="primary" round @click="StopServer">{{ ("buttons.stopServer") }}</el-button>
          <!--<el-button type="primary" round @click="getMessage">{{ $t("buttons.viewMessage") }}</el-button>-->
        </div>
        <div class="doc">
          <el-button type="primary" round @click="openNewWin">{{ ("buttons.openNewWindow") }}</el-button>
          <el-button type="primary" round @click="openDocument">{{ ("buttons.openDocument") }}</el-button>
          <!--<el-button type="primary" round @click="changeLanguage">{{ $t("buttons.changeLanguage") }}</el-button>-->
        </div>
        <!--
        <div class="doc">
          <el-pagination :current-page="1" :page-sizes="[100, 200, 300, 400]" :page-size="100"
            layout="total, sizes, prev, pager, next, jumper" :total="400">
          </el-pagination>
        </div>
      -->
      </div>
    </main>
    <el-dialog title="Прогресс" :visible.sync="dialogVisible" :before-close="handleClose" center width="14%" top="45vh">
      <div class="conten">
        <el-progress type="dashboard" :percentage="percentage" :color="colors" :status="progressStaus"></el-progress>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import SystemInformation from "./LandingPage/SystemInformation";
import logo from "@/assets/logo.png";
//import { message } from "@/api/login";
//import { ipcRenderer, shell } from "electron";

function getElectronApi(){
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return window.primaryWindowAPI;
}

export default {
  name: "landing-page",
  components: { SystemInformation },
  data: () => ({
    newdata: {
      name: "yyy",
      age: "12",
    },
    logo: logo,
    textarray: [],
    percentage: 0,
    colors: [
      { color: "#f56c6c", percentage: 20 },
      { color: "#e6a23c", percentage: 40 },
      { color: "#6f7ad3", percentage: 60 },
      { color: "#1989fa", percentage: 80 },
      { color: "#5cb87a", percentage: 100 },
    ],
    dialogVisible: false,
    progressStaus: null,
    filePath: "",
  }),
  created() {
  },
  methods: {
    openNewWin() {
      let data = {
        url: "/table/index",
        resizable: true,
      };
      console.log("Open-new-win")
      getElectronApi().openWin(data);
      //ipcRenderer.invoke("open-win", data);
    },
    openDocument() {
     // ipcRenderer.invoke("test-row");
    },
    getMessage() {
      /*
      message().then((res) => {
        this.$alert(res.data, "Подсказка", {
          confirmButtonText: "ОК",
        });
      });
      */
    },
    StopServer() {
      /*
      ipcRenderer.invoke("stop-server").then((res) => {
        this.$message({
          type: "success",
          message: "Закрыто",
        });
      });
      */
    },
    StartServer() {
      /*
      ipcRenderer.invoke("start-server").then((res) => {
        if (res) {
          this.$message({
            type: "success",
            message: res,
          });
        }
      }).catch((error) => {
        console.error(error); // Обработка ошибки, если она произошла при выполнении удаленного вызова
      });
      */
    },
    // Получение метода electron
    open() { },
    CheckUpdate(data) {
      /*
      switch (data) {
        case "one":
          ipcRenderer.invoke("check-update").then((res) => {
            console.log("Запущена проверка");
          });

          break;
        case "two":
          ipcRenderer.invoke("start-download").then(() => {
            this.dialogVisible = true;
          });

          break;

        default:
          break;
      }
      */
    },
    handleClose() {
      this.dialogVisible = false;
    },
    changeLanguage() {
      let lang = this.$i18n.locale === "ru" ? "en" : "ru";
      this.$i18n.locale = lang;
    },
  },
  destroyed() {
    console.log("Уничтожено");
    /*
    ipcRenderer.removeAllListeners("confirm-message");
    ipcRenderer.removeAllListeners("download-done");
    ipcRenderer.removeAllListeners("download-paused");
    ipcRenderer.removeAllListeners("confirm-stop");
    ipcRenderer.removeAllListeners("confirm-start");
    ipcRenderer.removeAllListeners("confirm-download");
    ipcRenderer.removeAllListeners("download-progress");
    ipcRenderer.removeAllListeners("download-error");
    ipcRenderer.removeAllListeners("update-msg");
    */
  },
  computed: {
    text() {
      //return this.$i18n.t("waitDataLoading");
    },
  },
};
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Source Sans Pro", sans-serif;
}

#wrapper {
  padding: 60px 80px;
}

#logo {
  height: auto;
  margin-bottom: 20px;
  width: 420px;
}

main {
  display: flex;
  justify-content: space-between;
}

main>div {
  flex-basis: 50%;
}

.left-side {
  display: flex;
  flex-direction: column;
}

.welcome {
  color: #FFF;
  font-size: 23px;
  margin-bottom: 10px;
}

.title {
  color: #2c3e50;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 6px;
}

.title.alt {
  font-size: 18px;
  margin-bottom: 10px;
}

.doc {
  margin-bottom: 10px;
}

.doc p {
  color: black;
  margin-bottom: 10px;
}

.doc .el-button {
  margin-top: 10px;
  margin-right: 10px;
}

.doc .el-button+.el-button {
  margin-left: 0;
}

.conten {
  text-align: center;
}
</style>
