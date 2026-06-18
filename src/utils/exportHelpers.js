// Helper untuk export array of objects ke CSV (Excel)
export const exportToCSV = (data, filename, columns) => {
  if (!data || data.length === 0) {
    alert("Tidak ada data untuk diexport");
    return;
  }

  // Header row
  const csvRows = [columns.map(col => `"${col.label}"`).join(',')];

  // Data rows
  data.forEach(item => {
    const row = columns.map(col => {
      let val = item[col.key];

      // Jika ada formatter khusus
      if (col.format) val = col.format(val, item);

      // Escape quotes and wrap in quotes to handle commas
      const escaped = (val || '').toString().replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(row.join(','));
  });

  const csvString = csvRows.join('\n');
  const blob = new Blob(['﻿' + csvString], { type: 'text/csv;charset=utf-8;' }); // ﻿ for Excel UTF-8 BOM
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Helper untuk Print (membuka tab baru dengan isi yang rapi, lalu trigger window.print)
export const printData = (title, tableHeaders, tableRowsHTML) => {
  const printWindow = window.open('', '_blank');

  const html = `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1C3967; padding-bottom: 10px; }
          h1 { color: #1C3967; margin: 0 0 5px 0; }
          .date { color: #666; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th { background-color: #f1f5f9; color: #1e293b; text-align: left; padding: 10px; border: 1px solid #cbd5e1; }
          td { padding: 8px 10px; border: 1px solid #cbd5e1; }
          tr:nth-child(even) { background-color: #f8fafc; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Sentra Fleet</h1>
          <h2>${title}</h2>
          <div class="date">Dicetak pada: ${new Date().toLocaleString('id-ID')}</div>
        </div>
        <table>
          <thead>
            <tr>${tableHeaders.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${tableRowsHTML}
          </tbody>
        </table>
        <div style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #1C3967; color: white; border: none; border-radius: 5px; cursor: pointer;">Print / Save PDF</button>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};