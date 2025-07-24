import React from 'react';

function Slider({ label, value, onChange, min = 0, max = 100, step = 1 }) {
  return (
    <div className="slider-container">
      <label className="slider-label">
        {label}: {value}
      </label>
      <input
        type="range"
        className="slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export default Slider;
