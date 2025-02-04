import { ExtensionMessage, PerformSomeAction } from '../../types'; // Removed 'Browser' and included .ts extension

chrome.runtime.onMessage.addListener(async (
  message: unknown,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: unknown) => void
) => {
  const typedMessage = message as ExtensionMessage;

  try {
    // Handle the message based on its type
    switch (typedMessage.type) {
      case 'SOME_ACTION':
        // Perform some action
        const result = await performSomeAction(typedMessage.data);
        sendResponse({ success: true, data: result });
        break;
      // Add more cases as needed
      default:
        sendResponse({ success: false, error: 'Unknown action type' });
    }
  } catch (error) {
    sendResponse({ success: false, error: (error as Error).message });
  }

  // Returning true indicates you wish to send a response asynchronously
  return true;
});

// Define performSomeAction
const performSomeAction: PerformSomeAction = async (data: any) => {
  // Implement the desired action here
  return { processedData: data };
};