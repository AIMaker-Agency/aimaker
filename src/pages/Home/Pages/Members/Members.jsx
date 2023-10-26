import React, { useEffect, useState } from 'react'
import { getSupabaseAdmin } from '../../../../models/supabase';

const supaAdmin = getSupabaseAdmin();

function Members() {

  const [membersData, setMembersData] = useState({
    users: null,
    error: null,
  })
  useEffect(() => {
    supaAdmin.auth.admin.listUsers().then(response => {if(!membersData.users) setMembersData({...membersData, users: response.data.users.map(x => {return {id: x.id, email: x.email};})})}).catch(error => setMembersData({...membersData, error: error}));
  },[])

  return (
    <>
      <div>5.Lorem ipsum, dolor sit amet consectetur adipisicing elit. Modi rerum, reprehenderit enim saepe necessitatibus aut eius debitis veritatis cum et quos hic nostrum a ad pariatur in placeat repudiandae unde!</div>
      {membersData.users && console.log(membersData)}
    </>
  )
}

export default Members