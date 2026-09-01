<template>
  <div class="risk-filter-bar" aria-label="风险类型筛选">
    <div class="risk-list">
      <button v-for="risk in store.data.risks" :key="risk.id" class="risk-card" :class="{ active: risk.id === store.activeRiskId }" @click="selectRisk(risk.id)">
        <span class="risk-icon">{{ risk.icon }}</span>
        <span class="risk-main">
          <strong>{{ risk.name }}</strong>
          <small :title="riskDescription(risk.id)">{{ riskDescription(risk.id) }}</small>
        </span>
        <span class="risk-score" :class="getLevel(risk.score).className">{{ displayValue(risk.name) }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDashboardStore } from "@/stores/dashboard";
import { getLevel, majorRiskTotalForRisk, riskDescription, riskIdByName } from "@/utils/dashboard";
import type { RiskId } from "@/types/dashboard";

const store = useDashboardStore();

function displayValue(name: string) {
  const riskId = riskIdByName(name);
  if (store.majorRiskFilter && riskId === store.activeRiskId) return majorRiskTotalForRisk(riskId);
  return store.data.typeRatios.find((item) => item.name === name)?.count || 0;
}

function selectRisk(riskId: RiskId) {
  store.selectRisk(riskId);
}
</script>
