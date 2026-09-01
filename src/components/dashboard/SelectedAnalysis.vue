<template>
  <section class="panel analysis-panel">
    <div class="panel-head">
      <div>
        <p class="eyebrow">Risk Analysis Result</p>
        <h2>风险分析结果</h2>
      </div>
      <div class="selected-analysis-meta">
        <button v-if="alert && store.activeRiskId === 'construction'" class="live-monitor-button analysis-head-live" type="button" @click="openLiveMonitor">调用实时监控画面</button>
        <span class="chip">{{ alert ? `${store.activeRisk.name} · ${alert.level}` : "暂无数据" }}</span>
      </div>
    </div>
    <div class="selected-analysis">
      <article v-if="alert && store.activeRiskId === 'construction'" class="construction-report-analysis">
        <div class="construction-report-grid">
          <div class="construction-report-text">
            <section class="construction-report-brief">
              <div class="construction-fact-grid">
                <span>
                  <b>等级预警</b>
                  <strong>{{ alert.level }}</strong>
                </span>
                <span>
                  <b>预警时间</b>
                  <strong>{{ alert.time }}</strong>
                </span>
                <span>
                  <b>告警目标</b>
                  <strong>{{ alert.deviceName || alert.camera }}</strong>
                </span>
                <span>
                  <b>告警地点</b>
                  <strong>{{ alert.station || alert.region }}</strong>
                </span>
                <span>
                  <b>风险区域</b>
                  <strong>{{ alert.distance }}</strong>
                </span>
                <span>
                  <b>历史告警频次</b>
                  <strong>低风险 {{ alert.frequency.low }} 次，中风险 {{ alert.frequency.medium }} 次，高风险 {{ alert.frequency.high }} 次。</strong>
                </span>
              </div>
            </section>
            <div class="construction-report-sections">
              <section>
                <h3>可能原因</h3>
                <p>{{ alert.cause }}</p>
              </section>
              <section>
                <h3>可能影响</h3>
                <p>{{ alert.impact }}</p>
              </section>
              <section>
                <h3>处置建议</h3>
                <p>{{ alert.advice }}</p>
              </section>
              <section>
                <h3>处置情况</h3>
                <p>{{ disposalText }}</p>
              </section>
              <section class="wide">
                <h3>智能研判结果描述</h3>
                <p>{{ alert.analysisResult || "模型根据视频识别结果、距离、持续时间和历史频次自动生成研判结论。" }}</p>
              </section>
            </div>
          </div>
        </div>
      </article>
      <article v-else-if="alert" class="model-analysis">
        <div class="analysis-summary">
          <strong>{{ deviceId(alert, store.activeRiskId) }} · {{ deviceName(alert, store.activeRiskId) }}</strong>
        </div>
        <section>
          <h3>历史告警频次</h3>
          <p>低风险 {{ alert.frequency.low }} 次，中风险 {{ alert.frequency.medium }} 次，高风险 {{ alert.frequency.high }} 次。</p>
        </section>
        <section>
          <h3>可能原因</h3>
          <p>{{ alert.cause }}</p>
        </section>
        <section>
          <h3>可能影响</h3>
          <p>{{ alert.impact }}</p>
        </section>
        <section>
          <h3>处置建议</h3>
          <p>{{ alert.advice }}</p>
        </section>
        <p class="analysis-footnote">{{ riskThresholdText(store.activeRiskId, alert) }}。</p>
      </article>
      <article v-else class="model-analysis empty-analysis">
        <div class="analysis-summary">
          <strong>{{ store.activeRisk.name }}暂无高风险告警</strong>
        </div>
        <section>
          <h3>研判结果</h3>
          <p>当前风险类型下未发现高风险实时告警，建议保持常规监测，并持续关注风险管控与趋势变化。</p>
        </section>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useDashboardStore } from "@/stores/dashboard";
import { deviceId, deviceName, riskThresholdText } from "@/utils/dashboard";

const store = useDashboardStore();
const alert = computed(() => store.activeAlert);
const disposalText = computed(() => {
  if (!alert.value) return "";
  if (alert.value.disposalResult) return alert.value.disposalResult;
  if (alert.value.processStatus === "人工已确认") return "人工确认不是风险，未进入事件处置流程。";
  return `当前状态：${alert.value.processStatus || "待确认"}。${alert.value.confirmResult || "等待业务系统返回确认结果。"}`;
});

function openLiveMonitor() {
  window.dispatchEvent(new CustomEvent("open-construction-live-monitor"));
}
</script>
