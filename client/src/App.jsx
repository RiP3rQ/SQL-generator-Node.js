import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import toast, { Toaster } from "react-hot-toast";

function LinearProgressWithLabel(props) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

function App() {
  const [records, setRecords] = useState(1);
  const [selectedOption, setSelectedOption] = useState("wszystkie");
  const [progress, setProgress] = useState(0);

  // Generate records and send them to server
  const generateRecords = (records) => {
    if (selectedOption === "wszystkie") {
      axios.post("http://localhost:3001/api/insertUsers", { recordy: records });
    } else if (selectedOption === "klienci") {
      axios.post("http://localhost:3001/api/insertKlienci", {
        recordy: records,
      });
    } else if (selectedOption === "apteka") {
      axios.post("http://localhost:3001/api/insertApteka", {
        recordy: records,
      });
    } else if (selectedOption === "hurtownia") {
      axios.post("http://localhost:3001/api/insertHurtownia", {
        recordy: records,
      });
    } else if (selectedOption === "pracownicy_apteki") {
      axios.post("http://localhost:3001/api/insertPracownicyApteki", {
        recordy: records,
      });
    } else if (selectedOption === "producent") {
      axios.post("http://localhost:3001/api/insertProducent", {
        recordy: records,
      });
    } else if (selectedOption === "produkt") {
      axios.post("http://localhost:3001/api/insertProdukt", {
        recordy: records,
      });
    } else if (selectedOption === "relation_8") {
      axios.post("http://localhost:3001/api/insertRelation8", {
        recordy: records,
      });
    } else if (selectedOption === "przepisane_lekarstwa") {
      axios.post("http://localhost:3001/api/insertPrzepisaneLekarstwa", {
        recordy: records,
      });
    } else if (selectedOption === "transakcja") {
      axios.post("http://localhost:3001/api/insertTransakcja", {
        recordy: records,
      });
    } else if (selectedOption === "recepta") {
      axios.post("http://localhost:3001/api/insertRecepta", {
        recordy: records,
      });
    } else if (selectedOption === "relation_7") {
      axios.post("http://localhost:3001/api/insertRelation7", {
        recordy: records,
      });
    }
    setRecords(1);
  };

  // Handle change of select option
  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value); // Update selected option state on change
  };

  // create a new WebSocket connection
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "progress") {
        setProgress(data.data.progress);
      }
    };
  }, []);

  console.log(progress);

  // reset progress bar when records are done generating
  useEffect(() => {
    if (progress === 100) {
      toast.success("Generowanie zakończone sukcesem!");
      setTimeout(() => {
        setProgress(0);
      }, 1000);
    }
  }, [progress]);

  return (
    <div className="App">
      <Toaster position="top-center" />
      <Box sx={{ width: "100%" }}>
        <LinearProgressWithLabel value={progress} />
      </Box>
      <div>
        <h1>SQL "Apteka" Generator</h1>
      </div>
      <label htmlFor="select-list" id="select-label">
        Wstawianie do tabeli:
      </label>
      <select
        id="select-list"
        value={selectedOption}
        onChange={handleOptionChange}
        style={{ margin: "10px", textAlign: "center" }}
      >
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
