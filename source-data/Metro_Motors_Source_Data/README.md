# Metro Motors – Source data for project D360-P06-METRO

All data in this package is fictional and was generated for training. Treat it as if it were real customer data: do not copy it outside your assigned org and project folder.

**Reference date.** The data represents Metro Motors as of **23 November 2026**. Use 23 November 2026 as "today" in every calculation, and record that assumption in your decision log.

## What is in this package

| Folder | Source system | How it reaches Data 360 | Files |
| --- | --- | --- | --- |
| 01_CRM_for_Salesforce_import | Salesforce Sales and Service Cloud | Load into your Salesforce org first, then ingest with the Salesforce CRM connector | accounts.csv, contacts.csv, leads.csv, opportunities.csv, cases.csv |
| 02_Dealer_management_system | Dealer system | Ingestion API, bulk pattern | dms_customers.csv, vehicles.csv, vehicle_sales.csv |
| 03_Service_workshop | Workshop system | Ingestion API, bulk pattern | service_visits.csv |
| 04_Email_platform | Marketing email system | Ingestion API, bulk pattern | email_events.csv |
| 05_Reference_data | After-sales and network teams | Ingestion API, bulk pattern | dealerships.csv, models.csv, warning_codes.csv |
| 06_Warranty_and_service_documents_PDF | After-sales team | Unstructured data | 40 documents |
| 07_Event_feed_specifications | Telematics and digital teams | Ingestion API, streaming (you build the senders) | Two specifications |

## Step 1: load the CRM files into Salesforce

The CRM connector reads data that is already in Salesforce, so load these files into your org before you set up the connector.

1. Create these custom fields (all Text unless stated):
   - **Account:** External_Id__c (External ID, unique).
   - **Contact:** External_Id__c (External ID, unique), Contact_Type__c (picklist: Customer, Fleet Manager, Fleet Driver), National_ID__c, Preferred_Dealership__c, Original_Created_Date__c (Date).
   - **Lead:** External_Id__c (External ID, unique), Model_Of_Interest__c, Preferred_Dealership__c, Original_Created_Date__c (Date).
   - **Opportunity:** External_Id__c (External ID, unique), Contact__c (Lookup to Contact), Dealership__c, Sale_Id__c.
   - **Case:** External_Id__c (External ID, unique), VIN__c, Dealership__c, Original_Created_Date__c (Date).
2. Add any picklist values used in the files (Lead Source, Lead Status, Opportunity Stage, Case Type) that your org does not have.
3. Load with Data Loader (upsert on External_Id__c) in this order: accounts, contacts, leads, opportunities, cases. Use the External ID columns (Account_External_Id__c, Contact_External_Id__c) to set the lookups.

## Step 2: load the other CSV files with the Ingestion API

Folders 02 to 05 are loaded with the Ingestion API bulk pattern. Write a schema file for the objects, create a data stream per object, and choose the right category (Profile, Engagement or Other) for each. Record in your decision log whether you used one connector or several, and why.

## How the dealer and workshop data fit together

- **dms_customers.csv**: each dealership keeps its own customer list. The customer number starts with the dealership code (for example D06-000231). The same person usually has a different number at every dealership they have used. customer_type is INDIVIDUAL or COMPANY (fleet customers).
- **vehicles.csv**: one row per vehicle, keyed by VIN. connected_car = Y means the vehicle sends telematics data.
- **vehicle_sales.csv**: every sale made by Metro Motors, new and used. A VIN appears more than once when a used vehicle was traded in and sold again. trade_in_vin is the vehicle the buyer handed in on that deal.
- **service_visits.csv**: one row per workshop visit. dms_customer_no and the contact fields describe the person who brought the vehicle in, who is not always the owner. pay_type is PAID (customer paid), WARRANTY (manufacturer paid) or SERVICE_PLAN (covered by the service plan).
- **models.csv**: service intervals per model, which you need for the service due calculation.
- **warning_codes.csv**: telematics warning codes and their severity.

## Documents

The 40 PDFs in folder 06 are the documents your AI assistant must use. Each has an ID (MM-DOC-001 to MM-DOC-040), a version and an effective date. Check which documents apply to which vehicles.

## Things you will need to work out yourself

The data is realistic, so it is not clean. Profile every file before you ingest it, and record every issue you find in your data-quality log. Your mentor will not tell you what the issues are.
