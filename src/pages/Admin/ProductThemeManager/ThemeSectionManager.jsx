import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Plus, X, Settings, ChevronDown, ChevronUp, Trash } from "lucide-react";
import { MdDragHandle } from "react-icons/md";
import config from "../../../config/config";
import { useNavigate, useParams } from "react-router";
import {
  getThemeSections,
  updateThemeSectionPositions,
  updateThemeSectionStatus,
  deleteThemeSection,
} from "../../../services/api.producttheme";

const ThemeSectionManager = () => {
  const { themeId } = useParams();
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (themeId) {
      fetchSections();
    }
  }, [themeId]);

  const fetchSections = async () => {
    setIsLoading(true);
    try {
      const response = await getThemeSections(themeId);
      setSections(response.data);
    } catch (error) {
      console.error("Error fetching sections:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSectionActive = async (sectionId) => {
    try {
      const section = sections.find((s) => s.id === sectionId);
      if (!section) return;

      const newStatus = !section.is_active;

      await updateThemeSectionStatus(themeId, sectionId, newStatus);

      setSections(
        sections.map((s) =>
          s.id === sectionId ? { ...s, is_active: newStatus } : s
        )
      );
    } catch (error) {
      console.error("Error toggling section status:", error);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSections(items);

    try {
      await updateThemeSectionPositions(themeId, {
        positions: items.map((item, index) => ({
          id: item.id,
          position: index + 1,
        })),
      });
    } catch (error) {
      console.error("Error updating positions:", error);
    }
  };

  if (isLoading) {
    return <div className="p-6 max-w-7xl mx-auto">Loading sections...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Theme Section Manager</h1>
        <button
          onClick={() =>
            navigate(
              `${config.VITE_BASE_ADMIN_URL}/managethemes/addsection/${themeId}`
            )
          }
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {sections.length > 0 ? (
                sections.map((section, index) => (
                  <Draggable
                    key={section.id}
                    draggableId={section.id.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="bg-white rounded-lg shadow p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div {...provided.dragHandleProps}>
                              <MdDragHandle className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{section.title}</h3>
                              <p className="text-sm text-gray-500">
                                {section.type}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={async () => {
                                const res = await deleteThemeSection(
                                  themeId,
                                  section.id
                                );
                                res && fetchSections();
                              }}
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              <Trash className="w-5 h-5 text-red-600" />
                            </button>
                            <button
                              onClick={() => {
                                navigate(
                                  `${config.VITE_BASE_ADMIN_URL}/managethemes/editsection/${themeId}/${section.id}`
                                );
                              }}
                              className="p-2 hover:bg-gray-100 rounded-md"
                            >
                              <Settings className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => toggleSectionActive(section.id)}
                              className={`p-2 rounded-md ${
                                section.is_active
                                  ? "bg-green-100 text-green-600"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {section.is_active ? "Active" : "Inactive"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  No sections available. Add your first section to get started.
                </div>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default ThemeSectionManager;
