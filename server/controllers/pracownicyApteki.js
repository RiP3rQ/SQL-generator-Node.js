const oracleDb = require("oracledb");
const fs = require("fs");
const { faker } = require("@faker-js/faker");
const WebSocket = require("ws");
const wss = require("../websocket");

const insertPracownicyApteki = async (req, res) => {
  let con;
  const recordy = req.body.recordy;
  const filename = "data.txt";

  con = await oracleDb.getConnection({
    user: "s101187",
    password: "s101187",
    connectString: "217.173.198.135:1521/tpdb",
  });

  try {
    for (let i = 0; i < recordy; i++) {
      // max id pracownika dla tabeli pracownicy
      let result_max_id_apracownika = await con.execute(
        "select max(id_pracownika) from pracownicy_apteki"
      );
      const max_id_pracownika = result_max_id_apracownika.rows[0];

      // max id hurtowni dla tabeli pracownicy
      let result_max_id_hurtowni = await con.execute(
        "select max(id_hurtowni) from hurtownia"
      );
      const max_id_hurtowni = result_max_id_hurtowni.rows[0];

      // id wyników do wstawienia
      const max_id_pracownika_final = max_id_pracownika[0] + 1;
      const max_id_hurtowni_final = max_id_hurtowni[0] + 1;

      const pracownicy = {
        id_pracownika: max_id_pracownika_final,
        nazwisko_pracownika: faker.name.lastName(),
        nr_telefonu_pracownika: faker.random.numeric(9),
        data_zatrudnienia_pracownika:
          faker.datatype.number({ min: 1, max: 12 }) +
          "-" +
          faker.date.month({ abbr: true }) +
          "-" +
          faker.datatype.number({ min: 2007, max: 2022 }),
        pensja_pracownika:
          faker.random.numeric(4) + "." + faker.random.numeric(2),
        adres_zamieszkania_pracownika:
          faker.address.cityName() + " " + faker.address.streetAddress(),
        id_apteki_zatrudniajacej: faker.datatype.number({
          min: 1,
          max: max_id_hurtowni_final,
        }),
      };

      const query_pracownicy_apteki = `insert into pracownicy_apteki (id_pracownika, nazwisko, nr_telefonu, data_zatrudnienia, pensja, adres_zamieszkania, apteka_id_apteki) values (:id_pracownika, :nazwisko_pracownika, :nr_telefonu_pracownika, :data_zatrudnienia_pracownika, :pensja_pracownika , :adres_zamieszkania_pracownika, :id_apteki_zatrudniajacej)`;

      // zapis do bazy
      await con.execute(query_pracownicy_apteki, pracownicy);
      console.log(`[${i + 1}]Row inserted`);

      // zapis do pliku
      const queries = [
        query_pracownicy_apteki.replace(/:[a-zA-Z0-9_]+/g, (match) => {
          return `'${pracownicy[match.slice(1)]}'`;
        }),
      ];

      fs.appendFile(filename, queries + ";\n", (err) => {
        if (err) throw err;
        console.log("Data appended to file!");
      });

      // zerowanie pogranych wartosci
      result_max_id_apracownika = null;

      // Send progress data to the WebSocket server
      const progress = Math.round(((i + 1) / recordy) * 100);
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "progress",
              data: {
                progress,
              },
            })
          );
        }
      });
    }
  } catch (err) {
    console.log(err);
  } finally {
    con.commit();
    res.end();
    if (con) {
      await con.close();
    }
  }
};

module.exports = { insertPracownicyApteki };
