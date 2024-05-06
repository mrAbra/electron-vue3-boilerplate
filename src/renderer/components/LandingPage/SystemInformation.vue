<template>
  <div>
    <div class="title">{{("about.system") }}</div>
    <div class="items">
      <div class="item" v-for="(item, index) in tips" :key="index">
        <div class="name" v-text="item.name"></div>
        <div class="value" v-text="item.value"></div>
      </div>
    </div>
  </div>
</template>

<script>
//import { platform, release, arch } from "os";
export default {
  data() {
    return {};
  },
  computed: {
    tips() {
      return [
        { name: "about.currentPagePath", value: this.$route.path },
        { name: "about.currentPageName", value: this.$route.name },
      ];
    },
  },
  mounted() {
    console.log(this.$route);
  },
};
</script>


<style scoped>
.title {
  color: #888;
  font-size: 18px;
  font-weight: initial;
  letter-spacing: 0.25px;
  margin-top: 10px;
}

.items {
  margin-top: 8px;
}

.item {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  line-height: 24px;
}

.item .name {
  color: #6a6a6a;
  margin-right: 6px;
}

.item .value {
  color: #35495e;
  font-weight: bold;
}
</style>
