import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Download, TrendingUp, TrendingDown, Wallet, Percent } from 'lucide-react';
import { Card, Button } from '../common/UIComponents';
import { formatCurrency, calculateFinancialMetrics } from '../../utils/helpers';
import { generateFinancialReportPDF } from '../../utils/pdfGenerator';
import { useTheme } from '../../context/ThemeContext';
import { ReportTrendChart } from '../charts/ReportTrendChart';
import { SimpleBarChart } from '../charts/SimpleBarChart';
import { ChartShell } from '../charts/ChartShell';
import { ChartTooltip } from '../charts/ChartTooltip';
import { CHART_COLORS, getChartTheme } from '../charts/chartTheme';
import '../charts/accountantCharts.css';

/**
 * Financial Report Component
 * Shows comprehensive financial reports and analytics
 */
function ReportDonutChart({ data, title, description, emptyMessage = 'Aucune donnée' }) {
  const { isDark } = useTheme();
  const theme = getChartTheme(isDark);
  const filtered = data.filter((d) => d.value > 0);
  const total = filtered.reduce((s, d) => s + d.value, 0);

  if (!filtered.length) {
    return (
      <ChartShell title={title} description={description} height={320}>
        <div className="flex h-full items-center justify-center text-sm" style={{ color: theme.tooltipMuted }}>
          {emptyMessage}
        </div>
      </ChartShell>
    );
  }

  return (
    <ChartShell title={title} description={description} height={320}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filtered}
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={96}
            paddingAngle={3}
            dataKey="value"
            stroke={isDark ? '#0f172a' : '#ffffff'}
            strokeWidth={2}
            isAnimationActive
          >
            {filtered.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={
              <ChartTooltip
                formatter={(v) => [`${v} (${total ? Math.round((v / total) * 100) : 0}%)`, '']}
              />
            }
          />
          <Legend
            verticalAlign="bottom"
            height={40}
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span style={{ color: theme.tick, fontSize: 12 }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

function MetricTile({ label, value, tone = 'neutral', icon: Icon }) {
  const { isDark } = useTheme();
  const theme = getChartTheme(isDark);
  const tones = {
    green: isDark ? 'text-emerald-400' : 'text-emerald-600',
    red: isDark ? 'text-rose-400' : 'text-rose-600',
    blue: isDark ? 'text-sky-400' : 'text-sky-600',
    neutral: isDark ? 'text-white' : 'text-gray-900',
  };

  return (
    <div
      className="rounded-2xl border p-5 shadow-lg transition-all"
      style={{ background: theme.cardBg, borderColor: theme.cardBorder }}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{label}</p>
        {Icon && <Icon className={`h-5 w-5 ${tones[tone]}`} />}
      </div>
      <p className={`text-2xl font-bold tracking-tight md:text-3xl ${tones[tone]}`}>{value}</p>
    </div>
  );
}

const TREND_LINES = [
  { dataKey: 'revenue', color: CHART_COLORS.green, label: 'Revenu' },
  { dataKey: 'costs', color: CHART_COLORS.rose, label: 'Coûts' },
  { dataKey: 'profit', color: CHART_COLORS.blue, label: 'Bénéfice' },
];

export default function FinancialReport({ factures, reparations, clients }) {
  const { isDark } = useTheme();
  const theme = getChartTheme(isDark);

  // Calculate financial metrics
  const metrics = calculateFinancialMetrics(factures, reparations);

  // Filter data by month
  const getMonthlyData = () => {
    const data = {};

    // Get last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().split('T')[0].slice(0, 7);

      data[monthKey] = {
        month: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        revenue: 0,
        costs: 0,
        profit: 0
      };
    }

    // Fill in revenue
    factures
      .filter(f => f.statut === 'paid')
      .forEach(f => {
        const monthKey = f.date_validation?.slice(0, 7);
        if (data[monthKey]) {
          data[monthKey].revenue += f.prix_total;
        }
      });

    // Fill in costs
    reparations.forEach(r => {
      const monthKey = r.date_debut?.slice(0, 7);
      if (data[monthKey]) {
        data[monthKey].costs += r.cout;
      }
    });

    // Calculate profit
    Object.keys(data).forEach(key => {
      data[key].profit = data[key].revenue - data[key].costs;
    });

    return Object.values(data);
  };

  // Get invoice status distribution
  const getInvoiceStatusData = () => {
    const statuses = {
      paid: 0,
      pending: 0,
      cancelled: 0
    };

    factures.forEach(f => {
      if (statuses.hasOwnProperty(f.statut)) {
        statuses[f.statut]++;
      }
    });

    return [
      { name: 'Payée', value: statuses.paid, color: CHART_COLORS.green },
      { name: 'En attente', value: statuses.pending, color: CHART_COLORS.amber },
      { name: 'Annulée', value: statuses.cancelled, color: CHART_COLORS.rose },
    ];
  };

  // Get top clients by spending
  const getTopClients = () => {
    const clientSpending = {};

    factures
      .filter(f => f.statut === 'paid')
      .forEach(f => {
        if (!clientSpending[f.clientId]) {
          clientSpending[f.clientId] = 0;
        }
        clientSpending[f.clientId] += f.prix_total;
      });

    return Object.entries(clientSpending)
      .map(([clientId, amount]) => {
        const client = clients.find(c => c.id === parseInt(clientId));
        return {
          name: client ? `${client.prenom} ${client.nom}` : 'Inconnu',
          amount: amount
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  // Get repair status distribution
  const getRepairStatusData = () => {
    const statuses = {
      completed: 0,
      'in-progress': 0,
      pending: 0
    };

    reparations.forEach(r => {
      if (statuses.hasOwnProperty(r.statut)) {
        statuses[r.statut]++;
      }
    });

    return [
      { name: 'Terminées', value: statuses.completed, color: CHART_COLORS.green },
      { name: 'En cours', value: statuses['in-progress'], color: CHART_COLORS.blue },
      { name: 'En attente', value: statuses.pending, color: CHART_COLORS.amber },
    ];
  };

  const monthlyData = getMonthlyData();
  const invoiceStatusData = getInvoiceStatusData();
  const topClients = getTopClients();
  const repairStatusData = getRepairStatusData();

  const handleExportPDF = () => {
    try {
      generateFinancialReportPDF(
        metrics,
        getMonthlyData(),
        invoiceStatusData,
        topClients,
        factures,
        clients,
        reparations
      );
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <Card className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Rapports Financiers</h2>
        <Button onClick={handleExportPDF} variant="secondary">
          <Download className="w-4 h-4 mr-2" /> Exporter en PDF
        </Button>
      </Card>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricTile label="Revenu total" value={formatCurrency(metrics.totalRevenue)} tone="green" icon={TrendingUp} />
        <MetricTile label="Coûts totaux" value={formatCurrency(metrics.totalCosts)} tone="red" icon={TrendingDown} />
        <MetricTile
          label="Bénéfice net"
          value={formatCurrency(metrics.totalProfit)}
          tone={metrics.totalProfit >= 0 ? 'green' : 'red'}
          icon={Wallet}
        />
        <MetricTile label="Marge bénéficiaire" value={`${metrics.profitMargin}%`} tone="blue" icon={Percent} />
      </div>

      <ReportTrendChart
        data={monthlyData}
        title="Tendance mensuelle"
        description="Revenus, coûts et bénéfice sur les 12 derniers mois"
        lines={TREND_LINES}
        formatValue={formatCurrency}
        height={360}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReportDonutChart
          data={invoiceStatusData}
          title="Statut des factures"
          description="Répartition des factures par statut"
        />
        <ReportDonutChart
          data={repairStatusData}
          title="Statut des réparations"
          description="Avancement des interventions"
        />
      </div>

      <SimpleBarChart
        data={topClients}
        title="Top 5 des clients"
        description="Chiffre d'affaires par client (factures payées)"
        dataKey="amount"
        fill={CHART_COLORS.blue}
        formatValue={formatCurrency}
      />

      <Card
        className="overflow-hidden"
        style={{ background: theme.cardBg, borderColor: theme.cardBorder }}
      >
        <h3 className={`mb-4 text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Statistiques détaillées
        </h3>
        <div className="overflow-x-auto">
          <table className={`w-full text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <thead className={isDark ? 'bg-slate-800' : 'bg-gray-100'}>
              <tr>
                <th className="px-4 py-2 text-left">Métrique</th>
                <th className="px-4 py-2 text-right">Valeur</th>
              </tr>
            </thead>
            <tbody>
              <tr className={isDark ? 'border-b border-white/10' : 'border-b'}>
                <td className="px-4 py-2">Nombre total de clients</td>
                <td className="px-4 py-2 text-right font-semibold">{clients.length}</td>
              </tr>
              <tr className={isDark ? 'border-b border-white/10' : 'border-b'}>
                <td className="px-4 py-2">Nombre total de factures</td>
                <td className="px-4 py-2 text-right font-semibold">{factures.length}</td>
              </tr>
              <tr className={isDark ? 'border-b border-white/10' : 'border-b'}>
                <td className="px-4 py-2">Factures payées</td>
                <td className={`px-4 py-2 text-right font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {factures.filter(f => f.statut === 'paid').length}
                </td>
              </tr>
              <tr className={isDark ? 'border-b border-white/10' : 'border-b'}>
                <td className="px-4 py-2">Factures en attente</td>
                <td className={`px-4 py-2 text-right font-semibold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  {factures.filter(f => f.statut === 'pending').length}
                </td>
              </tr>
              <tr className={isDark ? 'border-b border-white/10' : 'border-b'}>
                <td className="px-4 py-2">Nombre total de réparations</td>
                <td className="px-4 py-2 text-right font-semibold">{reparations.length}</td>
              </tr>
              <tr className={isDark ? 'border-b border-white/10' : 'border-b'}>
                <td className="px-4 py-2">Réparations terminées</td>
                <td className={`px-4 py-2 text-right font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {reparations.filter(r => r.statut === 'completed').length}
                </td>
              </tr>
              <tr className={isDark ? 'border-b border-white/10' : 'border-b'}>
                <td className="px-4 py-2">Réparations en cours</td>
                <td className={`px-4 py-2 text-right font-semibold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                  {reparations.filter(r => r.statut === 'in-progress').length}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Coût moyen par réparation</td>
                <td className="px-4 py-2 text-right font-semibold">
                  {formatCurrency(
                    reparations.length > 0
                      ? reparations.reduce((sum, r) => sum + r.cout, 0) / reparations.length
                      : 0
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
