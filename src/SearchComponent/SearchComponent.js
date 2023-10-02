import React, { useState } from "react";
import "./SearchComponent.css";

function SearchComponent(props) {
  const [location, setLocation] = useState("");

  return (
    <div className="container">
      <input
        className="Search_input"
        type="text"
        id="location"
        name="location"
        placeholder="Search Location or Click on map"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <button
        onClick={() => {
          props.clickHandler(location);
          setLocation("");
        }}
        className="Search_button"
      >
        Search
      </button>
    </div>
  );
}

export default SearchComponent;
