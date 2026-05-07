import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import {
  Download,
  Calendar
} from 'lucide-react';
import {
  Card,
  Button,
  Select
} from '../common/UIComponents';
import {
  formatCurrency,
  calculateFinancialMetrics
} from '../../utils/helpers';

/**
 * Financial Report Component
 * Shows comprehensive financial reports and analytics
 */
export default function FinancialReport({ factures, reparations, clients }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().split('T')[0].slice(0, 7));

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
      { name: 'Payée', value: statuses.paid, color: '#10b981' },
      { name: 'En attente', value: statuses.pending, color: '#f59e0b' },
      { name: 'Annulée', value: statuses.cancelled, color: '#ef4444' }
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
      { name: 'Terminées', value: statuses.completed, color: '#3b82f6' },
      { name: 'En cours', value: statuses['in-progress'], color: '#8b5cf6' },
      { name: 'En attente', value: statuses.pending, color: '#ec4899' }
    ];
  };

  const monthlyData = getMonthlyData();
  const invoiceStatusData = getInvoiceStatusData();
  const topClients = getTopClients();
  const repairStatusData = getRepairStatusData();

  const handleExportPDF = () => {
    alert('Export PDF - Fonctionnalité à intégrer avec une API backend');
  };

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <Card className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Rapports Financiers</h2>
        <Button onClick={handleExportPDF} variant="secondary">
          <Download className="w-4 h-4 mr-2" /> Exporter en PDF
        </Button>
      </Card>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-gray-600">Revenu total</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {formatCurrency(metrics.totalRevenue)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Coûts totaux</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {formatCurrency(metrics.totalCosts)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Bénéfice net</p>
          <p className={`text-3xl font-bold mt-2 ${
            metrics.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(metrics.totalProfit)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Marge bénéficiaire</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {metrics.profitMargin}%
          </p>
        </Card>
      </div>

      {/* Monthly Trend Chart */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Tendance mensuelle (Revenu vs Coûts)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#10b981" 
              name="Revenu"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="costs" 
              stroke="#ef4444" 
              name="Coûts"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="#3b82f6" 
              name="Bénéfice"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice Status Distribution */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Statut des factures</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={invoiceStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name} (${entry.value})`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {invoiceStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Repair Status Distribution */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Statut des réparations</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={repairStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name} (${entry.value})`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {repairStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Clients */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Top 5 des clients</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topClients}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Bar dataKey="amount" fill="#3b82f6" name="Total dépensé" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Detailed Statistics Table */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Statistiques détaillées</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Métrique</th>
                <th className="px-4 py-2 text-right">Valeur</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-2">Nombre total de clients</td>
                <td className="px-4 py-2 text-right font-semibold">{clients.length}</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2">Nombre total de factures</td>
                <td className="px-4 py-2 text-right font-semibold">{factures.length}</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2">Factures payées</td>
                <td className="px-4 py-2 text-right font-semibold text-green-600">
                  {factures.filter(f => f.statut === 'paid').length}
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2">Factures en attente</td>
                <td className="px-4 py-2 text-right font-semibold text-yellow-600">
                  {factures.filter(f => f.statut === 'pending').length}
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2">Nombre total de réparations</td>
                <td className="px-4 py-2 text-right font-semibold">{reparations.length}</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2">Réparations terminées</td>
                <td className="px-4 py-2 text-right font-semibold text-blue-600">
                  {reparations.filter(r => r.statut === 'completed').length}
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2">Réparations en cours</td>
                <td className="px-4 py-2 text-right font-semibold text-purple-600">
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
