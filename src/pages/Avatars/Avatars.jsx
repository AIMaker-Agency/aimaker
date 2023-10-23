import React, { useEffect, useState } from 'react'
import {getSupabaseClient} from '../../models/supabase'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const supabase = getSupabaseClient()

function Avatars() {
    
    const [session, setSession] = useState(null);
    const navigate = useNavigate();

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
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
        setUser(session.user)
      })

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
        setUser(session.user)
      }) 

      if(user){
        setFilenames(user.id)
          const { data: dataImage } = supabase
                  .storage
                  .from('d_id_pictures')
                  .getPublicUrl(user.uid+'.jpg');
          
          const { data: dataAudio } = supabase
                  .storage
                  .from('d_id_audios')
                  .getPublicUrl(user.uid+'.m4a'); 
          
          setSourceData({ ...sourceData, photo: dataImage.publicUrl, audio: dataAudio.publicUrl });
          console.log(sourceData)
      }

        return () => subscription.unsubscribe()
    }, [user])

    //DEFINE STYLES
    const talkContainerStyle = {
        display: "flex",
        width: "80%",
        margin: "0px 10%",
        backgroundColor: "#FFFFFF66",
        borderRadius: "2rem",
        height: "80%",
    };

    const talkInputsContainerStyle = {
        "flexGrow": "1",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        backgroundColor: "#00000099",
        padding: "2rem",
        borderRadius: "2rem 0px 0px 2rem",
        alignItems: "center",
        justifyContent: "space-evenly",
    };

    const talkResultContainerStyle = {
        "flexGrow": "1",
        width: "100%",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    }

    const talkPictureContainerStyle = {
        backgroundColor: "#aaa",
        borderRadius: "50%",
        border: "4px solid white",
        color: "white", 
        width: "10rem", 
        height: "10rem", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center"
    }

    const talkPictureStyle = {
        width: "inherit",
        height: "inherit",
        borderRadius: "inherit"
    }

    const talkButtonsStyle1 = {
        backgroundColor: "#76d736",
        width: "fit-content",
        color: "white",
        border: "none",
        padding: ".4rem 1rem",
        margin: ".4rem",
        borderRadius: ".4rem",
        cursor: "pointer"
    }

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

    const talkVideoPlayerStyle = {
        width: "75%",
        height: "75%",
        borderRadius: "15px",
        objectFit : "cover",
    }

    const handleUpload = async () => {
      setBtnCreate({disable: true, text: "Loading..."})
        // if (true) {
        //     const d_id_body = {
        //         script: {
        //             type: 'text',
        //             subtitles: 'false',
        //             provider: { type: 'elevenlabs', voice_id: '21m00Tcm4TlvDq8ikWAM' },
        //             ssml: 'false',
        //             input: talkText
        //         },
        //         config: { fluent: 'false', pad_audio: '0.0' },
        //         source_url: sourceData.photo
        //     }

        //     axios.post("https://api.d-id.com/talks", JSON.stringify(d_id_body), {
        //         headers: {
        //             accept: 'application/json',
        //             'content-type': 'application/json',
        //             authorization: 'Basic d2ViLm9wZW4ubWFya2V0LnBsYWNlQGdtYWlsLmNvbQ:EtCj5kXjsHnxhDWszI68f'
        //         }
        //     })
        //         .then(response => {
        //             const talkId = response.data.id;
                    
        //             //CODIGO DE GUARDAR IP

        //             const interval = setInterval(async () => {
        //                 axios.get('https://cors-anywhere.herokuapp.com/https://api.d-id.com/talks/'+talkId, {
        //                         headers: {
        //                             accept: 'application/json',
        //                             'content-type': 'application/json',
        //                             authorization: 'Basic d2ViLm9wZW4ubWFya2V0LnBsYWNlQGdtYWlsLmNvbQ:EtCj5kXjsHnxhDWszI68f'
        //                         }
        //                     })
        //                     .then(response => {
        //                         if (response.data.status === "done") {
        //                             saveIP(user);
        //                             setSourceData({ ...sourceData, video: response.data.result_url });
        //                         }
        //                         console.log(response);
        //                         clearInterval(interval);
        //                     }).catch(err => {
        //                         clearInterval(interval);
        //                     })
        //             }, 2000); // Poll every 5 seconds

        //         })
        //         .catch(error => console.log(error));
        // }
        setTimeout(() => { console.log('World!'); }, 2000);
        setBtnCreate({disable: false, text: "Create video"})
    }

    return (
        <div style={{ height: "100vh", display: "flex", alignItems: "center" }}>
            <div style={talkContainerStyle}>
                <div style={talkInputsContainerStyle}>
                    <div>
                        { sourceData.photo ? <label htmlFor='image'>
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
                            <div style={talkPictureContainerStyle}>{sourceData.photo ? <img style={talkPictureStyle} src={sourceData.photo}/> : "Upload photo"}</div>
                        </label> : <div style={talkPictureContainerStyle}>{sourceData.photo ? <img style={talkPictureStyle} src={sourceData.photo}/> : "No photo uploaded"}</div>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
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
                    </div>
                    <textarea style={{ background: "#FFFFFF66", borderRadius: ".5rem", color: "black", outline: "none", padding: ".2rem", resize: "none", width: "96%", height: "24%" }} name="text" placeholder='Type your text here to the avatar speech' onChange={(e) => setTalkText(e.target.value)} />
                    <button style={talkButtonsStyle1} onClick={handleUpload} disabled={btnCreate.disable}>{btnCreate.text}</button>
                </div>
                <div style={talkResultContainerStyle}>
                    {sourceData.video && <video style={talkVideoPlayerStyle} autoPlay muted loop><source src={sourceData.video}></source></video>}
                </div>
            </div>
        </div>
    )
}

function saveIP(user){
    axios.get("https://api.ipify.org/?format=json").then(async response => {
        let ip = response.data.ip;
        const { data , error }  = await supabase.from("d_id_talks").select().eq("ip", ""+ip);
        
        if(!error){
            if(data.length == 0){
                const { error: err} = await supabase.from("d_id_talks").insert({talkId: "Prueba", userId: user ? user.id : null, ip: ip});
                console.log(err);
            }
        }
    })
}

function checkIp(){
    axios.get("https://api.ipify.org/?format=json").then(async response => {
        let ip = response.data.ip;
        const { data , error }  = await supabase.from("d_id_talks").select().eq("ip", ""+ip);
        
        return (!error && data.length != 0);
    })
}
export default Avatars