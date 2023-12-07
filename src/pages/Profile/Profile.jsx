import React, { useEffect, useState } from "react";
import {
  getPictureUrl,
  getSupabaseClient,
  getVideoProfileUrl,
} from "../../models/supabase";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";

const supabase = getSupabaseClient();

function Profile() {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = urlSearchParams.get("id");
      const { data: userData, error: errorUserData } = await supabase
        .from("users")
        .select("*")
        .eq("uid", userId);

      var photo_url = await getPictureUrl(userId);
      var video_url = await getVideoProfileUrl(userId);

      var dateCreated = new Date(userData[0].created_at);
      const diffTime = Math.abs(Date.now() - dateCreated);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setUser({
        ...userData[0],
        videoUrl: video_url,
        photoUrl: photo_url,
        timeago: diffDays,
      });
      console.log(user);
    };

    fetchUserData();
  }, []);

  return (
    <div className="profile">
      <div className="profile-content">
        <div className="profile-video-container">
          {user && user.videoUrl ? (
            <>
              <video className="profile-video-player" autoPlay controls>
                <source src={user.videoUrl}></source>
              </video>
            </>
          ) : (
            <>
              <img src="https://zuhmdhvkxcjlwkzeeqpr.supabase.co/storage/v1/object/sign/assets/user_profile_placeholder.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhc3NldHMvdXNlcl9wcm9maWxlX3BsYWNlaG9sZGVyLmpwZyIsImlhdCI6MTcwMTkxMzQwMiwiZXhwIjo4MDA5MTEzNDAyfQ.DcgHrwgkUqOFmDOfuvP8xtM2Qi_NnK3f2Wu3cty_lx8&t=2023-12-07T01%3A43%3A22.048Z"></img>
            </>
          )}
        </div>
        <ProfileData>
          <div className="profile-fullname">
            <div>Fullname: </div>
            <div>{user && user.fullname}</div>
          </div>
          <div className="profile-username">
            <div>Username: </div>
            <div>{user && user.username}</div>
          </div>
          <div className="profile-phone">
            <div>Phone number: </div>
            <div>{user && user.phone}</div>
          </div>
          <div className="profile-email">
            <div>Time in AI Maker: </div>
            <div>{user && user.timeago} days</div>
          </div>
        </ProfileData>
      </div>
    </div>
  );
}

export default Profile;

const ProfileData = styled.div`
  margin: 4rem 2rem 2rem 2rem;
  width: 100%;

  div[class^="profile-"] {
    display: flex;
    font-size: 1.4rem;

    & div:first-child {
      font-weight: bold;
      margin-right: 1rem;
    }

    & div:last-child {
      font-style: italic;
      margin-right: 1rem;
    }

    @media (max-width: 768px) {
      flex-direction: column;

      & div:last-child {
        margin-left: 1rem;
      }
    }
  }
`;
