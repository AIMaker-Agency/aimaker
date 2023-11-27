import axios from "axios";

const API_KEY: string = process.env.D_ID_API_KEY ?? "";
const API_TALK_URL: string = "https://api.d-id.com/talks";

interface DIdResponse {
  data?: object;
  error?: { message: string };
}

export async function createTalk(
  type: string,
  picture_url: string,
  input?: string,
  audio_url?: string
): Promise<DIdResponse> {
  var responseTalk: DIdResponse = {};

  if ((type !== "audio" && type !== "text") || !type) {
    return { error: { message: "Please enter valid type" } };
  }

  if (type == "text" && !input) {
    return { error: { message: "Type the input text to speech" } };
  }

  if (type == "audio" && !audio_url) {
    return { error: { message: "Please enter a valid audio source url" } };
  }

  const talkBody =
    type == "audio"
      ? {
          script: {
            type: "audio",
            subtitles: "false",
            ssml: "false",
            audio_url: audio_url,
          },
          config: { fluent: "false", pad_audio: "0.0" },
          source_url: picture_url,
        }
      : {
          script: {
            type: "text",
            subtitles: "false",
            ssml: "false",
            provider: { type: "microsoft", voice_id: "en-US-JennyNeural" },
            input: input,
          },
          config: { fluent: "false", pad_audio: "0.0" },
          source_url: picture_url,
        };

  try {
    const response = await axios.post(API_TALK_URL, JSON.stringify(talkBody), {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: "Basic " + API_KEY,
      },
    });

    const talkId = response.data.id;
    responseTalk.data = { talkId: talkId, status: response.data.status };
  } catch (error) {
    responseTalk.error = { message: error.response.data.description };
  }

  return responseTalk;
}

export async function getTalkVideo(talkId: string): Promise<DIdResponse> {
  var responseTalk: DIdResponse = {};

  const checkStatus = async (): Promise<DIdResponse> => {
    try {
      // Make the API call
      const response = await axios.get(API_TALK_URL + "/" + talkId, {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: "Basic " + API_KEY,
        },
      });

      if (response.data.status === "done") {
        // Fetch the result when done
        try {
          const res = await fetch(response.data.result_url, { mode: "cors" });
          const blobFile = await res.blob();
          let videoFile = new File([blobFile], "video_profile.mp4", {
            type: "video/mp4",
          });

          responseTalk = { data: { file: videoFile }, error: undefined };
          return responseTalk;
        } catch (error) {
          responseTalk = { data: undefined, error: error };
          return responseTalk;
        }
      } else {
        // Wait for 2 seconds before trying again
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return checkStatus();
      }
    } catch (err) {
      responseTalk.error = { message: err.response.data.description };
      return responseTalk;
    }
  };

  return checkStatus();
}
