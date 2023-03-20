import { useState } from "react";
import axios from 'axios'
import "./App.css";

function App() {
  const [records, setRecords] = useState(1);

  const generateRecords = (records) => {
    axios.post("http://localhost:3001/api/insertUsers", 
    { recordy: records})
    setRecords(1);
  };

  return (
    <div className="App">
      <div>
        <h1>SQL "Apteka" Generator</h1>
      </div>
      <div className="card">
        <label>Liczba wygenerowanych rekordów:</label>
        <input
          type="text"
          placeholder="Liczba rekordów"
          style={{ margin: "10px", textAlign: "center" }}
          value={records}
          onChange={(e) => setRecords(e.target.value)}
        />
        <br />
        <button onClick={() => generateRecords(records)}>GENERUJ</button>
      </div>
      <p className="read-the-docs">© RiP3rQ 2023.</p>
    </div>
  );
}

export default App;
