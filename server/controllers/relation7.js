const oracleDb = require("oracledb");
const fs = require("fs");
const { faker } = require("@faker-js/faker");
const WebSocket = require("ws");
const wss = require("../websocket");

const insertRelation7 = async (req, res) => {
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
      // pobranie max id transakcji
      let result_max_id_transakcji = await con.execute(
        "select max(id_transakcji) from transakcja"
      );
      const max_id_transakcji = result_max_id_transakcji.rows[0];
      // pobranie max id produktu
      let result_max_id_produktu = await con.execute(
        "select max(id_lekarstwa) from produkt"
      );
      const max_id_produktu = result_max_id_produktu.rows[0];

      // id wyników do wstawienia
      const max_id_transakcji_final = max_id_transakcji[0] + 1;
      const max_id_produktu_final = max_id_produktu[0] + 1;

      const relation_7 = {
        transakcja_id_transakcji: faker.datatype.number({
          min: 1,
          max: max_id_transakcji_final,
        }),
        id_lekarstwa: faker.datatype.number({
          min: 1,
          max: max_id_produktu_final,
        }),
      };

      const query_relation_7 = `insert into relation_7 (transakcja_id_transakcji , produkt_id_lekarstwa) values (:transakcja_id_transakcji, :id_lekarstwa)`;

      // zapis do bazy
      await con.execute(query_relation_7, relation_7);
      console.log(`[${i + 1}]Row inserted`);

      // zapis do pliku
      const queries = [
        query_relation_7.replace(/:[a-zA-Z0-9_]+/g, (match) => {
          return `'${relation_7[match.slice(1)]}'`;
        }),
      ];

      fs.appendFile(filename, queries + ";\n", (err) => {
        if (err) throw err;
        console.log("Data appended to file!");
      });

      // zerowanie pogranych wartosci
      result_max_id_transakcji = null;
      result_max_id_produktu = null;

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

module.exports = { insertRelation7 };
