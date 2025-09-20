import React, { useState } from 'react'

const AnalyticsDashboard = ({ producer }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30days')
  const [selectedMetric, setSelectedMetric] = useState('views')

  // Use real analytics data from producer, with fallbacks
  const overviewStats = {
    totalViews: producer?.total_views || 0,
    totalLikes: producer?.total_likes || 0,
    totalComments: producer?.total_comments || 0,
    totalConnections: producer?.total_connections || 0,
    viewsChange: 12.5, // These would come from API comparing periods
    likesChange: 8.3,
    commentsChange: -2.1,
    connectionsChange: 15.7
  }

  const topPosts = [
    {
      id: 1,
      title: 'Ceylon Cinnamon Processing Methods',
      views: 8500,
      likes: 450,
      comments: 120,
      shares: 89,
      engagement: 7.8,
      category: 'Spices',
      date: '2024-01-12'
    },
    {
      id: 2,
      title: 'Organic Vegetable Farming Tips',
      views: 6200,
      likes: 380,
      comments: 95,
      shares: 67,
      engagement: 8.7,
      category: 'Vegetables',
      date: '2024-01-10'
    },
    {
      id: 3,
      title: 'Tea Estate Morning Views',
      views: 5800,
      likes: 290,
      comments: 78,
      shares: 45,
      engagement: 7.1,
      category: 'Tea',
      date: '2024-01-08'
    },
    {
      id: 4,
      title: 'Premium Coconut Oil Production',
      views: 4900,
      likes: 320,
      comments: 85,
      shares: 52,
      engagement: 9.3,
      category: 'Coconut Products',
      date: '2024-01-06'
    }
  ]

  const audienceData = {
    demographics: {
      locations: [
        { location: 'Colombo', percentage: 35, count: 1260 },
        { location: 'Kandy', percentage: 18, count: 648 },
        { location: 'Galle', percentage: 15, count: 540 },
        { location: 'Negombo', percentage: 12, count: 432 },
        { location: 'Other', percentage: 20, count: 720 }
      ],
      businessTypes: [
        { type: 'Retail Stores', percentage: 45, count: 1620 },
        { type: 'Export Companies', percentage: 25, count: 900 },
        { type: 'Restaurants', percentage: 15, count: 540 },
        { type: 'Wholesalers', percentage: 10, count: 360 },
        { type: 'Other', percentage: 5, count: 180 }
      ]
    },
    engagement: {
      bestTimes: [
        { time: '8 AM', engagement: 85 },
        { time: '12 PM', engagement: 92 },
        { time: '2 PM', engagement: 78 },
        { time: '6 PM', engagement: 95 },
        { time: '8 PM', engagement: 88 }
      ],
      bestDays: [
        { day: 'Monday', engagement: 78 },
        { day: 'Tuesday', engagement: 85 },
        { day: 'Wednesday', engagement: 92 },
        { day: 'Thursday', engagement: 88 },
        { day: 'Friday', engagement: 82 },
        { day: 'Saturday', engagement: 75 },
        { day: 'Sunday', engagement: 70 }
      ]
    }
  }

  const categoryPerformance = [
    { category: 'Spices', posts: 15, views: 18500, engagement: 8.2, growth: 15.3 },
    { category: 'Tea', posts: 12, views: 14200, engagement: 7.8, growth: 12.1 },
    { category: 'Vegetables', posts: 18, views: 16800, engagement: 7.5, growth: 8.7 },
    { category: 'Coconut Products', posts: 8, views: 9200, engagement: 9.1, growth: 22.4 },
    { category: 'Fruits', posts: 6, views: 5800, engagement: 6.9, growth: 5.2 }
  ]

  const growthData = [
    { month: 'Aug', connections: 98 },
    { month: 'Sep', connections: 145 },
    { month: 'Oct', connections: 182 },
    { month: 'Nov', connections: 203 },
    { month: 'Dec', connections: 228 },
    { month: 'Jan', connections: 258 }
  ]

  const timeRanges = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 3 Months' },
    { value: '1year', label: 'Last Year' }
  ]

  const getChangeIcon = (change) => {
    if (change > 0) {
      return (
        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
        </svg>
      )
    } else {
      return (
        <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
        </svg>
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-primary-900">Analytics Dashboard</h2>
            <p className="text-primary-600">Track your content performance and audience insights</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
            
            <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-primary-600">Total Views</h3>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-primary-900">{overviewStats.totalViews.toLocaleString()}</p>
              <div className="flex items-center space-x-1 mt-1">
                {getChangeIcon(overviewStats.viewsChange)}
                <span className={`text-sm font-medium ${overviewStats.viewsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(overviewStats.viewsChange)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-primary-600">Total Likes</h3>
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-primary-900">{overviewStats.totalLikes.toLocaleString()}</p>
              <div className="flex items-center space-x-1 mt-1">
                {getChangeIcon(overviewStats.likesChange)}
                <span className={`text-sm font-medium ${overviewStats.likesChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(overviewStats.likesChange)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-primary-600">Total Comments</h3>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-primary-900">{overviewStats.totalComments}</p>
              <div className="flex items-center space-x-1 mt-1">
                {getChangeIcon(overviewStats.commentsChange)}
                <span className={`text-sm font-medium ${overviewStats.commentsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(overviewStats.commentsChange)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-primary-600">Total Connections</h3>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-primary-900">{overviewStats.totalConnections}</p>
              <div className="flex items-center space-x-1 mt-1">
                {getChangeIcon(overviewStats.connectionsChange)}
                <span className={`text-sm font-medium ${overviewStats.connectionsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(overviewStats.connectionsChange)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">Connection Growth</h3>
          <div className="space-y-4">
            <div className="flex items-end space-x-2 h-40">
              {growthData.map((data, index) => (
                <div key={data.month} className="flex-1 flex flex-col items-center">
                  <div className="w-full relative">
                    <div
                      className="w-full bg-orange-500 rounded-t transition-all duration-500"
                      style={{ height: `${(data.connections / 258) * 120}px` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-primary-600">{data.month}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded" />
                <span className="text-primary-600">Connections</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Posts */}
        <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">Top Performing Posts</h3>
          <div className="space-y-4">
            {topPosts.slice(0, 4).map((post, index) => (
              <div key={post.id} className="flex items-center space-x-3 p-3 hover:bg-primary-50 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-600 font-medium text-sm">#{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-primary-900 line-clamp-1">{post.title}</h4>
                  <div className="flex items-center space-x-3 text-xs text-primary-500 mt-1">
                    <span>{post.views.toLocaleString()} views</span>
                    <span>{post.engagement}% engagement</span>
                    <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audience Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">Audience by Location</h3>
          <div className="space-y-4">
            {audienceData.demographics.locations.map((location) => (
              <div key={location.location} className="flex items-center justify-between">
                <span className="text-sm text-primary-700">{location.location}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-primary-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${location.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-primary-900 w-12 text-right">
                    {location.percentage}%
                  </span>
                  <span className="text-xs text-primary-500 w-16 text-right">
                    ({location.count})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">Audience by Business Type</h3>
          <div className="space-y-4">
            {audienceData.demographics.businessTypes.map((type) => (
              <div key={type.type} className="flex items-center justify-between">
                <span className="text-sm text-primary-700">{type.type}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-primary-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${type.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-primary-900 w-12 text-right">
                    {type.percentage}%
                  </span>
                  <span className="text-xs text-primary-500 w-16 text-right">
                    ({type.count})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Engagement Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">Best Posting Times</h3>
          <div className="space-y-3">
            {audienceData.engagement.bestTimes.map((time) => (
              <div key={time.time} className="flex items-center space-x-3">
                <span className="text-sm font-medium text-primary-700 w-16">{time.time}</span>
                <div className="flex-1 bg-primary-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${time.engagement}%` }}
                  >
                    <span className="text-xs text-white font-medium">{time.engagement}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">Best Posting Days</h3>
          <div className="space-y-3">
            {audienceData.engagement.bestDays.map((day) => (
              <div key={day.day} className="flex items-center space-x-3">
                <span className="text-sm font-medium text-primary-700 w-20">{day.day}</span>
                <div className="flex-1 bg-primary-200 rounded-full h-3">
                  <div
                    className="bg-purple-500 h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${day.engagement}%` }}
                  >
                    <span className="text-xs text-white font-medium">{day.engagement}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6">
        <h3 className="text-lg font-semibold text-primary-900 mb-6">Category Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary-200">
                <th className="text-left py-3 px-4 font-medium text-primary-700">Category</th>
                <th className="text-left py-3 px-4 font-medium text-primary-700">Posts</th>
                <th className="text-left py-3 px-4 font-medium text-primary-700">Total Views</th>
                <th className="text-left py-3 px-4 font-medium text-primary-700">Avg Engagement</th>
                <th className="text-left py-3 px-4 font-medium text-primary-700">Growth</th>
              </tr>
            </thead>
            <tbody>
              {categoryPerformance.map((category) => (
                <tr key={category.category} className="border-b border-primary-100 hover:bg-primary-50 transition-colors">
                  <td className="py-4 px-4">
                    <span className="font-medium text-primary-900">{category.category}</span>
                  </td>
                  <td className="py-4 px-4 text-primary-600">{category.posts}</td>
                  <td className="py-4 px-4 text-primary-600">{category.views.toLocaleString()}</td>
                  <td className="py-4 px-4 text-primary-600">{category.engagement}%</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-1">
                      {getChangeIcon(category.growth)}
                      <span className={`font-medium ${category.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {category.growth}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard