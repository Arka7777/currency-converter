// src/components/FavoritePairs.jsx
import React, { useState, useEffect } from "react";

export default function FavoritePairs({ onSelectPair, currentFrom, currentTo }) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("currencyFavorites");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  const saveCurrentPair = () => {
    const pair = { from: currentFrom, to: currentTo };
    if (!favorites.some(fav => fav.from === pair.from && fav.to === pair.to)) {
      const updatedFavorites = [...favorites, pair];
      setFavorites(updatedFavorites);
      localStorage.setItem("currencyFavorites", JSON.stringify(updatedFavorites));
    }
  };

  const removeFavorite = (from, to) => {
    const updatedFavorites = favorites.filter(fav => !(fav.from === from && fav.to === to));
    setFavorites(updatedFavorites);
    localStorage.setItem("currencyFavorites", JSON.stringify(updatedFavorites));
  };

  const isCurrentFavorite = favorites.some(fav => fav.from === currentFrom && fav.to === currentTo);

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-700">Favorite Pairs</h3>
        <button
          onClick={saveCurrentPair}
          disabled={isCurrentFavorite}
          className="p-2 text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed"
          title="Add current pair to favorites"
        >
          {isCurrentFavorite ? "✓ Saved" : "★ Add Current"}
        </button>
      </div>
      
      {favorites.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {favorites.map((fav, index) => (
            <div 
              key={index} 
              className={`p-2 rounded flex justify-between items-center cursor-pointer ${fav.from === currentFrom && fav.to === currentTo ? 'bg-blue-100' : 'bg-white hover:bg-gray-100'}`}
              onClick={() => onSelectPair(fav.from, fav.to)}
            >
              <span>{fav.from} → {fav.to}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(fav.from, fav.to);
                }}
                className="text-red-500 hover:text-red-700"
                title="Remove from favorites"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No favorite pairs yet. Add current pair to favorites.</p>
      )}
    </div>
  );
}