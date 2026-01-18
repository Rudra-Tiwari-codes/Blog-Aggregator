'use client';

import { useState, FormEvent, KeyboardEvent } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    onClear: () => void;
}

export default function SearchBar({ onSearch, onClear }: SearchBarProps) {
    const [query, setQuery] = useState('');

    const handleSearch = () => {
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    const handleClear = () => {
        setQuery('');
        onClear();
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="search-wrapper">
            <input
                type="search"
                className="search-input"
                placeholder="search through my thoughts..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
            />
            <div className="search-actions">
                <button
                    className="btn btn-ghost btn-sm"
                    onClick={handleSearch}
                    aria-label="Search posts"
                >
                    search
                </button>
                <button
                    className="btn btn-ghost btn-sm"
                    onClick={handleClear}
                    aria-label="Clear search"
                >
                    clear
                </button>
            </div>
        </div>
    );
}
