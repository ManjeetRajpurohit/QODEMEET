import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

test("user schema stores a non-negative token version", () => {
  const path = userModel.schema.path("tokenVersion");
  assert.ok(path, "tokenVersion must be a schema path");
  assert.equal(path.defaultValue, 0);
  assert.equal(path.options.min, 0);
});

test("user schema only permits candidate and interviewer roles", () => {
  const rolePath = userModel.schema.path("role");
  assert.deepEqual(rolePath.enumValues, ["candidate", "interviewer"]);
});

test("session JWT carries a version and uses HS256", () => {
  const secret = "test-only-secret";
  const token = jwt.sign(
    { id: "507f1f77bcf86cd799439011", tokenVersion: 3 },
    secret,
    { algorithm: "HS256", expiresIn: "7d" }
  );
  const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });
  assert.equal(decoded.tokenVersion, 3);
  assert.equal(decoded.id, "507f1f77bcf86cd799439011");
});

test("password reset secrets are excluded from normal user queries", () => {
  for (const field of [
    "passwordResetOtp",
    "passwordResetOtpExpiry",
    "passwordResetAttempts",
    "passwordResetTokenHash",
    "passwordResetTokenExpiry",
  ]) {
    assert.equal(userModel.schema.path(field).options.select, false);
  }
});
