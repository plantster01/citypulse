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

1. The website requests recent public 311 records from the selected city’s open data API.
2. It keeps closed requests with valid area names and open/closed timestamps.
3. It uses a 30-day outlier guard so rare old closures do not distort the averages.
4. It calculates how many hours each request took to resolve.
5. It groups requests by area.
6. It ranks areas using only places with enough tickets to avoid tiny-sample distortion.

The site runs entirely in the browser. There is no backend server, database, or private data collection.

## Data Source

Boston dataset: Boston 311 Service Requests  
Boston portal: Analyze Boston  
Boston link: https://data.boston.gov/dataset/311-service-requests

NYC dataset: 311 Service Requests  
NYC portal: NYC Open Data  
NYC link: https://data.cityofnewyork.us/Social-Services/311-Service-Requests/erm2-nwe9

San Francisco dataset: 311 Cases  
San Francisco portal: DataSF  
San Francisco link: https://data.sfgov.org/City-Infrastructure/311-Cases/vw6y-z8j6

CityPulse currently requests up to 25,000 public records from the selected city API.

## Roadmap

CityPulse started with Boston 311 and now includes an early multi-city version with New York City and San Francisco. The broader goal is to become a lightweight civic accountability layer for public service data.

Planned directions include:

- Shareable area reports
- Trend detection over time
- More transparent reliability notes for sample sizes
- Expansion to more cities with open 311-style datasets
