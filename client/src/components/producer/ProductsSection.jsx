import React, { useState } from 'react'
import { useCategories } from '../../hooks/useCategories'
import ProductCard from '../ui/ProductCard'


const ProductsSection = ({ producer }) => {
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showEditProduct, setShowEditProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [filterCategory, setFilterCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    image: '',
    rating: 4.5,
    inStock: true,
    isOrganic: false,
    isFeatured: false,
    minOrder: ''
  })

  // Mock products data
  const products = [
    {
      id: 1,
      name: 'Premium Ceylon Tea',
      description: 'High-quality Ceylon tea from the hill country, perfect for export.',
      category: 'Tea',
      price: 450,
      unit: 'per kg',
      stock: 500,
      minOrder: 10,
      images: ['/api/placeholder/200/200', '/api/placeholder/200/200'],
      tags: ['premium', 'ceylon', 'export-quality'],
      availability: 'in-stock',
      createdAt: '2024-01-15',
      analytics: { views: 1200, inquiries: 45, connections: 12 },
      linkedPosts: 3
    },
    {
      id: 2,
      name: 'Organic Cinnamon Sticks',
      description: 'Authentic Ceylon cinnamon sticks, organically grown and processed.',
      category: 'Spices',
      price: 1200,
      unit: 'per kg',
      stock: 150,
      minOrder: 5,
      images: ['/api/placeholder/200/200'],
      tags: ['organic', 'cinnamon', 'authentic'],
      availability: 'in-stock',
      createdAt: '2024-01-12',
      analytics: { views: 890, inquiries: 23, connections: 8 },
      linkedPosts: 2
    },
    {
      id: 3,
      name: 'Fresh Vegetable Mix',
      description: 'Seasonal vegetable mix including tomatoes, carrots, and leafy greens.',
      category: 'Vegetables',
      price: 180,
      unit: 'per kg',
      stock: 0,
      minOrder: 20,
      images: ['/api/placeholder/200/200', '/api/placeholder/200/200', '/api/placeholder/200/200'],
      tags: ['fresh', 'seasonal', 'mixed'],
      availability: 'out-of-stock',
      createdAt: '2024-01-10',
      analytics: { views: 650, inquiries: 18, connections: 5 },
      linkedPosts: 1
    },
    {
      id: 4,
      name: 'Premium Coconut Oil',
      description: 'Pure virgin coconut oil extracted using traditional methods.',
      category: 'Coconut Products',
      price: 800,
      unit: 'per liter',
      stock: 200,
      minOrder: 10,
      images: ['/api/placeholder/200/200'],
      tags: ['virgin', 'traditional', 'pure'],
      availability: 'limited',
      createdAt: '2024-01-08',
      analytics: { views: 1450, inquiries: 67, connections: 15 },
      linkedPosts: 4
    }
  ]

  // Get categories from API
  const { categories: apiCategories, loading: categoriesLoading } = useCategories()
  
  // Transform categories for dropdown (add "All Categories" option)
  const categories = React.useMemo(() => {
    if (categoriesLoading || !apiCategories.length) {
      // Fallback categories while loading or if API fails
      return ['All Categories', 'Tea', 'Spices', 'Vegetables', 'Fruits', 'Coconut Products', 'Other']
    }
    
    const categoryNames = ['All Categories', ...apiCategories.map(cat => cat.name), 'Other']
    return categoryNames
  }, [apiCategories, categoriesLoading])

  // Transform products to match ProductCard expected format
  const transformProductForCard = (product) => ({
    name: product.name,
    description: product.description,
    image: product.images[0], // ProductCard expects single image
    price: `Rs. ${product.price} ${product.unit}`,
    category: product.category,
    rating: 4.5, // Default rating since original doesn't have this
    inStock: product.availability === 'in-stock',
    isOrganic: product.tags.includes('organic'),
    isFeatured: product.tags.includes('premium'),
    minOrder: `${product.minOrder} kg`
  })

  const filteredProducts = products.filter(product => {
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt)
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt)
      case 'price-high':
        return b.price - a.price
      case 'price-low':
        return a.price - b.price
      case 'most-viewed':
        return b.analytics.views - a.analytics.views
      default:
        return 0
    }
  })

  const handleAddProduct = () => {
    // Validate required fields
    if (!newProduct.name.trim()) {
      alert('Please enter a product name');
      return;
    }
    if (!newProduct.category) {
      alert('Please select a category');
      return;
    }
    if (!newProduct.price.trim()) {
      alert('Please enter a price');
      return;
    }
    if (!newProduct.image.trim()) {
      alert('Please enter an image URL');
      return;
    }

    // Create new product with ProductCard-compatible structure
    const productToAdd = {
      id: Date.now(), // Simple ID generation
      ...newProduct,
      // Keep original data structure for compatibility with existing code
      originalData: {
        price: parseFloat(newProduct.price.replace(/[^\d.]/g, '')), // Extract numeric value
        unit: 'per kg', // Default unit
        stock: newProduct.inStock ? 100 : 0, // Default stock
        images: [newProduct.image], // Convert single image to array
        tags: [
          ...(newProduct.isOrganic ? ['organic'] : []),
          ...(newProduct.isFeatured ? ['premium'] : [])
        ],
        availability: newProduct.inStock ? 'in-stock' : 'out-of-stock',
        createdAt: new Date().toISOString(),
        analytics: { views: 0, inquiries: 0, connections: 0 },
        linkedPosts: 0
      }
    };

    console.log('Adding product:', productToAdd);
    
    // Here you would typically send the product to your backend API
    // For now, we'll just log it
    
    // Close modal and reset form
    setShowAddProduct(false);
    setNewProduct({
      name: '',
      description: '',
      category: '',
      price: '',
      image: '',
      rating: 4.5,
      inStock: true,
      isOrganic: false,
      isFeatured: false,
      minOrder: ''
    });
    
    // Show success message
    alert('Product added successfully!');
  }

  // Handlers for ProductCard component
  const handleProductContact = (product) => {
    console.log('Contact for product:', product)
    // Handle contact functionality - could open a modal or navigate to contact page
  }

  const handleProductDetails = (product) => {
    console.log('View details for product:', product)
    // Handle view details functionality - could open a modal or navigate to details page
  }

  const handleEditProduct = (product) => {
    // Transform product back to form format
    setNewProduct({
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      price: `Rs. ${product.price} ${product.unit}` || '',
      image: product.images && product.images[0] ? product.images[0] : '',
      rating: 4.5,
      inStock: product.availability === 'in-stock',
      isOrganic: product.tags && product.tags.includes('organic'),
      isFeatured: product.tags && product.tags.includes('premium'),
      minOrder: `${product.minOrder} kg` || ''
    });
    setEditingProduct(product);
    setShowEditProduct(true);
  }

  const handleUpdateProduct = () => {
    // Validate required fields
    if (!newProduct.name.trim()) {
      alert('Please enter a product name');
      return;
    }
    if (!newProduct.category) {
      alert('Please select a category');
      return;
    }
    if (!newProduct.price.trim()) {
      alert('Please enter a price');
      return;
    }
    if (!newProduct.image.trim()) {
      alert('Please enter an image URL');
      return;
    }

    console.log('Updating product:', editingProduct.id, 'with data:', newProduct);
    
    // Here you would typically send the updated product to your backend API
    
    // Close modal and reset form
    setShowEditProduct(false);
    setEditingProduct(null);
    setNewProduct({
      name: '',
      description: '',
      category: '',
      price: '',
      image: '',
      rating: 4.5,
      inStock: true,
      isOrganic: false,
      isFeatured: false,
      minOrder: ''
    });
    
    // Show success message
    alert('Product updated successfully!');
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-primary-900">Products Catalog</h2>
            <p className="text-primary-600">Manage your product listings and inventory</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* View Toggle */}
            <div className="flex bg-primary-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-primary-900 shadow-sm' 
                    : 'text-primary-600 hover:text-primary-900'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-primary-900 shadow-sm' 
                    : 'text-primary-600 hover:text-primary-900'
                }`}
              >
                List
              </button>
            </div>
            
            <button
              onClick={() => setShowAddProduct(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Add Product
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mt-6 pt-6 border-t border-primary-100">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 w-full border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            {categories.map(category => (
              <option key={category} value={category === 'All Categories' ? 'all' : category}>
                {category}
              </option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-high">Price: High to Low</option>
            <option value="price-low">Price: Low to High</option>
            <option value="most-viewed">Most Viewed</option>
          </select>
        </div>
      </div>

      {/* Products Grid/List */}
      <div className="bg-white rounded-xl shadow-sm border border-primary-200">
        {viewMode === 'grid' ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map(product => (
              <div key={product.id} className="relative">
                <ProductCard
                  product={transformProductForCard(product)}
                  onContact={handleProductContact}
                  onDetails={handleProductDetails}
                  showContactButton={false} // Hide contact button for producer's own products
                  showDetailsButton={true}
                  size="default"
                />
                {/* Edit Button Overlay */}
                <button
                  onClick={() => handleEditProduct(product)}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white text-primary-600 hover:text-orange-600 p-2 rounded-full shadow-md transition-all duration-200 transform hover:scale-105"
                  title="Edit Product"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-primary-100">
            {sortedProducts.map(product => {
              const cardProduct = transformProductForCard(product)
              return (
                <div key={product.id} className="p-6 hover:bg-primary-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-primary-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={cardProduct.image} 
                        alt={cardProduct.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-primary-900">{cardProduct.name}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              cardProduct.inStock 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {cardProduct.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>
                          <p className="text-sm text-primary-600 mb-2">{cardProduct.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-primary-500 mb-2">
                            <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs">
                              {cardProduct.category}
                            </span>
                            <span className="font-medium">{cardProduct.price}</span>
                            <span>Min Order: {cardProduct.minOrder}</span>
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-sm text-primary-600 font-medium">{cardProduct.rating}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-primary-500">
                            {cardProduct.isOrganic && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 font-medium rounded-full">
                                Organic
                              </span>
                            )}
                            {cardProduct.isFeatured && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 font-medium rounded-full">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="p-2 text-primary-600 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                            title="Edit Product"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleProductDetails(cardProduct)}
                            className="p-2 text-primary-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-primary-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-primary-900">Add New Product</h3>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="text-primary-400 hover:text-primary-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Category *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.slice(1).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Describe your product..."
                />
              </div>

              {/* Pricing & Orders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Price *</label>
                  <input
                    type="text"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., Rs. 450 per kg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Minimum Order</label>
                  <input
                    type="text"
                    value={newProduct.minOrder}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, minOrder: e.target.value }))}
                    className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., 10 kg"
                  />
                </div>
              </div>

              {/* Product Image */}
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Product Image *</label>
                <input
                  type="url"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter image URL"
                  required
                />
                {newProduct.image && (
                  <div className="mt-2">
                    <img 
                      src={newProduct.image} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-lg border border-primary-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Product Status & Features */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-3">Product Status</label>
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="inStock"
                        checked={newProduct.inStock === true}
                        onChange={() => setNewProduct(prev => ({ ...prev, inStock: true }))}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-primary-900">In Stock</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="inStock"
                        checked={newProduct.inStock === false}
                        onChange={() => setNewProduct(prev => ({ ...prev, inStock: false }))}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-primary-900">Out of Stock</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-3">Product Features</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProduct.isOrganic}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, isOrganic: e.target.checked }))}
                        className="text-orange-600 focus:ring-orange-500 rounded"
                      />
                      <span className="text-sm text-primary-900">Organic Product</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProduct.isFeatured}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, isFeatured: e.target.checked }))}
                        className="text-orange-600 focus:ring-orange-500 rounded"
                      />
                      <span className="text-sm text-primary-900">Featured Product</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-primary-100 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddProduct(false)}
                className="px-4 py-2 border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-primary-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-primary-900">Edit Product</h3>
                <button
                  onClick={() => {
                    setShowEditProduct(false);
                    setEditingProduct(null);
                    setNewProduct({
                      name: '',
                      description: '',
                      category: '',
                      price: '',
                      image: '',
                      rating: 4.5,
                      inStock: true,
                      isOrganic: false,
                      isFeatured: false,
                      minOrder: ''
                    });
                  }}
                  className="text-primary-400 hover:text-primary-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Category *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.slice(1).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Describe your product..."
                />
              </div>

              {/* Pricing & Orders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Price *</label>
                  <input
                    type="text"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., Rs. 450 per kg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Minimum Order</label>
                  <input
                    type="text"
                    value={newProduct.minOrder}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, minOrder: e.target.value }))}
                    className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., 10 kg"
                  />
                </div>
              </div>

              {/* Product Image */}
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Product Image *</label>
                <input
                  type="url"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter image URL"
                  required
                />
                {newProduct.image && (
                  <div className="mt-2">
                    <img 
                      src={newProduct.image} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-lg border border-primary-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Product Status & Features */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-3">Product Status</label>
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="inStock"
                        checked={newProduct.inStock === true}
                        onChange={() => setNewProduct(prev => ({ ...prev, inStock: true }))}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-primary-900">In Stock</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="inStock"
                        checked={newProduct.inStock === false}
                        onChange={() => setNewProduct(prev => ({ ...prev, inStock: false }))}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-primary-900">Out of Stock</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-3">Product Features</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProduct.isOrganic}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, isOrganic: e.target.checked }))}
                        className="text-orange-600 focus:ring-orange-500 rounded"
                      />
                      <span className="text-sm text-primary-900">Organic Product</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProduct.isFeatured}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, isFeatured: e.target.checked }))}
                        className="text-orange-600 focus:ring-orange-500 rounded"
                      />
                      <span className="text-sm text-primary-900">Featured Product</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-primary-100 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditProduct(false);
                  setEditingProduct(null);
                  setNewProduct({
                    name: '',
                    description: '',
                    category: '',
                    price: '',
                    image: '',
                    rating: 4.5,
                    inStock: true,
                    isOrganic: false,
                    isFeatured: false,
                    minOrder: ''
                  });
                }}
                className="px-4 py-2 border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProduct}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Update Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductsSection