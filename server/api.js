const oracleDb = require("oracledb");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const { faker } = require("@faker-js/faker");
const moment = require("moment");
const WebSocket = require("ws");
const wss = require("./websocket");

const { insertKlienci } = require("./controllers/klienci");
const { insertApteka } = require("./controllers/apteka");
const { insertHurtownia } = require("./controllers/hurtownia");
const { insertPracownicyApteki } = require("./controllers/pracownicyApteki");
const { insertProducent } = require("./controllers/producent");
const { insertProdukt } = require("./controllers/produkt");
const { insertRelation8 } = require("./controllers/relation8");
const {
  insertPrzepisaneLekarstwa,
} = require("./controllers/przepisaneLekarstwa");
const { insertTransakcja } = require("./controllers/transakcja");
const { insertRecepta } = require("./controllers/recepta");
const { insertRelation7 } = require("./controllers/relation7");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

wss.on("connection", function connection(ws) {
  console.log("WebSocket connected");
});

app.listen(3001, () => {
  console.log("listening on port 3001");
});

// insertowanie do wszystkich tabel
app.post("/api/insertUsers", async function (req, res) {
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
      // max id klienta dla tabeli klienci
      let result_max_id_klienta = await con.execute(
        `select max(id_klienta) from klienci`
      );
      const max_id_klienta = result_max_id_klienta.rows[0];

      // max id hurtowni dla tabeli hurtownia
      let result_max_id_hurtowni = await con.execute(
        "select max(id_hurtowni) from hurtownia"
      );
      const max_id_hurtowni = result_max_id_hurtowni.rows[0];

      // max id apteki dla tabeli pracownicy apteki oraz dla tabeli apteka
      let result_max_id_apteki = await con.execute(
        "select MAX(id_apteki) from apteka"
      );
      const max_id_apteki = result_max_id_apteki.rows[0];

      // max id pracownika dla tabeli pracownicy
      let result_max_id_apracownika = await con.execute(
        "select max(id_pracownika) from pracownicy_apteki"
      );
      const max_id_pracownika = result_max_id_apracownika.rows[0];

      // max id producenta dla tabeli producenci
      let result_max_id_producenta = await con.execute(
        "select max(id_producenta) from producent"
      );
      const max_id_producenta = result_max_id_producenta.rows[0];

      // max id lekarstwa dla tabeli produkt
      let result_max_id_produktu = await con.execute(
        "select max(id_lekarstwa) from produkt"
      );
      const max_id_produktu = result_max_id_produktu.rows[0];

      // max id przepisanego lekarstwa dla tabeli przepisane_lekarstwa
      let result_max_id_przepisanego_lekarstwa = await con.execute(
        "select max(id_lekarstwa) from przepisane_lekarstwa"
      );
      const max_id_przepisanego_lekarstwa =
        result_max_id_przepisanego_lekarstwa.rows[0];

      // max id recepty dla tabeli recepta
      let result_max_id_recepty = await con.execute(
        "select max(id_recepty) from recepta"
      );
      const max_id_recepty = result_max_id_recepty.rows[0];

      // max id transakcji dla tabeli transakcja
      let result_max_id_transakcji = await con.execute(
        "select max(id_transakcji) from transakcja"
      );
      const max_id_transakcji = result_max_id_transakcji.rows[0];

      // ostatnia data transakcji
      let result_max_data_transakcji = await con.execute(
        "select max(data_transakcji) from transakcja"
      );
      let max_data = result_max_data_transakcji.rows[0];

      if (max_data[0] === null) {
        max_data[0] = new Date(2010, 0, 1, 23, 59, 59);
      }

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

      // id wyników do wstawienia
      const max_id_klienta_final = max_id_klienta[0] + 1;
      const max_id_hurtowni_final = max_id_hurtowni[0] + 1;
      const max_id_apteki_final = max_id_apteki[0] + 1;
      const max_id_pracownika_final = max_id_pracownika[0] + 1;
      const max_id_producenta_final = max_id_producenta[0] + 1;
      const max_id_produktu_final = max_id_produktu[0] + 1;
      const max_id_przepisanego_lekarstwa_final =
        max_id_przepisanego_lekarstwa[0] + 1;
      const max_id_recepty_final = max_id_recepty[0] + 1;
      const max_id_transakcji_final = max_id_transakcji[0] + 1;

      // obiekty do podmiany w tabelach
      const klienci = {
        // klienci
        id_klienta: max_id_klienta_final,
        pesel: faker.random.numeric(11),
        nr_telefonu: faker.random.numeric(9),
      };

      const apteka = {
        // apteka
        id_apteki: max_id_apteki_final,
        miasto: faker.address.cityName(),
        kod_pocztowy: `${faker.random.numeric(2)}-${faker.random.numeric(3)}`,
        ulica: faker.address.streetAddress().replace(/'/, ""),
        nazwa: faker.company.name().replace(/'/, ""),
        ilosc_pracownikow: faker.random.numeric(2),
      };

      const hurtownia = {
        // hurtownia
        id_hurtowni: max_id_hurtowni_final,
        wlasciciel_hurtowni: faker.name.fullName().replace(/'/, ""),
        nazwa_hurtowni: faker.company.name().replace(/'/, ""),
        nr_telefonu_hurtowni: faker.random.numeric(9),
        adres_hurtowni:
          faker.address.cityName() +
          " " +
          faker.address.zipCode() +
          " " +
          faker.address.streetAddress(),
      };

      const pracownicy = {
        // pracownicy
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
        id_apteki_zatrudniajacej:
          max_id_apteki_final === 1
            ? 1
            : faker.datatype.number({
                min: 1,
                max: max_id_apteki_final,
              }),
      };
      const producent = {
        // producent
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
      const produkt = {
        // produkt
        id_lekarstwa: max_id_produktu_final,
        nazwa_lekarstwa: faker.random.words(2).replace(/'/, ""),
        cena_lekarstwa:
          faker.datatype.number({ min: 1, max: 99 }) +
          "." +
          faker.datatype.number({ min: 10, max: 99 }),
        producent_id_producenta:
          max_id_producenta_final === 1
            ? 1
            : faker.datatype.number({
                min: 1,
                max: max_id_producenta_final,
              }),
        ilosc_na_magazynie: faker.datatype.number({ min: 1, max: 99 }),
        skladniki:
          faker.random.words(1) +
          ", " +
          faker.random.words(1) +
          ", " +
          faker.random.words(1) +
          ", " +
          faker.random.words(1) +
          ", ",
        opis: faker.random.words(9),
        ilosc_sztuk_w_opakowaniu:
          faker.datatype.number({ min: 1, max: 99 }) + "szt.",
      };
      const relation_8 = {
        // relation 8
        id_lekarstwa:
          max_id_produktu_final === 1
            ? 1
            : faker.datatype.number({
                min: 1,
                max: max_id_produktu_final,
              }),
        relation_8_hurtownia_id_hurtowni:
          max_id_hurtowni_final === 1
            ? 1
            : faker.datatype.number({
                min: 1,
                max: max_id_hurtowni_final,
              }),
      };
      const przepisane_lekarstwa = {
        // przepisane lekarstwa
        przepisane_lekarstwa_id_lekarstwa: max_id_przepisanego_lekarstwa_final,
        przepisane_lekarstwa_nazwa_lekarstwa: faker.random.words(2),
        przepisane_lekarstwa_ilosc: faker.datatype.number({ min: 1, max: 9 }),
        recepta_id_recepty:
          max_id_recepty_final === 1
            ? 1
            : faker.datatype.number({
                min: 1,
                max: max_id_recepty,
              }),
      };

      const transakcja = {
        // transakcja
        id_transakcji: max_id_transakcji_final,
        kwota: faker.random.numeric(3) + "." + faker.random.numeric(2),
        data_transakcji: formatedDate,
        apteka_id_apteki:
          max_id_apteki_final === 1
            ? 1
            : faker.datatype.number({
                min: 1,
                max: max_id_apteki_final,
              }),
        transakcja_recepta_id_recepty:
          max_id_recepty_final === 1
            ? 1
            : faker.datatype.number({
                min: 1,
                max: max_id_recepty,
              }),
      };
      const recepta = {
        // recepta
        id_recepty: max_id_recepty_final,
        data_waznosci_recepty:
          faker.datatype.number({ min: 1, max: 12 }) +
          "-" +
          faker.date.month({ abbr: true }) +
          "-" +
          faker.datatype.number({ min: 2024, max: 2027 }),
        klienci_id_klienta:
          max_id_klienta_final === 1
            ? 1
            : faker.datatype.number({
                min: 1,
                max: max_id_klienta_final,
              }),
        transakcja_id_transakcji: max_id_transakcji_final,
      };

      const relation_7 = {
        // relation 7
        transakcja_id_transakcji: max_id_transakcji_final,
        id_lekarstwa:
          max_id_produktu_final === 1
            ? 1
            : faker.datatype.number({
                min: 1,
                max: max_id_produktu_final,
              }),
      };

      const query_klienci = `insert into klienci (id_klienta, pesel, nr_telefonu) values (:id_klienta, :pesel, :nr_telefonu)`;
      const query_apteka = `insert into apteka (id_apteki, miasto, kod_pocztowy, ulica, nazwa, ilosc_pracownikow) values (:id_apteki, :miasto, :kod_pocztowy, :ulica, :nazwa, :ilosc_pracownikow)`;
      const query_Hurtownia = `insert into Hurtownia (id_hurtowni, wlasciciel, nazwa_hurtowni, nr_telefonu, adres) values (:id_hurtowni, :wlasciciel_hurtowni, :nazwa_hurtowni, :nr_telefonu_hurtowni, :adres_hurtowni)`;
      const query_pracownicy_apteki = `insert into pracownicy_apteki (id_pracownika, nazwisko, nr_telefonu, data_zatrudnienia, pensja, adres_zamieszkania, apteka_id_apteki) values (:id_pracownika, :nazwisko_pracownika, :nr_telefonu_pracownika, :data_zatrudnienia_pracownika, :pensja_pracownika , :adres_zamieszkania_pracownika, :id_apteki_zatrudniajacej)`;
      const query_producent = `insert into producent (id_producenta, nazwa, adres, nr_telefonu, email) values (:id_producenta, :nazwa_producenta, :adres_producenta, :nr_telefonu_producenta, :email_producenta)`;
      const query_produkt = `insert into produkt (id_lekarstwa, nazwa, cena, producent_id_producenta, ilosc_na_magazynie, skladniki, opis, ilosc_sztuk_w_opakowaniu) values (:id_lekarstwa, :nazwa_lekarstwa, :cena_lekarstwa, :producent_id_producenta, :ilosc_na_magazynie, :skladniki, :opis, :ilosc_sztuk_w_opakowaniu )`;
      const query_relation_8 = `insert into relation_8 (produkt_id_lekarstwa , hurtownia_id_hurtowni) values (:id_lekarstwa, :relation_8_hurtownia_id_hurtowni)`;
      const query_przepisane_lekarstwa = `insert into przepisane_lekarstwa ( id_lekarstwa, nazwa_lekarstwa, ilosc, recepta_id_recepty) VALUES (:przepisane_lekarstwa_id_lekarstwa, :przepisane_lekarstwa_nazwa_lekarstwa, :przepisane_lekarstwa_ilosc, :recepta_id_recepty)`;
      const query_transakcja = `insert into transakcja (id_transakcji, kwota, data_transakcji, apteka_id_apteki, recepta_id_recepty) values (:id_transakcji, :kwota, :data_transakcji, :apteka_id_apteki, :transakcja_recepta_id_recepty)`;
      const query_recepta = `insert into recepta (id_recepty, data_waznosci_recepty, klienci_id_klienta, transakcja_id_transakcji) values (:id_recepty, :data_waznosci_recepty, :klienci_id_klienta, :transakcja_id_transakcji)`;
      const query_relation_7 = `insert into relation_7 (transakcja_id_transakcji , produkt_id_lekarstwa) values (:transakcja_id_transakcji, :id_lekarstwa)`;

      // zapis do bazy
      await con.execute(query_klienci, klienci);
      await con.execute(query_apteka, apteka);
      await con.execute(query_Hurtownia, hurtownia);
      await con.execute(query_pracownicy_apteki, pracownicy);
      await con.execute(query_producent, producent);
      await con.execute(query_produkt, produkt);
      await con.execute(query_relation_8, relation_8);
      await con.execute(query_przepisane_lekarstwa, przepisane_lekarstwa);
      await con.execute(query_transakcja, transakcja);
      await con.execute(query_recepta, recepta);
      await con.execute(query_relation_7, relation_7);
      console.log(`[${i + 1}]Row inserted`);

      // zapis do pliku
      const queries = [
        query_klienci.replace(/:[a-zA-Z0-9_]+/g, (match) => {
          return `'${klienci[match.slice(1)]}'`;
        }),
        query_apteka.replace(/:[a-zA-Z0-9_]+/g, (match) => {
          return `'${apteka[match.slice(1)]}'`;
        }),
        query_Hurtownia.replace(/:[a-zA-Z0-9_]+/g, (match) => {
          return `'${hurtownia[match.slice(1)]}'`;
        }),
        query_pracownicy_apteki.replace(/:[a-zA-Z0-9_]+/g, (match) => {
          return `'${pracownicy[match.slice(1)]}'`;
        }),
        query_producent.replace(/:[a-zA-Z0-9_]+/g, (match) => {
          return `'${producent[match.slice(1)]}'`;
        }),
        query_produkt.replace(/:[a-zA-Z0-9_]+/g, (match) => {
          return `'${produkt[match.slice(1)]}'`;
        }),
        query_relation_8.replace(/:[a-zA-Z0-9_]+/g, (match) => {
          return `'${relation_8[match.slice(1)]}'`;
        }),
        query_przepisane_lekarstwa.replace(/:[a-zA-Z0-9_]+/g, (match) => {
          return `'${przepisane_lekarstwa[match.slice(1)]}'`;
        }),
        query_transakcja.replace(/:[a-zA-Z0-9_]+/g, (match) => {
          return `'${transakcja[match.slice(1)]}'`;
        }),
        query_recepta.replace(/:[a-zA-Z0-9_]+/g, (match) => {
          return `'${recepta[match.slice(1)]}'`;
        }),
        query_relation_7.replace(/:[a-zA-Z0-9_]+/g, (match) => {
          return `'${relation_7[match.slice(1)]}'`;
        }),
      ];
      fs.appendFile(filename, queries.join(";\n"), (err) => {
        if (err) throw err;
        console.log("Data appended to file!");
      });

      // zerowanie pogranych wartosci
      result_max_id_klienta = null;
      result_max_id_hurtowni = null;
      result_max_id_apteki = null;
      result_max_id_apracownika = null;
      result_max_id_producenta = null;
      result_max_id_produktu = null;
      result_max_id_przepisanego_lekarstwa = null;
      result_max_id_recepty = null;
      result_max_id_transakcji = null;
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
    if (con) {
      await con.close();
    }
  }
});

// insertowanie do pojedyńczych tabel
app.post("/api/insertKlienci", insertKlienci);
app.post("/api/insertApteka", insertApteka);
app.post("/api/insertHurtownia", insertHurtownia);
app.post("/api/insertPracownicyApteki", insertPracownicyApteki);
app.post("/api/insertProducent", insertProducent);
app.post("/api/insertProdukt", insertProdukt);
app.post("/api/insertRelation8", insertRelation8);
app.post("/api/insertPrzepisaneLekarstwa", insertPrzepisaneLekarstwa);
app.post("/api/insertTransakcja", insertTransakcja);
app.post("/api/insertRecepta", insertRecepta);
app.post("/api/insertRelation7", insertRelation7);
