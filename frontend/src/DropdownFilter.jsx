import React, { useState, useRef, useEffect } from 'react';
import './DropdownFilter.css';

const DropdownFilter = ({ label, values, selectedValue, onChange }) => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (val) => {
        if (selectedValue === val) {
            onChange(''); // Désélectionne si déjà sélectionné
            // Ne ferme pas le menu pour permettre de choisir autre chose
        } else {
            onChange(val);
            setOpen(false); // Ferme le menu si on sélectionne une nouvelle valeur
        }
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
        setOpen(false);
    };

    return (
        <div className="dropdown-filter" ref={dropdownRef}>
            <button
                className="dropdown-toggle"
                onClick={() => setOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={open}
                type="button"
            >
                <span style={{ fontWeight: selectedValue ? 600 : 400 }}>
                    {selectedValue || label}
                </span>
                {selectedValue && (
                    <span
                        className="clear-x"
                        title="Retirer le filtre"
                        onClick={handleClear}
                        style={{
                            marginLeft: 8,
                            color: '#fff',
                            background: '#c40000',
                            borderRadius: '50%',
                            width: 18,
                            height: 18,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            cursor: 'pointer',
                            border: 'none',
                        }}
                    >
                        ×
                    </span>
                )}
                <svg className={`dropdown-arrow${open ? ' open' : ''}`} width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            {open && (
                <ul className="dropdown-menu" role="listbox">
                    {values.map((val) => (
                        <li
                            key={val}
                            className={`dropdown-item${selectedValue === val ? ' selected' : ''}`}
                            role="option"
                            aria-selected={selectedValue === val}
                            onClick={() => handleSelect(val)}
                        >
                            {val}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DropdownFilter;
