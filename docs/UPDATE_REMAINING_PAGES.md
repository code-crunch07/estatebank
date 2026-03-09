# Update Remaining Pages - Quick Reference

Due to timeouts, here's a quick guide for updating remaining pages. All follow the same pattern as Leads/Owners.

## Pattern Applied:

1. **Remove mock data array**
2. **Add interface** for data type
3. **Add state**: `isLoading`, `isRefreshing`
4. **Add `fetchData()`** function
5. **Update forms** to POST/PUT to API
6. **Update delete** to DELETE from API
7. **Update table** to use `_id` instead of `id`
8. **Add refresh button**
9. **Add loading states** in table

## Files Updated So Far:
✅ Leads (`app/(dashboard)/dashboard/crm/leads/page.tsx`)
✅ Owners (`app/(dashboard)/dashboard/people/owners/page.tsx`)
✅ Enquiries (`app/(dashboard)/dashboard/communication/enquiries/page.tsx`)
🔄 Clients (`app/(dashboard)/dashboard/people/clients/page.tsx`) - Partially updated

## Remaining Files Need:
- Update table rendering (use `client._id` instead of `client.id`)
- Update CardTitle section (add refresh button)
- Update ClientForm interface
- Update pagination to use API pagination

## Next Pages:
- Brokers
- Locations  
- Areas
- Contacts
- Property Types
- Capacities
- Occupancy
- Lead Sources

Each follows the exact same pattern!


