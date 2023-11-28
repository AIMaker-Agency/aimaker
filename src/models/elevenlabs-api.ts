import axios from "axios";

const API_KEY: string = import.meta.env.VITE_ELEVENLABS_API_KEY ?? "";
const API_ADD_VOICE: string = "https://api.elevenlabs.io/v1/voices/add";
const API_TEXT_TO_SPEECH: string =
  "https://api.elevenlabs.io/v1/text-to-speech/";

interface ElevenLabsResponse {
  data?: object;
  error?: { message: string };
}

export async function addVoice(
  voiceName: string,
  voiceDescription: string,
  voiceUrl: string
): Promise<ElevenLabsResponse> {
  var responseVoice: ElevenLabsResponse = {};

  var audioBlob = await axios.get(voiceUrl, {
    responseType: "blob",
  });
  var audioFile = new File([audioBlob.data], "audiofile.m4a");

  var elevenLabsBody = new FormData();
  elevenLabsBody.append("name", voiceName);
  elevenLabsBody.append("description", voiceDescription);
  elevenLabsBody.append("files", audioFile);

  try {
    const response = await axios.post(API_ADD_VOICE, elevenLabsBody, {
      headers: {
        accept: "application/json",
        "xi-api-key": API_KEY,
        "Content-Type": "multipart/form-data",
      },
    });

    responseVoice.data = { voiceId: response.data.voice_id };
  } catch (error: any) {
    responseVoice.error = { message: error.response.data.detail.message };
  }

  return responseVoice;
}

export async function textToSpeech(
  inputText: string,
  voiceId: string
): Promise<ElevenLabsResponse> {
  var responseTextToSpeech: ElevenLabsResponse = {};

  const textToSpeechBody = {
    text: inputText,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.5,
    },
  };

  const textToSpeechUrl = API_TEXT_TO_SPEECH + voiceId + "/stream";

  try {
    const response = await axios.post(
      textToSpeechUrl,
      JSON.stringify(textToSpeechBody),
      {
        headers: {
          "xi-api-key": API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        responseType: "blob",
      }
    );

    const audioFile = new File([response.data], "audio.mp3", {
      type: "audio/mpeg",
    });

    responseTextToSpeech.data = { file: audioFile };
  } catch (error: any) {
    responseTextToSpeech.error = error;
  }

  return responseTextToSpeech;
}
