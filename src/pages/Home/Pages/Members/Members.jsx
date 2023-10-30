import React, { useEffect, useState } from 'react'
import { getSupabaseAdmin } from '../../../../models/supabase';
import { useNavigate } from 'react-router-dom';

const supaAdmin = getSupabaseAdmin();

function Members() {

  const [membersData, setMembersData] = useState({
    users: null,
    error: null,
  })

  const navigate = useNavigate();
  useEffect(() => {
    supaAdmin.auth.admin.listUsers().then(response => {if(!membersData.users) setMembersData({...membersData, users: response.data.users.map(x => {return {id: x.id, email: x.email};})})}).catch(error => setMembersData({...membersData, error: error}));
  },[])

  return (
    <>
      {membersData.users && !membersData.error ? <div>{membersData.users.map((user, index) => {return <p key={index} onClick={e => {e.preventDefault(); navigate("/profile/?id="+user.id)}}>{user.id}</p>})}</div>: <div>Not users found</div>}
    </>
  )
}

export default Members