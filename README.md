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

1. The website requests the most recently closed public 311 records from the selected city’s open data API.
2. It keeps closed requests with valid area names and open/closed timestamps.
3. It uses a 30-day outlier guard so rare old closures do not distort the averages.
4. It calculates how many hours each request took to resolve.
5. It groups requests by area.
6. It ranks areas using only places with at least 25 tickets to avoid tiny-sample distortion.

## Data Source

Boston dataset: Boston 311 Service Requests  
Link: Analyze Boston (https://data.boston.gov/dataset/311-service-requests)  

NYC dataset: 311 Service Requests  
Link: NYC Open Data (https://data.cityofnewyork.us/Social-Services/311-Service-Requests-from-2020-to-Present/erm2-nwe9/about_data)

San Francisco dataset: 311 Cases  
Link: DataSF (https://data.sfgov.org/City-Infrastructure/311-Cases/vw6y-z8j6/about_data)

CityPulse currently requests the 25,000 most recently closed public records from each selected city source file.
