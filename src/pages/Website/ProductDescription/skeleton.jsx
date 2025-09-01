import React from 'react';

// Skeleton for Product Loading State
export const ProductPageSkeleton = () => {
  return (
    <main className="animate-pulse">
      <section>
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 p-4 md:p-8 lg:p-20">
          {/* Image Skeleton */}
          <div className="lg:w-1/2 flex flex-row relative">
            <div className="w-full max-w-sm flex justify-center lg:justify-start">
              <div className="bg-gray-300 w-[200px] h-[300px] md:w-[300px] md:h-[450px] lg:w-[402px] lg:h-[582px]"></div>
            </div>
          </div>

          {/* Product Details Skeleton */}
          <div className="lg:w-1/2 space-y-4 p-4 lg:p-8 border">
            <div className="h-8 bg-gray-300 w-3/4 mb-4"></div>
            
            {/* Size Variations Skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 w-1/4"></div>
              <div className="flex gap-2">
                {[1,2,3].map((_, index) => (
                  <div key={index} className="h-8 w-16 bg-gray-300"></div>
                ))}
              </div>
            </div>

            {/* Price Skeletons */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 w-1/2"></div>
              <div className="h-4 bg-gray-300 w-1/2"></div>
            </div>

            {/* Measurements Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border p-4 md:p-6">
              {[1,2,3,4].map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="h-3 bg-gray-300 w-2/3"></div>
                  <div className="h-3 bg-gray-300 w-1/2"></div>
                </div>
              ))}
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex gap-2 md:gap-4">
              <div className="h-10 w-1/2 bg-gray-300"></div>
              <div className="h-10 w-1/2 bg-gray-300"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Skeleton */}
      <section className="px-4 py-8 sm:px-8 lg:px-20">
        <div className="flex gap-2">
          {[1,2,3].map((_, index) => (
            <div key={index} className="h-10 w-24 bg-gray-300"></div>
          ))}
        </div>
        <div className="p-4 bg-gray-100 border mt-4">
          <div className="space-y-3">
            {[1,2,3].map((_, index) => (
              <div key={index} className="h-4 bg-gray-300 w-full"></div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

// Product Not Found Component
export const ProductNotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Product Not Found</h1>
        <p className="text-lg text-gray-600 mb-8">
          The product you are looking for does not exist or has been removed.
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition-colors"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};