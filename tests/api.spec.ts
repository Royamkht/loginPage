import { expect } from '@playwright/test';
import { test } from '../utils/fixtures';
import { randomSignupUsername } from '../api-test.config';

test.describe('Login API', () => {
    test('login by valid email and password!', async ({ api, config }) => {
        const response = await api
            .path('login')
            .body({ username: config.userName, password: config.Passsword })
            .postRequest(200)
        const getToken = response.ok
        const username = response.user.username
        expect(getToken === true).toBeTruthy()
        console.log("welcome", username)
    })

    test('login by invalid password (less than 8 characters)', async ({ api, config }) => {
        const response = await api
            .path('login')
            .body({ username: config.userName, password: "123" })
            .postRequest(400)
        const getToken = response.ok
        const error = response.error
        const passwordErrors = response.password_errors
        expect(passwordErrors).toEqual(
            expect.arrayContaining([
                'password must be at least 8 characters',
                'password must include at least one capital letter',
            ]),
        )
        console.log("password errors:", passwordErrors)
        expect(getToken === false).toBeTruthy()
        expect(error).toBe("password does not meet requirements")
        console.log("error message:", error)
    })
    test('login by invalid username (less than 8 characters with capital letter and number)', async ({ api, config }) => {
        const response = await api
            .path('login')
            .body({ username: config.userName, password: "123Dghj" })
            .postRequest(400)
        const getToken = response.ok
        const error = response.error
        const passwordErrors = response.password_errors
        expect(passwordErrors).toEqual(
            expect.arrayContaining([

                'password must be at least 8 characters',
            ]),
        )
        console.log("password errors:", passwordErrors)
        expect(getToken === false).toBeTruthy()
        expect(error).toBe("password does not meet requirements")
        console.log("error message:", error)
    })

    test('login by invalid username (without capital letter)', async ({ api, config }) => {
        const response = await api
            .path('login')
            .body({ username: config.userName, password: "dddd" })
            .postRequest(400)
        const getToken = response.ok
        const error = response.error
        const passwordErrors = response.password_errors
        expect(passwordErrors).toEqual(
            expect.arrayContaining([
                'password must include at least one capital letter'
            ]),
        )
        console.log("password errors:", passwordErrors)
        expect(getToken === false).toBeTruthy()
        expect(error).toBe("password does not meet requirements")
        console.log("error message:", error)
    })

    test('login by invalid username (without number)', async ({ api, config }) => {
        const response = await api
            .path('login')
            .body({ username: config.userName, password: "qwertyui" })
            .postRequest(400)
        const getToken = response.ok
        const error = response.error
        const passwordErrors = response.password_errors
        expect(passwordErrors).toEqual(
            expect.arrayContaining([
                'password must include at least one number'
            ]),
        )
        console.log("password errors:", passwordErrors)
        expect(getToken === false).toBeTruthy()
        expect(error).toBe("password does not meet requirements")
        console.log("error message:", error)
    })


});

