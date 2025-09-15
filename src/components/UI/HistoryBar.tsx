import { useState, useEffect } from 'react'
import './styles.css'

interface HistoryBarProps {
  history: string[]
  onClear: () => void
}

export function HistoryBar({ history, onClear }: HistoryBarProps) {
  const [showAll, setShowAll] = useState(false)
  
  // Limit visible items when not expanded
  const maxVisibleItems = 20
  const displayHistory = showAll ? history : history.slice(-maxVisibleItems)
  const hasMore = history.length > maxVisibleItems
  
  // Auto-scroll to end when new move is added
  useEffect(() => {
    const container = document.querySelector('.history-bar-items')
    if (container) {
      container.scrollLeft = container.scrollWidth
    }
  }, [history])
  
  // Get color for move notation
  const getMoveColor = (move: string): string => {
    const face = move[0].toUpperCase()
    switch (face) {
      case 'F': return '#4CAF50' // Green
      case 'B': return '#2196F3' // Blue
      case 'U': return '#FFF'    // White
      case 'D': return '#FFD700' // Yellow
      case 'R': return '#F44336' // Red
      case 'L': return '#FF9800' // Orange
      case 'M': 
      case 'E': 
      case 'S': return '#9E9E9E' // Gray for middle layers
      case 'X':
      case 'Y':
      case 'Z': return '#673AB7' // Purple for whole cube rotations
      default: return '#616161'  // Dark gray
    }
  }
  
  return (
    <div className="history-bar">
      <div className="history-bar-content">
        {hasMore && !showAll && (
          <button 
            className="history-expand-btn"
            onClick={() => setShowAll(true)}
          >
            +{history.length - maxVisibleItems} more
          </button>
        )}
        
        <div className="history-bar-items">
          {displayHistory.map((move, index) => (
            <div 
              key={index} 
              className="history-item"
              style={{ 
                backgroundColor: getMoveColor(move),
                color: move.startsWith('U') ? '#333' : '#FFF'
              }}
            >
              {move}
            </div>
          ))}
        </div>
        
        {history.length > 0 && (
          <button 
            className="history-clear-btn"
            onClick={onClear}
          >
            Clear
          </button>
        )}
      </div>
      
      {history.length > 0 && (
        <div className="history-counter">
          {history.length} move{history.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}