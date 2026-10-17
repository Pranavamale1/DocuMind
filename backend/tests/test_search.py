
# Database session create karne ke liye
from app.db.database import SessionLocal

# Semantic search service import karo
from app.services.search_service import search_similar_chunks


def main():
    # Database connection open karo
    db = SessionLocal()

    try:
        # Apne uploaded resume se related question poochho
        question = "Which programming languages do I know?"

        # Question ke liye top 3 relevant chunks search karo
        results = search_similar_chunks(
            db=db,
            question=question,
            limit=3
        )

        # Search results print karo
        print(f"\nQuestion: {question}")
        print(f"Results found: {len(results)}")

        for result in results:
            print("\n------------------------------")
            print(f"Document ID: {result['document_id']}")
            print(f"Chunk index: {result['chunk_index']}")
            print(f"Cosine distance: {result['distance']:.4f}")
            print(f"Content: {result['content']}")

    finally:
        # Database connection hamesha close karo
        db.close()


if __name__ == "__main__":
    main()
