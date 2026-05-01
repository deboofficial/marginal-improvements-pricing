export function getServerSideProps() {
  return { redirect: { destination: '/pricing.html', permanent: false } }
}
export default function Home() { return null }
