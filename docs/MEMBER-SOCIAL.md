# Member Social Experience

This package adds member profiles, follows, multi-reaction community posts, comments, saved posts, notifications and mentoring requests.

## Member features
- professional profile pages with follower/following/activity counts
- follow/unfollow relationships
- Like, Helpful, Respect and Celebrate reactions
- inline comments and saved-post library
- notification center with unread badges and per-item read state
- mentor discovery plus incoming/outgoing mentoring requests
- mentor accept, decline and requester cancel flows

## Database
Run `db/migrations/002_member_social.sql` after the foundation schema before enabling the social UI in production.

## Privacy
Public member pages expose professional profile data only. Email, private documents, financial records and sensitive identity data are not returned by social endpoints. Posts and saved items are only returned when the viewing member belongs to the relevant community.

## Media
Profile and cover images currently accept HTTPS URLs only. A private storage/upload provider should be connected before enabling member document uploads.
