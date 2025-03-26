# AI Chat CRM

A SaaS eCRM web application that allows users to configure AI ChatBots for their websites, utilizing RAG technology for intelligent responses based on their own data.

## Features

- **Responsive Landing Page**: Modern and engaging landing page with sections for features, pricing, and FAQs
- **User Authentication**: Secure login and registration with NextAuth
- **Dashboard with Analytics**: Track conversation metrics, popular queries, and user engagement
- **Chatbot Management**: Create, configure, and manage multiple chatbots
- **RAG Technology**: Upload documents, websites, and other data sources to train chatbots
- **Embedding Options**: Generate embed code to integrate chatbots on any website
- **Branding Options**: Customize colors, fonts, and appearance to match your brand
- **Admin Portal**: Manage users, system configurations, and monitor platform usage

## Tech Stack

- **Frontend**: NextJS, React, Tailwind CSS, TypeScript, Shadcn UI
- **Backend**: NextJS API Routes, LangChain
- **Database**: MySQL with Prisma ORM
- **AI**: Google Gemini AI
- **Authentication**: NextAuth.js

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- MySQL database
- Google Gemini API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/ai-chat-crm.git
cd ai-chat-crm
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
# Database
DATABASE_URL="mysql://user:password@localhost:3306/ai_chat_crm"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Google Gemini
GOOGLE_API_KEY=your-gemini-api-key
```

4. Initialize the database
```bash
npm run prisma:migrate
npm run prisma:generate
```

5. Start the development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
ai-chat-crm/
├── prisma/             # Database schema and migrations
├── public/             # Static assets
├── src/                # Source code
│   ├── app/            # Next.js app router
│   │   ├── (admin)/    # Admin panel routes
│   │   ├── (dashboard)/# User dashboard routes
│   │   ├── (landing)/  # Landing page routes
│   │   ├── api/        # API endpoints
│   │   └── auth/       # Authentication routes
│   ├── components/     # React components
│   │   ├── auth/       # Authentication components
│   │   ├── chatbot/    # Chatbot components
│   │   ├── dashboard/  # Dashboard components
│   │   └── ui/         # UI components (Shadcn)
│   ├── lib/            # Utility functions and libraries
│   │   ├── ai/         # AI/LangChain integration
│   │   ├── auth.ts     # Auth configuration
│   │   └── prisma.ts   # Prisma client
│   └── types/          # TypeScript types
├── .env                # Environment variables
├── .gitignore          # Git ignore file
├── package.json        # Dependencies and scripts
└── README.md           # Project documentation
```

## Key Components

### Chatbot Widget

The chatbot widget can be embedded on any website using the generated embed code. It uses a JavaScript snippet that loads the chatbot from the API and renders it on the page.

### RAG Integration

The application uses Retrieval-Augmented Generation (RAG) to provide accurate responses based on the user's data sources. The integration with LangChain handles:

1. Document processing and chunk extraction
2. Semantic search for relevant content
3. Context-aware AI responses using Google Gemini

### Analytics

The application provides detailed analytics for chatbot interactions, including:

- Conversation volume
- Popular queries
- User engagement metrics
- Geographic distribution

## Deployment

### Production Build

1. Build the application
```bash
npm run build
```

2. Start the production server
```bash
npm start
```

### Deployment Options

- **Vercel**: Recommended for easy deployment
- **AWS/GCP/Azure**: For more control over infrastructure
- **Docker**: Containerization for consistent deployment

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [LangChain](https://js.langchain.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [Google Gemini AI](https://ai.google.dev/)
