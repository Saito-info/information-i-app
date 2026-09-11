import { VocabularyApp } from "@/components/VocabularyApp";
import { getAllExamQuestions } from "@/lib/exam";
import { getAllTerms, getCategories } from "@/lib/terms";

export default function HomePage() {
  const terms = getAllTerms();
  const categories = getCategories();
  const examQuestions = getAllExamQuestions();

  return (
    <VocabularyApp
      terms={terms}
      categories={categories}
      examQuestions={examQuestions}
    />
  );
}
