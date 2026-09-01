<template>
  <section class="panel map-panel">
    <div class="panel-head">
      <div>
        <p class="eyebrow">Realtime Alerts</p>
        <h2>实时告警</h2>
      </div>
      <div class="risk-level-legend" aria-label="风险等级颜色说明">
        <span v-for="item in store.data.riskLevels" :key="item.level">
          <i :style="{ background: item.color, boxShadow: `0 0 12px ${item.color}88` }"></i>
          {{ item.level }}-{{ colorNames[item.level] }}
        </span>
      </div>
      <span class="chip">{{ panelLabel }}</span>
    </div>

    <RiskFilterBar />

    <div v-if="!rows.length" class="empty-state">
      <span>!</span>
      <strong>{{ store.activeRiskId === "construction" ? "暂无匹配施工预警" : "暂无高风险数据" }}</strong>
      <p>{{ store.activeRiskId === "construction" ? "当前风险状态和处置状态组合下暂无视频预警。" : "当前筛选条件下未发现需要处置的高风险告警。" }}</p>
    </div>

    <template v-else-if="store.activeRiskId === 'construction'">
      <section class="construction-command" aria-label="第三方施工预警闭环">
        <article class="construction-chart-card">
          <div>
            <p>风险分布</p>
            <strong>{{ sourceRows.length }}</strong>
            <span>条视频预警</span>
          </div>
          <i class="donut" :style="{ background: riskDonut }"></i>
          <ul>
            <li v-for="item in riskStats" :key="item.name">
              <b :style="{ background: item.color }"></b>
              <span>{{ item.name }}</span>
              <strong>{{ item.count }}</strong>
            </li>
          </ul>
        </article>

        <article class="construction-chart-card process">
          <div>
            <p>业务闭环</p>
            <strong>{{ completedRate }}%</strong>
            <span>已确认/已完成</span>
          </div>
          <i class="donut" :style="{ background: statusDonut }"></i>
          <ul>
            <li v-for="item in statusStats" :key="item.name">
              <b :style="{ background: item.color }"></b>
              <span>{{ item.name }}</span>
              <strong>{{ item.count }}</strong>
            </li>
          </ul>
        </article>

      </section>

      <div class="construction-filter-row" aria-label="第三方施工筛选">
        <label>
          风险状态
          <select v-model="riskFilter">
            <option v-for="item in riskFilterOptions" :key="item" :value="item">{{ item }}</option>
          </select>
        </label>
        <label>
          处置状态
          <select v-model="statusFilter">
            <option v-for="item in statusFilterOptions" :key="item" :value="item">{{ item }}</option>
          </select>
        </label>
        <span>当前筛选 {{ constructionRows.length }} 条</span>
      </div>

      <div class="video-grid construction-video-grid">
        <article v-for="item in constructionPageRows" :key="`${item.row.time}-${item.sourceIndex}`" class="video-card construction-video-card" :class="[levelClass(item.row.level), statusClass(item.row.processStatus), { active: item.sourceIndex === store.activeAlertIndex }]" tabindex="0" role="button" title="点击选中该风险事件" @click="selectConstruction(item.sourceIndex)">
          <button class="video-thumb" :class="{ 'has-video': item.row.videoUrl }" type="button" aria-label="查看视频大图" @click.stop="openVideo(item.sourceIndex)">
            <video v-if="item.row.videoUrl" :src="item.row.videoUrl" muted preload="auto" playsinline></video>
            <span class="video-open"><i></i></span>
            <span class="risk-corner">{{ item.row.level }}</span>
            <span class="status-corner">{{ item.row.processStatus }}</span>
          </button>
          <strong>{{ item.row.title }}</strong>
          <small>{{ item.row.time }} · {{ item.row.camera }} · {{ item.row.station }}</small>
          <div class="construction-card-foot">
            <span>{{ item.row.confirmResult }}</span>
          </div>
        </article>
      </div>
      <TablePager :total="rows.length" :page-size="constructionPageSize" />
    </template>

    <template v-else>
      <div class="risk-table-wrap">
        <table class="risk-table" :class="{ 'cathodic-table': store.activeRiskId === 'cathodic' }">
          <thead>
            <tr>
              <th class="seq-col">序号</th>
              <th>时间</th>
              <th>设备ID</th>
              <th>设备名称</th>
              <th>区域</th>
              <template v-if="store.activeRiskId === 'strain'">
                <th>频率</th><th>温度</th><th>应变量</th>
              </template>
              <template v-else-if="store.activeRiskId === 'cathodic'">
                <th>通电电位(V)</th><th>断电电位(V)</th><th>直流电流(mA)</th><th>直流电流密度(A/㎡)</th><th>交流电流(mA)</th><th>交流电流密度(A/㎡)</th><th>阳极开路电位(V)</th><th>阳极输出电流(mA)</th><th>信号强度</th><th>电池电压(V)</th>
              </template>
              <template v-else>
                <th>温度</th><th>{{ store.activeRiskId === "leak" ? "可燃气体浓度（LEL）" : "压力（kpa）" }}</th>
              </template>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in pageRows" :key="`${row.time}-${index}`" :class="{ active: start + index === store.activeAlertIndex }" @click="select(start + index)">
              <td class="seq-col">{{ start + index + 1 }}</td>
              <td>{{ row.time }}</td>
              <td>{{ deviceId(row, store.activeRiskId) }}</td>
              <td>{{ deviceName(row, store.activeRiskId) }}</td>
              <td>{{ areaText(row) }}</td>
              <template v-if="store.activeRiskId === 'strain'">
                <td>{{ sampleFrequency(row, start + index) }}</td>
                <td>{{ temperatureValue(row, start + index) }}</td>
                <td><strong :class="pressureClass(row.level)">{{ row.strain }}</strong></td>
              </template>
              <template v-else-if="store.activeRiskId === 'cathodic'">
                <td>{{ Number(row.offPotential || 0) - 0.22 }}</td>
                <td><strong :class="pressureClass(row.level)">{{ row.offPotential }}</strong></td>
                <td>{{ currentValue(72, 4.2, start + index) }}</td>
                <td>{{ row.dcDensity }}</td>
                <td>{{ currentValue(16, 1.7, start + index) }}</td>
                <td>{{ row.acDensity }}</td>
                <td>{{ row.anodeOpenPotential }}</td>
                <td>{{ row.anodeCurrent }}</td>
                <td>{{ row.signal }}</td>
                <td>{{ row.battery }}</td>
              </template>
              <template v-else>
                <td>{{ temperatureValue(row, start + index) }}</td>
                <td><strong :class="pressureClass(row.level)">{{ store.activeRiskId === "leak" ? row.gas : row.pressure }}</strong></td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
      <TablePager :total="rows.length" :page-size="store.alertPageSize" />
    </template>

    <VideoModal v-model="videoOpen" :alert="videoAlert" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import RiskFilterBar from "@/components/dashboard/RiskFilterBar.vue";
