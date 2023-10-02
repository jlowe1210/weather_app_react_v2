import mapboxgl from "mapbox-gl/dist/mapbox-gl-csp";
import MapboxWorker from "worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker"; /* eslint import/no-webpack-loader-syntax: off */

mapboxgl.workerClass = MapboxWorker; // Wire up loaded worker to be used instead of the default /* eslint import/no-webpack-loader-syntax: off */
//import MapboxWorker from "worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker";
//mapboxgl.workerClass = MapboxWorker;
import { useEffect, useRef, useState } from "react";
import SearchComponent from "./SearchComponent/SearchComponent";
import axios, { CanceledError } from "axios";
import Weather from "./Weather/Weather";
// eslint-disable-next-line import/no-webpack-loader-syntax

function App() {
  const mapRef = useRef();
  const [map, setMap] = useState(null);
  const [latitudeAndLongitude, setLatitudeAndLongitude] = useState(null);
  const [searchLocation, SetSearchLocation] = useState("");
  const [locationCoords, setLocationCoords] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  let prelatitudeAndLongitudeRef = useRef(latitudeAndLongitude);
  let preSearchLocationRef = useRef(searchLocation);

  useEffect(() => {
    const controller = new AbortController();

    if (
      prelatitudeAndLongitudeRef.current?.lng !== latitudeAndLongitude?.lng &&
      prelatitudeAndLongitudeRef.current?.lat !== latitudeAndLongitude?.lat
    ) {
      prelatitudeAndLongitudeRef.current = latitudeAndLongitude;

      axios
        .get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${prelatitudeAndLongitudeRef.current.lat}&lon=${prelatitudeAndLongitudeRef.current.lng}&appid=8c4711fa26eb45ad7a7d5cee8b1ca1d2`,
          { signal: controller.signal }
        )
        .then((response) => {
          setLocationCoords(response.data.coord);
        })
        .catch((err) => {
          console.log(err);
          if (err instanceof CanceledError) {
            console.log("request cancelled");
          }
        });
    }

    if (preSearchLocationRef.current !== searchLocation) {
      preSearchLocationRef.current = searchLocation;

      axios
        .get(
          `https://api.openweathermap.org/data/2.5/weather?q=${preSearchLocationRef.current}&appid=8c4711fa26eb45ad7a7d5cee8b1ca1d2`,
          { signal: controller.signal }
        )
        .then((response) => {
          setLocationCoords(response.data.coord);
        })
        .catch((err) => {
          if (err.code === "ERR_BAD_REQUEST") {
            setError("Location not Found");
            console.clear();
            setWeatherData(null);
          }
          if (err instanceof CanceledError) {
            console.clear();
            console.log("request cancelled");
          }
        });
    }

    return () => {
      controller.abort();
    };
  }, [latitudeAndLongitude, searchLocation]);

  useEffect(() => {
    if (locationCoords) {
      setLoading(true);
      setError("");
      axios
        .get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${
            locationCoords.lat
          }&lon=${
            locationCoords.lon
          }&appid=${"8c4711fa26eb45ad7a7d5cee8b1ca1d2"}`
        )

        .then(({ data }) => {
          const weatherResponseData = {
            name: data.name,
            weather_description: data.weather[0].description,
            weather_icon: data.weather[0].icon,
            temp: data.main.temp,
            locationTime: new Date((data.sys.sunrise + data.timezone) * 1000),
          };

          map.setCenter({ lng: locationCoords.lon, lat: locationCoords.lat });
          map.setZoom(10);
          setLoading(false);
          setWeatherData(weatherResponseData);
        })
        .catch((err) => {
          setLoading(false);
        });
    }
  }, [locationCoords]);

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1Ijoiamxvd2UxMjEwIiwiYSI6ImNsZGJheG14dTByNnMzdm5uNmY2dWVjdWYifQ.fTdpaOtdQ4noHCHnEQ7Cmg";
    setMap(
      new mapboxgl.Map({
        container: mapRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-96, 40],
        zoom: 4,
      })
    );
  }, []);

  function getLongAndLatFromMapClick(e) {
    const { lng, lat } = e.lngLat;
    setLatitudeAndLongitude({ lng, lat });
  }

  function handleSearchLocation(location) {
    if (location.trim()) {
      SetSearchLocation(location);
    }
    return;
  }

  useEffect(() => {
    if (map) {
      map.addControl(new mapboxgl.NavigationControl());
      map.on("click", getLongAndLatFromMapClick);

      return () => {
        map.off("click", getLongAndLatFromMapClick);
      };
    }
  }, [map]);

  return (
    <>
      <div style={{ height: "500px" }} id="map" ref={mapRef}></div>
      <SearchComponent clickHandler={handleSearchLocation} />
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && weatherData && <Weather weatherData={weatherData} />}
    </>
  );
}

export default App;
