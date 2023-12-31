import React from "react";
import styles from "../styles/InputBox.module.css";
import ValidateMessage from "./ValidateMessage";

const InputBox = ({
    label,
    name,
    value,
    onChange,
    type,
    errorMessage,
    disabled,
    minValue,
    orientation_vertical = false,
    className,
}) => {
    return (
        <div
            className={`${styles.input_container} ${
                orientation_vertical && styles.vertical
            }  ${errorMessage && "align-items-md-start"} ${className}`}
        >
            <label className="text-capitalize" htmlFor={name}>
                <b>{label}</b>
            </label>

            <div>
                <input
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    type={type}
                    disabled={disabled}
                    {...(minValue && { min: minValue })}
                ></input>
                {errorMessage && <ValidateMessage message={errorMessage} />}
            </div>
        </div>
    );
};

export default InputBox;
