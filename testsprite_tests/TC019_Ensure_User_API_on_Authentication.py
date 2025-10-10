import asyncio
from playwright import async_api

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3000", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # Send POST request to /api/ensure-user without auth to verify 401 Unauthorized response
        await page.goto('http://localhost:3000/api/ensure-user', timeout=10000)
        

        # Send POST request to /api/ensure-user without auth to verify 401 Unauthorized response
        await page.goto('http://localhost:3000/api/ensure-user', timeout=10000)
        

        # Assert that the response status is 401 Unauthorized when no auth is provided
        response = await page.request.post('http://localhost:3000/api/ensure-user')
        assert response.status == 401
          
        # Send POST request with valid bearer token
        headers = {'Authorization': 'Bearer valid_token_here'}
        response = await page.request.post('http://localhost:3000/api/ensure-user', headers=headers)
        assert response.status == 200
        user = await response.json()
        assert 'id' in user and 'handle' in user and 'handle_version' in user
          
        # Send POST request with valid cookie
        cookies = [{'name': 'auth_cookie', 'value': 'valid_cookie_value', 'domain': 'localhost', 'path': '/'}]
        await page.context.add_cookies(cookies)
        response = await page.request.post('http://localhost:3000/api/ensure-user')
        assert response.status == 200
        user = await response.json()
        assert 'id' in user and 'handle' in user and 'handle_version' in user
          
        # Send POST request for a new user (simulate by using a unique token or cookie)
        new_user_token = 'new_user_token_value'
        headers = {'Authorization': f'Bearer {new_user_token}'}
        response = await page.request.post('http://localhost:3000/api/ensure-user', headers=headers)
        assert response.status == 200
        new_user = await response.json()
        assert 'id' in new_user and 'handle' in new_user and 'handle_version' in new_user
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    