# WebGenie

WebGenie is a full-stack, developer-friendly website generator that uses NLP-powered prompt interpretation to dynamically create websites. It supports any technology stack of your choice, generates both frontend content and backend operations, pushes the code directly to GitHub, and even provides a hosted link for your project.

Stop repeating the same project setup steps over and over. Let WebGenie handle the boilerplate so you can focus on real development.

### Live Demo: [webgenie.ishaanminocha.in](https://webgenie.ishaanminocha.in/)

## Technologies Used

- Next.js
- Gemini API
- Swagger Editor
- GrapeJS
- GitHub API
- And more!

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- MongoDB (local or cloud instance)
- GitHub account (for OAuth and repo integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vansh-561/WebGenie.git
   cd WebGenie
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory and add the following variables:
   ```env
   # MongoDB
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/webgenie

   # NextAuth
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000

   # GitHub OAuth
   GITHUB_ID=your_github_oauth_client_id
   GITHUB_SECRET=your_github_oauth_client_secret

   # OpenAI (optional, if using OpenAI)
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_ORGANIZATION=your_openai_organization_id
   OPENAI_PROJECT=your_openai_project_id

   # Gemini API
   GEMINI_API_KEY=your_gemini_api_key

   # Stripe (optional, for premium features)
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_PRODUCT_ID=your_stripe_product_id
   NEXT_PUBLIC_STRIPE_PAYMENT_LINK=your_stripe_payment_link

   # Vercel (optional, for deployments)
   VERCEL_TOKEN=your_vercel_token
   VERCEL_TEAM_ID=your_vercel_team_id
   DEPLOY_BASE_DOMAIN=your_deployment_domain
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   
   Visit [http://localhost:3000](http://localhost:3000) to see the application in action.

## Environment Variables Explained

| Variable | Description | Required |
|----------|-------------|----------|
| MONGODB_URI | MongoDB connection string | Yes |
| NEXTAUTH_SECRET | Secret key for NextAuth | Yes |
| NEXTAUTH_URL | Base URL of your app | Yes |
| GITHUB_ID | GitHub OAuth app client ID | Yes |
| GITHUB_SECRET | GitHub OAuth app client secret | Yes |
| GEMINI_API_KEY | Google Gemini API key | Yes |
| OPENAI_API_KEY | OpenAI API key | No |
| STRIPE_SECRET_KEY | Stripe secret key | No |
| VERCEL_TOKEN | Vercel access token | No |

## Setting Up OAuth Credentials

### GitHub OAuth

1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the Client ID and generate a new Client Secret

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT
