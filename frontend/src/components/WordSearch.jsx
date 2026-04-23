import React, { useState, useEffect, useCallback, useRef } from 'react';

const WORDS = ['ROBOT', 'CODE', 'SENSOR', 'ARDUINO', 'SCRATCH', 'LEGO', 'ENGINEER', 'DRONE', 'CIRCUIT', 'MECHANIC'];
const GRID_SIZE = 12;
const SELECTION_COLORS = [
  '#0072bc', // Official Brand Blue
  '#ff4081', // Pink
  '#28a745', // Green
  '#f0c419', // Gold
  '#9c27b0', // Purple
  '#ff5722', // Orange
  '#00bcd4', // Cyan
  '#673ab7', // Deep Purple
  '#3ddc97', // Mint
  '#e91e63'  // Raspberry
];

export default function WordSearch() {
  const [grid, setGrid] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [isWon, setIsWon] = useState(false);
  
  // Drag Selection State
  const [isDragging, setIsDragging] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null); // {r, c}
  const [selectionEnd, setSelectionEnd] = useState(null);     // {r, c}
  const [currentSelection, setCurrentSelection] = useState([]); // List of {r, c}
  const [permanentFoundCells, setPermanentFoundCells] = useState([]); // List of {r, c}

  const generateGrid = useCallback(() => {
    let newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
    
    // Place words
    WORDS.forEach(word => {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        const direction = Math.floor(Math.random() * 3); // 0: Horiz, 1: Vert, 2: Diag
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);

        if (canPlace(newGrid, word, row, col, direction)) {
          placeWord(newGrid, word, row, col, direction);
          placed = true;
        }
        attempts++;
      }
    });

    // Fill empty spots
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (newGrid[r][c] === '') {
          newGrid[r][c] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }

    setGrid(newGrid);
    setFoundWords([]);
    setCurrentSelection([]);
    setPermanentFoundCells([]);
    setIsWon(false);
  }, []);

  useEffect(() => {
    generateGrid();
  }, [generateGrid]);

  function canPlace(grid, word, row, col, dir) {
    if (dir === 0 && col + word.length > GRID_SIZE) return false;
    if (dir === 1 && row + word.length > GRID_SIZE) return false;
    if (dir === 2 && (row + word.length > GRID_SIZE || col + word.length > GRID_SIZE)) return false;

    for (let i = 0; i < word.length; i++) {
      let r = row, c = col;
      if (dir === 0) c += i;
      if (dir === 1) r += i;
      if (dir === 2) { r += i; c += i; }
      if (grid[r][c] !== '' && grid[r][c] !== word[i]) return false;
    }
    return true;
  }

  function placeWord(grid, word, row, col, dir) {
    for (let i = 0; i < word.length; i++) {
      let r = row, c = col;
      if (dir === 0) c += i;
      if (dir === 1) r += i;
      if (dir === 2) { r += i; c += i; }
      grid[r][c] = word[i];
    }
  }

  // --- Drag Selection Logic ---

  const getCellsBetween = (start, end) => {
    if (!start || !end) return [];
    const cells = [];
    const dr = end.r - start.r;
    const dc = end.c - start.c;
    
    // Determine direction
    const absDr = Math.abs(dr);
    const absDc = Math.abs(dc);
    
    const isHorizontal = dr === 0;
    const isVertical = dc === 0;
    const isDiagonal = absDr === absDc;

    if (!isHorizontal && !isVertical && !isDiagonal) return [{ r: start.r, c: start.c }];

    const length = Math.max(absDr, absDc);
    const stepR = dr === 0 ? 0 : dr / absDr;
    const stepC = dc === 0 ? 0 : dc / absDc;

    for (let i = 0; i <= length; i++) {
      cells.push({
        r: start.r + i * stepR,
        c: start.c + i * stepC
      });
    }
    return cells;
  };

  const handleMouseDown = (r, c) => {
    if (isWon) return;
    setIsDragging(true);
    setSelectionStart({ r, c });
    setSelectionEnd({ r, c });
    setCurrentSelection([{ r, c }]);
  };

  const handleMouseEnter = (r, c) => {
    if (!isDragging) return;
    setSelectionEnd({ r, c });
    setCurrentSelection(getCellsBetween(selectionStart, { r, c }));
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    const selectedText = currentSelection.map(cell => grid[cell.r][cell.c]).join('');
    const reversedText = selectedText.split('').reverse().join('');

    if ((WORDS.includes(selectedText) || WORDS.includes(reversedText)) && !foundWords.includes(selectedText) && !foundWords.includes(reversedText)) {
      const wordFound = WORDS.includes(selectedText) ? selectedText : reversedText;
      const colorIndex = foundWords.length % SELECTION_COLORS.length;
      const color = SELECTION_COLORS[colorIndex];
      
      setFoundWords(prev => [...prev, wordFound]);
      setPermanentFoundCells(prev => [...prev, ...currentSelection.map(cell => ({ ...cell, color }))]);
      
      if (foundWords.length + 1 === WORDS.length) {
        setIsWon(true);
      }
    }

    setIsDragging(false);
    setSelectionStart(null);
    setSelectionEnd(null);
    setCurrentSelection([]);
  };

  const handleTouchStart = (e, r, c) => {
    if (isWon) return;
    // Prevent scrolling while playing
    if (e.cancelable) e.preventDefault();
    handleMouseDown(r, c);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    // Prevent scrolling while playing
    if (e.cancelable) e.preventDefault();

    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element && element.classList.contains('grid-cell')) {
      const r = parseInt(element.getAttribute('data-row'));
      const c = parseInt(element.getAttribute('data-col'));
      
      if (!isNaN(r) && !isNaN(c)) {
        if (selectionEnd?.r !== r || selectionEnd?.c !== c) {
          setSelectionEnd({ r, c });
          setCurrentSelection(getCellsBetween(selectionStart, { r, c }));
        }
      }
    }
  };

  const handleTouchEnd = (e) => {
    handleMouseUp();
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, currentSelection]);

  const isCellSelected = (r, c) => currentSelection.some(cell => cell.r === r && cell.c === c);
  const getPermanentCell = (r, c) => permanentFoundCells.find(cell => cell.r === r && cell.c === c);

  return (
    <div className="word-search-container" onMouseLeave={() => isDragging && handleMouseUp()}>
      <div className="word-search-header">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, color: 'var(--accent)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          Robotics Word Search
        </h3>
      </div>

      <div className="word-search-layout">
        <div 
          className="word-grid" 
          onMouseLeave={() => {}}
          onTouchMove={handleTouchMove}
        >
          {grid.map((row, rIdx) => (
            <div key={rIdx} className="grid-row">
              {row.map((char, cIdx) => (
                <div 
                  key={cIdx} 
                  className={`grid-cell ${isCellSelected(rIdx, cIdx) ? 'selected' : ''} ${getPermanentCell(rIdx, cIdx) ? 'permanent' : ''}`}
                  data-row={rIdx}
                  data-col={cIdx}
                  style={getPermanentCell(rIdx, cIdx) ? { 
                    backgroundColor: `${getPermanentCell(rIdx, cIdx).color}15`, 
                    borderColor: getPermanentCell(rIdx, cIdx).color,
                    color: getPermanentCell(rIdx, cIdx).color,
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  } : {}}
                  onMouseDown={() => handleMouseDown(rIdx, cIdx)}
                  onMouseEnter={() => handleMouseEnter(rIdx, cIdx)}
                  onTouchStart={(e) => handleTouchStart(e, rIdx, cIdx)}
                >
                  {char}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="word-list">
          <h4>Word List</h4>
          <div className="list-columns">
            {WORDS.map(word => (
              <div 
                key={word} 
                className={`word-item ${foundWords.includes(word) ? 'found' : ''}`}
                style={foundWords.includes(word) ? { color: SELECTION_COLORS[WORDS.indexOf(word) % SELECTION_COLORS.length] } : {}}
              >
                <span className="dot" style={foundWords.includes(word) ? { backgroundColor: SELECTION_COLORS[WORDS.indexOf(word) % SELECTION_COLORS.length] } : {}}></span> {word}
              </div>
            ))}
          </div>
          <button 
            className="btn ghost" 
            onClick={generateGrid} 
            style={{ 
              marginTop: '20px', 
              width: '100%', 
              fontSize: '12px', 
              padding: '8px',
              borderRadius: '8px' 
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle' }}><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><polyline points="21 3 21 8 16 8"/></svg>
            Reset Puzzle
          </button>
        </div>
      </div>

      {isWon && (
        <div className="win-overlay" onClick={generateGrid}>
          <div className="win-card">
            <div className="win-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            </div>
            <h2>MISSION SUCCESS!</h2>
            <p>You found all robotics terminology!</p>
            <button className="btn ok" style={{ width: '100%', marginTop: '15px' }}>Play Again</button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .word-search-container {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.04);
          position: relative;
          max-width: 800px;
          margin: 0 auto;
        }
        .word-search-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f0f0f0;
        }
        .word-search-layout {
          display: flex;
          gap: 24px;
          align-items: flex-start;
          justify-content: center;
        }
        .word-grid {
          display: flex;
          flex-direction: column;
          gap: 3px;
          user-select: none;
          background: #f8faff;
          padding: 8px;
          border-radius: 12px;
          touch-action: none;
        }
        .grid-row {
          display: flex;
          gap: 3px;
        }
        .grid-cell {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border-radius: 4px;
          cursor: crosshair;
          font-weight: 700;
          font-size: 13px;
          color: #333;
          transition: transform 0.1s, background 0.1s;
        }
        .grid-cell:hover {
          background: #eef2ff;
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .grid-cell.selected {
          background: var(--accent);
          color: #fff;
          transform: scale(1.1);
          z-index: 2;
        }
        .grid-cell.permanent {
          transform: scale(1.05);
        }
        .word-list {
          flex: 0 0 180px;
          background: #f8faff;
          padding: 16px;
          border-radius: 12px;
          height: 100%;
        }
        .word-list h4 {
          margin: 0 0 12px;
          font-size: 14px;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .list-columns {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .word-item {
          font-size: 13px;
          font-weight: 600;
          color: #555;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }
        .word-item .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ddd;
        }
        .word-item.found {
          color: var(--ok);
          opacity: 0.6;
          text-decoration: line-through;
        }
        .word-item.found .dot {
          background: var(--ok);
        }
        .win-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          border-radius: 24px;
          animation: winPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .win-card {
          background: #fff;
          padding: 40px;
          border-radius: 32px;
          text-align: center;
          box-shadow: 0 30px 60px rgba(0,0,0,0.15);
          max-width: 320px;
        }
        .win-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        @keyframes winPop {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @media (max-width: 768px) {
          .word-search-layout {
            flex-direction: column;
            align-items: center;
          }
          .grid-cell {
            width: 26px;
            height: 26px;
            font-size: 11px;
          }
          .word-list {
            width: 100%;
            flex: none;
          }
          .list-columns {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
        }
      `}} />
    </div>
  );
}
