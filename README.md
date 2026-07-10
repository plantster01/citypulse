# CityPulse

CityPulse is a civic data dashboard that turns public 311 service request records into area-level accountability metrics. It helps residents, advocates, and officials see where city service requests are resolved quickly, where delays appear, and how response-time goals affect different neighborhoods or boroughs.

## Live Site

https://plantster01.github.io/citypulse/

## What CityPulse Shows

- City selector for supported 311 datasets
- Area rankings by average 311 request resolution time
- Citywide response-time snapshot in hours and days
- Request-type breakdown showing what residents report most often
- Target simulator for testing which areas meet a chosen response-time standard
- Public-facing explanations of the data source, methodology, roadmap, and founder

## How It Works

CityPulse currently supports public 311 datasets from Boston, New York City, and San Francisco.

1. The website requests recently closed public 311 records from the selected city’s open data API.
2. It keeps closed requests with valid area names and open/closed timestamps.
3. It uses a 30-day outlier guard so rare old closures do not distort the averages.
4. It calculates how many hours each request took to resolve.
5. It groups requests by area.
6. It ranks areas using only places with enough tickets to avoid tiny-sample distortion.

## Data Source

Boston dataset: Boston 311 Service Requests
Boston portal: Analyze Boston
Boston old system source: https://data.boston.gov/dataset/311-service-requests/resource/1a0b420d-99f1-4887-9851-990b2a5a6e17
Boston new system source: https://data.boston.gov/dataset/311-service-requests/resource/254adca6-64ab-4c5c-9fc0-a6da622be185

NYC dataset: 311 Service Requests
NYC portal: NYC Open Data
NYC source: https://data.cityofnewyork.us/Social-Services/311-Service-Requests/erm2-nwe9

San Francisco dataset: 311 Cases
San Francisco portal: DataSF
San Francisco source: https://data.sfgov.org/City-Infrastructure/311-Cases/vw6y-z8j6

CityPulse currently requests up to 25,000 recently closed public records from each selected city source file.
