<template>
  <div class="login-container">
    <div class="login-from-box">
      <el-form
        class="login-form"
        autocomplete="on"
        :model="loginForm"
        :rules="loginRules"
        ref="loginFormRef"
        label-position="left"
      >
        <h3 class="title">Панель управления</h3>
        <el-form-item prop="username">
          <el-input
            name="username"
            type="text"
            v-model="loginForm.username"
            autocomplete="on"
            placeholder="Имя пользователя"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            name="password"
            :type="pwdType"
            @keyup.enter.native="handleLogin"
            v-model="loginForm.password"
            autocomplete="on"
            placeholder="Пароль"
          />
          <span class="show-pwd" @click="showPwd">
            <el-icon :class="{ 'el-icon-circle-check': pwdType === 'text', 'el-icon-circle-close': pwdType === 'password' }" />
          </span>
        </el-form-item>
        <div class="login-btn">
          <el-button type="primary" @click="handleLogin" :loading="loading">Войти</el-button>
        </div>
        <div class="tips">
          <span style="margin-right:20px;">Имя пользователя: admin или editor</span>
          <span>Пароль: Любой</span>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { isvalidUsername } from "@/utils/validate";
import { useUserStore } from "@/store/user";
import { useRouter } from "@/hooks/use-router";
import { ref } from "vue";

const { login } = useUserStore();

const validateUsername = (rule, value, callback) => {
  if (!isvalidUsername(value)) {
    callback(new Error("Введите правильное имя пользователя"));
  } else {
    callback();
  }
};
const validatePass = (rule, value, callback) => {
  if (value.length < 5) {
    callback(new Error("Пароль должен содержать не менее 5 символов"));
  } else {
    callback();
  }
};

const loginForm = ref({
  username: "",
  password: "",
});
const loginFormRef = ref();
const loginRules = ref({
  username: [{ required: true, trigger: "blur", validator: validateUsername }],
  password: [{ required: true, trigger: "blur", validator: validatePass }],
});
const loading = ref(false);
const pwdType = ref("password");

const showPwd = () => {
  pwdType.value = pwdType.value === "text" ? "password" : "text";
};
const router = useRouter();
const handleLogin = () => {
  loading.value = true;
  loginFormRef.value.validate((valid) => {
    if (valid) {
      login(loginForm.value)
        .then(() => {
          loading.value = false;
          router.push({ path: "/" }).catch((err) => {});
        })
        .catch(() => {
          loading.value = false;
        });
    } else {
      loading.value = false;
      console.log("error submit!!");
    }
  });
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
$bg: #2d3a4b;
$light_gray: #eee;
$dark_gray: #889aa4;
$light_gray: #eee;

</style>
