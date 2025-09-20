import { useState, useEffect } from 'react';
import { categoriesAPI } from '../services/api';

// Custom hook for managing categories
export const useCategories = (options = {}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoriesAPI.getAll(options);
      // Ensure categories is always an array
      const categoriesData = response.data || response || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch categories:', err);
      // Set empty array on error to prevent map errors
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const refetch = () => {
    fetchCategories();
  };

  return {
    categories,
    loading,
    error,
    refetch
  };
};

// Hook for enhanced categories with styling (for CategoryTiles component)
export const useCategoriesWithStyling = () => {
  const { categories, loading, error, refetch } = useCategories();

  // Style mapping for categories
  const styleMap = {
    'Vegetables': {
      color: "from-green-400 to-green-600",
      textColor: "text-green-800",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    'Spices & Herbs': {
      color: "from-red-400 to-red-600",
      textColor: "text-red-800",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    },
    'Fruits': {
      color: "from-orange-400 to-orange-600",
      textColor: "text-orange-800",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    'Dairy Products': {
      color: "from-blue-400 to-blue-600",
      textColor: "text-blue-800",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    'Seafood': {
      color: "from-cyan-400 to-cyan-600",
      textColor: "text-cyan-800",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-200"
    },
    'Rice & Grains': {
      color: "from-yellow-400 to-yellow-600",
      textColor: "text-yellow-800",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200"
    },
    'Tea & Beverages': {
      color: "from-emerald-400 to-emerald-600",
      textColor: "text-emerald-800",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200"
    },
    'Processed Foods': {
      color: "from-amber-400 to-amber-600",
      textColor: "text-amber-800",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200"
    },
    'Coconut Products': {
      color: "from-brown-400 to-brown-600",
      textColor: "text-brown-800",
      bgColor: "bg-brown-50",
      borderColor: "border-brown-200"
    }
  };

  // Enhanced categories with styling
  const styledCategories = Array.isArray(categories) ? categories.map(category => ({
    ...category,
    ...(styleMap[category.name] || {}),
    // Mock counts for now - these should come from your stats API later
    producerCount: Math.floor(Math.random() * 200) + 50,
    productCount: `${(Math.random() * 2 + 0.5).toFixed(1)}k`,
    trending: Math.random() > 0.6,
    description: getDescription(category.name)
  })) : [];

  return {
    categories: styledCategories,
    loading,
    error,
    refetch
  };
};

// Helper function to get category descriptions
const getDescription = (categoryName) => {
  const descriptions = {
    'Vegetables': 'Fresh organic vegetables',
    'Spices & Herbs': 'Ceylon spices & herbs',
    'Fruits': 'Tropical & seasonal fruits',
    'Dairy Products': 'Fresh milk & dairy',
    'Seafood': 'Fresh catch from coast',
    'Rice & Grains': 'Premium rice varieties',
    'Tea & Beverages': 'Ceylon tea & drinks',
    'Processed Foods': 'Value-added products',
    'Coconut Products': 'Coconut based products'
  };
  return descriptions[categoryName] || 'Quality products';
};

export default useCategories;