import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'student',
    calpoly_id: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await authAPI.register(formData);
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-primary-100 p-8 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Register for FFQ
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                name="first_name"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                name="last_name"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="your.email@calpoly.edu"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              name="role"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="supplier">Supplier</option>
              <option value="pantry_worker">Pantry Worker</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">CalPoly ID (Optional)</label>
            <input
              name="calpoly_id"
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              value={formData.calpoly_id}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone (Optional)</label>
            <input
              name="phone"
              type="tel"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
          
          <div className="text-center">
            <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;

