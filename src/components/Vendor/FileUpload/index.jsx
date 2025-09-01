import React, { useRef, useEffect } from 'react';
import { IoCloudUploadOutline, IoCamera } from 'react-icons/io5';
import { FiEye, FiEyeOff, FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-[black] bg-opacity-50"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-xl w-[90vw] max-w-3xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

const FileUpload = ({ 
  name, 
  label, 
  value, 
  accept = ".pdf,.jpg,.jpeg,.png", 
  preview, 
  onTogglePreview, 
  showPreview 
}) => {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        preview(name, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const isPDF = value?.toString().includes('data:application/pdf');
  const fileName = value instanceof File ? value.name : 'File';

  // Convert base64 to blob URL for PDF preview
  const getPDFUrl = (base64Data) => {
    try {
      // Remove the data URL prefix to get just the base64 data
      const base64Content = base64Data.split(',')[1];
      const byteCharacters = atob(base64Content);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      const blob = new Blob(byteArrays, { type: 'application/pdf' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error converting PDF:', error);
      return null;
    }
  };

  return (
    <>
      <div className="flex flex-col w-full">
        <label className="text-[black] text-sm mb-1">{label}</label>
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            name={name}
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
          
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex items-center justify-between w-full rounded-md border border-[#F2F2F2] shadow-sm p-2 bg-white">
            <span className="text-gray-400 truncate max-w-[200px]">
              {value instanceof File ? value.name : (value ? 'File uploaded' : 'Choose file')}
            </span>
            <div className="flex items-center gap-2">
              {value && (
                <button
                  type="button"
                  onClick={() => onTogglePreview(name)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  {showPreview ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              )}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="text-[black] hover:text-gray-700 transition-colors"
              >
                <IoCamera size={20} />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[black] hover:text-gray-700 transition-colors"
              >
                <IoCloudUploadOutline size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={showPreview && value} 
        onClose={() => onTogglePreview(name)}
        title={`${isPDF ? 'PDF Preview' : 'Image Preview'}: ${fileName}`}
      >
        {isPDF ? (
          <iframe
            src={getPDFUrl(value)}
            className="w-full h-full min-h-[calc(80vh-8rem)]"
            title="PDF Preview"
          />
        ) : (
          <img 
            src={value} 
            alt="Preview" 
            className="w-full h-full object-contain"
          />
        )}
      </Modal>
    </>
  );
};

export default FileUpload;