# CityPulse

CityPulse is a civic data dashboard that turns public 311 service request records into area-level accountability metrics. It helps residents, advocates, and officials see where city service requests are resolved quickly, where delays appear, and how response-time goals affect different neighborhoods or boroughs.

The project began as a Java data-analysis application and has been rebuilt as a public-facing static website for GitHub Pages.

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
6. It ranks areas using only places with at least 25 tickets to avoid tiny-sample distortion.

The site runs entirely in the browser. There is no backend server, database, or private data collection.

## Data Source

Boston dataset: Boston 311 Service Requests  
Boston portal: Analyze Boston  
Boston old system API used: https://data.boston.gov/api/3/action/datastore_search?resource_id=1a0b420d-99f1-4887-9851-990b2a5a6e17&limit=25000&sort=closed_dt%20desc  
Boston new system API used: https://data.boston.gov/api/3/action/datastore_search?resource_id=254adca6-64ab-4c5c-9fc0-a6da622be185&limit=25000&sort=close_date%20desc

NYC dataset: 311 Service Requests  
NYC portal: NYC Open Data  
NYC API used: https://data.cityofnewyork.us/resource/erm2-nwe9.json

San Francisco dataset: 311 Cases  
San Francisco portal: DataSF  
San Francisco API used: https://data.sfgov.org/resource/vw6y-z8j6.json

CityPulse currently requests up to 25,000 recently closed public records from each selected city source file.
