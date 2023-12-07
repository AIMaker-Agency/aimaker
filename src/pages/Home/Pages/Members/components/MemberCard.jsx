import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

function MemberCard({ uid, name, username, photoUrl }) {
  const navigate = useNavigate();
  return (
    <Card
      onClick={(e) => {
        e.preventDefault();
        navigate("/profile/?id=" + uid);
      }}
    >
      <div className="profilePicture">
        <img
          src={
            photoUrl
              ? photoUrl
              : "https://zuhmdhvkxcjlwkzeeqpr.supabase.co/storage/v1/object/sign/assets/user_profile_placeholder.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhc3NldHMvdXNlcl9wcm9maWxlX3BsYWNlaG9sZGVyLmpwZyIsImlhdCI6MTcwMTkxMzQwMiwiZXhwIjo4MDA5MTEzNDAyfQ.DcgHrwgkUqOFmDOfuvP8xtM2Qi_NnK3f2Wu3cty_lx8&t=2023-12-07T01%3A43%3A22.048Z"
          }
        ></img>
      </div>
      <div className="profileName">{name}</div>
      <div className="profileUsername">{username}</div>
    </Card>
  );
}

export default MemberCard;

const Card = styled.div`
  background-color: #eee;
  padding: 1rem;
  margin: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 10px;

  &:hover {
    cursor: pointer;
  }

  .profilePicture {
    width: 8rem;
    height: 8rem;
    border-radius: 10px;

    img {
      width: inherit;
      height: inherit;
      border-radius: inherit;
    }
  }

  .profileName {
    font-weight: bold;
    font-size: 1.1rem;
    text-align: center;
  }

  .profileUsername {
    font-weight: 500;
    font-size: 0.9rem;
  }
`;
