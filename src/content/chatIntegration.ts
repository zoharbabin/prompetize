/**
 * Chat Integration module for dynamically injecting a UI widget (Templates button)
 * into supported chat platforms, as per ADR-004: Chat Platform Integration Strategy.
 *
 * This module monitors the DOM via MutationObserver and injects a Templates button
 * into the page for seamless prompt template insertion.
 */

const supportedDomains: string[] = ["chat.openai.com", "claude.ai", "gemini.com"];

/**
 * Checks if the current hostname is among the supported chat platforms.
 * @returns True if supported, else false.
 */
function isSupportedDomain(): boolean {
  return supportedDomains.some((domain) => window.location.hostname.includes(domain));
}

/**
 * Creates the Templates button element.
 * @returns The HTML button element.
 */
function createTemplateButton(): HTMLElement {
  const button = document.createElement("button");
  button.id = "template-button";
  button.innerText = "Templates";
  button.style.position = "fixed";
  button.style.bottom = "20px";
  button.style.right = "20px";
  button.style.zIndex = "9999";
  button.style.padding = "10px 20px";
  button.style.backgroundColor = "#007bff";
  button.style.color = "#fff";
  button.style.border = "none";
  button.style.borderRadius = "4px";
  button.style.cursor = "pointer";
  
  button.addEventListener("click", () => {
    // Placeholder action for the Templates button.
    alert("Templates button clicked!");
  });
  return button;
}

/**
 * Injects the Templates button into the document body if not already present.
 */
function injectTemplateButton() {
  if (document.getElementById("template-button")) {
    return;
  }
  const button = createTemplateButton();
  document.body.appendChild(button);
}

/**
 * Sets up a MutationObserver to monitor DOM changes and ensure the Templates button is injected.
 */
function observeDOMChanges() {
  const observer = new MutationObserver((mutations) => {
    if (document.body && !document.getElementById("template-button")) {
      injectTemplateButton();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Initializes the chat integration functionality if running on a supported domain.
 */
function initChatIntegration() {
  if (!isSupportedDomain()) {
    console.log("Chat integration not supported on this domain:", window.location.hostname);
    return;
  }
  console.log("Initializing chat integration for", window.location.hostname);
  observeDOMChanges();
  // Attempt initial injection in case DOM is already ready.
  injectTemplateButton();
}

// Initialize integration when document is ready.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initChatIntegration);
} else {
  initChatIntegration();
}

export {};