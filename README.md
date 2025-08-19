# POAP Sherry - Twitter Mini App

Twitter mini-app for distributing POAPs using Sherry Social SDK. This app allows users to claim POAPs directly from Twitter by completing certain requirements like following an account and retweeting.

## 🚀 Installation

1. Clone the repository:
```bash
git clone https://github.com/gotoalberto/poap-sherry.git
cd poap-sherry
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Copy the configuration file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
# POAP API Configuration
POAP_CLIENT_ID=your_poap_client_id
POAP_CLIENT_SECRET=your_poap_client_secret
POAP_API_KEY=your_poap_api_key
POAP_EVENT_ID=191758
POAP_SECRET_CODE=902096

# Twitter API Configuration
TWITTER_BEARER_TOKEN=your_twitter_bearer_token

# Follow Gate Configuration
NEXT_PUBLIC_REQUIRED_FOLLOW_USERNAME=gotoalberto
```

5. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🐦 How to embed the mini-app in a Twitter post

### Method 1: Using Sherry Links API (Recommended)

1. **Install the Sherry Links extension**:
   - Go to [Chrome Web Store](https://chromewebstore.google.com/detail/sherry-links/cpmcpmfnblpkjlipgkhfjocoohjnmfhd)
   - Install the "Sherry Links" extension

2. **Deploy your app**:
   - Deploy your app on Vercel, Netlify, or any hosting service
   - Get the public URL (e.g., `https://your-poap-app.vercel.app`)

3. **Generate the Sherry link programmatically**:
   
   **Option A: Use the API endpoint**
   ```bash
   curl https://your-poap-app.vercel.app/api/sherry-link
   ```
   
   Response:
   ```json
   {
     "success": true,
     "sherryLink": "https://sherry.social/link?app=...",
     "directLink": "https://your-poap-app.vercel.app",
     "metadata": {...},
     "instructions": {
       "withExtension": "Users with Sherry Links extension will see the mini-app embedded in the tweet",
       "withoutExtension": "Users without the extension will be redirected to the app"
     }
   }
   ```
   
   **Option B: Generate custom links**
   ```bash
   curl -X POST https://your-poap-app.vercel.app/api/sherry-link \
     -H "Content-Type: application/json" \
     -d '{
       "eventId": 191758,
       "eventName": "My Custom POAP",
       "imageUrl": "https://example.com/poap-image.png"
     }'
   ```

4. **Share on Twitter**:
   - Create a new tweet
   - Include the generated Sherry link
   - Users with the Sherry extension will see your mini-app embedded directly in the tweet

### Method 2: Direct URL with Metadata

1. **Configure your app metadata**:
   - The app already includes the necessary metadata at `/api/metadata`
   - Make sure your app is publicly accessible

2. **Share the link**:
   ```
   🎉 Claim your exclusive POAP!
   
   Follow these steps:
   1. Install Sherry Links
   2. Follow @gotoalberto
   3. Retweet this post
   4. Claim your POAP here: https://your-app.vercel.app
   
   #POAP #Web3
   ```

### Method 3: Twitter Cards Integration (Future)

When Twitter officially enables mini-apps:

1. **Configure Twitter Card metadata**:
   ```html
   <meta name="twitter:card" content="app">
   <meta name="twitter:app:url" content="https://your-app.vercel.app">
   ```

2. **Register your app in Twitter Developer Portal**

## 📱 User Experience

1. **User sees the tweet** with the mini-app link
2. **With Sherry installed**, the mini-app loads directly in the tweet
3. **Complete requirements**:
   - Follow the required account
   - Retweet the post
4. **Connect wallet** or enter address
5. **Claim the POAP**

## 🔧 Customization

### Change POAP Event
Modify in `.env`:
```env
POAP_EVENT_ID=your_event_id
POAP_SECRET_CODE=your_secret_code
```

### Change requirements
Modify in `.env`:
```env
NEXT_PUBLIC_REQUIRED_FOLLOW_USERNAME=your_username
```

### Customize design
Styles are in the components using CSS-in-JS. Modify:
- `/src/components/POAPMinter.tsx`
- `/src/components/FollowGate.tsx`
- `/src/components/POAPSuccess.tsx`

## 🚀 Production Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Production environment variables
Configure the same `.env` variables in your hosting service.

## 🔗 API Endpoints

### Generate Sherry Link
**GET** `/api/sherry-link`

Generates a Sherry link for the configured POAP event.

**Response:**
```json
{
  "success": true,
  "sherryLink": "https://sherry.social/link?app=...",
  "directLink": "https://your-app.vercel.app",
  "metadata": {
    "type": "action",
    "url": "https://your-app.vercel.app",
    "icon": "https://...",
    "title": "Mint POAP",
    "description": "Claim your commemorative POAP badge on Twitter",
    "actions": [...]
  }
}
```

### Generate Custom Sherry Link
**POST** `/api/sherry-link`

Generates a Sherry link with custom parameters.

**Request Body:**
```json
{
  "eventId": 191758,
  "eventName": "My Custom POAP",
  "imageUrl": "https://example.com/poap-image.png"
}
```

### Get POAP Event Data
**GET** `/api/poap-event`

Returns information about the configured POAP event.

### Check Claim Status
**POST** `/api/poap-claim`

Checks if a user has already claimed the POAP.

**Request Body:**
```json
{
  "userId": "twitter_user_id"
}
```

## 📝 Important Notes

- Users need to have the Sherry Links extension installed to see the embedded mini-app
- Without the extension, they'll see a normal link that takes them to the app
- The app works both embedded and standalone
- POAPs are minted on the Gnosis (xDai) blockchain
- The Sherry link API endpoint automatically generates the correct metadata for your POAP event
- You can generate custom links for different POAP events using the POST endpoint

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is under the MIT license.