import React, { useState } from 'react'

const ProducerHomeFeed = ({ producer }) => {
  const [postText, setPostText] = useState('')

  // Use real analytics data from producer profile
  const analytics = {
    views: producer?.total_views || 0,
    likes: producer?.total_likes || 0,
    connections: producer?.total_connections || 0
  }

  const activities = [
    {
      id: 1,
      type: 'comment',
      user: 'Green Valley Store',
      action: 'commented on your post',
      content: 'High quality organic vegetables!',
      time: '2 hours ago',
      avatar: 'GV'
    },
    {
      id: 2,
      type: 'like',
      user: 'Farm Fresh Lanka',
      action: 'liked your product',
      content: 'Premium Ceylon Tea',
      time: '4 hours ago',
      avatar: 'FF'
    },
    {
      id: 3,
      type: 'connection',
      user: 'Spice Garden Store',
      action: 'wants to connect',
      content: 'Interested in your spice products',
      time: '6 hours ago',
      avatar: 'SG'
    },
    {
      id: 4,
      type: 'connection',
      user: 'Healthy Foods Co.',
      action: 'connected with you',
      content: '',
      time: '1 day ago',
      avatar: 'HF'
    }
  ]

  const trendingInCategory = producer?.categories?.length > 0 ? producer.categories.map((category, index) => ({
    id: category.id,
    title: `${category.name} Market Trends`,
    engagement: `${Math.floor(Math.random() * 5000) + 1000} interactions`,
    trend: `+${Math.floor(Math.random() * 30) + 5}%`,
    category: category.name
  })) : [
    {
      id: 1,
      title: 'Organic Farming Practices',
      engagement: '2.5k interactions',
      trend: '+15%',
      category: 'Agriculture'
    },
    {
      id: 2,
      title: 'Ceylon Cinnamon Export Quality',
      engagement: '1.8k interactions',
      trend: '+22%',
      category: 'Spices'
    },
    {
      id: 3,
      title: 'Sustainable Tea Production',
      engagement: '3.2k interactions',
      trend: '+8%',
      category: 'Tea'
    }
  ]

  const connectionRequests = [
    {
      id: 1,
      store: 'Premium Organic Store',
      type: 'Retail Chain',
      products: 'Vegetables, Fruits',
      avatar: 'PO',
      mutual: 5
    },
    {
      id: 2,
      store: 'Export Quality Foods',
      type: 'Export Company',
      products: 'Spices, Tea',
      avatar: 'EQ',
      mutual: 12
    }
  ]

  const recommendations = [
    {
      id: 1,
      name: 'Lanka Spice Producer',
      category: 'Spices',
      connections: '2.1k',
      mutual: 8,
      avatar: 'LS'
    },
    {
      id: 2,
      name: 'Hill Country Tea Estate',
      category: 'Tea',
      connections: '5.3k',
      mutual: 15,
      avatar: 'HC'
    },
    {
      id: 3,
      name: 'Organic Vegetable Farm',
      category: 'Vegetables',
      connections: '1.8k',
      mutual: 6,
      avatar: 'OV'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Create Post Section */}
      <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            {producer?.avatar ? (
              <img 
                src={producer.avatar} 
                alt={producer.business_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-lg font-medium">
                {producer?.business_name?.charAt(0)?.toUpperCase() || 'P'}
              </span>
            )}
          </div>
          <div className="flex-1">
            <div className="bg-primary-50 rounded-full px-4 py-3 cursor-pointer hover:bg-primary-100 transition-colors">
              <p className="text-primary-500">What's happening in your farm today?</p>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex space-x-4">
                <button className="flex items-center space-x-2 text-primary-600 hover:text-orange-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Photo</span>
                </button>
                <button className="flex items-center space-x-2 text-primary-600 hover:text-orange-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Video</span>
                </button>
                <button className="flex items-center space-x-2 text-primary-600 hover:text-orange-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Location</span>
                </button>
              </div>
              <button className="bg-orange-600 text-white px-6 py-2 rounded-full hover:bg-orange-700 transition-colors font-medium">
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-primary-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-600">Total Views</p>
                  <p className="text-2xl font-bold text-primary-900">{analytics.views.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-primary-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-600">Total Likes</p>
                  <p className="text-2xl font-bold text-primary-900">{analytics.likes.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-primary-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-600">Connections</p>
                  <p className="text-2xl font-bold text-primary-900">{analytics.connections}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-primary-200">
            <div className="p-6 border-b border-primary-100">
              <h3 className="text-lg font-semibold text-primary-900">Recent Activity</h3>
            </div>
            <div className="divide-y divide-primary-100">
              {activities.map((activity) => (
                <div key={activity.id} className="p-6 hover:bg-primary-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">{activity.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-primary-900">{activity.user}</p>
                        <span className="text-primary-400">•</span>
                        <p className="text-xs text-primary-500">{activity.time}</p>
                      </div>
                      <p className="text-sm text-primary-600 mt-1">{activity.action}</p>
                      {activity.content && (
                        <p className="text-sm text-primary-800 mt-1 bg-primary-50 rounded px-2 py-1 inline-block">
                          "{activity.content}"
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {activity.type === 'connection' && (
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-orange-600 text-white text-xs rounded-full hover:bg-orange-700 transition-colors">
                            Accept
                          </button>
                          <button className="px-3 py-1 bg-primary-200 text-primary-700 text-xs rounded-full hover:bg-primary-300 transition-colors">
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Trending in Your Category */}
          <div className="bg-white rounded-xl shadow-sm border border-primary-200">
            <div className="p-6 border-b border-primary-100">
              <h3 className="text-lg font-semibold text-primary-900">Trending in Your Category</h3>
            </div>
            <div className="p-6 space-y-4">
              {trendingInCategory.map((trend) => (
                <div key={trend.id} className="cursor-pointer hover:bg-primary-50 rounded-lg p-3 -m-3 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-primary-900">{trend.title}</h4>
                      <p className="text-xs text-primary-500 mt-1">{trend.category}</p>
                      <p className="text-xs text-primary-600 mt-1">{trend.engagement}</p>
                    </div>
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      {trend.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connection Requests */}
          <div className="bg-white rounded-xl shadow-sm border border-primary-200">
            <div className="p-6 border-b border-primary-100">
              <h3 className="text-lg font-semibold text-primary-900">Connection Requests</h3>
            </div>
            <div className="p-6 space-y-4">
              {connectionRequests.map((request) => (
                <div key={request.id} className="border border-primary-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">{request.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-primary-900">{request.store}</h4>
                      <p className="text-xs text-primary-500">{request.type}</p>
                      <p className="text-xs text-primary-600 mt-1">Interested in: {request.products}</p>
                      <p className="text-xs text-primary-500 mt-1">{request.mutual} mutual connections</p>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <button className="flex-1 px-3 py-2 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700 transition-colors">
                      Accept
                    </button>
                    <button className="flex-1 px-3 py-2 bg-primary-200 text-primary-700 text-xs rounded-lg hover:bg-primary-300 transition-colors">
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Producers You Might Know */}
          <div className="bg-white rounded-xl shadow-sm border border-primary-200">
            <div className="p-6 border-b border-primary-100">
              <h3 className="text-lg font-semibold text-primary-900">Producers You Might Know</h3>
            </div>
            <div className="p-6 space-y-4">
              {recommendations.map((producer) => (
                <div key={producer.id} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-medium">{producer.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-primary-900">{producer.name}</h4>
                    <p className="text-xs text-primary-500">{producer.category} • {producer.connections} connections</p>
                    <p className="text-xs text-primary-600">{producer.mutual} mutual connections</p>
                  </div>
                  <button className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full hover:bg-orange-200 transition-colors">
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProducerHomeFeed