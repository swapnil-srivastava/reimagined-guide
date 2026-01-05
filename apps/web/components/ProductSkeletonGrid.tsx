import React from 'react';

const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="w-full pb-5 rounded-3xl shadow-lg overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="w-full h-64 bg-gray-300 dark:bg-fun-blue-700"></div>
      
      <div className="p-4">
        {/* Title placeholder */}
        <div className="h-6 bg-gray-200 dark:bg-fun-blue-600 rounded-md w-3/4 mb-3"></div>
        
        {/* Price placeholder */}
        <div className="h-5 bg-gray-200 dark:bg-fun-blue-600 rounded-md w-1/3 mb-4"></div>
        
        {/* Description placeholder */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-fun-blue-600 rounded-md"></div>
          <div className="h-4 bg-gray-200 dark:bg-fun-blue-600 rounded-md w-5/6"></div>
        </div>
        
        {/* Actions placeholder */}
        <div className="flex justify-between items-center mt-4">
          <div className="h-4 bg-gray-200 dark:bg-fun-blue-600 rounded-md w-1/4"></div>
          <div className="h-10 w-10 bg-gray-200 dark:bg-fun-blue-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default function ProductSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
