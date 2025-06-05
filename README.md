# Context-Aware Fact Checking Platform

A comprehensive AI-powered fact-checking platform that provides context-aware statement verification, speaker credibility tracking, and real-time misinformation monitoring.

## 🚀 Features

### Core Fact-Checking
- **Multi-AI Verification**: Utilizes 4 AI models (Cohere, Gemini, Mistral, Perplexity) for comprehensive analysis
- **Dynamic Model Selection**: Automatically excludes unavailable models and adjusts weighting
- **Confidence Scoring**: Provides reliability metrics for each verification

### Context-Aware Analysis (NEW)
- **Speaker Tracking**: Monitor WHO said what with credibility scoring
- **Historical Patterns**: Track accuracy trends over time for public figures
- **Source Assessment**: Evaluate credibility and bias of statement sources
- **Temporal Context**: Track WHEN statements were made for better context
- **Risk Factor Analysis**: Identify contextual elements that increase misinformation risk

### Misinformation Intelligence
- **Real-time Monitoring**: Track viral claims across social media platforms
- **Alert System**: Automated alerts for rapidly spreading false information
- **Virality Scoring**: Calculate spread velocity and reach metrics
- **Platform Analytics**: Monitor cross-platform amplification patterns

### User Features
- **Subscription Tiers**: Free and premium plans with usage limits
- **History Tracking**: Save and organize fact-checked statements
- **Interactive Dashboard**: Comprehensive interface for all features
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **TanStack Query** for data fetching
- **Wouter** for routing

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Drizzle ORM** with PostgreSQL
- **Passport.js** with OpenID Connect (Replit Auth)
- **Express Sessions** for authentication

### AI Services
- **Cohere Command R+** - Advanced reasoning and analysis
- **Google Gemini** - Multimodal understanding
- **Mistral** - Efficient language processing
- **Perplexity** - Real-time web search and analysis

### Database
- **PostgreSQL** with Neon serverless
- **Session storage** for authentication
- **Comprehensive schema** for fact-checks, users, and context data

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- API keys for AI services:
  - Cohere API key
  - Google Gemini API key
  - Mistral API key
  - Perplexity API key
  - Anthropic API key (optional)
  - OpenAI API key (optional)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd fact-checking-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file with:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   SESSION_SECRET=your_session_secret
   COHERE_API_KEY=your_cohere_key
   GEMINI_API_KEY=your_gemini_key
   MISTRAL_API_KEY=your_mistral_key
   PERPLEXITY_API_KEY=your_perplexity_key
   ANTHROPIC_API_KEY=your_anthropic_key (optional)
   OPENAI_API_KEY=your_openai_key (optional)
   SENDGRID_API_KEY=your_sendgrid_key (for contact form)
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5000`

## 📁 Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── contexts/       # React contexts
├── server/                 # Backend Express application
│   ├── routes/             # API route handlers
│   ├── services/           # Business logic and AI integrations
│   ├── db.ts              # Database connection
│   └── storage.ts         # Data access layer
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema and types
└── migrations/            # Database migrations
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio for database management

## 🌟 Key Features Explained

### Context-Aware Fact Checking
The platform tracks not just whether statements are true or false, but:
- **Who** made the statement (speaker credibility tracking)
- **When** it was made (temporal context)
- **Where** it was said (source reliability)
- **Why** it might be risky (contextual risk factors)

### Misinformation Intelligence
Real-time monitoring system that:
- Tracks viral claims across platforms
- Calculates spread velocity and reach
- Generates alerts for trending false information
- Provides comprehensive misinformation reports

### Multi-AI Verification
Sophisticated fact-checking using multiple AI models:
- Dynamic model selection based on availability
- Weighted scoring system for balanced results
- Confidence metrics for reliability assessment
- Fallback mechanisms for service failures

## 🔐 Security Features

- Secure session management with PostgreSQL storage
- OpenID Connect authentication via Replit
- API key protection and validation
- Input sanitization and validation
- HTTPS enforcement in production

## 📱 User Interface

### Main Dashboard
- Fact-checking interface with context input
- Recent checks and trending facts
- Subscription status and usage metrics

### Context-Aware Interface
- Statement analysis with speaker/source context
- Active misinformation alerts dashboard
- Trending viral claims monitoring
- Speaker credibility reports

### Navigation
- Responsive burger menu with featured items
- Theme switching (light/dark mode)
- User profile and authentication status

## 🚀 Deployment

The application is designed for deployment on platforms like:
- **Replit** (recommended)
- **Vercel**
- **Netlify**
- **Railway**
- **Render**

Environment variables must be configured on your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

The AGPL-3.0 ensures that this fact-checking technology remains free and open source. If you modify and deploy this software on a server that users interact with, you must make the source code available to those users.

## 🆘 Support

For support and questions:
- Open an issue on GitHub
- Contact via the application's contact form
- Email: lewiseydman@gmail.com

## 🔮 Roadmap

- [ ] Mobile application
- [ ] Browser extension
- [ ] Advanced NLP for claim similarity detection
- [ ] Integration with fact-checking databases
- [ ] API for third-party integrations
- [ ] Advanced analytics and reporting
- [ ] Multi-language support