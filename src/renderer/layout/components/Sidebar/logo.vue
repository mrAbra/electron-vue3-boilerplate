<template>
  <div class="sidebar-logo-container" :class="{'collapse':collapse}">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <img :src="mainIcon" class="sidebar-logo" alt="Logo" />
        <div class="sidebar-title">{{ title }}</div>
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <img :src="mainIcon" class="sidebar-logo" alt="Logo" />
        <div class="sidebar-title">{{ title }}</div>
      </router-link>
    </transition>
  </div>
</template>

<script>

import mainIcon from '@/icons/main-icon.png';

export default {
  name: "SidebarLogo",
  props: {
    collapse: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      title: "Mirax мониторинг",
      mainIcon: mainIcon
    };
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity .28s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 61px;
  line-height: 61px;
  text-align: center;
  overflow: hidden;
  background-color: #ffffff;

  & > .sidebar-logo-link {
    height: 100%;
    width: 100%;

    & > .sidebar-logo {
      width: 32px;
      height: 32px;
      vertical-align: middle;
      margin-right: 12px;
    }

    & > .sidebar-title {
      display: inline-block;
      margin: 0;
      color: #333;
      font-weight: 600;
      line-height: 50px;
      font-size: 14px;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
      vertical-align: middle;
    }
  }
}
.collapse {
  .sidebar-logo {
    margin-right: 0px !important;
    margin-left: 0px !important;
  }
}
</style>
