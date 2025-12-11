import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Shield, Lock, User, CreditCard } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const App = () => {
  const [view, setView] = useState('home');
  const [userType, setUserType] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Customer Registration Component
  const CustomerRegister = () => {
    const [formData, setFormData] = useState({
      fullName: '',
      idNumber: '',
      accountNumber: '',
      username: '',
      password: '',
      confirmPassword: ''
    });
    const [validationErrors, setValidationErrors] = useState({});

    const validationPatterns = {
      fullName: /^[a-zA-Z\s]{2,50}$/,
      idNumber: /^\d{13}$/,
      accountNumber: /^\d{10,16}$/,
      username: /^[a-zA-Z0-9_]{3,20}$/,
      password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    };

    const validateField = (name, value) => {
      if (validationPatterns[name]) {
        return validationPatterns[name].test(value);
      }
      return true;
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      
      if (value) {
        const isValid = validateField(name, value);
        setValidationErrors(prev => ({
          ...prev,
          [name]: isValid ? '' : `Invalid ${name.replace(/([A-Z])/g, ' $1').toLowerCase()}`
        }));
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setSuccess('');
      setLoading(true);

      // Validate all fields
      const errors = {};
      Object.keys(formData).forEach(key => {
        if (key !== 'confirmPassword' && !validateField(key, formData[key])) {
          errors[key] = `Invalid ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
        }
      });

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setError('Please fix validation errors');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/customer/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: formData.fullName,
            idNumber: formData.idNumber,
            accountNumber: formData.accountNumber,
            username: formData.username,
            password: formData.password
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess('Registration successful! Please login.');
          setTimeout(() => {
            setView('login');
            setUserType('customer');
          }, 2000);
        } else {
          setError(data.error || 'Registration failed');
        }
      } catch (err) {
        setError('Network error. Please ensure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
        <div className="flex items-center justify-center mb-6">
          <Shield className="w-8 h-8 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold">Customer Registration</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg ${validationErrors.fullName ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="John Doe"
              required
            />
            {validationErrors.fullName && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ID Number (13 digits)</label>
            <input
              type="text"
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg ${validationErrors.idNumber ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="9001011234567"
              maxLength="13"
              required
            />
            {validationErrors.idNumber && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.idNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Account Number (10-16 digits)</label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg ${validationErrors.accountNumber ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="1234567890"
              maxLength="16"
              required
            />
            {validationErrors.accountNumber && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.accountNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg ${validationErrors.username ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="johndoe123"
              required
            />
            {validationErrors.username && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg ${validationErrors.password ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Min 8 chars, 1 upper, 1 lower, 1 number, 1 special"
              required
            />
            {validationErrors.password && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg ${validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {validationErrors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium disabled:bg-blue-300"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Already have an account?{' '}
          <button
            onClick={() => {
              setView('login');
              setUserType('customer');
            }}
            className="text-blue-600 hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    );
  };

  // Login Component
  const Login = ({ type }) => {
    const [credentials, setCredentials] = useState({
      username: '',
      accountNumber: '',
      password: ''
    });

    const handleLogin = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
        const endpoint = type === 'employee' ? '/employee/login' : '/customer/login';
        const body = type === 'employee' 
          ? { username: credentials.username, password: credentials.password }
          : credentials;

        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (response.ok) {
          const user = type === 'employee' ? data.employee : data.customer;
          setCurrentUser(user);
          setView(type === 'employee' ? 'employee-portal' : 'customer-portal');
        } else {
          setError(data.error || 'Invalid credentials');
        }
      } catch (err) {
        setError('Network error. Please ensure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
        <div className="flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold">
            {type === 'employee' ? 'Employee' : 'Customer'} Login
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder={type === 'employee' ? '' : 'Your username'}
              required
            />
          </div>

          {type === 'customer' && (
            <div>
              <label className="block text-sm font-medium mb-1">Account Number</label>
              <input
                type="text"
                value={credentials.accountNumber}
                onChange={(e) => setCredentials(prev => ({ ...prev, accountNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Your account number"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder={type === 'employee' ? '' : 'Your password'}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium disabled:bg-blue-300"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {type === 'employee' && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            <p className="font-medium"> </p>
            <p></p>
            <p></p>
          </div>
        )}

        {type === 'customer' && (
          <p className="text-center mt-4 text-sm">
            Don't have an account?{' '}
            <button
              onClick={() => setView('register')}
              className="text-blue-600 hover:underline"
            >
              Register
            </button>
          </p>
        )}

        <button
          onClick={() => {
            setView('home');
            setUserType(null);
            setError('');
          }}
          className="w-full mt-4 text-gray-600 hover:text-gray-800"
        >
          Back to Home
        </button>
      </div>
    );
  };

  // Customer Portal Component
  const CustomerPortal = () => {
    const [paymentData, setPaymentData] = useState({
      amount: '',
      currency: 'R',
      provider: 'SWIFT',
      payeeAccount: '',
      swiftCode: ''
    });
    const [validationErrors, setValidationErrors] = useState({});

    const validationPatterns = {
      amount: /^\d+(\.\d{1,2})?$/,
      swiftCode: /^\d{8,11}$/,
      payeeAccount: /^\d{10,16}$/
    };

    const validateField = (name, value) => {
      if (validationPatterns[name]) {
        return validationPatterns[name].test(value) && (name !== 'amount' || parseFloat(value) > 0);
      }
      return true;
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setPaymentData(prev => ({ ...prev, [name]: value }));

      if (value && validationPatterns[name]) {
        const isValid = validateField(name, value);
        setValidationErrors(prev => ({
          ...prev,
          [name]: isValid ? '' : `Invalid ${name}`
        }));
      }
    };

    const handlePayment = async (e) => {
      e.preventDefault();
      setError('');
      setSuccess('');
      setLoading(true);

      const errors = {};
      Object.keys(validationPatterns).forEach(key => {
        if (!validateField(key, paymentData[key])) {
          errors[key] = `Invalid ${key}`;
        }
      });

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setError('Please fix validation errors');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/payment/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: currentUser.id,
            ...paymentData
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess('Payment submitted successfully!');
          setPaymentData({
            amount: '',
            currency: 'R',
            provider: 'SWIFT',
            payeeAccount: '',
            swiftCode: ''
          });
          setValidationErrors({});
        } else {
          setError(data.error || 'Payment failed');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <CreditCard className="w-8 h-8 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold">Make Payment</h2>
          </div>
          <button
            onClick={() => {
              setCurrentUser(null);
              setView('home');
              setError('');
              setSuccess('');
            }}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Logout
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="font-medium">Welcome, {currentUser.fullName}!</p>
          <p className="text-sm text-gray-600">Account: {currentUser.accountNumber}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                R
              </span>
              <input
                type="text"
                name="amount"
                value={paymentData.amount}
                onChange={handleChange}
                className={`flex-1 px-3 py-2 border rounded-r-lg ${validationErrors.amount ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="1000.00"
                required
              />
            </div>
            {validationErrors.amount && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.amount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Currency</label>
            <select
              name="currency"
              value={paymentData.currency}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              disabled
            >
              <option value="R">Rands (R)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Payment Provider</label>
            <select
              name="provider"
              value={paymentData.provider}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="SWIFT">SWIFT</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Payee Account Number (10-16 digits)</label>
            <input
              type="text"
              name="payeeAccount"
              value={paymentData.payeeAccount}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg ${validationErrors.payeeAccount ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="9876543210"
              maxLength="16"
              required
            />
            {validationErrors.payeeAccount && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.payeeAccount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">SWIFT Code (8-11 digits)</label>
            <input
              type="text"
              name="swiftCode"
              value={paymentData.swiftCode}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg ${validationErrors.swiftCode ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="12345678"
              maxLength="11"
              required
            />
            {validationErrors.swiftCode && (
              <p className="text-xs text-red-500 mt-1">{validationErrors.swiftCode}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium text-lg disabled:bg-green-300"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </form>
      </div>
    );
  };

  // Employee Portal Component
  const EmployeePortal = () => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
      fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
      try {
        const response = await fetch(`${API_URL}/transactions`);
        const data = await response.json();
        if (response.ok) {
          setTransactions(data.transactions);
        }
      } catch (err) {
        setError('Failed to fetch transactions');
      }
    };

    const verifyTransaction = async (id) => {
      try {
        const response = await fetch(`${API_URL}/transaction/${id}/verify`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            employeeId: currentUser.id,
            employeeName: currentUser.name
          }),
        });

        if (response.ok) {
          fetchTransactions();
          setSuccess('Transaction verified');
          setTimeout(() => setSuccess(''), 3000);
        } else {
          const data = await response.json();
          setError(data.error || 'Verification failed');
        }
      } catch (err) {
        setError('Network error');
      }
    };

    const submitToSwift = async () => {
      const verifiedIds = transactions
        .filter(t => t.status === 'verified')
        .map(t => t.id);

      if (verifiedIds.length === 0) {
        setError('No verified transactions to submit');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/transactions/submit-swift`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionIds: verifiedIds,
            employeeId: currentUser.id
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess(data.message);
          fetchTransactions();
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError(data.error || 'Submission failed');
        }
      } catch (err) {
        setError('Network error');
      }
    };

    return (
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold">Employee Payment Portal</h2>
          </div>
          <button
            onClick={() => {
              setCurrentUser(null);
              setView('home');
              setError('');
              setSuccess('');
            }}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Logout
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="font-medium">Logged in as: {currentUser.name} ({currentUser.username})</p>
          <p className="text-sm text-gray-600">Role: Payment Verifier</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left text-sm">ID</th>
                <th className="border p-2 text-left text-sm">Customer</th>
                <th className="border p-2 text-left text-sm">Amount</th>
                <th className="border p-2 text-left text-sm">Payee Account</th>
                <th className="border p-2 text-left text-sm">SWIFT Code</th>
                <th className="border p-2 text-left text-sm">Status</th>
                <th className="border p-2 text-left text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="border p-4 text-center text-gray-500">
                    No transactions available
                  </td>
                </tr>
              ) : (
                transactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="border p-2 text-sm">{t.id}</td>
                    <td className="border p-2 text-sm">{t.customerName}</td>
                    <td className="border p-2 text-sm">R {parseFloat(t.amount).toFixed(2)}</td>
                    <td className="border p-2 text-sm">{t.payeeAccount}</td>
                    <td className="border p-2 text-sm">{t.swiftCode}</td>
                    <td className="border p-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        t.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        t.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {t.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="border p-2">
                      {t.status === 'pending' && (
                        <button
                          onClick={() => verifyTransaction(t.id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                        >
                          Verify
                        </button>
                      )}
                      {t.status === 'verified' && (
                        <span className="text-green-600 text-sm">✓ Verified</span>
                      )}
                      {t.status === 'submitted' && (
                        <span className="text-gray-600 text-sm">Submitted</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={submitToSwift}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
            disabled={transactions.filter(t => t.status === 'verified').length === 0}
          >
            Submit to SWIFT
          </button>
        </div>
      </div>
    );
  };

// Home Screen JSX (inline)
if (view === 'home') {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Customer Section */}
        <div className="flex flex-col items-center p-6 bg-blue-50 rounded-lg shadow-inner">
          <User className="w-12 h-12 text-blue-600 mb-4" />
          <h2 className="text-xl font-bold mb-2">Customer</h2>
          <p className="text-sm text-gray-700 mb-4 text-center">
            Access your account, make payments, and view your transaction history.
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setView('login');
                setUserType('customer');
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Login
            </button>
            <button
              onClick={() => setView('register')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
            >
              Register
            </button>
          </div>
        </div>

        {/* Employee Section */}
        <div className="flex flex-col items-center p-6 bg-indigo-50 rounded-lg shadow-inner">
          <Shield className="w-12 h-12 text-indigo-600 mb-4" />
          <h2 className="text-xl font-bold mb-2">Employee</h2>
          <p className="text-sm text-gray-700 mb-4 text-center">
            Login to manage and verify customer transactions securely.
          </p>
          <button
            onClick={() => {
              setView('login');
              setUserType('employee');
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

if (view === 'register') return <CustomerRegister />;
if (view === 'login') return <Login type={userType} />;
if (view === 'customer-portal') return <CustomerPortal />;
if (view === 'employee-portal') return <EmployeePortal />;

}

export default App;
