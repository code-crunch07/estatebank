# OTP System Explanation

## Overview
The OTP (One-Time Password) system is used to verify mobile numbers in the "Post Property" form on the client frontend. This ensures that only verified users can submit property listings.

---

## How It Works

### 1. **User Flow**

```
1. User enters phone number (10 digits)
   ↓
2. User clicks "Send OTP" button
   ↓
3. System generates 6-digit OTP
   ↓
4. OTP is sent to user's phone via SMS
   ↓
5. User enters OTP in the form
   ↓
6. User clicks "Verify OTP" button
   ↓
7. System verifies OTP
   ↓
8. If verified, user can submit the property form
```

### 2. **API Endpoints**

#### **POST `/api/otp/send`**
- **Purpose**: Send OTP to phone number
- **Request Body**:
  ```json
  {
    "phone": "9876543210"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "OTP sent to 9876543210",
    "otp": "123456"  // Only in development mode
  }
  ```
- **Features**:
  - Validates phone number (10 digits)
  - Generates random 6-digit OTP
  - Stores OTP with expiration (5 minutes)
  - Rate limiting (prevents spam)
  - Sends OTP via SMS (when configured)

#### **POST `/api/otp/verify`**
- **Purpose**: Verify OTP entered by user
- **Request Body**:
  ```json
  {
    "phone": "9876543210",
    "otp": "123456"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "OTP verified successfully",
    "verified": true
  }
  ```
- **Features**:
  - Validates OTP format (6 digits)
  - Checks if OTP exists and not expired
  - Limits verification attempts (max 3)
  - One-time use (OTP deleted after verification)

---

## Current Implementation

### **Storage**
- **Development**: In-memory Map (lost on server restart)
- **Production**: Should use Redis or MongoDB for persistence

### **SMS Service**
- **Current**: Logs OTP to console (development mode)
- **Production**: Needs integration with SMS provider:
  - **Twilio** (International)
  - **AWS SNS** (AWS users)
  - **MSG91** (India)
  - **TextLocal** (India)

---

## Configuration

### **OTP Settings**
- **OTP Length**: 6 digits
- **Expiry Time**: 5 minutes
- **Max Attempts**: 3 verification attempts
- **Rate Limiting**: Prevents requesting new OTP within expiry period

---

## Integration with SMS Service

### **Option 1: Twilio (Recommended for International)**

1. **Install Twilio SDK**:
   ```bash
   npm install twilio
   ```

2. **Add Environment Variables**:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

3. **Update `/app/api/otp/send/route.ts`**:
   ```typescript
   import twilio from 'twilio';
   
   const client = twilio(
     process.env.TWILIO_ACCOUNT_SID,
     process.env.TWILIO_AUTH_TOKEN
   );
   
   await client.messages.create({
     body: `Your EstateBANK.in OTP is ${otp}. Valid for 5 minutes.`,
     from: process.env.TWILIO_PHONE_NUMBER,
     to: `+91${cleanPhone}`
   });
   ```

### **Option 2: MSG91 (India)**

1. **Install MSG91 SDK**:
   ```bash
   npm install msg91
   ```

2. **Add Environment Variables**:
   ```env
   MSG91_AUTH_KEY=your_auth_key
   MSG91_SENDER_ID=POWAIF
   ```

3. **Update `/app/api/otp/send/route.ts`**:
   ```typescript
   const msg91 = require('msg91')(process.env.MSG91_AUTH_KEY);
   
   await msg91.send(
     cleanPhone,
     `Your EstateBANK.in OTP is ${otp}. Valid for 5 minutes.`,
     process.env.MSG91_SENDER_ID
   );
   ```

### **Option 3: AWS SNS**

1. **Install AWS SDK**:
   ```bash
   npm install @aws-sdk/client-sns
   ```

2. **Add Environment Variables**:
   ```env
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   ```

3. **Update `/app/api/otp/send/route.ts`**:
   ```typescript
   import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
   
   const snsClient = new SNSClient({ region: process.env.AWS_REGION });
   
   await snsClient.send(new PublishCommand({
     PhoneNumber: `+91${cleanPhone}`,
     Message: `Your EstateBANK.in OTP is ${otp}. Valid for 5 minutes.`
   }));
   ```

---

## Production Considerations

### **1. Use Redis for OTP Storage**
```typescript
// Example with Redis
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Store OTP
await redis.setex(`otp:${phone}`, 300, otp); // 5 minutes expiry

// Verify OTP
const storedOTP = await redis.get(`otp:${phone}`);
```

### **2. Add Rate Limiting**
- Limit OTP requests per IP address
- Use middleware like `express-rate-limit` or `@upstash/ratelimit`

### **3. Security**
- Never expose OTP in production responses
- Use HTTPS for all API calls
- Validate phone numbers server-side
- Add CAPTCHA for spam prevention

### **4. Monitoring**
- Log OTP send/verify attempts
- Monitor failed verification attempts
- Track SMS delivery rates

---

## Testing

### **Development Mode**
- OTP is logged to console
- OTP is included in API response (for testing)
- No actual SMS sent

### **Production Mode**
- OTP sent via SMS service
- OTP not included in API response
- Real SMS delivery

---

## Frontend Integration

The frontend form (`app/(client)/properties/add/page.tsx`) handles:
- Phone number validation
- OTP input field
- Loading states
- Error handling
- Success messages
- Form submission only after OTP verification

---

## Troubleshooting

### **OTP Not Received**
1. Check SMS service configuration
2. Verify phone number format
3. Check SMS service logs
4. Verify API keys/credentials

### **OTP Expired**
- User must request new OTP
- OTP expires after 5 minutes

### **Too Many Attempts**
- User exceeded 3 verification attempts
- Must request new OTP

---

## Next Steps

1. ✅ OTP API endpoints created
2. ✅ Frontend integration complete
3. ⏳ Integrate SMS service (Twilio/MSG91/AWS SNS)
4. ⏳ Move to Redis for production storage
5. ⏳ Add rate limiting
6. ⏳ Add monitoring/logging

