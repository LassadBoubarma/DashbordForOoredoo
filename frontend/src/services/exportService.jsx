import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToPDF = (data, title = 'Rapport Filtré') => {
    if (!data || data.length === 0) {
        alert("Aucune donnée à exporter !");
        return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(title, 14, 20);

    const columns = Object.keys(data[0]);
    const rows = data.map(item => columns.map(col => item[col] || ''));

    // ✅ Appel correct de autoTable
    autoTable(doc, {
        head: [columns],
        body: rows,
        startY: 30,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [230, 0, 0] } // Rouge Ooredoo
    });

    doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
};
