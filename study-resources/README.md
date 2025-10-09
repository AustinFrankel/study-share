# StudyShare - Class-Specific Study Resources

A production-ready web application for sharing and discovering study materials specific to schools, teachers, and classes. Features AI-powered practice question generation from uploaded materials.

## Features

### Brain Dump

The Brain Dump feature allows students to collaborate on class notes:

1. **Classes as Shared Spaces**: Each course has its own dedicated space where students can join and instantly see shared notes.

2. **Note Uploading**: Students can contribute by typing or pasting their notes. Uploads go into a "pending" area before being added to the master notes.

3. **AI-Guided Curation**: The system intelligently processes notes to add new content, skip duplicates, and clean up messy content.

4. **Master Notes Document**: For each class, there's one continuously updated "master doc" that everyone can access.

5. **Viewing & Studying**: Students can easily access the most recent, organized notes without digging through multiple uploads.

6. **Community Feel**: Contributors get credited with their name or nickname, and there's an option to comment or suggest edits.

### Core Features

- **Anonymous Authentication**: Magic link sign-in with anonymous handles (e.g., "cobalt-walrus-512")
- **Class-Specific Organization**: Resources organized by School → Teacher → Class hierarchy
- **AI Practice Generation**: Automatic conversion of study materials into interactive practice questions
- **Reddit-Style Comments**: Threaded discussions with real-time updates
- **Gamification**: Points, badges, and leaderboards for community engagement
- **Content Safety**: Automatic blocking of live exam materials
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
- **Deployment**: Vercel (production), Local development server

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- A Supabase project (free tier works)

### Environment Variables

Create a `.env.local` file in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: For edge functions
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

You can find these values in your Supabase project dashboard:
1. Go to Settings → API
2. Copy the Project URL and anon/public key
3. Copy the service_role key (for server-side operations)

### Installation Steps

1. **Clone and install dependencies:**
   ```bash
   cd study-resources
   npm install
   ```

2. **Set up Supabase database:**
   
   Run the SQL migrations in your Supabase SQL editor (in order):
   
   - `supabase/migrations/001_initial_schema.sql` - Creates all tables
   - `supabase/migrations/002_indexes.sql` - Adds performance indexes
   - `supabase/migrations/003_rls_policies.sql` - Sets up security policies

3. **Set up Storage Bucket (required for file uploads):**
   
   In your Supabase dashboard, go to Storage and create a new bucket:
   - Bucket name: `resources`
   - Public bucket: `Yes`
   - File size limit: `10MB`
   
   Or run this SQL in your Supabase SQL editor:
   ```sql
   INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true);
   ```

4. **Deploy Edge Functions (optional for full functionality):**
   ```bash
   # Install Supabase CLI first: https://supabase.com/docs/guides/cli
   supabase functions deploy regenerate-handle
   supabase functions deploy process-resource
   ```

5. **Seed the database with sample data (optional):**
   ```bash
   npm run seed
   ```
   This will create sample schools, users, classes, and resources for testing.

6. **Start the development server:**
   ```bash
   npm run dev
   ```

7. **Visit the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

### Core Tables

- **users**: Anonymous user profiles with generated handles
- **schools**: Educational institutions
- **subjects**: Academic subjects (Math, Science, etc.)
- **teachers**: Faculty members linked to schools
- **classes**: Specific courses taught by teachers
- **resources**: Study materials uploaded by users
- **files**: File attachments for resources
- **ai_derivatives**: AI-generated practice content
- **comments**: Threaded discussions on resources
- **votes**: Upvote/downvote system
- **tags**: Resource categorization
- **flags**: Content reporting system
- **points_ledger**: Gamification scoring

### Key Features

- **Row Level Security (RLS)**: Protects user data and content
- **Full-text search**: Trigram indexes for fuzzy search
- **Real-time updates**: Live comments and voting
- **File storage**: Supabase Storage for PDFs and images

## Application Structure

### Core Pages

- `/` - Home page with search and recent resources
- `/schools` - Browse by school
- `/search` - Search results with filters
- `/upload` - Three-step upload wizard
- `/resource/[id]` - Individual resource with AI practice view
- `/profile` - User profile and handle management

### Key Components

- **Navigation**: Auth-aware header with search
- **SearchBar**: Global search with autocomplete
- **FacetFilters**: School/Teacher/Subject/Type filtering
- **ResourceCard**: Resource preview cards with voting
- **UploadWizard**: Multi-step file upload process
- **PracticeView**: Interactive AI-generated questions

### AI Pipeline

1. **File Processing**: OCR for images/PDFs to extract text
2. **Content Analysis**: LLM generates structured practice content
3. **Safety Check**: Classifies and blocks live exam materials
4. **HTML Rendering**: Creates interactive practice interface

## Development Workflow

### Adding New Features

1. Update database schema in `supabase/migrations/`
2. Update TypeScript types in `src/lib/types.ts`
3. Create/update components in `src/components/`
4. Add pages in `src/app/`
5. Test locally at `http://localhost:3000`

### Code Organization

```
src/
├── app/                 # Next.js 14 App Router pages
├── components/          # React components
├── contexts/            # React contexts (Auth, etc.)
├── lib/                 # Utilities and configurations
└── styles/              # Global styles

supabase/
├── functions/           # Edge Functions
└── migrations/          # Database migrations
```

## Security Features

### Content Safety
- Automatic detection of live/in-progress exams
- Community flagging system
- Content moderation workflow

### Privacy Protection
- Anonymous handles only (no real names)
- No social login integration
- Minimal data collection

### Access Control
- Row Level Security on all tables
- Authentication required for uploads
- Optional access gating after N views

## Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on git push

### Environment Variables for Production
Same as local development, but use your production Supabase project values.

## Contributing

This is a production-ready application designed for educational use. Key principles:

- **Privacy First**: Anonymous sharing only
- **Content Safety**: Block live exam materials
- **Community Driven**: Reddit-style moderation
- **AI Enhanced**: Practice questions from any material
- **Mobile Ready**: Responsive design throughout

## License

MIT License - see LICENSE file for details.

## Support

For issues or questions:
1. Check the application logs in browser console
2. Verify Supabase configuration and migrations
3. Ensure all environment variables are set correctly