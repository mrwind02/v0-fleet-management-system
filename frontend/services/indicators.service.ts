import {
  GlobalFilterState,
  FleetScoreData,
  ExecutiveKpiItem,
  CostEvolutionItem,
  FleetAvailabilityItem,
  CostByCategoryItem,
  PerformanceCardItem,
  UnitCostComparison,
  MaintenanceComparison,
  ConsumptionRankingItem,
  GoalItem,
  InsightItem,
  RankingEntry,
  TemporalComparisonItem
} from "@/types/indicators"

export class IndicatorsService {
  static getFleetScore(filter?: GlobalFilterState): FleetScoreData {
    return {
      score: 0,
      maxScore: 100,
      classification: "Aguardando Dados",
      trendDelta: 0,
      comparedTo: "mês anterior",
      composition: []
    }
  }

  static getExecutiveKpis(filter?: GlobalFilterState): ExecutiveKpiItem[] {
    return []
  }

  static getCostEvolution(): CostEvolutionItem[] {
    return []
  }

  static getFleetAvailability(): FleetAvailabilityItem[] {
    return []
  }

  static getCostByCategory(): CostByCategoryItem[] {
    return []
  }

  static getPerformanceCards(): PerformanceCardItem[] {
    return []
  }

  static getUnitCostComparison(): UnitCostComparison[] {
    return []
  }

  static getMaintenanceComparison(): MaintenanceComparison[] {
    return []
  }

  static getConsumptionRanking(): ConsumptionRankingItem[] {
    return []
  }

  static getGoals(): GoalItem[] {
    return []
  }

  static getInsights(): InsightItem[] {
    return []
  }

  static getRankings(): Record<string, RankingEntry[]> {
    return {
      vehicles: [],
      drivers: [],
      units: [],
      suppliers: []
    }
  }

  static getTemporalComparison(period: string): TemporalComparisonItem[] {
    return []
  }
}
