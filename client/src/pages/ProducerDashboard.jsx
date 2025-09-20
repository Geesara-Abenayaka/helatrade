import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/ui/Header'
import Footer from '../components/ui/Footer'
import ProducerHomeFeed from '../components/producer/ProducerHomeFeed'
import ContentManagement from '../components/producer/ContentManagement'
import ProductsSection from '../components/producer/ProductsSection'
import ConnectionsHub from '../components/producer/ConnectionsHub'
import AnalyticsDashboard from '../components/producer/AnalyticsDashboard'
import EditProfile from '../components/producer/EditProfile'

const ProducerDashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('home')
  const [producer, setProducer] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication and get producer data
    const token = localStorage.getItem('authToken')
    const userType = localStorage.getItem('userType')
    const userData = localStorage.getItem('userData')

    if (!token || userType !== 'producer') {
      // Redirect to login if not authenticated as producer
      navigate('/login')
      return
    }

    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData)
        setProducer(parsedUserData)
      } catch (error) {
        console.error('Error parsing user data:', error)
        navigate('/login')
        return
      }
    }

    setIsLoading(false)
  }, [navigate])

  // Listen for profile tab selection from header
  useEffect(() => {
    const handleSelectProfileTab = () => {
      setActiveTab('profile')
    }

    window.addEventListener('selectProfileTab', handleSelectProfileTab)
    return () => {
      window.removeEventListener('selectProfileTab', handleSelectProfileTab)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userType')
    localStorage.removeItem('userData')
    navigate('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-primary-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!producer) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-primary-600">Unable to load producer data</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'home', label: 'Home Feed', icon: 'home' },
    { id: 'content', label: 'Posts', icon: 'folder' },
    { id: 'products', label: 'Products', icon: 'package' },
    { id: 'connections', label: 'Connections', icon: 'users' },
    { id: 'analytics', label: 'Analytics', icon: 'chart' },
    { id: 'profile', label: 'Edit Profile', icon: 'settings' },
  ]

  const getTabIcon = (iconType) => {
    const icons = {
      home: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L9 5.414V17a1 1 0 102 0V5.414l5.293 5.293a1 1 0 001.414-1.414l-7-7z"/>
        </svg>
      ),
      plus: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      ),
      folder: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>
      ),
      package: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1-2H8l-1 2H5V5z" clipRule="evenodd" />
        </svg>
      ),
      users: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
      chart: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      ),
      settings: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      )
    }
    return icons[iconType] || icons.home
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <ProducerHomeFeed producer={producer} />
      case 'content':
        return <ContentManagement producer={producer} />
      case 'products':
        return <ProductsSection producer={producer} />
      case 'connections':
        return <ConnectionsHub producer={producer} />
      case 'analytics':
        return <AnalyticsDashboard producer={producer} />
      case 'profile':
        return <EditProfile producer={producer} />
      default:
        return <ProducerHomeFeed producer={producer} />
    }
  }

  return (
    <div className="min-h-screen bg-primary-50">
      <Header />
      
      <div className="max-w-7xlxx mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-900">Producer Dashboard</h1>
              <p className="text-primary-600 mt-1">Welcome back, {producer.owner_name || producer.business_name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 border rounded-lg transition-colors text-sm ${
                  activeTab === 'profile'
                    ? 'border-orange-500 text-orange-700 bg-orange-50'
                    : 'border-primary-300 text-primary-700 hover:bg-primary-50'
                }`}
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm"
              >
                Logout
              </button>
              <div className="text-right">
                <p className="text-sm font-medium text-primary-900">{producer.business_name}</p>
                <p className="text-xs text-orange-600">
                  {producer.verified ? 'Verified Producer' : 'Producer'} • {producer.status}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center overflow-hidden">
                {producer.avatar ? (
                  <img 
                    src={producer.avatar} 
                    alt={producer.business_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-lg font-medium">
                    {producer.business_name?.charAt(0)?.toUpperCase() || 'P'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Producer Profile Summary Card */}
          <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-primary-200">
            <div className="flex items-start space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center overflow-hidden">
                {producer.avatar ? (
                  <img 
                    src={producer.avatar} 
                    alt={producer.business_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-2xl font-medium">
                    {producer.business_name?.charAt(0)?.toUpperCase() || 'P'}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-xl font-semibold text-primary-900">{producer.business_name}</h2>
                  {producer.verified && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-primary-600 mb-2">{producer.owner_name}</p>
                {producer.bio && (
                  <p className="text-primary-700 mb-3">{producer.bio}</p>
                )}
                <div className="flex items-center space-x-4 text-sm text-primary-600">
                  {producer.location && (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {producer.location}, {producer.province}
                    </span>
                  )}
                  {producer.categories && producer.categories.length > 0 && (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      {producer.categories.map(cat => cat.name).join(', ')}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-6 mt-4">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-primary-900">{producer.total_views || 0}</p>
                    <p className="text-xs text-primary-600">Profile Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-primary-900">{producer.total_connections || 0}</p>
                    <p className="text-xs text-primary-600">Connections</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-primary-900">{producer.total_likes || 0}</p>
                    <p className="text-xs text-primary-600">Total Likes</p>
                  </div>
                  {producer.rating && (
                    <div className="text-center">
                      <p className="text-lg font-semibold text-primary-900">{producer.rating}/5</p>
                      <p className="text-xs text-primary-600">Rating</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white rounded-xl p-2 shadow-sm border border-primary-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-orange-100 text-orange-700 shadow-sm'
                    : 'text-primary-600 hover:text-orange-600 hover:bg-primary-50'
                }`}
              >
                {getTabIcon(tab.icon)}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Content */}
        <div className="min-h-[600px]">
          {renderContent()}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ProducerDashboard