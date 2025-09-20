import React, { useState } from 'react'
import { useCategories } from '../../hooks/useCategories'
import PostCard from '../ui/PostCard'
import PostFormModal from '../ui/PostFormModal'

import React, { useState } from 'react'

const ContentManagement = ({ producer }) => {
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [filterBy, setFilterBy] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedPosts, setSelectedPosts] = useState([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [likedPosts, setLikedPosts] = useState(new Set())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [postsData, setPostsData] = useState([
    {
      id: 1,
      content: 'Today we harvested our premium organic vegetables including tomatoes, carrots, and leafy greens. Fresh from the farm to your table! 🥕🍅',
      category: 'Vegetables',
      producer: {
        avatar: 'FV',
        name: 'Fresh Valley Farm',
        location: 'Kandy, Sri Lanka',
        verified: true
      },
      images: ['/api/placeholder/400/300'],
      likes: 89,
      comments: 23,
      timeAgo: '3d',
      trending: false,
      popularity: 85,
      status: 'published'
    },
    {
      id: 2,
      content: 'Behind the scenes of our premium Ceylon cinnamon processing facility. Witness the traditional methods we use to bring you the finest spices! ✨',
      category: 'Spices',
      producer: {
        avatar: 'CS',
        name: 'Ceylon Spice Co.',
        location: 'Colombo, Sri Lanka',
        verified: true
      },
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      likes: 156,
      comments: 34,
      timeAgo: '5d',
      trending: true,
      popularity: 92,
      status: 'published'
    },
    {
      id: 3,
      content: 'The beautiful morning mist over our tea estate in the hill country. There\'s nothing quite like starting the day with this view! 🌄',
      category: 'Tea',
      producer: {
        avatar: 'HT',
        name: 'Highland Tea Estate',
        location: 'Nuwara Eliya, Sri Lanka',
        verified: false
      },
      images: ['/api/placeholder/400/300'],
      likes: 67,
      comments: 15,
      timeAgo: '1w',
      trending: false,
      popularity: 74,
      status: 'published'
    },
    {
      id: 4,
      content: 'Our mango trees are ready for harvest next week. Premium quality fruits coming soon! Get ready for the sweetest mangoes you\'ve ever tasted 🥭',
      category: 'Fruits',
      producer: {
        avatar: 'MO',
        name: 'Mango Orchard Ltd',
        location: 'Matale, Sri Lanka',
        verified: false
      },
      images: [],
      likes: 12,
      comments: 3,
      timeAgo: '2w',
      trending: false,
      popularity: 45,
      status: 'draft'
    },
    {
      id: 5,
      content: 'Traditional method of extracting pure coconut oil from fresh coconuts. Preserving ancient techniques for modern quality standards.',
      category: 'Coconut Products',
      producer: {
        avatar: 'CP',
        name: 'Coconut Paradise',
        location: 'Galle, Sri Lanka',
        verified: true
      },
      images: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300'],
      likes: 234,
      comments: 56,
      timeAgo: '3w',
      trending: false,
      popularity: 88,
      status: 'archived'
    }
  ])

  const filterOptions = [
    { value: 'all', label: 'All Posts' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Drafts' },
    { value: 'archived', label: 'Archived' }
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'most_engaged', label: 'Most Engaged' },
    { value: 'least_engaged', label: 'Least Engaged' }
  ]

  // Get categories from API
  const { categories: apiCategories, loading: categoriesLoading } = useCategories()
  
  // Transform categories for filtering (add "All Categories" option)
  const categories = React.useMemo(() => {
    if (categoriesLoading || !apiCategories.length) {
      // Fallback categories while loading or if API fails
      return ['All Categories', 'Vegetables', 'Spices', 'Tea', 'Fruits', 'Coconut Products']
    }
    
    const categoryNames = ['All Categories', ...apiCategories.map(cat => cat.name)]
    return categoryNames
  }, [apiCategories, categoriesLoading])

  const filteredPosts = postsData.filter(post => {
    if (filterBy === 'all') return true
    return post.status === filterBy
  })

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        // Sort by timeAgo (convert to days for comparison)
        const timeTodays = (timeAgo) => {
          const num = parseInt(timeAgo);
          if (timeAgo.includes('d')) return num;
          if (timeAgo.includes('w')) return num * 7;
          if (timeAgo.includes('h')) return 0;
          return 999; // for very old posts
        };
        return timeTodays(a.timeAgo) - timeTodays(b.timeAgo);
      case 'oldest':
        const timeTodays2 = (timeAgo) => {
          const num = parseInt(timeAgo);
          if (timeAgo.includes('d')) return num;
          if (timeAgo.includes('w')) return num * 7;
          if (timeAgo.includes('h')) return 0;
          return 999;
        };
        return timeTodays2(b.timeAgo) - timeTodays2(a.timeAgo);
      case 'most_engaged':
        return (b.likes + b.comments) - (a.likes + a.comments);
      case 'least_engaged':
        return (a.likes + a.comments) - (b.likes + b.comments);
      default:
        return 0;
    }
  })

  const handleSelectPost = (postId) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    )
  }

  const handleSelectAll = () => {
    if (selectedPosts.length === sortedPosts.length) {
      setSelectedPosts([])
    } else {
      setSelectedPosts(sortedPosts.map(post => post.id))
    }
  }

  const handleBulkAction = (action) => {
    console.log(`Bulk action: ${action} on posts:`, selectedPosts)
    setSelectedPosts([])
    setShowBulkActions(false)
  }

  const handleLike = (postId) => {
    const newLikedPosts = new Set(likedPosts)
    if (newLikedPosts.has(postId)) {
      newLikedPosts.delete(postId)
    } else {
      newLikedPosts.add(postId)
    }
    setLikedPosts(newLikedPosts)
  }

  const handleContactProducer = (producer) => {
    console.log('Contacting producer:', producer.name)
  }

  const handleCreatePost = () => {
    setEditingPost(null)
    setIsModalOpen(true)
  }

  const handleEditPost = (post) => {
    setEditingPost(post)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingPost(null)
  }

  const handlePostSubmit = (postData) => {
    if (editingPost) {
      // Edit existing post
      setPostsData(prev => prev.map(post => 
        post.id === editingPost.id ? { ...postData, id: editingPost.id } : post
      ))
    } else {
      // Create new post
      const newPost = {
        ...postData,
        id: Date.now(),
        producer: {
          avatar: 'YF',
          name: 'Your Farm',
          location: 'Your Location',
          verified: false
        },
        likes: 0,
        comments: 0,
        timeAgo: '0h',
        trending: false,
        popularity: 0
      }
      setPostsData(prev => [newPost, ...prev])
    }
  }

  const getStatusBadge = (status) => {
    const statusStyles = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-primary-900">Content Management</h2>
            <p className="text-primary-600">Manage all your posts and content</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Create New Post Button */}
            <button
              onClick={handleCreatePost}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create New Post</span>
            </button>
            
            {/* View Mode Toggle */}
            <div className="flex bg-primary-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-primary-900 shadow-sm' 
                    : 'text-primary-600 hover:text-primary-900'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-primary-900 shadow-sm' 
                    : 'text-primary-600 hover:text-primary-900'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {/* Create New Post Button */}
            <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
              Create New Post
            </button>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mt-6 pt-6 border-t border-primary-100">
          <div className="flex items-center space-x-4 flex-1">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedPosts.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-primary-600">{selectedPosts.length} selected</span>
              <div className="relative">
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="bg-primary-100 text-primary-700 px-3 py-2 rounded-lg hover:bg-primary-200 transition-colors"
                >
                  Bulk Actions
                </button>
                {showBulkActions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-primary-200 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => handleBulkAction('publish')}
                      className="w-full text-left px-4 py-2 hover:bg-primary-50 transition-colors"
                    >
                      Publish Selected
                    </button>
                    <button
                      onClick={() => handleBulkAction('draft')}
                      className="w-full text-left px-4 py-2 hover:bg-primary-50 transition-colors"
                    >
                      Move to Draft
                    </button>
                    <button
                      onClick={() => handleBulkAction('archive')}
                      className="w-full text-left px-4 py-2 hover:bg-primary-50 transition-colors"
                    >
                      Archive Selected
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="w-full text-left px-4 py-2 hover:bg-error-50 text-error-600 transition-colors"
                    >
                      Delete Selected
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Posts Grid/List */}
      <div className="bg-white rounded-xl shadow-sm border border-primary-200">
        {/* Select All Header */}
        <div className="p-4 border-b border-primary-100">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedPosts.length === sortedPosts.length && sortedPosts.length > 0}
              onChange={handleSelectAll}
              className="text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm font-medium text-primary-700">
              Select All ({sortedPosts.length} posts)
            </span>
          </label>
        </div>

        {/* Content */}
        {viewMode === 'grid' ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPosts.map(post => (
              <div key={post.id} className="space-y-4">
                {/* Selection Checkbox and Status */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.id)}
                      onChange={() => handleSelectPost(post.id)}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-primary-600">Select</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditPost(post)}
                      className="p-1 text-primary-600 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                      title="Edit post"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    {getStatusBadge(post.status)}
                  </div>
                </div>
                
                {/* PostCard */}
                <PostCard
                  post={post}
                  onLike={handleLike}
                  onContactProducer={handleContactProducer}
                  isLiked={likedPosts.has(post.id)}
                  showContactButton={false}
                  showProducerHeader={false}
                  size="compact"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-primary-100">
            {sortedPosts.map(post => (
              <div key={post.id} className="p-6 hover:bg-primary-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="flex flex-col items-center space-y-2 pt-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedPosts.includes(post.id)}
                        onChange={() => handleSelectPost(post.id)}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                    </label>
                    <button
                      onClick={() => handleEditPost(post)}
                      className="p-1 text-primary-600 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                      title="Edit post"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    {getStatusBadge(post.status)}
                  </div>
                  
                  <div className="flex-1">
                    <PostCard
                      post={post}
                      onLike={handleLike}
                      onContactProducer={handleContactProducer}
                      isLiked={likedPosts.has(post.id)}
                      showContactButton={false}
                      showProducerHeader={false}
                      size="default"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Post Form Modal */}
      <PostFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handlePostSubmit}
        post={editingPost}
        mode={editingPost ? 'edit' : 'create'}
      />
    </div>
  )
}

export default ContentManagement