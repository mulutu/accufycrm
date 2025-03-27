(function() {
  // Get the script element
  const script = document.currentScript;
  
  // Get configuration from data attributes
  const config = {
    uuid: script.getAttribute('data-chatbot-uuid'),
    width: script.getAttribute('data-iframe-width') || '400',
    height: script.getAttribute('data-iframe-height') || '600'
  };

  // Create the chat button
  const button = document.createElement('button');
  button.className = 'accufy-chat-button';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #2563eb;
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
  `;

  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;

  // Create the iframe container
  const container = document.createElement('div');
  container.className = 'accufy-chat-container';
  container.style.cssText = `
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: ${config.width}px;
    height: ${config.height}px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 9999;
    display: none;
  `;

  // Create the iframe
  const iframe = document.createElement('iframe');
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 8px;
  `;

  // Set the iframe source
  const appUrl = script.src.split('/vendor')[0];
  iframe.src = `${appUrl}/chatbot/${config.uuid}`;

  // Add the iframe to the container
  container.appendChild(iframe);

  // Add elements to the page
  document.body.appendChild(button);
  document.body.appendChild(container);

  // Handle button click
  button.addEventListener('click', () => {
    const isVisible = container.style.display === 'block';
    container.style.display = isVisible ? 'none' : 'block';
    button.style.transform = isVisible ? 'none' : 'scale(0.95)';
  });

  // Handle messages from the iframe
  window.addEventListener('message', (event) => {
    // Verify the origin matches the app URL
    if (event.origin !== appUrl) return;

    // Handle different message types
    switch (event.data.type) {
      case 'close':
        container.style.display = 'none';
        button.style.transform = 'none';
        break;
      // Add more message handlers as needed
    }
  });

  // Handle clicks outside the chat
  document.addEventListener('click', (event) => {
    if (!container.contains(event.target) && !button.contains(event.target)) {
      container.style.display = 'none';
      button.style.transform = 'none';
    }
  });
})(); 