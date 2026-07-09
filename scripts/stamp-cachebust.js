const fs = require("fs");
const path = require("path");

const version = (process.env.COMMIT_REF || String(Date.now())).slice(0, 8);
const files = ["index.html", "fotos.html", "pagamento.html"];

for (const file of files) {
  const filePath = path.join(__dirname, "..", file);
  const content = fs.readFileSync(filePath, "utf8");
  fs.writeFileSync(filePath, content.split("__CACHEBUST__").join(version));
}

console.log(`Cache-bust stamped: ${version}`);
