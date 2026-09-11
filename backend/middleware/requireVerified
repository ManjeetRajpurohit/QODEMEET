// Must run after userAuth (needs req.user). Blocks any action that
// requires a confirmed, deliverable email address.
const requireVerified = (req, res, next) => {
  if (!req.user?.isVerified) {
    return res.status(403).json({
      success: false,
      notVerified: true,
      message: "Please verify your account from your profile page first",
    });
  }

  next();
};

export default requireVerified;
