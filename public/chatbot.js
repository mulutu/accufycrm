// Initialize chatbot when the script loads
(function() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChatbot);
  } else {
    initializeChatbot();
  }
})();

async function initializeChatbot() {
  try {
    // Get the script element
    let script = document.currentScript;
    if (!script) {
      // If currentScript is not available, try to find the script by src
      script = document.querySelector('script[src*="chatbot.js"]');
    }
    
    if (!script) {
      console.error('Chatbot script not found');
      return;
    }

    // Get the chatbot UUID from data attributes
    const chatbotUuid = script.getAttribute('data-chatbot-uuid');
    if (!chatbotUuid) {
      console.error('Chatbot UUID not found');
      return;
    }

    // Get the API domain from data attribute or use current origin
    const apiDomain = script.getAttribute('data-api-domain') || window.location.origin;
    console.log('Using API domain:', apiDomain);

    // Ensure document.head exists
    if (!document.head) {
      console.error('Document head not found');
      return;
    }

    // Create and inject chatbot styles
    const styles = document.createElement('style');
    styles.textContent = `
      .chatbot-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 350px;
        height: 500px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        display: flex;
        flex-direction: column;
        z-index: 1000;
        font-family: Arial, sans-serif;
      }

      .chatbot-header {
        padding: 15px;
        background: #007bff;
        color: white;
        border-radius: 10px 10px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
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

      .chatbot-input form {
        display: flex;
        gap: 10px;
      }

      .chatbot-input input {
        flex: 1;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }

      .chatbot-input button {
        padding: 8px 15px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      .chatbot-bubble {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: #007bff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
      }

      .chatbot-bubble img {
        width: 30px;
        height: 30px;
        border-radius: 50%;
      }

      .message {
        margin-bottom: 10px;
        display: flex;
        align-items: flex-start;
        gap: 10px;
      }

      .message.user {
        flex-direction: row-reverse;
      }

      .message-content {
        max-width: 70%;
        padding: 8px 12px;
        border-radius: 15px;
        background: #f0f0f0;
      }

      .message.user .message-content {
        background: #007bff;
        color: white;
      }

      .message-avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        overflow: hidden;
      }

      .message-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    `;
    document.head.appendChild(styles);

    // Ensure document.body exists
    if (!document.body) {
      console.error('Document body not found');
      return;
    }

    // Create chat interface
    const chatInterface = document.createElement('div');
    chatInterface.className = 'chatbot-container';
    chatInterface.style.display = 'none';
    chatInterface.innerHTML = `
      <div class="chatbot-header">
        <span>Chat with us</span>
        <button class="close-chat">×</button>
      </div>
      <div class="chatbot-messages"></div>
      <div class="chatbot-input">
        <form>
          <input type="text" placeholder="Type your message..." required>
          <button type="submit">Send</button>
        </form>
      </div>
    `;
    document.body.appendChild(chatInterface);

    // Create chat bubble
    const chatBubble = document.createElement('div');
    chatBubble.className = 'chatbot-bubble';
    chatBubble.innerHTML = `
      <img src="https://ui-avatars.com/api/?name=Chat&background=random" alt="Chat">
    `;
    document.body.appendChild(chatBubble);

    // Get form element after it's created
    const form = chatInterface.querySelector('form');
    const input = chatInterface.querySelector('input');
    const messagesContainer = chatInterface.querySelector('.chatbot-messages');
    const closeButton = chatInterface.querySelector('.close-chat');

    // Toggle chat visibility
    chatBubble.addEventListener('click', () => {
      chatInterface.style.display = chatInterface.style.display === 'none' ? 'flex' : 'none';
      chatBubble.style.display = chatInterface.style.display === 'flex' ? 'none' : 'flex';
    });

    closeButton.addEventListener('click', () => {
      chatInterface.style.display = 'none';
      chatBubble.style.display = 'flex';
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const message = input.value.trim();
      if (!message) return;

      // Add user message to chat
      addMessage(message, 'user');
      input.value = '';

      try {
        const response = await fetch(`${apiDomain}/api/chatbots/${chatbotUuid}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
          body: JSON.stringify({ message }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const data = await response.json();
        addMessage(data.response, 'assistant');
      } catch (error) {
        console.error('Error sending message:', error);
        addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
      }
    });

    // Function to add messages to chat
    function addMessage(content, role) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${role}`;
      messageDiv.innerHTML = `
        <div class="message-avatar">
          <img src="https://ui-avatars.com/api/?name=${role === 'user' ? 'You' : 'Bot'}&background=random" alt="${role}">
        </div>
        <div class="message-content">${content}</div>
      `;
      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Fetch chatbot configuration
    const response = await fetch(`${apiDomain}/api/chatbots/${chatbotUuid}`, {
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch chatbot configuration');
    }

    const config = await response.json();
    console.log('Chatbot configuration:', config);

    // Store configuration for later use
    window.chatbotConfig = config;

    // Update chat interface with configuration
    if (config.name) {
      chatInterface.querySelector('.chatbot-header span').textContent = config.name;
    }
    if (config.primaryColor) {
      chatInterface.querySelector('.chatbot-header').style.background = config.primaryColor;
      chatInterface.querySelector('.chatbot-input button').style.background = config.primaryColor;
      chatBubble.style.background = config.primaryColor;
    }
    if (config.logoUrl) {
      chatBubble.querySelector('img').src = config.logoUrl;
    }
    if (config.avatarUrl) {
      const avatarUrl = config.avatarUrl.startsWith('http') 
        ? config.avatarUrl 
        : `${apiDomain}${config.avatarUrl}`;
      document.querySelectorAll('.message-avatar img').forEach(img => {
        if (img.alt === 'Bot') {
          img.src = avatarUrl;
        }
      });
    }
    if (config.bubbleMessage) {
      chatBubble.title = config.bubbleMessage;
    }
    if (config.welcomeMessage) {
      addMessage(config.welcomeMessage, 'assistant');
    }

  } catch (error) {
    console.error('Error initializing chatbot:', error);
  }
} 