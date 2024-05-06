<template>
  <div class="common-layout">
    <el-container>
      <el-aside :style="{ width: sidebarWidth, height: `100vh` }" v-bind:class="{ 'hide-sidebar': !sidebarSwitch, 'open-sidebar': sidebarSwitch }">
        <sidebar class="sidebar-container" :class="IsUseSysTitle ? 'UseSysTitle' : 'NoUseSysTitle'"></sidebar>
      </el-aside>
      <el-container>
        <el-header><navbar></navbar></el-header>
        <el-main><app-main></app-main></el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import AppMain from "@/layout/components/AppMain.vue";
import Navbar from "@/layout/components/Navbar.vue";
import Sidebar from "@/layout/components/Sidebar";
import { useAppStore } from "@/store/app";

const { sidebarStatus } = useAppStore();
const IsUseSysTitle = ref(false);
const sidebarSwitch = computed(() => sidebarStatus.opened)
const sidebarWidth = computed(() => sidebarSwitch.value ? '200px' : '50px');

const classObj = computed(() => {
  return {
    hideSidebar: !sidebarSwitch.value,
    openSidebar: sidebarSwitch.value
  };
});

</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "@/styles/mixin.scss";


.UseSysTitle {
  top: 0px;
}
.hide-sidebar {
  width: 0;
  overflow: hidden;
  transition: width 0.28s; 
}

.open-sidebar {
  width: 200px;
  overflow: hidden;
  transition: width 0.28s; 
}

.el-header{
  padding: 0;
}

.NoUseSysTitle {
  top: 0px
}
</style>
