import React, { useEffect, useState } from "react";
import HomeNavBar from "../../components/Home-navbar";
import { Route, Routes, useNavigate, useSearchParams } from "react-router-dom";
import Home from "./Pages/Home/Home";
import Imagine from "./Pages/Imagine/Imagine";
import SocialContract from "./Pages/SocialContract/SocialContract";
import Members from "./Pages/Members/Members";
import Ido2020 from "./Pages/IDO2020/Ido2020";
import Modal from "../../components/Modal";
import { getSupabaseAdmin } from "../../models/supabase";

const supabaseAdmin = getSupabaseAdmin();

function Homepage() {
  const navigate = useNavigate();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const [modalShowing, setModalShowing] = useState(false);
  const [passwordData, setPasswordData] = useState({
    pass: "",
    confirmPass: "",
    error: false,
    errorMessage: "",
  });
  const [buttonData, setButtonData] = useState({
    enable: true,
    text: "Change",
  });

  useEffect(() => {
    const fetchData = async () => {
      setModalShowing(
        urlSearchParams.get("isinvited") == "true" &&
          (await supabaseAdmin.auth.getSession()).data.session != null
      );
    };

    fetchData();
  }, []);

  return (
    <>
      {modalShowing ? (
        <Modal
          title={"Change password"}
          handleShow={() => {
            setModalShowing(false);
          }}
        >
          <p>Please, set your new password to your account in AI Maker</p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "1rem",
              rowGap: ".5rem",
              alignItems: "center",
            }}
          >
            {passwordData.error && (
              <div className="change-pass-message-error">
                {passwordData.errorMessage}
              </div>
            )}
            <input
              type="password"
              placeholder="Password"
              className="text-input"
              onFocus={(e) => {
                setPasswordData({ ...passwordData, error: false });
              }}
              onChange={(e) => {
                setPasswordData({ ...passwordData, pass: e.target.value });
              }}
            ></input>
            <input
              type="password"
              placeholder="Confirm password"
              className="text-input"
              onFocus={(e) => {
                setPasswordData({ ...passwordData, error: false });
              }}
              onChange={(e) => {
                setPasswordData({
                  ...passwordData,
                  confirmPass: e.target.value,
                });
              }}
            ></input>
            <button
              className="button-1"
              disabled={!buttonData.enable}
              onClick={(e) => {
                e.preventDefault();
                if (passwordData.pass == "" || passwordData.confirmPass == "") {
                  setPasswordData({
                    ...passwordData,
                    error: true,
                    errorMessage: "Please fill all fields",
                  });
                  return;
                }

                if (passwordData.pass != passwordData.confirmPass) {
                  setPasswordData({
                    ...passwordData,
                    error: true,
                    errorMessage: "The passwords don't match",
                  });
                  return;
                }

                setButtonData({ enable: false, text: "Loading..." });
                supabaseAdmin.auth
                  .updateUser({
                    password: passwordData.pass,
                  })
                  .then((userResponse) => {
                    setButtonData({ enable: true, text: "Change" });
                    setModalShowing(false);
                    navigate("/home/");
                  });
              }}
            >
              {buttonData.text}
            </button>
          </div>
        </Modal>
      ) : (
        <></>
      )}
      <div className="home">
        <div className="home-title">AI Maker</div>
        <HomeNavBar />
        <div className="home-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/imagine" element={<Imagine />} />
            <Route path="/ido2020" element={<Ido2020 />} />
            <Route path="/social-contract" element={<SocialContract />} />
            <Route path="/members" element={<Members />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default Homepage;
