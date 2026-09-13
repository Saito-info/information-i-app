import { VocabularyApp } from "@/components/VocabularyApp";
import {
  getAllExamQuestions,
  getExamSourceLabel,
  getExamSources,
} from "@/lib/exam";
import { getAllTerms, getCategories } from "@/lib/terms";

export default function HomePage() {
  const terms = getAllTerms();
  const categories = getCategories();
  const examQuestions = getAllExamQuestions();
  const examSources = getExamSources();
  const examSourceLabel = getExamSourceLabel();

  return (
    <VocabularyApp
      terms={terms}
      categories={categories}
      examQuestions={examQuestions}
      examSources={examSources}
      examSourceLabel={examSourceLabel}
    />
  );
}
