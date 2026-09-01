import type { AlertRow, EnterpriseItem, ElderlyItem, RiskId, RiskLevel, StationRiskRatio } from "@/types/dashboard";
import { dashboardData } from "@/mock/dashboard";

export const HIGH_RISK_SHARE_THRESHOLD = 26;

export function formatAmount(value: number) {
  return Math.round(value).toLocaleString("zh-CN");
}

export function getLevel(score: number) {
  if (score >= 50) return { name: "高", className: "high" };
  if (score >= 30) return { name: "中", className: "medium" };
  return { name: "低", className: "low" };
}

export function enterpriseLevelMeta(level: EnterpriseItem["level"]) {
  const meta = {
    蓝色: { label: "蓝色", color: "#38bdf8", className: "blue" },
    黄色: { label: "黄色", color: "#facc15", className: "yellow" },
    橙色: { label: "橙色", color: "#fb923c", className: "orange" },
    红色: { label: "红色", color: "#fb5a70", className: "red" },
  };
  return meta[level] || meta["蓝色"];
}

export function elderlyLevelMeta(level: ElderlyItem["level"]) {
  const meta = {
    红色: { color: "#fb5a70", className: "red" },
    橙色: { color: "#fb923c", className: "orange" },
    黄色: { color: "#facc15", className: "yellow" },
  };
  return meta[level] || meta["黄色"];
}

export function enterpriseRiskName(item: EnterpriseItem) {
  if (item.warningType === "疑似停产预警") return "疑似停产";
  if (item.warningType === "用气下降 + 回款下降复合预警") return "疑似减产";
  if (item.warningType === "回款异常预警") return "回款异常";
  if (item.warningType === "经营波动异常预警") return "经营波动";
  return "正常监测";
}

export function enterpriseReport(item: EnterpriseItem) {
  if (item.warningType === "疑似停产预警") {
    return `【疑似停产预警】${item.company}已连续${item.zeroGasDays}天燃气用量为0或接近0，明显低于历史正常用气水平。系统判断存在停产、停业、表计异常或数据缺失可能，建议优先核查。`;
  }
  if (item.warningType === "回款异常预警") {
    return `【回款异常预警】${item.company}本期应收金额${formatAmount(item.receivable)}元，实收金额${formatAmount(item.received)}元，回款率为${item.collectionRate}%，低于预警阈值。建议关注企业缴费和经营压力情况。`;
  }
  if (item.warningType === "用气下降 + 回款下降复合预警") {
    return `【疑似减产预警】${item.company}近7日平均燃气用量为${formatAmount(item.weekAverage)}，较近30日基线下降${item.declineRate}%，已连续${item.abnormalDays}天低于正常水平。同期回款率为${item.collectionRate}%，系统判断该企业存在减产或经营波动可能，建议进一步核实生产经营状态。`;
  }
  if (item.warningType === "经营波动异常预警") {
    return `【疑似减产预警】${item.company}近7日平均燃气用量为${formatAmount(item.weekAverage)}，较近30日基线下降${item.declineRate}%，近7日用气波动率高于近30日基线。系统判断该企业存在减产或经营波动可能，建议进一步核实生产经营状态。`;
  }
  return `【常态监测】${item.company}近7日平均燃气用量为${formatAmount(item.weekAverage)}，回款率为${item.collectionRate}%，当前用气与缴费状态处于正常监测范围。`;
}

export function elderlyReport(item: ElderlyItem) {
  return `${item.name}，${item.address}，${item.age}岁，${item.reason}。${item.analysis}`;
}

export function riskIdByName(name: string): RiskId {
  return (dashboardData.risks.find((risk) => risk.name === name)?.id || "construction") as RiskId;
}

export function riskTypeName(riskId: RiskId) {
  return dashboardData.risks.find((risk) => risk.id === riskId)?.name || "";
}

export function riskDescription(riskId: RiskId) {
  return {
    construction: "外部施工靠近管线红线形成的破坏风险",
    strain: "管道受力、沉降或形变异常风险",
    cathodic: "阴保电位异常导致腐蚀防护不足风险",
    leak: "阀井或管段气体浓度异常泄漏风险",
    pressure: "运行压力超限或波动异常风险",
  }[riskId];
}

