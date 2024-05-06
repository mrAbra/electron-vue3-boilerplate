<template>
  <el-menu :class="'el-menu-demo' + (' dragTitle')" mode="horizontal" 
  >
    <el-menu-item index="1">
      <hamburger class="hamburger-container" @toggle-click="toggleSideBar" :isActive="sidebarComp.opened"></hamburger>
    </el-menu-item>
    <el-menu-item index="2">
      <!--<breadcrumb></breadcrumb>-->
    </el-menu-item>
    <el-menu-item index="3">
      <notificator></notificator>
    </el-menu-item>
    <el-menu-item index="4">
      <div class="go-index">{{ time }}</div>
    </el-menu-item>
    <el-sub-menu index="5">
      <template #title>{{ userName }} <el-avatar :icon="UserFilled" /></template>
      <router-link to="/">
        <el-menu-item>На главную</el-menu-item>
      </router-link>
      <el-menu-item  index="6" @click.native="logout">Сменить аккаунт</el-menu-item>
      <el-menu-item  index="7" @click.native="logout">Выйти</el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, defineComponent } from "vue";
import { useAppStore } from "@/store/app"
import { UserFilled } from '@element-plus/icons-vue'
import { useUserStore } from "@/store/user"
import { format } from "date-fns";
import Breadcrumb from "@/components/Breadcrumb";
import Hamburger from "@/components/Hamburger";
import Notificator from "@/components/Notificator";
import { ElMessage } from "element-plus"
import { useRouter } from "@/hooks/use-router";

defineComponent({
  name: 'Navbar'
})

const time = ref("")
let timer = null
onMounted(() => {
  timer = setInterval(() => {
    time.value = format(new Date(), "yyyy/MM/dd HH:mm");
  }, 60000);
})
onUnmounted(() => {
  clearInterval(timer);
  timer = null;
})

const { ToggleSideBar, sidebarStatus } = useAppStore()
const sidebarComp = computed(() => sidebarStatus)
const toggleSideBar = () => {
  ToggleSideBar()
}

const { logOut, name } = useUserStore()
const router = useRouter()
const userName = computed(() => name)
const logout = () => {
  logOut().then(() => {
    ElMessage({
      message: "Выход",
      type: "success"
    });
    router.push('/login')
  })
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.flex-grow {
  flex-grow: 1;
}

.el-menu-item * {
  vertical-align: middle !important;
}
.el-menu-item.is-active,
.el-menu-item.is-active:hover {
  background-color: transparent !important;
  color: inherit !important;
}

.el-menu-item.is-active * {
  user-select: none;
}

</style>
