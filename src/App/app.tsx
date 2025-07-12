
import TitleBar from "@/components/TitleBar";
import LoginPage from "@/pages/auth/LoginPage";
import { Route, Routes } from "react-router-dom";

function App() {

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TitleBar />
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;