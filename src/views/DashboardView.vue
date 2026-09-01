<template>
  <div class="shell">
    <DashboardHeader :updated-at="store.data.updatedAt" />

    <section class="enterprise-monitor-strip" aria-label="企业与民生用气监测">
      <EnterpriseMonitor />
      <ElderlyMonitor />
    </section>

    <section class="pipeline-safety-section" aria-label="燃气管道安全管控">
      <h2 class="section-title">燃气管道安全管控</h2>
      <section class="risk-control-strip" aria-label="风险趋势与高风险管控">
        <RiskTrendCanvas />
        <MajorRiskControl />
      </section>
      <main class="alert-workbench">
        <section class="alert-main">
          <RealtimeAlerts />
          <SelectedAnalysis />
        </section>
      </main>
    </section>

    <div class="video-preload" aria-hidden="true">
      <video src="/assets/videos/third-party-construction-low-risk.mp4" preload="auto" muted playsinline></video>
      <video src="/assets/videos/third-party-construction-low-risk-2.mp4" preload="auto" muted playsinline></video>
      <video src="/assets/videos/construction-waterlogging-risk.mp4" preload="auto" muted playsinline></video>
    </div>
  </div>
</template>

<script setup lang="ts">
import DashboardHeader from "@/components/dashboard/DashboardHeader.vue";
import ElderlyMonitor from "@/components/dashboard/ElderlyMonitor.vue";
import EnterpriseMonitor from "@/components/dashboard/EnterpriseMonitor.vue";
import MajorRiskControl from "@/components/dashboard/MajorRiskControl.vue";
import RealtimeAlerts from "@/components/dashboard/RealtimeAlerts.vue";
import RiskTrendCanvas from "@/components/dashboard/RiskTrendCanvas.vue";
import SelectedAnalysis from "@/components/dashboard/SelectedAnalysis.vue";
import { useDashboardStore } from "@/stores/dashboard";

const store = useDashboardStore();
</script>
