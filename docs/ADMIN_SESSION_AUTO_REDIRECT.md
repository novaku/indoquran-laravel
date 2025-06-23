# Admin Session Auto-Redirect Feature

## Overview
This feature automatically redirects admin users to the admin dashboard if they already have a valid session when visiting the admin login page.

## Implementation Details

### Files Modified
- `resources/js/react/pages/AdminLoginPage.jsx`

### Key Features

#### 1. **Session Check on Page Load**
When the admin login page loads, it automatically:
- Checks for stored admin session in localStorage
- Validates the session with the server
- Redirects to dashboard if session is valid
- Shows appropriate loading state during validation

#### 2. **Server-Side Session Validation**
The validation process:
- Fetches CSRF token
- Attempts to call `/api/admin/dashboard` endpoint
- Handles different response scenarios:
  - `200 OK` → Session valid, redirect to dashboard
  - `401/403` → Session invalid, remove stored data
  - Other errors → Assume valid to avoid false logouts

#### 3. **Enhanced User Experience**
- Shows loading spinner while checking session
- Displays informative toast messages
- Handles network errors gracefully
- Prevents unnecessary re-authentication

#### 4. **Error Handling**
- Graceful handling of network failures
- Corrupted localStorage data cleanup
- Server error tolerance to prevent false logouts
- Clear user feedback for all scenarios

## User Flow

### Scenario 1: Valid Admin Session
1. Admin visits `/admin/login`
2. Page shows "Memeriksa sesi admin..." loading state
3. System validates session with server
4. Success toast: "Sesi admin masih aktif, mengarahkan ke dashboard..."
5. Automatic redirect to `/admin/dashboard`

### Scenario 2: Expired/Invalid Session
1. Admin visits `/admin/login`
2. Page shows "Memeriksa sesi admin..." loading state
3. System detects invalid session
4. Info toast: "Sesi admin telah berakhir, silakan login kembali."
5. Shows normal login form

### Scenario 3: Network/Server Issues
1. Admin visits `/admin/login`
2. Page shows "Memeriksa sesi admin..." loading state
3. Server validation fails due to network/server issues
4. Success toast: "Mengarahkan ke dashboard..."
5. Assumes session is valid and redirects (fail-safe approach)

### Scenario 4: No Stored Session
1. Admin visits `/admin/login`
2. Brief loading state
3. Shows normal login form immediately

## Technical Implementation

### State Management
```jsx
const [sessionChecking, setSessionChecking] = useState(true);
```

### Session Validation Function
```jsx
const validateAdminSession = async (userData) => {
  // Returns: true (valid), false (invalid), 'inconclusive' (error)
}
```

### Conditional Rendering
```jsx
{sessionChecking ? (
  // Loading state with spinner
) : (
  // Normal login form
)}
```

## Benefits

1. **Improved UX**: No need to re-login if session is still valid
2. **Time Saving**: Direct access to dashboard for valid sessions
3. **Error Resilience**: Handles network issues gracefully
4. **Security**: Validates sessions server-side
5. **Feedback**: Clear messages about session status

## Security Considerations

- Server-side validation prevents client-side manipulation
- CSRF token validation for API calls
- Proper cleanup of invalid/corrupted session data
- Fail-safe approach for network issues

## Testing Scenarios

### Test Cases
1. **Valid Session**: Should redirect to dashboard
2. **Expired Session**: Should show login form with info message
3. **Invalid Session Data**: Should cleanup and show login form
4. **Network Error**: Should assume valid and redirect
5. **Server Error**: Should handle gracefully
6. **No Session**: Should show login form immediately

### Manual Testing
1. Login as admin and navigate to dashboard
2. Visit `/admin/login` directly → Should redirect to dashboard
3. Clear session in browser tools and visit `/admin/login` → Should show form
4. Corrupt localStorage data and visit `/admin/login` → Should cleanup and show form

## Future Enhancements

1. **Session Refresh**: Automatically refresh expiring sessions
2. **Remember Me**: Extended session duration option
3. **Multiple Admin Types**: Different redirect targets per admin role
4. **Session Analytics**: Track session usage patterns
5. **Timeout Warnings**: Warn before session expiration

## Configuration

### Session Storage Key
```javascript
localStorage.getItem('admin_user')
```

### Validation Endpoint
```javascript
GET /api/admin/dashboard
```

### Redirect Target
```javascript
navigate('/admin/dashboard')
```

This feature significantly improves the admin user experience by eliminating unnecessary login steps while maintaining security through server-side validation.
