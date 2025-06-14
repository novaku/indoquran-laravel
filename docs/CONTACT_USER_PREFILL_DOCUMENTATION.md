# Contact Page User Pre-fill Feature Documentation

## Overview
The contact page now automatically pre-fills the **Name** and **Email** fields when:
1. User navigates from the donation page
2. User is authenticated (logged in)

## Features Implemented

### 1. **User Data Fetching**
- Fetches current user information from `/api/user` endpoint
- Only triggers when coming from donation page and user is authenticated
- Graceful error handling if user data fetch fails

### 2. **Visual Indicators**
- **Green badges** on Name and Email fields showing "✓ Auto-filled dari akun"
- **Green background** on pre-filled input fields
- **Enhanced notification** showing user's name when auto-filled

### 3. **User Experience**
- Seamless integration with existing donation flow
- Users can still edit pre-filled fields if needed
- Clear visual feedback about what was auto-filled

## Technical Implementation

### Frontend (React)
```javascript
// Fetches user data when coming from donation page
useEffect(() => {
    const fetchUserData = async () => {
        if (location.state && isAuthenticated()) {
            const response = await authenticatedFetch('/api/user');
            if (response.ok) {
                const userData = await response.json();
                setCurrentUser(userData);
            }
        }
    };
    fetchUserData();
}, [location.state]);

// Auto-fills name and email from user data
useEffect(() => {
    if (currentUser && location.state) {
        setFormData(prev => ({
            ...prev,
            name: currentUser.name || prev.name,
            email: currentUser.email || prev.email
        }));
    }
}, [currentUser, location.state]);
```

### Backend (Laravel)
- Uses existing `/api/user` endpoint
- Returns authenticated user or null
- Supports both session and token-based authentication

## User Flow Example

1. **User logs in** to IndoQuran
2. **User visits donation page** and makes a donation
3. **User clicks "Hubungi Kami Sekarang"** button
4. **Contact page loads** with:
   - ✅ Subject: "Konfirmasi Donasi - IndoQuran"
   - ✅ Message: Pre-filled donation template
   - ✅ Name: User's name from account
   - ✅ Email: User's email from account
   - ✅ File upload: Available for proof of transfer
5. **User sees notification**: "👤 Nama dan email diambil dari akun Anda: **User Name**"
6. **User can edit** any field if needed
7. **User submits** the form with donation proof

## Benefits

### For Users
- **Faster form completion** - no need to re-enter name and email
- **Reduced errors** - eliminates typos in name/email
- **Better experience** - seamless flow from donation to contact

### For Administrators
- **Accurate contact info** - uses verified account information
- **Better donation tracking** - easier to match donations with users
- **Reduced support** - fewer issues with incorrect contact details

## Security & Privacy
- Only fetches user data when specifically navigating from donation page
- Respects authentication status - no data fetched for anonymous users
- User can modify auto-filled data if needed
- No sensitive data exposed in frontend

## Fallback Behavior
- If user is not logged in: works as before (manual entry)
- If user fetch fails: graceful degradation (manual entry)
- If user data is incomplete: fills what's available, user completes the rest
