import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Define the type for each box
interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
  href: string;
  area: number;
  link_type: "internal" | "external" | "not_supported";
}

// Define the type for the props of OverlayImage
interface OverlayImageProps {
  boxes: Box[];
  currentScreen: string; // base64 encoded image
  setCurrentPagePath: (path: string) => void;
}

const Render: React.FC<OverlayImageProps> = ({ boxes, currentScreen }) => {
  const [hoveredBoxIndex, setHoveredBoxIndex] = useState<number | null>(null);
  const [scaleX, setScaleX] = useState<number>(1);
  const [scaleY, setScaleY] = useState<number>(1);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const navigate = useNavigate();

  const screenshotWidth = 1920;
  const screenshotHeight = 1080;

  const rescaleBoxes = () => {
    if (imageRef.current) {
      setScaleX(imageRef.current.clientWidth / screenshotWidth);
      setScaleY(imageRef.current.clientHeight / screenshotHeight);
    }
  };

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      rescaleBoxes();
    }

    // Add event listener
    window.addEventListener("resize", handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="overlay-container flex-0">
      <img
        src={`${currentScreen}`}
        alt="Overlay"
        ref={imageRef}
        className="overlay-image"
        onLoad={rescaleBoxes}
      />
      {boxes.map((box, index) => (
        <div
          key={index}
          className={`overlay-box ${
            hoveredBoxIndex === index ? "visible" : ""
          }`}
          style={{
            left: `${box.x * scaleX}px`,
            top: `${box.y * scaleY}px`,
            width: `${box.width * scaleX}px`,
            height: `${box.height * scaleY}px`,
          }}
          onMouseEnter={() => setHoveredBoxIndex(index)}
          onMouseLeave={() => setHoveredBoxIndex(-1)}
          onMouseDown={() => {
            switch (box.link_type) {
              case "not_supported":
                toast.error("This link type is not supported");
                break;
              case "external":
                toast.error(
                  "For security reasons, external links are disabled"
                );
                break;
              case "internal": {
                navigate({
                  pathname: "/",
                  search: `?path=${btoa(box.href)}`,
                });

                break;
              }
            }
          }}
        />
      ))}
    </div>
  );
};

export default Render;
