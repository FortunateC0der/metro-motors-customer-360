
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

const sourceRoot = path.resolve(
  __dirname,
  "../../source-data/Metro_Motors_Source_Data"
);

function readCsv(relativePath) {
  const filePath = path.join(sourceRoot, relativePath);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Source file not found: ${filePath}`);
  }

  return parse(fs.readFileSync(filePath, "utf8"), {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
}

function normalizeEmail(email) {
  return (email || "").trim().toLowerCase();
}

function normalizeVin(vin) {
  return (vin || "").replace(/\s+/g, "").toUpperCase();
}

// Load actual Metro Motors source data
const contacts = readCsv(
  "01_CRM_for_Salesforce_import/contacts.csv"
);

const customers = readCsv(
  "02_Dealer_management_system/dms_customers.csv"
);

const sales = readCsv(
  "02_Dealer_management_system/vehicle_sales.csv"
);

const vehicles = readCsv(
  "02_Dealer_management_system/vehicles.csv"
);

const models = readCsv(
  "05_Reference_data/models.csv"
);

const dealerships = readCsv(
  "05_Reference_data/dealerships.csv"
);

// Build lookup collections
const crmEmails = new Set(
  contacts
    .map(contact => normalizeEmail(contact.Email))
    .filter(Boolean)
);

const vehicleByVin = new Map(
  vehicles.map(vehicle => [
    normalizeVin(vehicle.vin),
    vehicle
  ])
);

const validModels = new Set(
  models.map(model => model.model)
);

const validDealerships = new Set(
  dealerships.map(dealership => dealership.dealership_code)
);

const salesByCustomer = new Map();

for (const sale of sales) {
  if (!salesByCustomer.has(sale.dms_customer_no)) {
    salesByCustomer.set(sale.dms_customer_no, []);
  }

  salesByCustomer.get(sale.dms_customer_no).push(sale);
}

// Find DMS customers who also exist in CRM and have a valid vehicle sale
const personas = [];
const usedEmails = new Set();

for (const customer of customers) {
  const email = normalizeEmail(customer.email);

  if (!email || !crmEmails.has(email) || usedEmails.has(email)) {
    continue;
  }

  const customerSales = salesByCustomer.get(
    customer.dms_customer_no
  ) || [];

  const validSale = customerSales.find(sale => {
    const vehicle = vehicleByVin.get(normalizeVin(sale.vin));

    return (
      vehicle &&
      validModels.has(vehicle.model) &&
      validDealerships.has(sale.dealership_code)
    );
  });

  if (!validSale) {
    continue;
  }

  const vehicle = vehicleByVin.get(
    normalizeVin(validSale.vin)
  );

  personas.push({
    email,
    device_id: `DEVICE-C360-${String(personas.length + 1).padStart(3, "0")}`,
    session_id: `SESSION-C360-${String(personas.length + 1).padStart(3, "0")}`,
    model: vehicle.model,
    vin: vehicle.vin,
    dealership_code: validSale.dealership_code
  });

  usedEmails.add(email);

  if (personas.length === 5) {
    break;
  }
}

if (personas.length !== 5) {
  throw new Error(
    `Expected 5 linked customers, found ${personas.length}`
  );
}

// Generate four events for each customer.
// Browsing is anonymous; booking events identify the visitor.
const events = [];
const startTime = Date.now() - 20 * 60 * 1000;

personas.forEach((person, index) => {
  const eventDefinitions = [
    {
      event_type: "model_viewed",
      email: null,
      model: person.model,
      vin: null,
      dealership_code: null
    },
    {
      event_type: "finance_calculator_used",
      email: null,
      model: person.model,
      vin: null,
      dealership_code: null
    },
    {
      event_type: "test_drive_booked",
      email: person.email,
      model: person.model,
      vin: null,
      dealership_code: person.dealership_code
    },
    {
      event_type: "service_booked",
      email: person.email,
      model: null,
      vin: person.vin,
      dealership_code: person.dealership_code
    }
  ];

  eventDefinitions.forEach((definition, eventIndex) => {
    events.push({
      event_id: `WEB-C360-${String(index * 4 + eventIndex + 1).padStart(4, "0")}`,
      event_timestamp: new Date(
        startTime + (index * 4 + eventIndex) * 60 * 1000
      ).toISOString(),
      device_id: person.device_id,
      session_id: person.session_id,
      ...definition
    });
  });
});

// Shuffle delivery order to test event ordering
for (let i = events.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [events[i], events[j]] = [events[j], events[i]];
}

// Save the Ingestion API payload
const outputPath = path.resolve(
  __dirname,
  "../../generated-data/website/sample-website-events.json"
);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });

fs.writeFileSync(
  outputPath,
  JSON.stringify({ data: events }, null, 2)
);

// Display generation summary
console.log("METRO MOTORS WEBSITE EVENT GENERATOR");
console.log("------------------------------------");
console.log(`CRM contacts: ${contacts.length}`);
console.log(`DMS customers: ${customers.length}`);
console.log(`Linked customer personas: ${personas.length}`);
console.log(`Events generated: ${events.length}`);

for (const type of [
  "model_viewed",
  "test_drive_booked",
  "service_booked",
  "finance_calculator_used"
]) {
  console.log(
    `${type}: ${events.filter(e => e.event_type === type).length}`
  );
}

console.log(
  `Identified events: ${events.filter(e => e.email).length}`
);

console.log(
  `Anonymous events: ${events.filter(e => !e.email).length}`
);

console.log(`Output: ${outputPath}`);
console.log("Generation completed successfully.");
