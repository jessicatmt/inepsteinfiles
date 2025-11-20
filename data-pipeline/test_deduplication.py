#!/usr/bin/env python3
"""
Test script to verify deduplication logic fixes overcounting bug.

This demonstrates how the deduplication function works on simulated
flight log data where names appear multiple times in the same row.
"""

import sys
from pathlib import Path

# Add parent directory to path to import from process_manual_v1
sys.path.insert(0, str(Path(__file__).parent))

from process_manual_v1 import deduplicate_matches, select_best_match


def test_flight_log_deduplication():
    """
    Test case simulating a flight log row with multiple name columns.

    Example row: "Bill Clinton | Clinton, Bill | Bill Clinton | BC"
    Without deduplication: 4 matches
    With deduplication: 1 match (the most complete variant)
    """
    print("=" * 70)
    print("TEST: Flight Log Row Deduplication")
    print("=" * 70)
    print("\nScenario: Single flight log row with multiple name columns")
    print("Row content: 'Bill Clinton | Clinton, Bill | Bill Clinton | BC'")
    print()

    # Simulated matches from a single flight log row (within ~100 chars)
    matches = [
        {'variant': 'Bill Clinton', 'start': 0, 'end': 12, 'matched_text': 'Bill Clinton'},
        {'variant': 'Clinton', 'start': 15, 'end': 22, 'matched_text': 'Clinton'},
        {'variant': 'Bill', 'start': 24, 'end': 28, 'matched_text': 'Bill'},
        {'variant': 'Bill Clinton', 'start': 31, 'end': 43, 'matched_text': 'Bill Clinton'},
        {'variant': 'BC', 'start': 46, 'end': 48, 'matched_text': 'BC'},
    ]

    print(f"Before deduplication: {len(matches)} matches")
    for i, m in enumerate(matches, 1):
        print(f"  {i}. '{m['variant']}' at position {m['start']}-{m['end']}")

    # Apply deduplication
    deduplicated = deduplicate_matches(matches, proximity_threshold=200)

    print(f"\nAfter deduplication: {len(deduplicated)} match")
    for i, m in enumerate(deduplicated, 1):
        print(f"  {i}. '{m['variant']}' at position {m['start']}-{m['end']}")

    print("\n✓ Result: Reduced from 5 matches to 1 match (80% reduction)")
    print()

    return len(deduplicated) == 1


def test_multiple_distinct_entries():
    """
    Test case with multiple distinct flight log entries on the same page.

    Should keep separate matches for truly different occurrences.
    """
    print("=" * 70)
    print("TEST: Multiple Distinct Flight Entries")
    print("=" * 70)
    print("\nScenario: Two flight log rows separated by ~500 characters")
    print()

    # Simulated matches from two different flight log rows
    matches = [
        # First flight (around position 0)
        {'variant': 'Bill Clinton', 'start': 0, 'end': 12, 'matched_text': 'Bill Clinton'},
        {'variant': 'Clinton', 'start': 15, 'end': 22, 'matched_text': 'Clinton'},
        {'variant': 'Bill Clinton', 'start': 24, 'end': 36, 'matched_text': 'Bill Clinton'},

        # Second flight (around position 500)
        {'variant': 'Bill Clinton', 'start': 500, 'end': 512, 'matched_text': 'Bill Clinton'},
        {'variant': 'Clinton', 'start': 515, 'end': 522, 'matched_text': 'Clinton'},
        {'variant': 'Bill', 'start': 524, 'end': 528, 'matched_text': 'Bill'},
    ]

    print(f"Before deduplication: {len(matches)} matches across 2 flight entries")
    print(f"  Flight 1 (pos ~0): 3 matches")
    print(f"  Flight 2 (pos ~500): 3 matches")

    # Apply deduplication with 200-char threshold
    deduplicated = deduplicate_matches(matches, proximity_threshold=200)

    print(f"\nAfter deduplication: {len(deduplicated)} matches")
    for i, m in enumerate(deduplicated, 1):
        print(f"  {i}. '{m['variant']}' at position {m['start']}-{m['end']}")

    print("\n✓ Result: Reduced from 6 matches to 2 matches (one per flight)")
    print()

    return len(deduplicated) == 2


def test_bill_clinton_realistic():
    """
    Realistic test case based on actual Bill Clinton data.

    From the bug report: Bill Clinton shows 100 matches from 1 document,
    but should show much fewer (likely 20-25 actual flight entries).
    """
    print("=" * 70)
    print("TEST: Bill Clinton Realistic Scenario")
    print("=" * 70)
    print("\nScenario: 25 flight log rows, each with 4 name columns")
    print("Expected: 100 raw matches → 25 deduplicated matches")
    print()

    matches = []
    # Simulate 25 flight log rows, each with 4 matches within close proximity
    for flight_num in range(25):
        base_pos = flight_num * 500  # Each flight ~500 chars apart

        # Each row has 4 name variants in close proximity
        matches.extend([
            {'variant': 'Bill Clinton', 'start': base_pos, 'end': base_pos + 12, 'matched_text': 'Bill Clinton'},
            {'variant': 'Clinton', 'start': base_pos + 15, 'end': base_pos + 22, 'matched_text': 'Clinton'},
            {'variant': 'Bill', 'start': base_pos + 24, 'end': base_pos + 28, 'matched_text': 'Bill'},
            {'variant': 'Bill Clinton', 'start': base_pos + 31, 'end': base_pos + 43, 'matched_text': 'Bill Clinton'},
        ])

    print(f"Before deduplication: {len(matches)} matches")
    print(f"  (25 flights × 4 name columns = 100 matches)")

    deduplicated = deduplicate_matches(matches, proximity_threshold=200)

    print(f"\nAfter deduplication: {len(deduplicated)} matches")
    print(f"  (1 match per flight entry)")

    reduction_pct = ((len(matches) - len(deduplicated)) / len(matches)) * 100
    print(f"\n✓ Result: {reduction_pct:.0f}% reduction in match count")
    print()

    return len(deduplicated) == 25


def main():
    """Run all deduplication tests."""
    print("\n" + "=" * 70)
    print("DEDUPLICATION TEST SUITE - Fix for Issue #6")
    print("=" * 70)
    print("\nTesting proximity-based deduplication to fix result overcounting.")
    print()

    tests = [
        ("Single flight row deduplication", test_flight_log_deduplication),
        ("Multiple distinct entries", test_multiple_distinct_entries),
        ("Bill Clinton realistic scenario", test_bill_clinton_realistic),
    ]

    results = []
    for test_name, test_func in tests:
        try:
            passed = test_func()
            results.append((test_name, passed))
        except Exception as e:
            print(f"\n✗ Test failed with error: {e}\n")
            results.append((test_name, False))

    # Summary
    print("=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)

    all_passed = True
    for test_name, passed in results:
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status}: {test_name}")
        if not passed:
            all_passed = False

    print()
    if all_passed:
        print("✓ All tests passed! Deduplication logic is working correctly.")
        print("\nNext step: Run process_manual_v1.py to regenerate people_index.json")
    else:
        print("✗ Some tests failed. Review deduplication logic.")

    print("=" * 70)

    return 0 if all_passed else 1


if __name__ == '__main__':
    sys.exit(main())
