import { useState } from "react";
import ReactDOM from "react-dom";
import {
  streamQueryV1,
  ApiV1,
  streamQueryV2,
  ApiV2,
} from "@vectara/stream-query-client";

// TODO: Switch back to prod values before merging
const CUSTOMER_ID = "3099635174";
const API_KEY = "zqt_uMCt5uGR7CXARu7QHg7GDYNG5Q5v58HOpvQO0A";
const CORPUS_NAME = "markdown";
const CORPUS_ID = "203";

// const CUSTOMER_ID = "1526022105";
// const API_KEY = "zqt_WvU_2ewh7ZGRwq8LdL2SV8B9RJmVGyUm1VAuOw";
// const CORPUS_NAME = "ofer-bm-moma-docs";
// const CORPUS_ID = "232";

const App = () => {
  const [question, setQuestion] = useState("markdown");
  const [answerV1, setAnswerV1] = useState<string>();
  const [answerV2, setAnswerV2] = useState<string>();
  const [conversationIdV1, setConversationIdV1] = useState<string>();
  const [conversationIdV2, setConversationIdV2] = useState<string>();

  const sendQueryV1 = async () => {
    const configurationOptions: ApiV1.StreamQueryConfig = {
      // Required fields.
      customerId: CUSTOMER_ID,
      corpusIds: [CORPUS_ID],
      apiKey: API_KEY,

      // Optional fields.
      queryValue: question,
      summaryNumResults: 5,
      language: "eng",
      chat: {
        store: true,
        conversationId: conversationIdV1,
      },
      debug: true,
      enableFactualConsistencyScore: true,
      summaryPromptName: "vectara-experimental-summary-ext-2023-12-11-large",
    };

    const onStreamUpdate = (update: ApiV1.StreamUpdate) => {
      console.log("v1", update);
      const { updatedText, details } = update;
      if (details?.chat) {
        setConversationIdV1(details.chat.conversationId);
      }
      setAnswerV1(updatedText);
    };

    streamQueryV1(configurationOptions, onStreamUpdate);
  };

  const sendQueryV2 = async () => {
    const configurationOptions: ApiV2.StreamQueryConfig = {
      customerId: CUSTOMER_ID,
      apiKey: API_KEY,
      query: question,
      corpusKey: `${CORPUS_NAME}_${CORPUS_ID}`,
      search: {
        offset: 0,
        metadataFilter: "",
        limit: 1,
        lexicalInterpolation: 0,
        contextConfiguration: {
          sentencesBefore: 2,
          sentencesAfter: 2,
        },
      },
      generation: {
        maxUsedSearchResults: 5,
        responseLanguage: "eng",
        enableFactualConsistencyScore: true,
        promptName: "vectara-experimental-summary-ext-2023-12-11-large",
      },
      chat: {
        store: true,
        conversationId: conversationIdV2,
      },
    };

    const onStreamUpdate = (update: ApiV2.StreamUpdate) => {
      console.log("v2", update);
      const { updatedText, chatId } = update;
      if (chatId) {
        setConversationIdV2(chatId);
      }

      if (updatedText) {
        setAnswerV2(updatedText);
      }
    };

    streamQueryV2(configurationOptions, onStreamUpdate);
  };

  return (
    <>
      <h2>Question</h2>

      <input value={question} onChange={(e) => setQuestion(e.target.value)} />

      <button
        onClick={() => {
          setAnswerV1("");
          setAnswerV2("");
          sendQueryV1();
          sendQueryV2();
        }}
      >
        Send
      </button>

      <h2>Stream Query Client v1 answer</h2>

      <p>{answerV1}</p>

      <h2>Stream Query Client v2 answer</h2>

      <p>{answerV2}</p>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
