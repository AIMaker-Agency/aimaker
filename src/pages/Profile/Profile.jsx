import React, { useEffect, useState } from 'react'
import { getSupabaseAdmin, getSupabaseClient } from '../../models/supabase'
import { useSearchParams } from 'react-router-dom';

const supaAdmin = getSupabaseAdmin();

function Profile() {

    const [urlSearchParams, setUrlSearchParams] = useSearchParams();
    const [user, setUser] = useState(null);
    const [sourceData, setSourceData] = useState({videoUrl: null});
    
    useEffect(() =>{
        supaAdmin.auth.admin.getUserById(urlSearchParams.get("id")).then((response) => {
            setUser(response.data.user)
            if(response.data.user){
                //OBTENER VIDEO DE PRESENTACION
                const {data: videoData } = supaAdmin.storage.from('d_id_videos').getPublicUrl(response.data.user.id+'/video_profile_'+response.data.user.id+'.mp4');
                setSourceData({videoUrl: videoData.publicUrl});
            }
        }).catch((error) => {console.log(error)});
    },[])
    

    return (
        <div className='profile'>
            <div className="profile-content">
                <div className='profile-video'><video controls autoPlay muted><source src={sourceData.videoUrl}/></video></div>
                <div className='profile-name'>{user ? user.role : ''}</div>
                <div>Hola mundo</div>
            </div>
        </div>
    )
}

export default Profile