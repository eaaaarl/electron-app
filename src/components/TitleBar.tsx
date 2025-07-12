import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Minus, X, Square, Maximize2, ChevronDown } from 'lucide-react';

interface MenuItem {
  label?: string;
  action?: () => void;
  shortcut?: string;
  separator?: boolean;
  disabled?: boolean;
}

interface Menu {
  label: string;
  items: MenuItem[];
}

const TitleBar = ({ title = "My Electron App" }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    // Check initial maximized state
    if (window.ipcRenderer) {
      window.ipcRenderer.invoke("window-is-maximized").then((res) => {
        setIsMaximized(res);
      });
    }

    // Listen for window state changes from main process
    const handleWindowStateChange = (_event: Electron.IpcRendererEvent, data: { isMaximized: boolean }) => {
      setIsMaximized(data.isMaximized);
    };

    window.ipcRenderer?.on('window-state-changed', handleWindowStateChange);

    return () => {
      window.ipcRenderer?.off('window-state-changed', handleWindowStateChange);
    };
  }, []);

  const handleMinimize = () => {
    window.ipcRenderer?.invoke("window-minimize");
  };

  const handleMaximize = async () => {
    const newMaximizedState = await window.ipcRenderer?.invoke("window-maximize");
    setIsMaximized(newMaximizedState);
  };

  const handleClose = () => {
    window.ipcRenderer?.invoke("window-close");
  };

  // Menu definitions
  const menus: Menu[] = [
    {
      label: "File",
      items: [
        { label: "New", action: () => console.log("New"), shortcut: "Ctrl+N" },
        { label: "Open...", action: () => console.log("Open"), shortcut: "Ctrl+O" },
        { label: "Save", action: () => console.log("Save"), shortcut: "Ctrl+S" },
        { label: "Save As...", action: () => console.log("Save As"), shortcut: "Ctrl+Shift+S" },
        { separator: true },
        { label: "Print...", action: () => console.log("Print"), shortcut: "Ctrl+P" },
        { separator: true },
        { label: "Exit", action: handleClose, shortcut: "Alt+F4" },
      ]
    },
    {
      label: "Edit",
      items: [
        { label: "Undo", action: () => console.log("Undo"), shortcut: "Ctrl+Z" },
        { label: "Redo", action: () => console.log("Redo"), shortcut: "Ctrl+Y" },
        { separator: true },
        { label: "Cut", action: () => console.log("Cut"), shortcut: "Ctrl+X" },
        { label: "Copy", action: () => console.log("Copy"), shortcut: "Ctrl+C" },
        { label: "Paste", action: () => console.log("Paste"), shortcut: "Ctrl+V" },
        { label: "Select All", action: () => console.log("Select All"), shortcut: "Ctrl+A" },
      ]
    },
    {
      label: "View",
      items: [
        { label: "Zoom In", action: () => console.log("Zoom In"), shortcut: "Ctrl+=" },
        { label: "Zoom Out", action: () => console.log("Zoom Out"), shortcut: "Ctrl+-" },
        { label: "Reset Zoom", action: () => console.log("Reset Zoom"), shortcut: "Ctrl+0" },
        { separator: true },
        { label: "Toggle Fullscreen", action: () => console.log("Toggle Fullscreen"), shortcut: "F11" },
        { label: "Toggle Developer Tools", action: () => console.log("Toggle DevTools"), shortcut: "F12" },
      ]
    },
    {
      label: "Help",
      items: [
        { label: "About", action: () => console.log("About") },
        { label: "Documentation", action: () => console.log("Documentation") },
        { separator: true },
        { label: "Check for Updates", action: () => console.log("Check for Updates") },
      ]
    }
  ];

  const handleMenuClick = (menuLabel: string) => {
    setActiveMenu(activeMenu === menuLabel ? null : menuLabel);
  };

  const handleMenuItemClick = (action?: () => void) => {
    if (action) {
      action();
    }
    setActiveMenu(null);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenu(null);
    };

    if (activeMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeMenu]);

  return (
    <div className="flex items-center justify-between h-10 bg-gray-100 dark:bg-gray-800 drag border">
      {/* Menu Bar */}
      <div className="flex items-center h-full drag">
        {menus.map((menu) => (
          <div key={menu.label} className="relative">
            <button
              className={`px-3 py-1 h-10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1 no-drag ${activeMenu === menu.label ? 'bg-gray-200 dark:bg-gray-700' : ''
                }`}
              onClick={(e) => {
                e.stopPropagation();
                handleMenuClick(menu.label);
              }}
            >
              {menu.label}
              <ChevronDown className="h-3 w-3" />
            </button>

            {activeMenu === menu.label && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 min-w-48 no-drag">
                {menu.items.map((item, index) => (
                  <div key={index}>
                    {item.separator ? (
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    ) : (
                      <button
                        className={`w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!item.disabled) {
                            handleMenuItemClick(item.action);
                          }
                        }}
                        disabled={item.disabled}
                      >
                        <span>{item.label}</span>
                        {item.shortcut && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                            {item.shortcut}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* App title - centered */}
      <div className="flex items-center px-4 text-sm font-medium text-gray-700 dark:text-gray-300 absolute left-1/2 transform -translate-x-1/2">
        <img
          src="/src/assets/react.svg"
          alt="App Icon"
          className="h-5 w-5 mr-2"
        />
        {title}
      </div>

      {/* Window controls */}
      <div className="flex items-center no-drag">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-none hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={handleMinimize}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-none hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={handleMaximize}
        >
          {isMaximized ? <Square className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-none hover:bg-red-500 hover:text-white"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TitleBar;