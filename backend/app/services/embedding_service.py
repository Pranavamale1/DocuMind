
# Sentence Transformers se embedding model load karne ke liye
from sentence_transformers import SentenceTransformer

# Model ka naam ek jagah define kiya hai
MODEL_NAME = "all-MiniLM-L6-v2"

# Model ko load karo
# Pehli baar run karne par model internet se download ho sakta hai
embedding_model = SentenceTransformer(MODEL_NAME)


def generate_embedding(text: str) -> list[float]:
    """
    Ek text ko numerical embedding vector mein convert karta hai.
    """

    # Empty text ke liye embedding generate mat karo
    if not text.strip():
        raise ValueError("Text cannot be empty")

    # Text ka embedding generate karo
    vector = embedding_model.encode(
        text,
        normalize_embeddings=True
    )

    # NumPy array ko Python list mein convert karke return karo
    return vector.tolist()


def generate_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Multiple text chunks ke embeddings ek saath generate karta hai.
    """

    # Empty list hone par empty result return karo
    if not texts:
        return []

    # Har chunk ka embedding batch mein generate karo
    vectors = embedding_model.encode(
        texts,
        normalize_embeddings=True,
        batch_size=32,
        show_progress_bar=False
    )

    # Saare vectors ko Python lists mein convert karo
    return vectors.tolist()