export function riskSegmentForStation(station: StationRiskRatio, riskId: RiskId) {
  const name = riskTypeName(riskId);
  return station.segments.find((segment) => segment.name === name);
}

export function stationRiskCount(station: StationRiskRatio, riskId: RiskId) {
  const segment = riskSegmentForStation(station, riskId);
  return Math.max(0, Math.round((station.total * (segment?.value || 0)) / 100));
}

export function majorRiskStationsForRisk(riskId: RiskId) {
  const name = riskTypeName(riskId);
  return dashboardData.stationRiskRatios
    .map((station) => {
      const segment = station.segments.find((item) => item.name === name);
      if (!segment || segment.value < HIGH_RISK_SHARE_THRESHOLD) return null;
      return {
        name: station.station,
        count: Math.max(1, Math.round((station.total * segment.value) / 100)),
        percent: segment.value,
      };
    })
    .filter(Boolean) as Array<{ name: string; count: number; percent: number }>;
}

export function majorRiskTotalForRisk(riskId: RiskId) {
  return majorRiskStationsForRisk(riskId).reduce((sum, station) => sum + station.count, 0);
}

function stationRiskLevel(percent: number): RiskLevel {
  if (percent >= 26) return "高风险";
  if (percent >= 16) return "中风险";
  return "低风险";
}

function stationFrequencyByCount(count: number, level: RiskLevel) {
  const frequency = { low: 0, medium: 0, high: 0, critical: 0 };
  const key = { 低风险: "low", 中风险: "medium", 高风险: "high", 正常: "low" }[level] as "low" | "medium" | "high";
  frequency[key] = count;
  return frequency;
}

export function strainLevelByValue(value?: string): RiskLevel | "正常" {
  const strain = Number.parseFloat(value || "");
  if (Number.isNaN(strain)) return "正常";
  if (strain >= 500) return "高风险";
  if (strain >= 300) return "中风险";
  if (strain >= 120) return "低风险";
  return "正常";
}

export function gasLevelByValue(value?: string): RiskLevel | "正常" {
  const gas = Number.parseFloat(value || "");
  if (Number.isNaN(gas)) return "正常";
  if (gas >= 50) return "高风险";
  if (gas >= 20) return "中风险";
  if (gas >= 10) return "低风险";
  return "正常";
}

export function pressureLevelByKpa(value?: string): RiskLevel | "正常" {
  const pressure = Number.parseFloat(value || "");
  if (Number.isNaN(pressure)) return "正常";
  if (pressure >= 380) return "高风险";
  if (pressure >= 370) return "中风险";
  if (pressure >= 360 || pressure < 300) return "低风险";
  return "正常";
}

export function cathodicLevelByOffPotential(value?: string | number): RiskLevel | "正常" {
  const potential = Number(value);
  if (Number.isNaN(potential)) return "正常";
  if (potential > -0.75 || potential < -1.3) return "高风险";
  if (potential < -1.2) return "中风险";
  if (potential > -0.85) return "低风险";
  return "正常";
}

export function cathodicMetrics(row: AlertRow) {
  return [
    { label: "断电电位", value: `${row.offPotential} V`, state: row.level || cathodicLevelByOffPotential(row.offPotential) },
    { label: "直流电流密度", value: row.dcDensity || "-", state: "同步监测" },
    { label: "交流电压", value: `${row.acVoltage} V`, state: "同步监测" },
    { label: "阳极输出电流", value: `${row.anodeCurrent} mA`, state: "同步监测" },
  ];
}

