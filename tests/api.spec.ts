import { expect } from '@playwright/test';
import { test } from '../utils/fixtures';
import { randomSignupUsername } from '../api-test.config';
import { config } from 'node:process';

test.describe('Login API', () => {
test('login by valid email and password', async ({ api, config }) => {
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

test('login by invalid username (without number)', async ({ api,config }) => {
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

    test('signup by existing username', async ({ api, signupConfig,config }) => {
        const response = await api
            .path('sign-up')
            .body({ username: config.userName, password: signupConfig.password })
            .postRequest(400)
        const getToken = response.ok
        const error = response.error
        expect(getToken === false).toBeTruthy()
        expect(error).toBe("username is already taken")
        console.log("error message:", error)
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
test.describe('forgot password API.', () => {
    test('forget password with exciting username',async({ api,config }) => {
        const response = await api
            .path('forget-password')
            .body({ username: config.userName })
            .postRequest(200)
        const token = response.ok
        const reset_token = response.reset_token
        const new_password = "Aa123456h"
        const error = response.error
        expect(token === true).toBeTruthy()
        console.log("error message:", error)

        const response2 = await api
            .path('reset-password')
            .body({ username: config.userName, new_password: config.Passsword, token: reset_token })
            .postRequest(200)
        const token2 = response2.ok
        const error2 = response2.error
        expect(token2 === true).toBeTruthy()
        console.log("error message:", error2)
    })
})
   
    