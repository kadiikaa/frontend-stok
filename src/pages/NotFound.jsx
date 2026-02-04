import React from "react";
import "../styles/laporan.css"; // pakai style yang sama

export default function NotFound() {
  return (
    <div className="laporan-main">
      <h1>🚫 404 - Halaman Tidak Ditemukan</h1>
      <p style={{ marginTop: "10px", fontSize: "16px", color: "#555" }}>
        Halaman yang kamu cari nggak ada. Periksa URL atau pilih menu di sidebar.
      </p>

      {/* Contoh summary cards tetap tampil biar feel dashboard */}
      <div className="laporan-summary" style={{ opacity: 0.5 }}>
        <div className="summary-card">
          <p>Total Transaksi</p>
          <h2>-</h2>
        </div>
        <div className="summary-card">
          <p>Barang Keluar</p>
          <h2>-</h2>
        </div>
        <div className="summary-card">
          <p>Total Penjualan</p>
          <h2>-</h2>
        </div>
        <div className="summary-card">
          <p>Barang Masuk</p>
          <h2>-</h2>
        </div>
        <div className="summary-card">
          <p>Nilai Barang Masuk</p>
          <h2>-</h2>
        </div>
      </div>
    </div>
  );
}
