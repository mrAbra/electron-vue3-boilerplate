<template>
    <el-menu mode="vertical" :show-timeout="200" :default-active="$route.path" :collapse="isCollapse" style="height: 100%;">
      <Logo :collapse="isCollapse" />
      <router-link v-for="router in routes_list" :to="`${router.path}/${router.children[0].path}`" :key="router.children[0].path">
  <el-menu-item :index="router.children[0].meta.title">
    <el-icon v-if="router.children[0].meta.icon"><component :is="router.children[0].meta.icon" /></el-icon>
    <template #title><span>{{ router.children[0].meta.title }}</span></template>
  </el-menu-item>
</router-link>
    </el-menu>
</template>

<script setup>
import { computed } from "vue";
import { useAppStore } from "@/store/app"
import { usePermissionStore } from "@/store/permission"
import ScrollBar from "@/components/ScrollBar"
import Logo from "./logo";

const { sidebarStatus } = useAppStore()
const { routers } = usePermissionStore()

// Отфильтруйте объекты routers, удаляя те, у которых отсутствует свойство 'meta'
const filteredRouters = computed(() => routers.filter(route => route.children && route.children.length > 0 && route.children[0].meta));

const routes_list = filteredRouters;

const isCollapse = computed(() => !sidebarStatus.opened)
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.title {
  text-align: center;
  line-height: 64px;
  height: 64px;
  font-size: 14px;
  font-weight: bold;
  color: #333333;
  background-color: #ffffff;
  padding: 0 20px;

  .logo-set {
    width: 21px;
    height: 21px;
  }
}

.minititle {
  padding: 0 10px;
  transition: padding 0.28s;
  overflow: hidden;
  width: 180px;
}
</style>
