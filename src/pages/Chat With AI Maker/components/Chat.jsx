import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { FaImage } from "react-icons/fa6";
import { IoCloseCircle } from "react-icons/io5";
import { GPTChat } from "../../../models/OpenAI/GPT-Completition";
import {
  UploadImageAndGetURL,
  clearBucket,
  getSupabaseClient,
} from "../../../models/supabase";
import { bucket_gpt_images } from "../../../models/supabase-constants";
import axios from "axios";

const supabase = getSupabaseClient();
const CHAT_TABLE_NAME = "openai_chats";
const chatGPT = new GPTChat({
  model: "gpt-4-vision-preview",
  isVisionEnable: true,
});

function Chat() {
  const [listImages, setListImages] = useState([]);
  const [input, setInput] = useState("");

  const [error, setError] = useState({
    isError: false,
    message: "",
  });
  const [fileNames, setFilenames] = useState(
    (Math.random() * 10).toString(36).replace(".", "")
  );
  const [user, setUser] = useState(null);

  const handleError = (message) => {
    setError({ isError: true, message: message });
    setTimeout(() => {
      setError({ isError: false, message: "" });
    }, 5000);
  };

  const [chatData, setChatData] = useState({
    isAnswering: false,
    chatHistory: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      //GET CHAT HISTORY
      /* CODE TO GET CHAT FROM DATABASE */
      const chatInDatabase = await supabase
        .from(CHAT_TABLE_NAME)
        .select("messages")
        .filter(
          "userId",
          "eq",
          user ? user.id : "NULL",
          "chatId",
          "eq",
          chatGPT.id
        );

      let messages;
      if (chatInDatabase.data.length > 0) {
        messages = JSON.parse(chatInDatabase.data[0].messages);
      } else {
        messages = [
          {
            role: "assistant",
            content: "Hola, soy tu asistente virtual, qué puedo hacer por ti?",
          },
        ];
      }

      //SET CHAT HISTORY
      setChatData({
        ...chatData,
        chatHistory: messages,
      });

      let chatScreen = document.querySelector(
        ".chatContent .chatScreen .chatMessages"
      );
      chatScreen.scrollTop = chatScreen.scrollHeight;
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setFilenames(session.user.id);
        setUser(session.user);
      }
    };

    const handleAuthChange = async (_event, session) => {
      if (session) {
        setFilenames(session.user.id);
        setUser(session.user);
      }
    };

    fetchInitialData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => subscription.unsubscribe();
  }, []);

  return (
    <ChatContainer>
      <div className="chatContent">
        <div className="chatScreen">
          <div className="chatMessages">
            {chatData.chatHistory.map((message, index) => (
              <div
                key={"chatMessage " + index}
                className={`messageItem ${message.role}`}
              >
                <div className="messageItemName">
                  {message.role == "user" ? "User:" : chatGPT.name}
                </div>
                <div className="messageItemContent">{message.content}</div>
              </div>
            ))}
            {chatData.isAnswering && (
              <div className="messageItem assitant">
                <div className="messageItemName">{chatGPT.name}</div>
                <div className="messageItemContent">
                  <div className="dot-pulse"></div>
                </div>
              </div>
            )}
          </div>
          {error.isError && <div className="chatError">{error.message}</div>}
        </div>
        {listImages.length > 0 && (
          <div className="chatImagesUploaded">
            {listImages.map((image, index) => (
              <div key={"image" + index} className="image">
                <IoCloseCircle
                  size={20}
                  color="black"
                  onClick={(e) => {
                    e.preventDefault();
                    const listAux = listImages.filter((image, ind) => {
                      if (index != ind) {
                        return image;
                      }
                    });
                    if (listAux.length == 0) {
                      clearBucket(bucket_gpt_images, fileNames);
                    }
                    setListImages(listAux);
                  }}
                />
                <img src={image} />
              </div>
            ))}
          </div>
        )}
        <div className="chatInput">
          {chatGPT.isVisionEnable && (
            <div className="chatImgInput">
              <label htmlFor="chatImageInput">
                <input
                  type="file"
                  name="chatImageInput"
                  id="chatImageInput"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={async (e) => {
                    const successClearBucket = await clearBucket(
                      bucket_gpt_images,
                      `${fileNames}`
                    );
                    if (successClearBucket) {
                      let listImages = await Promise.all(
                        Array.from(e.target.files).map(async (file, index) => {
                          let imageUrl = await UploadImageAndGetURL(
                            bucket_gpt_images,
                            `${fileNames}/${fileNames}_${index}`,
                            file
                          );
                          return imageUrl + `?d=${new Date().getMilliseconds}`;
                        })
                      );
                      setListImages(listImages);
                    }
                  }}
                />
                <FaImage color="white" size={20} />
              </label>
            </div>
          )}
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="chatBtnSend"
            onClick={async (e) => {
              e.preventDefault();

              let chatScreen = document.querySelector(
                ".chatContent .chatScreen .chatMessages"
              );
              chatScreen.scrollTop = chatScreen.scrollHeight;

              if (input.length == 0) {
                //VALIDAR ENTRADA DE TEXTO
                handleError("Please type a message");
                return;
              }

              if (listImages.length > 0) {
                //VALIDAR LISTA DE IMAGENES
                chatGPT.addMessage({
                  // AÑADIR MENSAJE DE IMAGENES
                  role: "user",
                  type: "image",
                  content: input,
                  images: listImages.map((image) => {
                    return { image_url: image };
                  }),
                });
                chatData.chatHistory.push({ role: "user", content: input });
              } else {
                chatGPT.addMessage({
                  role: "user",
                  type: "text",
                  content: input,
                }); //AÑADIR MENSAJE DE TEXTO
                chatData.chatHistory.push({ role: "user", content: input });
              }

              setChatData({ ...chatData, isAnswering: true }); // MANEJAR RESPUESTA
              setInput("");
              setListImages([]);

              const result = await chatGPT.sendPrompt();
              if (result.status === 200) {
                // TODO CORRECTO
                var resultContent = result.response.choices[0].message.content;
                chatGPT.addMessage({
                  role: "assistant",
                  type: "text",
                  content: resultContent,
                });
                chatData.chatHistory.push({
                  role: "assistant",
                  content: resultContent,
                });
                saveChat(
                  user ? user.id : null,
                  chatGPT.id,
                  chatData.chatHistory,
                  {
                    model: chatGPT.model,
                    context: chatGPT.context,
                  }
                );
              } else {
                // HUBO ERROR
                handleError(result.error.error.code);
              }
              setChatData({ ...chatData, isAnswering: false });
            }}
          >
            Send
          </button>
        </div>
      </div>
    </ChatContainer>
  );
}

