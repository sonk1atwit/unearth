<div align="center">

# Unearth

<img src="public/favicon.svg" alt="App Diagram" width="300">

## Excavate your digital footprint.

### Unearth is an open-source OSINT visualization tool designed for everyone.

---

### Features

- Searches over 100 sites/services for registered email via user-scanner.
- Searches over 150 sites/services for registered usernames via user-scanner.
- Site category filtering before and after searching.
- Visual graphs and bars to indicate results.
- CSV export for query results.

---

### Hosting Architecture

Unearth, at its live link, is entirely stateless - your query results are never stored and only exist for as long as the web page is open. The site is hosted on our own remote hardware.

---

### How To Use

1. Visit the live link here: https://unearth-pied.vercel.app/
2. Read the disclaimer on the landing page to ensure your own comfortability with using the application.
3. Enter your username and/or email you would like to use in searching.
4. Select any specific categories you would like to search for; otherwise, select "All" to search everything.
5. Once entered, select "Scan", and wait for results.
6. Take a look at your results, and export to CSV by selecting "Export CSV" if desired.

Once the page is refreshed or closed, the results will disappear.

---

### Repo Hierarchy

| **backend/**                                                                   | **backend/app**                                                                                           | **public/**                   | **src/**                                           | **src/components**                                                    |
|--------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------|-------------------------------|----------------------------------------------------|-----------------------------------------------------------------------|
| All backend infrastructure files (Docker, requirements.txt) are included here. | All backend code is included here, including the client itself, search functions, secret management, etc. | Images used for the frontend. | Baseline css and component files for the frontend. | Frontend functionality files for scanning, result visualization, etc. |

---

### Self Hosting

The frontend is not available to self-host immediately, but can be made to with modification. The backend can be built with the Dockerfile included in the backend folder.

#### Build Command (Windows)

```powershell
docker build -t unearth-backend:latest -f backend/Dockerfile backend
```

#### General Run Command at Port 8000 (Windows)
```powershell
docker run --env-file backend/.env -p 8000:8000 unearth-backend:latest
```

Once running, all exposed endpoints from the FastAPI client will be available at the specified port.

---

### Special Thanks

Unearth was developed as part of the COMP 5500 Senior Project course at the Wentworth Institute of Technology from May 2026-August 2026.

### Colin Mastrocola - Server architecture, hosting, and network setup.
### Kevin Son @sonk1atwit - Frontend design and code.
### Kyle Shott @kyshott - Backend design and code.

</div>
