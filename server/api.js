const oracleDb = require("oracledb");
oracleDb.outFormat = oracleDb.OUT_FORMAT_OBJECT;

async function connect() {
  let con;

  con = await oracleDb.getConnection({
    user: "s101187",
    password: "s101187",
    connectString: "217.173.198.135:1521/tpdb",
  });

    const data = await con.execute("SELECT * FROM klienci");
    // const ostatniRekord = data.rows.slice(-1)[0].ID_KLIENTA;
    console.log(data.rows);
  } catch (err) {
    console.log(err);
  }
}

connect();
