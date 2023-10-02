import React, { useMemo } from "react";
import "./Weather.css";

function Weather(props) {
  const fahrenheit = useMemo(
    () => ((props.weatherData.temp - 273.15) * 9) / 5 + 32,
    [props.weatherData]
  );
  const celsius = useMemo(
    () => props.weatherData.temp - 273.15,
    [props.weatherData]
  );

  const dd = String(props.weatherData.locationTime.getDate()).padStart(2, "0");
  const mm = String(props.weatherData.locationTime.getMonth() + 1).padStart(
    2,
    "0"
  ); //January is 0!
  const yyyy = props.weatherData.locationTime.getFullYear();

  let date = mm + "/" + dd + "/" + yyyy;

  return (
    <div className="weather_container">
      <p>{date}</p>
      <h1>{props.weatherData.name}</h1>
      <p style={{ fontWeight: "bold" }}>
        {Math.round(celsius)}&#8451; / {Math.round(fahrenheit)}&#8457;
      </p>
      <p>{props.weatherData.weather_description}</p>

      <p>
        <img
          src={`https://openweathermap.org/img/wn/${props.weatherData.weather_icon}@2x.png`}
          alt="weather icon"
        />
      </p>
    </div>
  );
}

export default Weather;
