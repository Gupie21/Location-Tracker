import React, { useState, useEffect } from "react";

function LocationTracker() {
  const [locations, setLocations] = useState([]);

  // Función para guardar la ubicación en IndexedDB
  const saveLocation = (position) => {
    const location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };

    const dbName = "LocationDB";
    const storeName = "locations";

    const request = indexedDB.open(dbName, 1);

    request.onerror = function (event) {
      console.error("Error al abrir la base de datos:", event.target.errorCode);
    };

    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      const objectStore = db.createObjectStore(storeName, {
        keyPath: "id",
        autoIncrement: true,
      });
    };

    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction([storeName], "readwrite");
      const objectStore = transaction.objectStore(storeName);
      objectStore.add(location);
      fetchLocations(); // Actualizar la lista de ubicaciones después de agregar una nueva
    };
  };

  // Función para obtener y mostrar todas las ubicaciones guardadas
  const fetchLocations = () => {
    const dbName = "LocationDB";
    const storeName = "locations";

    const request = indexedDB.open(dbName, 1);

    request.onerror = function (event) {
      console.error("Error al abrir la base de datos:", event.target.errorCode);
    };

    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction([storeName], "readonly");
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.getAll();

      request.onsuccess = function (event) {
        setLocations(event.target.result);
      };
    };
  };

  useEffect(() => {
    // Obtener la ubicación actual y guardarla en IndexedDB cuando se monta el componente
    navigator.geolocation.getCurrentPosition(saveLocation);
  }, []);

  // Función para obtener la dirección a partir de las coordenadas geográficas usando Nominatim
  const getAddress = (latitude, longitude) => {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const address = `${data.display_name}`;
        console.log("Dirección:", address);
        return address;
      })
      .catch((error) => {
        console.error("Error al obtener la dirección:", error);
        return null;
      });
  };

  return (
    <div>
      <h1>Location Tracker</h1>
      <h2>Locations:</h2>
      <ul>
        {locations.map((location, index) => (
          <li key={index}>
            Latitude: {location.latitude}, Longitude: {location.longitude}
            <br />
            Dirección: {getAddress(location.latitude, location.longitude)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LocationTracker;
