import { expect } from '../utils/custom-expect';
import { test } from '../utils/fixtures';
import { randomSignupUsername } from '../api-test.config';

type negative_password_case = {
    title: string
    password: string
    error: string
    error_messages: string[]
}

const negative_password_cases: negative_password_case[] = [
    {
        title: 'invalid password (less than 8 characters)',
        password: '123',
        error: 'password does not meet requirements',
        error_messages: [
            'password must be at least 8 characters',
            'password must include at least one capital letter',
        ],
    },
    {
        title: 'invalid password (less than 8 characters with capital letter and number)',
        password: '123Dghj',
        error: 'password does not meet requirements',
        error_messages: ['password must be at least 8 characters'],
    },
    {
        title: 'invalid password (without capital letter)',
        password: 'dddd',
        error: 'password does not meet requirements',
        error_messages: ['password must include at least one capital letter'],
    },
    {
        title: 'invalid password (without number)',
        password: 'qwertyui',
        error: 'password does not meet requirements',
        error_messages: ['password must include at least one number'],
    },  
]


test.describe('Login API', () => {
    test('login by valid email and password!', async ({ api, config }) => {
        const response = await api
            .path('login')
            .body({ username: config.userName, password: config.Passsword })
            .postRequest(200)
        await expect(response).toMatchSchema('Login', 'POST-login')
        const getToken = response.ok        
        expect(getToken === true).toBeTruthy()
    })

    test.describe('login API negative test', () => {
        negative_password_cases.forEach(({ title, password, error, error_messages }) => {
            test(title, async ({ api, config }) => {
                const response = await api
                    .path('login')
           .body({ username: config.userName, password })
                    .postRequest(400)

                const getToken = response.ok
                const response_error = response.error
                const password_errors = response.password_errors
                expect(password_errors).toEqual(expect.arrayContaining(error_messages))
                console.log('password errors:', password_errors)
                expect(getToken === false).toBeTruthy()
                expect(response_error).toBe(error)
                console.log('error message:', response_error)
            })
        })
    })
})

test.describe('signup API', () => {

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
        await expect(response).toMatchSchema('sign-up', 'POST-sign-up')
        const getToken = response.ok
        const username = response.user.username
        expect(getToken === true).toBeTruthy()
        console.log("welcome", username)
    })

});
    test.describe('signup API negative test', () => {
        negative_password_cases.forEach(({title, password, error, error_messages}) => {
            test(title, async ({ api, signupConfig }) => {
                const response = await api
                    .path('sign-up')
                    .body({ username: randomSignupUsername(), password: password })
                    .postRequest(400)

                const getToken = response.ok
                const response_error = response.error
                const password_errors = response.password_errors
                expect(password_errors).toEqual(expect.arrayContaining(error_messages))
                console.log('password errors:', password_errors)
                expect(getToken === false).toBeTruthy()
                expect(response_error).toBe(error)
                console.log('error message:', response_error)
            })
        })
    })

test.describe('forgot password API', () => {
    test('forgot password with existing username', async ({ api, config }) => {
        const response = await api
            .path('forget-password')
            .body({ username: config.userName })
            .postRequest(200)
        await expect(response).toMatchSchema('forget-password', 'POST-forget-password')
        const token = response.ok
        const reset_token = response.reset_token
        const new_password = "Aa123456h"
        expect(token === true).toBeTruthy()

        const response2 = await api
            .path('reset-password')
            .body({ username: config.userName, new_password: new_password, token: reset_token })
            .postRequest(200)
        await expect(response2).toMatchSchema('reset-password', 'POST-reset-password')
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
        await expect(response).toMatchSchema('forget-password', 'POST-forget-password')
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
        await expect(response).toMatchSchema('forget-password', 'POST-forget-password')
        expect(response.ok).toBe(true)
        const response2 = await api
            .path('reset-password')
            .body({ username: config.userName, new_password: "Aa123456h", token: "invalid_token" })
            .postRequest(400)
        expect(response2.ok).toBe(false)
        expect(response2.error).toBe("invalid or expired reset token")
    })

    test.describe('forget password API negative test', () => {
        negative_password_cases.forEach(({title, password, error, error_messages}) => {
            test(title, async ({ api, config }) => {
                const response = await api
                    .path('forget-password')
                    .body({ username: config.userName })
                    .postRequest(200)
                await expect(response).toMatchSchema('forget-password', 'POST-forget-password')
                expect(response.ok).toBe(true)
                const response2 = await api
                    .path('reset-password')
                    .body({ username: config.userName, new_password: password, token: response.reset_token })
                    .postRequest(400)
                expect(response2.ok).toBe(false)
                expect(response2.error).toBe(error)
                const passwordErrors = response2.password_errors
                expect(passwordErrors).toEqual(expect.arrayContaining(error_messages))
                console.log('password errors:', passwordErrors)
            })
        })
    })
   
    test('change password to default', async ({ api, config }) => {
        const response = await api
            .path('forget-password')
            .body({ username: config.userName })
            .postRequest(200)
        await expect(response).toMatchSchema('forget-password', 'POST-forget-password')
        expect(response.ok).toBe(true)
        const reset_token = response.reset_token
        const response2 = await api
            .path('reset-password')
            .body({ username: config.userName, new_password: "Demo12345", token: reset_token })
            .postRequest(200)
        await expect(response2).toMatchSchema('reset-password', 'POST-reset-password')
        expect(response2.ok).toBe(true)
        const response3 = await api
            .path('login')
            .body({ username: config.userName, password: "Demo12345" })
            .postRequest(200)
        await expect(response3).toMatchSchema('Login', 'POST-login')
        expect(response3.ok).toBe(true)
    })

})