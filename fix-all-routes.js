// Quick script to fix all route params
// This is a reference - actual fixes done via search_replace

const routes = [
  'app/api/people/team/[id]/route.ts',
  'app/api/people/brokers/[id]/route.ts',
  'app/api/people/owners/[id]/route.ts',
  'app/api/people/clients/[id]/route.ts',
  'app/api/hero-images/[id]/route.ts',
  'app/api/homepage-areas/[id]/route.ts',
];

// Pattern: { params }: { params: { id: string } } -> { params }: { params: Promise<{ id: string }> }
// Then: params.id -> const { id } = await params; ... id

console.log('Routes to fix:', routes.length);

