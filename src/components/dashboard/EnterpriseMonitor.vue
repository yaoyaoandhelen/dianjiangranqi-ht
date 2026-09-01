<template>
  <section class="panel trend-panel enterprise-monitor-panel">
    <div class="panel-head">
      <div>
        <p class="eyebrow">Enterprise Gas</p>
        <h2>企业用气动态监测</h2>
      </div>
    </div>

    <div class="enterprise-stats-content">
      <div class="enterprise-stat-grid">
        <article class="enterprise-stat-card">
          <span>用气企业数</span>
          <strong>47<small>家</small></strong>
        </article>
        <article class="enterprise-stat-card">
          <span>本月总用气量</span>
          <strong>{{ formatAmount(totalGas) }}<small>m³</small></strong>
        </article>
        <article class="enterprise-stat-card">
          <span>本月总回款</span>
          <strong>{{ formatAmount(totalCollection) }}<small>元</small></strong>
        </article>
      </div>
    </div>

    <div class="type-bars enterprise-risk-content">
      <h3 class="enterprise-analysis-title">企业经营分析</h3>
      <div class="enterprise-levels">
        <article v-for="item in riskSummary" :key="item.name" class="enterprise-level" :class="item.className">
          <span>{{ item.name }}</span>
          <strong>{{ item.count }}</strong>
        </article>
      </div>
      <div class="enterprise-risk-list">
        <article v-for="item in focused" :key="`${item.company}-${item.warningType}`" class="enterprise-risk-item" :class="enterpriseLevelMeta(item.level).className">
          <div>
            <strong>{{ item.company }}</strong>
            <span>{{ enterpriseRiskName(item) }} · {{ item.level }}</span>
          </div>
          <p>{{ enterpriseReport(item) }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useDashboardStore } from "@/stores/dashboard";
import { enterpriseLevelMeta, enterpriseReport, enterpriseRiskName, formatAmount } from "@/utils/dashboard";

const store = useDashboardStore();
const enterprises = computed(() => store.data.enterpriseMonitoring);
const totalGas = computed(() => enterprises.value.reduce((sum, item) => sum + item.monthGas, 0));
const totalCollection = computed(() => enterprises.value.reduce((sum, item) => sum + item.received, 0));
const riskSummary = computed(() =>
  [
    { name: "疑似停产", level: "红色" as const },
    { name: "疑似减产", level: "橙色" as const },
    { name: "回款异常", level: "黄色" as const },
    { name: "经营波动", level: "黄色" as const },
  ].map((summary) => ({
    ...summary,
    count: enterprises.value.filter((item) => enterpriseRiskName(item) === summary.name).length,
    ...enterpriseLevelMeta(summary.level),
  })),
);
const levelOrder = ["红色", "橙色", "黄色", "蓝色"];
const focused = computed(() =>
  enterprises.value.filter((item) => item.warningType !== "正常监测").sort((a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level)),
);
</script>
