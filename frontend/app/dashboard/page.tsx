"use client"

import * as React from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { MetricCard } from "@/components/ui/metric-card"
import { ChartCard } from "@/components/ui/chart-card"
import { Car, User, Wrench, DollarSign, Clock, ChevronRight, Calendar, Settings2, MoreVertical } from "lucide-react"
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select } from "@/components/ui/select"

import { useDashboardMetrics } from "@/hooks/useDashboardMetrics"
import { cn } from "@/utils/utils"

// --- Mocks removed for production ---
const COLORS = ["#0052FF", "#10B981", "#F59E0B", "#8B5CF6", "#64748B"]

export default function DashboardPage() {
  const { isLoading, user, metrics, recentActivities, vehicles, drivers, startDate, setStartDate, endDate, setEndDate } = useDashboardMetrics()
  const [currentPage, setCurrentPage] = React.useState(1);
  const [chartFilter, setChartFilter] = React.useState("all");
  const itemsPerPage = 5;

  const generateAlerts = () => {
    const alerts = [];
    const today = new Date();
    
    if (drivers && drivers.length > 0) {
      let expiredCount = 0;
      let expiringCount = 0;
      
      drivers.forEach((d: any) => {
        if (!d.cnhExpiryDate) return;
        const expiry = new Date(d.cnhExpiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
          expiredCount++;
        } else if (diffDays <= 30) {
          expiringCount++;
        }
      });
      
      if (expiredCount > 0) {
        alerts.push({ title: "CNH Vencida", desc: `${expiredCount} motorista(s) com CNH vencida`, color: "bg-red-500", dot: "!" });
      }
      if (expiringCount > 0) {
        alerts.push({ title: "CNH Vencendo", desc: `${expiringCount} motorista(s) com CNH vencendo em 30 dias`, color: "bg-orange-500", dot: "!" });
      }
    }

    if (vehicles && vehicles.length > 0) {
      let maintenanceCount = 0;
      let inactiveCount = 0;
      
      vehicles.forEach((v: any) => {
        if (v.status === 'maintenance') maintenanceCount++;
        if (v.status === 'inactive') inactiveCount++;
      });
      
      if (maintenanceCount > 0) {
        alerts.push({ title: "Veículos em Manutenção", desc: `${maintenanceCount} veículo(s) em manutenção`, color: "bg-orange-500", dot: "!" });
      }
      if (inactiveCount > 0) {
        alerts.push({ title: "Veículos Inativos", desc: `${inactiveCount} veículo(s) inativo(s)`, color: "bg-red-500", dot: "!" });
      }
    }
    
    if (alerts.length === 0) {
      alerts.push({ title: "Tudo certo!", desc: "Nenhum alerta crítico no momento.", color: "bg-green-500", dot: "✓" });
    }

    return alerts.slice(0, 5);
  }

  const dynamicAlerts = generateAlerts();

  const displayActivities = recentActivities && recentActivities.length > 0 ? recentActivities.map((act: any) => ({
    id: act.id,
    date: new Date(act.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
    vehicle: act.plate || "-",
    model: "-",
    driver: "-",
    type: act.type === 'abastecimento' ? 'Abastecimento' : 'Manutenção',
    place: act.location || "-",
    city: "-",
    value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(act.cost || 0),
    status: 'Concluído'
  })) : [];
  
  const totalItems = displayActivities.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedActivities = displayActivities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 pb-4">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center text-xs font-semibold text-muted-foreground">
            <span className="text-foreground">Dashboard</span>
            <ChevronRight className="h-3 w-3 mx-1.5" />
            <span>Frota</span>
            <ChevronRight className="h-3 w-3 mx-1.5" />
            <span>Visão Geral</span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto items-center">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto h-8 text-xs shrink-0">
              + Novo Lançamento
            </Button>
            <div className="flex items-center gap-1 bg-white border rounded-md px-2 h-8">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <input 
                type="date" 
                value={startDate ? startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const newDate = val ? new Date(val + 'T00:00:00') : undefined;
                  setStartDate(newDate);
                }}
                className="text-xs border-none outline-none bg-transparent w-[110px]"
              />
              <span className="text-muted-foreground text-xs">-</span>
              <input 
                type="date" 
                value={endDate ? endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const newDate = val ? new Date(val + 'T23:59:59') : undefined;
                  setEndDate(newDate);
                }}
                className="text-xs border-none outline-none bg-transparent w-[110px]"
              />
            </div>
          </div>
        </div>

        {/* Row 1: KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            title="Veículos Ativos"
            value={metrics?.activeVehicles?.toString() || "0"}
            trend={0}
            trendLabel="vs mês anterior"
            icon={<Car className="h-5 w-5" />}
            iconBgColor="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-600 dark:text-blue-400"
            sparklineData={[]}
            sparklineColor="#0052FF"
          />
          <MetricCard
            title="Motoristas Ativos"
            value={metrics?.activeDrivers?.toString() || "0"}
            trend={0}
            trendLabel="vs mês anterior"
            icon={<User className="h-5 w-5" />}
            iconBgColor="bg-purple-100 dark:bg-purple-900/30"
            iconColor="text-purple-600 dark:text-purple-400"
            sparklineData={[]}
            sparklineColor="#8B5CF6"
          />
          <MetricCard
            title="Manutenções Hoje"
            value={metrics?.maintenancesToday?.toString() || "0"}
            trend={0}
            trendLabel="vs mês anterior"
            icon={<Wrench className="h-5 w-5" />}
            iconBgColor="bg-orange-100 dark:bg-orange-900/30"
            iconColor="text-orange-600 dark:text-orange-400"
            sparklineData={[]}
            sparklineColor="#F59E0B"
          />
          <MetricCard
            title="Gastos Totais"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics?.totalCosts || 0)}
            trend={0}
            trendLabel="vs mês anterior"
            icon={<DollarSign className="h-5 w-5" />}
            iconBgColor="bg-green-100 dark:bg-green-900/30"
            iconColor="text-green-600 dark:text-green-400"
            sparklineData={[]}
            sparklineColor="#10B981"
          />
          <MetricCard
            title="Disponibilidade da Frota"
            value="100%"
            trend={0}
            trendLabel="vs mês anterior"
            icon={<Clock className="h-5 w-5" />}
            iconBgColor="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-600 dark:text-blue-400"
            sparklineData={[]}
            sparklineColor="#0052FF"
          />
        </div>

        {/* Main Content (Charts, Table, Feeds) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Left Column (Charts & Table) */}
          <div className="lg:col-span-2 flex flex-col gap-4 h-full">
            
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Chart 1 */}
              <ChartCard 
                title="Gastos nos Últimos 12 Meses" 
                action={
                  <Select 
                    value={chartFilter}
                    onChange={(e) => setChartFilter(e.target.value)}
                    className="h-7 text-[11px] px-2 w-[140px] border-muted-foreground/20 bg-transparent shadow-sm"
                  >
                    <option value="all">Todos os tipos</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Abastecimento">Abastecimento</option>
                  </Select>
                }
              >
                <div className="h-[180px] w-full mt-1">
                  {metrics?.costs?.history?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={metrics.costs.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0052FF" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#0052FF" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(value) => `R$${value}`} />
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Total']}
                        />
                        <Area type="monotone" dataKey={chartFilter === 'all' ? 'total' : (chartFilter === 'Manutenção' ? 'manutencao' : 'abastecimento')} stroke="#0052FF" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">Sem dados suficientes</span>
                    </div>
                  )}
                </div>
              </ChartCard>

              {/* Chart 2 */}
              <ChartCard 
                title="Gastos por Categoria (Mês)" 
              >
                <div className="h-[180px] w-full mt-1">
                  {metrics?.costs?.byCategory?.length > 0 ? (
                    <div className="flex items-center h-full w-full">
                      <div className="relative w-1/2 h-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={metrics.costs.byCategory}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={70}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {metrics.costs.byCategory.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip 
                              formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-[10px] text-muted-foreground font-medium">Total</span>
                          <span className="text-[11px] font-bold">R$ {metrics.costs.byCategory.reduce((acc: number, curr: any) => acc + curr.value, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                      <div className="w-1/2 flex flex-col justify-center gap-2 pl-2 overflow-y-auto">
                        {metrics.costs.byCategory.map((cat: any, idx: number) => {
                          const total = metrics.costs.byCategory.reduce((acc: number, curr: any) => acc + curr.value, 0);
                          const percentage = total > 0 ? ((cat.value / total) * 100).toFixed(1) : "0.0";
                          return (
                            <div key={idx} className="flex flex-col">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                <span className="text-[11px] font-medium leading-none text-foreground">{cat.name}</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground pl-3.5 mt-0.5 leading-none">R$ {cat.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({percentage}%)</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">Sem lançamentos no período</span>
                    </div>
                  )}
                </div>
              </ChartCard>
            </div>

            {/* Latest Entries Table */}
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col flex-1 justify-between">
              <div>
                <div className="p-3 border-b flex justify-between items-center">
                  <h3 className="font-semibold text-sm">Últimos Lançamentos</h3>
                  <Button variant="link" size="sm" className="text-blue-600 font-semibold px-0 h-6 text-xs">Ver todos</Button>
                </div>
                <div className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-transparent hover:bg-transparent border-b">
                      <TableHead className="w-[30px] px-3 py-1"><Checkbox className="rounded-[4px] opacity-70" /></TableHead>
                      <TableHead className="text-[9px] py-1 font-semibold text-muted-foreground uppercase tracking-wider">Data</TableHead>
                      <TableHead className="text-[9px] py-1 font-semibold text-muted-foreground uppercase tracking-wider">Veículo</TableHead>
                      <TableHead className="text-[9px] py-1 font-semibold text-muted-foreground uppercase tracking-wider">Motorista</TableHead>
                      <TableHead className="text-[9px] py-1 font-semibold text-muted-foreground uppercase tracking-wider">Tipo</TableHead>
                      <TableHead className="text-[9px] py-1 font-semibold text-muted-foreground uppercase tracking-wider">Local</TableHead>
                      <TableHead className="text-[9px] py-1 font-semibold text-muted-foreground uppercase tracking-wider text-right">Valor</TableHead>
                      <TableHead className="text-[9px] py-1 font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                      <TableHead className="w-[30px] py-1"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedActivities.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-6 text-sm text-muted-foreground">
                          Nenhum lançamento recente
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedActivities.map((entry: any) => (
                        <TableRow key={entry.id} className="border-b/50 h-8">
                          <TableCell className="px-3 py-1"><Checkbox className="rounded-[4px] border-muted-foreground/30" /></TableCell>
                          <TableCell className="text-[10px] font-medium text-muted-foreground py-1 whitespace-nowrap">{entry.date}</TableCell>
                          <TableCell className="py-1">
                            <div className="flex flex-col whitespace-nowrap">
                              <span className="font-semibold text-[10px]">{entry.vehicle}</span>
                              {entry.model && entry.model !== "-" && <span className="text-[8px] text-muted-foreground">{entry.model}</span>}
                            </div>
                          </TableCell>
                          <TableCell className="text-[10px] py-1">{entry.driver}</TableCell>
                          <TableCell className="py-1">
                            <Badge variant="outline" className={cn(
                              "border-0 rounded-full font-semibold text-[8px] px-1.5 py-0 h-3.5 whitespace-nowrap",
                              entry.type === 'Abastecimento' && "text-green-700 bg-green-100",
                              entry.type === 'Manutenção' && "text-blue-700 bg-blue-100",
                              entry.type === 'Preventiva' && "text-orange-700 bg-orange-100",
                              entry.type === 'Pneu' && "text-purple-700 bg-purple-100"
                            )}>
                              {entry.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-1">
                            <div className="flex flex-col whitespace-nowrap">
                              <span className="text-[10px]">{entry.place}</span>
                              {entry.city && entry.city !== "-" && <span className="text-[8px] text-muted-foreground">{entry.city}</span>}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-[10px] py-1 font-semibold whitespace-nowrap">{entry.value}</TableCell>
                          <TableCell className="py-1">
                            <Badge variant="outline" className={cn(
                              "border-0 rounded-full text-[8px] px-1.5 py-0 h-3.5 font-medium whitespace-nowrap",
                              entry.status === 'Pago' ? "text-green-700 bg-green-100" : "text-orange-700 bg-orange-100"
                            )}>
                              {entry.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              </div>
              
              {/* Pagination footer */}
              <div className="p-3 border-t flex items-center justify-between bg-muted/20 mt-auto">
                <span className="text-[11px] text-muted-foreground">
                  Mostrando {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} registros
                </span>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground rounded-md"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronRight className="h-3 w-3 rotate-180" />
                  </Button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <Button 
                      key={i} 
                      variant={currentPage === i + 1 ? "default" : "ghost"} 
                      size="icon" 
                      className={cn("h-6 w-6 rounded-md text-xs", currentPage === i + 1 && "bg-blue-600 text-white")}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground rounded-md"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Operational Feeds - Maintenances & Alerts) */}
          <div className="lg:col-span-1 flex flex-col gap-4 h-full">
            
            {/* Alertas Importantes */}
            <div className="bg-card border rounded-xl shadow-sm p-3 flex flex-col flex-1 justify-between">
              <div>
                <div className="flex justify-between items-start mb-2 min-h-7">
                  <h3 className="font-semibold text-sm leading-none">Alertas Importantes</h3>
                </div>
                <div className="space-y-2.5">
                {dynamicAlerts.map((alert, i) => (
                  <div key={i} className="flex flex-col">
                    <div className="flex items-center gap-2 cursor-pointer group pb-2">
                      <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-bold", alert.color)}>
                        {alert.dot}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[13px] truncate">{alert.title}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 pr-1">{alert.desc}</p>
                      </div>
                      <ChevronRight className="h-3 w-3 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    {i !== dynamicAlerts.length - 1 && <div className="h-px bg-border/50 ml-7 mb-2.5" />}
                  </div>
                ))}
              </div>
              </div>
              <div className="mt-2 text-center pt-2">
                <Button variant="link" className="text-blue-600 font-semibold text-[11px] h-5">Ver todos os alertas</Button>
              </div>
            </div>

            {/* Próximas Manutenções */}
            <div className="bg-card border rounded-xl shadow-sm p-3 flex flex-col justify-between shrink-0">
              <div>
                <div className="flex justify-between items-start mb-2 min-h-7">
                  <h3 className="font-semibold text-sm leading-none">Próximas Manutenções</h3>
                  <Button variant="link" size="sm" className="text-blue-600 font-semibold px-0 h-5 text-[11px]">Ver todas</Button>
                </div>
                <div className="space-y-2">
                {/* Sem Manutenções Agendadas */}
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Nenhuma manutenção agendada
                </div>
              </div>
              </div>
              <div className="mt-2 text-center pt-2">
                <Button variant="link" className="text-blue-600 font-semibold text-[11px] h-5">Ver todas manutenções</Button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
