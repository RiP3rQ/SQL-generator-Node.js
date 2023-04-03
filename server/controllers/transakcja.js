const oracleDb = require("oracledb");
const fs = require("fs");
const { faker } = require("@faker-js/faker");
const moment = require("moment");
const WebSocket = require("ws");
const wss = require("../websocket");

const insertTransakcja = async (req, res) => {
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
      // max id transakcji dla tabeli transakcja
      let result_max_id_transakcji = await con.execute(
        "select max(id_transakcji) from transakcja"
      );
      const max_id_transakcji = result_max_id_transakcji.rows[0];
      let result_max_id_apteki = await con.execute(
        "select MAX(id_apteki) from apteka"
      );
      const max_id_apteki = result_max_id_apteki.rows[0];
      let result_max_id_recepty = await con.execute(
        "select max(id_recepty) from recepta"
      );
      const max_id_recepty = result_max_id_recepty.rows[0];
      let result_max_data_transakcji = await con.execute(
        "select max(data_transakcji) from transakcja"
      );
      const max_data = result_max_data_transakcji.rows[0];

      // id wyników do wstawienia
      const max_id_transakcji_final = max_id_transakcji[0] + 1;
      const max_id_apteki_final = max_id_apteki[0] + 1;

      // VVV data transakcji VVVV

      // dokładna max data z bazy
      const max_rok = max_data[0].getFullYear();
      const max_miesiac = max_data[0].getMonth() + 1;
      const max_dzien = max_data[0].getDate();

      // dzisiejsza data
      const today = new Date();
      const today_year = today.getFullYear();
      const today_month = today.getMonth() + 1; // Adding 1 because getMonth() returns zero-based month index
      const today_day = today.getDate();

      // moment.js start and end date for random date
      const startDate = moment(
        `${max_rok}-${max_miesiac}-${max_dzien}`,
        "YYYY-MM-DD"
      );
      const endDate = moment(
        `${today_year}-${today_month}-${today_day}`,
        "YYYY-MM-DD"
      );

      // random date
      const randomDate = faker.date.between(
        startDate.toDate(),
        endDate.toDate()
      );

      // format the date with month as abbreviation
      const formatedDate = moment(randomDate).format("DD-MMM-YYYY");

      const transakcja = {
        id_transakcji: max_id_transakcji_final,
        kwota: faker.random.numeric(3) + "." + faker.random.numeric(2),
        data_transakcji: formatedDate,
        apteka_id_apteki: faker.datatype.number({
          min: 1,
          max: max_id_apteki_final,
        }),
        transakcja_recepta_id_recepty: faker.datatype.number({
          min: 1,
          max: max_id_recepty,
        }),
      };

      const query_transakcja = `insert into transakcja (id_transakcji, kwota, data_transakcji, apteka_id_apteki, recepta_id_recepty) values (:id_transakcji, :kwota, :data_transakcji, :apteka_id_apteki, :transakcja_recepta_id_recepty)`;

      // zapis do bazy
      await con.execute(query_transakcja, transakcja);
      console.log(`[${i + 1}]Row inserted`);

      // zapis do pliku
      const queries = [
        query_transakcja.replace(/:[a-zA-Z0-9_]+/g, (match) => {
          return `'${transakcja[match.slice(1)]}'`;
        }),
      ];

      fs.appendFile(filename, queries + ";\n", (err) => {
        if (err) throw err;
        console.log("Data appended to file!");
      });

      // zerowanie pogranych wartosci
      result_max_id_transakcji = null;
      result_max_id_apteki = null;
      result_max_id_recepty = null;
      result_max_data_transakcji = null;

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

module.exports = { insertTransakcja };