import TablePager from "@/components/dashboard/TablePager.vue";
import VideoModal from "@/components/dashboard/VideoModal.vue";
import type { AlertRow, ConstructionProcessStatus, RiskLevel } from "@/types/dashboard";
import { useDashboardStore } from "@/stores/dashboard";
import { areaText, currentValue, deviceId, deviceName, pressureClass, sampleFrequency, temperatureValue } from "@/utils/dashboard";

const store = useDashboardStore();
const constructionPageSize = 8;
const colorNames: Record<string, string> = { 低风险: "蓝色", 中风险: "黄色", 高风险: "橙色" };
const videoOpen = ref(false);
const videoAlert = ref<AlertRow | null>(null);
const riskFilterOptions = ["全部风险", "低风险", "中风险", "高风险"] as const;
const statusFilterOptions = ["全部状态", "待确认", "人工已确认", "处置中", "已完成"] as const;
const riskFilter = ref<(typeof riskFilterOptions)[number]>("全部风险");
const statusFilter = ref<(typeof statusFilterOptions)[number]>("全部状态");
const sourceRows = computed(() => store.currentAlertRows);
const constructionRows = computed(() =>
  sourceRows.value
    .map((row, sourceIndex) => ({ row, sourceIndex }))
    .filter(({ row }) => riskFilter.value === "全部风险" || row.level === riskFilter.value)
    .filter(({ row }) => statusFilter.value === "全部状态" || row.processStatus === statusFilter.value)
    .sort(compareConstructionAlerts),
);
const rows = computed(() => (store.activeRiskId === "construction" ? constructionRows.value.map((item) => item.row) : sourceRows.value));
const pageSize = computed(() => (store.activeRiskId === "construction" ? constructionPageSize : store.alertPageSize));
const start = computed(() => (store.activeAlertPage - 1) * pageSize.value);
const pageRows = computed(() => rows.value.slice(start.value, start.value + pageSize.value));
const constructionPageRows = computed(() => constructionRows.value.slice(start.value, start.value + constructionPageSize));
const panelLabel = computed(() => {
  if (store.activeRiskId === "construction") return "视频预警";
  if (store.activeRiskId === "cathodic") return "阴保监测";
  if (store.activeRiskId === "strain") return "应变με";
  if (store.activeRiskId === "leak") return "可燃气体 LEL";
  return "压力 kPa";
});
const riskMeta: Record<Exclude<RiskLevel, "正常">, { color: string; className: string }> = {
  低风险: { color: "#38bdf8", className: "low" },
  中风险: { color: "#facc15", className: "medium" },
  高风险: { color: "#fb923c", className: "high" },
};
const statusMeta: Record<ConstructionProcessStatus, { color: string; className: string }> = {
  待确认: { color: "#60a5fa", className: "pending" },
  人工已确认: { color: "#22c55e", className: "confirmed" },
  处置中: { color: "#f59e0b", className: "processing" },
  已完成: { color: "#14b8a6", className: "done" },
};
const riskStats = computed(() =>
  (["低风险", "中风险", "高风险"] as const).map((name) => ({ name, count: sourceRows.value.filter((row) => row.level === name).length, color: riskMeta[name].color })),
);
const statusStats = computed(() =>
  (["待确认", "人工已确认", "处置中", "已完成"] as const).map((name) => ({ name, count: sourceRows.value.filter((row) => row.processStatus === name).length, color: statusMeta[name].color })),
);
const completedRate = computed(() => {
  const confirmed = sourceRows.value.filter((row) => row.processStatus === "人工已确认" || row.processStatus === "已完成").length;
  return sourceRows.value.length ? Math.round((confirmed / sourceRows.value.length) * 100) : 0;
});
const riskDonut = computed(() => donutGradient(riskStats.value));
const statusDonut = computed(() => donutGradient(statusStats.value));

