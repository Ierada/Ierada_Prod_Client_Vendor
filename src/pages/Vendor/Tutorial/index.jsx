import React, { useState, useEffect, useCallback, memo } from 'react';
import { ChevronRight, PlayCircle } from 'lucide-react';

// Separate the tutorial content into its own file in practice
const TUTORIAL_CONTENT = {
  id: "Introduction",
  title: "Introduction",
  content: [
    "Overview of the Dashboard",
    "Importance of Using the Dashboard Efficiently",
    "Key Features and Benefits for Vendors",
  ],
  link: "EngW7tLk6R8",

  sections: [
    {
      id: "GettingStarted",
      title: "Getting Started",
      content: [
        "New to Vendors? Here's some help to get started:",
        "How to Login and Navigate the Dashboard",
        "Setting Up Your Account: Profile Setup and Interface Overview",
        "Navigating the Dashboard Menu",
      ],
      link: "https://youtu.be/EngW7tLk6R8?si=Z81EaLI-drPx-wxq",
    },
    {
      id: "ProductManagement",
      title: "Product Management",
      content: [
        "Making Product Listings: Step-by-Step Guide",
        "Inventory Management: Tracking Stock Levels and Variants",
      ],
      link: "https://youtu.be/EngW7tLk6R8?si=Z81EaLI-drPx-wxq",
    },
    {
      id: "OrderManagement",
      title: "Order Management",
      content: [
        "Viewing and Processing Orders",
        "Managing Returns and Refunds",
        "Tracking Shipping and Delivery Status",
      ],
      link: "https://youtu.be/EngW7tLk6R8?si=Z81EaLI-drPx-wxq",
    },
    {
      id: "SalesAnalytics",
      title: "Sales & Analytics",
      content: ["Understanding Sales Reports", "Monitoring Performance Metrics", "Using Analytics to Boost Sales"],
    },
    {
      id: "PromotionsDiscounts",
      title: "Promotions & Discounts",
      content: [
        "How to Create and Manage Discount Deals",
        "Setting Up Freebies and Special Offers",
        "Best Practices for Running Successful Campaigns",
      ],
      link: "https://youtu.be/EngW7tLk6R8?si=Z81EaLI-drPx-wxq",
    },
    {
      id: "CustomerSupport",
      title: "Customer Support",
      content: [
        "Managing Customer Inquiries and Complaints",
        "How to Use the Messaging System",
        "Resolving Issues and Maintaining Customer Satisfaction",
      ],
      link: "https://youtu.be/EngW7tLk6R8?si=Z81EaLI-drPx-wxq",
    },
    {
      id: "PaymentPayouts",
      title: "Payment & Payouts",
      content: [
        "Overview of Payment Methods and Gateways",
        "Tracking Payouts and Downloading Reports",
        "Handling Payment Disputes",
      ],
      link: "https://youtu.be/EngW7tLk6R8?si=Z81EaLI-drPx-wxq",
    },
    {
      id: "ComplianceSecurity",
      title: "Compliance & Security",
      content: [
        "Ensuring Product Compliance with Platform Policies",
        "Best Practices for Secure Selling and Operations",
        "Understanding Vendor Responsibilities and Platform Rules",
      ],
      link: "https://youtu.be/EngW7tLk6R8?si=Z81EaLI-drPx-wxq",
    },
    {
      id: "FAQs",
      title: "FAQs",
      content: ["Common questions and their answers for new vendors"],
      link: "https://youtu.be/EngW7tLk6R8?si=Z81EaLI-drPx-wxq",
    },
  ],
};

// Memoized section component for better performance
const TutorialSection = memo(({ section, isActive }) => (
  <div id={section.id} className="scroll-mt-16">
    <div className={`bg-white rounded-lg shadow transition-shadow duration-300 ${isActive ? 'shadow-lg' : 'shadow-sm'}`}>
      <div className="p-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          {section.title}
        </h2>
        
        {section.link && (
          <a 
            href={section.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <PlayCircle size={20} />
            Watch Tutorial Video
          </a>
        )}
        
        <ul className="space-y-2">
          {section.content.map((point, index) => (
            <li key={index} className="flex items-start gap-2">
              <ChevronRight className="mt-1 flex-shrink-0" size={16} />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
));

// Memoized navigation item component
const NavItem = memo(({ section, isActive, onClick }) => (
  <li
    onClick={onClick}
    className={`
      cursor-pointer px-4 py-2 rounded-md transition-all
      ${isActive ? 
        'bg-blue-100 text-blue-800 font-medium' : 
        'hover:bg-gray-100'
      }
    `}
  >
    {section.title}
  </li>
));

const TutorialPage = () => {
  const [activeSection, setActiveSection] = useState("Introduction");
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY;
    
    // Hide/show nav based on scroll direction
    setIsNavVisible(scrollPosition <= lastScrollY);
    setLastScrollY(scrollPosition);
    
    // Update active section
    const scrollOffset = 200;
    TUTORIAL_CONTENT.sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element && 
          element.offsetTop <= scrollPosition + scrollOffset && 
          element.offsetTop + element.offsetHeight > scrollPosition + scrollOffset) {
        setActiveSection(section.id);
      }
    });
  }, [lastScrollY]);

  useEffect(() => {
    const throttledScroll = () => {
      window.requestAnimationFrame(handleScroll);
    };
    
    window.addEventListener("scroll", throttledScroll);
    return () => window.removeEventListener("scroll", throttledScroll);
  }, [handleScroll]);

  const handleNavigationClick = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveSection(id);
  }, []);

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="w-full lg:w-3/4 p-4 lg:p-8 space-y-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">
              {TUTORIAL_CONTENT.title}
            </h1>
            
            <ul className="space-y-2 mb-6">
              {TUTORIAL_CONTENT.content.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <ChevronRight className="mt-1 flex-shrink-0" size={16} />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            
            {TUTORIAL_CONTENT.link && (
              <div className="mt-6">
                <iframe
                  className="w-full aspect-video rounded-lg shadow-md"
                  src={`https://www.youtube.com/embed/${TUTORIAL_CONTENT.link}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {TUTORIAL_CONTENT.sections.map((section) => (
            <TutorialSection
              key={section.id}
              section={section}
              isActive={activeSection === section.id}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav
        className={`
          fixed -right-2 lg:w-1/5 
          sticky-header-offset
          transform transition-transform duration-300
          ${isNavVisible ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          bg-white rounded-xl
        `}
      >
        <div className="p-4 h-full overflow-y-auto">
          <ul className="space-y-2 pr-4">
            {TUTORIAL_CONTENT.sections.map((section) => (
              <NavItem
                key={section.id}
                section={section}
                isActive={activeSection === section.id}
                onClick={() => handleNavigationClick(section.id)}
              />
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default TutorialPage;