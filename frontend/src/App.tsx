import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar.tsx";
import { Home } from "./pages/Home.tsx";
import { Register } from "./pages/Register.tsx";
import { Profile } from "./pages/Profile.tsx";
import { MyNames } from "./pages/MyNames.tsx";
import { Send } from "./pages/Send.tsx";

export default function App() {
  return (
    <div style={{ minHeight: "100vh", background: "#000000" }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/name/:name" element={<Profile />} />
        <Route path="/my-names" element={<MyNames />} />
        <Route path="/send" element={<Send />} />
      </Routes>
    </div>
  );
}
