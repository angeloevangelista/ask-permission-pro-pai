import axios from "axios";
import cors from "cors";
import express from "express";

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

app.post("/api/test", async (request, response) =>
  response.json(extractPermissionRequest(request.body.data))
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
    console.log({ error });
  }

  return response.status(201).send();
});

interface PermissionRequest {
  user: string;
  permission: string;
  resource: string;
  rawError: string;
}

function extractPermissionRequest(
  permissionError: string
): PermissionRequest | undefined {
  if (!permissionError?.trim()) {
    return;
  }

  permissionError = permissionError.replace(/\n/gi, "").trim();

  console.log(
    permissionError.substring(permissionError.indexOf("perform: ") + 9)
  );

  const hasUser = /User: /gi.test(permissionError);

  const user = hasUser
    ? permissionError.substring(
        permissionError.indexOf("User: ") + 6,
        permissionError.indexOf("is not authorized") - 1
      )
    : "---";

  const hasPermission = /perform: /gi.test(permissionError);

  const permission = hasPermission
    ? permissionError.substring(
        permissionError.indexOf("perform: ") + 9,
        permissionError.indexOf("perform: ") +
          9 +
          permissionError
            .substring(permissionError.indexOf("perform: ") + 9)
            .indexOf(" ")
      )
    : "---";

  const hasResource = /on resource/gi.test(permissionError);

  const resource = hasResource
    ? permissionError.substring(
        permissionError.indexOf("on resource: ") + 13,
        permissionError.indexOf("because no identity-based") - 1
      )
    : "---";

  const permissionRequest: PermissionRequest = {
    user,
    permission,
    resource,
    rawError: permissionError,
  };

  return permissionRequest;
}

app.listen(PORT, () =>
  console.log(`server is listening on http://127.0.0.1:${PORT}`)
);
