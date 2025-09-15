import { useState, useCallback } from 'react'

interface ZoomControlProps {
  onZoomChange?: (zoom: number) => void
}

export function ZoomControl({ onZoomChange }: ZoomControlProps) {
  const [zoom, setZoom] = useState(1)
  
  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom)
    onZoomChange?.(newZoom)
  }, [onZoomChange])
  
  return (
    <div className="zoom-control">
      <div className="zoom-header">
        <h4>🔍 Zoom</h4>
        <div className="zoom-value">{Math.round(zoom * 100)}%</div>
      </div>
      
      <div className="zoom-slider-container">
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={zoom}
          onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
          className="zoom-slider"
        />
        
        <div className="zoom-labels">
          <span className="zoom-label">200%</span>
          <span className="zoom-label">150%</span>
          <span className="zoom-label">100%</span>
          <span className="zoom-label">75%</span>
          <span className="zoom-label">50%</span>
        </div>
      </div>
      
      <div className="zoom-buttons">
        <button 
          onClick={() => handleZoomChange(Math.min(2.0, zoom + 0.1))}
          className="zoom-btn"
        >
          +
        </button>
        <button 
          onClick={() => handleZoomChange(Math.max(0.5, zoom - 0.1))}
          className="zoom-btn"
        >
          -
        </button>
      </div>
    </div>
  )
}