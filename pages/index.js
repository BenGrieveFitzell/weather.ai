import { useState, useEffect } from "react";
import Head from "next/head";
import { BsSend, BsSun } from "react-icons/bs";
import Header from "../components/Header";

export default function Home() {
  const [weatherData, setWeatherData] = useState(null);
  const [keywordResult, setKeywordResult] = useState(null);
  const [promptInput, setPromptInput] = useState("");
  const [finalResult, setFinalResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmitPrompt(event) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: promptInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }

      setKeywordResult(data.keywordResult);

      fetch(
        `https://api.weatherapi.com/v1/current.json?key=f8529668dbd24c048a4202553230604&q=${keywordResult}&aqi=no`
      )
        .then((response) => response.json())
        .then((data) => {
          setWeatherData(data);
          console.log(weatherData);

          if (data.current && data.location) {
            return fetch("/api/generate", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ weatherData: data, prompt: promptInput }),
            });
          } else {
            throw new Error("Invalid weather data");
          }
        })
        .then((response) => response.json())
        .then((data) => {
          if (data.finalResult) {
            setFinalResult(data.finalResult);
          } else {
            throw new Error("Invalid response from API");
          }
        })
        .catch((error) => {
          console.error(error);
          alert(error.message);
        });

      setLoading(false);
      setPromptInput("");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-white h-full flex flex-col justify-between">
        <Header />

        <div className="flex-1 p-4 overflow-y-auto">
          {!finalResult && (
            <div>
              <div className="flex justify-center items-center space-x-3">
                <BsSun className="w-6 h-6" />
                <h2 className="text-2xl">Examples</h2>
              </div>
              <div className="grid gap-y-5 mt-5 md:grid-cols-2 lg:grid-cols-3 md:justify-items-center">
                <div className="bg-gray-100 hover:shadow-md rounded-md md:w-[250px]">
                  <p
                    className="p-4 text-center cursor-pointer"
                    onClick={() =>
                      setPromptInput(
                        "Is it a good time to go fishing in Florida?"
                      )
                    }
                  >
                    "Is it a good time to go fishing in Florida?"
                  </p>
                </div>
                <div className="bg-gray-100 hover:shadow-md rounded-md md:w-[250px]">
                  <p
                    className="p-4 text-center cursor-pointer"
                    onClick={() =>
                      setPromptInput(
                        "Will it be muddy running in Yosemite national park?"
                      )
                    }
                  >
                    "Will it be muddy running in Yosemite national park?"
                  </p>
                </div>
                <div className="bg-gray-100 hover:shadow-md rounded-md md:w-[250px]">
                  <p
                    className="p-4 text-center cursor-pointer"
                    onClick={() =>
                      setPromptInput(
                        "Is the weather okay to play football in north London?"
                      )
                    }
                  >
                    "Is the weather okay to play football in north London?"
                  </p>
                </div>
              </div>
            </div>
          )}
          {finalResult && (
            <div className="my-4 py-2 px-4 bg-gray-100 rounded-lg text-gray-800">
              {finalResult}
            </div>
          )}
        </div>

        <form
          onSubmit={onSubmitPrompt}
          className="flex items-center bg-gray-100 px-4 py-2 fixed bottom-0 w-full"
        >
          <input
            type="text"
            name="prompt"
            placeholder="Ask any weather related question!"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            className="flex-1 text-gray-800 bg-gray-200 rounded-lg py-2 px-4 mr-2 focus:outline-none"
          />
          <button type="submit" className="text-xl text-gray-800">
            {loading ? <p>...</p> : <BsSend />}
          </button>
        </form>
      </main>
    </>
  );
}
