import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { dashboardData } from "@/mock/dashboard";
import type { AlertRow, RiskId } from "@/types/dashboard";
import {
  buildStationRows,
  majorRiskStationsForRisk,
  majorRiskTotalForRisk,
  realConstructionAlertRows,
  riskIdByName,
} from "@/utils/dashboard";

export const useDashboardStore = defineStore("dashboard", () => {
  const constructionConfirmRows = ref<AlertRow[]>(realConstructionAlertRows());
  const activeRiskId = ref<RiskId>("construction");
  const activeAlertIndex = ref(0);
  const activeAlertPage = ref(1);
  const alertPageSize = ref(10);
  const riskTrendRange = ref<"today" | "week" | "month">("month");
  const majorRiskFilter = ref(false);

  const activeRisk = computed(() => dashboardData.risks.find((risk) => risk.id === activeRiskId.value)!);

  const majorRisks = computed(() =>
    dashboardData.typeRatios.map((riskType) => {
      const riskId = riskIdByName(riskType.name);
      const stations = majorRiskStationsForRisk(riskId);
      return { ...riskType, riskId, stations, count: stations.reduce((sum, item) => sum + item.count, 0) };
    }),
  );

  const currentAlertRows = computed<AlertRow[]>(() => {
    if (activeRiskId.value === "construction" && !majorRiskFilter.value) return constructionConfirmRows.value;
    if (majorRiskFilter.value) {
      const total = majorRiskTotalForRisk(activeRiskId.value);
      if (!total) return [];
      return dashboardData.stationRiskRatios
        .flatMap((station) => buildStationRows(station, activeRiskId.value))
        .filter((row) => row.level === "高风险")
        .slice(0, total);
    }
    return dashboardData.stationRiskRatios.flatMap((station) => buildStationRows(station, activeRiskId.value));
  });

  const activeAlert = computed(() => currentAlertRows.value[activeAlertIndex.value] || currentAlertRows.value[0] || null);

  function resetAlertSelection() {
    activeAlertIndex.value = 0;
    activeAlertPage.value = 1;
  }

  function selectRisk(riskId: RiskId, fromMajor = false) {
    activeRiskId.value = riskId;
    majorRiskFilter.value = fromMajor;
    resetAlertSelection();
  }

  function selectAlert(index: number) {
    activeAlertIndex.value = index;
  }

  function confirmConstructionAlert(index: number, isRisk: boolean) {
    const row = constructionConfirmRows.value[index];
    if (!row) return null;

    const eventCode = row.eventCode || `DJ-SG-${row.time.slice(0, 10).replace(/-/g, "")}-${String(index + 1).padStart(3, "0")}`;
    const confirmedRow: AlertRow = {
      ...row,
      processStatus: isRisk ? "处置中" : "人工已确认",
      eventCode: isRisk ? eventCode : undefined,
      governanceCenter: isRisk ? row.governanceCenter || "三级治理中心 · 属地街镇" : undefined,
      confirmResult: isRisk ? "人工确认存在风险，已下发三级治理。" : "人工复核为非风险，未进入事件处置流程。",
      disposalResult: isRisk ? row.disposalResult || "已下发三级治理，等待属地处置平台接收并反馈。" : "未进入三级治理流程，仅保留人工复核记录。",
    };

    constructionConfirmRows.value.splice(index, 1, confirmedRow);
    return confirmedRow;
  }

  return {
    data: dashboardData,
    constructionConfirmRows,
    activeRiskId,
    activeAlertIndex,
    activeAlertPage,
    alertPageSize,
    riskTrendRange,
    majorRiskFilter,
    activeRisk,
    majorRisks,
    currentAlertRows,
    activeAlert,
    resetAlertSelection,
    selectRisk,
    selectAlert,
    confirmConstructionAlert,
  };
});
