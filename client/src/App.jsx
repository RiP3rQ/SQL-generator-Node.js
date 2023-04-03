import { useState } from "react";
import axios from 'axios'
import "./App.css";

function App() {
  const [records, setRecords] = useState(1);
  const [selectedOption, setSelectedOption] = useState('wszystkie');

  const generateRecords = (records) => {
    if(selectedOption === "wszystkie") {
    axios.post("http://localhost:3001/api/insertUsers", 
    { recordy: records})
    } else if(selectedOption === "klienci") {
      axios.post("http://localhost:3001/api/insertKlienci",
      { recordy: records})
    } else if(selectedOption === "apteka") {
      axios.post("http://localhost:3001/api/insertApteka",
      { recordy: records})
    } else if(selectedOption === "hurtownia") {
      axios.post("http://localhost:3001/api/insertHurtownia",
      { recordy: records})
    } else if(selectedOption === "pracownicy_apteki") {
      axios.post("http://localhost:3001/api/insertPracownicyApteki",
      { recordy: records})
    }
    setRecords(1);
  };

  const handleOptionChange = event => {
    setSelectedOption(event.target.value); // Update selected option state on change
  };

  return (
    <div className="App">
      <div>
        <h1>SQL "Apteka" Generator</h1>
      </div>
      <label htmlFor="select-list" id="select-label">Wstawianie do tabeli:</label>
      <select id="select-list" value={selectedOption} onChange={handleOptionChange}>
        <option value="wszystkie">Wszystkie</option>
        <option value="klienci">Klienci</option>
        <option value="apteka">Apteka</option>
        <option value="hurtownia">Hurtownia</option>
        <option value="pracownicy_apteki">Pracownicy apteki</option>
        <option value="producent">Producent</option>
        <option value="produkt">Produkt</option>
        <option value="relation_8">Relation_8</option>
        <option value="przepisane_lekarstwa">Przepisane lekarstwa</option>
        <option value="transakcja">Transakcja</option>
        <option value="recepta">Recepta</option>
        <option value="relation_7">Relation_7</option>
      </select>
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
