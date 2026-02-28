<template>
  <div class="w-full h-screen bg-cover bg-center bg-no-repeat relative" style="background-image: url('/login-bg.webp')">
    <div class="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
    
    <div class="relative z-10 w-full h-full flex items-center justify-center px-4">
      <div class="w-full max-w-md bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="flex justify-center mb-6">
            <img src="/logo.svg" alt="Logo" class="h-16 w-auto" />
          </div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            素材收集系统
          </h1>
          <p class="text-gray-500 dark:text-gray-400 text-sm">
            欢迎回来，请登录您的账户
          </p>
        </div>

        <!-- 登录表单 -->
        <el-form 
          :rules="rules" 
          ref="loginForm" 
          :model="form" 
          label-width="0"
          class="space-y-6"
        >
          <el-form-item prop="username">
            <el-input 
              v-model="form.username" 
              placeholder="请输入用户名"
              size="large"
              clearable
            >
              <template #prefix>
                <el-icon class="text-gray-400"><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input 
              type="password" 
              v-model="form.password" 
              placeholder="请输入密码"
              size="large"
              show-password
              clearable
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <el-icon class="text-gray-400"><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item>
            <div class="w-full flex gap-3">
              <el-button 
                type="primary" 
                @click="handleLogin"
                size="large"
                class="flex-1"
                :icon="Right"
                :loading="loading"
                :disabled="loading"
              >
                登录
              </el-button>
              <el-button 
                @click="resetForm"
                size="large"
                :icon="Refresh"
                :disabled="loading"
              >
                重置
              </el-button>
            </div>
          </el-form-item>
        </el-form>

        <!-- 底部提示 -->
        <div class="mt-6 text-center">
          <p class="text-xs text-gray-400 dark:text-gray-500">
            请使用您的账户凭据登录系统
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { login } from "@/apis/index.js";
import { useRouter } from "vue-router";
import { useGlobalStore } from "@/stores/global";
import { User, Lock, Right, Refresh } from '@element-plus/icons-vue';
import "element-plus/theme-chalk/el-message.css";
import "element-plus/theme-chalk/el-message-box.css";

const router = useRouter();
const globalStore = useGlobalStore();

const form = ref({
  username: "yeehai",
  password: "yeehai2026",
});

const rules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, message: "用户名至少3个字符", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 3, message: "密码至少3位", trigger: "blur" },
  ],
};

const loginForm = ref(null);
const loading = ref(false);

const handleLogin = async () => {
  loginForm.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.error("请正确填写用户名和密码");
      return;
    }
    loading.value = true;
    try {
      const res = await login({
        username: form.value.username,
        password: form.value.password,
      });
      if (res.code === 0) {
        globalStore.user = res.data.user;
        globalStore.access_token = res.data.access_token;
        globalStore.isLogin = true;
        ElMessage.success("登录成功");
        router.push("/");
      } else {
        ElMessageBox.alert(res.message, "提示：", {
          confirmButtonText: "OK",
          callback: () => {
            loginForm.value.resetFields();
          },
        });
      }
    } finally {
      loading.value = false;
    }
  });
};

const resetForm = () => {
  loginForm.value.resetFields();
};
</script>

<style scoped>
/* 登录页面样式已使用 Tailwind CSS，无需额外样式 */
</style>
