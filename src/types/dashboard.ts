export type RiskId = "construction" | "strain" | "cathodic" | "leak" | "pressure";
export type RiskLevel = "正常" | "低风险" | "中风险" | "高风险";
export type ConstructionProcessStatus = "待确认" | "人工已确认" | "处置中" | "已完成";
export type AlertFrequency = { low: number; medium: number; high: number; critical?: number };

export interface MetricItem {
  label: string;
  value: string;
  state: string;
}

export interface RiskType {
  id: RiskId;
  name: string;
  shortName: string;
  icon: string;
  score: number;
  activeAlerts: number;
  location: string;
  formula: string;
  factors: Array<{ name: string; value: number; weight: number }>;
  metrics: MetricItem[];
  analysis: { cause: string; impact: string; advice: string };
  trend: number[];
}

export interface AlertRow {
  title?: string;
  time: string;
  station?: string;
  region?: string;
  camera?: string;
  deviceName?: string;
  distance?: string;
  level: RiskLevel;
  beforeAfter?: string;
  frequency: AlertFrequency;
  cause: string;
  impact: string;
  advice: string;
  metrics?: MetricItem[];
  thumbnail?: string;
  videoUrl?: string;
  processStatus?: ConstructionProcessStatus;
  businessSystem?: string;
  confirmResult?: string;
  confirmRemark?: string;
  eventCode?: string;
  governanceCenter?: string;
  disposalResult?: string;
  analysisResult?: string;
  code?: string;
  type?: string;
  area?: string;
  pressure?: string;
  sustainedHours?: number;
  gas?: string;
  strain?: string;
  offPotential?: string;
  onPotential?: string;
  dcCurrent?: string;
  dcDensity?: string;
  acCurrent?: string;
  acDensity?: string;
  acVoltage?: string;
  naturalPotential?: string;
  anodeOpenPotential?: string;
  anodeCurrent?: string;
  signal?: string;
  battery?: string;
}

export interface EnterpriseItem {
  company: string;
  shortName: string;
  todayGas: number;
  weekGas: number;
  monthGas: number;
  todayPayment: number;
  weekPayment: number;
  monthPayment: number;
  baseline30d: number;
  weekAverage: number;
  declineRate: number;
  abnormalDays: number;
  zeroGasDays: number;
  receivable: number;
  received: number;
  collectionRate: number;
  volatility7d: number;
  volatility30d: number;
  warningType: string;
  level: "蓝色" | "黄色" | "橙色" | "红色";
}

export interface ElderlyItem {
  name: string;
  age: number;
  address: string;
  riskName: string;
  level: "黄色" | "橙色" | "红色";
  reason: string;
  analysis: string;
  currentGas: number;
  baselineGas: number;
  abnormalDays: number;
}

export interface StationRiskRatio {
  station: string;
  total: number;
  segments: Array<{ name: string; value: number; color: string }>;
}

export interface DashboardData {
  updatedAt: string;
  stats: Array<{ label: string; value: string; unit: string; trend: string; tone: string }>;
  riskLevels: Array<{ level: Exclude<RiskLevel, "正常">; count: number; color: string }>;
  typeRatios: Array<{ name: string; count: number; color: string }>;
  enterpriseMonitoring: EnterpriseItem[];
  elderlyMonitoring: ElderlyItem[];
  stationRiskRatios: StationRiskRatio[];
  risks: RiskType[];
  controlAreas: Array<{ riskId: RiskId; name: string; area: string; focus: string }>;
  pressureTypes: Array<{ name: string; count: number; active?: boolean }>;
  constructionVideos: AlertRow[];
  strainRows: AlertRow[];
  cathodicRows: AlertRow[];
  pressureRiskRows: AlertRow[];
  leakRows: AlertRow[];
  events: Array<{ riskId: RiskId; level: string; title: string; time: string; owner: string; status: string }>;
  assistantPrompts: string[];
  agents: Array<{ name: string; tag: string; initials: string }>;
  flow: string[];
}
