const oracleDb = require("oracledb");
const fs = require('fs');
const { faker } = require('@faker-js/faker');

const insertKlienci = async (req, res) => {
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
    // max id klienta dla tabeli klienci
    let result_max_id_klienta = await con.execute(`select max(id_klienta) from klienci`);
    const max_id_klienta = result_max_id_klienta.rows[0];
  
    // id wyników do wstawienia
    const max_id_klienta_final = max_id_klienta[0] + 1;
  
    const klienci = {
    id_klienta: max_id_klienta_final,
    pesel: faker.random.numeric(11),  
    nr_telefonu: faker.random.numeric(9),
    }
  
    const query_klienci = `insert into klienci (id_klienta, pesel, nr_telefonu) values (:id_klienta, :pesel, :nr_telefonu)`;
         
    // zapis do bazy
    await con.execute(query_klienci, klienci);
    console.log(`[${i+1}]Row inserted`);
  
    // zapis do pliku
    const queries = [
    query_klienci.replace(/:[a-zA-Z0-9_]+/g, (match) => {
        return `'${klienci[match.slice(1)]}'`;
    })
    ]
    
    fs.appendFile(filename, queries + ';\n', (err) => {
        if (err) throw err;
        console.log('Data appended to file!');
    });
  
    // zerowanie pogranych wartosci
    result_max_id_klienta = null;
  
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

module.exports={insertKlienci}