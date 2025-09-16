import React, { useState } from 'react';
import CommentsModal from './CommentsModal';

const PostCard = ({ 
  post, 
  onLike, 
  onSave, 
  onComment, 
  onContactProducer,
  isLiked = false,
  isSaved = false,
  showTrendingBadge = true,
  showCategory = true,
  showPopularity = false,
  showContactButton = true,
  showProducerHeader = true, // New prop to control producer header visibility
  size = 'default' // 'default', 'compact', 'detailed'
}) => {
  const [imageError, setImageError] = useState(false);
  const [commentsModal, setCommentsModal] = useState({ isOpen: false, post: null });

  const handleImageError = (e) => {
    setImageError(true);
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwSDIwMFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxODAiIHk9IjEzMCI+CjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcng9IjQiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPHBhdGggZD0ibTEyIDJhMTAgMTAgMCAxIDAgMTAgMTBhMTAgMTAgMCAwIDAtMTAtMTB6bTAgMThhOCA4IDAgMSAxIDgtOGE4IDggMCAwIDEtOCA4eiIgZmlsbD0iI0Y5RkFGQiIvPgo8cGF0aCBkPSJtMTIgMTNhMSAxIDAgMCAwIDEtMWEyIDIgMCAwIDAtMi0yaC0yYTEgMSAwIDAgMCAwIDJoMmExIDEgMCAwIDEgMSAxeiIgZmlsbD0iI0Y5RkFGQiIvPgo8Y2lyY2xlIGN4PSIxNSIgY3k9IjkiIHI9IjEiIGZpbGw9IiNGOUZBRkIiLz4KPC9zdmc+Cjwvc3ZnPgo8L3N2Zz4K';
  };

  const handleLike = () => {
    if (onLike) {
      onLike(post.id);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(post.id);
    }
  };

  const handleComment = () => {
    setCommentsModal({ isOpen: true, post });
    if (onComment) {
      onComment(post);
    }
  };

  const handleCommentsClose = () => {
    setCommentsModal({ isOpen: false, post: null });
  };

  const handleContactProducer = () => {
    if (onContactProducer) {
      onContactProducer(post.producer);
    }
  };

  // Get the main image - handle both single image and images array
  const getMainImage = () => {
    if (post.images && post.images.length > 0) {
      return post.images[0];
    }
    if (post.image) {
      return post.image;
    }
    if (post.thumbnail) {
      return post.thumbnail;
    }
    return null;
  };

  // Get additional images for grid display
  const getAdditionalImages = () => {
    if (post.images && post.images.length > 1) {
      return post.images.slice(1);
    }
    return [];
  };

  const mainImage = getMainImage();
  const additionalImages = getAdditionalImages();
  const hasMultipleImages = post.images && post.images.length > 1;

  return (
    <div className={`bg-white border border-primary-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 ${
      size === 'compact' ? 'text-sm' : ''
    }`}>
      {/* Post Header - Conditionally rendered */}
      {showProducerHeader ? (
        <div className={`p-4 border-b border-primary-100 ${size === 'compact' ? 'p-3' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`bg-primary-100 rounded-full flex items-center justify-center ${
                size === 'compact' ? 'w-10 h-10 text-base' : 'w-12 h-12 text-lg'
              }`}>
                {post.producer.avatar}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className={`font-semibold text-primary-800 hover:text-orange-600 cursor-pointer ${
                    size === 'compact' ? 'text-sm' : ''
                  }`}>
                    {post.producer.name}
                  </h3>
                  {post.producer.verified && (
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className={`flex items-center space-x-2 text-primary-500 ${
                  size === 'compact' ? 'text-xs' : 'text-sm'
                }`}>
                  <span>📍 {post.producer.location}</span>
                  <span>•</span>
                  <span>{post.timeAgo || post.timestamp}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {showTrendingBadge && post.trending && (
                <span className={`bg-orange-100 text-orange-800 font-semibold px-2 py-1 rounded-full ${
                  size === 'compact' ? 'text-xs' : 'text-xs'
                }`}>
                  🔥 Trending
                </span>
              )}
              {onSave && (
                <button 
                  onClick={handleSave}
                  className={`p-2 rounded-full transition-colors ${
                    isSaved 
                      ? 'text-yellow-600 bg-yellow-100' 
                      : 'text-primary-400 hover:text-yellow-600 hover:bg-yellow-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Simplified header with just date when producer header is hidden */
        <div className={`px-4 pt-4 ${size === 'compact' ? 'px-3 pt-3' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`text-primary-500 ${size === 'compact' ? 'text-xs' : 'text-sm'}`}>
              <span>{post.timeAgo || post.timestamp}</span>
            </div>
            <div className="flex items-center space-x-2">
              {showTrendingBadge && post.trending && (
                <span className={`bg-orange-100 text-orange-800 font-semibold px-2 py-1 rounded-full ${
                  size === 'compact' ? 'text-xs' : 'text-xs'
                }`}>
                  🔥 Trending
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Post Content */}
      <div className={`p-4 ${size === 'compact' ? 'p-3' : ''}`}>
        <p className={`text-primary-700 mb-4 leading-relaxed ${
          size === 'compact' ? 'text-sm' : ''
        }`}>
          {post.content}
        </p>
        
        {/* Images Grid */}
        {mainImage && (
          <div className={`mb-4 ${hasMultipleImages ? 'grid grid-cols-2 gap-2' : ''}`}>
            {/* Main Image */}
            <div className={`${hasMultipleImages ? 'aspect-video' : 'aspect-video'} bg-primary-200 rounded-lg overflow-hidden`}>
              <img 
                src={mainImage} 
                alt="Post content" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                onError={handleImageError}
              />
              {/* Video Play Button Overlay */}
              {post.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-600 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            
            {/* Additional Images */}
            {additionalImages.map((image, index) => (
              <div key={index} className="aspect-video bg-primary-200 rounded-lg overflow-hidden">
                <img 
                  src={image} 
                  alt={`Post content ${index + 2}`} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                  onError={handleImageError}
                />
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          {showCategory && post.category && (
            <span className={`bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-medium ${
              size === 'compact' ? 'text-xs px-2' : 'text-sm'
            }`}>
              {post.category}
            </span>
          )}
          
          {showPopularity && post.popularity && (
            <div className={`flex items-center space-x-4 text-primary-500 ${
              size === 'compact' ? 'text-xs' : 'text-sm'
            }`}>
              <span className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Popularity: {post.popularity}%</span>
              </span>
            </div>
          )}
          
          {!showCategory && !showPopularity && <div></div>}
        </div>
      </div>

      {/* Post Actions */}
      <div className={`px-4 py-3 border-t border-primary-100 bg-primary-50 ${
        size === 'compact' ? 'px-3 py-2' : ''
      }`}>
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${size === 'compact' ? 'space-x-4' : 'space-x-6'}`}>
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-colors ${
                isLiked 
                  ? 'text-red-500' 
                  : 'text-primary-600 hover:text-red-500'
              }`}
            >
              <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className={`font-medium ${size === 'compact' ? 'text-xs' : 'text-sm'}`}>
                {post.likes + (isLiked ? 1 : 0)}
              </span>
            </button>
            
            <button 
              onClick={handleComment}
              className="flex items-center space-x-2 text-primary-600 hover:text-blue-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className={`font-medium ${size === 'compact' ? 'text-xs' : 'text-sm'}`}>
                {post.comments}
              </span>
            </button>
          </div>
          
          {showContactButton && (
            <button 
              onClick={handleContactProducer}
              className={`bg-orange-600 hover:bg-orange-700 text-white font-medium transition-colors rounded-lg ${
                size === 'compact' 
                  ? 'text-xs px-3 py-1' 
                  : 'text-sm px-4 py-2'
              }`}
            >
              Contact Producer
            </button>
          )}
        </div>
      </div>
      
      {/* Comments Modal */}
      <CommentsModal
        isOpen={commentsModal.isOpen}
        onClose={handleCommentsClose}
        post={commentsModal.post}
      />
    </div>
  );
};

export default PostCard;