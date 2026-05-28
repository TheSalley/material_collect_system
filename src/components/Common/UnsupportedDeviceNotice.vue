<template>
  <main
    class="flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_#dbeafe,_#eff6ff_45%,_#f8fafc_75%)] px-6 py-10"
  >
    <div class="absolute inset-0 bg-[linear-gradient(135deg,_rgba(43,124,238,0.08),_transparent_45%,_rgba(16,24,34,0.08))]"></div>

    <section
      class="relative w-full max-w-lg rounded-3xl border border-white/70 bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(16,24,34,0.16)] backdrop-blur"
    >
      <div
        class="mx-auto mb-6 flex size-18 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#2b7cee,_#101822)] text-3xl font-semibold text-white shadow-lg"
      >
        PC
      </div>

      <p
        class="mb-4 inline-flex rounded-full bg-[color-mix(in_oklab,var(--color-primary)_10%,white)] px-4 py-1 text-sm font-medium text-[var(--color-primary)]"
      >
        当前设备暂不支持访问
      </p>

      <h1 class="text-3xl font-bold text-gray-900">
        请使用 PC 查看
      </h1>

      <p class="mt-4 text-base leading-relaxed text-gray-600">
        当前系统在手机和平板上不提供完整体验。为了保证页面编辑、素材管理和后台操作正常，请使用电脑浏览器打开。
      </p>

      <div class="mt-8 rounded-2xl bg-gray-50 px-5 py-4 text-sm leading-relaxed text-gray-500">
        建议使用桌面端 Chrome、Edge 或其他现代浏览器访问。
      </div>
    </section>
  </main>
</template>
