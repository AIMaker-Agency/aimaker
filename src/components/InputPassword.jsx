import React, { useState } from "react";
import styled from "styled-components";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

function InputPassword({ placeholder, className, onFocus, onChange }) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <InputPasswordDiv>
        <input
          type={visible ? "text" : "password"}
          placeholder="Password"
          className={className}
          onFocus={onFocus}
          onChange={onChange}
        ></input>
        <button
          className="input-password-visibility"
          onClick={(e) => setVisible(!visible)}
        >
          {!visible ? <FaRegEye /> : <FaRegEyeSlash />}
        </button>
      </InputPasswordDiv>
    </>
  );
}

export default InputPassword;

const InputPasswordDiv = styled.div`
  display: flex;
  width: 100%;

  .input-password-visibility {
    background-color: #c9c9c9;
    border: none;
    border-radius: 0px 5px 5px 0px;
    padding: 0.4rem;
    margin-bottom: -2px;
    box-shadow: rgba(0, 0, 0, 0.2) 0px -2px 0px inset,
      rgba(0, 0, 0, 0.16) 2px 3px 6px, rgba(0, 0, 0, 0.23) 3px 3px 6px;

    &:hover {
      cursor: pointer;
    }
  }

  .text-input {
    border-radius: 5px 0px 0px 5px;
  }
`;
