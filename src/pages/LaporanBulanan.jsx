import { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/laporan.css";

export default function LaporanBulanan() {
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [fetching, setFetching] = useState(false); // track fetch setiap klik Tampilkan

  const namaBulan = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];

  // Pagination
  const [currentPageKeluar, setCurrentPageKeluar] = useState(1);
  const [currentPageMasuk, setCurrentPageMasuk] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const fetchLaporan = async () => {
    setFetching(true); // mulai fetch
    try {
      const res = await axios.get("/laporan/bulanan", { params: { bulan, tahun } });
      setData(res.data); // langsung replace data lama
      setCurrentPageKeluar(1); // Reset currentPage to 1 on new fetch
      setCurrentPageMasuk(1); // Reset currentPage to 1 on new fetch
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil laporan bulanan");
    } finally {
      setFetching(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const res = await axios.get("/laporan/bulanan/pdf", {
        params: { bulan, tahun },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `laporan-bulanan-${bulan}-${tahun}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Gagal download PDF");
    }
  };

  // Auto-fetch bulan & tahun saat pertama load
  useEffect(() => {
    fetchLaporan();
  }, [bulan, tahun]);
  console.log("Data:", data);
console.log("ITEMS_PER_PAGE:", ITEMS_PER_PAGE)

  return (
    <div className="laporan-main">
      <h1>📊 Laporan Bulanan</h1>

      {/* FILTER */}
      <div className="laporan-filter">
        <select value={bulan} onChange={(e) => setBulan(+e.target.value)}>
          {namaBulan.map((nama, i) => (
            <option key={i} value={i + 1}>{nama}</option>
          ))}
        </select>

        <input
          type="number"
          value={tahun}
          onChange={(e) => setTahun(+e.target.value)}
        />

        <button onClick={fetchLaporan} className="btn-primary" disabled={fetching}>
          {fetching ? "Loading..." : "Tampilkan"}
        </button>

        {data && (
          <button onClick={downloadPDF} className="btn-success">Download PDF</button>
        )}
      </div>

      {/* Deskripsi Periode */}
      {data && (
        <p style={{ marginTop: "10px", fontSize: "14px", color: "#555" }}>
          Menampilkan data untuk <strong>{namaBulan[data.bulan - 1]}</strong> {data.tahun}
        </p>
      )}

      {data ? (
        <>
          {/* SUMMARY */}
          <div className="laporan-summary">
            <SummaryCard title="Total Invoice" value={data.totalInvoice} />
            <SummaryCard title="Barang Keluar" value={data.totalKeluarQty} />
            <SummaryCard title="Total Penjualan" value={`Rp ${data.totalKeluarNilai?.toLocaleString() || 0}`} />
            <SummaryCard title="Barang Masuk" value={data.totalMasukQty} />
            <SummaryCard title="Nilai Barang Masuk" value={`Rp ${data.totalMasukNilai?.toLocaleString() || 0}`} />
          </div>

          {/* BARANG KELUAR */}
          <h3>📤 Barang Keluar</h3>
          <TabelBarang
            data={data.barangKeluar}
            jenis="KELUAR"
            currentPage={currentPageKeluar}
            setCurrentPage={setCurrentPageKeluar}
            itemsPerPage={ITEMS_PER_PAGE}
            showTokoTujuan={true}
          />

          {/* BARANG MASUK */}
          <h3>📥 Barang Masuk</h3>
          <TabelBarang
            data={data.barangMasuk}
            jenis="MASUK"
            currentPage={currentPageMasuk}
            setCurrentPage={setCurrentPageMasuk}
            itemsPerPage={ITEMS_PER_PAGE}
            showTokoTujuan={false}
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

// FINAL: Table Component with Always-visible Dynamic Pagination
function TabelBarang({ data, jenis, currentPage, setCurrentPage, itemsPerPage, showTokoTujuan }) {
  if (!data?.length) return <p>Tidak ada data</p>;

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage)); // selalu minimal 1
  const start = (currentPage - 1) * itemsPerPage;
  const pageData = data.slice(start, start + itemsPerPage);

  const maxQty = jenis === "KELUAR" ? Math.max(...data.map(d => d.jumlah)) : null;
  const totalQty = data.reduce((a, b) => a + b.jumlah, 0);
  const totalSubtotal = data.reduce((a, b) => a + (b.jumlah * (b.harga || 0)), 0);

  // Dynamic pagination logic
  const renderDynamicPagination = () => {
    const pages = [];
    const delta = 2; // halaman kiri & kanan current
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
      <table className="laporan-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Tanggal</th>
            <th>Nama Barang</th>
            <th>Qty</th>
            {showTokoTujuan && <th>Toko Tujuan</th>}
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {pageData.map((t, i) => (
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
              <td>{new Date(t.tanggal).toLocaleDateString("id-ID")}</td>
              <td>{t.nama_barang}</td>
              <td>{t.jumlah}</td>
              {showTokoTujuan && <td>{t.sumber_tujuan || "-"}</td>}
              <td style={{ textAlign: 'right' }}>Rp {(t.jumlah * (t.harga || 0)).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th colSpan={3}>Total</th>
            <th>{totalQty}</th>
            {showTokoTujuan && <th></th>}
            <th style={{ textAlign: "right" }}>
              Rp {totalSubtotal.toLocaleString()}
            </th>
          </tr>
        </tfoot>
      </table>

      {/* Always-visible dynamic pagination */}
      <div className="pagination">
        <button
          onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        {renderDynamicPagination().map((p, idx) =>
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




