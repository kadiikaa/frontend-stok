import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

export default function Dashboard() {
  const [summary, setSummary] = useState({
    total_barang: 0,
    total_stok: 0,
    barang_masuk: 0,
    barang_keluar: 0,
  });
  const [stokList, setStokList] = useState([]);
  const [transaksiList, setTransaksiList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSummary();
    fetchStok();
    fetchTransaksi();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axios.get("/dashboard/summary");
      setSummary(res.data);
    } catch (error) {
      console.error("Gagal mengambil dashboard summary", error);
    }
  };

  const fetchStok = async () => {
    try {
      const res = await axios.get("/dashboard/stok");
      setStokList(res.data);
    } catch (error) {
      console.error("Gagal mengambil data stok", error);
    }
  };

  const fetchTransaksi = async () => {
    try {
      const res = await axios.get("/dashboard/transaksi");
      setTransaksiList(res.data);
    } catch (error) {
      console.error("Gagal mengambil transaksi hari ini", error);
    }
  };

  return (
    <div className="dashboard-container">
      <main className="dashboard-main">
        <div className="page-header">
            <h1>Dashboard</h1>
        </div>

        {/* Ringkasan */}
        <div className="card-container">
          <Card title="Total Barang" value={summary.total_barang} />
          <Card title="Total Stok" value={summary.total_stok} />
          <Card title="Barang Masuk Hari Ini" value={summary.barang_masuk} />
          <Card title="Barang Keluar Hari Ini" value={summary.barang_keluar} />
        </div>

        {/* Stok Barang */}
        <Section title="Stok Barang (Terendah)" onClick={() => navigate("/barang")}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Barang</th>
                  <th>Stok</th>
                </tr>
              </thead>
              <tbody>
                {stokList.length === 0 ? (
                  <tr>
                    <td colSpan="3" align="center">Data stok kosong</td>
                  </tr>
                ) : (
                  stokList.map((item, index) => (
                    <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td>{item.nama_barang}</td>
                        <td
                        style={{
                            color: item.stok < 8 ? "red" : "black",
                            fontWeight: item.stok < 8 ? "bold" : "normal"
                        }}
                        >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            {item.stok}
                            {item.stok < 8 && <span title="Stok hampir habis">⚠️</span>}
                        </span>
                        </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Transaksi Hari Ini */}
        <Section title="Transaksi Hari Ini" onClick={() => navigate("/laporan/harian")}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Tanggal</th>
                  <th>Nama Barang</th>
                  <th>Jenis</th>
                  <th>Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {transaksiList.length === 0 ? (
                  <tr>
                    <td colSpan="5" align="center">Tidak ada transaksi hari ini</td>
                  </tr>
                ) : (
                  transaksiList.map((trx, index) => (
                    <tr key={trx.id}>
                      <td>{index + 1}</td>
                      <td>{new Date(trx.tanggal).toLocaleDateString("id-ID")}</td>
                      <td>{trx.nama_barang}</td>
                      <td>
                    <span
                        style={{
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background:
                            trx.jenis === "MASUK" ? "#dcfce7" : "#fee2e2",
                        color:
                            trx.jenis === "MASUK" ? "#166534" : "#991b1b",
                        fontWeight: "600"
                        }}
                    >
                        {trx.jenis}
                    </span>
                    </td>
                      <td>{trx.jumlah}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Section>
      </main>
    </div>
  );
}

// Card Component
function Card({ title, value }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <h2>{value}</h2>
    </div>
  );
}

// Section wrapper
function Section({ title, onClick, children }) {
  return (
    <div className="section">
      <div className="section-header">
        <h2>{title}</h2>
        <button onClick={onClick}>Lihat Semua</button>
      </div>
      {children}
    </div>
  );
}
