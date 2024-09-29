import { useState, useEffect } from "react";
import "./App.css";
import Render from "./Render";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";

function App() {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [currentScreen, setCurrentScreen] = useState("");
  const [elements, setInteractableElements] = useState([]);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const path = queryParams.get("path");
  const [currentPagePathB64, setCurrentPagePathB64] = useState(path || btoa("/"));
  // use query params to get "path" arg

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const path = queryParams.get("path");
    if (path) {
      setCurrentPagePathB64(path);
    }
  }, [location.search]);

  useEffect(() => {
    async function fetchPage(path: string) {
      const toastId = toast.loading("Navigating to page: " + atob(path));
      const response = await fetch(`/api?path=${path}`);
      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setCurrentScreen(data.screen);
      setInteractableElements(data.interactive_elements);
      setIsFirstLoad(false);
      toast.success("", {
        id: toastId,
      });
    }

    fetchPage(currentPagePathB64);
  }, [currentPagePathB64]);

  return (
    <div className="h-[100vh] w-[100vw] items-center justify-center bg-gradient-to-br from-black to-slate-700 p-0 m-0">
      <div className="flex justify-center items-center">
        {isFirstLoad == false && (
          <Render
            boxes={elements}
            currentScreen={currentScreen}
            setCurrentPagePath={setCurrentPagePathB64}
          ></Render>
        )}
      </div>
    </div>
  );
}

export default App;
