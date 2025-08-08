import React from "react";
import { Input as MTInput } from "@material-tailwind/react";
import { FaEye } from "react-icons/fa";

const Input = ({
  type,
  placeholder,
  name,
  value,
  onChange,
  htmlFor,
  handleToggle,
  showPassword,
}) => {
  return (
    <div>
      <label htmlFor={htmlFor} className="capitalize">
        {htmlFor}
      </label>
      <div className="flex">
        <MTInput
          type={type}
          color="red"
          label={placeholder}
          icon={name === "password" && <FaEye onClick={handleToggle} className="fas fa-heart" />}
          value={value}
          name={name}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default Input;