export function realConstructionAlertRows(): AlertRow[] {
  const seeds: AlertRow[] = [
    {
      title: "周边施工低风险视频预警",
      time: "2026-05-30 17:42:16",
      station: "凉风垭储配站",
      region: "重庆/垫江/鼎发燃气",
      camera: "01#监控",
      deviceName: "垫江县桂西路01#监控",
      distance: "62m低风险区",
      level: "低风险",
      beforeAfter: "前后30s视频",
      frequency: { low: 1, medium: 0, high: 0, critical: 0 },
      cause: "视频识别到施工人员或设备处于低风险关注区，暂未进入管道红线或管控区。",
      impact: "当前对管道安全影响较低，但需持续关注后续是否出现机械靠近或开挖行为。",
      advice: "点击查看视频大图，保留视频证据并持续跟踪该点位施工动态。",
      processStatus: "人工已确认",
      businessSystem: "燃气管网安全业务系统",
      confirmResult: "人工复核为非风险，仅保留为施工关注记录。",
      analysisResult: "模型识别到人员短暂停留，未发现开挖、打桩或机械越界动作，建议继续以视频抽帧方式跟踪。",
      disposalResult: "未进入事件处置流程，业务系统已回传人工已确认状态。",
      metrics: [
        { label: "施工活动", value: "人员通行", state: "低风险关注" },
        { label: "距管道中心线", value: "62 m", state: "低风险区" },
        { label: "持续时间", value: "短时出现", state: "持续观察" },
      ],
      videoUrl: "/assets/videos/third-party-construction-low-risk.mp4",
    },
    {
      title: "周边施工低风险视频预警",
      time: "2026-05-30 17:39:08",
      station: "垫江工业园区配气站",
      region: "重庆/垫江/鼎发燃气",
      camera: "02#监控",
      deviceName: "垫江县工业园区迎宾路02#监控",
      distance: "58m低风险区",
      level: "低风险",
      beforeAfter: "前后30s视频",
      frequency: { low: 1, medium: 0, high: 0, critical: 0 },
      cause: "视频识别到施工活动处于低风险关注范围，暂未发现机械越界或开挖动作。",
      impact: "当前风险较低，但施工活动可能随时间向管控区靠近，需要保持视频跟踪。",
      advice: "点击查看视频大图，持续抽帧观察并在出现机械靠近时自动升级预警。",
      processStatus: "待确认",
      businessSystem: "燃气管网安全业务系统",
      confirmResult: "已下发业务系统，等待属地网格人工确认。",
      analysisResult: "施工车辆位于低风险关注区，距离管线仍有缓冲空间，暂未触发事件派发条件。",
      metrics: [
        { label: "施工活动", value: "场地整理", state: "低风险关注" },
        { label: "距管道中心线", value: "58 m", state: "低风险区" },
        { label: "持续时间", value: "短时出现", state: "持续观察" },
      ],
      videoUrl: "/assets/videos/third-party-construction-low-risk-2.mp4",
    },
    {
      title: "周边施工积水风险视频预警",
      time: "2026-06-09 10:52:00",
      station: "垫江县桂西路施工点",
      region: "重庆/垫江/鼎发燃气",
      camera: "03#监控",
      deviceName: "垫江县桂西路03#监控",
      distance: "积水覆盖施工低洼区",
      level: "中风险",
      beforeAfter: "前后30s视频",
      frequency: { low: 0, medium: 1, high: 0, critical: 0 },
      cause: "视频识别到第三方施工区域存在明显积水，低洼积水可能与近期降雨、排水不畅或施工围挡阻水有关，需核实是否靠近燃气管道、阀井或管沟。",
      impact: "积水可能导致管沟长期浸泡、防腐层受潮失效、阀井设备受潮锈蚀，并遮挡地面警示标识和施工边界，降低巡检可视性与应急处置效率。",
      advice: "立即通知属地巡检人员核查积水范围、深度及与管线位置关系，督促施工方排水并恢复警示隔离；若积水靠近阀井或管道红线，需联动抢维修人员复核防腐、阀井密封和周边沉降情况。",
      processStatus: "处置中",
      businessSystem: "燃气管网安全业务系统",
      confirmResult: "人工确认存在风险，已生成事件并下发治理中心。",
      eventCode: "DJ-SG-20260609-003",
      governanceCenter: "三级治理中心 · 桂阳街道",
      analysisResult: "积水覆盖施工低洼区，可能影响阀井和管沟可视化巡检，需现场核实积水深度与管线位置关系。",
      metrics: [
        { label: "环境状态", value: "施工区积水", state: "中风险关注" },
        { label: "影响对象", value: "管沟/阀井", state: "需现场复核" },
        { label: "处置要求", value: "排水+巡检", state: "及时闭环" },
      ],
      videoUrl: "/assets/videos/construction-waterlogging-risk.mp4",
    },
  ];

  const riskPlans = [
    { level: "高风险" as RiskLevel, status: "待确认" as const, distance: "7m管道红区", activity: "破路开挖靠近", camera: "04#监控", videoUrl: "/assets/videos/construction-waterlogging-risk.mp4" },
    { level: "高风险" as RiskLevel, status: "处置中" as const, distance: "8m管道红区", activity: "挖机进入红区", camera: "09#监控", videoUrl: "/assets/videos/construction-waterlogging-risk.mp4" },
    { level: "高风险" as RiskLevel, status: "已完成" as const, distance: "6m管道红区", activity: "打桩设备停留", camera: "10#监控", videoUrl: "/assets/videos/third-party-construction-low-risk.mp4" },
    { level: "高风险" as RiskLevel, status: "人工已确认" as const, distance: "11m管道红区", activity: "吊装设备停靠", camera: "11#监控", videoUrl: "/assets/videos/third-party-construction-low-risk-2.mp4" },
    { level: "中风险" as RiskLevel, status: "待确认" as const, distance: "32m管控关注区", activity: "围挡搭设", camera: "06#监控", videoUrl: "/assets/videos/construction-waterlogging-risk.mp4" },
    { level: "中风险" as RiskLevel, status: "处置中" as const, distance: "26m管控关注区", activity: "小型机械靠近", camera: "07#监控", videoUrl: "/assets/videos/third-party-construction-low-risk.mp4" },
    { level: "中风险" as RiskLevel, status: "已完成" as const, distance: "29m管控关注区", activity: "临时开挖复核", camera: "08#监控", videoUrl: "/assets/videos/third-party-construction-low-risk-2.mp4" },
    { level: "中风险" as RiskLevel, status: "人工已确认" as const, distance: "35m管控关注区", activity: "临时围挡撤除", camera: "12#监控", videoUrl: "/assets/videos/third-party-construction-low-risk-2.mp4" },
    { level: "低风险" as RiskLevel, status: "待确认" as const, distance: "64m低风险区", activity: "材料堆放", camera: "13#监控", videoUrl: "/assets/videos/third-party-construction-low-risk.mp4" },
    { level: "低风险" as RiskLevel, status: "处置中" as const, distance: "52m低风险区", activity: "车辆短暂停留", camera: "14#监控", videoUrl: "/assets/videos/construction-waterlogging-risk.mp4" },
    { level: "低风险" as RiskLevel, status: "已完成" as const, distance: "68m低风险区", activity: "清运车辆驶离", camera: "15#监控", videoUrl: "/assets/videos/third-party-construction-low-risk.mp4" },
    { level: "低风险" as RiskLevel, status: "人工已确认" as const, distance: "71m低风险区", activity: "人员巡场", camera: "05#监控", videoUrl: "/assets/videos/third-party-construction-low-risk-2.mp4" },
  ];

  const extraRows = Array.from({ length: 16 }, (_, index) => {
    const plan = riskPlans[index % riskPlans.length];
    const minute = String(34 - index).padStart(2, "0");
    const isRisk = plan.status === "处置中" || plan.status === "已完成";
    const isHigh = plan.level === "高风险";
    return {
      title: `${plan.activity}${plan.level}视频预警`,
      time: `2026-05-30 17:${minute}:16`,
      station: index % 2 ? "桂阳街道管网监控点" : "垫江工业园区配气站",
      region: "重庆/垫江/鼎发燃气",
      camera: plan.camera,
      deviceName: `垫江县施工监测${plan.camera}`,
      distance: plan.distance,
      level: plan.level,
      beforeAfter: "前后30s视频",
      frequency: {
        low: plan.level === "低风险" ? 1 + (index % 2) : 0,
        medium: plan.level === "中风险" ? 1 + (index % 2) : 0,
        high: plan.level === "高风险" ? 1 + (index % 2) : 0,
        critical: 0,
      },
      cause: `视频识别到${plan.activity}，位置处于${plan.distance}，需结合施工许可、管线红线和现场人员确认。`,
      impact: isHigh ? "施工活动已接近管道红区，若继续开挖或机械碾压，可能造成管道外防腐层损伤、管体受力异常或燃气泄漏风险。" : "当前尚未形成直接破坏，但施工活动可能向管控区移动，需要持续关注并保留证据。",
      advice: isRisk ? "维持视频跟踪并同步治理中心处置进展，必要时要求施工方停工、撤离机械并现场复核管线安全状态。" : "下发业务系统进行人工确认，确认非风险则归档，确认有风险则自动生成事件进入处置流程。",
      processStatus: plan.status,
      businessSystem: "燃气管网安全业务系统",
      confirmResult: isRisk ? "人工确认存在风险，已生成事件并下发治理中心。" : plan.status === "人工已确认" ? "人工复核为非风险，未进入事件处置流程。" : "已下发业务系统，等待人工确认。",
      eventCode: isRisk ? `DJ-SG-20260530-${String(index + 4).padStart(3, "0")}` : undefined,
      governanceCenter: isRisk ? "三级治理中心 · 属地街镇" : undefined,
      disposalResult: plan.status === "已完成" ? "治理中心反馈：施工方已撤离机械并恢复警示隔离，现场复核未发现管道受损，预警闭环完成。" : undefined,
      analysisResult: `${plan.activity}位于${plan.distance}，模型综合人员、机械、距离和持续时间判断为${plan.level}；当前业务状态为${plan.status}。`,
      metrics: [
        { label: "施工活动", value: plan.activity, state: plan.level },
        { label: "距管道中心线", value: plan.distance.replace("低风险区", "").replace("管控关注区", "").replace("管道红区", ""), state: plan.distance.includes("红区") ? "红区" : "关注区" },
        { label: "业务状态", value: plan.status, state: isRisk ? "事件流转" : "人工确认" },
      ],
      videoUrl: plan.videoUrl,
    } satisfies AlertRow;
  });

  return [...seeds, ...extraRows];
}

