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
import { ref, nextTick } from "vue";
import { login, getPages } from "@/apis/index.js";
import { useRouter } from "vue-router";
import { useGlobalStore } from "@/stores/global";
import { addProtectedRoutes } from "@/utils";
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
        // 保存登录返回的站点列表，并默认选中第一个站点（客户端页面用）
        globalStore.sites = res.data.sites || [];
        if (globalStore.sites.length > 0) {
          globalStore.setWebsiteInfo(globalStore.sites[0]);
        } else {
          globalStore.setWebsiteInfo(null);
        }

        const role = (res.data.user?.role ?? "user").toString().toLowerCase();
        // 用户身份：拉取当前站点的页面列表，供侧栏「页面列表」展示
        if ((role === "user" || role === "customer") && globalStore.websiteInfo?.site_id) {
          try {
            const pageRes = await getPages(globalStore.websiteInfo.site_id);
            if (pageRes?.code === 0 && Array.isArray(pageRes.data)) {
              globalStore.sitePageList = pageRes.data.map((p) => ({
                id: p.ID ?? p.id,
                post_name: p.post_name ?? p.post_title ?? "",
              }));
            } else {
              globalStore.sitePageList = [];
            }
          } catch {
            globalStore.sitePageList = [];
          }
        }

        ElMessage.success("登录成功");

        // 根据角色添加路由
        await addProtectedRoutes(role);
        
        // 等待路由添加完成后再跳转
        await new Promise(resolve => setTimeout(resolve, 150));
        await nextTick();
        await nextTick();
        
        // 根据角色跳转到不同页面（使用路由名称更安全）
        const targetRouteName = role === "admin" || role === "administrator" ? "AdminList" : "CustomerHome";
        
        // 验证路由是否可以解析
        let canResolve = false;
        let retryCount = 0;
        
        while (retryCount < 5 && !canResolve) {
          try {
            const resolved = router.resolve({ name: targetRouteName });
            if (resolved.name && resolved.name !== "NotFound") {
              canResolve = true;
            }
          } catch (err) {
            // 解析失败，继续重试
          }
          
          if (!canResolve) {
            retryCount++;
            if (retryCount < 5) {
              await new Promise(resolve => setTimeout(resolve, 50));
              await nextTick();
            }
          }
        }
        
        if (canResolve) {
          router.push({ name: targetRouteName, replace: true });
        } else {
          // 如果无法解析，使用路径跳转
          if (role === "admin" || role === "administrator") {
            router.push({ path: "/admin/list", replace: true });
          } else {
            router.push({ path: "/siteInfo", replace: true });
          }
        }
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
