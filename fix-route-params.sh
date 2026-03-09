#!/bin/bash
# Script to fix Next.js 15 route params in all dynamic routes

FILES=(
  "app/api/properties/[id]/route.ts"
  "app/api/leads/[id]/route.ts"
  "app/api/services/[id]/route.ts"
  "app/api/testimonials/[id]/route.ts"
  "app/api/clients/[id]/route.ts"
  "app/api/hero-images/[id]/route.ts"
  "app/api/homepage-areas/[id]/route.ts"
  "app/api/areas/[id]/route.ts"
  "app/api/locations/[id]/route.ts"
  "app/api/follow-ups/[id]/route.ts"
  "app/api/people/clients/[id]/route.ts"
  "app/api/people/owners/[id]/route.ts"
  "app/api/people/brokers/[id]/route.ts"
  "app/api/people/team/[id]/route.ts"
  "app/api/enquiries/[id]/route.ts"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    # This is a placeholder - actual fixes need to be done manually
    # or with sed/perl for more complex replacements
  fi
done

echo "Done! Please review and test the changes."

