// This script generates sample telematics events for connected vehicles from Metro Motors.
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

// Paths to the source vehicle data and the output file
const vehiclesPath = path.resolve(
  __dirname,
  "../../source-data/Metro_Motors_Source_Data/02_Dealer_management_system/vehicles.csv"
);

// Output path for the generated telematics events
const outputPath = path.resolve(
  __dirname,
  "../../generated-data/connected-cars/sample-telematics-events.json"
);

// Read actual vehicle records
const csv = fs.readFileSync(vehiclesPath, "utf8");

const vehicles = parse(csv, {
  columns: true,
  skip_empty_lines: true,
  trim: true
});

// Filter for connected vehicles with specific VINs
    const selectedVins = new Set([
    "VLTK9Y2TLT5516837",
    "KSML4FSGJT3822356",
    "RBK9C4JXTT6555072"
    ]);

    const connectedVehicles = vehicles.filter(
    vehicle =>
        vehicle.connected_car.toUpperCase() === "Y" &&
        selectedVins.has(vehicle.vin)
    );

    if (connectedVehicles.length !== 3) {
    throw new Error(
        `Expected 3 selected vehicles, found ${connectedVehicles.length}`
    );
    }


    // Generate exactly 20 events across 3 vehicles
    const events = [];
    const eventsPerVehicle = [7, 7, 6];
    const startTime = Date.now() - 60 * 60 * 1000;

    connectedVehicles.forEach((vehicle, vehicleIndex) => {
    const baseOdometer = 25000 + vehicleIndex * 12000;
    const eventCount = eventsPerVehicle[vehicleIndex];

    for (let i = 0; i < eventCount; i++) {
        const eventTime = new Date(
        startTime + (vehicleIndex * 7 + i) * 60 * 1000
        );

        // Two repeated high-severity EV warning events
        const warningCode =
        vehicleIndex === 0 && (i === 4 || i === 5)
            ? "HVB-TEMP"
            : null;

        const isWarning = warningCode !== null;

        const fuelOrCharge = vehicle.fuel_type === "Electric"
        ? 70 - (i * 3)
        : 85 - (i * 2);

        events.push({
        event_id: `TM-${vehicle.vin}-${i + 1}`,
        event_timestamp: eventTime.toISOString(),
        vin: vehicle.vin,
        odometer_km: baseOdometer + (i * 25),
        fuel_or_charge_percent: fuelOrCharge,
        warning_code: warningCode,
        latitude: isWarning ? -25.7479 : null,
        longitude: isWarning ? 28.2293 : null
        });
    }
    });


// Shuffle arrival order to test out-of-order event handling
for (let i = events.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [events[i], events[j]] = [events[j], events[i]];
}

// Save the required Data 360 feed envelope
const output = { data: events };

fs.writeFileSync(
  outputPath,
  JSON.stringify(output, null, 2)
);

// Log summary of the generation process
console.log("METRO MOTORS TELEMATICS GENERATOR");
console.log("--------------------------------");
console.log(`Connected vehicles: ${connectedVehicles.length}`);
console.log(`Events generated: ${events.length}`);
console.log(`Warning events: ${events.filter(e => e.warning_code).length}`);
console.log(`Output: ${outputPath}`);
console.log("Generation completed successfully.");
