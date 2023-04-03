const oracleDb = require("oracledb");
const fs = require("fs");
const { faker } = require("@faker-js/faker");
const WebSocket = require("ws");
const wss = require("../websocket");

const insertApteka = async (req, res) => {
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
      // max id apteki dla tabeli apteka
      let result_max_id_apteki = await con.execute(
        "select MAX(id_apteki) from apteka"
      );
      const max_id_apteki = result_max_id_apteki.rows[0];

      // id wyników do wstawienia
      const max_id_apteki_final = max_id_apteki[0] + 1;

      const apteka = {
        id_apteki: max_id_apteki_final,
        miasto: faker.address.cityName(),
        kod_pocztowy: `${faker.random.numeric(2)}-${faker.random.numeric(3)}`,
        ulica: faker.address.streetAddress().replace(/'/, ""),
        nazwa: faker.company.name().replace(/'/, ""),
        ilosc_pracownikow: faker.random.numeric(2),
      };

      const query_apteka = `insert into apteka (id_apteki, miasto, kod_pocztowy, ulica, nazwa, ilosc_pracownikow) values (:id_apteki, :miasto, :kod_pocztowy, :ulica, :nazwa, :ilosc_pracownikow)`;

      // zapis do bazy
      await con.execute(query_apteka, apteka);
      console.log(`[${i + 1}]Row inserted`);

      // zapis do pliku
      const queries = [
        query_apteka.replace(/:[a-zA-Z0-9_]+/g, (match) => {
          return `'${apteka[match.slice(1)]}'`;
        }),
      ];

      fs.appendFile(filename, queries + ";\n", (err) => {
        if (err) throw err;
        console.log("Data appended to file!");
      });

      // zerowanie pogranych wartosci
      result_max_id_apteki = null;

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

module.exports = { insertApteka };
