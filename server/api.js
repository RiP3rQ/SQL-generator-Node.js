const oracleDb = require("oracledb");
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const { faker } = require('@faker-js/faker');

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
  
  for (let i = 0; i < recordy; i++) {
    try {
    con = await oracleDb.getConnection({
      user: "s101187",
      password: "s101187",
      connectString: "217.173.198.135:1521/tpdb",
    });

    const values = {
      pesel: faker.random.numeric(11),  
      nr_telefonu: faker.random.numeric(9),
      miasto: faker.address.cityName(),
      kod_pocztowy: `${faker.random.numeric(2)}-${faker.random.numeric(3)}`,
      ulica: faker.address.streetAddress(),
      nazwa: faker.company.name(),
      ilosc_pracownikow: faker.random.numeric(2),
    };
    const result = await con.execute(
      `BEGIN
        insert into klienci (id_klienta, pesel, nr_telefonu) 
        values ( (select max(id_klienta)+1 from klienci) , :pesel, :nr_telefonu);

        insert into apteka (id_apteki, miasto, kod_pocztowy, ulica, nazwa, ilosc_pracownikow) 
        values ((select max(id_apteki)+1 from apteka), :miasto, :kod_pocztowy, :ulica, :nazwa, :ilosc_pracownikow);
        
        COMMIT;
      END;`,
      values
    );
    console.log(`[${i+1}]Row inserted`);

    // zapis do pliku
    fs.appendFile(filename, `id_klienta_dodanego: ${i} ,pesel: ${values.pesel}, nr_telefonu: ${values.nr_telefonu} \nid_apteki: ${i}, miasto: ${values.miasto}, kod_pocztowy: ${values.kod_pocztowy}, ulica: ${values.ulica}, nazwa: ${values.nazwa}, ilosc_pracownikow: ${values.ilosc_pracownikow}\n`, (err) => {
      if (err) throw err;
      console.log('Data appended to file!');
    });
  } catch (err) {
    console.log(err);
  } finally {
    if (con) {
      await con.close();
    }
  }
    
  }

});

