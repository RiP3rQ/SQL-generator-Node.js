const oracleDb = require("oracledb");
const fs = require("fs");
const { faker } = require("@faker-js/faker");
const WebSocket = require("ws");
const wss = require("../websocket");

const insertProducent = async (req, res) => {
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
      // max id producenta dla tabeli producenci
      let result_max_id_producenta = await con.execute(
        "select max(id_producenta) from producent"
      );
      const max_id_producenta = result_max_id_producenta.rows[0];

      // id wyników do wstawienia
      const max_id_producenta_final = max_id_producenta[0] + 1;

      const producent = {
        id_producenta: max_id_producenta_final,
        nazwa_producenta: faker.company.name().replace(/'/, ""),
        adres_producenta:
          faker.address.cityName() +
          " " +
          faker.address.zipCode() +
          " " +
          faker.address.streetAddress().replace(/'/, ""),
        nr_telefonu_producenta: faker.random.numeric(9),
        email_producenta: faker.internet.email(),
      };

      const query_producent = `insert into producent (id_producenta, nazwa, adres, nr_telefonu, email) values (:id_producenta, :nazwa_producenta, :adres_producenta, :nr_telefonu_producenta, :email_producenta)`;

      // zapis do bazy
      await con.execute(query_producent, producent);
      console.log(`[${i + 1}]Row inserted`);

      // zapis do pliku
      const queries = [
        query_producent.replace(/:[a-zA-Z0-9_]+/g, (match) => {
          return `'${producent[match.slice(1)]}'`;
        }),
      ];

      fs.appendFile(filename, queries + ";\n", (err) => {
        if (err) throw err;
        console.log("Data appended to file!");
      });

      // zerowanie pogranych wartosci
      result_max_id_producenta = null;

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

module.exports = { insertProducent };
