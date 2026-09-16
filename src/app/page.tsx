import { VocabularyApp } from "@/components/VocabularyApp";
import { getExamSources } from "@/lib/exam";
import { getAllTerms, getCategories } from "@/lib/terms";

export default function HomePage() {
  const terms = getAllTerms();
  const categories = getCategories();
  const examSources = getExamSources();

  return (
    <VocabularyApp
      terms={terms}
      categories={categories}
      examSources={examSources}
    />
  );
}
