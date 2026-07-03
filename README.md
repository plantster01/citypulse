# CityPulse

CityPulse is a civic data dashboard that turns public Boston 311 service request records into neighborhood-level accountability metrics. It helps residents, advocates, and officials see where city service requests are resolved quickly, where delays appear, and how response-time goals affect different neighborhoods.   

The project began as a Java data-analysis application and has been rebuilt as a public-facing static website for GitHub Pages.

## Live Site

https://plantster01.github.io/citypulse/

## What CityPulse Shows

- Neighborhood rankings by average 311 request resolution time
- Citywide response-time snapshot in hours and days
- Request-type breakdown showing what residents report most often
- Target simulator for testing which neighborhoods meet a chosen response-time standard
- Public-facing explanations of the data source, methodology, roadmap, and founder

## How It Works

CityPulse uses the public Boston 311 Service Requests dataset from Analyze Boston.

1. The website requests recent public 311 records from the Boston open data API.
2. It keeps closed requests with valid neighborhood names and open/closed timestamps.
3. It calculates how many hours each request took to resolve.
4. It groups requests by neighborhood.
5. It ranks neighborhoods using only areas with enough tickets to avoid tiny-sample distortion.

The site runs entirely in the browser. There is no backend server, database, or private data collection.

## Data Source

Dataset: Boston 311 Service Requests  
Portal: Analyze Boston  
Link: https://data.boston.gov/dataset/311-service-requests

CityPulse currently requests up to 10,000 public records from the Boston 311 API.

## Roadmap

CityPulse is starting with Boston 311, but the broader goal is to become a lightweight civic accountability layer for public service data.

Planned directions include:

- Shareable neighborhood reports
- Trend detection over time
- More transparent reliability notes for sample sizes
- Expansion to other cities with open 311-style datasets
