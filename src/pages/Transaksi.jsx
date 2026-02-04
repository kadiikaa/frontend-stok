import { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/transaksi.css";

export default function Transaksi() {
  const [transaksiList, setTransaksiList] = useState([]);
  const [barangList, setBarangList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [modeForm, setModeForm] = useState(null);
  const [detailModal, setDetailModal] = useState(null);

  // Form Masuk
  const [selectedBarang, setSelectedBarang] = useState("");
  const [searchBarang, setSearchBarang] = useState("");
  const [jumlah, setJumlah] = useState(0);
  const [sumberTujuan, setSumberTujuan] = useState("");
  const [keterangan, setKeterangan] = useState("Restock");

  // Form Keluar
  const [itemsKeluar, setItemsKeluar] = useState([]);
  const [tokoTujuan, setTokoTujuan] = useState("");
  const [keteranganKeluar, setKeteranganKeluar] = useState("Penjualan");
  const [orderIdKeluar, setOrderIdKeluar] = useState(null);

  const [filterJenis, setFilterJenis] = useState("");
  const [searchTransaksi, setSearchTransaksi] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 10;

  // ===== FETCH =====
  const fetchTransaksi = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/transaksi");
      const data = res.data.data;
      const merged = data.map(t => ({
        ...t,
        items: t.items || []
      }));
      setTransaksiList(merged);
    } catch (err) {
      console.error(err);
      alert("Gagal ambil data transaksi");
    } finally {
      setLoading(false);
    }
  };

  const fetchBarang = async () => {
    try {
      const res = await axios.get("/barang");
      setBarangList(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTransaksi();
    fetchBarang();
  }, [filterJenis, searchTransaksi]);

  // ===== FORM =====
  const openForm = (mode) => {
    setModeForm(mode);
    setSelectedBarang("");
    setSearchBarang("");
    setJumlah(0);
    setSumberTujuan("Gudang");
    setKeterangan("Restock");
    setItemsKeluar([]);
    setTokoTujuan("");
    setKeteranganKeluar("Penjualan");
    setOrderIdKeluar(null);

    if (barangList.length > 0) {
      setSelectedBarang(barangList[0].id.toString());
    }
  };

  const filteredBarang = barangList.filter(b =>
    b.nama_barang.toLowerCase().includes(searchBarang.toLowerCase())
  );

  const addItemKeluar = () => {
    if (!selectedBarang || jumlah <= 0) return;

    const barang = barangList.find(b => b.id === Number(selectedBarang));
    if (!barang) return;

    setItemsKeluar(prev => [
      ...prev,
      {
        barang_id: Number(selectedBarang),
        nama_barang: barang.nama_barang,
        jumlah,
        harga_satuan: barang.harga
      }
    ]);

    setJumlah(0);
  };

  const removeItemKeluar = (index) => {
    setItemsKeluar(prev => prev.filter((_, i) => i !== index));
  };

  // ===== SUBMIT =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);

    try {
      if (modeForm === "masuk") {
        if (!selectedBarang || !jumlah || !sumberTujuan) {
          alert("Lengkapi semua field");
          setLoadingSubmit(false);
          return;
        }

        await axios.post("/transaksi/masuk", {
          barang_id: Number(selectedBarang),
          jumlah: Number(jumlah),
          sumber_tujuan: sumberTujuan,
          keterangan,
          user_id: 1
        });

        alert("Transaksi masuk berhasil");
      }

      if (modeForm === "keluar") {
        if (!tokoTujuan || itemsKeluar.length === 0) {
          alert("Lengkapi semua field & tambahkan minimal 1 item");
          setLoadingSubmit(false);
          return;
        }

        const res = await axios.post("/transaksi/keluar/multi", {
          sumber_tujuan: tokoTujuan,
          keterangan: keteranganKeluar,
          barang: itemsKeluar.map(i => ({
            barang_id: Number(i.barang_id),
            jumlah: Number(i.jumlah),
            harga_satuan: Number(i.harga_satuan)
          })),
          user_id: 1
        });

        const orderId = res.data.order_id;
        setOrderIdKeluar(orderId);

        // Download invoice
        const pdfRes = await axios.get(`/transaksi/invoice/${orderId}`, { responseType: "blob" });
        const url = window.URL.createObjectURL(new Blob([pdfRes.data]));
        const link = document.createElement("a");
        link.href = url;
        link.download = `invoice_${orderId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);

        alert("Transaksi keluar berhasil dan invoice didownload!");
      }

      openForm(null);
      await fetchTransaksi();
      await fetchBarang();
      localStorage.setItem("laporanNeedRefresh", Date.now());
    } catch (err) {
      console.error(err);
      alert("Gagal simpan transaksi");
    } finally {
      setLoadingSubmit(false);
    }
  };

  // ===== LIST =====
  const filteredTransaksi = transaksiList
    .filter(t => !filterJenis || t.jenis === filterJenis)
    .filter(t =>
      t.items?.some(item => item.nama_barang?.toLowerCase().includes(searchTransaksi.toLowerCase())) ||
      t.sumber_tujuan?.toLowerCase().includes(searchTransaksi.toLowerCase()) ||
      t.keterangan?.toLowerCase().includes(searchTransaksi.toLowerCase())
    );

  const totalPages = Math.ceil(filteredTransaksi.length / ROWS_PER_PAGE);
  const transaksiTampil = filteredTransaksi.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const getPaginationPages = () => {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);

  let start = Math.max(currentPage - 2, 1);
  let end = Math.min(start + 4, totalPages);
  if (end - start < 4) start = Math.max(end - 4, 1);

  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  if (start > 2) pages.unshift("...");
  if (start > 1) pages.unshift(1);

  if (end < totalPages - 1) pages.push("...");
  if (end < totalPages) pages.push(totalPages);

  return pages;
};

  // ===== DELETE =====
  const handleDelete = async (id, jenis) => {
    if (window.confirm(`Yakin hapus transaksi ${jenis}?`)) {
      try {
        await axios.delete(`/transaksi/${id}?jenis=${jenis}`);
        await fetchTransaksi();
      } catch (err) {
        console.error(err);
        alert("Gagal hapus transaksi");
      }
    }
  };

  return (
    <div className="transaksi-container">
      <main className="transaksi-main">
        <h1>💳 Master Transaksi</h1>

        <div className="transaksi-filter">
          <button onClick={() => openForm("masuk")} className="btn btn-add">Transaksi Masuk</button>
          <button onClick={() => openForm("keluar")} className="btn btn-delete">Transaksi Keluar</button>

          <select value={filterJenis} onChange={e => setFilterJenis(e.target.value)}>
            <option value="">Semua Jenis</option>
            <option value="MASUK">MASUK</option>
            <option value="KELUAR">KELUAR</option>
          </select>

          <input
            type="text"
            placeholder="Cari transaksi..."
            value={searchTransaksi}
            onChange={e => { setSearchTransaksi(e.target.value); setCurrentPage(1); }}
            style={{ marginLeft: "10px", padding: "5px" }}
          />
        </div>

        {loading ? <p>Loading...</p> : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Barang</th>
                    <th>Jenis</th>
                    <th>Jumlah</th>
                    <th>Tujuan</th>
                    <th>Keterangan</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {transaksiTampil.length === 0 ? (
                    <tr>
                      <td colSpan="7" align="center">Tidak ada transaksi</td>
                    </tr>
                  ) : transaksiTampil.map((t) => (
                    <tr key={t.id}>
                      <td>{new Date(t.tanggal).toLocaleDateString("id-ID")}</td>
                      <td>
                        {t.items.length === 0
                          ? "-"
                          : t.items.length === 1
                            ? t.items[0].nama_barang
                            : `${t.items[0].nama_barang}, ${t.items[1]?.nama_barang || ""}${t.items.length > 2 ? ` (+${t.items.length - 2} lainnya)` : ""}`
                        }
                      </td>
                      <td style={{ color: t.jenis === "MASUK" ? "green" : "red", fontWeight: "bold" }}>{t.jenis}</td>
                      <td>
                        {t.items.length > 0
                          ? t.items.reduce((sum, item) => sum + item.jumlah, 0)
                          : t.jumlah
                        }
                      </td>
                      <td>{t.sumber_tujuan}</td>
                      <td>{t.keterangan || "-"}</td>
                      <td>
                        <button onClick={() => handleDelete(t.id, t.jenis)} className="btn btn-delete">
                          Hapus
                        </button>
                        {t.items.length > 1 && (
                          <button onClick={() => setDetailModal(t)} className="btn btn-info" style={{ marginLeft: "5px" }}>
                            Detail
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

           <div className="pagination">
  <button
    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
    disabled={currentPage === 1}
  >
    Prev
  </button>

  {getPaginationPages().map((pageNum, idx) =>
    pageNum === "..." ? (
      <span key={idx} className="dots">…</span>
    ) : (
      <button
        key={idx}
        className={currentPage === pageNum ? "active" : ""}
        onClick={() => setCurrentPage(pageNum)}
      >
        {pageNum}
      </button>
    )
  )}

  <button
    onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
    disabled={currentPage === totalPages}
  >
    Next
  </button>
</div>
          </>
        )}

        {/* ===== FORM MODAL ===== */}
        {modeForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{modeForm === "masuk" ? "Transaksi Masuk" : "Transaksi Keluar"}</h2>
              <form onSubmit={handleSubmit}>
                {modeForm === "masuk" && (
                  <>
                    <label>
                      Cari Barang
                      <input type="text" placeholder="Cari barang..." value={searchBarang} onChange={e => setSearchBarang(e.target.value)} />
                    </label>
                    <label>
                      Pilih Barang
                      <select value={selectedBarang} onChange={e => setSelectedBarang(e.target.value)} size={10}>
                        {filteredBarang.map(b => (
                          <option key={b.id} value={b.id}>{b.nama_barang} (Stok: {b.stok})</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Jumlah
                      <input type="number" value={jumlah} onChange={e => setJumlah(Number(e.target.value))} required />
                    </label>
                    <label>
                      Tujuan
                      <input value={sumberTujuan} type="text" readOnly />
                    </label>
                    <label>
                      Keterangan
                      <input type="text" value={keterangan} readOnly />
                    </label>
                  </>
                )}

                {modeForm === "keluar" && (
                  <>
                    <label>
                      Toko / Tujuan
                      <input value={tokoTujuan} onChange={e => setTokoTujuan(e.target.value)} required />
                    </label>
                    <label>
                      Keterangan
                      <input type="text" value={keteranganKeluar} readOnly />
                    </label>

                    <hr />
                    <h4>Tambah Barang</h4>
                    <label>
                      Cari Barang
                      <input type="text" placeholder="Cari barang..." value={searchBarang} onChange={e => setSearchBarang(e.target.value)} />
                    </label>
                    <label>
                      Pilih Barang
                      <select value={selectedBarang} onChange={e => setSelectedBarang(e.target.value)} size={10}>
                        {filteredBarang.map(b => (
                          <option key={b.id} value={b.id}>{b.nama_barang} (Stok: {b.stok})</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Jumlah
                      <input type="number" value={jumlah} onChange={e => setJumlah(Number(e.target.value))} />
                    </label>
                    <button type="button" onClick={addItemKeluar} className="btn btn-add">Tambah ke List</button>

                    <ul>
                      {itemsKeluar.map((item, i) => (
                        <li key={i}>
                          {item.nama_barang} - {item.jumlah} 
                          <button type="button" onClick={() => removeItemKeluar(i)} style={{ marginLeft: "10px" }}>Hapus</button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <div className="form-actions">
                  <button type="submit" className="btn btn-add" disabled={loadingSubmit}>
                    {loadingSubmit ? "Memproses..." : modeForm === "masuk" ? "Tambah Masuk" : "Tambah Keluar"}
                  </button>
                  <button type="button" className="btn btn-cancel" onClick={() => openForm(null)}>Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===== DETAIL MODAL ===== */}
        {detailModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Detail Transaksi - {new Date(detailModal.tanggal).toLocaleDateString("id-ID")}</h3>
              <table>
                <thead>
                  <tr>
                    <th>Nama Barang</th>
                    <th>Jumlah</th>
                    <th>Harga Satuan</th>
                  </tr>
                </thead>
                <tbody>
                  {detailModal.items.map(item => (
                    <tr key={item.barang_id}>
                      <td>{item.nama_barang}</td>
                      <td>{item.jumlah}</td>
                      <td>{item.harga_satuan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="form-actions">
                <button className="btn btn-cancel" onClick={() => setDetailModal(null)}>Tutup</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
