const oracleDb = require("oracledb");
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const { faker } = require('@faker-js/faker');
const { autoCommit } = require("oracledb");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3001, () => {
  console.log('listening on port 3001');
 });

app.post('/api/insertUsers', async function (req, res) {
  let con;
  const recordy = req.body.recordy;
  const filename = 'data.txt';

  con = await oracleDb.getConnection({
    user: "s101187",
    password: "s101187",
    connectString: "217.173.198.135:1521/tpdb",
  });
  
  for (let i = 0; i < recordy; i++) {
        try {
        // max id klienta dla tabeli klienci
        let result_max_id_klienta = await con.execute(`select max(id_klienta) from klienci`);
        const max_id_klienta = result_max_id_klienta.rows[0];

        // max id hurtowni dla tabeli hurtownia
        let result_max_id_hurtowni = await con.execute("select max(id_hurtowni) from hurtownia");
        const max_id_hurtowni = result_max_id_hurtowni.rows[0];

        // max id apteki dla tabeli pracownicy apteki oraz dla tabeli apteka
        let result_max_id_apteki = await con.execute("select MAX(id_apteki) from apteka");
        const max_id_apteki = result_max_id_apteki.rows[0];

        // max id pracownika dla tabeli pracownicy
        let result_max_id_apracownika = await con.execute("select max(id_pracownika) from pracownicy_apteki");
        const max_id_pracownika = result_max_id_apracownika.rows[0];

        // max id producenta dla tabeli producenci
        let result_max_id_producenta = await con.execute("select max(id_producenta) from producent");
        const max_id_producenta = result_max_id_producenta.rows[0];

        // max id lekarstwa dla tabeli produkt
        let result_max_id_produktu = await con.execute("select max(id_lekarstwa) from produkt");
        const max_id_produktu = result_max_id_produktu.rows[0];

        // id wyników do wstawienia
        const max_id_klienta_final = max_id_pracownika[0] + 1;
        const max_id_hurtowni_final = max_id_hurtowni[0] + 1;
        const max_id_apteki_final = max_id_apteki[0] + 1;
        const max_id_pracownika_final = max_id_pracownika[0] + 1;
        const max_id_producenta_final = max_id_producenta[0] + 1;
        const max_id_produktu_final = max_id_produktu[0] + 1;

        // logowanie wartości
        // console.log(max_id_pracownika_final );

        const values = {
          // klienci
          id_klienta: max_id_klienta_final,
          pesel: faker.random.numeric(11),  
          nr_telefonu: faker.random.numeric(9),
          // apteka
          id_apteki: max_id_hurtowni_final,
          miasto: faker.address.cityName(),
          kod_pocztowy: `${faker.random.numeric(2)}-${faker.random.numeric(3)}`,
          ulica: faker.address.streetAddress(),
          nazwa: faker.company.name(),
          ilosc_pracownikow: faker.random.numeric(2),
          // hurtownia
          id_hurtowni: max_id_apteki_final,
          wlasciciel_hurtowni: faker.name.fullName(),
          nazwa_hurtowni: faker.company.name(),
          nr_telefonu_hurtowni: faker.random.numeric(9),
          adres_hurtowni: faker.address.cityName() + " " + faker.address.zipCode() + " " + faker.address.streetAddress(),
          // pracownicy
          id_pracownika: max_id_pracownika_final,
          nazwisko_pracownika: faker.name.lastName(),
          nr_telefonu_pracownika: faker.random.numeric(9),
          data_zatrudnienia_pracownika: faker.datatype.number({'min': 1,'max': 12}) + "-" + faker.date.month({ abbr: true }) + "-" + faker.datatype.number({'min': 2007,'max': 2022}), 
          pensja_pracownika: faker.random.numeric(4) + "." + faker.random.numeric(2),
          adres_zamieszkania_pracownika: faker.address.cityName() + " " + faker.address.streetAddress(),
          id_apteki_zatrudniajacej: faker.datatype.number({'min': 1,'max': max_id_hurtowni_final}),
          // producent
          id_producenta: max_id_producenta_final,
          nazwa_producenta: faker.company.name(),
          adres_producenta: faker.address.cityName() + " " + faker.address.zipCode() + " " + faker.address.streetAddress(),
          nr_telefonu_producenta: faker.random.numeric(9),
          email_producenta: faker.internet.email(),
          // produkt
          id_lekarstwa: max_id_produktu_final,
          nazwa_lekarstwa: faker.random.words(2),
          cena_lekarstwa: faker.datatype.number({'min': 1,'max': 99}) + "." + faker.datatype.number({'min': 10,'max': 99}),
          producent_id_producenta: faker.datatype.number({'min': 1,'max': max_id_producenta_final}),
          ilosc_na_magazynie: faker.datatype.number({'min': 1,'max': 99}),
          skladniki: faker.random.words(1) + ', ' + faker.random.words(1) + ', ' + faker.random.words(1) + ', ' + faker.random.words(1) + ', ',
          opis: faker.random.words(9), 
          ilosc_sztuk_w_opakowaniu: faker.datatype.number({'min': 1,'max': 99}) + "szt.",
        };
        const result = await con.execute(
          `BEGIN
            insert into klienci (id_klienta, pesel, nr_telefonu) 
            values (:id_klienta , :pesel, :nr_telefonu);

            insert into apteka (id_apteki, miasto, kod_pocztowy, ulica, nazwa, ilosc_pracownikow) 
            values (:id_apteki, :miasto, :kod_pocztowy, :ulica, :nazwa, :ilosc_pracownikow);

            insert into Hurtownia (id_hurtowni, wlasciciel, nazwa_hurtowni, nr_telefonu, adres) 
            values (:id_hurtowni, :wlasciciel_hurtowni, :nazwa_hurtowni, :nr_telefonu_hurtowni, :adres_hurtowni);
          
            insert into pracownicy_apteki (id_pracownika, nazwisko, nr_telefonu, data_zatrudnienia, pensja, adres_zamieszkania, apteka_id_apteki) 
            values (:id_pracownika, :nazwisko_pracownika, :nr_telefonu_pracownika, :data_zatrudnienia_pracownika,
            :pensja_pracownika , :adres_zamieszkania_pracownika, :id_apteki_zatrudniajacej);

            insert into producent (id_producenta, nazwa, adres, nr_telefonu, email) 
            values (:id_producenta, :nazwa_producenta, :adres_producenta, :nr_telefonu_producenta, :email_producenta);

            insert into produkt (id_lekarstwa, nazwa, cena, producent_id_producenta, ilosc_na_magazynie, skladniki, opis, ilosc_sztuk_w_opakowaniu) 
            values (:id_lekarstwa, :nazwa_lekarstwa, :cena_lekarstwa, :producent_id_producenta, :ilosc_na_magazynie, :skladniki, :opis, :ilosc_sztuk_w_opakowaniu );
          END;`,
          values,
          {autoCommit: true}
        );
        console.log(`[${i+1}]Row inserted`);

        // zerowanie pogranych wartosci
        result_max_id_klienta = null;
        result_max_id_hurtowni = null;
        result_max_id_apteki = null;
        result_max_id_apracownika = null;
        result_max_id_producenta = null;
        result_max_id_produktu = null;
      } catch (err) {
        console.log(err);
      }
  }

  if (con) {
    await con.close();
  }
});



// zapis do pliku
        // fs.appendFile(filename, `id_klienta_dodanego: ${i} ,pesel: ${values.pesel}, nr_telefonu: ${values.nr_telefonu} \nid_apteki: ${i}, miasto: ${values.miasto}, kod_pocztowy: ${values.kod_pocztowy}, ulica: ${values.ulica}, nazwa: ${values.nazwa}, ilosc_pracownikow: ${values.ilosc_pracownikow}\n`, (err) => {
        //   if (err) throw err;
        //   console.log('Data appended to file!');
        // });