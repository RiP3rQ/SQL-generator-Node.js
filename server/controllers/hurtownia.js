const oracleDb = require("oracledb");
const fs = require('fs');
const { faker } = require('@faker-js/faker');

const insertHurtownia = async (req, res) => {
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

    // max id hurtowni dla tabeli hurtownia
    let result_max_id_hurtowni = await con.execute("select max(id_hurtowni) from hurtownia");
    const max_id_hurtowni = result_max_id_hurtowni.rows[0];
  
    // id wyników do wstawienia
    const max_id_hurtowni_final = max_id_hurtowni[0] + 1;
  
    const hurtownia = {
        id_hurtowni: max_id_hurtowni_final,
        wlasciciel_hurtowni: faker.name.fullName().replace(/'/, ''),
        nazwa_hurtowni: faker.company.name().replace(/'/, ''),
        nr_telefonu_hurtowni: faker.random.numeric(9),
        adres_hurtowni: faker.address.cityName() + " " + faker.address.zipCode() + " " + faker.address.streetAddress(),
      }
  
    const query_Hurtownia = `insert into Hurtownia (id_hurtowni, wlasciciel, nazwa_hurtowni, nr_telefonu, adres) values (:id_hurtowni, :wlasciciel_hurtowni, :nazwa_hurtowni, :nr_telefonu_hurtowni, :adres_hurtowni)`;
         
    // zapis do bazy
    await con.execute(query_Hurtownia, hurtownia);
    console.log(`[${i+1}]Row inserted`);
  
    // zapis do pliku
    const queries = [
        query_Hurtownia.replace(/:[a-zA-Z0-9_]+/g, (match) => {
        return `'${hurtownia[match.slice(1)]}'`;
    })
    ]
    
    fs.appendFile(filename, queries + ';\n', (err) => {
        if (err) throw err;
        console.log('Data appended to file!');
    });
  
    // zerowanie pogranych wartosci
    result_max_id_hurtowni = null;
  
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

module.exports={insertHurtownia}