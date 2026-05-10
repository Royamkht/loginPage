import { randomBytes } from 'node:crypto'

const processENV = process.env.Test_ENV
const env = processENV || 'prod'
console.log('Test enviroment is:' + env)

const config = {
    apiUrl: 'http://localhost:3000/api/',
    userName: 'demo',
    Passsword: 'Demo12345',
}

/** Default password for sign-up tests (policy-compliant). Use `randomSignupUsername()` per test for usernames. */
const signupConfig = {
    password: 'Demo1234512345',
}

/** Username unlikely to collide with seeded users (e.g. `demo`). */
export function randomSignupUsername(prefix = 'signup'): string {
    return `${prefix}_${randomBytes(8).toString('hex')}`
}

export { config, signupConfig }
