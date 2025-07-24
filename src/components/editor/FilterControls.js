import React, { useState } from 'react';
import Button from '../ui/Button';
import Slider from '../ui/Slider';
import { imageProcessor } from '../../utils/imageProcessor';

function FilterControls({ originalImage, setProcessedImage, hasProLicense }) {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  const applyFilters = () => {
    if (!originalImage) return;

    const filteredImage = imageProcessor.applyFilters(originalImage, {
      brightness: brightness / 100,
      contrast: contrast / 100,
      saturation: saturation / 100,
    });
    
    setProcessedImage(filteredImage);
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  const applyPreset = (preset) => {
    if (!hasProLicense) {
      alert('Filter presets are available in Pro version!');
      return;
    }

    switch (preset) {
      case 'vintage':
        setBrightness(90);
        setContrast(110);
        setSaturation(80);
        break;
      case 'vibrant':
        setBrightness(105);
        setContrast(120);
        setSaturation(130);
        break;
      case 'bw':
        setSaturation(0);
        setContrast(110);
        break;
      default:
        break;
    }
  };

  return (
    <div className="filter-controls">
      <div className="sliders">
        <Slider
          label="Brightness"
          value={brightness}
          onChange={setBrightness}
          min={0}
          max={200}
        />
        
        <Slider
          label="Contrast"
          value={contrast}
          onChange={setContrast}
          min={0}
          max={200}
        />
        
        <Slider
          label="Saturation"
          value={saturation}
          onChange={setSaturation}
          min={0}
          max={200}
        />
      </div>

      <div className="filter-buttons">
        <Button onClick={applyFilters} variant="primary">
          ✨ Apply Filters
        </Button>
        
        <Button onClick={resetFilters} variant="secondary">
          🔄 Reset
        </Button>
      </div>

      {hasProLicense && (
        <div className="preset-filters">
          <h4>Quick Presets:</h4>
          <div className="preset-buttons">
            <Button onClick={() => applyPreset('vintage')} variant="secondary">
              📸 Vintage
            </Button>
            <Button onClick={() => applyPreset('vibrant')} variant="secondary">
              🌈 Vibrant
            </Button>
            <Button onClick={() => applyPreset('bw')} variant="secondary">
              ⚫ B&W
            </Button>
          </div>
        </div>
      )}

      {!hasProLicense && (
        <div className="pro-feature">
          <p>🔒 Unlock preset filters with Pro!</p>
        </div>
      )}
    </div>
  );
}

export default FilterControls;
