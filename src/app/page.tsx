import { VocabularyApp } from "@/components/VocabularyApp";
import { getExamSourceCount } from "@/lib/exam";
import { getAllTerms, getCategories } from "@/lib/terms";

export default function HomePage() {
  const terms = getAllTerms();
  const categories = getCategories();
  const examSourceCount = getExamSourceCount();

  return (
    <VocabularyApp
      terms={terms}
      categories={categories}
      examSourceCount={examSourceCount}
    />
  );
}
