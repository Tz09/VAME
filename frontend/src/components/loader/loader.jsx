import React from "react";
import './loader.css';
import { MoonLoader } from "react-spinners";

function Loader(props) {
  return (
    <>
      {props.processing && (
        <div className="overlay">
          <MoonLoader size={50} color="#fff" />
        </div>
      )}
    </>
  );
}

export default Loader;