import React, { useState, useEffect } from "react";
import { Plus, Settings, Trash } from "lucide-react";
import config from "../../../config/config";
import { useNavigate } from "react-router";
import { getThemes, deleteTheme } from "../../../services/api.producttheme";

const ProductThemeManager = () => {
  const [themes, setThemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    setIsLoading(true);
    try {
      const response = await getThemes();
      setThemes(response.data);
    } catch (error) {
      console.error("Error fetching themes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 mx-auto">Loading themes...</div>;
  }

  return (
    <div className="p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Theme Manager</h1>
        <button
          onClick={() =>
            navigate(`${config.VITE_BASE_ADMIN_URL}/managethemes/add`)
          }
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Theme
        </button>
      </div>

      <div className="space-y-4">
        {themes.length > 0 ? (
          themes.map((theme) => (
            <div key={theme.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold">{theme.title}</h3>
                    <p className="text-sm text-gray-500">{theme.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigate(
                        `${config.VITE_BASE_ADMIN_URL}/managethemes/managesections/${theme.id}`
                      );
                    }}
                    className="p-2 hover:bg-gray-100 rounded-md"
                  >
                    <Settings className="w-5 h-5" /> Manage Sections
                  </button>
                  <button
                    onClick={() => {
                      navigate(
                        `${config.VITE_BASE_ADMIN_URL}/managethemes/edit/${theme.id}`
                      );
                    }}
                    className="p-2 hover:bg-gray-100 rounded-md"
                  >
                    <Settings className="w-5 h-5" /> Edit Theme
                  </button>
                  <button
                    onClick={async () => {
                      const res = await deleteTheme(theme.id);
                      res && fetchThemes();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Trash className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            No themes available. Add your first theme to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductThemeManager;
