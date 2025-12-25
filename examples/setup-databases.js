const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

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

// Define routes for each test case
const testCases = {
    'no-bounty-hunters': [
        { origin: 'Tatooine', destination: 'Dagobah', travelTime: 4 },
        { origin: 'Dagobah', destination: 'Endor', travelTime: 1 }
    ],
    'single-encounter': [
        { origin: 'Tatooine', destination: 'Dagobah', travelTime: 4 },
        { origin: 'Dagobah', destination: 'Endor', travelTime: 1 }
    ],
    'destination-unreachable': [
        { origin: 'Tatooine', destination: 'Dagobah', travelTime: 4 },
        { origin: 'Dagobah', destination: 'Endor', travelTime: 1 }
    ],
    'refuel-required': [
        { origin: 'Tatooine', destination: 'Dagobah', travelTime: 4 },
        { origin: 'Dagobah', destination: 'Hoth', travelTime: 3 },
        { origin: 'Hoth', destination: 'Endor', travelTime: 2 }
    ],
    'wait-strategy': [
        { origin: 'Tatooine', destination: 'Dagobah', travelTime: 4 },
        { origin: 'Dagobah', destination: 'Endor', travelTime: 1 }
    ],
    'multiple-encounters': [
        { origin: 'Tatooine', destination: 'Dagobah', travelTime: 4 },
        { origin: 'Dagobah', destination: 'Hoth', travelTime: 2 },
        { origin: 'Hoth', destination: 'Endor', travelTime: 1 }
    ]
};

// Create databases for each test case
const examplesDir = __dirname;
for (const [testCase, routes] of Object.entries(testCases)) {
    const testCaseDir = path.join(examplesDir, testCase);
    if (fs.existsSync(testCaseDir)) {
        const dbPath = path.join(testCaseDir, 'universe.db');
        createDatabase(dbPath, routes);
    }
}

console.log('All databases created successfully!');
