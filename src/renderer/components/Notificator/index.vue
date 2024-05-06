<template>
    <el-container>
        <el-button type="danger">Всем на выход!</el-button>
        <el-button type="info" icon="el-icon-message-solid"  @click="toggleMessages">Просмотреть сообщения</el-button>
    </el-container>

</template>

<script>
export default {
  data() {
    return {
      showMessages: false
    };
  },
  methods: {
    toggleMessages() {
      this.showMessages = !this.showMessages;
    }
  }
};
</script>

<style>
/* Добавьте стили для оформления */
</style>