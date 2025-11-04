import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Analytics = () => {
  const [dashboard, setDashboard] = useState(null);
  const [demand, setDemand] = useState([]);
  const [inventoryHealth, setInventoryHealth] = useState(null);
  const [engagement, setEngagement] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchAnalytics();
  }, []);
  
  const fetchAnalytics = async () => {
    try {
      const [dashboardRes, demandRes, healthRes, engagementRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        analyticsAPI.getDemand({ days: 7 }),
        analyticsAPI.getInventoryHealth(),
        analyticsAPI.getStudentEngagement()
      ]);
      
      setDashboard(dashboardRes.data.data);
      setDemand(demandRes.data.data);
      setInventoryHealth(healthRes.data.data);
      setEngagement(engagementRes.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading analytics...</div>
      </div>
    );
  }
  
  // Prepare chart data
  const inventoryStatusData = dashboard?.inventory?.map(item => ({
    name: item.status,
    value: parseInt(item.count)
  })) || [];
  
  const nftTypeData = dashboard?.nfts?.map(item => ({
    name: item.nft_type,
    value: parseInt(item.count)
  })) || [];
  
  return (
    <div className="min-h-screen bg-primary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            ← Back
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-primary-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">
              {dashboard?.users?.find(u => u.role === 'student')?.count || 0}
            </p>
          </div>
          
          <div className="bg-primary-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Suppliers</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {dashboard?.users?.find(u => u.role === 'supplier')?.count || 0}
            </p>
          </div>
          
          <div className="bg-primary-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Available Items</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {inventoryHealth?.available_items || 0}
            </p>
          </div>
          
          <div className="bg-primary-100 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Recent Votes (7d)</h3>
            <p className="text-3xl font-bold text-amber-600 mt-2">
              {dashboard?.recent_votes?.total_votes || 0}
            </p>
          </div>
        </div>
        
        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Inventory Status */}
          <div className="bg-primary-100 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Inventory Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={inventoryStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {inventoryStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* NFT Distribution */}
          <div className="bg-primary-100 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Active NFTs by Type</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={nftTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Inventory Health */}
        <div className="bg-primary-100 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Inventory Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 font-medium">Available Items</p>
              <p className="text-2xl font-bold text-green-700">{inventoryHealth?.available_items || 0}</p>
              <p className="text-xs text-green-600 mt-1">Quantity: {inventoryHealth?.available_quantity || 0}</p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 font-medium">Coming Soon</p>
              <p className="text-2xl font-bold text-blue-700">{inventoryHealth?.coming_soon_items || 0}</p>
              <p className="text-xs text-blue-600 mt-1">In transit / pending</p>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-600 font-medium">Total Quantity</p>
              <p className="text-2xl font-bold text-amber-700">{inventoryHealth?.available_quantity || 0}</p>
              <p className="text-xs text-amber-600 mt-1">Available units</p>
            </div>
          </div>
        </div>
        
        {/* Student Engagement */}
        <div className="bg-primary-100 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Engaged Students</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-primary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Governance NFTs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Votes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allocations</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Redeemed</th>
                </tr>
              </thead>
              <tbody className="bg-primary-100 divide-y divide-gray-200">
                {engagement.slice(0, 10).map((student, index) => (
                  <tr key={student.id} className={index < 3 ? 'bg-primary-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.first_name} {student.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.governance_nft_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.total_votes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.total_allocations}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.redeemed_allocations}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

