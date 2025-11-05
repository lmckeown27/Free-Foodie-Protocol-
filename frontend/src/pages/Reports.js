import React, { useState } from 'react';
import { analyticsAPI, inventoryAPI, allocationAPI, votingAPI, supplierAPI } from '../services/api';
import { downloadCSV, downloadJSON, downloadTextReport, formatDataForExport } from '../utils/exportData';
import StudentSidebar from '../components/StudentSidebar';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: new Date().toISOString().split('T')[0]
  });
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const reportTypes = [
    {
      id: 'inventory',
      name: 'Inventory Report',
      description: 'Export current inventory status and details',
      roles: ['pantry_worker', 'bni']
    },
    {
      id: 'allocations',
      name: 'Allocations Report',
      description: 'Export allocation history and POAS scores',
      roles: ['pantry_worker', 'bni']
    },
    {
      id: 'votes',
      name: 'Voting Report',
      description: 'Export student voting patterns and preferences',
      roles: ['pantry_worker', 'bni']
    },
    {
      id: 'suppliers',
      name: 'Supplier Report',
      description: 'Export supplier donations and impact metrics',
      roles: ['supplier', 'bni']
    },
    {
      id: 'analytics',
      name: 'Analytics Dashboard',
      description: 'Export comprehensive system analytics',
      roles: ['bni']
    },
    {
      id: 'my_activity',
      name: 'My Activity Report',
      description: 'Export your personal activity and statistics',
      roles: ['student', 'supplier']
    }
  ];

  const availableReports = reportTypes.filter(report => 
    report.roles.includes(user.role)
  );

  const generateReport = async (format = 'csv') => {
    if (!selectedReport) {
      alert('Please select a report type');
      return;
    }

    setLoading(true);
    try {
      let data = [];
      let filename = `${selectedReport}_${new Date().toISOString().split('T')[0]}`;

      switch (selectedReport) {
        case 'inventory':
          const inventoryRes = await inventoryAPI.getInventory({ limit: 1000 });
          data = formatDataForExport(
            inventoryRes.data.data,
            ['donation_date'],
            ['quantity']
          );
          filename = `inventory_report_${Date.now()}`;
          break;

        case 'allocations':
          const allocationsRes = await allocationAPI.getAllocations({ limit: 1000 });
          data = formatDataForExport(
            allocationsRes.data.data,
            ['allocation_date'],
            ['quantity', 'poas_score']
          );
          filename = `allocations_report_${Date.now()}`;
          break;

        case 'votes':
          const votesRes = await votingAPI.getResults({ limit: 1000 });
          data = formatDataForExport(
            votesRes.data.data,
            ['vote_date'],
            ['vote_count']
          );
          filename = `voting_report_${Date.now()}`;
          break;

        case 'suppliers':
          const suppliersRes = await supplierAPI.getSuppliers({ limit: 1000 });
          data = suppliersRes.data.data;
          filename = `suppliers_report_${Date.now()}`;
          break;

        case 'analytics':
          const analyticsRes = await analyticsAPI.getDashboard();
          data = analyticsRes.data.data;
          filename = `analytics_report_${Date.now()}`;
          
          if (format === 'txt') {
            const sections = [
              {
                title: 'User Statistics',
                data: data.users || []
              },
              {
                title: 'Inventory Overview',
                data: data.inventory || []
              },
              {
                title: 'System Metrics',
                data: {
                  'Total Users': data.users?.reduce((sum, u) => sum + (u.count || 0), 0) || 0,
                  'Total Inventory Items': data.inventory?.reduce((sum, i) => sum + (i.total_quantity || 0), 0) || 0
                }
              }
            ];
            downloadTextReport('FFQ Analytics Dashboard', data, sections, `${filename}.txt`);
            return;
          }
          break;

        case 'my_activity':
          if (user.role === 'student') {
            const [myAllocations, myVotes] = await Promise.all([
              allocationAPI.getMyAllocations(),
              votingAPI.getMyVotes()
            ]);
            data = {
              allocations: formatDataForExport(myAllocations.data.data, ['allocation_date'], ['poas_score']),
              votes: formatDataForExport(myVotes.data.data, ['vote_date'], ['priority'])
            };
            filename = `student_activity_${Date.now()}`;
          } else if (user.role === 'supplier') {
            const myDonations = await supplierAPI.getSupplierDonations(user.id);
            data = formatDataForExport(myDonations.data.data, ['donation_date'], ['quantity']);
            filename = `supplier_donations_${Date.now()}`;
          }
          break;

        default:
          alert('Unknown report type');
          return;
      }

      // Export in selected format
      if (format === 'csv') {
        if (Array.isArray(data)) {
          downloadCSV(data, `${filename}.csv`);
        } else {
          // For complex objects, export each section separately
          Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              downloadCSV(value, `${filename}_${key}.csv`);
            }
          });
        }
      } else if (format === 'json') {
        downloadJSON(data, `${filename}.json`);
      }

      alert('Report generated successfully!');
    } catch (error) {
      console.error('Failed to generate report', error);
      alert('Failed to generate report: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <StudentSidebar user={user} />
      
      <main className="flex-1 ml-64 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports & Export</h1>
              <p className="text-sm text-gray-600 mt-1">Generate and download platform data</p>
            </div>
          </div>
        </div>

        {/* Report Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Report Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableReports.map(report => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                  selectedReport === report.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <h3 className="font-bold text-gray-900 mb-1">{report.name}</h3>
                <p className="text-sm text-gray-600">{report.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Date Range (Optional) */}
        {selectedReport && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Date Range (Optional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Export Options */}
        {selectedReport && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Format</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => generateReport('csv')}
                disabled={loading}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Generating...' : 'Export as CSV'}
              </button>
              <button
                onClick={() => generateReport('json')}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Generating...' : 'Export as JSON'}
              </button>
              {selectedReport === 'analytics' && (
                <button
                  onClick={() => generateReport('txt')}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Generating...' : 'Export as Text'}
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Choose a format to download your report. CSV is compatible with Excel and Google Sheets.
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-bold text-blue-900 mb-1">About Reports</h3>
              <p className="text-sm text-blue-800">
                All exported reports include real-time data from the FFQ platform. Reports can be used for:
              </p>
              <ul className="text-sm text-blue-800 list-disc list-inside mt-2 space-y-1">
                <li>Compliance and regulatory reporting</li>
                <li>Impact analysis and metrics tracking</li>
                <li>Data backup and archival</li>
                <li>External system integration</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;

