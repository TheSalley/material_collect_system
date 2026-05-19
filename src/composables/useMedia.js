import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { getMediaByDemo, saveMedia } from "@/apis/media";

export function useMedia() {
  const queryDemo = ref("");
  const page_name = ref("");
  const loading = ref(false);
  const rows = ref([]);
  const page = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  const searched = ref(false);

  const totalPages = computed(() => Math.ceil(total.value / pageSize.value) || 1);

  async function loadMedia() {
    loading.value = true;
    searched.value = true;
    try {
      const res = await getMediaByDemo({
        demo: queryDemo.value.trim(),
        page_name: page_name.value.trim(),
        page: page.value,
        pageSize: pageSize.value,
      });
      if (res.code === 0) {
        rows.value = Array.isArray(res.data.list) ? res.data.list : [];
        total.value = res.data.total || rows.value.length;
      } else {
        rows.value = [];
        total.value = 0;
        ElMessage.error(res.message || "获取失败");
      }
    } catch (e) {
      rows.value = [];
      total.value = 0;
      ElMessage.error("请求失败：" + (e?.message || "网络错误"));
    } finally {
      loading.value = false;
    }
  }

  async function handleQuery() {
    page.value = 1;
    await loadMedia();
  }

  function handlePageChange() {
    loadMedia();
  }

  function handleSizeChange() {
    page.value = 1;
    loadMedia();
  }

  async function handleUpload({ file, demo, page: pageName }) {
    const res = await saveMedia({ file, demo, page: pageName });
    if (res.code === 0) {
      ElMessage.success(res.message || "上传成功");
      queryDemo.value = demo;
      page.value = 1;
      await loadMedia();
      return true;
    }
    ElMessage.error(res.message || "上传失败");
    return false;
  }

  return {
    queryDemo,
    page_name,
    loading,
    rows,
    page,
    pageSize,
    total,
    totalPages,
    searched,
    loadMedia,
    handleQuery,
    handlePageChange,
    handleSizeChange,
    handleUpload,
  };
}
