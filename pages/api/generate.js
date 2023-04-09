import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message:
          "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
    return;
  }

  const weatherData = req.body.weatherData || "";
  const prompt = req.body.prompt || "";

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(weatherData, prompt),
      max_tokens: 2024,
      temperature: 0.9,
    });
    res.status(200).json({ finalResult: completion.data.choices[0].text });
  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
      ``;
    }
  }
}

function generatePrompt(weatherData, prompt) {
  const formattedWeatherData = JSON.stringify(weatherData);
  return `"${prompt}", here is the weather data for the location mentioned: ${formattedWeatherData}
    `;
}
