# Security Configuration Guide

This document outlines the security configurations required to address identified security issues and implement best practices for the StudyResources application.

## 1. Auth Configuration - Leaked Password Protection

### Issue
Leaked password protection is currently disabled, which means users can potentially use compromised passwords that have been found in data breaches.

### Solution
Enable leaked password protection in your Supabase project:

#### Via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Settings**
3. Scroll to **Security and Protection**
4. Enable **"Leaked Password Protection"**
5. Save the changes

#### Via Supabase CLI (if available)
```bash
supabase secrets set --project-ref your-project-ref GOTRUE_PASSWORD_MIN_LENGTH=8
supabase secrets set --project-ref your-project-ref GOTRUE_EXTERNAL_HAVEIBEENPWNED_ENABLED=true
```

#### Via Management API
```bash
curl -X PATCH 'https://api.supabase.com/v1/projects/{project-ref}/config/auth' \
  -H 'Authorization: Bearer {management-api-token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "PASSWORD_MIN_LENGTH": 8,
    "EXTERNAL_HAVEIBEENPWNED_ENABLED": true
  }'
```

## 2. Database Security Fixes

### Fixed Issues

#### Security Definer View (Fixed in migration 021)
- **Issue**: The `user_points` view was using `SECURITY DEFINER`, which executes with creator privileges
- **Fix**: Recreated view to use default `SECURITY INVOKER` behavior
- **Migration**: `021_fix_security_definer_view.sql`

#### Extension in Public Schema (Fixed in migration 022)
- **Issue**: `pg_trgm` extension installed in public schema poses security risk
- **Fix**: Moved extension to dedicated `extensions` schema
- **Migration**: `022_move_extensions.sql`

## 3. Additional Security Recommendations

### Environment Variables Security
- Ensure all sensitive environment variables are properly secured
- Never commit `.env` files to version control
- Use different keys for development, staging, and production
- Regularly rotate API keys and service role keys

### Row Level Security (RLS)
Current RLS policies are well-configured with:
- Users can only access their own data where appropriate
- Public data (schools, subjects, etc.) accessible to all
- Proper authentication checks for write operations

### API Security
#### File Access Endpoints
- Service role authentication for file operations
- File type validation for text file content access
- Proper error handling without information leakage

#### User Management
- Secure user creation with race condition handling
- Proper authentication token validation
- Timeout handling to prevent hanging requests

### Content Security
#### Input Validation
- Implement server-side validation for all user inputs
- Use parameterized queries (already implemented via Supabase client)
- Sanitize user-generated content display

#### File Upload Security
- File type validation
- File size limits
- Virus scanning (recommended for production)
- Secure file storage with proper access controls

## 4. Production Security Checklist

### Database
- [x] Row Level Security enabled on all tables
- [x] Proper foreign key constraints
- [x] Secure view definitions (SECURITY INVOKER)
- [x] Extensions moved to dedicated schema
- [ ] Regular database backups configured
- [ ] Database connection pooling configured

### Authentication
- [x] OAuth providers configured
- [x] Email verification enabled
- [ ] Leaked password protection enabled (requires dashboard configuration)
- [ ] Multi-factor authentication considered
- [ ] Session timeout configured

### Authorization
- [x] API route authentication
- [x] Service role key properly secured
- [x] Anon key rate limiting (Supabase default)
- [ ] API rate limiting for authenticated users
- [ ] Resource access logging

### Infrastructure
- [ ] HTTPS enforced in production
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] CDN with DDoS protection
- [ ] Regular security updates
- [ ] Monitoring and alerting setup

### Code Security
- [x] No hardcoded secrets
- [x] Secure error handling
- [x] Input validation
- [ ] Dependency vulnerability scanning
- [ ] Static code analysis
- [ ] Security testing in CI/CD

## 5. Monitoring and Alerting

### Recommended Monitoring
- Failed login attempts
- Unusual access patterns
- Database performance metrics
- API error rates
- File upload activity

### Security Logs
- Authentication events
- Authorization failures
- Database query errors
- File access patterns

## 6. Incident Response

### Preparation
1. Document incident response procedures
2. Maintain emergency contact list
3. Regular security drills
4. Backup and recovery testing

### Response Steps
1. Identify and contain the threat
2. Assess the scope of impact
3. Notify relevant stakeholders
4. Implement fixes and patches
5. Monitor for recurring issues
6. Post-incident review and improvements

## 7. Regular Security Maintenance

### Monthly Tasks
- Review access logs
- Update dependencies
- Rotate API keys (if needed)
- Security patch review

### Quarterly Tasks
- Security audit
- Penetration testing (recommended)
- Backup restoration testing
- Review and update security policies

### Annually
- Comprehensive security assessment
- Update incident response procedures
- Staff security training
- Security tool evaluation

---

**Note**: This configuration should be reviewed and updated regularly as the application evolves and new security best practices emerge.