watch([riskFilter, statusFilter], () => {
  store.activeAlertPage = 1;
  store.activeAlertIndex = constructionRows.value[0]?.sourceIndex || 0;
});

function select(index: number) {
  store.selectAlert(index);
}

function selectConstruction(index: number) {
  store.selectAlert(index);
}

function openVideo(index: number) {
  store.selectAlert(index);
  videoAlert.value = sourceRows.value[index] || null;
  videoOpen.value = true;
}

function openActiveConstructionVideo() {
  if (store.activeRiskId !== "construction") return;
  openVideo(store.activeAlertIndex);
}

function levelClass(level: RiskLevel) {
  return level === "正常" ? "" : `risk-${riskMeta[level].className}`;
}

function statusClass(status?: ConstructionProcessStatus) {
  return status ? `status-${statusMeta[status].className}` : "";
}

function donutGradient(items: Array<{ count: number; color: string }>) {
  const total = items.reduce((sum, item) => sum + item.count, 0) || 1;
  let cursor = 0;
  const stops = items.map((item) => {
    const startPercent = cursor;
    cursor += (item.count / total) * 100;
    return `${item.color} ${startPercent}% ${cursor}%`;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

function compareConstructionAlerts(left: { row: AlertRow }, right: { row: AlertRow }) {
  const riskOrder: Partial<Record<RiskLevel, number>> = { 高风险: 0, 中风险: 1, 低风险: 2 };
  const statusOrder: Record<ConstructionProcessStatus, number> = { 待确认: 0, 处置中: 1, 已完成: 2, 人工已确认: 3 };
  const riskDiff = (riskOrder[left.row.level] ?? 9) - (riskOrder[right.row.level] ?? 9);
  if (riskDiff) return riskDiff;
  const statusDiff = (left.row.processStatus ? statusOrder[left.row.processStatus] : 9) - (right.row.processStatus ? statusOrder[right.row.processStatus] : 9);
  if (statusDiff) return statusDiff;
  return right.row.time.localeCompare(left.row.time);
}

onMounted(() => {
  window.addEventListener("open-construction-live-monitor", openActiveConstructionVideo);
});

onUnmounted(() => {
  window.removeEventListener("open-construction-live-monitor", openActiveConstructionVideo);
});
</script>
