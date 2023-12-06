import axios from "axios";

const API_KEY: string = import.meta.env.VITE_D_ID_API_KEY;
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
          config: { fluent: "false", pad_audio: "0.0", stitch: true },
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
          config: { fluent: "false", pad_audio: "0.0", stitch: true },
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
  } catch (error: any) {
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
          const video = await getVideoFile(response.data.result_url);

          responseTalk = {
            data: { file: video, result_url: response.data.result_url },
            error: undefined,
          };
          return responseTalk;
        } catch (error: any) {
          responseTalk = { data: undefined, error: error };
          return responseTalk;
        }
      } else {
        // Wait for 2 seconds before trying again
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return checkStatus();
      }
    } catch (err: any) {
      responseTalk.error = { message: err.response.data.description };
      return responseTalk;
    }
  };

  return checkStatus();
}

export async function getVideoFile(url: string): Promise<any> {
  const res = await fetch(
    url.replace("https://d-id-talks-prod.s3.us-west-2.amazonaws.com", "/api")
  );
  const blobFile = await res.blob();
  let videoFile = new File([blobFile], "video_profile.mp4", {
    type: "video/mp4",
  });
  return videoFile;
}
