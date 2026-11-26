# Metro Motors Customer 360 — Prepared Source Data

Prepared from the mentor ZIP. Reference date: 23 November 2026.

## Exact target counts

| Dataset | Prepared rows | Target |
|---|---:|---:|
| CRM Contacts | 6000 | 6,000 |
| CRM Leads | 3000 | 3,000 |
| DMS Customers | 4500 | 4,500 |
| Vehicle Sales | 7000 | 7,000 |
| Service Visits | 22000 | 22,000 |
| Email Events | 60000 | 60,000 |
| Warranty and service PDFs | 40 | 40 |

## Preparation approach

- Original mentor data was used as the source for all retained and generated records.
- DMS customer selection retained all company/fleet customer master rows and prioritized customers with service and sales activity.
- Service visits were selected only where the DMS customer reference remains in the retained 4,500-customer file.
- Vehicle sales were retained where their DMS customer reference remains valid; additional used-sale rows reuse real vehicle VINs and retained dealership customers to preserve resale history.
- Additional CRM contacts were mapped from retained individual DMS customer records. Cross-dealership variations were not normalized away.
- Additional leads and email events were generated from mentor-source patterns with unique synthetic IDs.
- Email event timestamps deliberately include multiple formats for data-normalization practice.
- All 40 original PDF documents and all other reference files were preserved unchanged.
- Original CRM accounts, opportunities and cases were preserved unchanged.

## Synthetic record identifiers

- Contacts: `CON-SYN-`
- Leads: `LEAD-SYN-`
- Vehicle sales: `SALE-SYN-`
- Email events: `EV-SYN-`

Synthetic rows are training-data extensions, not new mentor-provided facts.

## Important modelling reminders

- VIN is not a unique vehicle-sale key. A vehicle can be resold.
- Keep ownership periods and identify the current owner from valid sale history.
- A service visit's contact details may identify the person who brought the vehicle, not its owner.
- Keep fleet companies, fleet managers, drivers and individual customers distinct.
- Do not merge people solely because they share a vehicle, address, phone or company email.
- Do not silently repair mileage decreases or timestamp format differences. Profile, flag, normalize and document them.
- Use 23 November 2026 as the project data-as-of date for calculations.

## Data quality log

See `DATA_QUALITY_LOG.csv` for identified risks and handling decisions. The log includes 240 detected backward mileage comparisons in the retained service visits and repeated VIN resale patterns (1972 VINs appear more than once in the prepared sales file).
