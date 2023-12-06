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
import {
  createTalk,
  getTalkVideo,
  getVideoFile,
} from "../../models/d-id-api.ts";
import {
  addVoice,
  textToSpeech,
  deleteVoice,
} from "../../models/elevenlabs-api.ts";
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
  const [videoSetted, setVideoSetted] = useState(false);
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
  const [lastVoice, setLastVoice] = useState(null);
  // "https://d-id-talks-prod.s3.us-west-2.amazonaws.com/auth0%7C654a4feb41d204246e752bd6/tlk_Aw8UuG7-KJkB9HOMz5Seo/1701811481691.mp4?AWSAccessKeyId=AKIA5CUMPJBIK65W6FGA&Expires=1701897916&Signature=IPXaV2Oyv9N2b%2BHom2hhidvru%2F0%3D&X-Amzn-Trace-Id=Root%3D1-656f953c-5d122d841f5824f3041b6ea9%3BParent%3D9cc98d37d4da0196%3BSampled%3D1%3BLineage%3D6b931dd4%3A0",
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
        const { data: pictureList, error: errorPictureList } =
          await supabase.storage
            .from(bucket_d_id_pictures)
            .list("", { search: user.id });
        const { data: audioList, error: errorAudioList } =
          await supabase.storage
            .from(bucket_user_audios)
            .list("", { search: user.id });

        if (pictureList && pictureList.length != 0 && !errorPictureList) {
          const { data: dataImage } = supabase.storage
            .from(bucket_d_id_pictures)
            .getPublicUrl(pictureList[0].name);
          setSourceData({ ...sourceData, photo: dataImage.publicUrl });
        }

        if (audioList && audioList.length != 0 && !errorAudioList) {
          const { data: dataAudio } = supabase.storage
            .from(bucket_user_audios)
            .getPublicUrl(audioList[0].name);
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

      // const getTalkVideoResponse = await getTalkVideo(
      //   "tlk_cUA06cOZXkm5B0-pcMWON"
      // );

      // if (!getTalkVideoResponse.error) {
      //   const { data: uploadVideo, error: errorUploadVideo } =
      //     await supabase.storage
      //       .from(bucket_d_id_videos)
      //       .upload(fileNames + ".mp4", getTalkVideoResponse.data.file, {
      //         cacheControl: 3600,
      //         upsert: true,
      //       });

      //   if (!errorUploadVideo) {
      //     console.log("entró aquí");
      //     const urlVideo = supabase.storage
      //       .from(bucket_d_id_videos)
      //       .getPublicUrl(fileNames + ".mp4");

      //     setSourceData({ ...sourceData, video: urlVideo.data.publicUrl });
      //   }
      // } else {
      //   setError({
      //     isError: true,
      //     message: getTalkVideoResponse.error.message,
      //   });
      //   setBtnCreate({ disabled: false, text: "Create video" });
      // }

      // return;
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

      changeVoiceId(user.id, lastVoice, addVoiceResponse.data.voiceId);
      setLastVoice(addVoiceResponse.data.voiceId);

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
              .upload(
                fileNames + "/video_" + createTalkResponse.data.talkId + ".mp4",
                getTalkVideoResponse.data.file,
                {
                  cacheControl: 3600,
                  upsert: true,
                }
              );

          if (!errorUploadVideo) {
            const urlVideo = supabase.storage
              .from(bucket_d_id_videos)
              .getPublicUrl(
                fileNames + "/video_" + createTalkResponse.data.talkId + ".mp4"
              );

            setSourceData({
              ...sourceData,
              video: getTalkVideoResponse.data.result_url,
            });

            let ipSaved = await saveIP(user.id, createTalkResponse.data.talkId);
            if (ipSaved && !user) {
              deleteFiles(fileNames);
            }
            deleteVoice(lastVoice);
          }
        } else {
          setError({
            isError: true,
            message: getTalkVideoResponse.error.message,
          });
          setBtnCreate({ disabled: false, text: "Create video" });
        }
      } else {
        setError({
          isError: true,
          message: errorUploadAudio.message,
        });
      }
    } else if (!canCreateVideo) {
      alert("Ya has excedido el uso de la demo, registrate para utilizar");
    }
    setBtnCreate({ ...btnCreate, disabled: false, text: "Create video" });
  };

  const handleSetVideoProfile = async () => {
    console.log("Entra aquí");
    const video = await getVideoFile(sourceData.video);

    const { data: uploadVideoProfile, error: errorUploadVideoProfile } =
      await supabase.storage
        .from(bucket_d_id_videos)
        .upload(fileNames + "/video_profile_" + fileNames + ".mp4", video, {
          cacheControl: 3600,
          upsert: true,
        });

    if (errorUploadVideoProfile) {
      setError({
        isError: true,
        message: errorUploadVideoProfile.message,
      });
    } else {
      setVideoSetted(true);
    }
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
              <div className="talk-picture-container">
                {sourceData.photo ? (
                  <img className="talk-picture" src={sourceData.photo} />
                ) : (
                  "Upload photo"
                )}
              </div>
              <label htmlFor="image">
                <input
                  type="file"
                  name="image"
                  id="image"
                  accept="image/*"
                  onChange={async (e) => {
                    if (e.target.files.length > 0) {
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
                setVideoSetted(false);
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
                    onClick={async (e) => {
                      e.preventDefault();
                      await handleSetVideoProfile();
                    }}
                    disabled={videoSetted}
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

  const { error: err } = await supabase
    .from("d_id_talks")
    .insert({ talkId: talkId, userId: user ? user.id : null, ip: ip });
  if (err) {
    return false;
  } else {
    return true;
  }
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

async function changeVoiceId(userId, lastVoice, newVoiceId) {
  const lastVoiceId = lastVoice;
  if (lastVoiceId != "" && lastVoice != null) {
    await deleteVoice(lastVoiceId);

    const { data, error } = await supabase
      .from("d_id_voices")
      .update({ voiceId: newVoiceId })
      .eq("userId", userId);
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
