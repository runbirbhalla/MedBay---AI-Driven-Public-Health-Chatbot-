import React, { useState, useEffect } from "react";
import Link from "next/link";

const BotIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
);

const HomeIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const LayoutDashboardIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);

const MapPinIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CalendarIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const InfoIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const SunIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const ChevronLeftIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const PATHS = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  LOCATION: "/location",
  SCHEDULER: "/scheduler",
  ABOUT: "/about",
};

const navItems = [
  {
    name: "Home",
    path: PATHS.HOME,
    icon: <HomeIcon className="h-5 w-5 flex-shrink-0" />,
  },
  {
    name: "Dashboard",
    path: PATHS.DASHBOARD,
    icon: <LayoutDashboardIcon className="h-5 w-5 flex-shrink-0" />,
  },
  {
    name: "Nearby Hospital",
    path: PATHS.LOCATION,
    icon: <MapPinIcon className="h-5 w-5 flex-shrink-0" />,
  },
  {
    name: "Scheduler",
    path: PATHS.SCHEDULER,
    icon: <CalendarIcon className="h-5 w-5 flex-shrink-0" />,
  },
  {
    name: "About",
    path: PATHS.ABOUT,
    icon: <InfoIcon className="h-5 w-5 flex-shrink-0" />,
  },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [pathname, setPathname] = useState("");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    // Set pathname from window location after component mounts
    setPathname(window.location.pathname);
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
    setHydrated(true);
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
  };

  if (!hydrated) {
    // Don't render until hydration is done
    return null;
  }

  return (
    <aside
      className={`fixed top-4 left-4 z-50 flex h-[calc(100vh-2rem)] flex-col bg-gray-900/50 backdrop-blur-lg border border-gray-700/60 rounded-2xl transition-all duration-500 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-8 z-10 grid place-items-center w-6 h-6 bg-gray-800 text-gray-300 border border-gray-700 rounded-full hover:bg-green-500 hover:text-white transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeftIcon
          className={`w-4 h-4 transition-transform duration-500 ease-in-out ${
            isCollapsed ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      <div
        className={`flex items-center p-4 mb-4 transition-all duration-500 ease-in-out ${
          isCollapsed ? "justify-center" : "pl-5"
        }`}
      >
        <BotIcon className="h-8 w-8 text-green-400 flex-shrink-0 transition-transform duration-300 ease-in-out hover:scale-110" />
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isCollapsed ? "w-0 opacity-0" : "w-full ml-2 opacity-100"
          }`}
        >
          <span className="text-xl font-bold text-white whitespace-nowrap transition-all duration-300 ease-in-out">
            MedBay
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <div key={item.name} className="relative group">
                <Link
                  href={item.path}
                  className={`relative z-10 flex items-center px-3 py-3 rounded-lg transition-all duration-300 ease-in-out overflow-hidden ${
                    isActive ? "text-green-300 bg-green-500/10" : "text-gray-400 hover:text-white hover:bg-green-500/5"
                  } ${isCollapsed ? "justify-center" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {/* Icon container with hover effects */}
                  <div
                    className={`
                      p-2 rounded-full 
                      transition-all duration-300 ease-in-out
                      ${isActive ? "bg-green-500/20 scale-110 text-green-400" : "group-hover:bg-green-500/20 group-hover:scale-110 group-hover:text-green-400"}
                      flex items-center justify-center
                    `}
                  >
                    {item.icon}
                  </div>

                  {/* Label text */}
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      isCollapsed ? "w-0 opacity-0" : "w-full ml-3 opacity-100"
                    }`}
                  >
                    <span className="font-medium whitespace-nowrap transition-all duration-300 ease-in-out">
                      {item.name}
                    </span>
                  </div>

                  {/* Active indicator dot */}
                  {isActive && !isCollapsed && (
                    <div className="absolute right-3 w-2 h-2 bg-green-400 rounded-full animate-pulse transition-all duration-300 ease-in-out" />
                  )}
                </Link>

                {/* Tooltip for collapsed sidebar */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-gray-800 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out pointer-events-none whitespace-nowrap">
                    {item.name}
                    {isActive && <span className="ml-1 text-green-400">•</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Theme Toggle Section */}
      <div className="p-4 border-t border-gray-700/60 transition-all duration-300 ease-in-out">
        

        {/* Tooltip for theme toggle when collapsed */}
        {isCollapsed && (
          <div className="absolute left-full bottom-4 mb-4 ml-4 px-2 py-1 bg-gray-800 text-white text-sm rounded-md shadow-lg opacity-0 hover:opacity-100 transition-all duration-300 ease-in-out pointer-events-none whitespace-nowrap">
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </div>
        )}
      </div>
    </aside>
  );
}