<template>
  <header class="topbar">
    <div>
      <p class="eyebrow">综合场景驾驶舱 / 子页面</p>
      <h1>天然气全链条安全智管智能体</h1>
    </div>
    <div class="top-actions">
      <span class="status-dot"></span>
      <span>更新时间 {{ updatedAt }}</span>
      <RouterLink class="top-action-link" to="/manual-confirmation">人工确认平台</RouterLink>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{ updatedAt: string }>();
</script>
