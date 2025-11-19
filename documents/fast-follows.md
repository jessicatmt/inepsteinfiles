# Fast-Follow Features
**Post-Launch Enhancements**

## Priority 1: User Feedback & Data Collection

### "FAKE NEWS!!!" Button
**Purpose:** Let users signal verification issues and help prioritize document review

**Functionality:**
- Clickable text/button: "FAKE NEWS!!!"
- On click: Records event with:
  - Name searched
  - Timestamp
  - Document(s) shown
  - User session ID (anonymous)
- **Use case:** Users can quickly signal "needs more research to verify"
- **Backend:** Simple analytics event or API endpoint
- **Priority:** High - helps identify which results need verification review

**Implementation:**
```typescript
// Example event tracking
onClick={() => {
  trackEvent('fake_news_flag', {
    name: person.slug,
    documents: person.documents.map(d => d.filename),
    timestamp: new Date().toISOString()
  });
}}
```

**Benefits:**
1. Crowdsourced quality control
2. Identifies verification priorities
3. Viral engagement ("Did you see what people are flagging?")
4. Data for improving search accuracy

---

## Other Fast-Follows (TBD)
- Advanced search filters (by document type, date range)
- Email notifications for new documents
- Public API for researchers
- Mobile app

---
**Created:** 2024-11-19
**Status:** Proposed for post-V1 launch
