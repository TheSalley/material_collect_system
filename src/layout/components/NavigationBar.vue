<template>
    <div class="navigation-bar">
        <div>
        </div>
        <div class="right-menu">
            <el-dropdown>
                <div class="right-menu-item user">
                    <el-avatar icon="UserFilled" :size="30" />
                    <span>{{ username }}</span>
                </div>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item divided @click="logout">
                            退出登录
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </div>
</template>
<script setup>
import { ref } from "vue"
import { Expand, Fold } from "@element-plus/icons-vue"
import { UserFilled } from '@element-plus/icons-vue'
import { useRouter } from "vue-router";
import { useGlobalStore } from "@/stores/global";


const router = useRouter();
const globalStore = useGlobalStore();
const username = ref("Admin")

const { isActive = false } = defineProps({
    isActive: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(["toggleClick"])

function toggleClick() {
    emit("toggleClick")
}


// 退出登录
function logout() {
    ElMessage.success("退出成功");

    //  1. 清空 Pinia 全局用户状态
    globalStore.user = { username: "", token: "", isLogin: false };

    //  2. 清空localStorage
    sessionStorage.clear();      
    localStorage.removeItem("pinia");  // 如果用了 pinia-plugin-persistedstate 存在 localStorage 中

    //  3. 跳转回登录页
    router.push("/login");
}
</script>

<style scoped>
.navigation-bar {
    height: 85px;
    overflow: hidden;
    display: flex;
    justify-content: space-between;
}

.icon {
    vertical-align: middle;
    color: #333;
}

.right-menu {
    margin-right: 10px;
    height: 100%;
    display: flex;
    align-items: center;
}

.user {
    display: flex;
    align-items: center;

    .el-avatar {
        margin-right: 10px;
    }

    span {
        font-size: 16px;
    }
}
</style>