export function buildStationRows(station: StationRiskRatio, riskId: RiskId): AlertRow[] {
  const risk = dashboardData.risks.find((item) => item.id === riskId)!;
  const segment = riskSegmentForStation(station, riskId) || { value: 18 };
  const count = stationRiskCount(station, riskId);
  const level = stationRiskLevel(segment.value);
  const baseCode = station.station.replace(/[（）()]/g, "").slice(0, 2).toUpperCase();
  const common = {
    region: "重庆/垫江/鼎发燃气",
    level,
    frequency: stationFrequencyByCount(count, level),
    cause: `当前设备在${risk.name}维度占比为${segment.value}%，风险贡献高于日常均值，需结合实时监测数据复核。`,
    impact: `若${risk.name}持续升高，可能影响设备运行、周边管段安全裕度和后续处置资源调度。`,
    advice: `建议调度中心优先核查该设备的${risk.name}监测记录，联动属地巡检并对连续异常点位生成处置工单。`,
  };

  if (riskId === "cathodic") {
    const offPotentials = [-0.66, -0.73, -0.79, -0.83];
    return Array.from({ length: count }, (_, item) => {
      const offPotential = offPotentials[item % offPotentials.length];
      const derivedLevel = cathodicLevelByOffPotential(offPotential) as RiskLevel;
      const row: AlertRow = {
        ...common,
        level: derivedLevel,
        frequency: stationFrequencyByCount(count, derivedLevel),
        time: `2026-05-30 17:${42 - item}:16`,
        station: `${station.station} CP-${String(17 + item).padStart(3, "0")}`,
        offPotential: offPotential.toFixed(2),
        dcDensity: (10 + segment.value / 2 - item * 0.9).toFixed(1),
        acDensity: (2.1 + segment.value / 20 - item * 0.2).toFixed(1),
        acVoltage: (4.6 + segment.value / 10 - item * 0.3).toFixed(1),
        naturalPotential: (-0.76 - item * 0.03).toFixed(2),
        anodeOpenPotential: (1.12 + item * 0.02).toFixed(2),
        anodeCurrent: String(34 + item * 3),
        signal: `${92 - item * 3}%`,
        battery: (3.62 - item * 0.03).toFixed(2),
      };
      return { ...row, metrics: cathodicMetrics(row) };
    });
  }

  const fieldConfig: Record<string, { code: string; type: string; key: "strain" | "gas" | "pressure"; values: string[]; pressureValues?: string[] }> = {
    strain: { code: "SS", type: "管道应力应变监测终端", key: "strain", values: ["560", "482", "326", "168"] },
    leak: { code: "GAS", type: "物联网阀门井气体报警器", key: "gas", values: ["55%LEL", "32%LEL", "16%LEL", "8%LEL"], pressureValues: ["382kPa", "376kPa", "365kPa", "330kPa"] },
    pressure: { code: "PT", type: "智能远程压力监测终端", key: "pressure", values: ["385", "376", "365", "295"] },
  };
  const fieldByRisk = fieldConfig[riskId] || { code: "VI", type: "视频智能识别终端", key: "pressure" as const, values: ["365"] };

  return Array.from({ length: count }, (_, item) => {
    const value = fieldByRisk.values[item % fieldByRisk.values.length];
    const derivedLevel = riskId === "strain" ? strainLevelByValue(value) : riskId === "leak" ? gasLevelByValue(value) : riskId === "pressure" ? pressureLevelByKpa(value) : level;
    return {
      ...common,
      level: derivedLevel,
      frequency: stationFrequencyByCount(count, derivedLevel),
      time: `2026-05-30 17:${42 - item}:1${6 - item}`,
      station: station.station,
      code: `DF-${fieldByRisk.code}-${baseCode}${String(item + 1).padStart(3, "0")}`,
      type: fieldByRisk.type,
      pressure: riskId === "leak" ? fieldByRisk.pressureValues?.[item % fieldByRisk.pressureValues.length] : value,
      [fieldByRisk.key]: value,
    };
  });
}

