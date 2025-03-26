(function() {
  // Check if config is provided
  if (!window.AI_CHAT_CRM_CONFIG) {
    console.error('AI Chat CRM: Configuration is missing. Please add the configuration script before loading the widget.');
    return;
  }

  const config = window.AI_CHAT_CRM_CONFIG;
  const { chatbotId, name, logoUrl, avatarUrl, theme = 'light' } = config;

  // Create widget container
  const container = document.createElement('div');
  container.id = 'ai-chat-crm-widget';
  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  `;

  // Create chat button
  const chatButton = document.createElement('button');
  chatButton.style.cssText = `
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: ${theme === 'light' ? '#ffffff' : '#1a1a1a'};
    border: none;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
  `;

  // Add logo or default icon
  if (logoUrl) {
    const img = document.createElement('img');
    img.src = logoUrl;
    img.style.cssText = `
      width: 32px;
      height: 32px;
      object-fit: contain;
    `;
    chatButton.appendChild(img);
  } else {
    chatButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    `;
  }

  // Create chat window
  const chatWindow = document.createElement('div');
  chatWindow.style.cssText = `
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: 350px;
    height: 500px;
    background-color: ${theme === 'light' ? '#ffffff' : '#1a1a1a'};
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
    display: none;
    flex-direction: column;
    overflow: hidden;
  `;

  // Create chat header
  const chatHeader = document.createElement('div');
  chatHeader.style.cssText = `
    padding: 16px;
    background-color: ${theme === 'light' ? '#f5f5f5' : '#2d2d2d'};
    display: flex;
    align-items: center;
    gap: 12px;
  `;

  // Add avatar
  if (avatarUrl) {
    const avatar = document.createElement('img');
    avatar.src = avatarUrl;
    avatar.style.cssText = `
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    `;
    chatHeader.appendChild(avatar);
  }

  // Add title
  const title = document.createElement('span');
  title.textContent = name;
  title.style.cssText = `
    font-weight: 600;
    color: ${theme === 'light' ? '#000000' : '#ffffff'};
  `;
  chatHeader.appendChild(title);

  // Create chat messages container
  const messagesContainer = document.createElement('div');
  messagesContainer.style.cssText = `
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  `;

  // Create input container
  const inputContainer = document.createElement('div');
  inputContainer.style.cssText = `
    padding: 16px;
    border-top: 1px solid ${theme === 'light' ? '#e5e5e5' : '#2d2d2d'};
    display: flex;
    gap: 8px;
  `;

  // Create input field
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Type your message...';
  input.style.cssText = `
    flex: 1;
    padding: 8px 12px;
    border: 1px solid ${theme === 'light' ? '#e5e5e5' : '#2d2d2d'};
    border-radius: 6px;
    background-color: ${theme === 'light' ? '#ffffff' : '#1a1a1a'};
    color: ${theme === 'light' ? '#000000' : '#ffffff'};
  `;

  // Create send button
  const sendButton = document.createElement('button');
  sendButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 2L11 13"></path>
      <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
    </svg>
  `;
  sendButton.style.cssText = `
    padding: 8px;
    border: none;
    border-radius: 6px;
    background-color: #0070f3;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  // Assemble chat window
  inputContainer.appendChild(input);
  inputContainer.appendChild(sendButton);
  chatWindow.appendChild(chatHeader);
  chatWindow.appendChild(messagesContainer);
  chatWindow.appendChild(inputContainer);

  // Add elements to container
  container.appendChild(chatWindow);
  container.appendChild(chatButton);

  // Add container to page
  document.body.appendChild(container);

  // Toggle chat window
  chatButton.addEventListener('click', () => {
    const isVisible = chatWindow.style.display === 'flex';
    chatWindow.style.display = isVisible ? 'none' : 'flex';
    chatButton.style.transform = isVisible ? 'none' : 'scale(0.9)';
  });

  // Handle message sending
  async function sendMessage(message) {
    // Add user message to chat
    const userMessage = document.createElement('div');
    userMessage.style.cssText = `
      align-self: flex-end;
      background-color: #0070f3;
      color: white;
      padding: 8px 12px;
      border-radius: 12px;
      max-width: 80%;
    `;
    userMessage.textContent = message;
    messagesContainer.appendChild(userMessage);

    // Clear input
    input.value = '';

    try {
      // Send message to API
      const response = await fetch(`${window.location.origin}/api/chatbots/${chatbotId}/chat`, {
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

      // Add bot response to chat
      const botMessage = document.createElement('div');
      botMessage.style.cssText = `
        align-self: flex-start;
        background-color: ${theme === 'light' ? '#f5f5f5' : '#2d2d2d'};
        color: ${theme === 'light' ? '#000000' : '#ffffff'};
        padding: 8px 12px;
        border-radius: 12px;
        max-width: 80%;
      `;
      botMessage.textContent = data.response;
      messagesContainer.appendChild(botMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = document.createElement('div');
      errorMessage.style.cssText = `
        align-self: flex-start;
        background-color: #ff4444;
        color: white;
        padding: 8px 12px;
        border-radius: 12px;
        max-width: 80%;
      `;
      errorMessage.textContent = 'Sorry, there was an error processing your message.';
      messagesContainer.appendChild(errorMessage);
    }

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Handle input submission
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      sendMessage(input.value.trim());
    }
  });

  sendButton.addEventListener('click', () => {
    if (input.value.trim()) {
      sendMessage(input.value.trim());
    }
  });
})(); 