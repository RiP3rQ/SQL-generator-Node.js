const oracleDb = require("oracledb");
const fs = require('fs');
const { faker } = require('@faker-js/faker');

const insertRecepta = async (req, res) => {
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
    
    // max id recepty dla tabeli recepta
    let result_max_id_recepty = await con.execute("select max(id_recepty) from recepta");
    const max_id_recepty = result_max_id_recepty.rows[0];
    let result_max_id_klienta = await con.execute(`select max(id_klienta) from klienci`);
    const max_id_klienta = result_max_id_klienta.rows[0];
    let result_max_id_transakcji = await con.execute("select max(id_transakcji) from transakcja");
    const max_id_transakcji = result_max_id_transakcji.rows[0];

    // id wyników do wstawienia
    const max_id_recepty_final = max_id_recepty[0] + 1;
    const max_id_klienta_final = max_id_klienta[0] + 1;
    const max_id_transakcji_final = max_id_transakcji[0] + 1;

  
    const recepta = {
        id_recepty: max_id_recepty_final,
        data_waznosci_recepty: faker.datatype.number({'min': 1,'max': 12}) + "-" + faker.date.month({ abbr: true }) + "-" + faker.datatype.number({'min': 2024,'max': 2027}),
        klienci_id_klienta: faker.datatype.number({'min': 1,'max': max_id_klienta_final}),
        transakcja_id_transakcji: max_id_transakcji_final,
    };
  
    const query_recepta = `insert into recepta (id_recepty, data_waznosci_recepty, klienci_id_klienta, transakcja_id_transakcji) values (:id_recepty, :data_waznosci_recepty, :klienci_id_klienta, :transakcja_id_transakcji)`;
         
    // zapis do bazy
    await con.execute(query_recepta, recepta);
    console.log(`[${i+1}]Row inserted`);
  
    // zapis do pliku
    const queries = [
        query_recepta.replace(/:[a-zA-Z0-9_]+/g, (match) => {
        return `'${recepta[match.slice(1)]}'`;
    })
    ]
    
    fs.appendFile(filename, queries + ';\n', (err) => {
        if (err) throw err;
        console.log('Data appended to file!');
    });
  
    // zerowanie pogranych wartosci
    result_max_id_recepty = null;
    result_max_id_klienta = null;
    result_max_id_transakcji = null;
  
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

module.exports={insertRecepta}