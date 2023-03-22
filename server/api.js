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

        // max id przepisanego lekarstwa dla tabeli przepisane_lekarstwa
        let result_max_id_przepisanego_lekarstwa = await con.execute("select max(id_lekarstwa) from przepisane_lekarstwa");
        const max_id_przepisanego_lekarstwa = result_max_id_przepisanego_lekarstwa.rows[0];

        // max id recepty dla tabeli recepta
        let result_max_id_recepty = await con.execute("select max(id_recepty) from recepta");
        const max_id_recepty = result_max_id_recepty.rows[0];

        // max id transakcji dla tabeli transakcja
        let result_max_id_transakcji = await con.execute("select max(id_transakcji) from transakcja");
        const max_id_transakcji = result_max_id_transakcji.rows[0];

        // id wyników do wstawienia
        const max_id_klienta_final = max_id_pracownika[0] + 1;
        const max_id_hurtowni_final = max_id_hurtowni[0] + 1;
        const max_id_apteki_final = max_id_apteki[0] + 1;
        const max_id_pracownika_final = max_id_pracownika[0] + 1;
        const max_id_producenta_final = max_id_producenta[0] + 1;
        const max_id_produktu_final = max_id_produktu[0] + 1;
        const max_id_przepisanego_lekarstwa_final = max_id_przepisanego_lekarstwa[0] + 1;
        const max_id_recepty_final = max_id_recepty[0] + 1;
        const max_id_transakcji_final = max_id_transakcji[0] + 1;

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
          // relation 8
          relation_8_hurtownia_id_hurtowni: faker.datatype.number({'min': 1,'max': max_id_apteki_final}),
          // przepisane lekarstwa
          przepisane_lekarstwa_id_lekarstwa: max_id_przepisanego_lekarstwa_final,
          przepisane_lekarstwa_nazwa_lekarstwa: faker.random.words(2),
          przepisane_lekarstwa_ilosc: faker.datatype.number({'min': 1,'max': 9}), 
          recepta_id_recepty: faker.datatype.number({'min': 1,'max': max_id_recepty}), 
          // transakcja
          id_transakcji: max_id_transakcji_final,
          kwota: faker.random.numeric(3) + "." + faker.random.numeric(2),
          data_transakcji: faker.datatype.number({'min': 1,'max': 12}) + "-" + faker.date.month({ abbr: true }) + "-" + faker.datatype.number({'min': 2007,'max': 2022}),
          apteka_id_apteki: faker.datatype.number({'min': 1,'max': max_id_apteki_final}),
          transakcja_recepta_id_recepty: faker.datatype.number({'min': 1,'max': max_id_recepty}), // do zmiany,
          // recepta
          id_recepty: max_id_recepty_final,
          data_waznosci_recepty: faker.datatype.number({'min': 1,'max': 12}) + "-" + faker.date.month({ abbr: true }) + "-" + faker.datatype.number({'min': 2024,'max': 2027}),
          klienci_id_klienta: faker.datatype.number({'min': 1,'max': max_id_klienta_final}),
          transakcja_id_transakcji: max_id_transakcji_final,
        };


        const query = `
        BEGIN
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
        
          insert into relation_8 (produkt_id_lekarstwa , hurtownia_id_hurtowni) 
          values (:id_lekarstwa, :relation_8_hurtownia_id_hurtowni);

          insert into przepisane_lekarstwa ( id_lekarstwa, nazwa_lekarstwa, ilosc, recepta_id_recepty) 
          VALUES (:przepisane_lekarstwa_id_lekarstwa, :przepisane_lekarstwa_nazwa_lekarstwa, :przepisane_lekarstwa_ilosc, :recepta_id_recepty);
          
          insert into transakcja (id_transakcji, kwota, data_transakcji, apteka_id_apteki, recepta_id_recepty) 
          values (:id_transakcji, :kwota, :data_transakcji, :apteka_id_apteki, :transakcja_recepta_id_recepty);
          
          insert into recepta (id_recepty, data_waznosci_recepty, klienci_id_klienta, transakcja_id_transakcji) 
          values (:id_recepty, :data_waznosci_recepty, :klienci_id_klienta, :transakcja_id_transakcji);

          insert into relation_7 (transakcja_id_transakcji , produkt_id_lekarstwa) 
          values (:transakcja_id_transakcji, :id_lekarstwa);
        END;`
      ;

        const result = await con.execute(query,values,{autoCommit: true});
        console.log(`[${i+1}]Row inserted`);

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

        // zapis do pliku
        fs.appendFile(filename, query, (err) => {
           if (err) throw err;
           console.log('Data appended to file!');
         });

      } catch (err) {
        console.log(err);
      }
  }

  if (con) {
    await con.close();
  }
});



// zamiana znaków
// const myString = 'Hello, my name is :name and I am :age years old.';
// const myOptions = { name: 'John', age: 25 };

// const replacedString = myString.replace(/:[a-zA-Z0-9_]+/g, (match) => {
//   const variableName = match.substring(1);
//   return myOptions[variableName] || match;
// });

// console.log(replacedString);




