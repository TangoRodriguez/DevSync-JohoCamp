// This component receives a list of teams and displays clickable cards.
// Each card links to /[slug]. Use Tailwind for styling; later replace with shadcn/ui Card.
// Props: teams: Array<{ name: string; slug: string }>
import Link from 'next/link'

export type Team = { name: string; slug: string }

export default function TeamSelector({ teams }: { teams: Team[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {teams.map((t) => (
        <li key={t.slug} className="border rounded p-4 hover:bg-gray-50">
          <Link href={`/${t.slug}`} className="font-medium">{t.name}</Link>
        </li>
      ))}
    </ul>
  )
}
