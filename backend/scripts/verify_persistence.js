const { PGlite } = require("@electric-sql/pglite")
const path = require("path")
const fs = require("fs")

const dataDir = path.join(__dirname, "../data/pg_data_test")

// Clean up previous test
if (fs.existsSync(dataDir)) {
    fs.rmSync(dataDir, { recursive: true, force: true });
}

async function testPersistence() {
    console.log(`Open 1: ${dataDir}`)
    const db1 = new PGlite(dataDir);
    await db1.exec("CREATE TABLE foo (id int); INSERT INTO foo VALUES (1);");
    console.log("Created table foo and inserted 1 row.");
    await db1.close();

    console.log(`Open 2: ${dataDir}`)
    const db2 = new PGlite(dataDir);
    const res = await db2.query("SELECT * FROM foo");
    console.log("Rows in foo:", res.rows);
    await db2.close();
}

testPersistence().catch(console.error)
