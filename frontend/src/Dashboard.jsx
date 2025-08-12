import React, { useState, useEffect } from 'react';
import DocumentTable from './DocumentTable';
import './Dashboard.css';
import { usePersistentState } from './usePersistentState';
import { uploadFile } from './services/fileUploadService';
import { exportToPDF } from './services/exportService';
import DropdownFilter from './DropdownFilter'; // en haut de ton fichier

function Dashboard() {
    // ✅ API base configurable via Vite
    const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

    // ✅ Persisted states in localStorage
    const [uploadId, setUploadId] = usePersistentState('uploadId', null);
    const [filters, setFilters] = usePersistentState('filters', {});
    const [selectedFileName, setSelectedFileName] = usePersistentState('selectedFileName', "");
    const [uploadedFiles, setUploadedFiles] = usePersistentState('uploadedFiles', []); // NEW ✅

    // ✅ Non-persistent states
    const [data, setData] = useState([]);
    const [allOptions, setAllOptions] = useState({});
    const [filteredOptions, setFilteredOptions] = useState({});
    const [searchTerm, setSearchTerm] = useState(""); // Not persisted by choice
    const [animatedCount, setAnimatedCount] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    // ✅ Handle multiple file uploads
    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        setIsUploading(true);
        for (const file of files) {
            try {
                const id = await uploadFile(file);

                const newFiles = [...uploadedFiles, { name: file.name, uploadId: id }];
                setUploadedFiles(newFiles);

                if (!uploadId) {
                    setUploadId(id);
                    setSelectedFileName(file.name);
                }
            } catch (error) {
                console.error('Upload error:', error);
                alert(`Erreur lors de l'import du fichier : ${file.name}`);
            }
        }
        setIsUploading(false);
    };

    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.body.className = theme;
        localStorage.setItem('theme', theme);
    }, [theme]);


    // ✅ Switch active dataset
    const handleDatasetChange = (id, name) => {
        setUploadId(id);
        setSelectedFileName(name);
        setFilters({});
        setData([]);
    };

    // ✅ Remove file from list
    const handleRemoveFile = (id) => {
        const updatedFiles = uploadedFiles.filter(file => file.uploadId !== id);
        setUploadedFiles(updatedFiles);

        if (uploadId === id) {
            setUploadId(null);
            setSelectedFileName("");
            setData([]);
            setAllOptions({});
            setFilteredOptions({});
        }
    };

    // ✅ Fetch filters after upload
    useEffect(() => {
        if (!uploadId) return;

        const fetchFilters = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/filters/all?uploadId=${uploadId}`);
                const json = await res.json();
                if (json && typeof json === 'object') {
                    setAllOptions(json);
                    setFilteredOptions(json);
                } else {
                    throw new Error("Invalid filter format");
                }
            } catch (err) {
                console.error(err);
                alert("Erreur lors du chargement des filtres.");
            }
        };

        fetchFilters();
    }, [uploadId]);

    // ✅ Reset filters
    const resetFilters = () => {
        setFilters({});
        setSearchTerm("");
    };

    // ✅ Fetch filtered data
    useEffect(() => {
        if (!uploadId || !Object.keys(allOptions).length) return;

        const fetchFilteredData = async () => {
            try {
                const queryParams = new URLSearchParams();
                queryParams.append('uploadId', uploadId);

                Object.entries(filters).forEach(([key, values]) => {
                    values.forEach(val => queryParams.append(key, val));
                });

                const res = await fetch(`${API_BASE}/api/data?${queryParams}`);
                const json = await res.json();

                if (json && Array.isArray(json.rows)) {
                    setData(json.rows);

                    // Update available filter options dynamically
                    const newOptions = {};
                    const remainingRows = json.rows;
                    Object.keys(allOptions).forEach(col => {
                        const unique = new Set(remainingRows.map(row => row[col]).filter(Boolean));
                        newOptions[col] = Array.from(unique);
                    });
                    setFilteredOptions(newOptions);
                } else {
                    setData([]);
                    setFilteredOptions({});
                }
            } catch (err) {
                console.error(err);
                alert("Erreur lors du chargement des données filtrées.");
            }
        };

        fetchFilteredData();
    }, [filters, uploadId, allOptions]);

    // ✅ Local search filter
    const filteredData = data.filter(row =>
        Object.values(row).some(val =>
            val.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // ✅ Animated count for results
    useEffect(() => {
        let start = animatedCount;
        const end = filteredData.length;
        if (start === end) return;

        const duration = 500;
        const stepTime = Math.abs(Math.floor(duration / (end - start || 1)));

        let timer = setInterval(() => {
            start < end ? start++ : start--;
            setAnimatedCount(start);
            if (start === end) clearInterval(timer);
        }, stepTime);

        return () => clearInterval(timer);
    }, [filteredData.length]);

    return (

        <div className="dashboard-container">
            {/* ✅ HEADER */}
            <div className="header">
                <div className="logo-title">
                    <img src="/logo.png" alt="logo" />
                    <h1>Dashboard Ooredoo</h1>
                </div>
                <div className="theme-toggle">
                    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                        {theme === 'light' ? '🌙 Mode sombre' : '☀️ Mode clair'}
                    </button>
                </div>

                {isUploading && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                        <p>Chargement en cours...</p>
                    </div>
                )}

                {uploadId && (
                    <div className="search-bar">
                        <svg xmlns="http://www.w3.org/2000/svg" className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                )}

                <div className="upload-section">
                    <label htmlFor="upload" className="upload-label">Choisir un ou plusieurs fichiers</label>
                    <input id="upload" type="file" accept=".xlsx" multiple onChange={handleFileUpload} />
                </div>
            </div>

            {/* ✅ File Switcher */}
            {uploadedFiles.length > 0 && (
                <div className="file-switcher">
                    {uploadedFiles.map((file) => (
                        <div key={file.uploadId} className="file-item">
                            <button
                                onClick={() => handleDatasetChange(file.uploadId, file.name)}
                                className={uploadId === file.uploadId ? 'active-file' : ''}
                            >
                                {file.name}
                            </button>
                            <span className="remove-btn" onClick={() => handleRemoveFile(file.uploadId)}>✕</span>
                        </div>
                    ))}
                </div>
            )}

            {uploadId && (
                <>
                    <div className="results-bar">
                        <div className="results-info">
                            <span className="results-badge">{animatedCount}</span> résultat(s)
                        </div>
                        <button className="reset-btn" onClick={resetFilters}>Réinitialiser</button>
                    </div>

                    <div className="filters-section">
                        {Object.entries(filteredOptions).map(([col, values]) => (
                            <DropdownFilter
                                key={col}
                                label={col}
                                values={values}
                                selectedValue={(filters[col] && filters[col][0]) || ''}
                                onChange={val => {
                                    const newFilters = { ...filters };
                                    if (!val) {
                                        delete newFilters[col];
                                    } else {
                                        newFilters[col] = [val];
                                    }
                                    setFilters(newFilters);
                                }}
                            />
                        ))}
                    </div>

                    {/* Résumé des filtres sélectionnés */}
                    <div className="selected-filters-summary">
                        {Object.entries(filters).map(([col, vals]) => (
                            vals.length > 0 && (
                                <div key={col} className="filter-summary-item">
                                    <strong>{col} :</strong> {vals[0]}
                                </div>
                            )
                        ))}
                    </div>


                    <div className="table-section">
                        <DocumentTable data={filteredData} />
                        <button
                            className="export-btn"
                            onClick={() => exportToPDF(filteredData, selectedFileName || 'Rapport')}
                        >
                            Télécharger en PDF
                        </button>

                    </div>

                </>
            )}
        </div>
    );
}

export default Dashboard;
