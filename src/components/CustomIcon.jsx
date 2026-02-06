import React from "react";
import dd01Icon from "../assets/dd01.png"; // adjust the relative path if needed

export default function CustomIcon() {
  return (
    <img
      src={dd01Icon}
      alt="Invoice Icon"
      style={{ width: 50, height: 50 }}
    />
  );
}
