import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { editSuggestion } from '../../../services/api.suggestion';

const SuggestionModal = ({ isOpen, onClose, mode, Suggestion }) => {
  const [formData, setFormData] = useState({
    type: 'suggestion',
    title: '',
    description: '',
    tags: [],
  });

  useEffect(() => {
    if (Suggestion && mode !== 'add') {
      setFormData({
        type: Suggestion.type || '',
        title: Suggestion.title || '',
        description: Suggestion.description || '',
        tags: Suggestion.tags || '',
      });
    }
  }, [Suggestion, mode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleTagsChange = (e) => {
    const value = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      tags: value.split(',').map((tag) => tag.trim()),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (mode === 'edit') {
        await editSuggestion(Suggestion.id, formData);
        onClose();
      }
    } catch (error) {
      console.error('Failed to update coupon:', error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[black] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl text-black font-semibold mb-6">
          {mode === 'view'
            ? 'View Suggestion'
            : mode === 'edit'
            ? 'Edit Suggestion'
            : 'Add Suggestion'}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 shadow-md rounded-lg"
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            {mode === 'view' ? (
              <p className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                {formData.type}
              </p>
            ) : (
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="suggestion">Suggestion</option>
                <option value="task">Task</option>
                <option value="guide">Guide</option>
                <option value="improved_results">Improved Results</option>
              </select>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            {mode === 'view' ? (
              <p className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                {formData.title}
              </p>
            ) : (
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            {mode === 'view' ? (
              <p className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                {formData.description}
              </p>
            ) : (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Tags
            </label>
            {mode === 'view' ? (
              <p className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                {formData.tags}
              </p>
            ) : (
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleTagsChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter tags separated by commas"
              />
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            {mode !== 'view' && (
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Update Suggestion
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuggestionModal;
