// Initialize chatbot when the script loads
(function() {
  // Get the script element that loaded this file
  const script = document.currentScript;
  if (!script) {
    // If script is not found, wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', initializeChatbot);
  } else {
    initializeChatbot();
  }
})();

async function initializeChatbot() {
  // Get the script element that loaded this file
  const script = document.currentScript || document.querySelector('script[src*="chatbot.js"]');
  if (!script) {
    console.error('Script element not found');
    return;
  }

  // Get configuration from data attributes
  const uuid = script.getAttribute('data-chatbot-uuid');
  if (!uuid) {
    console.error('Chatbot UUID not found in data attributes');
    return;
  }

  try {
    // Get the API domain from the script's src attribute
    const scriptSrc = script.src;
    const apiDomain = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));
    console.log('Using API domain:', apiDomain);

    // Fetch chatbot configuration from the API
    const response = await fetch(`${apiDomain}/api/chatbots/${uuid}`);
    if (!response.ok) {
      throw new Error('Failed to fetch chatbot configuration');
    }
    const config = await response.json();
    console.log('Fetched chatbot config:', config);

    // Create and inject the chatbot styles
    const styles = `
      .chatbot-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        font-family: system-ui, -apple-system, sans-serif;
      }
      .chatbot-bubble {
        padding: 8px 16px;
        border-radius: 9999px;
        background-color: ${config.primaryColor || '#000000'};
        color: white;
        border: none;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 500;
        transition: transform 0.2s ease;
      }
      .chatbot-container {
        position: fixed;
        bottom: 80px;
        right: 20px;
        width: ${config.width || 400}px;
        height: ${config.height || 600}px;
        background: ${config.isDarkMode ? '#1a1a1a' : 'white'};
        border-radius: 12px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        display: none;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid ${config.isDarkMode ? '#333' : '#e5e7eb'};
      }
      .chatbot-header {
        padding: 16px;
        background-color: ${config.primaryColor || '#000000'};
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
      }
      .chatbot-header-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .chatbot-header img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
      }
      .chatbot-header span {
        font-weight: 600;
        color: white;
      }
      .chatbot-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 18px;
        padding: 4px;
      }
      .chatbot-messages {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-height: 0;
      }
      .chatbot-input-container {
        padding: 16px;
        border-top: 1px solid ${config.isDarkMode ? '#333' : '#e5e7eb'};
        margin-top: auto;
      }
      .chatbot-input-wrapper {
        display: flex;
        gap: 8px;
      }
      .chatbot-input {
        flex: 1;
        padding: 8px;
        border: 1px solid ${config.primaryColor || '#000000'};
        border-radius: 8px;
        background-color: ${config.isDarkMode ? '#1a1a1a' : 'white'};
        color: ${config.isDarkMode ? 'white' : 'black'};
        font-size: 14px;
        min-width: 0;
        outline: none;
      }
      .chatbot-input:focus {
        box-shadow: 0 0 0 2px ${config.primaryColor || '#000000'}40;
      }
      .chatbot-send {
        padding: 8px 16px;
        border: none;
        border-radius: 8px;
        background-color: ${config.primaryColor || '#000000'};
        color: white;
        cursor: pointer;
        font-size: 14px;
        transition: opacity 0.2s ease;
      }
      .chatbot-send:hover {
        opacity: 0.9;
      }
      .message {
        padding: 12px 16px;
        border-radius: 12px;
        max-width: 80%;
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }
      .message.user {
        align-self: flex-end;
        background-color: ${config.primaryColor || '#000000'};
        color: white;
        flex-direction: row-reverse;
      }
      .message.assistant {
        align-self: flex-start;
        background-color: ${config.isDarkMode ? '#2d2d2d' : '#f3f4f6'};
        color: ${config.isDarkMode ? 'white' : 'black'};
      }
      .message-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
      }
      .message-content {
        flex: 1;
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Create and inject the chatbot HTML
    const chatbotHTML = `
      <div class="chatbot-widget">
        <button class="chatbot-bubble">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          ${config.bubbleMessage || 'Hi! 👋 Click me to start chatting'}
        </button>
        <div class="chatbot-container">
          <div class="chatbot-header">
            <div class="chatbot-header-left">
              ${config.logoUrl ? `<img src="${config.logoUrl}" alt="${config.name}">` : ''}
              <span>${config.name}</span>
            </div>
            <button class="chatbot-close">✕</button>
          </div>
          <div class="chatbot-messages"></div>
          <form class="chatbot-input-container">
            <div class="chatbot-input-wrapper">
              <input type="text" class="chatbot-input" placeholder="Type your message...">
              <button type="submit" class="chatbot-send">Send</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const chatbotElement = document.createElement('div');
    chatbotElement.innerHTML = chatbotHTML;
    document.body.appendChild(chatbotElement);

    // Get references to elements
    const bubble = chatbotElement.querySelector('.chatbot-bubble');
    const container = chatbotElement.querySelector('.chatbot-container');
    const closeButton = chatbotElement.querySelector('.chatbot-close');
    const messagesContainer = chatbotElement.querySelector('.chatbot-messages');
    const form = chatbotElement.querySelector('form');
    const input = chatbotElement.querySelector('.chatbot-input');

    // Toggle chatbot visibility
    bubble.addEventListener('click', () => {
      container.style.display = 'flex';
      bubble.style.display = 'none';
    });

    closeButton.addEventListener('click', () => {
      container.style.display = 'none';
      bubble.style.display = 'flex';
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const message = input.value.trim();
      if (!message) return;

      // Add user message
      addMessage(message, 'user');
      input.value = '';

      try {
        // Send message to API
        const response = await fetch(`${apiDomain}/api/chatbots/${uuid}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const data = await response.json();
        addMessage(data.message, 'assistant', config.avatarUrl);
      } catch (error) {
        console.error('Error sending message:', error);
        addMessage('Sorry, I encountered an error. Please try again.', 'assistant', config.avatarUrl);
      }
    });

    // Function to add a message to the chat
    function addMessage(text, type, avatarUrl = null) {
      const messageElement = document.createElement('div');
      messageElement.className = `message ${type}`;
      
      const contentElement = document.createElement('div');
      contentElement.className = 'message-content';
      contentElement.textContent = text;
      
      messageElement.appendChild(contentElement);
      
      if (avatarUrl && type === 'assistant') {
        const avatarElement = document.createElement('img');
        avatarElement.className = 'message-avatar';
        avatarElement.src = avatarUrl;
        avatarElement.alt = config.name;
        messageElement.insertBefore(avatarElement, contentElement);
      }
      
      messagesContainer.appendChild(messageElement);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Add welcome message if configured
    if (config.welcomeMessage) {
      addMessage(config.welcomeMessage, 'assistant', config.avatarUrl);
    }

    // Scroll to bottom when new messages are added
    const observer = new MutationObserver(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
    observer.observe(messagesContainer, { childList: true, subtree: true });

  } catch (error) {
    console.error('Error initializing chatbot:', error);
  }
} 