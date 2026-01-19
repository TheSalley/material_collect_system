<template>
  <div class="mx-auto w-full">
    <div class="flex flex-wrap justify-between items-center gap-4 mb-8">
      <h1
        class="text-[#111418] dark:text-white text-3xl font-bold leading-tight"
      >
        客户管理
      </h1>
    </div>
    <div class="bg-white dark:bg-gray-900/50 rounded-lg">
      <div class="py-4 border-gray-200 dark:border-gray-700">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex-1 min-w-[300px]">
            <el-input
              v-model="searchValue"
              style="width: 240px"
              size="large"
              placeholder="搜索"
            />
          </div>
          <div class="flex items-center gap-3">
            <el-button type="primary" disabled>添加新客户</el-button>
          </div>
        </div>
      </div>
      <div class="overflow-x-auto w-full">
        <el-table :data="tableData" border height="350">
          <el-table-column prop="site_id" label="ID" />
          <!-- <el-table-column prop="username" label="客户账号"/> -->
          <el-table-column prop="site_name" label="站点名称"/>
          <el-table-column prop="demo_site" label="demo 名称"/>
          <el-table-column prop="wp_base_url" label="网址" width="180" />
          <el-table-column prop="mode" label="模式">
            <template #default="scope">
              <el-tag>{{ scope.row.mode === 1 ? "组件" : "页面" }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">{{
                scope.row.status === 1 ? "启用" : "禁用"
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="updated_at" label="创建时间" width="180" />
          <el-table-column fixed="right" label="操作" min-width="120">
            <template #default="scope">
              <el-button
                link
                type="primary"
                size="small"
                @click="edit(scope.row)"
                >编辑</el-button
              >
              <el-button
                link
                type="primary"
                size="small"
                @click="config(scope.row)"
                >配置</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="flex items-center justify-between p-4">
        <el-pagination
          :page-size="20"
          :pager-count="11"
          layout="prev, pager, next"
          :total="1000"
        />
      </div>
    </div>
  </div>

  <el-drawer v-model="drawer" title="客户配置">
    <template #default>
      <el-form :model="form" label-width="auto" style="max-width: 600px">
        <el-form-item label="客户名称">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="demo 名称">
          <el-input v-model="form.demo" />
        </el-form-item>
        <el-form-item label="网址">
          <el-input v-model="form.url" />
        </el-form-item>
        <el-form-item label="模式">
          <el-radio-group v-model="form.mode">
            <el-radio :value="1">组件</el-radio>
            <el-radio :value="2">页面</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" />
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="drawer = false">取消</el-button>
        <el-button type="primary" @click="onSubmit">保存</el-button>
      </div>
    </template>
  </el-drawer>
</template>
<script setup>
import { ref, reactive, onMounted } from "vue";
import { getList, updateUser } from "@/apis/index.js";
import { useRouter } from "vue-router";
import { useGlobalStore } from "@/stores/global.js";

const tableData = reactive([]);

const searchValue = ref("");

let pageList = reactive([]);

const drawer = ref(false);

const router = useRouter();

const { setUser } = useGlobalStore();

const form = reactive({
  id: "",
  username: "",
  demo: "",
  url: "",
  mode: 2,
  status: true,
});

async function onSubmit() {
  if(form.url.endsWith('/')) {
    return ElMessage.error("网址不能以斜杠结尾");
  }
  const res = await updateUser({
    id: form.id,
    username: form.username,
    demo: form.demo,
    url: form.url,
    mode: form.mode,
    status: form.status ? 1 : 2,
  });
  if (res.code === 0) {
    ElMessage({
      message: "保存成功",
      type: "success",
    });
    tableData.forEach((item, index) => {
      if (item.id == res.data.id) {
        tableData[index] = res.data;
      }
    });
    setUser(res.data);
    drawer.value = false;
  } else {
    ElMessage({
      message: "保存失败",
      type: "error",
    });
  }
}

onMounted(async () => {
  const res = await getList();
  if (res.code === 0) {
    res.data.forEach(i => i.mode = 2); // 临时修改
    tableData.push(...res.data);
  } else {
    if (res.code === 401) {
      ElMessage.error("账号已过期，请重新登录");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push("/login");
    } else {
    }
  }
});

function edit(data) {
  form.id = data.id;
  form.username = data.username;
  form.demo = data.demo;
  form.url = data.url;
  form.mode = data.mode;
  form.status = data.status === 1 ? true : false;
  drawer.value = true;
}

function config(data) {
  const { setWebsiteInfo } = useGlobalStore();
  setWebsiteInfo(data);
  router.push({ path: "/detail", query: { id: data.id } });
}
</script>
