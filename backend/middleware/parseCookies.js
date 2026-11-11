
const parseCookies = (req, res, next) => {
  const header = req.headers.cookie || "";

  const cookies = Object.create(null);
  const duplicates = new Set();

  for (const part of header.split(";")) {
    const separatorIndex = part.indexOf("=");

    if (separatorIndex < 1) continue;

    const name = part.slice(0, separatorIndex).trim();
    const rawValue = part.slice(separatorIndex + 1).trim();

    // Validate cookie name
    if (!/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(name)) {
      continue;
    }

    // Reject duplicate cookie names
    if (Object.hasOwn(cookies, name)) {
      delete cookies[name];
      duplicates.add(name);
      continue;
    }

    if (duplicates.has(name)) {
      continue;
    }

    // Decode cookie value safely
    try {
      cookies[name] = decodeURIComponent(rawValue);
    } catch {
      cookies[name] = rawValue;
    }
  }

  req.cookies = cookies;

  return next();
};

export default parseCookies;
