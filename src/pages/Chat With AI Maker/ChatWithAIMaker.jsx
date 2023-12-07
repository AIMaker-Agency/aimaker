import React from "react";
import styled from "styled-components";
import Chat from "./components/Chat";

function ChatWithAIMaker() {
  return (
    <ChatContainer>
      <div className="content">
        <Chat />
      </div>
    </ChatContainer>
  );
}

export default ChatWithAIMaker;

const ChatContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  .content {
    background-color: #ffffff99;
    height: 80%;
    width: 80%;
    margin: 10% 10% 10% 10%;
    border-radius: 1.5rem;
  }
`;
