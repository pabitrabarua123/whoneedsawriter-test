# Developer API Feature

## Overview
A streamlined API key management system that allows logged-in users to manage a single API key for external integrations.

## Features

### ✅ **Single API Key Management**
- **Generate API Key**: Users can create one API key per account
- **View API Key**: Display the current API key with creation/update dates
- **Toggle Status**: Activate/deactivate the API key
- **Regenerate Key**: Delete and create a new API key
- **Secure Display**: Key is masked by default with show/hide functionality
- **Copy to Clipboard**: One-click copy functionality

### ✅ **Security Features**
- **Unique Key Generation**: Uses nanoid for cryptographically secure keys
- **User Authentication**: Only logged-in users can manage their keys
- **User Isolation**: Users can only see and manage their own keys
- **Status Control**: Keys can be activated/deactivated
- **Prefix Identification**: All keys prefixed with `brag_` for easy identification

### ✅ **API Endpoints**

#### `GET /api/api-keys`
- Fetch all API keys for the authenticated user
- Returns: `{ apiKeys: ApiKey[] }`

#### `POST /api/api-keys`
- Create a new API key (max 5 per user)
- Returns: `{ success: true, apiKey: ApiKey }`

#### `DELETE /api/api-keys?id={keyId}`
- Delete a specific API key
- Returns: `{ success: true, message: string }`

#### `PATCH /api/api-keys`
- Toggle API key status (active/inactive)
- Body: `{ keyId: string, status: boolean }`
- Returns: `{ success: true, apiKey: ApiKey }`

### ✅ **Usage**
1. Navigate to `/developer/api` page
2. Click "Generate API Key" to create your key
3. Copy the generated key for use in external applications
4. Use the key in API requests with header: `x-api-key: your_api_key_here`
5. Toggle status or regenerate key as needed

### ✅ **Integration**
- **Sidebar Navigation**: Added to main navigation menu
- **Responsive Design**: Works on desktop and mobile
- **Dark Mode Support**: Respects user theme preferences
- **Toast Notifications**: User feedback for all actions
- **Loading States**: Proper loading indicators

### ✅ **Validation & Security**
- **Balance Checking**: API routes validate user balance before processing
- **Authentication Required**: All endpoints require valid user session
- **Single Key Limit**: Only one API key per user allowed
- **Secure Generation**: Cryptographically secure key generation
- **Proper Error Handling**: Comprehensive error messages

### ✅ **Database Schema**
```sql
model ApiKey {
  id        String   @id @default(cuid())
  api_key   String   -- The actual API key (prefixed with 'brag_')
  status    Int      -- 1 = active, 0 = inactive
  userId    String   -- Foreign key to User
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Example Usage

### Creating an API Key
```javascript
// User creates key via UI, receives: brag_1234567890abcdef...

// Using the key in external API calls:
const response = await fetch('https://your-app.com/api/v1/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'brag_1234567890abcdef...'
  },
  body: JSON.stringify({ keyword: 'SEO tips' })
});
```

## File Structure
```
src/
├── app/
│   ├── developer/
│   │   └── api/
│   │       └── page.tsx             # Developer API page
│   └── api/
│       └── api-keys/
│           └── route.ts             # API endpoints
├── components/
│   └── pages/
│       └── ApiKeys/
│           └── ApiKeys.tsx          # Main component
└── data/
    └── routes.ts                    # Route definitions
```
