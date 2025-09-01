import React, { useState } from "react";
import { CiImageOn } from "react-icons/ci";
import { BsCameraVideo } from "react-icons/bs";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { addSlider } from "../../../services/api.slider";
import { useNavigate } from "react-router";

const AddSlider = () => {
  const [error, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    discount_price: "",
    file_type: "image",
    btnText: "",
    link: "",
    image: null,
    video: null,
    mobile_image: null,
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      if (name === "video") {
        setFormData((prev) => ({
          ...prev,
          video: files[0],
          image: null,
          mobile_image: null,
        }));
      } else if (name === "image") {
        setFormData((prev) => ({
          ...prev,
          image: files[0],
          video: null,
          mobile_image: null,
        }));
      } else if (name === "mobile_image") {
        setFormData((prev) => ({
          ...prev,
          mobile_image: files[0],
          video: null,
        }));
      }
    } else if (type === "radio" && name === "file_type") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        image: null,
        video: null,
        mobile_image: null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.link.trim()) {
      newErrors.link = "Link is required";
    }

    if (formData.file_type === "image" && !formData.image) {
      newErrors.file = "Image is required";
    }
    if (formData.file_type === "video" && !formData.video) {
      newErrors.file = "Video is required";
    }
    if (formData.file_type === "image" && !formData.mobile_image) {
      newErrors.mobile_image = "Mobile image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== "") {
        submitData.append(key, formData[key]);
      }
    });

    try {
      const response = await addSlider(submitData);
      if (response?.status === 1) {
        setFormData({
          title: "",
          subtitle: "",
          discount_price: "",
          file_type: "image",
          btnText: "",
          link: "",
          image: null,
          video: null,
          mobile_image: null,
        });
        navigate(-1);
      }
    } catch (error) {
      console.error("Error submitting slider:", error);
    }
  };

  const getSizeGuidelines = () => {
    if (formData.file_type === "image") {
      return (
        <div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center mb-1">
            <AiOutlineInfoCircle className="text-blue-600 mr-2" />
            <h4 className="font-medium text-blue-800">Image Guidelines:</h4>
          </div>
          <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
            <li>
              Desktop Image Recommended resolution: 1920×550 pixels (16:9 ratio)
            </li>
            <li>Mobile Image Recommended resolution: 768×220 pixels</li>
            <li>Minimum width: 1200 pixels (desktop), 768 pixels (mobile)</li>
            <li>Maximum file size: 5MB</li>
            <li>Supported formats: JPG, PNG, WebP</li>
            <li>
              For best results, use high-quality images with good contrast for
              text visibility
            </li>
          </ul>
        </div>
      );
    } else {
      return (
        <div className="mt-2 p-4 bg-purple-50 rounded-lg border border-purple-100">
          <div className="flex items-center mb-1">
            <AiOutlineInfoCircle className="text-purple-600 mr-2" />
            <h4 className="font-medium text-purple-800">Video Guidelines:</h4>
          </div>
          <ul className="list-disc list-inside text-sm text-purple-700 mt-2 space-y-1">
            <li>Recommended resolution: 1920×550 pixels (16:9 ratio)</li>
            <li>Recommended duration: 15-30 seconds</li>
            <li>Maximum file size: 50MB</li>
            <li>Supported formats: MP4, WebM</li>
            <li>For best performance, use H.264 codec for MP4 files</li>
          </ul>
        </div>
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Add a New Slider
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                placeholder="Enter title"
              />
              {error.title && (
                <p className="text-red-500 text-sm mt-1">{error.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Subtitle
              </label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                placeholder="Enter subtitle (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Button Text
              </label>
              <input
                type="text"
                name="btnText"
                value={formData.btnText}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                placeholder="Enter button text (optional)"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Link
              </label>
              <input
                type="text"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                placeholder="Enter link"
              />
              {error.link && (
                <p className="text-red-500 text-sm mt-1">{error.link}</p>
              )}
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                File Type
              </label>
              <div className="space-y-2">
                {[
                  { value: "image", label: "Image", icon: CiImageOn },
                  { value: "video", label: "Video", icon: BsCameraVideo },
                ].map((type) => (
                  <div key={type.value} className="flex items-center">
                    <input
                      type="radio"
                      id={`file_type_${type.value}`}
                      name="file_type"
                      value={type.value}
                      checked={formData.file_type === type.value}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-black focus:ring-black border-gray-300"
                    />
                    <label
                      htmlFor={`file_type_${type.value}`}
                      className="ml-2 text-sm text-gray-700 flex items-center"
                    >
                      <type.icon className="mr-1 text-lg" />
                      {type.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {getSizeGuidelines()}

            {formData.file_type === "image" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Upload Desktop Image
                  </label>
                  <div
                    className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400"
                    onClick={() =>
                      document.getElementById("image-upload").click()
                    }
                  >
                    <input
                      id="image-upload"
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleInputChange}
                      className="hidden"
                    />
                    <CiImageOn className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Click to upload slider image
                    </p>
                    {formData.image && (
                      <p className="mt-2 text-sm text-gray-500">
                        {formData.image.name}
                      </p>
                    )}
                  </div>
                  {error.file && (
                    <p className="text-red-500 text-sm mt-1">{error.file}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Upload Mobile Image
                  </label>
                  <div
                    className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400"
                    onClick={() =>
                      document.getElementById("mobile-image-upload").click()
                    }
                  >
                    <input
                      id="mobile-image-upload"
                      type="file"
                      name="mobile_image"
                      accept="image/*"
                      onChange={handleInputChange}
                      className="hidden"
                    />
                    <CiImageOn className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Click to upload mobile slider image
                    </p>
                    {formData.mobile_image && (
                      <p className="mt-2 text-sm text-gray-500">
                        {formData.mobile_image.name}
                      </p>
                    )}
                  </div>
                  {error.mobile_image && (
                    <p className="text-red-500 text-sm mt-1">
                      {error.mobile_image}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Upload Video
                </label>
                <div
                  className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400"
                  onClick={() =>
                    document.getElementById("video-upload").click()
                  }
                >
                  <input
                    id="video-upload"
                    type="file"
                    name="video"
                    accept="video/*"
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <BsCameraVideo className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload slider video
                  </p>
                  {formData.video && (
                    <p className="mt-2 text-sm text-gray-500">
                      {formData.video.name}
                    </p>
                  )}
                </div>
                {error.file && (
                  <p className="text-red-500 text-sm mt-1">{error.file}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-4">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-[#F47954] text-white rounded-md hover:bg-[#e66a45] transition-colors"
        >
          Save Slider
        </button>
      </div>
    </div>
  );
};

export default AddSlider;
