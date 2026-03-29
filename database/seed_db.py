"""
Seed the database with the word corpus.
Usage: python seed_db.py
Requires: psycopg2-binary and DATABASE_URL env var set
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
from corpus import WORD_LIST

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/wordle')

try:
    import psycopg2
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    # Create tables
    with open(os.path.join(os.path.dirname(__file__), 'schema.sql')) as f:
        cur.execute(f.read())
    
    # Seed words
    inserted = 0
    for word in WORD_LIST:
        cur.execute(
            "INSERT INTO words (word, source) VALUES (%s, %s) ON CONFLICT (word) DO NOTHING",
            (word, 'curated')
        )
        inserted += cur.rowcount
    
    conn.commit()
    cur.close()
    conn.close()
    print(f"✓ Seeded {inserted} words into database ({len(WORD_LIST)} total in corpus)")

except ImportError:
    print("psycopg2 not installed. Install with: pip install psycopg2-binary")
    print(f"Word corpus has {len(WORD_LIST)} words — stored in corpus.py for in-memory use.")
except Exception as e:
    print(f"Database error: {e}")
    print("Falling back to in-memory corpus (no DB required for the API to work).")
