import React, { useState, useCallback } from 'react';

const MultiImageUpload = ({
  images = [],
  onImagesChange,
  onRemoveExisting,
  maxImages = 10,
  maxSizeMB = 5,
  disabled = false,
  showExistingImages = true,
  existingImages = [],
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    [disabled, images, maxImages, maxSizeMB, onImagesChange],
  );

  const handleFileChange = useCallback(
    (e) => {
      if (disabled) return;

      const files = Array.from(e.target.files);
      handleFiles(files);

      // Reset input value to allow selecting the same file again
      e.target.value = '';
    },
    [disabled, images, maxImages, maxSizeMB, onImagesChange],
  );

  const handleFiles = useCallback(
    (files) => {
      const validFiles = [];
      const errors = [];

      files.forEach((file) => {
        // Check if it's an image
        if (!file.type.startsWith('image/')) {
          errors.push(`${file.name} is not an image file`);
          return;
        }

        // Check file size
        if (file.size > maxSizeMB * 1024 * 1024) {
          errors.push(`${file.name} is larger than ${maxSizeMB}MB`);
          return;
        }

        // Check if we haven't exceeded max images
        if (images.length + validFiles.length >= maxImages) {
          errors.push(`Maximum ${maxImages} images allowed`);
          return;
        }

        validFiles.push(file);
      });

      if (errors.length > 0) {
        alert(errors.join('\n'));
      }

      if (validFiles.length > 0) {
        const newImages = [...images, ...validFiles];
        onImagesChange(newImages);
      }
    },
    [images, maxImages, maxSizeMB, onImagesChange],
  );

  const removeImage = useCallback(
    (index) => {
      if (disabled) return;

      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
    },
    [disabled, images, onImagesChange],
  );

  const removeExistingImage = useCallback(
    (index) => {
      if (disabled) return;

      console.log(
        'MULTI_IMAGE_UPLOAD: Removing existing image at index:',
        index,
      );

      // Call the parent component's remove function
      if (onRemoveExisting && typeof onRemoveExisting === 'function') {
        onRemoveExisting(index);
      } else {
        console.warn(
          'MULTI_IMAGE_UPLOAD: onRemoveExisting function not provided',
        );
      }
    },
    [disabled, onRemoveExisting],
  );

  return (
    <div className="space-y-4">
      {/* Existing Images Display */}
      {showExistingImages && existingImages && existingImages.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Images
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {existingImages.map((imageUrl, index) => (
              <div key={`existing-${index}`} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Existing ${index + 1}`}
                  className="w-full h-24 object-cover rounded-md border border-gray-300"
                />
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Images Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {existingImages && existingImages.length > 0
            ? 'Add More Images'
            : 'Images'}
          {!disabled && (
            <span className="text-xs text-gray-500 ml-2">
              ({images.length}/{maxImages} selected)
            </span>
          )}
        </label>

        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={disabled || images.length >= maxImages}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <div className="space-y-2">
            <svg
              className="mx-auto h-8 w-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                {images.length >= maxImages
                  ? `Maximum ${maxImages} images reached`
                  : 'Drag and drop images here, or click to select'}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Supports JPG, PNG, GIF, WebP • Max {maxSizeMB}MB each • Up to{' '}
              {maxImages} images
            </p>
          </div>
        </div>

        {/* Selected Images Preview */}
        {images.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Selected Images ({images.length})
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((file, index) => (
                <div key={`new-${index}`} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md border border-gray-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-md truncate">
                    {file.name}
                  </div>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiImageUpload;
