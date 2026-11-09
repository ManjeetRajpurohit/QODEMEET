// Must run after userAuth (needs req.user). Blocks any action that
// should only ever be performed by an interviewer account - right
// now that's just scheduling, since it's the one endpoint that
// creates data rather than acting on an interview the caller is
// already a verified participant of.
const requireInterviewer = (req, res, next) => {
  if (req.user?.role !== "interviewer") {
    return res.status(403).json({
      success: false,
      message: "Only interviewer accounts can do this",
    });
  }

  next();
};

export default requireInterviewer;
