<template>
  <section class="panel ratio-panel">
    <div class="ratio-head">
      <h2>高风险管控</h2>
      <p>按风险类型聚合高风险预警，提示相关人员及时处置</p>
    </div>
    <div class="type-bars">
      <div class="major-risk-board">
        <button
          v-for="item in store.majorRisks"
          :key="item.name"
          class="major-risk-card"
          :class="{ active: item.count > 0, selected: store.majorRiskFilter && store.activeRiskId === item.riskId }"
          type="button"
          @click="store.selectRisk(item.riskId, true)"
        >
          <div class="major-risk-top">
            <span class="danger-mark" :style="{ background: item.count > 0 ? '#fb923c' : 'rgba(148, 163, 184, .28)' }">{{ item.count > 0 ? "!" : "✓" }}</span>
            <strong>{{ item.name }}</strong>
          </div>
          <div class="major-risk-number">
            <em>{{ item.count }}</em>
            <span>高风险预警</span>
          </div>
          <p>{{ item.count ? `${item.name}高风险预警已进入集中管控` : "暂无高风险预警" }}</p>
          <small>{{ item.count ? "需立即关注" : "运行平稳" }}</small>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useDashboardStore } from "@/stores/dashboard";

const store = useDashboardStore();
</script>
