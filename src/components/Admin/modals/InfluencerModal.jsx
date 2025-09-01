import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { updateInfluencer, getAllInfluencers } from "../../../services/api.influencer";

const InfluencerModal = ({ isOpen, onClose, mode, influencer }) => {

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    dob: "",
    followers: "",
    bio: "",
    tags: "",
    is_popular: false,
  });

  const [avatar, setAvatar] = useState({
    file: null,
    preview: null,
  });

  useEffect(() => {
    if (influencer && mode !== "add") {
      setFormData({
        first_name: influencer.first_name || "",
        last_name: influencer.last_name || "",
        email: influencer.email || "",
        phone: influencer.phone || "",
        dob: influencer.dob || "",
        followers: influencer.followers || "",
        bio: influencer.bio || "",
        tags: influencer.tags || "",
        is_popular: influencer.is_popular || false,
      });

      setAvatar({
        file: null,
        preview: influencer.avatar || null,
      });
    }
  }, [influencer, mode]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAvatarChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const file = files[0];
      setAvatar({
        file: file,
        preview: URL.createObjectURL(file),
      });
    }
  };

  const removeAvatar = () => {
    setAvatar({
      file: null,
      preview: null,
    });
  };

  const validateForm = () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      alert("First Name, Last Name, and Email are required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataToSend = new FormData();

    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    if (avatar.file) {
      formDataToSend.append("avatar", avatar.file);
    }

    try {
      const response = await updateInfluencer(influencer?.id, formDataToSend);
      if (response.status === 1) {
        await getAllInfluencers();
        onClose();
      }
    } catch (error) {
      console.error("Error updating influencer:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[black] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {mode === "view" ? "View influencer" : mode === "edit" ? "Edit influencer" : "Add influencer"}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  {mode === "view" ? (
                    <p>{influencer.first_name}</p>
                  ) : (
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  {mode === "view" ? (
                    <p>{influencer.last_name}</p>
                  ) : (
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  {mode === "view" ? (
                    <p>{influencer.email}</p>
                  ) : (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  {mode === "view" ? (
                    <p>{influencer.phone}</p>
                  ) : (
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      minlength={10}
                      maxlength={10}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  {mode === "view" ? (
                    <p>{influencer.dob}</p>
                  ) : (
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Followers</label>
                  {mode === "view" ? (
                    <p>{influencer.followers}</p>
                  ) : (
                    <input
                      type="number"
                      name="followers"
                      value={formData.followers}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  {mode === "view" ? (
                    <p>{influencer.bio}</p>
                  ) : (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                      rows="4"
                    />
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  {mode === "view" ? (
                    <p>{influencer.tags}</p>
                  ) : (
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md"
                    />
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Popular Influencer</label>
                  {mode === "view" ? (
                    <p>{influencer.is_popular ? "Yes" : "No"}</p>
                  ) : (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_popular"
                        checked={formData.is_popular}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span>Mark as Popular influencer</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Avatar Section */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">influencer Avatar</label>
                {mode !== "view" && (
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="mb-4" />
                )}
                {avatar.preview && (
                  <div className="relative inline-block">
                    <img src={avatar.preview} alt="Avatar Preview" className="w-32 h-32 object-cover rounded-md" />
                    {mode !== "view" && (
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50">
                Cancel
              </button>
              {mode === "edit" && (
                <button type="submit" className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                  Update influencer
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InfluencerModal;
