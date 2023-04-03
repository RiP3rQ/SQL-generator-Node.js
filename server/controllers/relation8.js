const oracleDb = require("oracledb");
const fs = require("fs");
const { faker } = require("@faker-js/faker");
const WebSocket = require("ws");
const wss = require("../websocket");

const insertRelation8 = async (req, res) => {
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
      let result_max_id_hurtowni = await con.execute(
        "select max(id_hurtowni) from hurtownia"
      );
      const max_id_hurtowni = result_max_id_hurtowni.rows[0];
      let result_max_id_produktu = await con.execute(
        "select max(id_lekarstwa) from produkt"
      );
      const max_id_produktu = result_max_id_produktu.rows[0];

      // id wyników do wstawienia
      const max_id_hurtowni_final = max_id_hurtowni[0] + 1;
      const max_id_produktu_final = max_id_produktu[0] + 1;

      const relation_8 = {
        id_lekarstwa: faker.datatype.number({
          min: 1,
          max: max_id_produktu_final,
        }),
        relation_8_hurtownia_id_hurtowni: faker.datatype.number({
          min: 1,
          max: max_id_hurtowni_final,
        }),
      };

      const query_relation_8 = `insert into relation_8 (produkt_id_lekarstwa , hurtownia_id_hurtowni) values (:id_lekarstwa, :relation_8_hurtownia_id_hurtowni)`;

      // zapis do bazy
      await con.execute(query_relation_8, relation_8);
      console.log(`[${i + 1}]Row inserted`);

      // zapis do pliku
      const queries = [
        query_relation_8.replace(/:[a-zA-Z0-9_]+/g, (match) => {
          return `'${relation_8[match.slice(1)]}'`;
        }),
      ];

      fs.appendFile(filename, queries + ";\n", (err) => {
        if (err) throw err;
        console.log("Data appended to file!");
      });

      // zerowanie pogranych wartosci
      result_max_id_hurtowni = null;
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

module.exports = { insertRelation8 };
