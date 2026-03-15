import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';

export default function Reports() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState(null);
  const [period, setPeriod] = useState('daily');
  const [detailsSort, setDetailsSort] = useState({ key: 'date', direction: 'desc' });
  const [historySort, setHistorySort] = useState({ key: 'createdAt', direction: 'desc' });

  const escapeCSV = (str) => {
    if (str === null || str === undefined) return '';
    const s = String(str);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const requestDetailsSort = (key) => {
    let direction = 'asc';
    if (detailsSort.key === key && detailsSort.direction === 'asc') {
      direction = 'desc';
    }
    setDetailsSort({ key, direction });
  };

  const requestHistorySort = (key) => {
    let direction = 'asc';
    if (historySort.key === key && historySort.direction === 'asc') {
      direction = 'desc';
    }
    setHistorySort({ key, direction });
  };

  const sortedDetails = React.useMemo(() => {
    if (!salesData?.reportData) return [];
    let items = [...salesData.reportData];
    items.sort((a, b) => {
      let aVal = a[detailsSort.key];
      let bVal = b[detailsSort.key];
      if (detailsSort.key === 'date') { aVal = new Date(a.date); bVal = new Date(b.date); }
      if (aVal < bVal) return detailsSort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return detailsSort.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return items;
  }, [salesData, detailsSort]);

  const sortedHistory = React.useMemo(() => {
    let items = [...history];
    items.sort((a, b) => {
      let aVal = a[historySort.key];
      let bVal = b[historySort.key];
      if (historySort.key === 'createdAt') { aVal = new Date(a.createdAt); bVal = new Date(b.createdAt); }
      if (aVal < bVal) return historySort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return historySort.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return items;
  }, [history, historySort]);

  useEffect(() => {
    fetchHistory();
    fetchSales('daily');
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await reportAPI.getHistory();
      setHistory(res.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSales = async (p) => {
    try {
      setPeriod(p);
      const res = await reportAPI.getSales(p);
      setSalesData(res.data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  };

  const handleDownload = (data, title) => {
    const headers = ["Type", "Date", "Student", "Course", "Amount", "Method", "Invoice"];
    const rows = data.reportData.map(r => [
      r.type,
      new Date(r.date).toLocaleDateString(),
      r.student,
      r.course || '-',
      r.amount || 0,
      r.method || '-',
      r.invoiceId || '-'
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => escapeCSV(cell)).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${title}_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Save to history
    reportAPI.save({
      title: `${title} - ${new Date().toLocaleDateString()}`,
      type: period,
      dateRange: { start: data.start, end: data.end },
      totalAmount: data.totalCollections,
      data: data.reportData
    }).then(() => fetchHistory());
  };

  return (
    <div className="reports-page">
      <h1>Sales & Admissions Reports</h1>
      
      <div className="kpi" style={{ marginBottom: '24px' }}>
        <div className="box" style={{ background: 'var(--accent)', color: '#fff' }}>
          <div className="small" style={{ color: '#fff', fontWeight: 'bold' }}>Invoices Generated (Sales)</div>
          <div className="num">AED {salesData?.totalSales || 0}</div>
          <div className="actions" style={{ marginTop: '10px' }}>
            <button className="btn ok" onClick={() => fetchSales('daily')}>Daily</button>
            <button className="btn ok" onClick={() => fetchSales('monthly')}>Monthly</button>
          </div>
        </div>
        <div className="box" style={{ background: 'var(--ok)', color: '#fff' }}>
          <div className="small" style={{ color: '#fff', fontWeight: 'bold' }}>Cash Collected</div>
          <div className="num">AED {salesData?.totalCollections || 0}</div>
        </div>
        <div className="box" style={{ background: 'var(--accent-pink)', color: '#fff' }}>
          <div className="small" style={{ color: '#fff', fontWeight: 'bold' }}>New Admissions</div>
          <div className="num">{salesData?.newAdmissionCount || 0}</div>
        </div>
      </div>

      <div className="actions" style={{ marginBottom: '20px' }}>
        <button 
          className="btn" 
          onClick={() => handleDownload(salesData, period === 'daily' ? 'Daily_Report' : 'Monthly_Report')}
          disabled={!salesData || salesData.reportData.length === 0}
        >
          Download {period === 'daily' ? 'Daily' : 'Monthly'} Report (CSV)
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h2 style={{ margin: 0 }}>Report Details ({period})</h2>
      </div>
      <div className="scroll-table-container">
        <table>
          <thead>
            <tr>
              <th onClick={() => requestDetailsSort('type')} style={{cursor: 'pointer'}}>Type {detailsSort.key === 'type' ? (detailsSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
              <th onClick={() => requestDetailsSort('date')} style={{cursor: 'pointer'}}>Date {detailsSort.key === 'date' ? (detailsSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
              <th onClick={() => requestDetailsSort('student')} style={{cursor: 'pointer'}}>Student {detailsSort.key === 'student' ? (detailsSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
              <th>Program</th>
              <th onClick={() => requestDetailsSort('amount')} style={{cursor: 'pointer'}}>Amount {detailsSort.key === 'amount' ? (detailsSort.direction === 'asc' ? '↑' : '↓') : ''}</th>
              <th>Method</th>
              <th>Ref/Invoice</th>
            </tr>
          </thead>
          <tbody>
            {!salesData || salesData.reportData.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center' }}>No activity found for this period</td></tr>
            ) : (
              sortedDetails.map((r, i) => (
                <tr key={i}>
                  <td><span className={`badge ${r.type === 'ADMISSION' ? 'green' : ''}`} style={{fontSize: '10px'}}>{r.type}</span></td>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  <td>{r.student}</td>
                  <td>{r.course}</td>
                  <td>{r.amount > 0 ? `AED ${r.amount}` : '-'}</td>
                  <td>{r.method}</td>
                  <td>{r.invoiceId}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', marginTop: '40px' }}>
        <h2 style={{ margin: 0 }}>Report History</h2>
      </div>
      <div className="scroll-table-container">
        <table>
          <thead>
            <tr>
              <th onClick={() => requestHistorySort('title')} style={{cursor: 'pointer'}}>Title {historySort.key === 'title' ? (historySort.direction === 'asc' ? '↑' : '↓') : ''}</th>
              <th>Type</th>
              <th onClick={() => requestHistorySort('totalAmount')} style={{cursor: 'pointer'}}>Cash Collected {historySort.key === 'totalAmount' ? (historySort.direction === 'asc' ? '↑' : '↓') : ''}</th>
              <th onClick={() => requestHistorySort('createdAt')} style={{cursor: 'pointer'}}>Generated At {historySort.key === 'createdAt' ? (historySort.direction === 'asc' ? '↑' : '↓') : ''}</th>
              <th>By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : history.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>No history found</td></tr>
            ) : (
              sortedHistory.map((r) => (
                <tr key={r._id}>
                  <td>{r.title}</td>
                  <td style={{ textTransform: 'capitalize' }}>{r.type}</td>
                  <td>AED {r.totalAmount}</td>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                  <td>{r.generatedBy}</td>
                  <td>
                    <button className="btn ghost" onClick={() => {
                        const headers = ["Type", "Date", "Student", "Course", "Amount", "Method", "Invoice"];
                        const rows = r.data.map(item => [
                          item.type,
                          new Date(item.date).toLocaleDateString(),
                          item.student,
                          item.course || '-',
                          item.amount || 0,
                          item.method || '-',
                          item.invoiceId || '-'
                        ]);
                        const csvContent = [
                          headers.join(","),
                          ...rows.map(row => row.map(cell => escapeCSV(cell)).join(","))
                        ].join("\n");
                        
                      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.setAttribute("href", url);
                      link.setAttribute("download", `${r.title}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}>Re-download</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
