<template>
  <div class="video-modal" :class="{ open: modelValue }" :aria-hidden="!modelValue">
    <div class="video-modal-backdrop" @click="close"></div>
    <div class="video-modal-panel" role="dialog" aria-modal="true" aria-labelledby="videoModalTitle">
      <div class="video-modal-head">
        <strong id="videoModalTitle">{{ alert?.title || "施工视频预警" }}</strong>
        <button type="button" @click="close">关闭</button>
      </div>
      <video v-if="alert?.videoUrl" ref="playerRef" :src="alert.videoUrl" controls preload="auto" playsinline></video>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import type { AlertRow } from "@/types/dashboard";

const props = defineProps<{ modelValue: boolean; alert: AlertRow | null }>();
const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();
const playerRef = ref<HTMLVideoElement | null>(null);

function close() {
  playerRef.value?.pause();
  emit("update:modelValue", false);
}

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return;
    await nextTick();
    playerRef.value?.play().catch(() => {});
  },
);
</script>
