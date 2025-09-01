import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getSettings, updateSettings } from '../../../services/api.settings';
import { useAppContext } from '../../../context/AppContext';

const SettingsManagement = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const { showNotification } = useAppContext();

  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image state management
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);
  const [ogImagePreview, setOgImagePreview] = useState(null);

  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [ogImageFile, setOgImageFile] = useState(null);

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getSettings();
        setSettings(response.data);
        
        // Set form values
        Object.keys(response.data).forEach(key => {
          setValue(key, response.data[key]);
        });

        // Set image previews
        if (response.data.logo) setLogoPreview(response.data.logo);
        if (response.data.favicon) setFaviconPreview(response.data.favicon);
        if (response.data.og_image) setOgImagePreview(response.data.og_image);
      } catch (error) {
        showNotification('Error fetching settings', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Image change handlers
  const handleImageChange = (type, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        switch(type) {
          case 'logo':
            setLogoPreview(reader.result);
            setLogoFile(file);
            break;
          case 'favicon':
            setFaviconPreview(reader.result);
            setFaviconFile(file);
            break;
          case 'og_image':
            setOgImagePreview(reader.result);
            setOgImageFile(file);
            break;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image handler
  const handleRemoveImage = (type) => {
    switch(type) {
      case 'logo':
        setLogoPreview(null);
        setLogoFile(null);
        setValue('logo', '');
        break;
      case 'favicon':
        setFaviconPreview(null);
        setFaviconFile(null);
        setValue('favicon', '');
        break;
      case 'og_image':
        setOgImagePreview(null);
        setOgImageFile(null);
        setValue('og_image', '');
        break;
    }
  };

  // Submit handler
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();

      // Append all form data
      Object.keys(data).forEach(key => {
        if (data[key] && data[key] !== '') {
          formData.append(key, data[key]);
        }
      });

      // Append files if they exist
      if (logoFile) formData.append('logo', logoFile);
      if (faviconFile) formData.append('favicon', faviconFile);
      if (ogImageFile) formData.append('og_image', ogImageFile);

      const response = await updateSettings(formData);
      
      showNotification('Settings updated successfully', 'success');
    } catch (error) {
      showNotification('Error updating settings', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Website Settings</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Site Information Section */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Site Title</label>
              <input
                type="text"
                {...register('site_title')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Enter site title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Meta Title</label>
              <input
                type="text"
                {...register('meta_title')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Enter meta title"
              />
            </div>
          </div>

          {/* Logo Management Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange('logo', e)}
                className="hidden"
                id="logo-upload"
              />
              <label 
                htmlFor="logo-upload" 
                className="px-4 py-2 bg-pink-50 text-pink-600 rounded-md cursor-pointer hover:bg-pink-100"
              >
                Upload Logo
              </label>
              {logoPreview && (
                <div className="flex items-center space-x-2">
                  <img 
                    src={logoPreview} 
                    alt="Logo Preview" 
                    className="h-16 w-16 object-contain"
                  />
                  <button 
                    type="button"
                    onClick={() => handleRemoveImage('logo')}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Similar sections for Favicon and OG Image */}
          {/* Favicon Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange('favicon', e)}
                className="hidden"
                id="favicon-upload"
              />
              <label 
                htmlFor="favicon-upload" 
                className="px-4 py-2 bg-pink-50 text-pink-600 rounded-md cursor-pointer hover:bg-pink-100"
              >
                Upload Favicon
              </label>
              {faviconPreview && (
                <div className="flex items-center space-x-2">
                  <img 
                    src={faviconPreview} 
                    alt="Favicon Preview" 
                    className="h-16 w-16 object-contain"
                  />
                  <button 
                    type="button"
                    onClick={() => handleRemoveImage('favicon')}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* OG Image Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">OG Image</label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange('og_image', e)}
                className="hidden"
                id="og-image-upload"
              />
              <label 
                htmlFor="og-image-upload" 
                className="px-4 py-2 bg-pink-50 text-pink-600 rounded-md cursor-pointer hover:bg-pink-100"
              >
                Upload OG Image
              </label>
              {ogImagePreview && (
                <div className="flex items-center space-x-2">
                  <img 
                    src={ogImagePreview} 
                    alt="OG Image Preview" 
                    className="h-16 w-16 object-contain"
                  />
                  <button 
                    type="button"
                    onClick={() => handleRemoveImage('og_image')}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Additional Settings */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <input
                type="text"
                {...register('currency')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Enter currency (e.g., USD)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Currency Position</label>
              <select
                {...register('currency_position')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Facebook</label>
              <input
                type="url"
                {...register('facebook')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Facebook Page URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Twitter</label>
              <input
                type="url"
                {...register('twitter')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Twitter Profile URL"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsManagement;