s# Active Development Context

**Current Setup and Testing Instructions**

As of 2/8/2025, we have updated our project configuration to address the deprecated punycode warnings by preloading a custom setup file. Key updates include:

1. **Jest Setup Preload:**  
   - A file `jest.setup.js` is placed in the project root.  
   - This file overrides `process.emitWarning` to suppress the punycode deprecation warning (DEP0040).  

2. **Updated Package Configuration:**  
   - In `prompetize/package.json`, the Jest configuration includes:
     - `"setupFiles": ["<rootDir>/../jest.setup.js"]`
   - The test script is modified to preload the setup file:
     - `"test": "node --require ../jest.setup.js node_modules/.bin/jest"`

3. **Testing Workflow:**  
   - To run tests with the updated setup, execute:
     ```
     rm -rf node_modules package-lock.json
     npm install
     npm test
     ```
   - This ensures the warning is suppressed and the test suite executes cleanly.

These changes have been made to ensure a cleaner console output and a smoother development experience. Future updates to upstream dependencies may eventually remove the need for these overrides.
