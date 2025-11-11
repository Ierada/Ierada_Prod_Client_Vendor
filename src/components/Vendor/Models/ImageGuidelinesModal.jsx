import { useState } from "react";
import { X, Info, Image, Check, AlertCircle } from "lucide-react";

export default function ImageGuidelinesModal({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[black] bg-opacity-50">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-white">
              <h2 className="text-xl font-bold text-gray-800">
                Image Upload Guidelines
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <Image className="w-5 h-5 mr-2 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Image Criteria
                  </h3>
                </div>
                <ul className="ml-8 space-y-2 list-disc text-gray-700">
                  <li>All images should have minimum resolution of 512x682.</li>
                  <li>You must provide minimum 1 image.</li>
                  <li>You can provide maximum 5 images.</li>
                  <li>Maximum image size is 2MB.</li>
                  <li>Maximum video size is 10MB.</li>
                </ul>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <Check className="w-5 h-5 mr-2 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Image Standards
                  </h3>
                </div>
                <ul className="ml-8 space-y-2 list-disc text-gray-700">
                  <li>Primary images should be in white background.</li>
                  <li>
                    Images with grey background can be used for white colored
                    products.
                  </li>
                  <li>Product should be displayed without packing.</li>
                  <li>Solo product image without any props.</li>
                  <li>Movie shots & scenes are not allowed.</li>
                  <li>
                    Celebrity face should not be morphed. However, if celebrity
                    is brand ambassador then you can include celebrity images
                    except as primary image.
                  </li>
                  <li>
                    The same model has to be used for all shots of a product in
                    lifestyle image.
                  </li>
                  <li>
                    The product should be center aligned and cover a minimum of
                    90% of the frame.
                  </li>
                </ul>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Following Images Will Be Rejected
                  </h3>
                </div>
                <ul className="ml-8 space-y-2 list-disc text-gray-700">
                  <li>Graphic/Inverted/Pixelated images are not accepted.</li>
                  <li>
                    Images with text/Watermark are not acceptable in primary
                    images.
                  </li>
                  <li>Blur images and clutter images are not accepted.</li>
                  <li>
                    Images should not contain price/brand logo for the product.
                  </li>
                  <li>
                    In case of sets or combos, the products should not overlap
                    each other.
                  </li>
                  <li>
                    Rear angle shot of a product should not be used as a primary
                    image.
                  </li>
                  <li>
                    Product images must not be shrunk, elongated or stretched.
                  </li>
                  <li>
                    Product with heavy accessories which covers the product are
                    not acceptable.
                  </li>
                  <li>Partial product image is not allowed.</li>
                  <li>
                    Offensive/Objectionable images/products are not acceptable.
                  </li>
                </ul>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <Info className="w-5 h-5 mr-2 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Image Format
                  </h3>
                </div>
                <ul className="ml-8 space-y-2 list-disc text-gray-700">
                  <li>
                    We only accept .JPEG images. Any other format is not
                    accepted.
                  </li>
                  <li>
                    We accept Images only in RGB color space. We don't accept
                    images in CMYK or any other color space.
                  </li>
                </ul>
              </div>

              {/* <div className="mb-6">
                <div className="flex items-center mb-3">
                  <Info className="w-5 h-5 mr-2 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Uploading & Providing Images
                  </h3>
                </div>
                <ul className="ml-8 space-y-2 list-disc text-gray-700">
                  <li>
                    Please upload your images in our recommended image domains
                    like Dropbox and Google drive.
                  </li>
                  <li>
                    Image download failures may happen from other
                    non-recommended, incompatible websites.
                  </li>
                  <li>
                    The share settings for viewing your image links must be
                    "Public", so that these images can be downloaded.
                  </li>
                </ul>
              </div> */}
            </div>

            {/* <div className="sticky bottom-0 flex justify-end p-4 border-t bg-gray-50">
              <button
                onClick={onClose}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div> */}
          </div>
        </div>
      )}
    </>
  );
}
