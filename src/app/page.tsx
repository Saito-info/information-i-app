import { VocabularyApp } from "@/components/VocabularyApp";
import { getAllTerms, getCategories } from "@/lib/terms";

export default function HomePage() {
  const terms = getAllTerms();
  const categories = getCategories();

  return <VocabularyApp terms={terms} categories={categories} />;
}
