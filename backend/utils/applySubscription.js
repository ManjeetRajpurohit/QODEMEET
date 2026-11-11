
const PLAN_DURATION = Object.freeze({
  Pro: 30,
  Enterprise: 30,
  Annual: 365,
});

const applySubscription = (user, bill, now = new Date()) => {
  if (!user || !bill) {
    throw new Error("User and bill are required");
  }

  const durationDays = PLAN_DURATION[bill.plan];

  if (!durationDays) {
    throw new Error("Invalid subscription duration");
  }

  const expiryDate = new Date(
    now.getTime() + durationDays * 24 * 60 * 60 * 1000
  );

  const isExpired =
    !user.subscriptionExpiry ||
    user.subscriptionExpiry < now;

  if (user.subscriptionPlan === "Free" || isExpired) {
    user.subscriptionPlan = bill.plan;
    user.subscriptionExpiry = expiryDate;
    user.interviewsUsed = 0;
    user.billingCycleStart = now;
    user.upcomingPlan = null;
    user.upcomingPlanExpiry = null;
  } else if (user.subscriptionPlan === bill.plan) {
    user.upcomingPlan = bill.plan;
    user.upcomingPlanExpiry = new Date(
      user.subscriptionExpiry.getTime() +
        durationDays * 24 * 60 * 60 * 1000
    );
  } else {
    user.subscriptionPlan = bill.plan;
    user.subscriptionExpiry = expiryDate;
    user.interviewsUsed = 0;
    user.billingCycleStart = now;
    user.upcomingPlan = null;
    user.upcomingPlanExpiry = null;
  }

  return user;
};

export default applySubscription;
