import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { getAllSliders, updateSlider } from "../../../services/api.slider";
import { CiImageOn } from "react-icons/ci";
import { BsCameraVideo } from "react-icons/bs";
import { AiOutlineInfoCircle } from "react-icons/ai";

const SliderModal = ({ isOpen, onClose, mode, slider }) => {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    btnText: "",
    link: "",
    file_type: "image",
    image: "",
    video: "",
    mobile_image: "",
  });

  const [mediaFile, setMediaFile] = useState({
    file: null,
    preview: null,
  });

  const [mobileMediaFile, setMobileMediaFile] = useState({
    file: null,
    preview: null,
  });

  const [error, setErrors] = useState({});

  useEffect(() => {
    if (slider && mode !== "add") {
      setFormData({
        title: slider.title || "",
        subtitle: slider.subtitle || "",
        btnText: slider.btnText || "",
        link: slider.link || "",
        file_type: slider.file_type || "image",
        image: slider.image || "",
        video: slider.video || "",
        mobile_image: slider.mobile_image || "",
      });

      setMediaFile({
        file: null,
        preview: slider.image || slider.video || null,
      });

      setMobileMediaFile({
        file: null,
        preview: slider.mobile_image || null,
      });
    } else if (mode === "add") {
      setFormData({
        title: "",
        subtitle: "",
        btnText: "",
        link: "",
        file_type: "image",
        image: "",
        video: "",
        mobile_image: "",
      });

      setMediaFile({
        file: null,
        preview: null,
      });

      setMobileMediaFile({
        file: null,
        preview: null,
      });
    }
  }, [slider, mode, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      if (files.length > 0) {
        const file = files[0];
        if (name === "mobile_image") {
          setMobileMediaFile({
            file: file,
            preview: URL.createObjectURL(file),
          });
        } else {
          setMediaFile({
            file: file,
            preview: URL.createObjectURL(file),
          });
        }
      }
    } else if (type === "radio" && name === "file_type") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        image: null,
        video: null,
        mobile_image: null,
      }));

      setMediaFile({
        file: null,
        preview: null,
      });

      setMobileMediaFile({
        file: null,
        preview: null,
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const removeMedia = (type) => {
    if (type === "mobile_image") {
      setMobileMediaFile({
        file: null,
        preview: null,
      });
      setFormData((prev) => ({
        ...prev,
        mobile_image: null,
      }));
    } else {
      setMediaFile({
        file: null,
        preview: null,
      });
      setFormData((prev) => ({
        ...prev,
        image: null,
        video: null,
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

    if (
      formData.file_type === "image" &&
      !mediaFile.file &&
      !mediaFile.preview
    ) {
      newErrors.file = "Image is required";
    }
    if (
      formData.file_type === "video" &&
      !mediaFile.file &&
      !mediaFile.preview
    ) {
      newErrors.file = "Video is required";
    }
    if (
      formData.file_type === "image" &&
      !mobileMediaFile.file &&
      !mobileMediaFile.preview
    ) {
      newErrors.mobile_image = "Mobile image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataToSend = new FormData();

    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== "") {
        formDataToSend.append(key, formData[key]);
      }
    });

    if (mediaFile.file) {
      formDataToSend.append(
        formData.file_type === "image" ? "image" : "video",
        mediaFile.file
      );
    }

    if (mobileMediaFile.file) {
      formDataToSend.append("mobile_image", mobileMediaFile.file);
    }

    try {
      if (mode === "edit") {
        const response = await updateSlider(slider?.id, formDataToSend);
        if (response.status === 1) {
          await getAllSliders();
          onClose();
        }
      } else if (mode === "add") {
        // Note: AddSlider function should be imported and used here if needed
        // const response = await addSlider(formDataToSend);
        // if (response?.status === 1) {
        //   await getAllSliders();
        //   onClose();
        // }
      }
    } catch (error) {
      console.error("Error updating slider:", error);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[black] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {mode === "view"
                ? "View Slider"
                : mode === "edit"
                ? "Edit Slider"
                : "Add Slider"}
            </h2>
            <button onClick={onClose} className="p-2">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  {mode === "view" ? (
                    <p>{formData.title}</p>
                  ) : (
                    <>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                        required
                      />
                      {error.title && (
                        <p className="text-red-500 text-sm mt-1">
                          {error.title}
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle
                  </label>
                  {mode === "view" ? (
                    <p>{formData.subtitle}</p>
                  ) : (
                    <input
                      type="text"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button Text
                  </label>
                  {mode === "view" ? (
                    <p>{formData.btnText}</p>
                  ) : (
                    <input
                      type="text"
                      name="btnText"
                      value={formData.btnText}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link
                  </label>
                  {mode === "view" ? (
                    <p>{formData.link}</p>
                  ) : (
                    <>
                      <input
                        type="text"
                        name="link"
                        value={formData.link}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-md"
                        required
                      />
                      {error.link && (
                        <p className="text-red-500 text-sm mt-1">
                          {error.link}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {mode !== "view" && (
              <div className="bg-white rounded-lg border shadow-sm p-6">
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

                  {getSizeGuidelines()}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg border shadow-sm p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.file_type === "image"
                    ? "Slider Image"
                    : "Slider Video"}
                </label>

                {mode !== "view" && (
                  <div>
                    {formData.file_type === "image" ? (
                      <div
                        className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400"
                        onClick={() =>
                          document.getElementById("media-upload").click()
                        }
                      >
                        <input
                          id="media-upload"
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
                        {mediaFile.file && (
                          <p className="mt-2 text-sm text-gray-500">
                            {mediaFile.file.name}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div
                        className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400"
                        onClick={() =>
                          document.getElementById("media-upload").click()
                        }
                      >
                        <input
                          id="media-upload"
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
                        {mediaFile.file && (
                          <p className="mt-2 text-sm text-gray-500">
                            {mediaFile.file.name}
                          </p>
                        )}
                      </div>
                    )}

                    {error.file && (
                      <p className="text-red-500 text-sm mt-1">{error.file}</p>
                    )}
                  </div>
                )}

                {formData.file_type === "image" && mode !== "view" && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Slider Image
                    </label>
                    <div
                      className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400"
                      onClick={() =>
                        document.getElementById("mobile-media-upload").click()
                      }
                    >
                      <input
                        id="mobile-media-upload"
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
                      {mobileMediaFile.file && (
                        <p className="mt-2 text-sm text-gray-500">
                          {mobileMediaFile.file.name}
                        </p>
                      )}
                    </div>
                    {error.mobile_image && (
                      <p className="text-red-500 text-sm mt-1">
                        {error.mobile_image}
                      </p>
                    )}
                  </div>
                )}

                {(mediaFile.preview || mobileMediaFile.preview) && (
                  <div className="mt-4 space-y-4">
                    {mediaFile.preview && (
                      <div className="relative inline-block">
                        {formData.file_type === "image" ? (
                          <img
                            src={mediaFile.preview}
                            alt="Slider Preview"
                            className="w-64 h-36 object-cover rounded-md"
                          />
                        ) : (
                          <video
                            src={mediaFile.preview}
                            controls
                            className="w-64 h-36 object-cover rounded-md"
                          />
                        )}
                        {mode !== "view" && (
                          <button
                            type="button"
                            onClick={() => removeMedia("media")}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                    {formData.file_type === "image" &&
                      mobileMediaFile.preview && (
                        <div className="relative inline-block">
                          <img
                            src={mobileMediaFile.preview}
                            alt="Mobile Slider Preview"
                            className="w-64 h-36 object-cover rounded-md"
                          />
                          {mode !== "view" && (
                            <button
                              type="button"
                              onClick={() => removeMedia("mobile_image")}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              {mode !== "view" && (
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F47954] text-white rounded-md hover:bg-[#e66a45] transition-colors"
                >
                  {mode === "edit" ? "Update Slider" : "Save Slider"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SliderModal;
