export async function generateStaticParams() {
    // You can hardcode or fetch from somewhere
    const courseIds = ["1", "2", "3", "4", "5"]
  
    return courseIds.map((id) => ({ id }))
  }