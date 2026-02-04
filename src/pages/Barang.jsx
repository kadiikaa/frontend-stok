import { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/barang.css";

export default function Barang() {
  const ITEMS_PER_PAGE = 10;
  const [barangList, setBarangList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modeForm, setModeForm] = useState(null);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [namaBarang, setNamaBarang] = useState("");
  const [stok, setStok] = useState(0);
  const [harga, setHarga] = useState(1); // 🔥 default minimal 1
  const [keterangan, setKeterangan] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBarang = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/barang");
      setBarangList(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Gagal ambil data barang");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarang();
  }, []);

  const openTambah = () => {
    setModeForm("tambah");
    setSelectedBarang(null);
    setNamaBarang("");
    setStok(0);
    setHarga(1); // 🔥 reset harga minimal 1
    setKeterangan("");
  };

  const openEdit = (b) => {
    setModeForm("edit");
    setSelectedBarang(b);
    setNamaBarang(b.nama_barang);
    setStok(b.stok || 0);
    setHarga(b.harga > 0 ? b.harga : 1); // 🔥 harga minimal 1
    setKeterangan(b.keterangan || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 VALIDASI HARGA TIDAK BOLEH 0
    if (!namaBarang || harga === undefined || harga === "" || harga <= 0) {
      alert("Nama barang dan harga wajib diisi, harga tidak boleh 0");
      return;
    }

    try {
      if (modeForm === "tambah") {
        await axios.post("/barang", {
          nama_barang: namaBarang,
          stok,
          harga,
          keterangan
        });
      } else if (modeForm === "edit" && selectedBarang) {
        const updateData = {
          nama_barang: namaBarang,
          harga,
          keterangan
        };
        await axios.patch(`/barang/${selectedBarang.id}`, updateData);
      }

      alert("Berhasil menyimpan data");
      setModeForm(null);
      fetchBarang();

    } catch (err) {
      console.error(err.response || err);
      alert(err.response?.data?.message || "Gagal menyimpan data");
    }
  };

  const handleDelete = async (b) => {
    if (window.confirm(`Yakin hapus barang ${b.nama_barang}?`)) {
      try {
        await axios.delete(`/barang/${b.id}`);
        fetchBarang();
      } catch (err) {
        console.error(err);
        alert("Gagal hapus barang");
      }
    }
  };

  const filteredBarang = barangList.filter((b) =>
    b.nama_barang.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBarang.length / ITEMS_PER_PAGE);
  const currentBarang = filteredBarang.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // ===== PAGINATION HELPER =====
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

  return (
    <main className="barang-main">
      <h1>📦 Master Barang</h1>

      {modeForm === null ? (
        <>
          <div className="top-controls">
            <button onClick={openTambah} className="btn btn-add">Tambah Barang</button>
            <input
              type="text"
              placeholder="Cari barang..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="barang-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nama Barang</th>
                      <th>Stok</th>
                      <th>Harga</th>
                      <th>Keterangan</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentBarang.map((b, i) => (
                      <tr key={b.id}>
                        <td>{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}</td>
                        <td>{b.nama_barang}</td>
                        <td>{b.stok}</td>
                        <td>Rp {Number(b.harga).toLocaleString("id-ID")}</td>
                        <td>{b.keterangan || "-"}</td>
                        <td>
                          <button onClick={() => openEdit(b)} className="btn btn-edit">Edit</button>
                          <button onClick={() => handleDelete(b)} className="btn btn-delete">Hapus</button>
                        </td>
                      </tr>
                    ))}
                    {currentBarang.length === 0 && (
                      <tr>
                        <td colSpan="6" align="center">Tidak ada barang ditemukan</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ===== PAGINATION ===== */}
              {totalPages > 1 && (
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
              )}
            </>
          )}
        </>
      ) : (
        <div className="form-card">
          <h2>{modeForm === "tambah" ? "Tambah Barang" : "Edit Barang"}</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Nama Barang
              <input value={namaBarang} onChange={(e) => setNamaBarang(e.target.value)} required />
            </label>

            <label>
              Stok
              <input disabled type="number" value={stok} onChange={(e) => setStok(Number(e.target.value))} required />
            </label>

            <label>
              Harga
              <input
                type="number"
                value={harga}
                onChange={(e) => setHarga(Number(e.target.value))}
                placeholder="15000"
                min={1}
                required
              />
            </label>

            <label>
              Keterangan
              <input value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
            </label>

            <div className="form-actions">
              <button type="submit" className="btn btn-add">
                {modeForm === "tambah" ? "Tambah" : "Update"}
              </button>
              <button type="button" className="btn btn-cancel" onClick={() => setModeForm(null)}>
                Batal
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
