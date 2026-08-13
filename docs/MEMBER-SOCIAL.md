# Member Social Experience

This package adds member profiles, follows, reactions, comments, saved posts, notifications and mentoring requests.

## Database
Run `db/migrations/002_member_social.sql` after the foundation schema before enabling the social UI in production.

## Privacy
Public member pages expose professional profile data only. Email, private documents, financial records and sensitive identity data are not returned by social endpoints.

## Media
Profile and cover images currently accept HTTPS URLs only. A private storage/upload provider should be connected before enabling member document uploads.
