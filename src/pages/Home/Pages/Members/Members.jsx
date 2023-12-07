import React, { useEffect, useState } from "react";
import { getPictureUrl, getSupabaseClient } from "../../../../models/supabase";
import { useNavigate } from "react-router-dom";
import { bucket_d_id_pictures } from "../../../../models/supabase-constants";
import MemberCard from "./components/MemberCard";
import styled from "styled-components";

const supabase = getSupabaseClient();

function Members() {
  const [membersData, setMembersData] = useState({
    users: null,
    error: null,
  });

  const navigate = useNavigate();
  useEffect(() => {
    // supaAdmin.auth.admin
    //   .listUsers()
    //   .then((response) => {
    //     console.log(response);
    //     if (!membersData.users)
    //       setMembersData({
    //         ...membersData,
    //         users: response.data.users.map((x) => {
    //           return { id: x.id, email: x.email };
    //         }),
    //       });
    //   })
    //   .catch((error) => setMembersData({ ...membersData, error: error }));

    const fetchUsersData = async () => {
      const { data: users, error: error } = await supabase
        .from("users")
        .select("uid, fullname, username");

      const userDataWithPhotos = await Promise.all(
        users.map(async (x) => {
          var photo_url = await getPictureUrl(x.uid);
          return { ...x, photoUrl: photo_url };
        })
      );

      setMembersData({ ...membersData, users: userDataWithPhotos });
    };

    fetchUsersData();
  }, []);

  return (
    <>
      {membersData.users && !membersData.error ? (
        <MembersGrid>
          {membersData.users.map((user, index) => {
            return (
              <MemberCard
                key={`membercard-${index}`}
                uid={user.uid}
                name={user.fullname}
                photoUrl={user.photoUrl}
                username={user.username}
              />
            );
          })}
        </MembersGrid>
      ) : (
        <div>Not users found</div>
      )}
    </>
  );
}

export default Members;

const MembersGrid = styled.div`
  display: grid;
  justify-items: stretch;
  grid-template-columns: repeat(3, 1fr);

  @media (max-width: 768px) {
    grid-template-columns: repeat(1, 1fr);
  }
`;
