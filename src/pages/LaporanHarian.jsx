import { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/laporan.css";

export default function LaporanHarian() {
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPageKeluar, setCurrentPageKeluar] = useState(1);
  const [currentPageMasuk, setCurrentPageMasuk] = useState(1);
  const ITEMS_PER_PAGE = 5; // lebih kecil biar Next bisa muncul

  const fetchLaporan = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/laporan/harian", { params: { tanggal } });
      setData(res.data);
      setCurrentPageKeluar(1);
      setCurrentPageMasuk(1);
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil laporan harian");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="laporan-main">
      <h1>📅 Laporan Harian</h1>

      <div className="laporan-filter">
        <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
        <button onClick={fetchLaporan} className="btn-primary">Tampilkan</button>
      </div>

      <p style={{ marginTop: "10px", fontSize: "14px", color: "#555" }}>
        Menampilkan data untuk tanggal: <strong>{tanggal}</strong>
      </p>

      {data ? (
        <>
          {/* SUMMARY */}
          <div className="laporan-summary">
            <SummaryCard title="Total Transaksi" value={data.total_transaksi || 0} />
            <SummaryCard title="Barang Keluar" value={data.totalKeluarQty || 0} />
            <SummaryCard title="Total Penjualan" value={`Rp ${(data.totalKeluarNilai || 0).toLocaleString()}`} />
            <SummaryCard title="Barang Masuk" value={data.totalMasukQty || 0} />
            <SummaryCard title="Nilai Barang Masuk" value={`Rp ${(data.totalMasukNilai || 0).toLocaleString()}`} />
          </div>

          {/* BARANG KELUAR */}
          <h3>📤 Barang Keluar</h3>
          <TabelBarang
            data={data?.barangKeluar || []}
            jenis="KELUAR"
            currentPage={currentPageKeluar}
            setCurrentPage={setCurrentPageKeluar}
            itemsPerPage={ITEMS_PER_PAGE}
          />

          {/* BARANG MASUK */}
          <h3>📥 Barang Masuk</h3>
          <TabelBarang
            data={data?.barangMasuk || []}
            jenis="MASUK"
            currentPage={currentPageMasuk}
            setCurrentPage={setCurrentPageMasuk}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </>
      ) : (
        <p>Belum ada data</p>
      )}
    </div>
  );
}

// Summary Card
function SummaryCard({ title, value }) {
  return (
    <div className="summary-card">
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

// Table with pagination & highlights
function TabelBarang({ data, jenis, currentPage, setCurrentPage, itemsPerPage }) {
  if (!data.length) return <p>Tidak ada data</p>;

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const start = (currentPage - 1) * itemsPerPage;
  const pageData = data.slice(start, start + itemsPerPage);

  const maxQty = jenis === "KELUAR" ? Math.max(...data.map(d => d.jumlah || 0)) : null;
  const maxSubtotal = jenis === "KELUAR" ? Math.max(...data.map(d => (d.jumlah || 0) * (d.harga || 0))) : null;

  const totalQty = data.reduce((a, b) => a + (b.jumlah || 0), 0);
  const totalSubtotal = data.reduce((a, b) => a + ((b.jumlah || 0) * (b.harga || 0)), 0);

  // Dynamic pagination
  const renderPagination = () => {
    const pages = [];
    const delta = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  return (
    <>
      <p style={{ fontSize: "12px", color: "#64748b" }}>
        Menampilkan {pageData.length} dari {totalItems} barang
      </p>

      <table className="laporan-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Barang</th>
            <th>Qty</th>
            <th>Subtotal</th>
            {jenis === "KELUAR" && <th>Toko Tujuan</th>}
          </tr>
        </thead>
        <tbody>
          {pageData.map((t, i) => {
            const subtotal = (t.jumlah || 0) * (t.harga || 0);
            return (
              <tr
                key={i}
                style={{
                  color:
                    (jenis === "KELUAR" && t.jumlah === maxQty) ? "red" :
                    (jenis === "MASUK" && t.jumlah < 5) ? "orange" :
                    "black",
                  fontWeight:
                    (jenis === "KELUAR" && t.jumlah === maxQty) ||
                    (jenis === "MASUK" && t.jumlah < 5) ? "bold" : "normal",
                }}
              >
                <td>{start + i + 1}</td>
                <td>{t.nama_barang}</td>
                <td>{t.jumlah || 0}</td>
                <td style={{ color: subtotal === maxSubtotal ? "red" : "black" }}>
                  Rp {subtotal.toLocaleString()}
                </td>
                {jenis === "KELUAR" && <td>{t.sumber_tujuan || "-"}</td>}
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr>
            <th colSpan={2}>Total</th>
            <th>{totalQty}</th>
            <th>Rp {totalSubtotal.toLocaleString()}</th>
            {jenis === "KELUAR" && <th>-</th>}
          </tr>
        </tfoot>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        {renderPagination().map((p, idx) =>
          p === "..." ? <span key={idx} className="dots">…</span> :
          <button
            key={idx}
            className={currentPage === p ? "active" : ""}
            onClick={() => setCurrentPage(p)}
          >
            {p}
          </button>
        )}

        <button
          onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </>
  );
}
