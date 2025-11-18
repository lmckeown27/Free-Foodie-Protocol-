import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { poasAPI, inventoryAPI } from '../services/api';
import RoleSidebar from '../components/RoleSidebar';

const SupplyPlanning = () => {
  const navigate = useNavigate();
  const [poasScores, setPoasScores] = useState([]);
  const [currentInventory, setCurrentInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('poas');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('critical');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [poasRes, inventoryRes] = await Promise.all([
        poasAPI.getFoodItemScores().catch(() => ({ data: { data: [] } })),
        inventoryAPI.getInventory({ limit: 100 }).catch(() => ({ data: { data: [] } }))
      ]);
      
      // Use API data or fallback to pseudo scores
      let scores = poasRes.data.data;
      if (!scores || scores.length === 0) {
        scores = generatePseudoScores();
      }
      
      setPoasScores(scores);
      setCurrentInventory(inventoryRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
      setPoasScores(generatePseudoScores());
    } finally {
      setLoading(false);
    }
  };

  const generatePseudoScores = () => {
    return [
      { item_name: 'Pizza Slices', item_type: 'Prepared Food', poas_score: 92, components: { demand: 95, redemption_rate: 90, urgency: 80, trending: 95 }, recommendation: 'Critical - Order Immediately' },
      { item_name: 'Organic Apples', item_type: 'Produce', poas_score: 88, components: { demand: 92, redemption_rate: 85, urgency: 65, trending: 90 }, recommendation: 'High Priority' },
      { item_name: 'Fresh Chicken Breast', item_type: 'Protein', poas_score: 86, components: { demand: 90, redemption_rate: 88, urgency: 70, trending: 85 }, recommendation: 'High Priority' },
      { item_name: 'Greek Yogurt', item_type: 'Dairy', poas_score: 85, components: { demand: 88, redemption_rate: 80, urgency: 68, trending: 92 }, recommendation: 'High Priority' },
      { item_name: 'Fresh Bananas', item_type: 'Produce', poas_score: 84, components: { demand: 87, redemption_rate: 83, urgency: 72, trending: 85 }, recommendation: 'High Priority' },
      { item_name: 'Whole Wheat Bread', item_type: 'Bakery', poas_score: 82, components: { demand: 85, redemption_rate: 82, urgency: 75, trending: 88 }, recommendation: 'High Priority' },
      { item_name: 'Peanut Butter', item_type: 'Pantry', poas_score: 81, components: { demand: 84, redemption_rate: 78, urgency: 75, trending: 82 }, recommendation: 'Order Soon' },
      { item_name: 'Cookies', item_type: 'Bakery', poas_score: 72, components: { demand: 75, redemption_rate: 70, urgency: 68, trending: 72 }, recommendation: 'Monitor & Order' },
      { item_name: 'Cereal', item_type: 'Grains', poas_score: 70, components: { demand: 72, redemption_rate: 70, urgency: 65, trending: 68 }, recommendation: 'Monitor & Order' },
      { item_name: 'Sandwiches', item_type: 'Prepared Food', poas_score: 68, components: { demand: 70, redemption_rate: 72, urgency: 60, trending: 65 }, recommendation: 'Monitor & Order' },
      { item_name: 'Orange Juice', item_type: 'Beverages', poas_score: 66, components: { demand: 68, redemption_rate: 65, urgency: 62, trending: 67 }, recommendation: 'Standard Stock' },
      { item_name: 'Granola', item_type: 'Snacks', poas_score: 64, components: { demand: 66, redemption_rate: 62, urgency: 60, trending: 65 }, recommendation: 'Standard Stock' },
      { item_name: 'Fresh Tomatoes', item_type: 'Produce', poas_score: 62, components: { demand: 65, redemption_rate: 60, urgency: 58, trending: 64 }, recommendation: 'Standard Stock' },
      { item_name: 'Canned Beans', item_type: 'Canned Goods', poas_score: 58, components: { demand: 60, redemption_rate: 65, urgency: 50, trending: 55 }, recommendation: 'Low Priority' },
      { item_name: 'Fresh Broccoli', item_type: 'Produce', poas_score: 44, components: { demand: 46, redemption_rate: 45, urgency: 40, trending: 42 }, recommendation: 'Low Priority' },
      { item_name: 'Canned Soup', item_type: 'Canned Goods', poas_score: 42, components: { demand: 45, redemption_rate: 48, urgency: 35, trending: 38 }, recommendation: 'Low Priority' },
      { item_name: 'Honey', item_type: 'Pantry', poas_score: 40, components: { demand: 42, redemption_rate: 40, urgency: 36, trending: 38 }, recommendation: 'Low Priority' },
      { item_name: 'Crackers', item_type: 'Snacks', poas_score: 38, components: { demand: 40, redemption_rate: 42, urgency: 32, trending: 35 }, recommendation: 'Optional' },
      { item_name: 'Fresh Herbs', item_type: 'Produce', poas_score: 36, components: { demand: 38, redemption_rate: 35, urgency: 32, trending: 36 }, recommendation: 'Optional' },
      { item_name: 'Carrots', item_type: 'Produce', poas_score: 24, components: { demand: 26, redemption_rate: 25, urgency: 20, trending: 22 }, recommendation: 'Optional' },
      { item_name: 'Bagels', item_type: 'Bakery', poas_score: 22, components: { demand: 24, redemption_rate: 28, urgency: 18, trending: 18 }, recommendation: 'Optional' },
      { item_name: 'Lettuce', item_type: 'Produce', poas_score: 20, components: { demand: 22, redemption_rate: 20, urgency: 18, trending: 16 }, recommendation: 'Optional' }
    ];
  };

  const getRecommendationColor = (poas) => {
    if (poas >= 85) return 'bg-red-100 text-red-800 border-red-300';
    if (poas >= 70) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (poas >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (poas >= 30) return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getRecommendationText = (poas) => {
    if (poas >= 85) return 'Critical - Order Immediately';
    if (poas >= 70) return 'High Priority - Order Soon';
    if (poas >= 50) return 'Monitor & Order Regularly';
    if (poas >= 30) return 'Low Priority - Standard Stock';
    return 'Optional - Low Demand';
  };

  const getPOASBadgeColor = (poas) => {
    if (poas >= 75) return 'bg-purple-600 text-white';
    if (poas >= 50) return 'bg-blue-600 text-white';
    if (poas >= 25) return 'bg-yellow-600 text-white';
    return 'bg-gray-600 text-white';
  };

  const getCurrentStock = (itemName) => {
    const item = currentInventory.find(inv => inv.item_name === itemName);
    return item ? `${item.quantity} ${item.unit}` : 'Out of stock';
  };

  const getStockStatus = (itemName) => {
    const item = currentInventory.find(inv => inv.item_name === itemName);
    if (!item) return 'critical';
    if (item.quantity < 10) return 'low';
    if (item.quantity < 50) return 'medium';
    return 'good';
  };

  const filteredAndSortedScores = () => {
    let filtered = [...poasScores];

    // Filter by active tab (recommendation tier)
    switch (activeTab) {
      case 'critical':
        filtered = filtered.filter(item => item.poas_score >= 85);
        break;
      case 'high':
        filtered = filtered.filter(item => item.poas_score >= 70 && item.poas_score < 85);
        break;
      case 'medium':
        filtered = filtered.filter(item => item.poas_score >= 50 && item.poas_score < 70);
        break;
      case 'low':
        filtered = filtered.filter(item => item.poas_score >= 30 && item.poas_score < 50);
        break;
      case 'optional':
        filtered = filtered.filter(item => item.poas_score < 30);
        break;
      default:
        break;
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.item_type === categoryFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'poas':
          return b.poas_score - a.poas_score;
        case 'demand':
          return b.components.demand - a.components.demand;
        case 'redemption':
          return b.components.redemption_rate - a.components.redemption_rate;
        case 'name':
          return a.item_name.localeCompare(b.item_name);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const categories = ['all', ...new Set(poasScores.map(item => item.item_type).filter(Boolean))];
  const displayedScores = filteredAndSortedScores();

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <RoleSidebar user={user} />
        <main className="flex-1 ml-64 p-8">
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading supply planning data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <RoleSidebar user={user} />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Supply Planning</h1>
            <p className="text-gray-600">
              Use POAS (Predicted Optimal Allocation Score) insights to determine what food items to request from suppliers
            </p>
          </div>

          {/* Info Banner */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-purple-900 mb-2">How POAS Scoring Works</h3>
                <p className="text-sm text-purple-800 mb-3">
                  Each food item is scored based on <strong>student demand/votes (35%)</strong>, <strong>redemption rate (25%)</strong>, 
                  <strong> urgency/stock levels (20%)</strong>, and <strong>trending activity (20%)</strong>.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                    <span className="text-purple-900"><strong>75+</strong> Critical Priority</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    <span className="text-purple-900"><strong>50-74</strong> High Priority</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                    <span className="text-purple-900"><strong>25-49</strong> Medium Priority</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                    <span className="text-purple-900"><strong>&lt;25</strong> Low Priority</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Priority Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('critical')}
                  className={`flex-1 py-4 px-4 text-center font-medium text-sm transition ${
                    activeTab === 'critical'
                      ? 'border-b-4 border-red-500 text-red-700 bg-red-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Critical Priority</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800 font-bold">
                      {poasScores.filter(s => s.poas_score >= 85).length}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">POAS 85+</div>
                </button>
                
                <button
                  onClick={() => setActiveTab('high')}
                  className={`flex-1 py-4 px-4 text-center font-medium text-sm transition ${
                    activeTab === 'high'
                      ? 'border-b-4 border-orange-500 text-orange-700 bg-orange-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span>High Priority</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-800 font-bold">
                      {poasScores.filter(s => s.poas_score >= 70 && s.poas_score < 85).length}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">POAS 70-84</div>
                </button>
                
                <button
                  onClick={() => setActiveTab('medium')}
                  className={`flex-1 py-4 px-4 text-center font-medium text-sm transition ${
                    activeTab === 'medium'
                      ? 'border-b-4 border-yellow-500 text-yellow-700 bg-yellow-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span>Medium Priority</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800 font-bold">
                      {poasScores.filter(s => s.poas_score >= 50 && s.poas_score < 70).length}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">POAS 50-69</div>
                </button>
                
                <button
                  onClick={() => setActiveTab('low')}
                  className={`flex-1 py-4 px-4 text-center font-medium text-sm transition ${
                    activeTab === 'low'
                      ? 'border-b-4 border-blue-500 text-blue-700 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Low Priority</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-bold">
                      {poasScores.filter(s => s.poas_score >= 30 && s.poas_score < 50).length}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">POAS 30-49</div>
                </button>
                
                <button
                  onClick={() => setActiveTab('optional')}
                  className={`flex-1 py-4 px-4 text-center font-medium text-sm transition ${
                    activeTab === 'optional'
                      ? 'border-b-4 border-gray-500 text-gray-700 bg-gray-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    <span>Optional</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800 font-bold">
                      {poasScores.filter(s => s.poas_score < 30).length}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">POAS &lt;30</div>
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Context Banner */}
          {activeTab === 'critical' && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-red-900 mb-1">Critical Priority - Order Immediately</h3>
              <p className="text-sm text-red-800">
                These items have extremely high student demand and must be ordered from suppliers right away to avoid shortages. Contact suppliers ASAP.
              </p>
            </div>
          )}
          {activeTab === 'high' && (
            <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-orange-900 mb-1">High Priority - Order Soon</h3>
              <p className="text-sm text-orange-800">
                These items have strong demand and should be ordered within the next few days to maintain adequate inventory levels.
              </p>
            </div>
          )}
          {activeTab === 'medium' && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-yellow-900 mb-1">Medium Priority - Monitor & Order Regularly</h3>
              <p className="text-sm text-yellow-800">
                These items have moderate demand. Keep them in stock and order regularly to maintain consistent availability.
              </p>
            </div>
          )}
          {activeTab === 'low' && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-blue-900 mb-1">Low Priority - Standard Stock</h3>
              <p className="text-sm text-blue-800">
                These items have lower demand. Maintain minimal stock levels and order only when running low.
              </p>
            </div>
          )}
          {activeTab === 'optional' && (
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-gray-900 mb-1">Optional - Low Demand</h3>
              <p className="text-sm text-gray-800">
                These items have minimal student demand. Consider ordering only if you have extra budget or supplier minimums require it.
              </p>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="poas">POAS Score (High to Low)</option>
                  <option value="demand">Demand (High to Low)</option>
                  <option value="redemption">Redemption Rate (High to Low)</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Supply Planning Table */}
          {displayedScores.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No items in this category</h3>
              <p className="text-gray-600">
                {categoryFilter !== 'all' 
                  ? `There are no ${activeTab} priority items in the "${categoryFilter}" category.`
                  : `There are currently no items in the ${activeTab} priority tier.`
                }
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        POAS
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Stock
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Demand Metrics
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recommendation
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayedScores.map((item, index) => {
                    const stockStatus = getStockStatus(item.item_name);
                    return (
                      <tr key={index} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.item_name}</div>
                            <div className="text-xs text-gray-500">{item.item_type}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-sm font-bold rounded-full ${getPOASBadgeColor(item.poas_score)}`}>
                            {item.poas_score.toFixed(0)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              stockStatus === 'critical' ? 'bg-red-500' :
                              stockStatus === 'low' ? 'bg-orange-500' :
                              stockStatus === 'medium' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}></div>
                            <span className="text-sm text-gray-900">{getCurrentStock(item.item_name)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex justify-between gap-4">
                              <span>Demand:</span>
                              <span className="font-semibold">{item.components.demand.toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span>Redemption:</span>
                              <span className="font-semibold">{item.components.redemption_rate.toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span>Urgency:</span>
                              <span className="font-semibold">{item.components.urgency.toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span>Trending:</span>
                              <span className="font-semibold">{item.components.trending.toFixed(0)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-2 text-xs font-semibold rounded-lg border-2 ${getRecommendationColor(item.poas_score)}`}>
                            {getRecommendationText(item.poas_score)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SupplyPlanning;
