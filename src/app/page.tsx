import { VocabularyApp } from "@/components/VocabularyApp";
import {
  getAllExamQuestions,
  getExamSections,
  getExamSourceLabel,
} from "@/lib/exam";
import { getAllTerms, getCategories } from "@/lib/terms";

export default function HomePage() {
  const terms = getAllTerms();
  const categories = getCategories();
  const examQuestions = getAllExamQuestions();
  const examSections = getExamSections();
  const examSourceLabel = getExamSourceLabel();

  return (
    <VocabularyApp
      terms={terms}
      categories={categories}
      examQuestions={examQuestions}
      examSections={examSections}
      examSourceLabel={examSourceLabel}
    />
  );
}
