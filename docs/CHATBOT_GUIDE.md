# Property Chatbot Guide

## Overview

The Property Chatbot is an interactive assistant that helps users find properties by collecting their preferences and suggesting matching properties.

## Features

✅ **Conversational Interface** - Natural chat flow  
✅ **User Preference Collection** - Gathers name, budget, location, property type, bedrooms, bathrooms  
✅ **Smart Property Matching** - Searches and filters properties based on user preferences  
✅ **Property Suggestions** - Displays up to 6 matching properties  
✅ **Quick Actions** - Links to view all properties or start new search  

## How It Works

### 1. User Flow

1. User clicks the chat button (bottom-right corner)
2. Chatbot asks questions in sequence:
   - Name
   - Purpose (Buy/Rent)
   - Budget range
   - Location preference
   - Property type (Residential/Commercial)
   - Number of bedrooms
   - Number of bathrooms
3. After all questions, chatbot searches for matching properties
4. Displays property suggestions with images and details
5. User can click on properties to view details

### 2. Questions Asked

| Step | Question | Options/Format |
|------|----------|---------------|
| 1 | What's your name? | Free text |
| 2 | Are you looking to Buy or Rent? | Buy / Rent (buttons) |
| 3 | What's your budget range? | Free text (e.g., "1-3 Cr", "Below 1 Cr") |
| 4 | Which location are you interested in? | Free text (e.g., "Powai", "Andheri") |
| 5 | What type of property? | Residential / Commercial (buttons) |
| 6 | How many bedrooms? | Free text (number) |
| 7 | How many bathrooms? | Free text (number) |

### 3. Property Matching Logic

The chatbot:
- Searches properties using API with filters (location, type, bedrooms)
- Filters by budget range (Below 1 Cr, 1-3 Cr, 3-5 Cr, Above 5 Cr)
- Filters by bathroom count
- Limits results to top 6 properties
- Falls back to showing all properties if no exact matches

## Usage

### For Users

1. **Open Chatbot**: Click the chat icon in bottom-right corner
2. **Answer Questions**: Respond to each question
3. **View Suggestions**: Browse suggested properties
4. **Click Property**: View full details
5. **Start New Search**: Click "Start New Search" to begin again

### For Developers

#### Component Location
- `components/property-chatbot.tsx`

#### Integration
Already integrated in `app/(client)/layout.tsx` - appears on all client-facing pages.

#### Customization

**Change Questions:**
Edit the `steps` array in `property-chatbot.tsx`:

```typescript
const steps = [
  { key: "name", question: "What's your name?", placeholder: "Enter your name" },
  // Add more steps...
];
```

**Change Property Limit:**
```typescript
properties = properties.slice(0, 6); // Change 6 to desired number
```

**Modify Budget Filters:**
Edit the `filterByBudget` function to adjust budget ranges.

## API Integration

The chatbot uses:
- `GET /api/properties` - Fetches properties with filters
- Query parameters:
  - `location` - Filter by location
  - `type` - Filter by property type
  - `bedrooms` - Filter by bedrooms
  - `lightweight=true` - Excludes large fields for faster loading

## Styling

The chatbot uses:
- Fixed position (bottom-right)
- Card-based UI with Tailwind CSS
- Responsive design (max-width on mobile)
- Primary color scheme matching site theme

## Future Enhancements

Possible improvements:
- [ ] Save user preferences for future searches
- [ ] Email property suggestions to user
- [ ] Integration with enquiry form
- [ ] AI-powered natural language understanding
- [ ] Multi-language support
- [ ] Chat history persistence
- [ ] Property comparison feature

## Troubleshooting

### Chatbot not appearing
- Check if component is imported in `app/(client)/layout.tsx`
- Verify no CSS conflicts (z-index should be 50)

### Properties not showing
- Check API endpoint `/api/properties` is working
- Verify MongoDB connection
- Check browser console for errors

### Questions not progressing
- Check if all required fields are answered
- Verify API responses are successful
- Check browser console for JavaScript errors

## Technical Details

### State Management
- Uses React `useState` for:
  - Chat messages
  - User preferences
  - Current step
  - Suggested properties
  - Loading state

### Property Filtering
- Client-side filtering for budget and bathrooms
- Server-side filtering via API for location, type, bedrooms

### URL Generation
- Uses `getPropertyUrl()` utility function
- Generates SEO-friendly URLs: `/properties/{segment}/{slug}`

---

**The chatbot is ready to use!** It will appear automatically on all client-facing pages. 🚀
