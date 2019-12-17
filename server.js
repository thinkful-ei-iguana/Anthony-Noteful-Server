const app = require("./app");
const { PORT, DATABASE_URL } = require("./config");
const knex = require("knex");

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});

const db = knex({
  client: "pg",
  connection: DATABASE_URL
});

app.set("db", db);
