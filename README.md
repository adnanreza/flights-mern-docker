# flights-mern-docker

A small MERN application that searches domestic flights across Canada: an
Express and Mongoose API over a seeded MongoDB collection, and a React
front end that queries it.

Companion code for a two-part Docker lab. The application is deliberately
finished and deliberately boring, because it is not the thing being taught.
You clone it working, and everything the labs ask you to write is Docker.

## The data is invented

Every flight, price, schedule and seat in `api/data/flights.json` is
fabricated for teaching. The airport codes are real, the airline names are
real, and nothing else on this page describes a service that exists. Times
are local-clock arithmetic with no time zones applied, so a westbound
arrival will look wrong to anyone who knows the route. Do not use this data
for anything except learning Docker.

## Branches

Each branch is the finished state of one lab. None of them will be merged,
because the difference between them is the teaching material.

| Branch | What it is |
| --- | --- |
| `main` | The application, with no Docker in it at all. Clone this to start either lab. |
| `docker` | The finished state of lab one: the API in a container. |
| `compose` | The finished state of lab two: the API and MongoDB brought up together. |

`main` staying Docker-free is the point. It is what "works on my machine"
looks like before anyone has done anything about it.

## Run it

You need Node 22 or newer and a MongoDB you can reach. Getting that MongoDB
without installing MongoDB is what lab two is about.

```bash
cd api
npm install
npm run seed      # loads 188 flights; destructive and safe to repeat
npm start         # http://localhost:4000
```

```bash
cd web
npm install
npm run dev       # http://localhost:5173
```

The API reads `MONGODB_URI` and falls back to
`mongodb://127.0.0.1:27017/flights`. The front end reads `VITE_API_URL` and
falls back to `http://localhost:4000`.

## The API

| Route | What it does |
| --- | --- |
| `GET /api/health` | Liveness, plus whether the database is actually connected. |
| `GET /api/airports` | The eight airports. Static reference data, so it answers even with the database down. |
| `GET /api/airlines` | The four airlines, derived from the flights currently stored. |
| `GET /api/flights` | Search. Optional `from`, `to` and `airline` query parameters, case-insensitive. |
| `GET /api/flights/:flightNumber` | One flight. Dashes stand in for the space, so `AC-101`. |

Two response codes are worth knowing before you start, because the labs turn
on the difference between them.

**A search that matches nothing returns `200` and an empty array.** The
front end says "No flights match your search," which is the honest answer to
the question that was asked. An empty database produces exactly this, and it
looks nothing like a failure.

**A search made while MongoDB is unreachable returns `503`** and says so in
words. That is a different problem and deserves different wording, so the
API never lets the two blur together.

## Layout

| Path | Why |
| --- | --- |
| `api/src/db.js` | The connection, and the decision to keep serving when it fails. |
| `api/src/models/Flight.js` | One schema, ten fields. |
| `api/src/routes/flights.js` | Every route, plus the database guard. |
| `api/src/seed.js` | Resets the collection and loads the JSON. |
| `api/data/flights.json` | 188 flights across 24 routes. |
| `web/src/App.jsx` | The whole front end: a form, a table, and three pieces of state. |
