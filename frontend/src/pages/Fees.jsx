import React, { useState, useEffect } from 'react';
import { feesAPI, studentAPI } from '../services/api';
import logo from '../assets/logo.png';
import Select from 'react-select';

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    studentName: '',
    status: 'unpaid',
    course: 'Robotics Level 1',
    amount: '',
    discount: '0'
  });
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(userData.role || '');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [feesRes, studentsRes] = await Promise.all([
        feesAPI.getAll(),
        studentAPI.getAll()
      ]);
      setFees(feesRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error('Error fetching fees data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      const student = students.find(s => s.name.toLowerCase() === formData.studentName.toLowerCase());

      await feesAPI.create({
        ...formData,
        studentId: student ? student._id : null,
      });
      setFormData({ studentName: '', status: 'unpaid', course: 'Robotics Level 1', amount: '', discount: '0' });
      fetchData();
      alert('Invoice created successfully!');
    } catch (error) {
      alert('Failed to create invoice');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await feesAPI.delete(id);
        fetchData();
      } catch (error) {
        alert('Failed to delete invoice');
      }
    }
  };

  const handlePrint = (fee) => {
    setSelectedInvoice(fee);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <>
      <div className="no-print">
        <h1>Fees / Invoices</h1>

        {userRole !== 'parent' && (
          <div id="feeForm">
            <h2>Create Invoice</h2>
            <form onSubmit={handleCreateInvoice}>
              <div className="row3">
                <div className="field">
                  <label>Invoice ID</label>
                  <input placeholder="(Auto)" disabled style={{ background: '#f0f0f0' }} />
                </div>
                <div className="field">
                  <label>Student Name</label>
                  <Select
                    options={students.map(s => ({
                      value: s.name,
                      label: `${s.studentId || 'No ID'} - ${s.name}`
                    }))}
                    value={{ value: formData.studentName, label: formData.studentName }?.value ?
                      { value: formData.studentName, label: students.find(s => s.name === formData.studentName)?.studentId ? `${students.find(s => s.name === formData.studentName).studentId} - ${formData.studentName}` : formData.studentName } : null}
                    onChange={(selectedOption) => setFormData({ ...formData, studentName: selectedOption ? selectedOption.value : '' })}
                    placeholder="Search Student..."
                    isClearable
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: '40px',
                        border: '1px solid #ccc',
                        boxShadow: 'none',
                        '&:hover': { border: '1px solid #0056b3' }
                      })
                    }}
                  />
                </div>
                <div className="field">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="paid">Paid</option>
                    <option value="partial">Partial</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>
              </div>
              <div className="row3">
                <div className="field">
                  <label>Course</label>
                  <select
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  >
                    <option value="Robotics Level 1">Robotics Level 1</option>
                    <option value="Level 1 and 2 Combined">Level 1 and 2 Combined</option>
                    <option value="Level Up">Level Up</option>
                    <option value="3D Printing">3D Printing</option>
                  </select>
                </div>
                <div className="field">
                  <label>Price (AED)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="Original Price"
                    required
                  />
                </div>
                <div className="field">
                  <label>Discount (AED)</label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    placeholder="Discounted Amount"
                  />
                </div>
              </div>
              <div className="actions" style={{ marginTop: '10px' }}>
                <button type="submit" className="btn ok">Create</button>
              </div>
            </form>
            <hr />
          </div>
        )}

        <div className="scroll-table-container">
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Student Name</th>
                <th>Course</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center' }}>Loading...</td></tr>
              ) : fees.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center' }}>No invoices found</td></tr>
              ) : (
                fees.map((fee, index) => (
                  <tr key={fee._id}>
                    <td>{fee.invoiceId || `INV-${1000 + index}`}</td>
                    <td>{fee.student?.name || fee.studentName || 'Unknown'}</td>
                    <td>{fee.course || 'Course'}</td>
                    <td>{fee.amount}</td>
                    <td>{fee.discount || 0}</td>
                    <td>{(fee.amount - (fee.discount || 0))}</td>
                    <td>
                      <span className={`badge ${fee.status === 'paid' ? 'green' : fee.status === 'partial' ? 'gold' : 'red'}`}>
                        {fee.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="actions" style={{ justifyContent: 'flex-start' }}>
                        <button
                          className="btn ghost"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                          onClick={() => handlePrint(fee)}
                        >
                          Print
                        </button>
                        {userRole !== 'parent' && (
                          <button
                            className="btn danger"
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                            onClick={() => handleDelete(fee._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Professional Invoice Preview matching Sample/invoice.html */}
      {selectedInvoice && (
        <div className="print-only">
          <div className="invoice-sheet">
            <div className="inv-header">
              <div className="inv-company">
                <img src={logo} alt="Logo" />
                <div>#608 Fortune Executive Tower,<br />JLT Clusture T,<br />Near to Sobha Reality Metro Station,<br />Dubai - UAE</div>
              </div>
              <div className="inv-meta">
                <div><strong>Invoice #</strong> <span>{selectedInvoice.invoiceId || `INV-${1000 + fees.indexOf(selectedInvoice)}`}</span></div>
                <div><strong>Invoice Date:</strong> <span>{new Date(selectedInvoice.createdAt).toLocaleDateString()}</span></div>
              </div>
            </div>

            <div className="section split">
              <div className="panel">
                <h3>Bill To</h3>
                <div>{selectedInvoice.student?.name || selectedInvoice.studentName}</div>
                <div>Student ID: {selectedInvoice.student?._id?.toString().slice(-6).toUpperCase() || 'N/A'}</div>
                <div>Course: {selectedInvoice.course}</div>
              </div>
              <div className="panel">
                <h3>Payment Info</h3>
                <div>Method: Card / Bank Transfer</div>
                <div>Status: <span style={{ textTransform: 'uppercase' }}>{selectedInvoice.status}</span></div>
                <div>Currency: <span>AED</span></div>
              </div>
            </div>

            <div className="section">
              <table className="invoice">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Fees</th>
                    <th>Discount</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div style={{ fontWeight: 700 }}>{selectedInvoice.course} - Course Fees</div>
                      <div style={{ color: '#6b7280', fontSize: '12px' }}>Registration, Materials and Monthly Tuition Fee</div>
                    </td>
                    <td>{selectedInvoice.amount}</td>
                    <td>{selectedInvoice.discount || 0}</td>
                    <td>{selectedInvoice.amount - (selectedInvoice.discount || 0)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="totals-inv">
                <div><span>Subtotal</span><span>{selectedInvoice.amount}.00</span></div>
                <div><span>Discount</span><span>{selectedInvoice.discount || 0}.00</span></div>
                <div className="strong"><span>Total</span><span>{selectedInvoice.amount - (selectedInvoice.discount || 0)}.00</span></div>
              </div>
            </div>

            <div className="section" style={{ paddingBottom: '28px' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '13px', textTransform: 'uppercase', color: '#4b5563', letterSpacing: '.06em' }}>Terms & Conditions</h3>
              <div style={{ fontSize: '13px', color: '#111', lineHeight: '1.6' }}>
                Payment due within 30 calendar days. Please pay via the provided payment link.<br />
                Overdue invoices may accrue statutory interest.
              </div>
            </div>

            <div className="section" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', paddingBottom: '40px' }}>
              <div style={{ textAlign: 'center', marginRight: '20px' }}>
                <div style={{ height: '60px' }}></div>
                <div style={{ borderTop: '1px solid #000', width: '200px', marginBottom: '8px' }}></div>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>Authorized Signature</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
