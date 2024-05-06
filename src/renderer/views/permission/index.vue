<template>
  <div class="dashboard-container">
    <div class="dashboard-text">Имя: {{ name }}</div>
    <div class="dashboard-text">
      Роли: <span v-for="role in roles" :key="role">{{ role }}</span>
    </div>
    <div v-if="roles[0] === 'admin'">
      <p>Это видят только администраторы</p>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "@/store/user";
const { name, roles } = useUserStore();
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }

  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
