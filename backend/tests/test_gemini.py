from app.services.llm_service import generate_answer

answer = generate_answer(
    question="Which programming languages do I know?",
    context="Technical Skills: Dart, Java, SQL, JavaScript"
)

print("Gemini Answer:")
print(answer)