export default Chat;

function getCurrentDateTime(date) {
  const now = date;
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0"); // Months start at 0
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hours = String(now.getUTCHours()).padStart(2, "0");
  const minutes = String(now.getUTCMinutes()).padStart(2, "0");
  const seconds = String(now.getUTCSeconds()).padStart(2, "0");
  const milliseconds = String(now.getUTCMilliseconds()).padStart(6, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}+00`;
}

async function saveChat(userId, chatId, chatHistory, { model, context }) {
  const {
    data: { ip },
  } = await axios.get("https://api.ipify.org/?format=json");

  const lastResult = await supabase
    .from(CHAT_TABLE_NAME)
    .select("*")
    .filter("userId", "eq", userId, "chatId", "eq", chatId);

  if (lastResult.data != null && lastResult.data.length > 0) {
    const response = await supabase
      .from(CHAT_TABLE_NAME)
      .update({
        updated_at: getCurrentDateTime(new Date()),
        userId: userId,
        chatId: chatId,
        messages: JSON.stringify(chatHistory),
        ip: ip,
        extra: JSON.stringify({ model: model, context: context }),
      })
      .filter("userId", "eq", userId, "chatId", "eq", chatId)
      .select("*");
  } else {
    const response = await supabase
      .from(CHAT_TABLE_NAME)
      .insert({
        updated_at: getCurrentDateTime(new Date()),
        userId: userId,
        chatId: chatId,
        messages: JSON.stringify(chatHistory),
        ip: ip,
        extra: JSON.stringify({ model: model, context: context }),
      })
      .select("*");
  }
}

const ChatContainer = styled.div`
  margin: 2rem;
  position: relative;
  height: -webkit-fill-available;

  .chatContent {
    display: flex;
    position: absolute;
    flex-direction: column;
    height: 100%;
    width: 100%;

    .chatScreen {
      flex-grow: 20;
      background-color: #484848;
      border-radius: 20px 20px 0px 0px;
      position: relative;
      overflow: hidden;

      .chatMessages {
        overflow-y: scroll;
        overflow-x: hidden;
        padding-right: 17px;
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: inherit;
        box-sizing: content-box;

        .messageItem {
          padding: 1rem;
          color: white;
          display: flex;
          font-family: system-ui;
          width: 100%;

          .messageItemName {
            margin-right: 0.5rem;
            font-weight: bold;
          }

          .messageItemContent {
            flex-grow: 1;
            font-weight: 300;
          }

          &.user {
            background-color: #535353;
          }

          &.assistant {
          }
        }
      }

      .chatError {
        position: absolute;
        bottom: 0px;
        width: 100%;
        background-color: #ff3020;
        padding: 0.7rem;
        color: white;
        font-weight: 500;
      }
    }

    .chatImagesUploaded {
      display: flex;
      column-gap: 1rem;
      overflow: auto;
      flex-grow: 1;
      background-color: #2b2b2b;
      align-items: center;
      justify-content: center;

      .image {
        position: relative;

        svg {
          position: absolute;
          right: 0;

          &:hover {
            cursor: pointer;
          }
        }

        img {
          width: 7rem;
          height: 7rem;
          border-radius: 10px;
        }
      }
    }

    .chatInput {
      flex-grow: 1;
      display: flex;
      background-color: #2b2b2b;
      padding: 0.8rem;
      border-radius: 0px 0px 20px 20px;

      .chatImgInput {
        flex-grow: 1;
        display: flex;
        align-items: center;
        justify-content: center;

        label:hover {
          cursor: pointer;
        }
      }

      input {
        flex-grow: 10;
        background-color: #1b1b1b;
        border-radius: 10px;
        outline: none;
        border: none;
        color: white;
        padding: 0.5rem;
      }

      .chatBtnSend {
        flex-grow: 3;
        background-color: #1b1b1b;
        margin: 0px 0.5rem;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        border: none;

        &:hover {
          cursor: pointer;
        }
      }
    }
  }
`;
