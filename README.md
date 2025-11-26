# PULS Web Application

This is the web version of the PULS mobile application, built with Next.js 14.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Splash Screen**: Auto-redirects to login after 2 seconds
- **Login Screen**: Authenticates users with the PULS API
- **Home Screen**: Displays organization info and terms acceptance
- **Responsive Design**: Works on desktop, tablet, and mobile
- **AWS S3 Integration**: Fetches organization logos from S3

## Project Structure

```
web-app/
├── app/
│   ├── page.tsx          # Splash screen
│   ├── login/
│   │   └── page.tsx      # Login page
│   └── home/
│       └── page.tsx      # Home page
├── components/
│   └── TermsModal.tsx    # Terms and conditions modal
├── public/               # Static assets
└── styles/              # CSS modules
```

## API Integration

The app integrates with:
- **Login API**: `https://pulscore.org/api/login`
- **AWS S3**: For organization logos

## Deployment

Build for production:
```bash
npm run build
npm start
```

## Technologies Used

- Next.js 14
- TypeScript
- CSS Modules
- AWS SDK
- React Hooks