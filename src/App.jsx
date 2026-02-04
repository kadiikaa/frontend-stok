import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Barang from "./pages/Barang";
import Transaksi from "./pages/Transaksi";
import LaporanHarian from "./pages/LaporanHarian";
import LaporanBulanan from "./pages/LaporanBulanan";
import NotFound from "./pages/NotFound"; // <--- import halaman 404

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route login */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes dengan Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/barang" element={<Barang />} />
          <Route path="/transaksi" element={<Transaksi />} />
          <Route path="/laporan/harian" element={<LaporanHarian />} />
          <Route path="/laporan/bulanan" element={<LaporanBulanan />} />

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
