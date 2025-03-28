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
      }
      .chatbot-bubble {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: ${config.primaryColor};
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      .chatbot-container {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: ${config.width}px;
        height: ${config.height}px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        display: none;
        flex-direction: column;
      }
      .chatbot-header {
        padding: 15px;
        border-bottom: 1px solid #eee;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .chatbot-header img {
        width: 30px;
        height: 30px;
        border-radius: 50%;
      }
      .chatbot-messages {
        flex: 1;
        overflow-y: auto;
        padding: 15px;
      }
      .chatbot-input {
        padding: 15px;
        border-top: 1px solid #eee;
      }
      .chatbot-input input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
      }
      .message {
        margin-bottom: 10px;
        padding: 10px;
        border-radius: 5px;
      }
      .message.user {
        background: ${config.primaryColor};
        color: white;
        margin-left: 20%;
      }
      .message.assistant {
        background: #f0f0f0;
        margin-right: 20%;
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Create and inject the chatbot HTML
    const chatbotHTML = `
      <div class="chatbot-widget">
        <div class="chatbot-bubble">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <div class="chatbot-container">
          <div class="chatbot-header">
            ${config.logoUrl ? `<img src="${config.logoUrl}" alt="${config.name}">` : ''}
            <span>${config.name}</span>
          </div>
          <div class="chatbot-messages"></div>
          <div class="chatbot-input">
            <input type="text" placeholder="Type your message...">
          </div>
        </div>
      </div>
    `;

    const chatbotContainer = document.createElement('div');
    chatbotContainer.innerHTML = chatbotHTML;
    document.body.appendChild(chatbotContainer);

    // Add event listeners
    const bubble = document.querySelector('.chatbot-bubble');
    const container = document.querySelector('.chatbot-container');
    const input = document.querySelector('.chatbot-input input');
    const messages = document.querySelector('.chatbot-messages');

    bubble.addEventListener('click', () => {
      container.style.display = container.style.display === 'none' ? 'flex' : 'none';
      if (container.style.display === 'flex' && messages.children.length === 0) {
        addMessage(config.welcomeMessage, 'assistant');
      }
    });

    input.addEventListener('keypress', async (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        const message = input.value.trim();
        addMessage(message, 'user');
        input.value = '';

        try {
          const apiUrl = `${apiDomain}/api/chatbots/${config.uuid}/chat`;
          console.log('Sending message to:', apiUrl);
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
          });

          if (!response.ok) {
            console.error('Response not OK:', response.status, response.statusText);
            throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          addMessage(data.message, 'assistant');
        } catch (error) {
          console.error('Error sending message:', error);
          addMessage('Sorry, there was an error processing your message.', 'assistant');
        }
      }
    });

    function addMessage(content, type) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${type}`;
      messageDiv.textContent = content;
      messages.appendChild(messageDiv);
      messages.scrollTop = messages.scrollHeight;
    }
  } catch (error) {
    console.error('Error initializing chatbot:', error);
  }
} 