test.describe('Signup API', () => {

    // Duplicate username is enforced in the API (user_store.registerUser), not only in the UI.
    // signup.html uses fetch → JSON; auth_common.errorMessageFromResponse displays data.error — same field.
    test('signup by existing username!', async ({ api, signupConfig, config }) => {
        const response = await api
            .path('sign-up')
            .body({ username: config.userName, password: signupConfig.password })
            .postRequest(400)

        const errorMessage = response.error as string
        expect(response).toMatchObject({
            ok: false,
            error: 'username is already taken',
        })
        expect(errorMessage).toBe('username is already taken')
    })

    test('signup by valid username and password', async ({ api, signupConfig }) => {
        const newUser = randomSignupUsername()
        const response = await api
            .path('sign-up')
            .body({ username: newUser, password: signupConfig.password })
            .postRequest(201)
        const getToken = response.ok
        const username = response.user.username
        expect(getToken === true).toBeTruthy()
        console.log("welcome", username)
    })


    test('signup by invalid password (less than 8 characters)', async ({ api, signupConfig }) => {
        const response = await api
            .path('sign-up')
            .body({ username: randomSignupUsername(), password: "123" })
            .postRequest(400)
        const getToken = response.ok
        const error = response.error
        const passwordErrors = response.password_errors
        expect(passwordErrors).toEqual(
            expect.arrayContaining([
                'password must be at least 8 characters',
                'password must include at least one capital letter',
            ]),
        )
        console.log("password errors:", passwordErrors)
        expect(getToken === false).toBeTruthy()
        expect(error).toBe("password does not meet requirements")
        console.log("error message:", error)
    })

    test('signup by invalid username (less than 8 characters with capital letter and number)', async ({ api, signupConfig }) => {
        const response = await api
            .path('sign-up')
            .body({ username: randomSignupUsername(), password: "123dDfg" })
            .postRequest(400)
        const getToken = response.ok
        const error = response.error
        const passwordErrors = response.password_errors
        expect(passwordErrors).toEqual(
            expect.arrayContaining([
                'password must be at least 8 characters',
            ]),
        )
        console.log("password errors:", passwordErrors)
        expect(getToken === false).toBeTruthy()
        expect(error).toBe("password does not meet requirements")
        console.log("error message:", error)
    })
    test('signup by invalid username (without capital letter)', async ({ api, signupConfig }) => {
        const response = await api
            .path('sign-up')
            .body({ username: randomSignupUsername(), password: "123dfghj" })
            .postRequest(400)
        const getToken = response.ok
        const error = response.error
        const passwordErrors = response.password_errors
        expect(passwordErrors).toEqual(
            expect.arrayContaining([
                'password must include at least one capital letter',
            ]),
        )
        console.log("password errors:", passwordErrors)
        expect(getToken === false).toBeTruthy()
        expect(error).toBe("password does not meet requirements")
        console.log("error message:", error)
    })
    test('signup by invalid username (without number)', async ({ api, signupConfig }) => {
        const response = await api
            .path('sign-up')
            .body({ username: randomSignupUsername(), password: "Qwertyui" })
            .postRequest(400)
        const getToken = response.ok
        const error = response.error
        const passwordErrors = response.password_errors
        expect(passwordErrors).toEqual(
            expect.arrayContaining([
                'password must include at least one number',
            ]),
        )
        console.log("password errors:", passwordErrors)
        expect(getToken === false).toBeTruthy()
        expect(error).toBe("password does not meet requirements")
        console.log("error message:", error)
    })

})
test.describe('forgot password API', () => {
    test('forgot password with existing username', async ({ api, config }) => {
        const response = await api
            .path('forget-password')
            .body({ username: config.userName })
            .postRequest(200)
        const token = response.ok
        const reset_token = response.reset_token
        const new_password = "Aa123456h"
        expect(token === true).toBeTruthy()

        const response2 = await api
            .path('reset-password')
            .body({ username: config.userName, new_password: new_password, token: reset_token })
            .postRequest(200)
        const token2 = response2.ok
        expect(token2 === true).toBeTruthy()
    })

    test('forgot password with unknown username', async ({ api }) => {
        const response = await api
            .path('forget-password')
            .body({ username: randomSignupUsername() })
            .postRequest(404)
        expect(response.ok).toBe(false)
        expect(response.error).toBe('Your username is unknown.')
    })
    test('forgot password with empty username,token and new_password', async ({ api, config }) => {
        const response = await api
            .path('forget-password')
            .body({ username: config.userName })
            .postRequest(200)
        expect(response.ok).toBe(true)
        const reset_token = response.reset_token
        const response2 = await api
            .path('forget-password')
            .body({ username: "", token: reset_token, new_password: "Aa123456k" })
            .postRequest(400)
        expect(response2.ok).toBe(false)
        expect(response2.error).toBe("username is required")
    })

    test('forgot password with invalid token', async ({ api, config }) => {
        const response = await api
            .path('forget-password')
            .body({ username: config.userName })
            .postRequest(200)
        expect(response.ok).toBe(true)
        const response2 = await api
            .path('reset-password')
            .body({ username: config.userName, new_password: "Aa123456h", token: "invalid_token" })
            .postRequest(400)
        expect(response2.ok).toBe(false)
        expect(response2.error).toBe("invalid or expired reset token")
    })
    test('forgot password with expired token', async ({ api, config }) => {
        const response = await api
            .path('forget-password')
            .body({ username: config.userName })
            .postRequest(200)
        expect(response.ok).toBe(true)
        const response2 = await api
            .path('reset-password')
            .body({ username: config.userName, new_password: "Aa123456h", token: "invalid_token" })
            .postRequest(400)
        expect(response2.ok).toBe(false)
        expect(response2.error).toBe("invalid or expired reset token")
    })
    test('forgot password with invalid new_password', async ({ api, config }) => {
        const response = await api
            .path('forget-password')
            .body({ username: config.userName })
            .postRequest(200)
        expect(response.ok).toBe(true)
        const response2 = await api
            .path('reset-password')
            .body({ username: config.userName, new_password: "12345678", token: response.reset_token })
            .postRequest(400)
        expect(response2.ok).toBe(false)
        expect(response2.error).toBe("password does not meet requirements")
        const passwordErrors = response2.password_errors
        expect(passwordErrors).toEqual(
            expect.arrayContaining([

                'password must include at least one capital letter',

            ]),
        )

    })

    test('change password to default', async ({ api, config }) => {
        const response = await api
            .path('forget-password')
            .body({ username: config.userName })
            .postRequest(200)
        expect(response.ok).toBe(true)
        const reset_token = response.reset_token
        const response2 = await api
            .path('reset-password')
            .body({ username: config.userName, new_password: "Demo12345", token: reset_token })
            .postRequest(200)
        expect(response2.ok).toBe(true)
        const response3 = await api
            .path('login')
            .body({ username: config.userName, password: "Demo12345" })
            .postRequest(200)
        expect(response3.ok).toBe(true)
    })

})