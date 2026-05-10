import { expect, test } from '@playwright/test';
import { randomSignupUsername } from '../api-test.config';

// test.describe('Login page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/');
    });

    test('shows sign-in heading and demo hint', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
        await expect(page.locator('.login_hint_code').first()).toHaveText('demo');
        await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
    });

    test('successful login shows welcome message', async ({ page }) => {
        await page.getByLabel('Username').fill('demo');
        await page.getByLabel('Password', { exact: true }).fill('Demo12345');
        await page.getByRole('button', { name: 'Log in' }).click();

        await expect(page.locator('#status_message')).toContainText('Welcome, demo.');
        await expect(page.locator('#status_message')).toHaveClass(/is_success/);
    });

    test('wrong password shows error', async ({ page }) => {
        await page.getByLabel('Username').fill('demo');
        await page.getByLabel('Password', { exact: true }).fill('WrongPass1');
        await page.getByRole('button', { name: 'Log in' }).click();

        await expect(page.locator('#status_message')).toHaveText('invalid username or password');
        await expect(page.locator('#status_message')).toHaveClass(/is_error/);
    });

    test('weak password shows policy errors', async ({ page }) => {
        await page.getByLabel('Username').fill('demo');
        await page.getByLabel('Password', { exact: true }).fill('123');
        await page.getByRole('button', { name: 'Log in' }).click();

        await expect(page.locator('#status_message')).toHaveText('password does not meet requirements');
        await expect(page.locator('#status_error_list')).not.toBeHidden();
        await expect(page.locator('#status_error_list li').first()).toBeVisible();
    });

    test('Sign up link opens create account page', async ({ page }) => {
        await page.getByRole('link', { name: 'Sign up' }).click();
        await expect(page).toHaveURL(/signup\.html$/);
        await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible();
    });

    test('Forgot password link opens forgot page', async ({ page }) => {
        await page.getByRole('link', { name: 'Forgot password' }).click();
        await expect(page).toHaveURL(/forgot\.html$/);
        await expect(page.getByRole('heading', { name: 'Forgot password' })).toBeVisible();
    });
// });

// test.describe('Sign up page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/signup.html');
    });

    test('creates account and shows success', async ({ page }) => {
        const user = randomSignupUsername('ui');
        await page.getByLabel('Username').fill(user);
        await page.getByLabel('Password', { exact: true }).fill('Demo1234512345');
        await page.getByLabel(/confirm password/i).fill('Demo1234512345');
        await page.getByRole('button', { name: 'Sign up' }).click();

        await expect(page.locator('#status_message')).toContainText('Account created. You can sign in now.');
        await expect(page.locator('#status_message')).toHaveClass(/is_success/);
    });

    test('mismatched passwords stay on page with error', async ({ page }) => {
        await page.getByLabel('Username').fill(randomSignupUsername('ui'));
        await page.getByLabel('Password', { exact: true }).fill('Demo1234512345');
        await page.getByLabel(/confirm password/i).fill('OtherPass1');
        await page.getByRole('button', { name: 'Sign up' }).click();

        await expect(page.locator('#status_message')).toHaveText('Passwords do not match.');
        await expect(page.locator('#status_message')).toHaveClass(/is_error/);
    });
// });
