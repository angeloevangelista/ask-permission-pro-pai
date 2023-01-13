import { v4 } from "uuid";

import { icons } from "./icons";

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

  const user = getInformation(permissionError, "user");
  const resource = getInformation(permissionError, "resource");
  const permission = getInformation(permissionError, "permission");

  const permissionRequest: PermissionRequest = {
    user,
    permission,
    resource,
    rawError: permissionError,
  };

  return permissionRequest;
}

function getInformation(
  permissionError: string,
  information: "user" | "resource" | "permission"
) {
  let informationRegexTerm: string;

  switch (information) {
    case "user":
      informationRegexTerm = "User: ";
      break;
    case "resource":
      informationRegexTerm = "on resource: ";
      break;
    case "permission":
      informationRegexTerm = "perform: ";
      break;
  }

  const hasInformation = new RegExp(informationRegexTerm, "gi").test(
    permissionError
  );

  if (!hasInformation) {
    return "---";
  }

  let mutableUserString = permissionError.substring(
    permissionError.indexOf(informationRegexTerm) + informationRegexTerm.length
  );

  const indexOfNextSpace = mutableUserString.indexOf(" ");

  if (indexOfNextSpace !== -1) {
    mutableUserString = mutableUserString.substring(0, indexOfNextSpace);
  }

  return mutableUserString?.trim();
}

function createChatCard(permissionRequest: PermissionRequest) {
  const isUser = !/assumed-role/gi.test(permissionRequest.user);

  const [userIfRole, userIfUsualUser] = permissionRequest.user
    .split("/")
    .slice(-2);

  const awsConsoleUrl = (process.env as any)["AWS_CONSOLE_URL"];

  const iamConsoleUrl = isUser
    ? `${awsConsoleUrl}/iam/home#/users/${userIfUsualUser}`
    : `${awsConsoleUrl}/iamv2/home#/roles/details/${userIfRole}`;

  const chatCard = {
    cardId: v4(),
    card: {
      header: {
        title: "Opa!",
        subtitle: "Descola essa permissão lá pra gente, por favor? 😀",
        imageUrl:
          "https://i.pinimg.com/originals/98/c2/52/98c2527c11394f5b827950a8ecc6f68b.png",
        imageType: "CIRCLE",
        imageAltText: "Avatar for Pede a permissão pro pai",
      },
      sections: [
        {
          header: "Permission info",
          widgets: [
            {
              decoratedText: {
                topLabel: "permission",
                text: permissionRequest.permission,
                startIcon: {
                  iconUrl: `data:image/svg+xml;base64,${icons.shield}`,
                },
              },
            },
            {
              decoratedText: {
                topLabel: "user",
                text: permissionRequest.user,
                startIcon: {
                  iconUrl: `data:image/svg+xml;base64,${icons.user}`,
                },
              },
            },
            {
              decoratedText: {
                topLabel: "resource",
                text: permissionRequest.resource,
                startIcon: {
                  iconUrl: `data:image/svg+xml;base64,${icons.package}`,
                },
              },
            },
          ],
        },
        {
          header: "Raw error",
          collapsible: true,
          uncollapsibleWidgetsCount: 1,
          widgets: [
            {
              textParagraph: {
                text: permissionRequest.rawError,
              },
            },
            {
              textParagraph: {
                text: `\n`,
              },
            },
            {
              buttonList: {
                buttons: [
                  {
                    text: "Go to AWS IAM Dashboard",
                    color: {
                      red: (1 / 255) * 235,
                      green: (1 / 255) * 145,
                      blue: (1 / 255) * 26,
                      alpha: 1,
                    },
                    onClick: {
                      openLink: {
                        url: iamConsoleUrl,
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  };

  return chatCard;
}

export { extractPermissionRequest, createChatCard };
