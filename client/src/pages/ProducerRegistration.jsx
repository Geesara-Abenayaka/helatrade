import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import services from '../services/producerServices';

const { producerServices, categoryServices, utils, imageUploadService } = services;

const ProducerRegistration = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  
  const [formData, setFormData] = useState({
    // Required fields according to API
    email: '',
    password: '',
    confirmPassword: '',
    business_name: '',
    owner_name: '',
    
    // Optional fields
    phone: '',
    bio: '',
    description: '',
    location: '',
    province: '',
    website: '',
    established_year: '',
    avatar: '',
    category_ids: [],
    
    // Complex fields
    business_hours: [
      { day_of_week: 'monday', is_open: true, open_time: '08:00', close_time: '17:00' },
      { day_of_week: 'tuesday', is_open: true, open_time: '08:00', close_time: '17:00' },
      { day_of_week: 'wednesday', is_open: true, open_time: '08:00', close_time: '17:00' },
      { day_of_week: 'thursday', is_open: true, open_time: '08:00', close_time: '17:00' },
      { day_of_week: 'friday', is_open: true, open_time: '08:00', close_time: '17:00' },
      { day_of_week: 'saturday', is_open: true, open_time: '08:00', close_time: '17:00' },
      { day_of_week: 'sunday', is_open: false, open_time: '', close_time: '' }
    ],
    certifications: [],
    languages: [
      { language: 'English', proficiency: 'intermediate' }
    ],
    social_media: [],
    specialties: []
  })

  // Sri Lankan provinces for dropdown
  const provinces = [
    'Western', 'Central', 'Southern', 'Northern', 'Eastern', 
    'North Western', 'North Central', 'Uva', 'Sabaragamuwa'
  ]

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true)
        const response = await categoryServices.getAllCategories({ active: true })
        if (response.success && response.data?.categories) {
          setCategories(response.data.categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            icon: cat.icon || '🌱'
          })))
        } else {
          // Fallback categories
          setCategories([
            { id: 1, name: 'Vegetables', icon: '🥬' },
            { id: 2, name: 'Fruits', icon: '🍎' },
            { id: 3, name: 'Grains & Rice', icon: '🌾' },
            { id: 4, name: 'Spices', icon: '🌶️' },
            { id: 5, name: 'Tea', icon: '🍃' },
            { id: 6, name: 'Coconut Products', icon: '🥥' },
            { id: 7, name: 'Dairy', icon: '🐄' },
            { id: 8, name: 'Seafood', icon: '🐟' },
            { id: 9, name: 'Herbs', icon: '🌿' },
            { id: 10, name: 'Flowers', icon: '🌺' }
          ])
        }
      } catch (error) {
        console.error('Failed to load categories:', error)
        // Use fallback categories
        setCategories([
          { id: 1, name: 'Vegetables', icon: '🥬' },
          { id: 2, name: 'Fruits', icon: '🍎' },
          { id: 3, name: 'Grains & Rice', icon: '�' },
          { id: 4, name: 'Spices', icon: '🌶️' },
          { id: 5, name: 'Tea', icon: '🍃' },
        ])
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  const steps = [
    { number: 1, title: 'Basic Information', description: 'Account & business details' },
    { number: 2, title: 'Contact & Location', description: 'Contact information' },
    { number: 3, title: 'Categories & Details', description: 'Business categories & description' },
    { number: 4, title: 'Additional Information', description: 'Hours, languages & social media' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }

    // Special handling for phone number formatting
    if (name === 'phone') {
      const sanitizedPhone = utils.sanitizePhoneNumber(value)
      setFormData(prev => ({ ...prev, [name]: sanitizedPhone }))
      return
    }

    // Special handling for established_year
    if (name === 'established_year') {
      const year = parseInt(value) || ''
      setFormData(prev => ({ ...prev, [name]: year }))
      return
    }

    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const toggleCategory = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter(id => id !== categoryId)
        : [...prev.category_ids, categoryId]
    }))
    
    // Clear category error
    if (fieldErrors.category_ids) {
      setFieldErrors(prev => ({ ...prev, category_ids: null }))
    }
  }

  const addSpecialty = (specialty) => {
    if (specialty && !formData.specialties.includes(specialty)) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialty]
      }))
    }
  }

  const removeSpecialty = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }))
  }

  const addCertification = (certName, issuingBody = '') => {
    const newCert = { certification_name: certName, issuing_body: issuingBody }
    if (certName && !formData.certifications.some(c => c.certification_name === certName)) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCert]
      }))
    }
  }

  const removeCertification = (certName) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c.certification_name !== certName)
    }))
  }

  const updateLanguage = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.map((lang, i) => 
        i === index ? { ...lang, [field]: value } : lang
      )
    }))
  }

  const addLanguage = () => {
    setFormData(prev => ({
      ...prev,
      languages: [...prev.languages, { language: '', proficiency: 'intermediate' }]
    }))
  }

  const removeLanguage = (index) => {
    if (formData.languages.length > 1) {
      setFormData(prev => ({
        ...prev,
        languages: prev.languages.filter((_, i) => i !== index)
      }))
    }
  }

  const updateBusinessHour = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      business_hours: prev.business_hours.map((hour, i) => 
        i === index ? { ...hour, [field]: value } : hour
      )
    }))
  }

  const addSocialMedia = (platform, url) => {
    if (platform && url && !formData.social_media.some(sm => sm.platform === platform)) {
      setFormData(prev => ({
        ...prev,
        social_media: [...prev.social_media, { platform, url }]
      }))
    }
  }

  const removeSocialMedia = (platform) => {
    setFormData(prev => ({
      ...prev,
      social_media: prev.social_media.filter(sm => sm.platform !== platform)
    }))
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setIsLoading(true)
      setError('')
      
      const uploadResult = await imageUploadService.uploadImage(file, 'avatars')
      
      if (uploadResult.success) {
        setFormData(prev => ({
          ...prev,
          avatar: uploadResult.url
        }))
      } else {
        setError(uploadResult.message || 'Failed to upload avatar')
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
      setError('Failed to upload avatar. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (isStepValid && currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const validateCurrentStep = useCallback(() => {
    const errors = {}
    
    switch (currentStep) {
      case 1:
        if (!formData.email) errors.email = 'Email is required'
        else if (!utils.validateEmail(formData.email)) errors.email = 'Please enter a valid email address'
        
        if (!formData.password) errors.password = 'Password is required'
        else {
          const passwordValidation = utils.validatePassword(formData.password)
          if (!passwordValidation.isValid) {
            errors.password = passwordValidation.errors[0]
          }
        }
        
        if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password'
        else if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match'
        }
        
        if (!formData.business_name) errors.business_name = 'Business name is required'
        if (!formData.owner_name) errors.owner_name = 'Owner name is required'
        break
        
      case 2:
        if (!formData.phone) {
          errors.phone = 'Phone number is required'
        } else {
          const sanitized = utils.sanitizePhoneNumber(formData.phone)
          if (!sanitized.startsWith('+94') || sanitized.length !== 12) {
            errors.phone = 'Please enter a valid Sri Lankan phone number (e.g., 0771234567)'
          }
        }
        break
        
      case 3:
        if (!formData.category_ids || formData.category_ids.length === 0) {
          errors.category_ids = 'Please select at least one category'
        }
        break
        
      case 4:
        // Optional step, no validation needed
        break
    }
    
    return { errors, isValid: Object.keys(errors).length === 0 }
  }, [currentStep, formData.email, formData.password, formData.confirmPassword, formData.business_name, formData.owner_name, formData.phone, formData.category_ids])

  const isStepValid = useMemo(() => {
    const { isValid } = validateCurrentStep()
    return isValid
  }, [validateCurrentStep])

  const validateStep = () => {
    const { errors, isValid } = validateCurrentStep()
    setFieldErrors(errors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Only submit on final step (step 4)
    if (currentStep !== 4) {
      return
    }
    
    if (!validateStep()) {
      return
    }
    
    setIsLoading(true)
    setError(null)
    setFieldErrors({})
    
    try {
      // Prepare registration data according to API requirements
      const registrationData = {
        // Required fields
        email: formData.email,
        password: formData.password,
        business_name: formData.business_name,
        owner_name: formData.owner_name,
        
        // Optional fields (only include if they have values)
        ...(formData.phone && { phone: utils.sanitizePhoneNumber(formData.phone) }),
        ...(formData.bio && { bio: formData.bio }),
        ...(formData.description && { description: formData.description }),
        ...(formData.location && { location: formData.location }),
        ...(formData.province && { province: formData.province }),
        ...(formData.website && { website: formData.website }),
        ...(formData.established_year && { established_year: parseInt(formData.established_year) }),
        ...(formData.avatar && { avatar: formData.avatar }),
        
        // Arrays (only include if not empty)
        ...(formData.category_ids.length > 0 && { category_ids: formData.category_ids }),
        ...(formData.specialties.length > 0 && { specialties: formData.specialties }),
        
        // Format complex objects
        business_hours: formData.business_hours.filter(hour => hour.is_open),
        certifications: formData.certifications.filter(cert => cert.certification_name),
        languages: formData.languages.filter(lang => lang.language),
        social_media: formData.social_media.filter(sm => sm.platform && sm.url)
      }

      console.log('Sending registration data:', registrationData)
      
      const response = await producerServices.register(registrationData)
      
      if (response.success) {
        console.log('Producer registered successfully:', response.data)
        
        // Store auth token if provided
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token)
          localStorage.setItem('userType', 'producer')
          localStorage.setItem('userId', response.data.user.id)
        }
        
        // Navigate to producer dashboard
        navigate('/producer-dashboard', { 
          state: { 
            message: 'Registration successful! Welcome to HelaTrade.',
            producer: response.data.user
          }
        })
      } else {
        throw new Error(response.message || 'Registration failed')
      }
      
    } catch (error) {
      console.error('Registration error:', error)
      
      // Handle different error types
      if (error.success === false && error.errors) {
        // Validation errors from backend
        const newFieldErrors = {}
        error.errors.forEach(err => {
          if (typeof err === 'string') {
            // General error message
            setError(err)
          } else if (err.field) {
            // Field-specific error
            newFieldErrors[err.field] = err.message
          }
        })
        setFieldErrors(newFieldErrors)
      } else if (error.message) {
        setError(error.message)
      } else {
        setError('Registration failed. Please check your information and try again.')
      }
      
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-primary-900">
            Join as a Producer
          </h2>
          <p className="mt-2 text-sm text-primary-600">
            Connect with stores and grow your business
          </p>
          
          {/* Error Alert */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Registration Error</h3>
                  <div className="mt-1 text-sm text-red-700">{error}</div>
                  <div className="mt-2">
                    <button
                      onClick={() => setError(null)}
                      className="text-sm font-medium text-red-600 hover:text-red-500"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.number
                    ? 'bg-orange-600 text-white'
                    : currentStep === step.number
                    ? 'bg-orange-100 text-orange-600 border-2 border-orange-600'
                    : 'bg-primary-200 text-primary-500'
                }`}>
                  {currentStep > step.number ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step.number ? 'bg-orange-600' : 'bg-primary-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-primary-900">
              {steps[currentStep - 1].title}
            </h3>
            <p className="text-sm text-primary-600">
              {steps[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg border border-primary-200 p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-primary-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      fieldErrors.email ? 'border-red-300 bg-red-50' : 'border-primary-300'
                    }`}
                    placeholder="Enter your email address"
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-primary-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      fieldErrors.password ? 'border-red-300 bg-red-50' : 'border-primary-300'
                    }`}
                    placeholder="Create a strong password"
                  />
                  {fieldErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
                  )}
                  <p className="mt-1 text-xs text-primary-600">
                    Password must contain uppercase, lowercase, number, and special character (min 8 chars)
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      fieldErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-primary-300'
                    }`}
                    placeholder="Confirm your password"
                  />
                  {fieldErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="business_name" className="block text-sm font-medium text-primary-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    id="business_name"
                    name="business_name"
                    required
                    value={formData.business_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      fieldErrors.business_name ? 'border-red-300 bg-red-50' : 'border-primary-300'
                    }`}
                    placeholder="Enter your business name"
                  />
                  {fieldErrors.business_name && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.business_name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="owner_name" className="block text-sm font-medium text-primary-700 mb-2">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    id="owner_name"
                    name="owner_name"
                    required
                    value={formData.owner_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      fieldErrors.owner_name ? 'border-red-300 bg-red-50' : 'border-primary-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {fieldErrors.owner_name && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.owner_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Profile Avatar (Optional)
                  </label>
                  <div className="flex items-center space-x-4">
                    {formData.avatar && (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-primary-100">
                        <img
                          src={formData.avatar}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        id="avatar"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="avatar"
                        className="inline-flex items-center px-4 py-2 border border-primary-300 rounded-lg shadow-sm text-sm font-medium text-primary-700 bg-white hover:bg-primary-50 cursor-pointer"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {formData.avatar ? 'Change Avatar' : 'Upload Avatar'}
                      </label>
                      {formData.avatar && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                          className="ml-2 text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-primary-600">
                    Upload a profile picture (JPG, PNG, GIF up to 5MB)
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Contact & Location */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-primary-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      fieldErrors.phone ? 'border-red-300 bg-red-50' : 'border-primary-300'
                    }`}
                    placeholder="0771234567"
                  />
                  {fieldErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>
                  )}
                  <p className="mt-1 text-xs text-primary-600">
                    Will be formatted as +94xxxxxxxxx for international use
                  </p>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-primary-700 mb-2">
                    Location (City/Area)
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., Kandy, Nuwara Eliya"
                  />
                </div>

                <div>
                  <label htmlFor="province" className="block text-sm font-medium text-primary-700 mb-2">
                    Province
                  </label>
                  <select
                    id="province"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select Province</option>
                    {provinces.map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-primary-700 mb-2">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="https://yourfarm.com"
                  />
                </div>

                <div>
                  <label htmlFor="established_year" className="block text-sm font-medium text-primary-700 mb-2">
                    Established Year (Optional)
                  </label>
                  <input
                    type="number"
                    id="established_year"
                    name="established_year"
                    value={formData.established_year}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="2010"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Categories & Business Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-primary-900 mb-4">
                    What do you produce? *
                  </h3>
                  <p className="text-sm text-primary-600 mb-6">
                    Select all categories that apply to your production
                  </p>
                  {fieldErrors.category_ids && (
                    <p className="mb-4 text-sm text-red-600">{fieldErrors.category_ids}</p>
                  )}
                  {loadingCategories ? (
                    <div className="text-center py-8">
                      <div className="text-primary-600">Loading categories...</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categories.map(category => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => toggleCategory(category.id)}
                          className={`p-4 rounded-lg border text-center transition-all duration-200 ${
                            formData.category_ids.includes(category.id)
                              ? 'bg-orange-100 border-orange-300 text-orange-700'
                              : 'bg-white border-primary-200 text-primary-600 hover:border-primary-300 hover:bg-primary-50'
                          }`}
                        >
                          <div className="text-2xl mb-2">{category.icon}</div>
                          <div className="text-sm font-medium">{category.name}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-primary-700 mb-2">
                    Bio (Short Description)
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Brief description of your farming background..."
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-primary-700 mb-2">
                    Detailed Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Tell us more about your business, farming practices, products..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Specialties (Optional)
                  </label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
                        >
                          {specialty}
                          <button
                            type="button"
                            onClick={() => removeSpecialty(specialty)}
                            className="ml-2 text-orange-600 hover:text-orange-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Add a specialty (e.g., Organic Farming)..."
                        className="flex-1 px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addSpecialty(e.target.value.trim())
                            e.target.value = ''
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.target.previousElementSibling
                          addSpecialty(input.value.trim())
                          input.value = ''
                        }}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Additional Information */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Certifications (Optional)
                  </label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.certifications.map((cert, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                        >
                          {cert.certification_name}
                          <button
                            type="button"
                            onClick={() => removeCertification(cert.certification_name)}
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
                        placeholder="Add certification (e.g., Organic Certification)..."
                        className="flex-1 px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addCertification(e.target.value.trim())
                            e.target.value = ''
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.target.previousElementSibling
                          addCertification(input.value.trim())
                          input.value = ''
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-primary-900 mb-4">
                    Languages You Speak
                  </h3>
                  <div className="space-y-4">
                    {formData.languages.map((lang, index) => (
                      <div key={index} className="flex space-x-4 p-4 border border-primary-200 rounded-lg">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-primary-700 mb-1">
                            Language
                          </label>
                          <input
                            type="text"
                            value={lang.language}
                            onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                            className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="e.g., English"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-primary-700 mb-1">
                            Proficiency
                          </label>
                          <select
                            value={lang.proficiency}
                            onChange={(e) => updateLanguage(index, 'proficiency', e.target.value)}
                            className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option value="basic">Basic</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="native">Native</option>
                          </select>
                        </div>
                        {formData.languages.length > 1 && (
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => removeLanguage(index)}
                              className="px-3 py-2 text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addLanguage}
                      className="w-full px-4 py-3 border-2 border-dashed border-primary-300 rounded-lg text-primary-600 hover:border-primary-400 hover:text-primary-700 transition-colors"
                    >
                      + Add Another Language
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-primary-900 mb-4">
                    Social Media Links (Optional)
                  </h3>
                  <div className="space-y-4">
                    {formData.social_media.map((social, index) => (
                      <div key={index} className="flex space-x-4 p-4 border border-primary-200 rounded-lg">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-primary-700 mb-1">
                            Platform
                          </label>
                          <select
                            value={social.platform}
                            onChange={(e) => {
                              const newSocialMedia = [...formData.social_media]
                              newSocialMedia[index].platform = e.target.value
                              setFormData(prev => ({ ...prev, social_media: newSocialMedia }))
                            }}
                            className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option value="">Select Platform</option>
                            <option value="facebook">Facebook</option>
                            <option value="instagram">Instagram</option>
                            <option value="twitter">Twitter</option>
                            <option value="linkedin">LinkedIn</option>
                            <option value="youtube">YouTube</option>
                            <option value="tiktok">TikTok</option>
                            <option value="whatsapp">WhatsApp Business</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-primary-700 mb-1">
                            URL
                          </label>
                          <input
                            type="url"
                            value={social.url}
                            onChange={(e) => {
                              const newSocialMedia = [...formData.social_media]
                              newSocialMedia[index].url = e.target.value
                              setFormData(prev => ({ ...prev, social_media: newSocialMedia }))
                            }}
                            className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="https://facebook.com/yourpage"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => {
                              const newSocialMedia = formData.social_media.filter((_, i) => i !== index)
                              setFormData(prev => ({ ...prev, social_media: newSocialMedia }))
                            }}
                            className="px-3 py-2 text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          social_media: [...prev.social_media, { platform: '', url: '' }]
                        }))
                      }}
                      className="w-full px-4 py-3 border-2 border-dashed border-primary-300 rounded-lg text-primary-600 hover:border-primary-400 hover:text-primary-700 transition-colors"
                    >
                      + Add Social Media Link
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-primary-900 mb-4">
                    Business Hours (Optional)
                  </h3>
                  <div className="space-y-4">
                    {formData.business_hours.map((hour, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 border border-primary-200 rounded-lg">
                        <div className="w-24">
                          <span className="text-sm font-medium text-primary-700 capitalize">
                            {hour.day_of_week}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={hour.is_open}
                            onChange={(e) => updateBusinessHour(index, 'is_open', e.target.checked)}
                            className="rounded border-primary-300 text-orange-600 focus:ring-orange-500"
                          />
                          <span className="text-sm text-primary-600">Open</span>
                        </div>
                        {hour.is_open && (
                          <>
                            <div>
                              <input
                                type="time"
                                value={hour.open_time}
                                onChange={(e) => updateBusinessHour(index, 'open_time', e.target.value)}
                                className="px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                            <span className="text-primary-600">to</span>
                            <div>
                              <input
                                type="time"
                                value={hour.close_time}
                                onChange={(e) => updateBusinessHour(index, 'close_time', e.target.value)}
                                className="px-3 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t border-primary-200 mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-3 border border-primary-300 rounded-lg text-primary-700 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isStepValid || isLoading}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    '🚀 Register as Producer'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-primary-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProducerRegistration