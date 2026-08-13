# Security Baseline

NextWave Crew handles identity, career history, uploaded credentials and financial-planning information. Treat all four as sensitive.

## Required before production
- Neon Auth configured with a 32+ character cookie secret.
- Email verification and passkey/2FA roadmap for privileged accounts.
- Restricted Postgres runtime role without `BYPASSRLS`.
- RLS for member-owned tables once JWT claim propagation is configured.
- Private object storage with short-lived signed URLs.
- Encryption at application layer for passport, seaman-book and certificate identifiers that must be stored.
- Rate limiting on auth, community posting, search and verification endpoints.
- File type/size validation and malware scanning before document acceptance.
- Immutable audit retention for admin, verification and financial-setting mutations.
- Separate admin roles. No single community moderator receives finance or security administration automatically.
- Backup and restore drills.
- Account export, correction and deletion processes consistent with applicable law.

## Default privacy
Passport numbers, bank details, full date of birth, private contact information and uploaded documents must never become public profile fields.
