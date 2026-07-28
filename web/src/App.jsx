import { useEffect, useState } from "react";
import "./App.css";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

function duration(minutes) {
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export default function App() {
  const [airports, setAirports] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [from, setFrom] = useState("YVR");
  const [to, setTo] = useState("YYZ");
  const [airline, setAirline] = useState("");
  const [flights, setFlights] = useState(null);
  const [error, setError] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetch(`${apiUrl}/api/airports`)
      .then((response) => response.json())
      .then(setAirports)
      .catch(() => setAirports([]));

    fetch(`${apiUrl}/api/airlines`)
      .then((response) => (response.ok ? response.json() : []))
      .then(setAirlines)
      .catch(() => setAirlines([]));
  }, []);

  async function search(event) {
    event.preventDefault();
    setSearching(true);
    setError(null);

    const params = new URLSearchParams({ from, to });
    if (airline) params.set("airline", airline);

    try {
      const response = await fetch(`${apiUrl}/api/flights?${params}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setFlights(body);
    } catch (problem) {
      setFlights(null);
      setError(
        problem instanceof TypeError
          ? `Could not reach the API at ${apiUrl}. Is it running?`
          : problem.message,
      );
    } finally {
      setSearching(false);
    }
  }

  return (
    <main>
      <h1>Flights</h1>
      <p className="lede">
        Search domestic flights across Canada. Every price and schedule here is
        invented for teaching purposes.
      </p>

      <form onSubmit={search}>
        <label>
          From
          <select value={from} onChange={(event) => setFrom(event.target.value)}>
            {airports.map((airport) => (
              <option key={airport.code} value={airport.code}>
                {airport.city} ({airport.code})
              </option>
            ))}
          </select>
        </label>

        <label>
          To
          <select value={to} onChange={(event) => setTo(event.target.value)}>
            {airports.map((airport) => (
              <option key={airport.code} value={airport.code}>
                {airport.city} ({airport.code})
              </option>
            ))}
          </select>
        </label>

        <label>
          Airline
          <select
            value={airline}
            onChange={(event) => setAirline(event.target.value)}
          >
            <option value="">Any airline</option>
            {airlines.map((carrier) => (
              <option key={carrier.code} value={carrier.code}>
                {carrier.name}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" disabled={searching}>
          {searching ? "Searching…" : "Search"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {flights && flights.length === 0 && (
        <p className="empty">No flights match your search.</p>
      )}

      {flights && flights.length > 0 && (
        <table>
          <caption>
            {flights.length} {flights.length === 1 ? "flight" : "flights"}
          </caption>
          <thead>
            <tr>
              <th scope="col">Flight</th>
              <th scope="col">Airline</th>
              <th scope="col">Departs</th>
              <th scope="col">Arrives</th>
              <th scope="col">Duration</th>
              <th scope="col">Price</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((flight) => (
              <tr key={flight.flightNumber}>
                <td>{flight.flightNumber}</td>
                <td>{flight.airline}</td>
                <td>{flight.departs}</td>
                <td>{flight.arrives}</td>
                <td>{duration(flight.durationMinutes)}</td>
                <td>${flight.priceCad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
