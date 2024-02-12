import { Routes, Route, Navigate } from "react-router-dom";
import { WalletProvider } from './WalletContext.js';
import Layout from "./components/Layout.jsx";
import 'tailwindcss/tailwind.css';


function App() {
  return (
    <WalletProvider>
      <div className="App">
        <Routes>
          <Route path="/dashboard" element={<Layout />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </WalletProvider>
  );
}

export default App;