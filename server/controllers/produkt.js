const oracleDb = require("oracledb");
const fs = require('fs');
const { faker } = require('@faker-js/faker');

const insertProdukt = async (req, res) => {
    let con;
    const recordy = req.body.recordy;
    const filename = 'data.txt';
  
    con = await oracleDb.getConnection({
      user: "s101187",
      password: "s101187",
      connectString: "217.173.198.135:1521/tpdb",
    });
  
    try {
    for (let i = 0; i < recordy; i++) {

    // max id lekarstwa dla tabeli produkt
    let result_max_id_produktu = await con.execute("select max(id_lekarstwa) from produkt");
    const max_id_produktu = result_max_id_produktu.rows[0];
    let result_max_id_producenta = await con.execute("select max(id_producenta) from producent");
    const max_id_producenta = result_max_id_producenta.rows[0];
  
    // id wyników do wstawienia
    const max_id_produktu_final = max_id_produktu[0] + 1;
    const max_id_producenta_final = max_id_producenta[0] + 1;
  
    const produkt = {
        id_lekarstwa: max_id_produktu_final,
        nazwa_lekarstwa: faker.random.words(2).replace(/'/, ''),
        cena_lekarstwa: faker.datatype.number({'min': 1,'max': 99}) + "." + faker.datatype.number({'min': 10,'max': 99}),
        producent_id_producenta: faker.datatype.number({'min': 1,'max': max_id_producenta_final}),
        ilosc_na_magazynie: faker.datatype.number({'min': 1,'max': 99}),
        skladniki: faker.random.words(1) + ', ' + faker.random.words(1) + ', ' + faker.random.words(1) + ', ' + faker.random.words(1) + ', ',
        opis: faker.random.words(9), 
        ilosc_sztuk_w_opakowaniu: faker.datatype.number({'min': 1,'max': 99}) + "szt.",
      }
  
    const query_produkt = `insert into produkt (id_lekarstwa, nazwa, cena, producent_id_producenta, ilosc_na_magazynie, skladniki, opis, ilosc_sztuk_w_opakowaniu) values (:id_lekarstwa, :nazwa_lekarstwa, :cena_lekarstwa, :producent_id_producenta, :ilosc_na_magazynie, :skladniki, :opis, :ilosc_sztuk_w_opakowaniu )`;
         
    // zapis do bazy
    await con.execute(query_produkt, produkt);
    console.log(`[${i+1}]Row inserted`);
  
    // zapis do pliku
    const queries = [
        query_produkt.replace(/:[a-zA-Z0-9_]+/g, (match) => {
        return `'${produkt[match.slice(1)]}'`;
    })
    ]
    
    fs.appendFile(filename, queries + ';\n', (err) => {
        if (err) throw err;
        console.log('Data appended to file!');
    });
  
    // zerowanie pogranych wartosci
    result_max_id_produktu = null;
    result_max_id_producenta = null;
  
    // send data to frontend
    res.write((i+1).toString());
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
}

module.exports={insertProdukt}