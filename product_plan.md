# Prompetize: Open Source Chrome Extension for Prompt Template Management and Analytics

## About

**Prompetize** is an open-source Chrome extension designed to streamline the management, versioning, and sharing of prompt templates. It transforms your collection of prompts into a centralized, searchable repository with built-in version control and insightful analytics. By eliminating endless copy-paste cycles, Prompetize keeps your best prompt ideas at your fingertips—because every great conversation starts with the right prompt. The extension leverages GitHub for change tracking and collaboration via client-side OAuth, with no third-party backend involved.

---

## Table of Contents

1. [Market Plan](#market-plan)  
   1.1 [Target Audience](#target-audience)  
   1.2 [Pain Points & Opportunities](#pain-points--opportunities)  
   1.3 [Competitive Landscape](#competitive-landscape)  
   1.4 [Accelerated Go-to-Market Strategy](#accelerated-go-to-market-strategy)  

2. [Product Plan](#product-plan)  
   2.1 [Core Features](#core-features)  
   2.2 [GitHub Integration](#github-integration)  
   2.3 [Chat Platform Integration](#chat-platform-integration)  
   2.4 [Roadmap & Key Features List](#roadmap--key-features-list)  
   2.5 [User Experience & Usability](#user-experience--usability)  

3. [Architecture Plan](#architecture-plan)  
   3.1 [High-Level Design](#high-level-design)  
   3.2 [Local Storage & Data Management](#local-storage--data-management)  
   3.3 [GitHub Integration Module](#github-integration-module)  
   3.4 [Analytics Module](#analytics-module)  
   3.5 [Chat Platform Integration Module](#chat-platform-integration-module)  
   3.6 [Security & Privacy](#security--privacy)  
   3.7 [Extensibility & Scalability](#extensibility--scalability)  
   3.8 [Development & Release Workflow](#development--release-workflow)  
   3.9 [Community Engagement](#community-engagement)  

4. [Appendix / Additional Considerations](#appendix--additional-considerations)

---

## 1. Market Plan

### Target Audience

- **Primary Users:**
  - **Prompt Power-Users:** Researchers, writers, developers, and digital creatives who rely on prompt templates for AI applications.
  - **Productivity & AI Enthusiasts:** Users seeking efficient workflows to create, manage, and optimize prompt templates.
  
- **Secondary Users:**
  - **Collaborative Teams:** Marketing, customer support, and editorial teams in need of a shared prompt library.
  - **Educational Institutions:** Educators, students, and researchers interested in leveraging AI and prompt engineering.

### Pain Points & Opportunities

- **Pain Points:**
  - Tedious manual copy-pasting across multiple chat interfaces.
  - Disparate storage and lack of version control for prompt templates.
  - Collaboration difficulties and lack of prompt analytics.
  - Template sprawl due to no centralized management.

- **Opportunities:**
  - Centralized storage with integrated GitHub version control.
  - Data-driven insights to optimize prompt usage.
  - Secure, client-side operations—no need for a third-party backend.
  - Direct integration with popular chat interfaces (ChatGPT, Claude, Gemini, etc.) to auto-populate prompts, streamlining workflow.

### Competitive Landscape

- **Existing Tools:**
  - Generic text snippet managers (e.g., Sublime, TextExpander, aText) lacking prompt-specific optimizations.
  - Note-taking and template management apps without built-in version control or prompt analytics.
  
- **Key Differentiators:**
  - Specialization in AI prompt management.
  - Mandatory GitHub integration for robust version control and collaboration.
  - Secure, browser-based operations with direct chat platform integration.
  - A streamlined, one-click prompt insertion experience that saves time and minimizes manual editing.

### Accelerated Go-to-Market Strategy

- **Launch Initiatives:**
  - **Chrome Web Store:** Publish the extension with detailed screenshots, interactive tutorials, and user testimonials.
  - **GitHub Repository:** Host source code with comprehensive documentation and clear contribution guidelines.
  - **Marketing Campaign:** Leverage Product Hunt, social media, and niche AI/productivity forums to generate buzz and community interest.

---

## 2. Product Plan

### 2.1 Core Features

#### Template Library Management
- **CRUD Operations with GitHub Commit Integration:**
  - **Create & Edit:** Intuitive UI for prompt creation and editing. Every change is automatically committed to the user’s GitHub repository, ensuring complete version history.
  - **Read & List:** Organized, searchable list of prompts displaying Git commit details (timestamps, authors, commit messages).
  - **Delete & Archive:** Archive prompts (using Git branches or tags) rather than permanent deletion to preserve historical data.

- **Organization Tools:**
  - **Tagging & Categorization:** Custom tags, folders, and Git tags/branches for managing prompt versions.
  - **Search & Filter:** Advanced search capabilities to filter prompts by keywords, metadata, or commit history.

#### Usage Analytics & Optimization
- **Basic Metrics:**
  - **Usage Counters:** Track how often each prompt is used.
  - **Timestamp & Commit Logging:** Associate every modification with its corresponding Git commit details.
  
- **Insights Dashboard:**
  - **Visualizations:** Charts and graphs displaying prompt usage trends and version evolution.
  - **Data Export:** Export analytics and commit logs in CSV or JSON formats for further analysis.
  
- **Optimization Features:**
  - **A/B Testing:** Enable experimentation with different prompt versions.
  - **Feedback Integration:** Allow in-app ratings and comments tied to specific Git commits.

#### Seamless Insertion & User Experience
- **Quick Access Interface:**
  - **Popup/Sidebar:** Minimal, easily accessible UI for prompt lists and version history.
  - **One-Click Insertion:** Direct insertion of prompts into active text fields with tooltip assistance.
  - **Keyboard Shortcuts:** Support for efficient navigation and Git operations via keyboard commands.
  
- **Customizable UI:**
  - **Themes & Layouts:** Options for dark/light mode and customizable layouts.
  - **Pinning & Favorites:** Ability to pin frequently used prompts or branches for immediate access.

### 2.2 GitHub Integration

#### Mandatory GitHub Authentication for All Users
- **Universal GitHub Auth:**  
  - All users must sign in via GitHub using a secure OAuth flow. Chrome’s Identity API manages authentication, ensuring every commit, push, or pull is executed with a user-specific token.
  - Even non-technical users are guided to create a free GitHub account if needed, securing data and enabling full functionality.

#### Repository Options
- **Default Public Repository Option:**  
  - After authentication, users may opt to use a default public repository (e.g., `prompetize-community/prompts`) for community sharing.
- **Personal Repository Integration:**  
  - Technical users can select or configure their own repository (public or private) via an advanced settings panel.
- **Seamless Switching:**  
  - Users can toggle between the default public repository and their personal repository based on preferences.

### 2.3 Chat Platform Integration

#### Objective
Enable direct integration with popular chat interfaces (ChatGPT, Claude, Gemini, etc.) to allow one-click insertion of prompt templates—eliminating the need for copy-paste cycles.

#### Key Features

- **Dynamic Content Script Injection:**
  - **Detection:** A content script monitors the page URL and DOM for known chat interfaces.
  - **Injection:** When a target chat platform is detected, the script dynamically injects a lightweight UI widget (a floating button or toolbar) that harmonizes with the host site’s design.

- **One-Click Prompt Insertion:**
  - **Auto-Population:** Selected templates are automatically inserted into the active prompt box.
  - **Dynamic Placeholders:** Templates can include placeholders (e.g., `{{userName}}`). Upon selection, users receive a modal to fill in these details before insertion.
  - **Contextual Insertion:** Intelligent merging or replacement if text already exists in the prompt box. Users may be prompted to “Overwrite or Append?”

- **Multi-Platform Considerations:**
  - **Site-Specific Mappings:** Maintain a configuration mapping target domains to specific DOM selectors for prompt input fields.
  - **Graceful Fallbacks:** In the event that a chat platform’s UI changes, the extension logs issues and notifies users (or silently fails while providing error details for rapid updates).

- **Keyboard Shortcuts:**
  - Support for shortcuts (e.g., `Ctrl+Shift+P`) to quickly open the prompt template overlay regardless of the active chat platform.

#### Example (Simplified JavaScript Implementation)
```javascript
// content-script.js
(function() {
  const targetDomains = ['chat.openai.com', 'claude.ai', 'gemini.ai'];
  
  // Check if the current domain is supported
  if (!targetDomains.some(domain => window.location.host.includes(domain))) return;

  // Platform-specific configuration for prompt selectors
  const platformConfig = {
    'chat.openai.com': { promptSelector: 'textarea.prompt-input' },
    'claude.ai': { promptSelector: 'div.chat-input textarea' },
    'gemini.ai': { promptSelector: '.prompt-box' }
  };

  // Determine the prompt selector for the current platform
  function getPromptSelector() {
    const currentDomain = window.location.host;
    for (const domain in platformConfig) {
      if (currentDomain.includes(domain)) return platformConfig[domain].promptSelector;
    }
    return null;
  }

  // Inject the Templates button once the prompt box is detected
  function insertTemplateButton() {
    const promptSelector = getPromptSelector();
    if (!promptSelector) return;
    const promptBox = document.querySelector(promptSelector);
    if (promptBox && !document.getElementById('prompetize-button')) {
      const btn = document.createElement('button');
      btn.id = 'prompetize-button';
      btn.innerText = 'Templates';
      btn.style.position = 'absolute';
      btn.style.right = '10px';
      btn.style.bottom = '10px';
      btn.onclick = showTemplateOverlay;
      promptBox.parentNode.appendChild(btn);
    }
  }

  // Basic interval check; can be enhanced with a MutationObserver
  setInterval(insertTemplateButton, 1000);

  // Display the overlay with a list of available prompt templates
  function showTemplateOverlay() {
    // Create and display an overlay that shows available prompt templates.
    // On template selection, if placeholders exist, prompt user for input,
    // then call insertTemplate(templateContent).
    console.log('Display prompt templates overlay...');
  }

  // Function to insert the selected template into the prompt box
  function insertTemplate(templateContent) {
    const promptSelector = getPromptSelector();
    const promptBox = document.querySelector(promptSelector);
    if (promptBox) {
      promptBox.value = templateContent; // Optionally merge with existing text
      promptBox.focus();
    }
  }
})();
```

### 2.4 Roadmap & Key Features List

 - Implement prompt CRUD operations with Git commit tracking.
 - Develop UI for prompt management (search, categorization, one-click insertion).
 - Integrate GitHub OAuth for authentication and repository selection.
 - Build usage analytics with dashboards and data export features.
 - Enable full Git operations (commit, push, pull, merge) via client-side GitHub API integration.
 - Introduce A/B testing, in-app feedback, and optimization tools.
 - Expand community features to encourage prompt sharing in the default public repository.
 - Enhance UI/UX with customizable themes, keyboard shortcuts, and detailed Git history views.
 - Finalize content script injection and overlay UI for chat platforms.
 - Ensure seamless one-click prompt insertion, dynamic placeholder handling, and cross-platform support.
 - Integrate additional analytics capabilities and third-party integrations based on user feedback.

### 2.5 User Experience & Usability

- **Onboarding & Setup:**
  - **Interactive Setup Wizard:** Guide users through GitHub authentication, repository selection, and an introduction to the integrated chat platform features.
  - **Preloaded Templates:** Provide sample prompts to demonstrate best practices and showcase the extension’s capabilities.
  
- **Everyday Workflow:**
  - **Smooth Integration:** A non-intrusive UI that fits into the user’s browsing and chat workflow.
  - **Smart Suggestions:** Display popular or recently used prompts along with their version history.
  
- **Feedback Mechanisms:**
  - **In-App Ratings & Comments:** Users can rate and comment on prompt effectiveness directly in the overlay.
  - **Direct Issue Reporting:** Facilitate quick issue reporting by automatically generating GitHub issues from within the extension.

---

## 3. Architecture Plan

### 3.1 High-Level Design

- **Frontend (Extension UI & Logic):**
  - **Manifest v3 Compliance:** Adhere to Chrome Extension standards.
  - **Framework & Libraries:** Utilize a lightweight framework (e.g., React, Vue.js, or Preact) to create a modular, GitHub-aware UI.
  - **UI Components:**
    - **Main Popup/Sidebar:** Displays prompt lists, Git commit history, and collaboration options.
    - **Settings Panel:** Manages GitHub authentication, repository selection, and advanced configuration.
    - **Chat Platform Overlay:** Provides the injected UI component for prompt template selection directly in chat interfaces.
    - **Feedback Interface:** Offers a mechanism for creating GitHub issues or inline comments.

### 3.2 Local Storage & Data Management

- **Hybrid Storage Strategy:**
  - **Local Data Cache:** Use the Chrome Storage API to cache prompt data locally for fast access and offline use.
  - **GitHub Sync Module:** Synchronize local changes directly with the authenticated GitHub repository (default public repo or user’s personal repo).

- **Data Schema:**
  - JSON-based format for prompt data enriched with Git metadata (commit IDs, branch names, timestamps) to preserve complete version history.

### 3.3 GitHub Integration Module

- **Authentication & Repository Management:**
  - **OAuth Flow:** Use Chrome’s Identity API for secure GitHub authentication. All operations (commit, push, pull) require a valid, user-specific token.
  - **Repository Selection:** Allow users to choose between a default public repository and their personal repository.
  
- **Git Operations:**
  - **Commit & Push:** Automatically commit changes with clear, descriptive messages and push updates directly via GitHub’s API.
  - **Pull & Merge:** Regularly fetch updates from the remote repository, gracefully handling merge conflicts with a user interface for manual resolution.
  - **Branching & Tagging:** Support version control via Git branches and tags to track prompt iterations clearly.

### 3.4 Analytics Module

- **Event & Commit Tracking:**
  - Log local usage events and Git commit events, providing a unified view of prompt evolution.
  - Display visual dashboards correlating prompt usage with Git commit history.
  
- **Data Export:**
  - Allow users to export analytics data (combining usage metrics and Git commit logs) in CSV or JSON format.

### 3.5 Chat Platform Integration Module

- **Content Script Injection:**
  - **Detection & Injection:** Implement scripts that detect supported chat platforms (ChatGPT, Claude, Gemini, etc.) and inject a UI component (e.g., a “Templates” button) into the chat prompt box.
  - **Dynamic Configurations:** Maintain a configuration mapping for target domains and their specific DOM selectors.
  
- **User Interaction & Overlay:**
  - **Overlay Management:** Provide an overlay UI for browsing, selecting, and (if needed) filling dynamic placeholders in prompt templates.
  - **One-Click Insertion:** Automate the insertion of the selected prompt template into the detected chat input field, with fallback strategies if the field already contains text.
  
- **Error Handling & Logging:**
  - **Resilience:** Use robust error handling (try-catch blocks, MutationObservers) to ensure the script fails gracefully if a chat platform updates its DOM.
  - **User Notifications:** Optionally notify users when a prompt insertion fails or when the integration needs an update.

### 3.6 Security & Privacy

- **Secure OAuth & Token Handling:**
  - Utilize secure OAuth flows to authenticate with GitHub without exposing sensitive credentials.
  - Store access tokens transiently—in memory or within encrypted browser storage using the Web Crypto API.
  - Ensure tokens are short-lived or auto-renewed to maintain security.
  
- **No Third-Party Backend:**
  - All GitHub operations are performed client-side, eliminating the need for any third-party backend communication.
  
- **Minimal Permissions:**
  - Request only the minimum required OAuth scopes (read/write access to the selected repository) to limit exposure.

### 3.7 Extensibility & Scalability

- **Modular Architecture:**
  - Clear separation of UI, business logic, GitHub integration, analytics, and chat platform modules for easy maintenance and future expansion.
  
- **Plugin Architecture:**
  - Provide extension points for third-party developers to integrate custom analytics, alternative version control methods, or additional features.
  
- **Optional Backend Services (Future Consideration):**
  - Although not required initially, consider a lightweight backend (RESTful or GraphQL API) for advanced analytics if future needs arise.

### 3.8 Development & Release Workflow

- **Repository & Directory Structure:**
  - Organize the codebase into well-defined directories (e.g., `/src` for source code, `/public` for assets, `/docs` for documentation).
  - Maintain comprehensive README files and contribution guidelines detailing Git workflows, commit conventions, and branching strategies.
  
- **CI/CD Pipeline:**
  - Use GitHub Actions (or similar) for automated testing, linting, and Git operations.
  - Bundle and optimize the extension using modern tools (Webpack or Rollup) with steps to validate GitHub and chat platform integrations.
  
- **Versioning & Changelog:**
  - Adopt semantic versioning and document every release with detailed Git commit logs.
  - Tag releases on GitHub to ensure traceability and encourage community feedback.

### 3.9 Community Engagement

- **Contribution Framework:**
  - Provide clear guidelines for contributions, including commit message conventions and branching strategies.
  - Use GitHub labels (e.g., “good first issue”, “help wanted”) to attract community contributions.
  
- **Feedback Channels:**
  - Integrate in-extension feedback forms that directly create GitHub issues.
  - Foster community discussions through GitHub Discussions, Discord channels, or dedicated forums.
  
- **Regular Updates:**
  - Commit to a consistent release schedule driven by user feedback and community contributions.
  - Maintain transparency via GitHub pull requests and issue tracking.

---

## 4. Appendix / Additional Considerations

- **Documentation:**
  - Provide detailed user manuals, API documentation for GitHub and chat platform integration, and developer contribution guides.
  
- **Testing & QA:**
  - Implement comprehensive unit, integration, and user acceptance tests.
  - Include tests specific to the chat platform integration (e.g., verifying UI injection, template insertion accuracy, and graceful error handling on DOM changes).
  
- **Maintenance & Support:**
  - Plan for long-term maintenance, regular security updates, and active community support channels.
  
- **Future Enhancements:**
  - Evaluate expanding cross-browser compatibility and integrating additional AI platforms.
  - Explore advanced analytics capabilities and third-party integrations based on evolving user needs.
  - Investigate additional integrations (e.g., voice-activated prompt insertion) as AI platforms evolve.

