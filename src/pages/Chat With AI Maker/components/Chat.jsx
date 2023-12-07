import React, { useState } from "react";
import styled from "styled-components";
import { FaImage } from "react-icons/fa6";
import { IoCloseCircle } from "react-icons/io5";
import { GPTChat } from "../../../models/OpenAI/GPT-Completition";

function Chat() {
  var chatGPT = new GPTChat({
    model: "gpt-4-vision-preview",
    isVisionEnable: true,
  });

  const [imgUploaded, setImgUploaded] = useState({
    isImageUploaded: true,
    imageUrl:
      "https://zuhmdhvkxcjlwkzeeqpr.supabase.co/storage/v1/object/public/d-id-pictures/abcb40a7-cb80-4d42-9a19-ee6977059159.jpg",
  });
  return (
    <ChatContainer>
      <div className="chatContent">
        <div className="chatScreen">1</div>
        {imgUploaded.isImageUploaded && (
          <div className="chatImagesUploaded">
            <div className="image">
              <IoCloseCircle
                size={20}
                color="black"
                onClick={(e) => {
                  e.preventDefault();
                  setImgUploaded({ imageUrl: null, isImageUploaded: false });
                }}
              />
              <img src={imgUploaded.imageUrl} />
            </div>
          </div>
        )}
        <div className="chatInput">
          {chatGPT.isVisionEnable && (
            <div className="chatImgInput">
              <FaImage color="white" size={20} />
            </div>
          )}
          <input type="text" />
          <button
            className="chatBtnSend"
            onClick={(e) => {
              e.preventDefault();
              console.log(chatGPT.generatePrompt());
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
    }

    .chatImagesUploaded {
      display: flex;
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

        &:hover {
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
