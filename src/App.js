import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sign from "./sign";
import Signclient from "./signclient";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Sign />} />
          <Route path="/sign/:parametro" element={<Sign />} />
          <Route path="/signclient/:pdfLink/:codigo" element={<Signclient />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
