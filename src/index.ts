import axios from "axios";
import cors from "cors";
import express from "express";

import { extractPermissionRequest, createChatCard } from "./functions";

const PORT = process.env.PORT || 3333;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/", express.static("static"));

app.get("/api/health", (_, response) =>
  response.json({
    message: "healthy",
    timestamp: new Date().toISOString(),
  })
);

app.post("/api/aws-permission", async (request, response) => {
  try {
    const permission = extractPermissionRequest(request.body.data);

    if (!permission) {
      return response.status(400).send();
    }

    const message = [
      "*Opa!* Você pode me dar essa permissão abaixo, por favor?",
      "",
      `          *Permission*: ${permission.permission}`,
      `          *Resource*: ${permission.resource}`,
      `          *User*: ${permission.user}`,
      "",
      `*Raw error*: \`\`\`${permission.rawError}\`\`\``,
    ].join("\n");

    const apiResponse = await axios.post((process.env as any)["WEBHOOK_URL"], {
      text: message,
    });

    console.log({ apiResponse });
  } catch (error) {
    console.dir({ error }, { depth: null });
  }

  return response.status(201).send();
});

app.post("/api/v2/aws-permission", async (request, response) => {
  try {
    const permission = extractPermissionRequest(request.body.data);

    if (!permission) {
      return response.status(400).send();
    }

    const apiResponse = await axios.post((process.env as any)["WEBHOOK_URL"], {
      cardsV2: [createChatCard(permission)],
    });

    console.log({ apiResponse });
  } catch (error) {
    console.dir({ error }, { depth: null });
  }

  return response.status(201).send();
});

app.listen(PORT, () =>
  console.log(`server is listening on http://127.0.0.1:${PORT}`)
);