export function deviceId(row: AlertRow, riskId: RiskId) {
  const prefix = { construction: "DF-VI", strain: "DF-SS", cathodic: "DF-CP", leak: "DF-GAS", pressure: "DF-PT" }[riskId];
  const source = row.code || row.station || row.title || "000";
  const seed = Array.from(source).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 1000;
  return row.code || `${prefix}-${String(seed).padStart(3, "0")}`;
}

export function deviceName(row: AlertRow, riskId: RiskId) {
  if (riskId === "construction") return row.deviceName || `垫江县桂东路${row.camera || "01#监控"}`;
  const names = { strain: "管道应力应变监测终端", cathodic: "阴极保护智能采集终端", leak: "物联网阀门井气体报警器", pressure: "智能远程压力监测终端" };
  return row.deviceName || row.type || names[riskId];
}

export function areaText(row: AlertRow) {
  return row.area || row.region || "重庆/垫江/鼎发燃气";
}

export function temperatureValue(row: AlertRow, index: number) {
  return (row as AlertRow & { temperature?: string }).temperature || `${(24.6 + (index % 5) * 0.8).toFixed(1)}℃`;
}

export function sampleFrequency(row: AlertRow, index: number) {
  return (row as AlertRow & { sampleFrequency?: string }).sampleFrequency || ["5Hz", "10Hz", "20Hz", "1Hz"][index % 4];
}

