<template>
    <div class="login-bg">
        <div class="login-box">
            <div class="login-logo">
                <img src="/logo.svg" alt="">
            </div>

            <div class="login-title">
                <h1>素材收集系统</h1>
            </div>

            <div class="login-form">
                <el-form :rules="rules" ref="loginForm" :model="form" label-width="100px">
                    <el-form-item label="用户名" prop="username">
                        <el-input v-model="form.username" placeholder="请输入用户名" />
                    </el-form-item>

                    <el-form-item label="密码" prop="password">
                        <el-input type="password" v-model="form.password" placeholder="请输入密码" />
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" @click="handleLogin">登录</el-button>
                        <el-button @click="resetForm">重置</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import { useGlobalStore } from "@/stores/global";
import 'element-plus/theme-chalk/el-message.css'
import 'element-plus/theme-chalk/el-message-box.css'


const router = useRouter();
const globalStore = useGlobalStore();

const form = ref({
    username: "",
    password: "",
});

const rules = {
    username: [
        { required: true, message: "请输入用户名", trigger: "blur" },
        { min: 3, message: "用户名至少3个字符", trigger: "blur" },
    ],
    password: [
        { required: true, message: "请输入密码", trigger: "blur" },
        { min: 6, message: "密码至少6位", trigger: "blur" },
    ],
};

const loginForm = ref(null);

// 登录逻辑放在页面
const handleLogin = () => {
    loginForm.value.validate((valid) => {
        if (!valid) {
            ElMessage.error("请正确填写用户名和密码");
            return;
        }
        // 打印账密
        // console.log('表单数据：'+form.value.username+' '+form.value.password);

        // 模拟登录成功逻辑,等有接口时调用接口，拿到返回参数再进行router跳转
        if (form.value.username === "admin" && form.value.password === "123456") {
            globalStore.user.username = form.value.username;
            globalStore.user.token = "mock-token-" + Date.now();
            globalStore.user.isLogin = true;

            ElMessage.success("登录成功");
            router.push("/admin");
        } else {
            // ElMessage.error("用户名或密码错误");
            ElMessageBox.alert('用户名或密码错误', '提示：', {
              confirmButtonText: 'OK',
                callback: () => {
                loginForm.value.resetFields();
              }
            })
        }
    });
};

const resetForm = () => {
    loginForm.value.resetFields();
};
</script>


<style scoped>
.login-bg {
    width: 100vw;
    height: 100vh;
    background-image: url("/login-bg.webp");
    background-position: center;
    background-size: cover;
}

.login-box {
    width: 50vw;
    min-height: 50vh;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0 auto;
    padding: 100px 50px;
    backdrop-filter: blur(10px);
    background: transparent;
    border-radius: 10px;
    box-shadow: 0 0 10px #ffffff60;
}

.login-logo {
    text-align: center;
    margin-bottom: 50px;
}

.login-logo img {
    width: 50%;
}

.login-title {
    text-align: center;
    margin-bottom: 30px;
}

.login-title h1 {
    font-size: 36px;
    font-weight: bold;
    color: #fff;
}

.login-form {
    width: 50%;
    margin: auto;
}
:deep(.el-form-item__label) {
    color: #ffffff;
}

@media screen and (max-width:768px) {
  .login-box {
    width: 80vw;
    padding: 100px 20px;
}
.login-logo img {
    width: 100%;
}
.login-form {
    width: 100%;
    margin: auto;
}
}

</style>