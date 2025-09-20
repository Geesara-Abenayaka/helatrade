import React, { useState } from 'react'

const ConnectionsHub = ({ producer }) => {
  const [activeTab, setActiveTab] = useState('connections')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState('all')

  // Mock data
  const connections = [
    {
      id: 1,
      name: 'Green Valley Supermarket',
      type: 'Retail Chain',
      location: 'Colombo',
      avatar: 'GV',
      connectedDate: '2024-01-10',
      businessType: 'Supermarket',
      orderHistory: 15,
      totalValue: 450000,
      lastOrder: '2024-01-14',
      products: ['Vegetables', 'Fruits'],
      status: 'active',
      rating: 4.8,
      mutualConnections: 12
    },
    {
      id: 2,
      name: 'Export Quality Foods Ltd',
      type: 'Export Company',
      location: 'Negombo',
      avatar: 'EQ',
      connectedDate: '2024-01-05',
      businessType: 'Export',
      orderHistory: 8,
      totalValue: 1200000,
      lastOrder: '2024-01-12',
      products: ['Spices', 'Tea'],
      status: 'active',
      rating: 4.9,
      mutualConnections: 18
    },
    {
      id: 3,
      name: 'Organic Food Store',
      type: 'Specialty Store',
      location: 'Kandy',
      avatar: 'OF',
      connectedDate: '2024-01-08',
      businessType: 'Organic Store',
      orderHistory: 6,
      totalValue: 280000,
      lastOrder: '2024-01-13',
      products: ['Organic Products'],
      status: 'active',
      rating: 4.7,
      mutualConnections: 8
    },
    {
      id: 4,
      name: 'Lanka Spice Traders',
      type: 'Wholesale',
      location: 'Matara',
      avatar: 'LS',
      connectedDate: '2023-12-15',
      businessType: 'Wholesale',
      orderHistory: 0,
      totalValue: 0,
      lastOrder: null,
      products: ['Spices'],
      status: 'inactive',
      rating: 4.5,
      mutualConnections: 5
    }
  ]

  const connectionRequests = [
    {
      id: 1,
      name: 'Premium Organic Markets',
      type: 'Retail Chain',
      location: 'Galle',
      avatar: 'PO',
      requestDate: '2024-01-15',
      message: 'We are interested in sourcing organic vegetables and fruits for our chain of stores.',
      products: ['Vegetables', 'Fruits', 'Organic Products'],
      storeCount: 12,
      mutualConnections: 6,
      businessType: 'Organic Retail'
    },
    {
      id: 2,
      name: 'Ceylon Tea Exports',
      type: 'Export Company',
      location: 'Colombo',
      avatar: 'CT',
      requestDate: '2024-01-14',
      message: 'Looking for premium Ceylon tea suppliers for international markets.',
      products: ['Tea'],
      storeCount: 1,
      mutualConnections: 15,
      businessType: 'Tea Export'
    },
    {
      id: 3,
      name: 'Spice World International',
      type: 'Export Company',
      location: 'Colombo',
      avatar: 'SW',
      requestDate: '2024-01-13',
      message: 'Seeking reliable spice suppliers for European markets.',
      products: ['Spices'],
      storeCount: 1,
      mutualConnections: 9,
      businessType: 'Spice Export'
    }
  ]

  const connectionGrowth = [
    { month: 'Oct', connections: 8 },
    { month: 'Nov', connections: 12 },
    { month: 'Dec', connections: 18 },
    { month: 'Jan', connections: 25 }
  ]

  const businessTypes = ['All Types', 'Retail Chain', 'Export Company', 'Specialty Store', 'Wholesale', 'Restaurant']

  const filteredConnections = connections.filter(connection => {
    const matchesSearch = connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         connection.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterBy === 'all' || connection.businessType === filterBy
    return matchesSearch && matchesFilter
  })

  const handleAcceptRequest = (requestId) => {
    console.log('Accepting connection request:', requestId)
  }

  const handleDeclineRequest = (requestId) => {
    console.log('Declining connection request:', requestId)
  }

  const handleMessageConnection = (connectionId) => {
    console.log('Opening message with connection:', connectionId)
  }

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const renderConnections = () => (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search connections..."
            className="pl-10 pr-4 py-2 w-full border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <select
          value={filterBy}
          onChange={(e) => setFilterBy(e.target.value)}
          className="border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          {businessTypes.map(type => (
            <option key={type} value={type === 'All Types' ? 'all' : type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Connections List */}
      <div className="grid gap-4">
        {filteredConnections.map(connection => (
          <div key={connection.id} className="border border-primary-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg font-medium">{connection.avatar}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-primary-900">{connection.name}</h3>
                    {getStatusBadge(connection.status)}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-primary-600 mb-2">
                    <span>{connection.businessType}</span>
                    <span>•</span>
                    <span>{connection.location}</span>
                    <span>•</span>
                    <span>★ {connection.rating}</span>
                  </div>
                  <p className="text-sm text-primary-600 mb-3">
                    Connected on {new Date(connection.connectedDate).toLocaleDateString()}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {connection.products.map(product => (
                      <span key={product} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                        {product}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-primary-500">Orders:</span>
                      <span className="font-medium text-primary-900 ml-1">{connection.orderHistory}</span>
                    </div>
                    <div>
                      <span className="text-primary-500">Total Value:</span>
                      <span className="font-medium text-primary-900 ml-1">Rs. {connection.totalValue.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-primary-500">Last Order:</span>
                      <span className="font-medium text-primary-900 ml-1">
                        {connection.lastOrder ? new Date(connection.lastOrder).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                    <div>
                      <span className="text-primary-500">Mutual:</span>
                      <span className="font-medium text-primary-900 ml-1">{connection.mutualConnections}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleMessageConnection(connection.id)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm"
                >
                  Message
                </button>
                <button className="bg-primary-100 text-primary-700 px-4 py-2 rounded-lg hover:bg-primary-200 transition-colors text-sm">
                  View Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderConnectionRequests = () => (
    <div className="space-y-4">
      <div className="text-sm text-primary-600 mb-4">
        {connectionRequests.length} pending connection requests
      </div>
      
      <div className="grid gap-4">
        {connectionRequests.map(request => (
          <div key={request.id} className="border border-primary-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg font-medium">{request.avatar}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-primary-900 mb-1">{request.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-primary-600 mb-2">
                    <span>{request.businessType}</span>
                    <span>•</span>
                    <span>{request.location}</span>
                    <span>•</span>
                    <span>{request.mutualConnections} mutual connections</span>
                  </div>
                  {request.storeCount > 1 && (
                    <p className="text-sm text-primary-600 mb-2">
                      {request.storeCount} stores
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {request.products.map(product => (
                      <span key={product} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {product}
                      </span>
                    ))}
                  </div>
                  <div className="bg-primary-50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-primary-800 italic">"{request.message}"</p>
                  </div>
                  <p className="text-xs text-primary-500">
                    Requested on {new Date(request.requestDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-col space-y-2 ml-4">
                <button
                  onClick={() => handleAcceptRequest(request.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDeclineRequest(request.id)}
                  className="bg-primary-200 text-primary-700 px-4 py-2 rounded-lg hover:bg-primary-300 transition-colors text-sm"
                >
                  Decline
                </button>
                <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                  View Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Growth Chart */}
      <div className="border border-primary-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-primary-900 mb-4">Connection Growth</h3>
        <div className="flex items-end space-x-4 h-40">
          {connectionGrowth.map((data, index) => (
            <div key={data.month} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-orange-500 rounded-t transition-all duration-500"
                style={{ height: `${(data.connections / 25) * 100}%` }}
              />
              <div className="mt-2 text-sm text-primary-600">{data.month}</div>
              <div className="text-xs text-primary-500">{data.connections}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-primary-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-600">Total Connections</p>
              <p className="text-2xl font-bold text-primary-900">{connections.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="border border-primary-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-600">Active Connections</p>
              <p className="text-2xl font-bold text-primary-900">
                {connections.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="border border-primary-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-600">Pending Requests</p>
              <p className="text-2xl font-bold text-primary-900">{connectionRequests.length}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="border border-primary-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-600">This Month</p>
              <p className="text-2xl font-bold text-primary-900">+{connectionGrowth[connectionGrowth.length - 1]?.connections - connectionGrowth[connectionGrowth.length - 2]?.connections || 0}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Business Type Breakdown */}
      <div className="border border-primary-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-primary-900 mb-4">Connection Types</h3>
        <div className="space-y-3">
          {Object.entries(
            connections.reduce((acc, connection) => {
              acc[connection.businessType] = (acc[connection.businessType] || 0) + 1
              return acc
            }, {})
          ).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between">
              <span className="text-sm text-primary-700">{type}</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-primary-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(count / connections.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-primary-900 w-8">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-primary-900">Connections Hub</h2>
            <p className="text-primary-600">Manage your store relationships and business connections</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-primary-600">
              {connectionRequests.length} pending requests
            </span>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-primary-100 rounded-lg p-1 mt-6">
          <button
            onClick={() => setActiveTab('connections')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'connections'
                ? 'bg-white text-primary-900 shadow-sm'
                : 'text-primary-600 hover:text-primary-900'
            }`}
          >
            Active Connections ({connections.filter(c => c.status === 'active').length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'requests'
                ? 'bg-white text-primary-900 shadow-sm'
                : 'text-primary-600 hover:text-primary-900'
            }`}
          >
            Requests ({connectionRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'analytics'
                ? 'bg-white text-primary-900 shadow-sm'
                : 'text-primary-600 hover:text-primary-900'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6">
        {activeTab === 'connections' && renderConnections()}
        {activeTab === 'requests' && renderConnectionRequests()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>
    </div>
  )
}

export default ConnectionsHub