export function currentValue(base: number, step: number, index: number) {
  return (base + step * index).toFixed(1);
}

export function pressureClass(level: string) {
  return { 正常: "pressure-normal", 低风险: "pressure-low", 中风险: "pressure-medium", 高风险: "pressure-high" }[level] || "pressure-normal";
}

export function riskThresholdText(riskId: RiskId, alert: AlertRow) {
  if (riskId === "strain") return `当前应变值：${alert.strain} με；阈值：正常 < 120με，低风险 120με ≤ ε < 300με，中风险 300με ≤ ε < 500με，高风险 ε ≥ 500με；当前判定：${alert.level}`;
  if (riskId === "cathodic") return `当前断电电位：${alert.offPotential} V；阈值：正常 -1.20V ≤ U ≤ -0.85V，低风险 U > -0.85V，中风险 U < -1.20V，高风险 U > -0.75V 或 U < -1.30V；当前判定：${alert.level}；辅助指标：直流电流密度 ${alert.dcDensity}，交流电压 ${alert.acVoltage} V，阳极输出电流 ${alert.anodeCurrent} mA`;
  if (riskId === "leak") return `当前气体浓度：${alert.gas}；阈值：正常 < 10% LEL，低风险 10%-20% LEL，中风险 20%-50% LEL，高风险 ≥ 50% LEL；当前判定：${alert.level}；同步压力：${alert.pressure || "-"}`;
  if (riskId === "pressure") return `当前压力：${alert.pressure} kPa；阈值：正常 300-360kPa，低风险 360-370kPa 或 < 300kPa，中风险 370-380kPa，高风险 ≥ 380kPa；当前判定：${alert.level}`;
  return (alert.metrics || dashboardData.risks.find((risk) => risk.id === riskId)?.metrics || []).map((metric) => `${metric.label}：${metric.value}（${metric.state}）`).join("；");
}
