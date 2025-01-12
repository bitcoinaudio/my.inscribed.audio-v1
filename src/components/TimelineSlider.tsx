import React, { useEffect, useRef } from "react";

interface TimelineSliderProps {
  min: number;
  max: number;
  timeline: number;
  getPercentage: (timeline: number) => string;
  timeChange: (value: number) => void;
  sliderValue: number;
  thumbsliderImage: string;
  step: number;
}

const TimelineSlider: React.FC<TimelineSliderProps> = ({
  min,
  max,
  timeline,
  getPercentage,
  timeChange,
  sliderValue,
  thumbsliderImage,
  step,
}) => {
  const sliderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sliderRef.current) {
      // Update the slider position if timeline value changes
      const thumb = document.querySelector(".slider-thumb") as HTMLElement;
      if (thumb) {
        thumb.style.left = `calc(${getPercentage(timeline)} - 0.5em)`;
      }
    }
  }, [timeline, getPercentage]);

  return (
    <div className="range-slider">
      <input
        type="range"
        min={min}
        max={max}
        className="slider"
        value={sliderValue}
        onInput={(e) => {
          const value = (e.target as HTMLInputElement).valueAsNumber;
          timeChange(value);
        }}
        step={step}
        ref={sliderRef}
      />

      <img
        src={thumbsliderImage}
        alt=""
        className="slider-thumb"
        style={{
          left: `calc(${getPercentage(timeline)} - 0.5em)`,
        }}
      />

      <div
        className="progress"
        style={{
          left: `calc(${getPercentage(timeline)} - 0.5em)`,
        }}
      />
    </div>
  );
};

export default TimelineSlider;
