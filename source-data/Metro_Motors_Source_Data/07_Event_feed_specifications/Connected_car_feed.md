# Connected car feed – specification

Connected Metro Motors vehicles (connected_car = Y in vehicles.csv) send readings to the telematics platform. You will build a script that simulates this feed and sends events to your Data 360 streaming Ingestion API connector.

## Fields in every event

| Field | Type | Example | Notes |
| --- | --- | --- | --- |
| event_id | Text | 9b1f… | Unique per event. The same event may be delivered twice. |
| event_timestamp | DateTime (UTC, ISO 8601) | 2026-11-26T06:14:03Z | When the vehicle recorded the reading. |
| vin | Text | KSMTYYYYJT8628105 | Always upper case, no spaces. |
| odometer_km | Number | 48210 | |
| fuel_or_charge_percent | Number | 62 | Fuel level, or battery charge for Voltra. |
| warning_code | Text | P0300 | Empty when there is no warning. Codes are in warning_codes.csv. |
| latitude | Number | -26.1076 | Sent only with warnings. |
| longitude | Number | 28.0567 | Sent only with warnings. |

## Behaviour to expect

- A vehicle keeps sending the same warning every few minutes until it is fixed.
- Events can arrive late and out of order. Use event_timestamp, not arrival time.
- Odometer readings can occasionally be wrong. The odometer never really goes backwards.

## Example payload

```json
{
  "data": [
    {
      "event_id": "9b1f6c2e-1d0a-4e8b-a0a3-3c5d7e9f1a22",
      "event_timestamp": "2026-11-26T06:14:03Z",
      "vin": "KSMTYYYYJT8628105",
      "odometer_km": 48210,
      "fuel_or_charge_percent": 62,
      "warning_code": "P0300",
      "latitude": -26.1076,
      "longitude": 28.0567
    }
  ]
}
```
