import React, { useState, useEffect, useRef } from "react";
import CommonTopBanner from "../../../components/Website/CommonTopBanner";
import common_top_banner from "/assets/banners/Commen-top-banner.png";
import { AccountInfo } from "../../../components/Website/AccountInfo";
import {
  deleteNotification,
  getNotifications,
  markNotificationAsRead,
} from "../../../services/api.notification";
import { useAppContext } from "../../../context/AppContext";
import { FaCheckCircle, FaTrashAlt } from "react-icons/fa";

const bannerData = [
  {
    id: 1,
    image: common_top_banner,
  },
];

const Notifications = () => {
  const { user, setTriggerHeaderCounts } = useAppContext();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const hasFetched = useRef(false);

  const fetchNotifications = async (reset = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const currentOffset = reset ? 0 : offset;
      const res = await getNotifications(user.id, 10, currentOffset);

      if (res?.data) {
        setNotifications((prev) => (reset ? res.data : [...prev, ...res.data]));
        console.log("jsdnj", res.date);
        setOffset(reset ? 10 : currentOffset + 10);
        setHasMore(res.data.length === 10);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshNotifications = async () => {
    setOffset(0);
    setHasMore(true);
    await fetchNotifications(true);
  };

  const handleNotificationRead = async (id) => {
    const res = await markNotificationAsRead(id);
    if (res) {
      await refreshNotifications();
      setTriggerHeaderCounts((prev) => !prev);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      const res = await deleteNotification(id);
      if (res) {
        await refreshNotifications();
        setTriggerHeaderCounts((prev) => !prev);
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      refreshNotifications();
    }
  }, [user.id]);

  return (
    <main>
      <CommonTopBanner bannerData={bannerData} />

      <section className="w-full">
        <div className="text-center my-10 text-[#000000]">
          <h1 className="text-2xl lg:text-4xl font-semibold mb-2 font-Playfair">
            My Account
          </h1>
          <p className="text-sm lg:text-base font-Lato font-medium">
            Home / My Notification
          </p>
        </div>
        <div className="bg-white px-4 md:px-5 lg:px-20 flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-1/3 lg:w-1/4">
            <AccountInfo activeSection="notifications" />
          </div>
          <div className="mt-10 md:w-4/5">
            <div className="space-y-2 mb-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex justify-between items-center border py-3 px-4 hover:bg-gray-100 transition ${
                    notification.is_read ? "bg-gray-50" : "bg-gray-200"
                  }`}
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleNotificationRead(notification.id)}
                  >
                    <p className="text-[#2D3954] text-sm font-poppins font-normal">
                      {notification.message}
                    </p>
                    <div className="text-right text-[#2D3954] text-sm font-poppins font-normal flex space-x-2">
                      <p>
                        {new Date(notification.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </p>
                      <p>
                        {new Date(notification.created_at).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {!notification.is_read && (
                      <FaCheckCircle
                        title="Mark as Read"
                        className="text-green-500 cursor-pointer text-lg"
                        onClick={() => handleNotificationRead(notification.id)}
                      />
                    )}
                    <FaTrashAlt
                      title="Delete Notification"
                      className="text-red-500 cursor-pointer text-lg"
                      onClick={() => handleDeleteNotification(notification.id)}
                    />
                  </div>
                </div>
              ))}

              {loading && (
                <p className="text-center text-[#2D3954] text-sm">
                  Loading notifications...
                </p>
              )}

              {!loading && hasMore && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => fetchNotifications(false)}
                    className="px-4 py-2 bg-[#2D3954] text-white text-sm font-poppins rounded hover:bg-[#1B283C] transition"
                  >
                    Load More
                  </button>
                </div>
              )}

              {!hasMore && (
                <p className="text-center text-[#2D3954] text-sm mt-4">
                  {notifications.length === 0
                    ? "No new notifications."
                    : "No more notifications."}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Notifications;
