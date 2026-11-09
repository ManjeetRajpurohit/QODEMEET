const parseCookies = (req, res, next) => {
  const header = req.headers.cookie || "";
  const cookies = {};

  for (const part of header.split(";")) {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex < 1) continue;

    const name = part.slice(0, separatorIndex).trim();
    const rawValue = part.slice(separatorIndex + 1).trim();

    if (!name) continue;

    try {
      cookies[name] = decodeURIComponent(rawValue);
    } catch {
      cookies[name] = rawValue;
    }
  }

  req.cookies = cookies;
  next();
};

export default parseCookies;
