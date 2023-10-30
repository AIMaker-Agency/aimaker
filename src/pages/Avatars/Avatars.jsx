import React, { useEffect, useState } from 'react'
import {getSupabaseClient} from '../../models/supabase'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const supabase = getSupabaseClient()

function Avatars() {
    
    const [session, setSession] = useState(null);
    const [canCreateVideo, setCanCreateVideo] = useState(true);
    const [btnCreate, setBtnCreate] = useState({disabled: false, text: "Create video"});
    const [fileNames, setFilenames] = useState((Math.random() * 10).toString(36).replace('.', ''));
    const [talkText, setTalkText] = useState(null);
    const [user, setUser] = useState(null);
    const [sourceData, setSourceData] = useState({
        audio: null,
        video: null,
        photo: null,
    });

    // video: "https://create-images-results.d-id.com/api_docs/assets/noelle.mp4",

    useEffect(() => {
    
        const fetchInitialData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session)
            if(session) setUser(session.user);
        };
    
        const handleAuthChange = async (_event, session) => {
            setSession(session)
            if(session) setUser(session.user);
        };
    
        fetchInitialData();
    
        const {data: { subscription },} = supabase.auth.onAuthStateChange(handleAuthChange);
    
        return () => subscription.unsubscribe()
    }, []);
    
    useEffect(() => {
        if (user) {
            setFilenames(user.id);
            const fetchUserData = async () => {
                const { data: dataImage } = supabase.storage.from('d_id_pictures').getPublicUrl(user.id + '.jpg');
                const { data: dataAudio } = supabase.storage.from('d_id_audios').getPublicUrl(user.id + '.m4a');
                
                const {data, error} = await supabase.storage.from('d_id_pictures').list('', {search: user.id+'.jpg'});

                if(data && data.length != 0 && !error){
                    setSourceData({
                        ...sourceData, 
                        photo: dataImage.publicUrl, 
                        audio: dataAudio.publicUrl 
                    });
                }
            };
            
            fetchUserData();
        } else {
            const checkUserIP = async () => {
                const value = await checkIp();
                setCanCreateVideo(value);
            };
    
            checkUserIP();
        }
    }, [user]);    
    

    //DEFINE STYLES
    const talkAudioPlayerStyle = {
        WebkitTransition: "all 0.5s linear",
        MozTransition: "all 0.5s linear",
        OTransition: "all 0.5s linear",
        transition: "all 0.5s linear",
        MozBoxShadow: "2px 2px 4px 0px #006773",
        WebkitBoxShadow: "2px 2px 4px 0px #006773",
        boxShadow: "2px 2px 4px 0px #006773",
        MozBorderRadius: "7px 7px 7px 7px ",
        WebkitBorderRadius: "7px 7px 7px 7px ",
        borderRadius: "7px 7px 7px 7px ",
    }

    const handleUpload = async (e) => {

        if((user && ( sourceData.photo && talkText !== "")) || (!user && canCreateVideo && (sourceData.photo && talkText !== ""))){
            setBtnCreate({...btnCreate, disabled: true, text: "Loading..."})
            const d_id_body = {
                script: {
                    type: 'text',
                    subtitles: 'false',
                    provider: { type: 'elevenlabs', voice_id: '21m00Tcm4TlvDq8ikWAM' },
                    ssml: 'false',
                    input: talkText
                },
                config: { fluent: 'false', pad_audio: '0.0' },
                source_url: sourceData.photo
            }

            axios.post("https://api.d-id.com/talks", JSON.stringify(d_id_body), {
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    authorization: 'Basic d2ViLm9wZW4ubWFya2V0LnBsYWNlQGdtYWlsLmNvbQ:EtCj5kXjsHnxhDWszI68f'
                }
            })
                .then(response => {
                    const talkId = response.data.id;

                    const interval = setInterval(() => {
                        axios.get('https://api.d-id.com/talks/'+talkId, {
                                headers: {
                                    accept: 'application/json',
                                    'content-type': 'application/json',
                                    authorization: 'Basic d2ViLm9wZW4ubWFya2V0LnBsYWNlQGdtYWlsLmNvbQ:EtCj5kXjsHnxhDWszI68f'
                                }
                            })
                            .then(response => {
                                if (response.data.status === "done") {
                                    /////////////// VALIDATE THE VIDEO UPLOAD TO DATABASE
                                    // "https://cors-anywhere.herokuapp.com/"+
                                    fetch(response.data.result_url, {headers:{"Access-Control-Allow-Origin": "*",}}).then(res => res.blob()).then(blobFile => {
                                        let videoFile = new File([blobFile], "video_profile.mp4", { type: 'video/mp4' })
                                        const {error: videoError } = supabase.storage.from('d_id_videos').upload(fileNames+'/video_profile_'+talkId, videoFile, {
                                            cacheControl: '3600',
                                            upsert: false
                                        })
                                        
                                        if(!videoError){
                                            saveIP(user, talkId);
                                            if(!user){
                                                setCanCreateVideo(false);
                                                deleteFiles(fileNames);
                                            }
                                            setBtnCreate({...btnCreate, disabled: false, text: "Create video"});
                                            setSourceData({ ...sourceData, video: response.data.result_url });
                                            // clearInterval(interval);
                                        }
                                    }).catch(err => console.error(err));
                                    clearInterval(interval);
                                }
                            }).catch(err => {
                                console.log(err)
                                clearInterval(interval);
                            })
                    }, 2000); // Poll every 5 seconds
                })
                .catch(error => console.error(error));
        }else if(!canCreateVideo){
            alert("Ya has excedido el uso de la demo, registrate para utilizar");
        }
        
    }

    return (
        <div style={{ height: "100vh", display: "flex", alignItems: "center" }}>
            <div className='talk-container'>
                <div className='talk-inputs-container'>
                    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                        { sourceData.photo || !user ? <label htmlFor='image'>
                            <input type='file' name='image' id='image' accept='.jpg,.png' onChange={async (e) => {

                                const { error: uploadPhotoError } = await supabase.storage
                                    .from("d_id_pictures")
                                    .upload(fileNames+'.jpg', e.target.files[0], {
                                        cacheControl: '3600',
                                        upsert: false
                                    });

                                if (!uploadPhotoError) {
                                    const { data } = supabase
                                        .storage
                                        .from('d_id_pictures')
                                        .getPublicUrl(fileNames+'.jpg')

                                    setSourceData({ ...sourceData, photo: data.publicUrl });
                                }
                                
                            }} hidden />
                            <div className='talk-picture-container'>{sourceData.photo ? <img className='talk-picture' src={sourceData.photo}/> : "Upload photo"}</div>
                        </label> : <div className='talk-picture-container'>{sourceData.photo ? <img className='talk-picture' src={sourceData.photo}/> : "No photo uploaded"}</div>}
                        <label htmlFor='image'>
                            <input type='file' name='image' id='image' accept='.jpg,.png' onChange={async (e) => {

                                const { error: uploadPhotoError } = await supabase.storage
                                    .from("d_id_pictures")
                                    .upload(fileNames+'.jpg', e.target.files[0], {
                                        cacheControl: '3600',
                                        upsert: false
                                    });

                                if (!uploadPhotoError) {
                                    const { data } = supabase
                                        .storage
                                        .from('d_id_pictures')
                                        .getPublicUrl(fileNames+'.jpg')

                                    setSourceData({ ...sourceData, photo: data.publicUrl });
                                }
                                
                            }} hidden />
                            <div className='talk-button-2'>Set new photo</div>
                        </label>
                    </div>
                    {/* <div style={{ display: "flex", flexDirection: "column" }}>
                        {sourceData.audio ? <audio style={talkAudioPlayerStyle} controls preload="metadata">
                            <source src={sourceData.audio} type="audio/ogg" />
                        </audio> : <>
                            <label htmlFor="audio">
                                <input type='file' name='audio' id='audio' accept='.mp3,.m4a' onChange={async (e) => {

                                    const { error: uploadAudioError } = await supabase.storage
                                        .from("d_id_audios")
                                        .upload(fileNames+'.m4a', e.target.files[0], {
                                            cacheControl: '3600',
                                            upsert: false
                                        });

                                    if (!uploadAudioError) {
                                        const { data } = supabase
                                            .storage
                                            .from('d_id_audios')
                                            .getPublicUrl(fileNames+'.m4a')
                                        setSourceData({ ...sourceData, audio: data.publicUrl });
                                    } 

                                }} hidden />
                                <div style={{ backgroundColor: "white", color: "#76d736", padding: ".6rem 1rem", width: "fit-content", borderRadius: "15px", cursor: "pointer" }}>Upload audio</div>
                            </label>
                        </>}
                    </div> */}
                    <textarea className='talk-textarea' name="text" placeholder='Type your text here to the avatar speech' onChange={(e) => setTalkText(e.target.value)} />
                    <button className='talk-button' onClick={ async (e) => {e.preventDefault(); await handleUpload(e);}} disabled={btnCreate.disabled}>{btnCreate.text}</button>
                </div>
                <div className='talk-result-container'>
                    {sourceData.video && <>
                        <video className='talk-video-player' autoPlay controls muted><source src={sourceData.video}></source></video>
                        {user && <button className='talk-button-2' onClick={(e) => {e.preventDefault()}}>Set as video presentation</button>}
                        <a href={sourceData.video} className='talk-button-2' >Download</a>
                    </>}
                </div>
            </div>
        </div>
    )
}

async function saveIP(user, talkId){
    const {data: {ip}} = await axios.get("https://api.ipify.org/?format=json");
    // const { data , error }  = await supabase.from("d_id_talks").select().eq("ip", ""+ip);
    const { error: err} = await supabase.from("d_id_talks").insert({talkId: talkId, userId: user ? user.id : null, ip: ip});
}

async function checkIp(){
    /* RETURN TRUE IF AN UNREGISTERED USER HAVE THE IP SAVED */
    const {data: {ip}} = await axios.get("https://api.ipify.org/?format=json");
    const { data , error }  = await supabase.from("d_id_talks").select('userId').filter('ip','eq',ip,'and','userId','eq',null);
    return (!error && data.length == 0);
}

async function deleteFiles(filename){
    const { data: deletePictureData, error: deletePictureError } = await supabase
        .storage
        .from('d_id_pictures')
        .remove([filename+'.jpg'])

    const { data: deleteAudioData, error: deleteAudioError } = await supabase
        .storage
        .from('d_id_audios')
        .remove([filename+'.m4a'])
}
export default Avatars