import React, { useEffect, useState } from "react";
import { getSupabaseClient } from "../../models/supabase";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  bucket_d_id_audios,
  bucket_d_id_pictures,
  bucket_d_id_videos,
  bucket_user_audios,
} from "../../models/supabase-constants";
import { createTalk, getTalkVideo } from "../../models/d-id-api.ts";
import { addVoice, textToSpeech } from "../../models/elevenlabs-api.ts";
import styled from "styled-components";

const supabase = getSupabaseClient();

function Avatars() {
  const [session, setSession] = useState(null);
  const [error, setError] = useState({
    isError: false,
    message: "",
  });
  const [canCreateVideo, setCanCreateVideo] = useState(true);
  const [btnCreate, setBtnCreate] = useState({
    disabled: false,
    text: "Create video",
  });
  const [fileNames, setFilenames] = useState(
    (Math.random() * 10).toString(36).replace(".", "")
  );
  const [talkText, setTalkText] = useState(null);
  const [voiceData, setVoiceData] = useState({
    hasAudioChange: false,
    voiceId: null,
    lastVoiceId: null,
  });
  const [user, setUser] = useState(null);
  const [sourceData, setSourceData] = useState({
    audio: null,
    video: null,
    photo: null,
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      if (session) setUser(session.user);
    };

    const handleAuthChange = async (_event, session) => {
      setSession(session);
      if (session) setUser(session.user);
    };

    fetchInitialData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      setFilenames(user.id);
      const fetchUserData = async () => {
        const { data: dataImage } = supabase.storage
          .from(bucket_d_id_pictures)
          .getPublicUrl(user.id + ".jpg");
        const { data: dataAudio } = supabase.storage
          .from(bucket_user_audios)
          .getPublicUrl(user.id + ".m4a");

        const { data: dataAux1, error: errorAux1 } = await supabase.storage
          .from(bucket_d_id_pictures)
          .list("", { search: user.id + ".jpg" });
        const { data: dataAux2, error: errorAux2 } = await supabase.storage
          .from(bucket_user_audios)
          .list("", { search: user.id + ".m4a" });

        if (dataAux1 && dataAux1.length != 0 && !errorAux1) {
          setSourceData({
            ...sourceData,
            photo: dataImage.publicUrl,
          });
        }

        if (dataAux2 && dataAux2.length != 0 && !errorAux2) {
          setSourceData({
            ...sourceData,
            audio: dataAudio.publicUrl,
          });
        }

        setVoiceData({ ...voiceData, lastVoiceId: await getVoiceId(user.id) });
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
  };

  const handleUpload = async (e) => {
    if (!sourceData.photo) {
      setError({
        isError: true,
        message: "Selecciona una foto para continuar",
      });
      return;
    }

    if (!sourceData.audio) {
      setError({
        isError: true,
        message: "Selecciona un audio para continuar",
      });
      return;
    }

    if (talkText == "" || talkText == null) {
      setError({
        isError: true,
        message: "Ingresa el texto que deseas para el video",
      });
      return;
    }

    if (
      (user && sourceData.photo && sourceData.audio && talkText !== "") ||
      (!user &&
        canCreateVideo &&
        sourceData.photo &&
        sourceData.audio &&
        talkText !== "")
    ) {
      setSourceData({ ...sourceData, video: null });
      setBtnCreate({ ...btnCreate, disabled: true, text: "Loading..." });

      const getTalkVideoResponse = await getTalkVideo(
        "tlk_oH2aF4giOYsZvSLeoV6f0"
      );

      if (!getTalkVideoResponse.error) {
        const { data: uploadVideo, error: errorUploadVideo } =
          await supabase.storage
            .from(bucket_d_id_videos)
            .upload(fileNames + ".mp4", getTalkVideoResponse.data.file, {
              cacheControl: 3600,
              upsert: true,
            });

        if (!errorUploadVideo) {
          console.log("entró aquí");
          const urlVideo = supabase.storage
            .from(bucket_d_id_videos)
            .getPublicUrl(fileNames + ".mp4");

          setSourceData({ ...sourceData, video: urlVideo.data.publicUrl });
        }
      } else {
        setError({
          isError: true,
          message: getTalkVideoResponse.error.message,
        });
        setBtnCreate({ disabled: false, text: "Create video" });
      }

      return;
      const addVoiceResponse = await addVoice(
        "voice" + (user != null ? user.id : fileNames),
        "Cloned voice of user in " +
          (user != null ? user.id : fileNames) +
          " aimaker",
        sourceData.audio
      );

      if (addVoiceResponse.error) {
        setError({ isError: true, message: addVoiceResponse.error.message });
        setBtnCreate({ disabled: false, text: "Create video" });
        return;
      }

      const textToSpeechResponse = await textToSpeech(
        talkText,
        addVoiceResponse.data.voiceId
      );
      const { data: uploadAudio, error: errorUploadAudio } =
        await supabase.storage
          .from(bucket_d_id_audios)
          .upload(
            "/cloned_" + fileNames + ".mp3",
            textToSpeechResponse.data.file,
            {
              cacheControl: 3600,
              upsert: true,
            }
          );

      if (!errorUploadAudio) {
        const urlAudio = supabase.storage
          .from(bucket_d_id_audios)
          .getPublicUrl("/cloned_" + fileNames + ".mp3");

        const createTalkResponse = await createTalk(
          "audio",
          sourceData.photo,
          null,
          urlAudio.data.publicUrl
        );

        if (createTalkResponse.error != null) {
          setError({
            isError: true,
            message: createTalkResponse.error.message,
          });
          setBtnCreate({ disabled: false, text: "Create video" });
          return;
        }

        const getTalkVideoResponse = await getTalkVideo(
          createTalkResponse.data.talkId
        );

        if (!getTalkVideoResponse.error) {
          const { data: uploadVideo, error: errorUploadVideo } =
            await supabase.storage
              .from(bucket_d_id_videos)
              .upload(fileNames + ".mp4", getTalkVideoResponse.data.file, {
                cacheControl: 3600,
                upsert: true,
              });

          if (!errorUploadVideo) {
            console.log("entró aquí");
            const urlVideo = supabase.storage
              .from(bucket_d_id_videos)
              .getPublicUrl(fileNames + ".mp4");

            setSourceData({ ...sourceData, video: urlVideo.data.publicUrl });
          }
        } else {
          setError({
            isError: true,
            message: getTalkVideoResponse.error.message,
          });
          setBtnCreate({ disabled: false, text: "Create video" });
        }
      }

      /*
      // var audioBlob = await axios.get(sourceData.audio, {
      //   responseType: "blob",
      // });
      // var audioFile = new File([audioBlob.data], "audiofile.m4a");

      // var elevenLabsBody = new FormData();
      // elevenLabsBody.append("name", "voice" + user.id);
      // elevenLabsBody.append("description", "User " + user.id + " voice");
      // elevenLabsBody.append("files", audioFile);

      // axios
      //   .post("https://api.elevenlabs.io/v1/voices/add", elevenLabsBody, {
      //     headers: {
      //       accept: "application/json",
      //       "xi-api-key": "b288f4acde97a03c92159929bdad79bc",
      //       "Content-Type": "multipart/form-data",
      //     },
      //   })
      //   .then((response) => {
      //     changeVoiceId(user.id, response.data.voice_id);
      //     setVoiceData({
      //       ...voiceData,
      //       hasAudioChange: true,
      //       lastVoiceId: voiceData.voiceId,
      //       voiceId: response.data.voice_id,
      //     });

      //     const textToSpeechBody = {
      //       text: talkText,
      //       model_id: "eleven_multilingual_v2",
      //       voice_settings: {
      //         stability: 0.5,
      //         similarity_boost: 0.5,
      //       },
      //     };

      //     const textToSpeechUrl =
      //       "https://api.elevenlabs.io/v1/text-to-speech/" +
      //       response.data.voice_id +
      //       "/stream";

      //     const textToSpeechConfig = {
      //       headers: {
      //         "xi-api-key": "b288f4acde97a03c92159929bdad79bc",
      //         "Content-Type": "application/json",
      //         Accept: "audio/mpeg",
      //       },
      //       responseType: "blob",
      //     };

      //     axios
      //       .post(
      //         textToSpeechUrl,
      //         JSON.stringify(textToSpeechBody),
      //         textToSpeechConfig
      //       )
      //       .then(async (responseToSpeech) => {
      //         const audioFile = new File([responseToSpeech.data], "audio.mp3", {
      //           type: "audio/mpeg",
      //         });
      //         const { data, error } = await supabase.storage
      //           .from(bucket_d_id_audios)
      //           .upload(
      //             fileNames + "/audio_" + response.data.voice_id + ".mp3",
      //             audioFile,
      //             {
      //               cacheControl: "3600",
      //               upsert: true,
      //             }
      //           );

      //         if (!error) {
      //           const { data } = supabase.storage
      //             .from(bucket_d_id_audios)
      //             .getPublicUrl(
      //               fileNames + "/audio_" + response.data.voice_id + ".mp3"
      //             );

      //           const d_id_body = {
      //             script: {
      //               type: "audio",
      //               subtitles: "false",
      //               ssml: "false",
      //               audio_url: data.publicUrl,
      //             },
      //             config: { fluent: "false", pad_audio: "0.0" },
      //             source_url: sourceData.photo,
      //           };

      //           axios
      //             .post(
      //               "https://api.d-id.com/talks",
      //               JSON.stringify(d_id_body),
      //               {
      //                 headers: {
      //                   accept: "application/json",
      //                   "content-type": "application/json",
      //                   authorization:
      //                     "Basic d2ViLm9wZW4ubWFya2V0LnBsYWNlQGdtYWlsLmNvbQ:EtCj5kXjsHnxhDWszI68f",
      //                 },
      //               }
      //             )
      //             .then((response) => {
      //               const talkId = response.data.id;

      //               const interval = setInterval(() => {
      //                 // "https://cors-anywhere.herokuapp.com/"+
      //                 axios
      //                   .get("https://api.d-id.com/talks/" + talkId, {
      //                     headers: {
      //                       accept: "application/json",
      //                       "content-type": "application/json",
      //                       authorization:
      //                         "Basic d2ViLm9wZW4ubWFya2V0LnBsYWNlQGdtYWlsLmNvbQ:EtCj5kXjsHnxhDWszI68f",
      //                     },
      //                   })
      //                   .then((response) => {
      //                     if (response.data.status === "done") {
      //                       /////////////// VALIDATE THE VIDEO UPLOAD TO DATABASE
      //                       fetch(response.data.result_url, { mode: "no-cors" })
      //                         .then((res) => res.blob())
      //                         .then((blobFile) => {
      //                           let videoFile = new File(
      //                             [blobFile],
      //                             "video_profile.mp4",
      //                             {
      //                               type: "video/mp4",
      //                             }
      //                           );
      //                           const { error: videoError } = supabase.storage
      //                             .from(bucket_d_id_videos)
      //                             .upload(
      //                               fileNames + "/video_profile_" + talkId,
      //                               videoFile,
      //                               {
      //                                 cacheControl: "3600",
      //                                 upsert: true,
      //                               }
      //                             );

      //                           if (!videoError) {
      //                             saveIP(user, talkId);
      //                             if (!user) {
      //                               setCanCreateVideo(false);
      //                               deleteFiles(fileNames);
      //                             }
      //                             setBtnCreate({
      //                               ...btnCreate,
      //                               disabled: false,
      //                               text: "Create video",
      //                             });
      //                             setSourceData({
      //                               ...sourceData,
      //                               video:
      //                                 response.data.result_url +
      //                                 "?_=" +
      //                                 new Date().getTime(),
      //                             });
      //                             // clearInterval(interval);
      //                           }
      //                         })
      //                         .catch((err) => console.error(err));
      //                       clearInterval(interval);
      //                     }
      //                   })
      //                   .catch((err) => {
      //                     console.log(err);
      //                     clearInterval(interval);
      //                   });
      //               }, 2000); // Poll every 5 seconds
      //             })
      //             .catch((error) => console.error(error));
      //         }
      //       });
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //   });
      */
    } else if (!canCreateVideo) {
      alert("Ya has excedido el uso de la demo, registrate para utilizar");
    }
    setBtnCreate({ ...btnCreate, disabled: false, text: "Create video" });
  };

  return (
    <>
      <AvatarsContainer>
        <div className="talk-container">
          <div className="talk-inputs-container">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {sourceData.photo || !user ? (
                <label htmlFor="image">
                  <input
                    type="file"
                    name="image"
                    id="image"
                    accept="image/*"
                    onChange={async (e) => {
                      if (e.target.files.length > 0) {
                        const { error: uploadPhotoError } =
                          await supabase.storage
                            .from(bucket_d_id_pictures)
                            .upload(
                              "./" +
                                fileNames +
                                getFileExtension(e.target.files[0].name),
                              e.target.files[0],
                              {
                                cacheControl: "3600",
                                upsert: true,
                              }
                            );

                        if (!uploadPhotoError) {
                          const { data } = supabase.storage
                            .from(bucket_d_id_pictures)
                            .getPublicUrl(
                              fileNames +
                                getFileExtension(e.target.files[0].name)
                            );

                          setSourceData({
                            ...sourceData,
                            photo: data.publicUrl,
                          });
                        }
                      }
                    }}
                    hidden
                  />
                  <div className="talk-picture-container">
                    {sourceData.photo ? (
                      <img className="talk-picture" src={sourceData.photo} />
                    ) : (
                      "Upload photo"
                    )}
                  </div>
                </label>
              ) : (
                <div className="talk-picture-container">
                  {sourceData.photo ? (
                    <img className="talk-picture" src={sourceData.photo} />
                  ) : (
                    "No photo uploaded"
                  )}
                </div>
              )}
              <label htmlFor="image">
                <input
                  type="file"
                  name="image"
                  id="image"
                  accept="image/*"
                  onChange={async (e) => {
                    if (e.target.files.length > 0) {
                      console.log(getFileExtension(e.target.files[0].name));
                      const { error: uploadPhotoError } = await supabase.storage
                        .from(bucket_d_id_pictures)
                        .upload(
                          fileNames + getFileExtension(e.target.files[0].name),
                          e.target.files[0],
                          {
                            cacheControl: "3600",
                            upsert: true,
                          }
                        );

                      if (!uploadPhotoError) {
                        const { data } = supabase.storage
                          .from(bucket_d_id_pictures)
                          .getPublicUrl(
                            fileNames + getFileExtension(e.target.files[0].name)
                          );

                        setSourceData({
                          ...sourceData,
                          photo: data.publicUrl + "?_=" + new Date().getTime(),
                        });
                      }
                    }
                  }}
                  hidden
                />
                <div className="talk-button-2">Set new photo</div>
              </label>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {sourceData.audio ? (
                <>
                  <audio
                    style={talkAudioPlayerStyle}
                    controls
                    preload="metadata"
                  >
                    <source src={sourceData.audio} type="audio/ogg" />
                  </audio>
                  <div
                    onClick={(e) => {
                      setSourceData({ ...sourceData, audio: null });
                    }}
                  >
                    Change audio
                  </div>
                </>
              ) : (
                <>
                  <label htmlFor="audio">
                    <input
                      type="file"
                      name="audio"
                      id="audio"
                      accept=".mp3,.m4a"
                      onChange={async (e) => {
                        if (e.target.files.length > 0) {
                          const { error: uploadAudioError } =
                            await supabase.storage
                              .from(bucket_user_audios)
                              .upload(
                                fileNames +
                                  getFileExtension(e.target.files[0].name),
                                e.target.files[0],
                                {
                                  cacheControl: "3600",
                                  upsert: true,
                                }
                              );

                          if (!uploadAudioError) {
                            const { data } = supabase.storage
                              .from(bucket_user_audios)
                              .getPublicUrl(
                                fileNames +
                                  getFileExtension(e.target.files[0].name)
                              );
                            setSourceData({
                              ...sourceData,
                              audio:
                                data.publicUrl + "?_=" + new Date().getTime(),
                            });
                          }
                        }
                      }}
                      hidden
                    />
                    <div
                      style={{
                        backgroundColor: "white",
                        color: "#76d736",
                        padding: ".6rem 1rem",
                        width: "fit-content",
                        borderRadius: "15px",
                        cursor: "pointer",
                      }}
                    >
                      Upload audio
                    </div>
                  </label>
                </>
              )}
            </div>
            <textarea
              className="talk-textarea"
              name="text"
              placeholder="Type your text here to the avatar speech"
              onChange={(e) => setTalkText(e.target.value)}
            />
            <button
              className="talk-button"
              onClick={async (e) => {
                e.preventDefault();
                await handleUpload(e);
              }}
              disabled={btnCreate.disabled}
            >
              {btnCreate.text}
            </button>
          </div>
          <div className="talk-result-container">
            {sourceData.video && (
              <>
                <video className="talk-video-player" autoPlay controls muted>
                  <source src={sourceData.video}></source>
                </video>
                {user && (
                  <button
                    className="talk-button-2"
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                  >
                    Set as video presentation
                  </button>
                )}
                <a href={sourceData.video} className="talk-button-2">
                  Download
                </a>
              </>
            )}
          </div>
        </div>
      </AvatarsContainer>
      {error.isError && (
        <DivError>
          <div className="avatars-error">{error.message}</div>
          {setTimeout(() => {
            setError({ isError: false, message: "" });
          }, 5000)}
        </DivError>
      )}
    </>
  );
}

async function saveIP(user, talkId) {
  const {
    data: { ip },
  } = await axios.get("https://api.ipify.org/?format=json");
  // const { data , error }  = await supabase.from("d_id_talks").select().eq("ip", ""+ip);
  const { error: err } = await supabase
    .from("d_id_talks")
    .insert({ talkId: talkId, userId: user ? user.id : null, ip: ip });
}

async function checkIp() {
  /* RETURN TRUE IF AN UNREGISTERED USER HAVE THE IP SAVED */
  const {
    data: { ip },
  } = await axios.get("https://api.ipify.org/?format=json");
  const { data, error } = await supabase
    .from("d_id_talks")
    .select("userId")
    .filter("ip", "eq", ip, "and", "userId", "eq", null);
  return !error && data.length == 0;
}

async function deleteFiles(filename) {
  const { data: deletePictureData, error: deletePictureError } =
    await supabase.storage
      .from(bucket_d_id_pictures)
      .remove([filename + ".jpg"]);

  const { data: deleteAudioData, error: deleteAudioError } =
    await supabase.storage.from(bucket_d_id_audios).remove([filename + ".m4a"]);
}

async function getVoiceId(userId) {
  const { data, error } = await supabase
    .from("d_id_voices")
    .select("voiceId")
    .filter("userId", "eq", userId);
  return Array.isArray(data) && data[0] ? data[0].voiceId : "";
}

async function changeVoiceId(userId, newVoiceId) {
  const lastVoiceId = await getVoiceId(userId);
  if (lastVoiceId != "") {
    const response = await axios.delete(
      "https://api.elevenlabs.io/v1/voices/" + lastVoiceId,
      {
        headers: {
          accept: "application/json",
          "xi-api-key": "b288f4acde97a03c92159929bdad79bc",
        },
      }
    );

    const { data, error } = await supabase
      .from("d_id_voices")
      .update({ voiceId: newVoiceId })
      .eq("userId", userId);
    console.log(data);
    console.log(error);
  } else {
    const { data, error } = await supabase
      .from("d_id_voices")
      .insert({ userId: userId, voiceId: newVoiceId });
  }
}

function getFileExtension(filename) {
  if (filename != "") {
    let lastIndexOfDot = filename.lastIndexOf(".");
    let size = filename.length;
    return filename.substr(lastIndexOfDot);
  }
  return "";
}

export default Avatars;

const DivError = styled.div`
  width: 100%;
  position: absolute;
  bottom: 0px;
  height: 2rem;
  display: flex;
  align-items: center;
  background-color: #f56e6e;
  border-radius: 1rem 1rem 0px 0px;
  color: transparent;

  .avatars-error {
    color: white;
    width: 100%;
    bottom: 2px;
    text-align: center;
  }
`;

const AvatarsContainer = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;

  .talk-container {
    @media (max-width: 768px) {
      flex-direction: column;

      .talk-inputs-container {
        padding: 0;
        border-radius: 2rem 2rem 0px 0px;

        .talk-textarea {
          width: 90%;
        }
      }
    }
  }
`;
