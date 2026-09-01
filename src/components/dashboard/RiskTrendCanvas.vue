<template>
  <section class="panel trend-panel">
    <div class="panel-head">
      <div>
        <p class="eyebrow">Risk Trend</p>
        <h2>风险趋势图</h2>
      </div>
      <div class="trend-actions">
        <el-select v-model="store.riskTrendRange" aria-label="选择风险趋势时间范围" size="large" style="width: 132px">
          <el-option label="今日" value="today" />
          <el-option label="近7天" value="week" />
          <el-option label="近30天" value="month" />
        </el-select>
        <span class="chip">{{ rangeNames[store.riskTrendRange] }}</span>
      </div>
    </div>
    <canvas ref="canvasRef" width="1200" height="320" aria-label="五大风险趋势图"></canvas>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useDashboardStore } from "@/stores/dashboard";

const store = useDashboardStore();
const canvasRef = ref<HTMLCanvasElement | null>(null);
const rangeNames = { today: "今日", week: "近7天", month: "近30天" } as const;
const rangeFactor = { today: 1, week: 4.8, month: 15.6 } as const;

function draw() {
  const canvas = canvasRef.value;
  const context = canvas?.getContext("2d");
  if (!canvas || !context) return;
  const width = canvas.width;
  const height = canvas.height;
  const left = 78;
  const right = 38;
  const top = 60;
  const bottom = 74;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const trendItems = store.data.typeRatios.map((riskType) => ({
    ...riskType,
    value: Math.max(1, Math.round(riskType.count * rangeFactor[store.riskTrendRange])),
  }));
  const yMax = Math.ceil(Math.max(...trendItems.map((item) => item.value), 5) / 5) * 5;
  const slotWidth = chartWidth / trendItems.length;
  const barWidth = Math.min(76, slotWidth * 0.46);

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#07111f";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "rgba(148, 163, 184, .18)";
  context.lineWidth = 1;
  context.font = "15px Arial";
  context.textAlign = "right";
  context.fillStyle = "#94a3b8";
  for (let i = 0; i <= 5; i += 1) {
    const value = (yMax / 5) * i;
    const y = top + chartHeight - (value / yMax) * chartHeight;
    context.beginPath();
    context.moveTo(left, y);
    context.lineTo(width - right, y);
    context.stroke();
    context.fillText(String(Math.round(value)), left - 14, y + 5);
  }
  context.strokeStyle = "rgba(125, 211, 252, .32)";
  context.beginPath();
  context.moveTo(left, top);
  context.lineTo(left, top + chartHeight);
  context.lineTo(width - right, top + chartHeight);
  context.stroke();
  context.fillStyle = "#94a3b8";
  context.font = "20px Arial";
  context.textAlign = "left";
  context.fillText(`${rangeNames[store.riskTrendRange]}风险次数趋势`, left, 30);

  const points = trendItems.map((item, index) => {
    const x = left + slotWidth * index + slotWidth / 2;
    const y = top + chartHeight - (item.value / yMax) * chartHeight;
    return { ...item, x, y };
  });
  points.forEach((item) => {
    const barHeight = top + chartHeight - item.y;
    const gradient = context.createLinearGradient(0, item.y, 0, top + chartHeight);
    gradient.addColorStop(0, item.color);
    gradient.addColorStop(1, `${item.color}33`);
    context.fillStyle = gradient;
    context.shadowColor = item.color;
    context.shadowBlur = 14;
    context.fillRect(item.x - barWidth / 2, item.y, barWidth, barHeight);
    context.shadowBlur = 0;
    context.fillStyle = "#f8fafc";
    context.font = "700 22px Arial";
    context.textAlign = "center";
    context.fillText(String(item.value), item.x, item.y - 10);
    context.fillStyle = "#cbd5e1";
    context.font = "700 17px Arial";
    context.fillText(item.name, item.x, height - 42);
  });
  context.beginPath();
  points.forEach((point, index) => (index === 0 ? context.moveTo(point.x, point.y) : context.lineTo(point.x, point.y)));
  context.strokeStyle = "rgba(226, 232, 240, .86)";
  context.lineWidth = 2;
  context.shadowColor = "rgba(34, 211, 238, .55)";
  context.shadowBlur = 10;
  context.stroke();
  context.shadowBlur = 0;
  points.forEach((point) => {
    context.beginPath();
    context.arc(point.x, point.y, 5, 0, Math.PI * 2);
    context.fillStyle = "#07111f";
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = point.color;
    context.stroke();
  });
  context.textAlign = "left";
  context.fillStyle = "#93a4b8";
  context.font = "15px Arial";
  context.fillText("横坐标：五大风险  /  纵坐标：告警次数", left, height - 12);
}

onMounted(draw);
watch(() => store.riskTrendRange, draw);
</script>
