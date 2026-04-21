const { test, expect } = require('@playwright/test');
const BASE_URL = 'http://localhost:5173';

test('Homepage loads', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page).toHaveURL(/localhost:5173/);
});

test('Create room page loads', async({ page }) => {
    await page.goto('http://localhost:5173/#/create')
    await expect(page).toHaveURL('http://localhost:5173/#/create');
});

async function createRoom(browser) {
    const professorContext = await browser.newContext();
    const professorPage = await professorContext.newPage();
    await professorPage.goto(`${BASE_URL}/#/create`);
    await professorPage.locator('[data-testid="room-name-input"]').fill('Room Name');
    await professorPage.locator('[data-testid="instructor-name-input"]').fill('Professor David');
    await professorPage.locator('[data-testid="create-room-btn"]').click();
    await expect(professorPage).toHaveURL(/professor/);
    const roomCode = (await professorPage.locator('[data-testid="room-code"]').textContent()).trim();
    return { professorContext, professorPage, roomCode };
}

async function joinStudent(browser, studentName, roomCode) {
    const studentContext = await browser.newContext();
    const studentPage = await studentContext.newPage();
    await studentPage.goto(`${BASE_URL}/`);
    await studentPage.locator('[data-testid="find-room-code-input"]').fill(roomCode);
    await studentPage.locator('[data-testid="find-room-btn"]').click();
    await expect(studentPage.locator('[data-testid="room-found-message"]')).toContainText(/joining/i);
    await studentPage.locator('[data-testid="student-name-input"]').fill(studentName);
    await studentPage.locator('[data-testid="join-room-btn"]').click();
    await expect(studentPage).toHaveURL(/student/);
    return { studentContext, studentPage };
}

test('Integration Test-01: professor creates room and dashboard loads', async ({ browser }) => {
    const { professorContext, professorPage } = await createRoom(browser);
    await expect(professorPage).toHaveURL(/professor/);
    await expect(professorPage.locator('[data-testid="room-code"]')).toBeVisible();
    await professorContext.close();
});

test('Integration Test-02: student joins a valid room', async ({ browser }) => {
    const { roomCode } = await createRoom(browser);
    const { studentPage } = await joinStudent(browser, 'Student Alex', roomCode);
    await expect(studentPage).toHaveURL(/student/);
});

test('Integration Test-03: student joins an invalid room', async ({ browser }) => {
    const studentContext = await browser.newContext();
    const studentPage = await studentContext.newPage();
    await studentPage.goto(`${BASE_URL}/`);
    await studentPage.locator('[data-testid="find-room-code-input"]').fill('BAD999');
    await studentPage.locator('[data-testid="find-room-btn"]').click();
    await expect(studentPage.locator('[data-testid="room-found-message"]')).toContainText(/room not found/i);
    await expect(studentPage).toHaveURL('http://localhost:5173/#/');
    await studentContext.close();
});

test('Integration Test-04: professor sees student appear after joining with no refresh', async ({ browser }) => {
    const { professorPage, roomCode } = await createRoom(browser);
    await professorPage.locator('[data-testid="toggle-student-list-btn"]').click();
    await joinStudent(browser, 'Student Maya', roomCode);
    await expect(professorPage.locator('[data-testid="student-list"]')).toContainText('Student Maya');
});

test('Integration Test-05: multiple students join the room', async ({ browser }) => {
    const { professorPage, roomCode } = await createRoom(browser);
    await professorPage.locator('[data-testid="toggle-student-list-btn"]').click();
    await joinStudent(browser, 'Student A', roomCode);
    await joinStudent(browser, 'Student B', roomCode);
    await joinStudent(browser, 'Student C', roomCode);
    const studentList = professorPage.locator('[data-testid="student-list"]');
    await expect(studentList).toContainText('Student A');
    await expect(studentList).toContainText('Student B');
    await expect(studentList).toContainText('Student C');
});

test('System Test: complete classroom session flow works', async ({ browser }) => {
    const { professorContext, professorPage, roomCode } = await createRoom(browser);
    await professorPage.locator('[data-testid="toggle-student-list-btn"]').click();
    const { studentContext, studentPage } = await joinStudent(browser, 'Student Alex', roomCode);
    await expect(professorPage.locator('[data-testid="student-list"]')).toContainText('Student Alex');
    await expect(studentPage).toHaveURL(/student/);
    await expect(professorPage.locator('[data-testid="room-code"]')).toContainText(roomCode);
    await studentContext.close();
    await professorContext.close();
});