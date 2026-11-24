const fs = require("fs");
const path = require("path");

// Sample data for connected cars
const vehicles = [
    {
        vin: "MMTEST00000000001",
        mileage: 45250,
        energyType: "battery",
        energyLevel: 78
    },
    {
        vin: "MMTEST00000000002",
        mileage: 68500,
        energyType: "fuel",
        energyLevel: 65
    },
    {
        vin: "MMTEST00000000003",
        mileage: 32100,
        energyType: "battery",
        energyLevel: 92
    }
];

// Generate sample telematics events for connected cars
const events = [];
const eventCount = 20;
const generationTime = Date.now();

for (let i = 0; i < eventCount; i++) {
    const vehicle = vehicles[i % vehicles.length];

    const vehicleIndex = i % vehicles.length;
    const readingNumber = Math.floor(i / vehicles.length);

    // Create a telematics event for the vehicle
    const event = {
        event_id: `MM-TLM-${generationTime}-${String(i + 1).padStart(3, "0")}`,
        vin: vehicle.vin,
        timestamp: new Date(
            generationTime - (eventCount - 1 - i) * 1000
        ).toISOString(),
        mileage_km: vehicle.mileage + readingNumber * 5,
        energy_type: vehicle.energyType,
        energy_level_pct: Math.max(
            10,
            vehicle.energyLevel - readingNumber
        ),
        warning_code: null,
        severity: "none"
    };

    events.push(event);
}

// Write the generated events to a JSON file
const outputPath = path.resolve(
    __dirname,
    "../../generated-data/connected-cars/sample-telematics-events.json"
);

// Ensure the output directory exists
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

// Write the events to the output file
fs.writeFileSync(
    outputPath,
    JSON.stringify(events, null, 2),
    "utf8"
);

// Log the generation summary
console.log("================================");
console.log("METRO MOTORS TELEMATICS GENERATOR");
console.log("================================");
console.log(`Events generated: ${events.length}`);
console.log(`Vehicles simulated: ${vehicles.length}`);
console.log(`Output: ${outputPath}`);
console.log("Generation completed successfully!");
