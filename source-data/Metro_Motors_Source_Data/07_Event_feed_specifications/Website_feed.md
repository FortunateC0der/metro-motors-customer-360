# Website feed – specification

The Metro Motors website sends an event for important visitor actions. You will build a script or small web page that simulates this feed and sends events to your Data 360 streaming Ingestion API connector.

| Field | Type | Example | Notes |
| --- | --- | --- | --- |
| event_id | Text | e71c… | Unique per event. |
| event_timestamp | DateTime (UTC) | 2026-11-24T19:22:41Z | |
| device_id | Text | d-1a77c2 | Anonymous browser ID. Always present. |
| session_id | Text | s-90812 | |
| email | Text | | Present only when the visitor enters it (test drive or service booking forms). |
| event_type | Text | model_viewed | One of model_viewed, test_drive_booked, service_booked, finance_calculator_used. |
| model | Text | Voltra E5 | For model_viewed, test_drive_booked and finance_calculator_used. |
| vin | Text | | For service_booked. |
| dealership_code | Text | D01 | For bookings. |

Visitors browse anonymously and identify themselves when they book. Link earlier anonymous events to the person once you know who they are. Use real customers from the source data as your identified visitors.
