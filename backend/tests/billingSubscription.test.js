
import test from "node:test";
import assert from "node:assert/strict";

import applySubscription from "../utils/applySubscription.js";

const makeUser = (overrides = {}) => ({
  subscriptionPlan: "Free",
  subscriptionExpiry: null,
  interviewsUsed: 0,
  billingCycleStart: null,
  upcomingPlan: null,
  upcomingPlanExpiry: null,
  ...overrides,
});

test("activates Pro subscription for a Free user", () => {
  const now = new Date("2026-11-12T10:00:00.000Z");
  const user = makeUser({ interviewsUsed: 5 });

  applySubscription(user, { plan: "Pro" }, now);

  assert.equal(user.subscriptionPlan, "Pro");
  assert.equal(
    user.subscriptionExpiry.toISOString(),
    "2026-12-12T10:00:00.000Z"
  );
  assert.equal(user.interviewsUsed, 0);
  assert.equal(user.billingCycleStart, now);
});

test("extends an active subscription of the same plan", () => {
  const now = new Date("2026-11-12T10:00:00.000Z");
  const existingExpiry = new Date("2026-12-12T10:00:00.000Z");

  const user = makeUser({
    subscriptionPlan: "Pro",
    subscriptionExpiry: existingExpiry,
    interviewsUsed: 3,
  });

  applySubscription(user, { plan: "Pro" }, now);

  assert.equal(user.subscriptionPlan, "Pro");
  assert.equal(
    user.upcomingPlanExpiry.toISOString(),
    "2027-01-11T10:00:00.000Z"
  );
  assert.equal(user.interviewsUsed, 3);
});

test("activates Annual for an expired subscription", () => {
  const now = new Date("2026-11-12T10:00:00.000Z");

  const user = makeUser({
    subscriptionPlan: "Enterprise",
    subscriptionExpiry: new Date("2026-11-01T10:00:00.000Z"),
    interviewsUsed: 8,
  });

  applySubscription(user, { plan: "Annual" }, now);

  assert.equal(user.subscriptionPlan, "Annual");
  assert.equal(
    user.subscriptionExpiry.toISOString(),
    "2027-11-12T10:00:00.000Z"
  );
  assert.equal(user.interviewsUsed, 0);
});

test("rejects an unsupported subscription plan", () => {
  const user = makeUser();

  assert.throws(
    () => applySubscription(user, { plan: "Gold" }),
    /Invalid subscription duration/
  );
});

test("rejects missing user or bill", () => {
  assert.throws(
    () => applySubscription(null, { plan: "Pro" }),
    /User and bill are required/
  );

  assert.throws(
    () => applySubscription(makeUser(), null),
    /User and bill are required/
  );
});
