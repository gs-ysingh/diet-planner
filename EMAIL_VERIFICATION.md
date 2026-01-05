# Email Verification & Password Reset

This document describes the email verification and password reset functionality added to the Diet Planner application.

## Features

### 1. Email Verification
- New users receive a verification email upon registration
- Users must verify their email to fully activate their account
- Verification tokens expire after 24 hours (configurable)
- Users can request to resend the verification email

### 2. Forgot Password
- Users can request a password reset link via email
- Reset tokens expire after 1 hour for security
- Password strength validation is enforced
- Confirmation email sent after successful password change

## Email Service Configuration

### Environment Variables (Server)

Add these to your `/server/.env` file:

```env
# Email Configuration
# For development (uses Ethereal Email - test emails)
NODE_ENV=development

# For production (use real SMTP service)
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@dietplanner.com

# Client URL (for email links)
CLIENT_URL=http://localhost:3000
```

### Email Service Providers

#### Development
In development, the app uses Ethereal Email (https://ethereal.email) for testing. Emails are logged to console with preview URLs.

#### Production Options
You can use any SMTP service:
- **Gmail**: Use app-specific password (https://support.google.com/accounts/answer/185833)
- **SendGrid**: Professional email service with free tier
- **AWS SES**: Amazon's email service
- **Mailgun**: Developer-friendly email API
- **Postmark**: Transactional email service

## API Endpoints

### GraphQL Mutations

#### 1. Register (Updated)
```graphql
mutation Register($input: UserRegistrationInput!) {
  register(input: $input) {
    token
    user {
      id
      email
      name
      emailVerified
    }
  }
}
```
Now sends a verification email automatically.

#### 2. Verify Email
```graphql
mutation VerifyEmail($token: String!) {
  verifyEmail(token: $token) {
    token
    user {
      id
      email
      emailVerified
    }
  }
}
```

#### 3. Resend Verification
```graphql
mutation ResendVerification($email: String!) {
  resendVerification(email: $email)
}
```

#### 4. Forgot Password
```graphql
mutation ForgotPassword($email: String!) {
  forgotPassword(email: $email)
}
```

#### 5. Reset Password
```graphql
mutation ResetPassword($token: String!, $newPassword: String!) {
  resetPassword(token: $token, newPassword: $newPassword)
}
```

## Client Routes

New routes added:

- `/forgot-password` - Request password reset
- `/reset-password?token=xxx` - Reset password with token
- `/verify-email?token=xxx` - Verify email with token

## Database Schema Changes

New fields added to the `User` model:

```prisma
model User {
  // ... existing fields
  emailVerified     Boolean   @default(false)
  verificationToken String?   @unique
  resetToken        String?   @unique
  resetTokenExpiry  DateTime?
}
```

## Security Features

### Password Reset
- Reset tokens are cryptographically secure (32-byte random)
- Tokens expire after 1 hour
- Tokens are single-use (deleted after use)
- User doesn't need to be logged in to reset

### Email Verification
- Verification tokens are cryptographically secure
- Tokens are unique per user
- Old tokens are invalidated when new ones are requested

### Rate Limiting
The existing login rate limiting protects against:
- Brute force password attempts
- Multiple verification requests

## Email Templates

All emails use responsive HTML templates with:
- Gradient design matching the app theme
- Clear call-to-action buttons
- Plain text fallback
- Security notices
- Expiration information

### Email Types

1. **Verification Email**
   - Sent on registration
   - Contains verification link
   - Expires in 24 hours

2. **Password Reset Email**
   - Sent when user requests reset
   - Contains reset link
   - Expires in 1 hour
   - Includes security warnings

3. **Password Changed Confirmation**
   - Sent after successful password reset
   - Alerts user of account changes
   - No action required

## User Flow

### Registration Flow
1. User registers with email and password
2. Account created but `emailVerified = false`
3. Verification email sent
4. User clicks link in email
5. Email verified, user can access full features

### Password Reset Flow
1. User clicks "Forgot Password" on login page
2. Enters email address
3. Reset email sent (if account exists)
4. User clicks link in email
5. Enters new password
6. Password updated
7. Confirmation email sent
8. User can log in with new password

## Testing in Development

### Using Ethereal Email

1. Start the server in development mode
2. Register a new user or request password reset
3. Check the server console for the preview URL
4. Open the URL to view the email

Example console output:
```
📧 Verification email sent:
   Preview URL: https://ethereal.email/message/xxxxx
   To: user@example.com
   Verification URL: http://localhost:3000/verify-email?token=xxxxx
```

## Production Deployment Checklist

- [ ] Configure SMTP credentials in environment variables
- [ ] Set `NODE_ENV=production`
- [ ] Update `CLIENT_URL` to production domain
- [ ] Test email delivery
- [ ] Configure SPF/DKIM records for your domain
- [ ] Set up email monitoring/logging
- [ ] Configure email rate limits
- [ ] Test all email flows end-to-end

## Troubleshooting

### Emails not sending
1. Check SMTP credentials in `.env`
2. Verify `NODE_ENV` is set correctly
3. Check server logs for errors
4. For Gmail, ensure "Less secure app access" is enabled or use app password

### Verification links not working
1. Check `CLIENT_URL` matches your frontend URL
2. Verify token hasn't expired
3. Check database for token existence

### Password reset not working
1. Verify token hasn't expired (1 hour)
2. Check password meets strength requirements
3. Verify token matches database record

## Future Enhancements

Potential improvements:
- Email templates customization
- Multi-language support for emails
- Email notification preferences
- Two-factor authentication
- Login notification emails
- Account activity alerts
