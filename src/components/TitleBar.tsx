import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Minus, X, Square, Maximize2 } from 'lucide-react';

const TitleBar = ({ title = "My Electron App" }) => {
  const [isMaximized, setIsMaximized] = useState(false);

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

  return (
    <div className="flex items-center justify-between h-10 bg-gray-100 dark:bg-gray-800 drag border">
      {/* App title */}
      <div className="flex items-center px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
        <img
          src="/src/assets/react.svg"
          alt="App Icon"
          className="h-5 w-5 mr-2"
        />
        {title}
      </div>
      {/* Window controls */}
      <div className="flex items-center no-drag ">
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