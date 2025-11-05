import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryAPI } from '../services/api';
import SupplierSidebar from '../components/SupplierSidebar';

const AddDonation = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [formData, setFormData] = useState({
    item_name: '',
    item_type: '',
    quantity: '',
    unit: '',
    location: '',
    handling_notes: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await inventoryAPI.addInventory(formData);
      alert(`Donation logged successfully!\n\nReceipt created for your records\nItem: ${formData.item_name}\nQuantity: ${formData.quantity} ${formData.unit}\n\nYour donation has been verified and recorded for compliance and impact tracking.`);
      setFormData({
        item_name: '',
        item_type: '',
        quantity: '',
        unit: '',
        location: '',
        handling_notes: ''
      });
      navigate('/supplier');
    } catch (error) {
      alert('Failed to add donation: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex">
      <SupplierSidebar user={user} />
      
      <main className="flex-1 ml-64 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Donation</h1>
          <p className="text-gray-600 mb-6">
            Record a new food donation. A digital receipt will be issued automatically for your records.
          </p>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                <input
                  name="item_name"
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.item_name}
                  onChange={handleChange}
                  placeholder="e.g., Organic Apples"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Type</label>
                <select
                  name="item_type"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.item_type}
                  onChange={handleChange}
                >
                  <option value="">Select type</option>
                  <option value="produce">Produce</option>
                  <option value="dairy">Dairy</option>
                  <option value="meat">Meat</option>
                  <option value="grains">Grains</option>
                  <option value="canned">Canned Goods</option>
                  <option value="beverages">Beverages</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                <input
                  name="quantity"
                  type="number"
                  required
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="e.g., 50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                <input
                  name="unit"
                  type="text"
                  placeholder="e.g., lbs, count, gallons"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.unit}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  name="location"
                  type="text"
                  placeholder="Storage location or pickup point"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Handling Notes</label>
                <textarea
                  name="handling_notes"
                  rows="4"
                  placeholder="Special handling instructions, expiration dates, storage requirements, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.handling_notes}
                  onChange={handleChange}
                />
              </div>
              
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Submit Donation
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">What happens after submission?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your donation is recorded in the blockchain for permanent verification</li>
                  <li>A digital receipt is automatically issued to your account</li>
                  <li>The Pantry is notified and can begin allocating the food to students</li>
                  <li>You can track the donation lifecycle from your dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddDonation;

