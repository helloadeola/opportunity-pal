

## Plan: Remove Sample Data and Publish

### 1. Remove sample leads data
- **`src/data/sampleLeads.ts`**: Change `sampleLeads` array to an empty array `[]` so new users start fresh with no pre-loaded leads
- **`src/context/LeadsContext.tsx`**: The `loadLeads` fallback already references `sampleLeads`, so emptying the array is sufficient. Also update `clearAllData` to reset to an empty array instead of sample data.

### 2. How to share with your client

To publish and share the app:

- **Desktop**: Click the **Publish** button (globe icon) in the top-right corner of the editor, then click "Update" to deploy
- **Mobile**: Tap the **...** button in the bottom-right corner, then tap **Publish**

Once published, you'll get a shareable link you can send to your client. The app will be accessible to anyone with that link.

If the published site shows a login screen, we can set the visibility to "public" so anyone with the link can access it without needing an account.

