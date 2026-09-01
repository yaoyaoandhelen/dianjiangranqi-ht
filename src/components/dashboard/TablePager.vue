<template>
  <div class="table-pager" aria-label="实时告警分页">
    <span>{{ startLabel }}-{{ endLabel }} / {{ total }}条</span>
    <button type="button" :disabled="store.activeAlertPage <= 1" @click="prev">上一页</button>
    <em>{{ store.activeAlertPage }} / {{ pageCount }}</em>
    <button type="button" :disabled="store.activeAlertPage >= pageCount" @click="next">下一页</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useDashboardStore } from "@/stores/dashboard";

const props = defineProps<{ total: number; pageSize: number }>();
const store = useDashboardStore();
const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));
const startLabel = computed(() => (props.total ? (store.activeAlertPage - 1) * props.pageSize + 1 : 0));
const endLabel = computed(() => Math.min(props.total, store.activeAlertPage * props.pageSize));

function prev() {
  store.activeAlertPage = Math.max(1, store.activeAlertPage - 1);
  store.activeAlertIndex = (store.activeAlertPage - 1) * props.pageSize;
}

function next() {
  store.activeAlertPage = Math.min(pageCount.value, store.activeAlertPage + 1);
  store.activeAlertIndex = (store.activeAlertPage - 1) * props.pageSize;
}
</script>
