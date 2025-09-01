import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { updateProductPrice } from '../../../services/api.product';
import { notifyOnSuccess, notifyOnFail } from '../../../utils/notification/toast';

const PriceEditModal = ({ 
  isOpen, 
  onClose, 
  product 
}) => {
  const [actualSalePrice, setActualSalePrice] = useState(0);
  const [calculatedPrices, setCalculatedPrices] = useState({
    baseRentPrice: 0,
    maxRentPrice: 0,
    avgSalePrice: 0,
    avgRentPrice: 0,
    suidhagaCommission: 0,
    avgEarningSale: 0,
    avgEarningRent: 0,
  });

  // Calculate prices whenever actual sale price changes
  const calculatePrices = useCallback(() => {
    const baseSale = product.base_sale_price;
    const maxSale = product.max_sale_price;
    const logistics = product.logistics_charges || 0;

    const baseRent = baseSale * 0.8;
    const maxRent = maxSale * 0.8;
    const avgSale = (baseSale + maxSale) / 2;
    const avgRent = (baseRent + maxRent) / 2;
    const commission = avgSale * 0.25;
    const avgEarningSale = avgSale - commission - logistics;
    const avgEarningRent = avgRent - commission - logistics;

    setCalculatedPrices({
      baseRentPrice: baseRent,
      maxRentPrice: maxRent,
      avgSalePrice: avgSale,
      avgRentPrice: avgRent,
      suidhagaCommission: commission, 
      avgEarningSale: avgEarningSale,
      avgEarningRent: avgEarningRent,
    });
  }, [product]);

  // Run calculation on mount and when product changes
  useEffect(() => {
    if (isOpen && product) {
      setActualSalePrice(product.actual_sale_price || 0);
      calculatePrices();
    }
  }, [isOpen, product, calculatePrices]);

  // Format currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  // Handle price update submission
  const handleSubmit = async () => {
    try {
      const response = await updateProductPrice(product.id, { 
        actual_sale_price: actualSalePrice 
      });

      if (response.status === 1) {
        notifyOnSuccess('Product price updated successfully');
        onClose();
      } else {
        notifyOnFail('Failed to update product price');
      }
    } catch (error) {
      console.error('Error updating product price:', error);
      notifyOnFail('An error occurred while updating price');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[black] bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 p-6 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-xl font-semibold mb-6">Edit Product Pricing</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Sale Price
              </label>
              <span className="text-gray-900 font-semibold">
                {formatPrice(product.base_sale_price)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Sale Price
              </label>
              <span className="text-gray-900 font-semibold">
                {formatPrice(product.max_sale_price)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logistics Charges
              </label>
              <span className="text-gray-900 font-semibold">
                {formatPrice(product.logistics_charges || 0)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suidhaga Commission
              </label>
              <span className="text-gray-900 font-semibold">
                {formatPrice(calculatedPrices.suidhagaCommission)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actual Sale Price
              </label>
              <input
                type="number"
                value={actualSalePrice}
                onChange={(e) => setActualSalePrice(parseFloat(e.target.value) || 0)}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actual Rent Price
              </label>
              <span className="text-gray-900 font-semibold">
                {formatPrice(actualSalePrice * 0.8)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avg Earning (Sale)
              </label>
              <span className="text-green-600 font-semibold">
                {formatPrice(calculatedPrices.avgEarningSale)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avg Earning (Rent)
              </label>
              <span className="text-green-600 font-semibold">
                {formatPrice(calculatedPrices.avgEarningRent)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-pink-700"
          >
            Update Price
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceEditModal;