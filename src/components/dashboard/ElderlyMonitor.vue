<template>
  <section class="panel elderly-monitor-panel" aria-label="独居老人智慧用气动态监测">
    <div class="ratio-head">
      <p class="eyebrow">Elderly Gas</p>
      <h2>独居老人智慧用气动态监测</h2>
    </div>
    <div class="elderly-monitor-content">
      <div class="elderly-risk-grid">
        <article v-for="item in riskSummaries" :key="item.name" class="elderly-risk-card" :class="item.className">
          <span>{{ item.name }}</span>
          <strong>{{ item.count }}</strong>
          <small>{{ item.rule }}</small>
        </article>
      </div>
      <h3 class="elderly-analysis-title">分析结果</h3>
      <div class="elderly-analysis-list">
        <article v-for="item in elderlyItems" :key="`${item.name}-${item.riskName}`" class="elderly-analysis-item" :class="elderlyLevelMeta(item.level).className">
          <div>
            <strong>{{ item.name }} · {{ item.age }}岁</strong>
            <span>{{ item.riskName }} · {{ item.level }}</span>
          </div>
          <p>{{ elderlyReport(item) }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useDashboardStore } from "@/stores/dashboard";
import { elderlyLevelMeta, elderlyReport } from "@/utils/dashboard";

const store = useDashboardStore();
const elderlyItems = computed(() => store.data.elderlyMonitoring);
const riskSummaries = computed(() =>
  [
    { name: "长期未用气", level: "红色" as const, rule: "连续3天用气量 = 0" },
    { name: "长期低程度用气", level: "红色" as const, rule: "连续3天用气量低于日常均值10%" },
    { name: "用气骤降", level: "橙色" as const, rule: "近24小时或近3日低于30日均值30%" },
    { name: "用气异常升高", level: "黄色" as const, rule: "近24小时高于30日均值200%" },
  ].map((summary) => ({
    ...summary,
    count: elderlyItems.value.filter((item) => item.riskName === summary.name).length,
    ...elderlyLevelMeta(summary.level),
  })),
);
</script>
