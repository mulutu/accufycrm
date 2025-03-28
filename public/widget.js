(function() {
  // Check if config is provided
  if (!window.AI_CHAT_CRM_CONFIG) {
    console.error('AI Chat CRM: Configuration is missing. Please add the configuration script before loading the widget.');
    return;
  }

  const config = window.AI_CHAT_CRM_CONFIG;
  const { chatbotId, name, logoUrl, avatarUrl, primaryColor = '#000000', theme = 'light', welcomeMessage = 'Hello! How can I help you today?', apiUrl } = config;

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
    padding: 8px 16px;
    border-radius: 9999px;
    background-color: ${primaryColor};
    color: white;
    border: none;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    transition: transform 0.2s ease;
  `;

  // Add chat icon and text
  chatButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
    Hi! 👋 Click me to start chatting
  `;

  // Create chat window
  const chatWindow = document.createElement('div');
  chatWindow.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 350px;
    height: 500px;
    background-color: ${theme === 'light' ? '#ffffff' : '#1a1a1a'};
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
    display: none;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid ${theme === 'light' ? '#e5e7eb' : '#333333'};
  `;

  // Create chat header
  const chatHeader = document.createElement('div');
  chatHeader.style.cssText = `
    padding: 16px;
    background-color: ${primaryColor};
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  `;

  // Add logo and title container
  const headerLeft = document.createElement('div');
  headerLeft.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
  `;

  // Add logo if available
  if (logoUrl) {
    const logo = document.createElement('img');
    logo.src = logoUrl;
    logo.style.cssText = `
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    `;
    headerLeft.appendChild(logo);
  }

  // Add title
  const title = document.createElement('span');
  title.textContent = name;
  title.style.cssText = `
    font-weight: 600;
    color: white;
  `;
  headerLeft.appendChild(title);

  // Add close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '✕';
  closeButton.style.cssText = `
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 18px;
    padding: 4px;
  `;

  chatHeader.appendChild(headerLeft);
  chatHeader.appendChild(closeButton);

  // Create chat messages container
  const messagesContainer = document.createElement('div');
  messagesContainer.style.cssText = `
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
  `;

  // Create input container
  const inputContainer = document.createElement('form');
  inputContainer.style.cssText = `
    padding: 16px;
    border-top: 1px solid ${theme === 'light' ? '#e5e7eb' : '#333333'};
    margin-top: auto;
  `;

  // Create input wrapper div
  const inputWrapper = document.createElement('div');
  inputWrapper.style.cssText = `
    display: flex;
    gap: 8px;
  `;

  // Create input field
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Type your message...';
  input.style.cssText = `
    flex: 1;
    padding: 8px;
    border: 1px solid ${primaryColor};
    border-radius: 8px;
    background-color: ${theme === 'light' ? '#ffffff' : '#1a1a1a'};
    color: ${theme === 'light' ? '#000000' : '#ffffff'};
    font-size: 14px;
    min-width: 0;
    outline: none;
  `;

  // Add focus styles to input
  input.addEventListener('focus', () => {
    input.style.boxShadow = `0 0 0 2px ${primaryColor}40`;
  });
  input.addEventListener('blur', () => {
    input.style.boxShadow = 'none';
  });

  // Create send button
  const sendButton = document.createElement('button');
  sendButton.type = 'submit';
  sendButton.textContent = 'Send';
  sendButton.style.cssText = `
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    background-color: ${primaryColor};
    color: white;
    cursor: pointer;
    font-size: 14px;
    transition: opacity 0.2s ease;
  `;

  // Add hover effect to send button
  sendButton.addEventListener('mouseover', () => {
    sendButton.style.opacity = '0.9';
  });
  sendButton.addEventListener('mouseout', () => {
    sendButton.style.opacity = '1';
  });

  // Assemble input area
  inputWrapper.appendChild(input);
  inputWrapper.appendChild(sendButton);
  inputContainer.appendChild(inputWrapper);

  // Assemble chat window
  chatWindow.appendChild(chatHeader);
  chatWindow.appendChild(messagesContainer);
  chatWindow.appendChild(inputContainer);

  // Add elements to container
  container.appendChild(chatWindow);
  container.appendChild(chatButton);

  // Add container to page
  document.body.appendChild(container);

  // Add welcome message
  const welcomeMessageDiv = document.createElement('div');
  welcomeMessageDiv.style.cssText = `
    align-self: flex-start;
    background-color: ${theme === 'light' ? '#f3f4f6' : '#2d2d2d'};
    color: ${theme === 'light' ? '#000000' : '#ffffff'};
    padding: 12px 16px;
    border-radius: 12px;
    max-width: 80%;
  `;
  welcomeMessageDiv.textContent = welcomeMessage;
  messagesContainer.appendChild(welcomeMessageDiv);

  // Toggle chat window
  chatButton.addEventListener('click', () => {
    const isVisible = chatWindow.style.display === 'flex';
    chatWindow.style.display = isVisible ? 'none' : 'flex';
    chatButton.style.transform = isVisible ? 'none' : 'scale(0.95)';
  });

  // Close chat window
  closeButton.addEventListener('click', () => {
    chatWindow.style.display = 'none';
    chatButton.style.transform = 'none';
  });

  // Handle message sending
  inputContainer.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    // Add user message to chat
    const userMessage = document.createElement('div');
    userMessage.style.cssText = `
      align-self: flex-end;
      background-color: ${primaryColor};
      color: white;
      padding: 12px 16px;
      border-radius: 12px;
      max-width: 80%;
    `;
    userMessage.textContent = message;
    messagesContainer.appendChild(userMessage);

    // Clear input
    input.value = '';

    try {
      // Send message to API
      const response = await fetch(`${apiUrl}/api/chatbots/${chatbotId}/chat`, {
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
      
      // Add bot message to chat
      const botMessage = document.createElement('div');
      botMessage.style.cssText = `
        align-self: flex-start;
        background-color: ${theme === 'light' ? '#f3f4f6' : '#2d2d2d'};
        color: ${theme === 'light' ? '#000000' : '#ffffff'};
        padding: 12px 16px;
        border-radius: 12px;
        max-width: 80%;
      `;
      botMessage.textContent = data.message;
      messagesContainer.appendChild(botMessage);

      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.style.cssText = `
        align-self: flex-start;
        background-color: #fee2e2;
        color: #dc2626;
        padding: 12px 16px;
        border-radius: 12px;
        max-width: 80%;
      `;
      errorMessage.textContent = 'Sorry, there was an error sending your message. Please try again.';
      messagesContainer.appendChild(errorMessage);
    }
  });

  // Scroll to bottom when new messages are added
  const observer = new MutationObserver(() => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });
  observer.observe(messagesContainer, { childList: true, subtree: true });
})(); 