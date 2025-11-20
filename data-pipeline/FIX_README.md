# Fix for Issue #6: Result Overcounting

## Problem
The search results were overcounting name mentions because flight log rows contain multiple name columns (e.g., "Bill Clinton | Clinton, Bill | Bill Clinton | BC"), and each occurrence was counted separately.

**Examples:**
- Bill Clinton: Showed 100 results but only ~25 actual flight entries
- Donald Trump: Showed 4 results but only 1 actual flight entry

## Solution
Implemented **proximity-based deduplication** in `process_manual_v1.py`:

1. **`deduplicate_matches()`** - Groups matches within 200 characters (same table row)
2. **`select_best_match()`** - Keeps the longest/most complete name variant from each group

## How to Regenerate people_index.json

### Step 1: Test the Deduplication Logic (Optional)
```bash
cd data-pipeline
python3 test_deduplication.py
```

You should see all tests pass, demonstrating:
- Single flight row: 5 matches → 1 match
- Multiple flights: 6 matches → 2 matches
- Bill Clinton scenario: 100 matches → 25 matches

### Step 2: Regenerate the Index
```bash
cd data-pipeline
python3 process_manual_v1.py
```

This will:
1. Read `source_manifest.json` and `curated_names.json`
2. Process all P0 priority PDFs with deduplication enabled
3. Generate new `output/people_index.json` with corrected counts
4. Update `source_manifest_updated.json` with SHA-256 hashes

### Step 3: Deploy the Updated Index
```bash
# Copy the new index to the website
cp data-pipeline/output/people_index.json website/public/people_index.json

# Commit and push
git add website/public/people_index.json
git commit -m "Fix: Deduplicate proximity matches to fix overcounting (Issue #6)"
git push

# Vercel will auto-deploy
```

## Expected Results After Fix

### Bill Clinton
- **Before:** 100 matches in 1 document
- **After:** ~20-25 matches (one per actual flight entry)

### Donald Trump
- **Before:** 4 matches in 1 document
- **After:** 1 match (one flight entry)

### Other Names
Similar reductions for anyone appearing in flight logs with multiple name column formats.

## Technical Details

### Deduplication Algorithm
```python
def deduplicate_matches(matches, proximity_threshold=200):
    """
    Groups matches within proximity_threshold characters and
    selects the best (longest) variant from each group.

    For flight logs: Treats "Bill Clinton | Clinton, Bill | Bill Clinton"
    as a single match, keeping "Bill Clinton" (longest variant).
    """
```

### Proximity Threshold
- **200 characters** - Captures all name columns in a single flight log row
- Allows for separate entries that are genuinely distinct (different flights)
- Tested with realistic flight log data structure

### Variant Selection Priority
1. **Longest variant** (more complete name)
2. **First occurrence** (if equal length)

Example: From ["Bill Clinton", "Clinton", "Bill", "BC"], selects "Bill Clinton"

## Files Changed
- `data-pipeline/process_manual_v1.py` - Added deduplication functions
- `data-pipeline/test_deduplication.py` - Test suite (new)
- `data-pipeline/FIX_README.md` - This file (new)

## Testing
After regenerating the index, verify:
1. Navigate to `/bill-clinton` - should show ~20-25 results, not 100
2. Navigate to `/donald-trump` - should show 1 result, not 4
3. Check that distinct entries are still preserved (not over-deduplicated)

## Future Enhancements
For the long-term automated pipeline (mentioned in issue additional context):
- Parse flight log tables directly (structured extraction)
- Use Google Pinpoint collections for document processing
- Implement NER-based name recognition
- See: `Data Pipeline Architecture & Workflow.md`
