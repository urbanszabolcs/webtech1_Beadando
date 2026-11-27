const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

async function backupDatabase(sourcePath, destinationPath) {
  const source = path.resolve(sourcePath);
  const destination = path.resolve(destinationPath);
  if (source === destination) {
    throw new Error("Backup destination must differ from the source database.");
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const db = new Database(source, { readonly: true, fileMustExist: true });
  try {
    await db.backup(destination);
  } finally {
    db.close();
  }
}

if (require.main === module) {
  const destinationPath = process.argv[2];
  if (!destinationPath) {
    throw new Error("Usage: npm run backup -- <destination-file>");
  }

  const sourcePath = process.env.DATABASE_PATH || path.join(__dirname, "..", ".data", "coffee-house.sqlite");
  backupDatabase(sourcePath, destinationPath)
    .then(() => console.log(`Database backup created: ${path.resolve(destinationPath)}`))
    .catch((error) => {
      console.error("Database backup failed:", error.message);
      process.exitCode = 1;
    });
}

module.exports = { backupDatabase };
