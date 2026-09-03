# Firebase Security Specification

## Data Invariants
- A user document must have a valid email and name.
- Users can only read and write their own data (identified by email or UID).
- Any write operation must include a timestamp.
- ID path variables must be valid (max 128 chars, alphanumeric).

## The Dirty Dozen Payloads (Target: Denied)

1. **Identity Spoofing**: Attempt to create a user profile with a different user's email.
2. **Ghost Field Injection**: Adding `isAdmin: true` to a user profile update.
3. **Empty Name**: Creating a user with an empty name string.
4. **Invalid Email**: Creating a user with an invalid email format.
5. **Giant ID**: Using a 2KB string as a document ID.
6. **Time Travel**: Setting `createdAt` to a future/past date instead of `request.time`.
7. **Cross-User Read**: Trying to `get` another user's profile document.
8. **Unauthorized List**: Attempting to list all users as a regular authenticated user.
9. **Address Bombing**: Setting `address` to a string larger than 500 characters.
10. **Phone Number Poisoning**: Setting `phone` to a non-numeric string or a massive string.
11. **Malicious Reminder Update**: A user trying to update a reminder document they don't own.
12. **Anonymous Write**: Attempting to write to `users` without a valid session.

## Test Runner (firestore.rules.test.ts)

```typescript
// Placeholder for tests - would use @firebase/rules-unit-testing
```
