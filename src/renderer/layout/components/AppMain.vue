<template>
  <section class="app-main">
    <router-view v-slot="{ Component }">
      <transition>
        <component :is="Component" />
      </transition>
    </router-view>
  </section>
</template>

<script setup>
import { defineComponent } from "vue";
defineComponent({
  name: "AppMain"
});
</script>
