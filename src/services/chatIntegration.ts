/**
 * Chat Integration module for dynamically injecting a UI widget (Templates button)
 * into supported chat platforms, as per ADR-004: Chat Platform Integration Strategy.
 */

const supportedDomains: string[] = ["chat.openai.com", "claude.ai", "gemini.com"];

/**
 * Checks if the current hostname is among the supported chat platforms.
 * @returns True if supported, else false.
 */
export function isSupportedDomain(): boolean {
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
export function injectTemplateButton() {
  if (!document.body || document.getElementById("template-button")) {
    return;
  }
  const button = createTemplateButton();
  document.body.appendChild(button);
}

/**
 * Sets up a MutationObserver to monitor DOM changes and ensure the Templates button is injected.
 */
function observeDOMChanges() {
  // Skip MutationObserver in test environment
  if (process.env.NODE_ENV === 'test' || !document.body) {
    return;
  }
  
  try {
    const observer = new MutationObserver(() => {
      if (!document.getElementById("template-button")) {
        injectTemplateButton();
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  } catch (error) {
    console.warn('MutationObserver failed to initialize:', error);
  }
}

/**
 * Initializes the chat integration functionality if running on a supported domain.
 */
export function initChatIntegration() {
  if (!isSupportedDomain()) {
    console.log("Chat integration not supported on this domain:", window.location.hostname);
    return;
  }
  
  console.log("Initializing chat integration for", window.location.hostname);
  
  // Always try to inject the button first
  if (document.body) {
    injectTemplateButton();
  }
  
  // Set up observers for production environment
  if (process.env.NODE_ENV !== 'test') {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        injectTemplateButton();
        observeDOMChanges();
      });
    } else {
      observeDOMChanges();
    }
  }
}