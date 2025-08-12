import React from 'react';
import './DocumentTable.css';

function DocumentTable({ data }) {
    if (!data || data.length === 0) {
        return <div className="no-data">Aucune donnée à afficher</div>;
    }

    const columns = Object.keys(data[0]);

    return (
        <div className="table-container">
            <table className="custom-table">
                <thead>
                    <tr>
                        {columns.map(col => (
                            <th key={col}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index}>
                            {columns.map(col => (
                                <td key={col}>{row[col]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DocumentTable;
