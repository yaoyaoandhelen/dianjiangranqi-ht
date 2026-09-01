<template>
  <div class="confirmation-admin">
    <aside class="admin-sidebar" aria-label="后台菜单">
      <div class="admin-brand">
        <strong>垫江燃气安全智管人工确认平台</strong>
        <span>预警人工复核</span>
      </div>
      <nav class="admin-menu">
        <a class="active" href="/manual-confirmation">第三方施工</a>
        <a href="/manual-confirmation">下发记录</a>
        <a href="/manual-confirmation">系统配置</a>
      </nav>
    </aside>

    <main class="admin-main">
      <header class="admin-header">
        <div>
          <h1>第三方施工人工确认</h1>
          <p>对驾驶舱监控推送的第三方施工预警进行人工判定，并将风险事件下发三级治理。</p>
        </div>
      </header>

      <section class="confirm-stat-strip" aria-label="确认统计">
        <article v-for="item in stats" :key="item.label" class="confirm-stat" :class="item.tone">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small>{{ item.note }}</small>
        </article>
      </section>

      <section class="confirm-workbench" aria-label="第三方施工预警确认工作台">
        <div class="confirm-toolbar">
          <div>
            <h2>预警确认列表</h2>
            <p>确认有风险后，系统将预警信息下发三级治理；确认为非风险则进入归档记录。</p>
          </div>
        </div>

        <div class="confirm-filters" aria-label="预警查询条件">
          <div class="query-fields">
            <label>
              预警等级
              <select v-model="draftFilters.level">
                <option v-for="item in levelOptions" :key="item" :value="item">{{ item }}</option>
              </select>
            </label>
            <label>
              预警时间
              <input v-model="draftFilters.date" type="date" />
            </label>
            <label>
              预警地点
              <input v-model.trim="draftFilters.location" type="text" placeholder="请输入预警地点" />
            </label>
            <label>
              设备名称
              <input v-model.trim="draftFilters.device" type="text" placeholder="请输入设备名称" />
            </label>
            <label>
              处置状态
              <select v-model="draftFilters.status">
                <option v-for="item in statusOptions" :key="item" :value="item">{{ item }}</option>
              </select>
            </label>
          </div>
          <div class="query-actions">
            <button class="query-primary" type="button" @click="applyFilters">查询</button>
            <button class="query-secondary" type="button" @click="resetFilters">取消</button>
          </div>
        </div>

        <div class="confirm-table-wrap">
          <table class="confirm-table">
            <thead>
              <tr>
                <th>序号</th>
                <th>预警等级</th>
                <th>预警时间</th>
                <th>预警地点</th>
                <th>预警区域</th>
                <th>设备名称</th>
                <th>处置状态</th>
                <th>可能原因</th>
                <th>可能影响</th>
                <th>处置建议</th>
                <th>智能研判结果描述</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredRows" :key="`${item.row.time}-${item.sourceIndex}`">
                <td>{{ item.sourceIndex + 1 }}</td>
                <td><span class="level-pill" :class="levelClass(item.row.level)">{{ item.row.level }}</span></td>
                <td>{{ item.row.time }}</td>
                <td>{{ item.row.station || item.row.distance }}</td>
                <td>{{ item.row.distance || item.row.region }}</td>
                <td>{{ deviceName(item.row, "construction") }}</td>
                <td><span class="status-pill" :class="statusClass(item.row.processStatus)">{{ item.row.processStatus || "待确认" }}</span></td>
                <td>{{ item.row.cause }}</td>
                <td>{{ item.row.impact }}</td>
                <td>{{ item.row.advice }}</td>
                <td>{{ item.row.analysisResult || "模型已完成施工活动、距离、持续时间综合研判，建议人工复核。" }}</td>
                <td>
                  <button class="confirm-action" type="button" :disabled="isConfirmedRisk(item.row)" @click="openConfirm(item.sourceIndex)">
                    {{ isConfirmedRisk(item.row) ? "已确认" : "人工确认" }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <el-dialog v-model="dialogVisible" class="risk-confirm-dialog" width="820px" title="人工确认" append-to-body>
      <template v-if="activeItem">
        <section class="dialog-detail" aria-label="当前预警详情">
          <div class="dialog-section-head">
            <h3>当前预警详情</h3>
            <span>{{ activeItem.time }}</span>
          </div>
          <div class="warning-detail-compact">
            <div class="detail-meta-row">
              <div>
                <span class="level-pill" :class="levelClass(activeItem.level)">{{ activeItem.level }}</span>
                <span class="status-pill" :class="statusClass(activeItem.processStatus)">{{ activeItem.processStatus || "待确认" }}</span>
              </div>
              <strong>{{ activeItem.station || activeItem.distance }}</strong>
              <em>{{ deviceName(activeItem, "construction") }}</em>
            </div>
            <dl>
              <div>
                <dt>预警区域</dt>
                <dd>{{ activeItem.distance || activeItem.region }}</dd>
              </div>
              <div>
                <dt>智能研判</dt>
                <dd>{{ activeItem.analysisResult || "模型已完成施工活动、距离、持续时间综合研判，建议人工复核。" }}</dd>
              </div>
              <div>
                <dt>可能原因</dt>
                <dd>{{ activeItem.cause }}</dd>
              </div>
              <div>
                <dt>可能影响</dt>
                <dd>{{ activeItem.impact }}</dd>
              </div>
              <div>
                <dt>处置建议</dt>
                <dd>{{ activeItem.advice }}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section class="history-panel" aria-label="历史预警信息">
          <div class="dialog-section-head history-head">
            <h3>历史预警列表</h3>
            <div class="history-risk-stats" aria-label="历史风险统计">
              <span>共 {{ historyRows.length }} 条</span>
              <span>低风险 {{ historyStats.low }}</span>
              <span>中风险 {{ historyStats.medium }}</span>
              <span>高风险 {{ historyStats.high }}</span>
            </div>
          </div>
          <div class="history-list">
            <article v-for="item in historyRows" :key="`${item.time}-${item.camera}`" class="history-item">
              <span class="level-pill" :class="levelClass(item.level)">{{ item.level }}</span>
              <div>
                <strong>{{ item.time }} · {{ item.station }}</strong>
                <p>{{ item.analysisResult || item.cause }}</p>
              </div>
              <small>{{ item.processStatus || "待确认" }}</small>
            </article>
          </div>
        </section>

        <section class="decision-panel" aria-label="风险确认">
          <h3>确认选项</h3>
          <el-radio-group v-model="decision">
            <el-radio-button label="risk">是，确认为风险并下发三级治理</el-radio-button>
            <el-radio-button label="notRisk">否，归档为非风险</el-radio-button>
          </el-radio-group>
        </section>
      </template>

      <template #footer>
        <button class="dialog-secondary" type="button" @click="dialogVisible = false">取消</button>
        <button class="dialog-primary" type="button" @click="submitConfirm">确认提交</button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { ElMessage } from "element-plus";
import type { AlertRow, ConstructionProcessStatus, RiskLevel } from "@/types/dashboard";
import { useDashboardStore } from "@/stores/dashboard";
import { deviceName } from "@/utils/dashboard";

const store = useDashboardStore();
const levelOptions = ["全部等级", "低风险", "中风险", "高风险"] as const;
const statusOptions = ["全部状态", "待确认", "人工已确认", "处置中", "已完成"] as const;
type QueryFilters = {
  level: (typeof levelOptions)[number];
  status: (typeof statusOptions)[number];
  date: string;
  location: string;
  device: string;
};

function emptyFilters(): QueryFilters {
  return {
    level: "全部等级",
    status: "全部状态",
    date: "",
    location: "",
    device: "",
  };
}

const draftFilters = ref<QueryFilters>(emptyFilters());
const appliedFilters = ref<QueryFilters>(emptyFilters());
const dialogVisible = ref(false);
const activeIndex = ref<number | null>(null);
const decision = ref<"risk" | "notRisk">("risk");

onMounted(() => {
  document.body.classList.add("confirmation-admin-page");
});

onUnmounted(() => {
  document.body.classList.remove("confirmation-admin-page");
});

const rowsWithIndex = computed(() => store.constructionConfirmRows.map((row, sourceIndex) => ({ row, sourceIndex })));
const filteredRows = computed(() =>
  rowsWithIndex.value
    .filter(({ row }) => appliedFilters.value.level === "全部等级" || row.level === appliedFilters.value.level)
    .filter(({ row }) => !appliedFilters.value.date || row.time.slice(0, 10) === appliedFilters.value.date)
    .filter(({ row }) => !appliedFilters.value.location || (row.station || "").includes(appliedFilters.value.location) || (row.distance || "").includes(appliedFilters.value.location))
    .filter(({ row }) => !appliedFilters.value.device || deviceName(row, "construction").includes(appliedFilters.value.device))
    .filter(({ row }) => appliedFilters.value.status === "全部状态" || (row.processStatus || "待确认") === appliedFilters.value.status)
    .sort(compareConfirmRows),
);
const activeItem = computed(() => (activeIndex.value === null ? null : store.constructionConfirmRows[activeIndex.value] || null));
const historyRows = computed(() => {
  if (!activeItem.value) return [];
  const activeDevice = deviceName(activeItem.value, "construction");
  const activeStation = activeItem.value.station;
  return store.constructionConfirmRows
    .filter((row, index) => index !== activeIndex.value)
    .filter((row) => deviceName(row, "construction") === activeDevice || row.station === activeStation)
    .sort((left, right) => new Date(right.time).getTime() - new Date(left.time).getTime())
    .slice(0, 5);
});
const historyStats = computed(() => {
  const rows = historyRows.value;
  return {
    low: rows.filter((row) => row.level === "低风险").length,
    medium: rows.filter((row) => row.level === "中风险").length,
    high: rows.filter((row) => row.level === "高风险").length,
  };
});
const stats = computed(() => {
  const rows = store.constructionConfirmRows;
  const pending = countByStatus(rows, "待确认");
  const confirmedNoRisk = rows.filter((row) => row.processStatus === "人工已确认" && !row.governanceCenter).length;
  const processing = countByStatus(rows, "处置中");
  const completed = countByStatus(rows, "已完成");
  return [
    { label: "待确认", value: pending, note: "需人工复核", tone: "pending" },
    { label: "已确认", value: confirmedNoRisk, note: "人工已确认无风险", tone: "danger" },
    { label: "处置中", value: processing, note: "正在处置的风险预警", tone: "success" },
    { label: "已完成", value: completed, note: "处置完结的风险预警", tone: "muted" },
  ];
});

function countByStatus(rows: AlertRow[], status: ConstructionProcessStatus) {
  return rows.filter((row) => (row.processStatus || "待确认") === status).length;
}

function compareConfirmRows(left: { row: AlertRow }, right: { row: AlertRow }) {
  const leftPending = (left.row.processStatus || "待确认") === "待确认";
  const rightPending = (right.row.processStatus || "待确认") === "待确认";
  if (leftPending !== rightPending) return leftPending ? -1 : 1;
  return new Date(right.row.time).getTime() - new Date(left.row.time).getTime();
}

function levelClass(level: RiskLevel) {
  return {
    正常: "normal",
    低风险: "low",
    中风险: "medium",
    高风险: "high",
  }[level];
}

function statusClass(status?: ConstructionProcessStatus) {
  return {
    待确认: "pending",
    人工已确认: "confirmed",
    处置中: "processing",
    已完成: "done",
  }[status || "待确认"];
}

function applyFilters() {
  appliedFilters.value = { ...draftFilters.value };
}

function resetFilters() {
  const nextFilters = emptyFilters();
  draftFilters.value = nextFilters;
  appliedFilters.value = { ...nextFilters };
}

function openConfirm(index: number) {
  const row = store.constructionConfirmRows[index];
  if (row && isConfirmedRisk(row)) return;
  activeIndex.value = index;
  decision.value = store.constructionConfirmRows[index]?.governanceCenter ? "risk" : "notRisk";
  dialogVisible.value = true;
}

function submitConfirm() {
  if (activeIndex.value === null) return;
  const result = store.confirmConstructionAlert(activeIndex.value, decision.value === "risk");
  if (!result) return;
  dialogVisible.value = false;
  ElMessage.success(decision.value === "risk" ? "已确认风险并下发三级治理" : "已归档为非风险");
}

function isConfirmedRisk(row: AlertRow) {
  return Boolean(row.governanceCenter) || row.processStatus === "处置中" || row.processStatus === "已完成";
}
</script>
