import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initChatIntegration } from '../chatIntegration';

// Mock the DOM environment
const mockDocument = {
  body: {
    appendChild: vi.fn()
  },
  getElementById: vi.fn(),
  createElement: vi.fn(),
  readyState: 'complete'
};

const mockWindow = {
  location: {
    hostname: 'chat.openai.com'
  }
};

vi.stubGlobal('document', mockDocument);
vi.stubGlobal('window', mockWindow);


describe('Chat Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDocument.getElementById.mockReturnValue(null);
    mockDocument.createElement.mockReturnValue({
      style: {},
      addEventListener: vi.fn(),
      setAttribute: vi.fn()
    });
  });

  it('should inject template button on supported domains', () => {
    // Simulate supported domain
    (window as any).location.hostname = 'chat.openai.com';
    
    // Initialize chat integration
    initChatIntegration();
    
    expect(mockDocument.createElement).toHaveBeenCalledWith('button');
    expect(mockDocument.body.appendChild).toHaveBeenCalled();
  });

  it('should not inject template button on unsupported domains', () => {
    // Simulate unsupported domain
    (window as any).location.hostname = 'example.com';
    
    // Initialize chat integration
    initChatIntegration();
    
    expect(mockDocument.createElement).not.toHaveBeenCalled();
    expect(mockDocument.body.appendChild).not.toHaveBeenCalled();
  });

  it('should not inject multiple template buttons', () => {
    // Simulate existing button
    mockDocument.getElementById.mockReturnValue({ id: 'template-button' });
    
    // Initialize chat integration
    initChatIntegration();
    
    expect(mockDocument.createElement).not.toHaveBeenCalled();
    expect(mockDocument.body.appendChild).not.toHaveBeenCalled();
  });
});