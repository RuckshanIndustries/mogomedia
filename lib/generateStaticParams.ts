export async function generateStaticParams() {
  // In a real app, fetch from Firestore or API
  const courseIds = ["1", "2", "3", "4", "5"];
  return courseIds.map((id) => ({ id }));
}
