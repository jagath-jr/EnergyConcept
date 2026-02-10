# EnergyConcept Dynamic CMS (Node.js + Docker)

This project adds a secure `/admin` control panel for managing website content without editing source code.

## Features

- Secure admin login (`/admin/login`) with session-based auth.
- Dashboard (`/admin`) with quick links.
- Content manager (`/admin/content`) to edit all page data.
- History & undo (`/admin/history`) to view old data and roll back the latest change.
- Public JSON API (`/api/content`) for frontend consumption.
- Dockerized Node.js deployment.

## Managed Content Sections

- Global/Footer contact details and social links
- Home page: hero, service highlights, contact panel
- About page: certifications
- Services page: service categories and nested sub-services
- Gallery page: albums/images
- Projects page: portfolio projects
- Careers page: job postings
- Contact page details + map embed

## Local Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create environment file:
   ```bash
   cp .env.example .env
   ```
3. Start app:
   ```bash
   npm start
   ```
4. Open:
   - Admin Login: `http://localhost:3000/admin/login`
   - Dashboard: `http://localhost:3000/admin`

Default credentials come from `.env`:
- `ADMIN_USERNAME=admin`
- `ADMIN_PASSWORD=admin123`

## Docker Run

```bash
docker compose up --build
```

The app will be available at `http://localhost:3000`.

## API Endpoints

- `GET /api/content` - Retrieve full content model
- `POST /api/content/section/:section` - Update one top-level section (admin only)

## Undo Workflow

Each save stores the previous state in `data/history.json`. Use:
- `/admin/history` to inspect change snapshots
- **Undo Latest Change** to restore the immediate prior version
