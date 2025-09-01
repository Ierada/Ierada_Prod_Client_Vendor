import React, { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { updateProduct } from '../../../services/api.product';

const ProductModal = ({ isOpen, onClose, mode, product }) => {

  const { fetchProducts, allAttributes, fetchWebAttributes } = useAppContext();
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    baseSalePrice: '',
    maxSalePrice: '',
    logisticsCharges: '',
    tax: '',
    taxType: 'percentage',
    discount: '',
    stock: '',
    visibility: 'Hidden',
    categoryId: '',
    productCategoryId: '',
    is_variation: false
  });

  const [currentVariation, setCurrentVariation] = useState({
    attribute_id: '',
    variation: '',
    base_sale_price: '',
    max_sale_price: '',
    qty: '',
    length: '',
    bust: '',
    waist: '',
    hip: '',
    color_code: '',
  });

  const [variationsByAttribute, setVariationsByAttribute] = useState({});
  const [previewImages, setPreviewImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    fetchWebAttributes();
  }, []);

  useEffect(() => {
    
    if (product && mode !== 'add') {
      // Set basic product information
      setFormData({
        productName: product.name || '',
        description: product.description || '',
        baseSalePrice: product.base_sale_price || '',
        maxSalePrice: product.max_sale_price || '',
        logisticsCharges: product.logistics_charges || '',
        tax: product.tax || '',
        taxType: product.tax_type || 'percentage',
        discount: product.discount || '',
        stock: product.stock || '',
        visibility: product.visibility || 'Draft',
        categoryId: product.product_category_id || '',
        productCategoryId: product.sub_category_id || '',
        is_variation: product.is_variation || false
      });
      console.log(formData);
      

      // Handle variations
      if (product.Variations?.length > 0) {
        const groupedVariations = product.Variations.reduce((acc, variation) => {
          const attributeId = variation.attribute_id;
          if (!acc[attributeId]) {
            acc[attributeId] = {
              attribute_name: variation.Attribute.attribute,
              values: []
            };
          }
          acc[attributeId].values.push({
            variation: variation.variation,
            base_sale_price: variation.base_sale_price,
            max_sale_price: variation.max_sale_price,
            qty: variation.qty,
            length: variation.length,
            bust: variation.bust,
            waist: variation.waist,
            hip: variation.hip,
            color_code: variation.color_code,
          });
          return acc;
        }, {});
        setVariationsByAttribute(groupedVariations);
      }

      // Handle images
      if (product.images?.length > 0) {
        setPreviewImages(product.images);
      }
    }
  }, [product, mode]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleVariationInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentVariation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddVariation = () => {
    if (!currentVariation.attribute_id || !currentVariation.variation) return;

    setVariationsByAttribute(prev => {
      const attributeId = currentVariation.attribute_id;
      const attribute = allAttributes.find(attr => attr.id === parseInt(attributeId));
      
      return {
        ...prev,
        [attributeId]: {
          attribute_name: attribute?.attribute || '',
          values: [
            ...(prev[attributeId]?.values || []),
            {
              variation: currentVariation.variation,
              base_sale_price: currentVariation.base_sale_price,
              max_sale_price: currentVariation.max_sale_price,
              qty: currentVariation.qty,
              length: currentVariation.length,
              bust: currentVariation.bust,
              waist: currentVariation.waist,
              hip: currentVariation.hip,
            }
          ]
        }
      };
    });

    // Reset current variation form
    setCurrentVariation({
      attribute_id: '',
      variation: '',
      base_sale_price: '',
      max_sale_price: '',
      qty: '',
      length: '',
      bust: '',
      waist: '',
      hip: '',
      color_code: '',
    });
  };

  const handleRemoveVariation = (attributeId, valueIndex) => {
    setVariationsByAttribute(prev => {
      const newVariations = { ...prev };
      newVariations[attributeId].values.splice(valueIndex, 1);
      if (newVariations[attributeId].values.length === 0) {
        delete newVariations[attributeId];
      }
      return newVariations;
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(prev => [...prev, ...files]);
    
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    
    // Append basic product information
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });

    // Handle variations
    if (formData.is_variation) {
      const variationsToSend = Object.entries(variationsByAttribute).flatMap(([attributeId, data]) =>
        data.values.map(value => ({
          attribute_id: parseInt(attributeId),
          variation: value.variation,
          base_sale_price: value.base_sale_price,
          max_sale_price: value.max_sale_price,
          qty: value.qty,
          length: value.length,
          bust: value.bust,
          waist: value.waist,
          hip: value.hip,
          color_code: value.color_code,
        }))
      );
      formDataToSend.append('variations', JSON.stringify(variationsToSend));
    }

    // Append images
    selectedImages.forEach(image => {
      formDataToSend.append('images', image);
    });

    try {
      const response = await updateProduct(product.id, formDataToSend);
      if (response.status === 1) {
        await fetchProducts();
        onClose();
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[black] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {mode === "view" ? "View Product" : "Edit Product"}
            </h2>
            <button onClick={onClose} className="p-2">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name
                  </label>
                  {mode === "view" ? (
                    <p>{product.name}</p>
                  ) : (
                    <input
                      type="text"
                      name="productName"
                      value={formData.productName}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Sale Price
                  </label>
                  {mode === "view" ? (
                    <p>{product.base_sale_price}</p>
                  ) : (
                    <input
                      type="number"
                      name="baseSalePrice"
                      value={formData.baseSalePrice}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Variations Section */}
            {formData.is_variation && (
              <div className="bg-white rounded-lg border shadow-sm p-6">
                {mode !== "view" && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4">Add Variation</h3>
                    <div className="grid grid-cols-5 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Attribute
                        </label>
                        <select
                          name="attribute_id"
                          value={currentVariation.attribute_id}
                          onChange={handleVariationInputChange}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="" disabled>Select Attribute</option>
                          {allAttributes?.map(attribute => (
                            <option key={attribute.id} value={attribute.id}>
                              {attribute.attribute}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Variation
                        </label>
                        <input
                          type="text"
                          name="variation"
                          value={currentVariation.variation}
                          onChange={handleVariationInputChange}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Base Price
                        </label>
                        <input
                          type="number"
                          name="base_sale_price"
                          value={currentVariation.base_sale_price}
                          onChange={handleVariationInputChange}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Price
                        </label>
                        <input
                          type="number"
                          name="max_sale_price"
                          value={currentVariation.max_sale_price}
                          onChange={handleVariationInputChange}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity
                        </label>
                        <input
                          type="number"
                          name="qty"
                          value={currentVariation.qty}
                          onChange={handleVariationInputChange}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>

                      {/* Color Picker for Attribute ID 1 */}
                      {currentVariation.attribute_id == 1 && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Color
                            </label>
                            <input
                              type="text"
                              name="variation"
                              value={currentVariation.variation}
                              onChange={handleVariationInputChange}
                              placeholder="Color Name"
                              className="w-full p-2 border rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Color Code
                            </label>
                            <input
                              type="color"
                              name="color_code"
                              value={currentVariation.color_code || '#000000'}
                              onChange={handleVariationInputChange}
                              className="w-full p-1 border rounded-md"
                            />
                          </div>
                        </>
                      )}

                      {/* Size Specific Fields */}
                      {currentVariation.attribute_id == 2 &&
                        (
                          <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Length
                            </label>
                            <input
                              type="text"
                              name="length"
                              value={currentVariation.length}
                              onChange={handleVariationInputChange}
                              className="w-full p-2 border rounded-md"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Bust
                            </label>
                            <input
                              type="text"
                              name="bust"
                              value={currentVariation.bust}
                              onChange={handleVariationInputChange}
                              className="w-full p-2 border rounded-md"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Waist
                            </label>
                            <input
                              type="text"
                              name="waist"
                              value={currentVariation.waist}
                              onChange={handleVariationInputChange}
                              className="w-full p-2 border rounded-md"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Hip
                            </label>
                            <input
                              type="text"
                              name="hip"
                              value={currentVariation.hip}
                              onChange={handleVariationInputChange}
                              className="w-full p-2 border rounded-md"
                            />
                          </div>
                          </>
                        )
                      }
                    </div>
                    <button
                      type="button"
                      onClick={handleAddVariation}
                      className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                    >
                      Add Variation
                    </button>
                  </div>
                )}

                {/* Variations List */}
                <h3 className='font-semibold mb-2'>Variations List</h3>
                {Object.entries(variationsByAttribute).map(([attributeId, data]) => (
                  <div key={attributeId} className="mb-6">
                    <h4 className="font-medium mb-2">{data.attribute_name}</h4>
                    <div className="space-y-2">
                      {data.values.map((value, index) => (
                        <div key={index} className="flex items-center space-x-4 bg-gray-50 p-2 rounded-md">
                          <span>{value.variation}</span>
                          <span>Base Price: {value.base_sale_price}</span>
                          <span>Max Price: {value.max_sale_price}</span>
                          <span>Qty: {value.qty}</span>
                          {attributeId == 1 && (
                            <>
                              <span>{value.variation}</span>
                              <div 
                                className="w-6 h-6 rounded-full border" 
                                style={{ backgroundColor: value.color_code }}
                              />
                              <span>Color: {value.color_code}</span>
                            </>
                          )}
                          {
                            attributeId == 2 &&
                            (
                              <>
                              <span>Length: {value.length}</span>
                              <span>Bust: {value.bust}</span>
                              <span>Waist: {value.waist}</span>
                              <span>Hip: {value.hip}</span>
                              </>
                            )
                          }
                          <button
                            type="button"
                            onClick={() => handleRemoveVariation(attributeId, index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Images Section */}
            {previewImages && (
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images
                  </label>
                  {mode !== 'view' &&
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="mb-4"
                    />
                  }
                  <div className="grid grid-cols-4 gap-4">
                    {previewImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Preview ${index}`}
                          className="w-full h-32 object-cover rounded-md"
                        />
                        {mode !== 'view' &&
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        }
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              {mode === "edit" && (
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                >
                  Update Product
                </button>
              )}
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default ProductModal;