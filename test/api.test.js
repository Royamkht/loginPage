import { describe, expect, it, beforeEach } from "vitest";
import request from "supertest";
import {
  API_PATHS,
  createApp,
  DEMO_USER,
  getPasswordPolicyViolations,
  PASSWORD_POLICY,
  resetUserStoreForTests,
} from "../src/app.js";

describe("password policy", () => {
  it("requires at least 8 characters", () => {
    const violations = getPasswordPolicyViolations("Ab1");
    expect(violations).toContain(PASSWORD_POLICY.messages.minLength);
  });

  it("requires at least one capital letter", () => {
    const violations = getPasswordPolicyViolations("abcdefg1");
    expect(violations).toContain(PASSWORD_POLICY.messages.uppercase);
  });

  it("requires at least one number", () => {
    const violations = getPasswordPolicyViolations("Abcdefgh");
    expect(violations).toContain(PASSWORD_POLICY.messages.digit);
  });

  it("accepts password that meets all rules", () => {
    expect(getPasswordPolicyViolations("Demo12345")).toEqual([]);
  });
});

describe("API", () => {
  let app;

  beforeEach(() => {
    resetUserStoreForTests();
    app = createApp();
  });

  it("documents exact sign-up and forget-password paths", () => {
    expect(API_PATHS.signUp).toBe("/api/sign-up");
    expect(API_PATHS.forgetPassword).toBe("/api/forget-password");
  });

  it(`GET ${API_PATHS.health} returns ok`, async () => {
    const res = await request(app).get(API_PATHS.health).expect(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it(`POST ${API_PATHS.signUp} creates a user and login succeeds`, async () => {
    await request(app)
      .post(API_PATHS.signUp)
      .send({ username: "newuser", password: "Newuser1" })
      .expect(201);

    const login = await request(app)
      .post(API_PATHS.login)
      .send({ username: "newuser", password: "Newuser1" })
      .expect(200);

    expect(login.body.ok).toBe(true);
    expect(login.body.user).toEqual({ username: "newuser" });
  });

  it(`POST ${API_PATHS.signUp} rejects duplicate username`, async () => {
    await request(app)
      .post(API_PATHS.signUp)
      .send({ username: "other", password: "Otherpass1" })
      .expect(201);

    const res = await request(app)
      .post(API_PATHS.signUp)
      .send({ username: "other", password: "Otherpass2" })
      .expect(400);

    expect(res.body.ok).toBe(false);
    expect(res.body.error).toMatch(/taken/i);
  });

  it(`POST ${API_PATHS.login} succeeds with demo credentials`, async () => {
    const res = await request(app)
      .post(API_PATHS.login)
      .send({
        username: DEMO_USER.username,
        password: DEMO_USER.password,
      })
      .expect(200);

    expect(res.body.ok).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toEqual({ username: DEMO_USER.username });
  });

  it(`POST ${API_PATHS.login} rejects wrong password when format is valid`, async () => {
    const res = await request(app)
      .post(API_PATHS.login)
      .send({ username: DEMO_USER.username, password: "WrongPass1" })
      .expect(401);

    expect(res.body.ok).toBe(false);
    expect(res.body.error).toMatch(/invalid/i);
  });

  it(`POST ${API_PATHS.login} rejects password shorter than 8 characters`, async () => {
    const res = await request(app)
      .post(API_PATHS.login)
      .send({ username: DEMO_USER.username, password: "Ab1" })
      .expect(400);

    expect(res.body.ok).toBe(false);
    expect(res.body.password_errors).toContain(
      PASSWORD_POLICY.messages.minLength,
    );
  });

  it(`POST ${API_PATHS.login} rejects password without capital letter`, async () => {
    const res = await request(app)
      .post(API_PATHS.login)
      .send({ username: DEMO_USER.username, password: "abcdefg1" })
      .expect(400);

    expect(res.body.password_errors).toContain(
      PASSWORD_POLICY.messages.uppercase,
    );
  });

  it(`POST ${API_PATHS.login} rejects password without a number`, async () => {
    const res = await request(app)
      .post(API_PATHS.login)
      .send({ username: DEMO_USER.username, password: "Abcdefgh" })
      .expect(400);

    expect(res.body.password_errors).toContain(PASSWORD_POLICY.messages.digit);
  });

  it(`POST ${API_PATHS.login} validates body`, async () => {
    const res = await request(app).post(API_PATHS.login).send({}).expect(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toBeDefined();
  });

  it(`POST ${API_PATHS.forgetPassword} returns token for existing user`, async () => {
    const res = await request(app)
      .post(API_PATHS.forgetPassword)
      .send({ username: DEMO_USER.username })
      .expect(200);

    expect(res.body.ok).toBe(true);
    expect(typeof res.body.reset_token).toBe("string");
    expect(res.body.reset_token.length).toBeGreaterThan(10);
  });

  it(`POST ${API_PATHS.forgetPassword} omits token when user missing`, async () => {
    const res = await request(app)
      .post(API_PATHS.forgetPassword)
      .send({ username: "nobody_here_zz" })
      .expect(200);

    expect(res.body.ok).toBe(true);
    expect(res.body.reset_token).toBeUndefined();
  });

  it(`POST ${API_PATHS.resetPassword} updates password`, async () => {
    const forgot = await request(app)
      .post(API_PATHS.forgetPassword)
      .send({ username: DEMO_USER.username })
      .expect(200);

    const token = forgot.body.reset_token;
    expect(token).toBeDefined();

    await request(app)
      .post(API_PATHS.resetPassword)
      .send({
        username: DEMO_USER.username,
        token,
        new_password: "Renewed1",
      })
      .expect(200);

    await request(app)
      .post(API_PATHS.login)
      .send({ username: DEMO_USER.username, password: "Renewed1" })
      .expect(200);

    await request(app)
      .post(API_PATHS.login)
      .send({ username: DEMO_USER.username, password: DEMO_USER.password })
      .expect(401);
  });
});
