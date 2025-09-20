// import React, { useState, useRef } from 'react'

import React, { useState, useRef } from 'react'
import { useCategories } from '../../hooks/useCategories'

const EditProfile = ({ onClose, onSave, producer }) => {
  // Transform producer data to match component's expected format
  const initializeProfileData = () => {
    if (!producer) {
      return {
        ownerName: '',
        businessName: '',
        email: '',
        phone: '',
        location: '',
        province: '',
        producerCategories: [],
        description: '',
        website: '',
        establishedYear: '',
        certifications: [],
        specialties: [],
        languages: [],
        businessHours: {
          monday: { open: '08:00', close: '17:00', closed: false },
          tuesday: { open: '08:00', close: '17:00', closed: false },
          wednesday: { open: '08:00', close: '17:00', closed: false },
          thursday: { open: '08:00', close: '17:00', closed: false },
          friday: { open: '08:00', close: '17:00', closed: false },
          saturday: { open: '08:00', close: '14:00', closed: false },
          sunday: { open: '', close: '', closed: true }
        },
        socialMedia: {
          facebook: '',
          instagram: '',
          twitter: '',
          linkedin: ''
        }
      }
    }

    // Transform business hours from API format to component format
    const transformBusinessHours = () => {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      const hours = {}
      
      days.forEach(day => {
        const dayData = producer.business_hours?.find(bh => bh.day_of_week === day)
        if (dayData) {
          hours[day] = {
            open: dayData.open_time ? dayData.open_time.substring(0, 5) : '08:00',
            close: dayData.close_time ? dayData.close_time.substring(0, 5) : '17:00',
            closed: !dayData.is_open
          }
        } else {
          hours[day] = { open: '', close: '', closed: true }
        }
      })
      
      return hours
    }

    // Transform social media from API format to component format
    const transformSocialMedia = () => {
      const social = {
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: ''
      }
      
      if (producer.social_media && Array.isArray(producer.social_media)) {
        producer.social_media.forEach(item => {
          if (social.hasOwnProperty(item.platform)) {
            social[item.platform] = item.url
          }
        })
      }
      
      return social
    }

    return {
      ownerName: producer.owner_name || '',
      businessName: producer.business_name || '',
      email: producer.email || '',
      phone: producer.phone || '',
      location: producer.location || '',
      province: producer.province || '',
      producerCategories: producer.categories?.map(cat => cat.id) || [],
      description: producer.bio || '',
      website: producer.website || '',
      establishedYear: producer.established_year || '',
      certifications: producer.certifications?.map(cert => 
        typeof cert === 'string' ? cert : cert.certification_name
      ) || [],
      specialties: producer.specialties || [],
      languages: producer.languages?.map(lang => 
        typeof lang === 'string' ? lang : lang.language
      ) || [],
      businessHours: transformBusinessHours(),
      socialMedia: transformSocialMedia()
    }
  }

  const [profileData, setProfileData] = useState(initializeProfileData)

  const [profileImage, setProfileImage] = useState(producer?.avatar || '/api/placeholder/120/120')
  const [bannerImage, setBannerImage] = useState(producer?.banner_image || '/api/placeholder/800/300')
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [newCertification, setNewCertification] = useState('')
  const [newSpecialty, setNewSpecialty] = useState('')
  const [newLanguage, setNewLanguage] = useState('')

  const profileImageRef = useRef(null)
  const bannerImageRef = useRef(null)

  // Get categories from API
  const { categories: apiCategories, loading: categoriesLoading } = useCategories()
  
  // Transform categories for profile editing (add id and maintain icon for multiple selection)
  const categories = React.useMemo(() => {
    if (categoriesLoading || !apiCategories.length) {
      // Fallback categories while loading or if API fails
      return [
        { id: 'vegetables', numericId: 1, name: 'Vegetables', icon: '🥬' },
        { id: 'fruits', numericId: 2, name: 'Fruits', icon: '🍎' },
        { id: 'grains', numericId: 3, name: 'Grains & Rice', icon: '🌾' },
        { id: 'spices', numericId: 4, name: 'Spices', icon: '🌶️' },
        { id: 'tea', numericId: 5, name: 'Tea', icon: '🍃' },
        { id: 'coconut', numericId: 6, name: 'Coconut Products', icon: '🥥' },
        { id: 'dairy', numericId: 7, name: 'Dairy', icon: '🐄' },
        { id: 'seafood', numericId: 8, name: 'Seafood', icon: '🐟' },
        { id: 'herbs', numericId: 9, name: 'Herbs', icon: '🌿' },
        { id: 'flowers', numericId: 10, name: 'Flowers', icon: '🌺' }
      ]
    }
    
    // Transform API categories to match expected format
    return apiCategories.map(cat => ({
      id: cat.slug,
      numericId: cat.id, // Assuming API provides numeric ID
      name: cat.name,
      icon: cat.icon
    }))
  }, [apiCategories, categoriesLoading])

  const availableLanguages = [
    'English', 'Sinhala', 'Tamil', 'Arabic', 'Chinese', 'German', 
    'French', 'Spanish', 'Japanese', 'Korean', 'Hindi'
  ]

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedInputChange = (parent, field, value) => {
    setProfileData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }))
  }

  const toggleCategory = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId)
    if (!category) return

    setProfileData(prev => ({
      ...prev,
      producerCategories: prev.producerCategories.includes(category.numericId)
        ? prev.producerCategories.filter(id => id !== category.numericId)
        : [...prev.producerCategories, category.numericId]
    }))
  }

  const handleBusinessHoursChange = (day, field, value) => {
    setProfileData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }))
  }

  const handleImageUpload = (type, file) => {
    if (file && file.type.startsWith('image/')) {
      setIsUploading(true)
      const imageUrl = URL.createObjectURL(file)
      
      setTimeout(() => {
        if (type === 'profile') {
          setProfileImage(imageUrl)
        } else {
          setBannerImage(imageUrl)
        }
        setIsUploading(false)
      }, 1000) // Simulate upload delay
    }
  }

  const addArrayItem = (field, value, setter) => {
    if (value.trim() && !profileData[field].includes(value.trim())) {
      setProfileData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }))
      setter('')
    }
  }

  const removeArrayItem = (field, index) => {
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const handleSaveProfile = () => {
    console.log('Saving profile:', profileData)
    // Here you would typically make an API call to save the profile
    alert('Profile updated successfully!')
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '👤' },
    { id: 'business', label: 'Business Details', icon: '🏢' },
    { id: 'contact', label: 'Contact & Social', icon: '📱' },
    { id: 'hours', label: 'Business Hours', icon: '🕒' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-primary-900">Edit Profile</h2>
            <p className="text-primary-600">Update your profile information and business details</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Profile Banner and Image */}
      <div className="bg-white rounded-xl shadow-sm border border-primary-200 overflow-hidden">
        {/* Banner Image */}
        <div className="relative h-48 bg-gradient-to-r from-green-400 to-blue-500">
          <img 
            src={bannerImage} 
            alt="Profile Banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30" />
          <button
            onClick={() => bannerImageRef.current?.click()}
            className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 text-primary-700 px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
            disabled={isUploading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{isUploading ? 'Uploading...' : 'Change Banner'}</span>
          </button>
          <input
            ref={bannerImageRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload('banner', e.target.files[0])}
            className="hidden"
          />
        </div>

        {/* Profile Image */}
        <div className="relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
            <div className="relative -mt-16 mb-4 sm:mb-0">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => profileImageRef.current?.click()}
                className="absolute bottom-2 right-2 w-8 h-8 bg-orange-600 hover:bg-orange-700 text-white rounded-full flex items-center justify-center transition-colors"
                disabled={isUploading}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input
                ref={profileImageRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload('profile', e.target.files[0])}
                className="hidden"
              />
            </div>
            
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">{profileData.ownerName}</h3>
              <p className="text-white text-opacity-90">{profileData.businessName}</p>
              <div className="flex items-center space-x-4 mt-2 text-white text-opacity-75 text-sm">
                <span>{profileData.location}</span>
                <span>•</span>
                <span>{profileData.producerCategories.length > 0 ? 
                  profileData.producerCategories.map(catId => 
                    categories.find(cat => cat.numericId === catId)?.name || catId
                  ).join(', ') : 'No categories selected'}</span>
                <span>•</span>
                <span>Est. {profileData.establishedYear}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-primary-200">
        <div className="flex space-x-1 p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-orange-100 text-orange-700 shadow-sm'
                  : 'text-primary-600 hover:text-orange-600 hover:bg-primary-50'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6">
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-primary-900 mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Owner Name</label>
                <input
                  type="text"
                  value={profileData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Business Name</label>
                <input
                  type="text"
                  value={profileData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Established Year</label>
                <input
                  type="number"
                  min="1900"
                  max="2025"
                  value={profileData.establishedYear}
                  onChange={(e) => handleInputChange('establishedYear', e.target.value)}
                  className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-4">Categories *</label>
              <p className="text-sm text-primary-600 mb-4">
                Select all categories that apply to your production
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={`p-4 rounded-lg border text-center transition-all duration-200 ${
                      profileData.producerCategories.includes(category.numericId)
                        ? 'bg-orange-100 border-orange-300 text-orange-700'
                        : 'bg-white border-primary-200 text-primary-600 hover:border-primary-300 hover:bg-primary-50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <div className="text-sm font-medium">{category.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">Business Description</label>
              <textarea
                value={profileData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Tell customers about your business, specialties, and what makes you unique..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">Location</label>
              <input
                type="text"
                value={profileData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="City, Province, Country"
              />
            </div>
          </div>
        )}

        {activeTab === 'business' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-primary-900 mb-4">Business Details</h3>
            
            {/* Certifications */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">Certifications</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {profileData.certifications.map((cert, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                  >
                    {cert}
                    <button
                      onClick={() => removeArrayItem('certifications', index)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  placeholder="Add certification..."
                  className="flex-1 border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  onKeyPress={(e) => e.key === 'Enter' && addArrayItem('certifications', newCertification, setNewCertification)}
                />
                <button
                  onClick={() => addArrayItem('certifications', newCertification, setNewCertification)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Specialties */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">Specialties</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {profileData.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {specialty}
                    <button
                      onClick={() => removeArrayItem('specialties', index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="Add specialty..."
                  className="flex-1 border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  onKeyPress={(e) => e.key === 'Enter' && addArrayItem('specialties', newSpecialty, setNewSpecialty)}
                />
                <button
                  onClick={() => addArrayItem('specialties', newSpecialty, setNewSpecialty)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">Languages Spoken</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {profileData.languages.map((language, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                  >
                    {language}
                    <button
                      onClick={() => removeArrayItem('languages', index)}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <select
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  className="flex-1 border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select a language...</option>
                  {availableLanguages
                    .filter(lang => !profileData.languages.includes(lang))
                    .map(language => (
                      <option key={language} value={language}>{language}</option>
                    ))}
                </select>
                <button
                  onClick={() => addArrayItem('languages', newLanguage, setNewLanguage)}
                  disabled={!newLanguage}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-primary-300 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-primary-900 mb-4">Contact & Social Media</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-primary-700 mb-2">Website</label>
                <input
                  type="url"
                  value={profileData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            <div className="border-t border-primary-200 pt-6">
              <h4 className="text-md font-medium text-primary-900 mb-4">Social Media Links</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Facebook</label>
                  <input
                    type="url"
                    value={profileData.socialMedia.facebook}
                    onChange={(e) => handleNestedInputChange('socialMedia', 'facebook', e.target.value)}
                    className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Instagram</label>
                  <input
                    type="url"
                    value={profileData.socialMedia.instagram}
                    onChange={(e) => handleNestedInputChange('socialMedia', 'instagram', e.target.value)}
                    className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="https://instagram.com/youraccount"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">Twitter</label>
                  <input
                    type="url"
                    value={profileData.socialMedia.twitter}
                    onChange={(e) => handleNestedInputChange('socialMedia', 'twitter', e.target.value)}
                    className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="https://twitter.com/youraccount"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={profileData.socialMedia.linkedin}
                    onChange={(e) => handleNestedInputChange('socialMedia', 'linkedin', e.target.value)}
                    className="w-full border border-primary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hours' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-primary-900 mb-4">Business Hours</h3>
            
            <div className="space-y-4">
              {Object.entries(profileData.businessHours).map(([day, hours]) => (
                <div key={day} className="flex items-center space-x-4 p-4 border border-primary-200 rounded-lg">
                  <div className="w-24">
                    <span className="text-sm font-medium text-primary-900 capitalize">{day}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 flex-1">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={hours.closed}
                        onChange={(e) => handleBusinessHoursChange(day, 'closed', e.target.checked)}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-primary-600">Closed</span>
                    </label>
                    
                    {!hours.closed && (
                      <>
                        <div>
                          <label className="block text-xs text-primary-500 mb-1">Open</label>
                          <input
                            type="time"
                            value={hours.open}
                            onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                            className="border border-primary-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <span className="text-primary-400">-</span>
                        <div>
                          <label className="block text-xs text-primary-500 mb-1">Close</label>
                          <input
                            type="time"
                            value={hours.close}
                            onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                            className="border border-primary-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save Button (Sticky) */}
      <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-primary-600">
            Make sure to save your changes before leaving this page.
          </p>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditProfile