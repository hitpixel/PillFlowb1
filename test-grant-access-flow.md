# Grant Access Feature - Testing Guide

## Overview
This document provides a comprehensive testing guide for the new grant access functionality that allows healthcare providers to share patient data via email tokens.

## Features Implemented

### 1. User Search Functionality
- **searchUsers**: Search users by name or email across organizations
- **getUserByEmail**: Get specific user by email address

### 2. Token Access Management
- **grantTokenAccess**: Direct grant access with email notification
- **approveTokenAccess**: Approve pending access requests
- **denyTokenAccess**: Deny pending access requests
- **revokeTokenAccess**: Revoke existing access
- **getPatientAccessGrants**: View all access grants for a patient

### 3. Email Notification System
- **sendPatientAccessGrantEmail**: Email notification for access grants
- **generatePatientAccessGrantEmailHTML**: HTML email template

### 4. Shared View Page
- **/patients/shared/[token]**: Shared patient view for external users
- **requestMedicationChange**: Request medication changes (for shared users)
- **requestMedicationAddition**: Request new medication additions

## Testing Steps

### Step 1: Setup Test Environment
1. Ensure you have at least 2 user accounts in different organizations
2. Create a test patient with medications
3. Verify email configuration is working

### Step 2: Test User Search
```bash
# Test user search functionality
curl -X POST http://localhost:3000/api/convex/searchUsers \
  -H "Content-Type: application/json" \
  -d '{"searchTerm": "john"}'
```

### Step 3: Test Grant Access Flow

#### A. Direct Grant Access
1. Navigate to a patient detail page
2. Click "Grant New Access" in Token Access Management
3. Search for a user from another organization
4. Select permissions (view, comment, view_medications)
5. Set expiry duration
6. Click "Grant Access"
7. Verify email is sent to the granted user

#### B. Pending Access Request
1. User from another organization requests access via share token
2. Verify pending request appears in Token Access Management
3. Approve or deny the request
4. Verify email notification is sent

### Step 4: Test Shared View Access

#### A. Access via Email Link
1. Check email for access grant notification
2. Click the access URL: `/patients/shared/[token]`
3. Verify you can view patient data
4. Test medication change requests

#### B. Cross-Organization Access
1. Log in as user from different organization
2. Navigate to shared patient URL
3. Verify access permissions are enforced
4. Test requesting medication changes

### Step 5: Test Access Revocation
1. Navigate to Token Access Management
2. Find active access grant
3. Click "Revoke Access"
4. Verify access is immediately revoked
5. Test that shared URL no longer works

## API Endpoints to Test

### User Search
- `GET /api/convex/searchUsers?searchTerm=john`
- `GET /api/convex/getUserByEmail?email=john@example.com`

### Access Management
- `POST /api/convex/grantTokenAccess`
- `POST /api/convex/approveTokenAccess`
- `POST /api/convex/denyTokenAccess`
- `POST /api/convex/revokeTokenAccess`
- `GET /api/convex/getPatientAccessGrants`

### Shared View
- `GET /patients/shared/[token]`
- `POST /api/convex/requestMedicationChange`
- `POST /api/convex/requestMedicationAddition`

## Test Scenarios

### Scenario 1: Same Organization Access
1. Grant access to user in same organization
2. Verify access is automatically approved
3. Test permissions enforcement

### Scenario 2: Cross-Organization Access
1. Grant access to user in different organization
2. Verify access requires approval
3. Test email notifications

### Scenario 3: Expired Access
1. Grant access with short expiry
2. Wait for expiry
3. Verify automatic revocation

### Scenario 4: Permission Levels
1. Grant view-only access
2. Test cannot add comments
3. Grant full access
4. Test all permissions work

### Scenario 5: Multiple Access Grants
1. Grant access to multiple users
2. Revoke some, keep others
3. Verify independent access control

## Email Testing

### Test Email Configuration
1. Ensure RESEND_API_KEY is set in environment
2. Test email sending with debug endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/convex/debugEmailSystem \
     -H "Content-Type: application/json" \
     -d '{"testEmail": "your-email@example.com"}'
   ```

### Expected Email Content
- **Subject**: "Access Granted to [Patient Name]"
- **From**: "PillFlow Access <noreply@pillflow.com.au>"
- **Content**: Includes patient name, granted by info, permissions, expiry, and access URL

## Error Handling Tests

### Test Invalid Inputs
1. Grant access to non-existent user
2. Grant access with invalid permissions
3. Approve non-existent access request
4. Revoke already revoked access

### Test Security
1. Try to grant access without authentication
2. Try to access patient without permission
3. Try to modify another organization's patient
4. Test token expiration

## Database Verification

### Check Access Grants
```sql
-- Query to verify access grants
SELECT * FROM tokenAccessGrants WHERE patientId = 'your-patient-id';
```

### Check Email Logs
```sql
-- Query to verify email notifications
SELECT * FROM emailLogs WHERE type = 'access_grant';
```

## Browser Testing Checklist

- [ ] Chrome/Edge: Full functionality
- [ ] Firefox: Full functionality  
- [ ] Safari: Full functionality
- [ ] Mobile: Responsive design
- [ ] Tablet: Responsive design

## Performance Testing

### Load Testing
1. Test with 100+ access grants
2. Test user search with 1000+ users
3. Test email sending with multiple recipients

### Response Times
- User search: < 500ms
- Access grant: < 2s
- Email sending: < 5s
- Shared view load: < 1s

## Security Testing

### Authentication
- [ ] Verify authentication required for all endpoints
- [ ] Test token expiration handling
- [ ] Test permission enforcement

### Authorization
- [ ] Verify users can only access their patients
- [ ] Test cross-organization access restrictions
- [ ] Test role-based permissions

### Data Protection
- [ ] Verify no sensitive data in URLs
- [ ] Test HTTPS enforcement
- [ ] Verify email content doesn't expose sensitive data

## Troubleshooting

### Common Issues

1. **Email not sending**
   - Check RESEND_API_KEY environment variable
   - Verify email domain configuration
   - Check email logs in Convex dashboard

2. **User search not working**
   - Verify searchUsers query is properly exported
   - Check database indexes
   - Test with different search terms

3. **Access denied errors**
   - Verify user has proper permissions
   - Check organization membership
   - Verify token hasn't expired

4. **Shared view not loading**
   - Check token validity
   - Verify access grant status
   - Check browser console for errors

### Debug Commands

```bash
# Check Convex logs
npx convex logs

# Test specific queries
npx convex run users:searchUsers --args='{"searchTerm": "john"}'

# Check database state
npx convex run patientManagement:getPatientAccessGrants --args='{"patientId": "your-patient-id"}'
```

## Success Criteria

- [ ] User can search and select users from other organizations
- [ ] Access grants are created with proper permissions
- [ ] Email notifications are sent successfully
- [ ] Shared view loads correctly for granted users
- [ ] Medication change requests work for shared users
- [ ] Access can be revoked and expires properly
- [ ] All security checks are enforced
- [ ] Performance is acceptable under load

## Next Steps

After successful testing:
1. Deploy to staging environment
2. Conduct user acceptance testing with real healthcare providers
3. Monitor for any issues in production
4. Gather feedback for improvements