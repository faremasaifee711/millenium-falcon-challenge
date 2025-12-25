const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

/**
 * Helper script to create SQLite database files for examples
 * Usage: node create-db.js <db-path> <routes-json>
 */

function createDatabase(dbPath, routes) {
    // Remove existing database if it exists
    if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
    }

    const db = new Database(dbPath);
    
    // Create routes table
    db.exec(`
        CREATE TABLE routes (
            origin TEXT NOT NULL,
            destination TEXT NOT NULL,
            travel_time INTEGER NOT NULL
        )
    `);

    // Insert routes
    const insert = db.prepare('INSERT INTO routes (origin, destination, travel_time) VALUES (?, ?, ?)');
    const insertMany = db.transaction((routes) => {
        for (const route of routes) {
            insert.run(route.origin, route.destination, route.travelTime);
        }
    });

    insertMany(routes);
    db.close();
    console.log(`Created database: ${dbPath}`);
}

// Export for use in other scripts
if (require.main === module) {
    const dbPath = process.argv[2];
    const routesJson = process.argv[3];
    
    if (!dbPath || !routesJson) {
        console.error('Usage: node create-db.js <db-path> <routes-json>');
        process.exit(1);
    }
    
    const routes = JSON.parse(fs.readFileSync(routesJson, 'utf-8'));
    createDatabase(dbPath, routes);
}

module.exports = { createDatabase };
