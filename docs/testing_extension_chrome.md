# Testing and Loading the Chrome Extension

## 1. Build the Extension

Ensure your extension is properly built for Chrome. Typically, the build output for Chrome is located in the `dist_chrome/` directory.

**Steps:**

1. **Run the Build Command:**
   
   Open your terminal and navigate to the project directory:
   
   ```bash
   cd /opt/homebrew/var/www/GitHub/prompetize
   ```
   
   Execute the build script defined in your `package.json`. This is typically done using:
   
   ```bash
   npm run build:chrome
   ```
   
   *Note:* Replace `build:chrome` with the actual script name if it's different. You can verify the available scripts by inspecting the `scripts` section in your `package.json`:
   
   ```bash
   cat package.json | grep "\"scripts\""
   ```

2. **Verify Build Output:**
   
   After the build completes, ensure that the `dist_chrome/` directory contains the necessary files:
   
   ```bash
   ls dist_chrome/
   ```

## 2. Load the Extension into Chrome

Once the build is successful, load the extension into Chrome for testing.

**Steps:**

1. **Open Chrome Extensions Page:**
   
   - Open Google Chrome.
   - Navigate to the Extensions page by entering `chrome://extensions/` in the address bar.

2. **Enable Developer Mode:**
   
   - In the top right corner of the Extensions page, toggle the **Developer mode** switch to **ON**.

3. **Load Unpacked Extension:**
   
   - Click on the **Load unpacked** button.
   - In the dialog that appears, navigate to and select the `dist_chrome/` directory of your project.
   
   ```bash
   /opt/homebrew/var/www/GitHub/prompetize/dist_chrome/
   ```

4. **Verify Extension Installation:**
   
   - Once loaded, your extension should appear in the list of installed extensions.
   - Ensure there are no error messages. If errors are present, click on the **Errors** link under your extension to view detailed logs.

## 3. Test the Extension Functionality

After loading the extension, perform the following to ensure it works as expected:

1. **Interact with the Extension:**
   
   - Click on the extension icon in the Chrome toolbar.
   - Navigate through its features to verify functionality aligns with your expectations.

2. **Check for Issues:**
   
   - Open Chrome's Developer Tools by right-clicking on the extension popup and selecting **Inspect**.
   - Look for any console errors or warnings that may need addressing.

3. **Reload the Extension (if needed):**
   
   - If you make changes to the extension's code, rebuild it and reload the extension in Chrome by clicking the **Reload** icon next to your extension on the `chrome://extensions/` page.

## 4. Automate Testing (Optional)

For a more streamlined testing process, consider the following:

1. **Watch for File Changes:**
   
   - Use a watch script to automatically rebuild the extension when source files change:
     
     ```bash
     npm run watch:chrome
     ```
   
   - Ensure this script is defined in your `package.json`.

2. **Automate Reloading:**
   
   - Use Chrome extensions like **Extension Reloader** to automate the reload process whenever files are rebuilt.

## Summary

By following these steps, you can effectively build, load, and test your Chrome extension to ensure it functions correctly. Regular testing during development will help identify and resolve issues promptly, leading to a more robust and reliable extension.