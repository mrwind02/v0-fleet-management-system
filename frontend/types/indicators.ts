export type IndicatorPeriod = "30_days" | "current_month" | "quarter" | "year" | "custom"

export interface GlobalFilterState {
  period: IndicatorPeriod
  unit: string
  costCenter: string
  vehicle: string
  category: string
  operationType: string
}

export interface ScoreCompositionItem {
  indicator: string
  weight: number
  score: number
  targetText: string
  status: "success" | "warning" | "destructive"
}

export interface FleetScoreData {
  score: number
  maxScore: number
  classification: "Excelente" | "Bom" | "Atenção" | "Crítico" | "Aguardando Dados"
  trendDelta: number
  comparedTo: string
  composition: ScoreCompositionItem[]
}

export interface ExecutiveKpiItem {
  id: string
  title: string
  value: string | number
  unit?: string
  target?: string | number
  targetLabel?: string
  trendDelta: number
  isPositive: boolean
  sparklineData: number[]
  tooltipText: string
  iconName?: string
}

export interface CostEvolutionItem {
  month: string
  fuel: number
  maintenance: number
  expenses: number
  fines: number
  total: number
}

export interface FleetAvailabilityItem {
  month: string
  available: number
  maintenance: number
  stopped: number
}

export interface CostByCategoryItem {
  name: string
  value: number
  color: string
  percentage: number
}

export interface PerformanceCardItem {
  title: string
  badgeLabel: string
  mainValue: string
  subValue: string
  subtitle: string
  iconName: string
}

export interface UnitCostComparison {
  unit: string
  costPerKm: number
  totalCost: number
}

export interface MaintenanceComparison {
  month: string
  preventive: number
  corrective: number
}

export interface ConsumptionRankingItem {
  vehicle: string
  kmPerLiter: number
  target: number
}

export interface GoalItem {
  id: string
  title: string
  currentValue: number
  targetValue: number
  unit: string
  formattedCurrent: string
  formattedTarget: string
  progress: number
  deltaText: string
  isMet: boolean
}

export interface InsightItem {
  id: string
  title: string
  highlightValue: string
  description: string
  type: "success" | "info" | "warning"
}

export interface RankingEntry {
  rank: number
  name: string
  metricValue: string
  detail: string
  trend: "up" | "down" | "flat"
  trendText: string
}

export interface TemporalComparisonItem {
  metric: string
  beforeValue: string
  afterValue: string
  // Aliases para compatibilidade com código legado
  periodBefore?: string
  periodAfter?: string
  variationPercent: number
  isBetter: boolean
}
