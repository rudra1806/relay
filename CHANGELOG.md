# Changelog

All notable changes to Relay Chat App will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-03-30

### Fixed
- Image download functionality now works properly for cross-origin images hosted on Cloudinary
- Download button now fetches images as blobs to bypass CORS restrictions
- Added proper filename extraction and fallback generation with timestamps
- Added download state to prevent duplicate simultaneous requests
- Improved user feedback with error handling for failed downloads

## [1.0.0] - 2026-03-28

### Added
- Real-time messaging with Socket.IO
- User authentication with JWT
- Email verification system
- Contact request system
- Profile management with avatar upload
- Image sharing in messages
- Forgot password functionality
- Rate limiting with Arcjet
- Dark/Light theme support
- Responsive design

### Security
- Password hashing with bcryptjs
- JWT token authentication
- Protected API routes
- Rate limiting on sensitive endpoints
