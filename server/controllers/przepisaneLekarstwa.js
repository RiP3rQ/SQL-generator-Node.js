const oracleDb = require("oracledb");
const fs = require('fs');
const { faker } = require('@faker-js/faker');

const insertPrzepisaneLekarstwa = async (req, res) => {
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
    
    // max id przepisanego lekarstwa dla tabeli przepisane_lekarstwa
    let result_max_id_przepisanego_lekarstwa = await con.execute("select max(id_lekarstwa) from przepisane_lekarstwa");
    const max_id_przepisanego_lekarstwa = result_max_id_przepisanego_lekarstwa.rows[0];
    let result_max_id_recepty = await con.execute("select max(id_recepty) from recepta");
    const max_id_recepty = result_max_id_recepty.rows[0];

  
    // id wyników do wstawienia
    const max_id_przepisanego_lekarstwa_final = max_id_przepisanego_lekarstwa[0] + 1;

  
    const przepisane_lekarstwa = {
        przepisane_lekarstwa_id_lekarstwa: max_id_przepisanego_lekarstwa_final,
        przepisane_lekarstwa_nazwa_lekarstwa: faker.random.words(2),
        przepisane_lekarstwa_ilosc: faker.datatype.number({'min': 1,'max': 9}), 
        recepta_id_recepty: faker.datatype.number({'min': 1,'max': max_id_recepty}), 
    }
  
    const query_przepisane_lekarstwa = `insert into przepisane_lekarstwa ( id_lekarstwa, nazwa_lekarstwa, ilosc, recepta_id_recepty) VALUES (:przepisane_lekarstwa_id_lekarstwa, :przepisane_lekarstwa_nazwa_lekarstwa, :przepisane_lekarstwa_ilosc, :recepta_id_recepty)`;
         
    // zapis do bazy
    await con.execute(query_przepisane_lekarstwa, przepisane_lekarstwa);
    console.log(`[${i+1}]Row inserted`);
  
    // zapis do pliku
    const queries = [
        query_przepisane_lekarstwa.replace(/:[a-zA-Z0-9_]+/g, (match) => {
        return `'${przepisane_lekarstwa[match.slice(1)]}'`;
    })
    ]
    
    fs.appendFile(filename, queries + ';\n', (err) => {
        if (err) throw err;
        console.log('Data appended to file!');
    });
  
    // zerowanie pogranych wartosci
    result_max_id_przepisanego_lekarstwa = null;
    result_max_id_recepty = null;
  
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

module.exports={insertPrzepisaneLekarstwa}