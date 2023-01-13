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

  const user = getInformation(permissionError, 'user');
  const resource = getInformation(permissionError, 'resource');
  const permission = getInformation(permissionError, 'permission');

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

export { extractPermissionRequest };
