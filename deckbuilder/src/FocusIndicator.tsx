import React, {
  useEffect,
  useState,
  useCallback,
} from "react";

// Focus Indicator is a transparent div that sits on top of the selected element
// it takes the selected element as input and always stays in sync with it
// there is probably an open source component that does this better...
const FocusIndicator: React.FC<{ selectedElement: HTMLElement | null }> = (
  { selectedElement }
) => {
  const [overlayPosition, setOverlayPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  const updatePositionFromElement = useCallback((element: HTMLElement) => {
    setOverlayPosition({
      top: element.offsetTop,
      left: element.offsetLeft,
      width: element.offsetWidth,
      height: element.offsetHeight,
    });
  }, []);

  const listenForElementResize = useCallback(
    (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        const element = entry.target as HTMLElement;
        if (element) {
          updatePositionFromElement(element);
        }
      }
    },
    [updatePositionFromElement]
  );

  // when the selected element changes, register a resize observer for the highlight overlay
  useEffect(() => {
    if (selectedElement) {
      updatePositionFromElement(selectedElement);
      const observer = new ResizeObserver(listenForElementResize);
      observer.observe(selectedElement);
      return () => observer.disconnect();
    }
  }, [
    selectedElement,
    listenForElementResize,
    updatePositionFromElement,
  ]);

  return (
    <div
      id="_LevaAdminOverlayId"
      style={{
        position: "absolute",
        boxShadow: "inset 0 0 0 2px #89CFF0",
        backgroundColor: "transparent",
        pointerEvents: "none",
        top: overlayPosition.top,
        left: overlayPosition.left,
        width: overlayPosition.width,
        height: overlayPosition.height,
      }}
    />
  );
};

export default FocusIndicator;