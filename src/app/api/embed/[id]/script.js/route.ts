import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chatbotId = params.id;
    
    // Get the chatbot details
    const chatbot = await prisma.chatbot.findUnique({
      where: { id: chatbotId },
      select: {
        id: true,
        name: true,
        primaryColor: true,
        textColor: true,
        fontFamily: true,
        logoUrl: true,
        welcomeMessage: true,
      },
    });
    
    if (!chatbot) {
      return NextResponse.json(
        { error: "Chatbot not found" },
        { status: 404 }
      );
    }
    
    // The origin for API calls
    const origin = req.headers.get("host") || "";
    const protocol = origin.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${origin}`;
    
    // The actual JavaScript embed code
    const script = `
/*!
 * AI Chat CRM Widget
 * v1.0.0
 */
(function() {
  const AIChatCRM = {
    chatbotId: "${chatbot.id}",
    apiUrl: "${baseUrl}",
    config: {
      primaryColor: "${chatbot.primaryColor || "#3B82F6"}",
      textColor: "${chatbot.textColor || "#FFFFFF"}",
      fontFamily: "${chatbot.fontFamily || "inherit"}",
      logoUrl: "${chatbot.logoUrl || ""}",
      welcomeMessage: "${chatbot.welcomeMessage || "Hi there! How can I help you today?"}",
      position: "bottom-right"
    },
    
    init: function(options = {}) {
      // Merge options with default config
      this.config = {...this.config, ...options};
      
      if (options.chatbotId) {
        this.chatbotId = options.chatbotId;
      }
      
      // Create widget container if it doesn't exist
      if (!document.getElementById('ai-chat-crm-container')) {
        this.createWidgetContainer();
      }
      
      // Load styles
      this.loadStyles();
      
      // Render the widget
      this.render();
    },
    
    loadStyles: function() {
      const style = document.createElement('style');
      style.textContent = \`
        #ai-chat-crm-container * {
          box-sizing: border-box;
          font-family: \${this.config.fontFamily};
        }
        
        #ai-chat-crm-widget-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: \${this.config.primaryColor};
          color: \${this.config.textColor};
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          position: fixed;
          z-index: 9999;
          bottom: 20px;
          transition: all 0.3s ease;
        }
        
        #ai-chat-crm-widget-button:hover {
          transform: scale(1.05);
        }
        
        #ai-chat-crm-widget-button svg {
          width: 24px;
          height: 24px;
        }
        
        #ai-chat-crm-chat-window {
          position: fixed;
          bottom: 90px;
          width: 350px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          max-height: 500px;
          transition: all 0.3s ease;
          opacity: 0;
          transform: translateY(20px);
          pointer-events: none;
        }
        
        #ai-chat-crm-chat-window.open {
          opacity: 1;
          transform: translateY(0);
          pointer-events: all;
        }
        
        #ai-chat-crm-chat-header {
          background-color: \${this.config.primaryColor};
          color: \${this.config.textColor};
          padding: 15px;
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        #ai-chat-crm-chat-close {
          cursor: pointer;
          background: none;
          border: none;
          color: \${this.config.textColor};
          opacity: 0.8;
        }
        
        #ai-chat-crm-chat-close:hover {
          opacity: 1;
        }
        
        #ai-chat-crm-chat-body {
          padding: 15px;
          overflow-y: auto;
          flex-grow: 1;
          max-height: 300px;
        }
        
        .ai-chat-crm-message {
          margin-bottom: 10px;
          max-width: 80%;
          padding: 10px;
          border-radius: 10px;
          position: relative;
          word-wrap: break-word;
        }
        
        .ai-chat-crm-message-user {
          background-color: \${this.config.primaryColor};
          color: \${this.config.textColor};
          margin-left: auto;
        }
        
        .ai-chat-crm-message-bot {
          background-color: #f0f0f0;
          color: #333;
        }
        
        .ai-chat-crm-message-time {
          font-size: 10px;
          opacity: 0.7;
          text-align: right;
          margin-top: 5px;
        }
        
        #ai-chat-crm-chat-input-container {
          padding: 10px;
          border-top: 1px solid #eee;
        }
        
        #ai-chat-crm-chat-form {
          display: flex;
          gap: 10px;
        }
        
        #ai-chat-crm-chat-input {
          flex-grow: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 20px;
          outline: none;
        }
        
        #ai-chat-crm-chat-send {
          background-color: \${this.config.primaryColor};
          color: \${this.config.textColor};
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        #ai-chat-crm-chat-send:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      \`;
      document.head.appendChild(style);
    },
    
    createWidgetContainer: function() {
      const container = document.createElement('div');
      container.id = 'ai-chat-crm-container';
      document.body.appendChild(container);
    },
    
    render: function() {
      const container = document.getElementById('ai-chat-crm-container');
      
      // Set widget position
      const positionClass = this.config.position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;';
      
      // Create chat button
      container.innerHTML = \`
        <div id="ai-chat-crm-widget-button" style="\${positionClass}">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        
        <div id="ai-chat-crm-chat-window" style="\${positionClass}">
          <div id="ai-chat-crm-chat-header">
            <div class="ai-chat-crm-header-title">
              ${chatbot.name || "Chat Support"}
            </div>
            <button id="ai-chat-crm-chat-close">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div id="ai-chat-crm-chat-body">
            <div class="ai-chat-crm-message ai-chat-crm-message-bot">
              \${this.config.welcomeMessage}
              <div class="ai-chat-crm-message-time">\${new Date().toLocaleTimeString()}</div>
            </div>
          </div>
          
          <div id="ai-chat-crm-chat-input-container">
            <form id="ai-chat-crm-chat-form">
              <input 
                type="text" 
                id="ai-chat-crm-chat-input" 
                placeholder="Type your message..."
                autocomplete="off"
              />
              <button type="submit" id="ai-chat-crm-chat-send">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          </div>
        </div>
      \`;
      
      // Add event listeners
      this.addEventListeners();
    },
    
    addEventListeners: function() {
      const button = document.getElementById('ai-chat-crm-widget-button');
      const closeBtn = document.getElementById('ai-chat-crm-chat-close');
      const chatWindow = document.getElementById('ai-chat-crm-chat-window');
      const chatForm = document.getElementById('ai-chat-crm-chat-form');
      const chatInput = document.getElementById('ai-chat-crm-chat-input');
      
      if (button) {
        button.addEventListener('click', () => {
          chatWindow?.classList.toggle('open');
          chatInput?.focus();
        });
      }
      
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          chatWindow?.classList.remove('open');
        });
      }
      
      if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const input = chatInput as HTMLInputElement;
          if (input && input.value.trim()) {
            this.sendMessage(input.value);
            input.value = '';
          }
        });
      }
    },
    
    sendMessage: async function(message) {
      // Add user message to chat
      this.addMessage(message, 'user');
      
      try {
        // Send message to API
        const response = await fetch(\`\${this.apiUrl}/api/chat/\${this.chatbotId}\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message,
            // Add conversationId if we have one
            ...(this.conversationId && { conversationId: this.conversationId }),
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to get response');
        }
        
        const data = await response.json();
        
        // Store the conversation ID for future messages
        if (data.conversationId) {
          this.conversationId = data.conversationId;
        }
        
        // Add bot response to chat
        this.addMessage(data.message, 'bot');
      } catch (error) {
        console.error('Error sending message:', error);
        this.addMessage('Sorry, there was an error processing your request.', 'bot');
      }
    },
    
    addMessage: function(content, role) {
      const chatBody = document.getElementById('ai-chat-crm-chat-body');
      if (!chatBody) return;
      
      const messageEl = document.createElement('div');
      messageEl.className = \`ai-chat-crm-message ai-chat-crm-message-\${role}\`;
      
      const timestamp = new Date().toLocaleTimeString();
      
      messageEl.innerHTML = \`
        \${content}
        <div class="ai-chat-crm-message-time">\${timestamp}</div>
      \`;
      
      chatBody.appendChild(messageEl);
      
      // Scroll to bottom
      chatBody.scrollTop = chatBody.scrollHeight;
    },
    
    destroy: function() {
      const container = document.getElementById('ai-chat-crm-container');
      if (container) {
        container.remove();
      }
    }
  };
  
  // Export to global scope
  window.AIChatCRM = AIChatCRM;
  
  // Auto-initialize if the widget container exists
  const widgetContainer = document.getElementById('ai-chat-crm-widget');
  if (widgetContainer) {
    const chatbotId = widgetContainer.getAttribute('data-chatbot-id');
    if (chatbotId) {
      AIChatCRM.init({ chatbotId });
    }
  }
})();`;
    
    // Set content type header so browsers interpret it as JavaScript
    return new NextResponse(script, {
      headers: {
        "Content-Type": "application/javascript",
        // Cache for up to an hour
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error serving embed script:", error);
    return NextResponse.json(
      { error: "Failed to serve embed script" },
      { status: 500 }
    );
  }
} 