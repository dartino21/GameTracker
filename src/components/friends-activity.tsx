import { Gamepad2, Star, Users } from "lucide-react"

type ActivityItem = {
  id: string
  user: string
  action: string
  game: string
  rating: number | null
  timeAgo: string
}

const PLACEHOLDER_ACTIVITY: ActivityItem[] = [
  {
    id: "1",
    user: "alex",
    action: "прошёл",
    game: "Elden Ring",
    rating: 5,
    timeAgo: "2 часа назад",
  },
  {
    id: "2",
    user: "marina",
    action: "играет в",
    game: "Baldur's Gate 3",
    rating: null,
    timeAgo: "5 часов назад",
  },
  {
    id: "3",
    user: "den",
    action: "оценил",
    game: "Hollow Knight",
    rating: 4,
    timeAgo: "вчера",
  },
  {
    id: "4",
    user: "kira",
    action: "добавила в планы",
    game: "Silksong",
    rating: null,
    timeAgo: "2 дня назад",
  },
]

function getInitials(user: string) {
  return user.slice(0, 2).toUpperCase()
}

export function FriendsActivity() {
  return (
    <section aria-labelledby="activity-heading">
      <h2
        className="mb-4 flex items-center gap-2 border-b border-border pb-2 text-xl font-semibold tracking-tight"
        id="activity-heading"
      >
        <Users aria-hidden="true" className="size-5 text-primary" />
        Активность друзей
      </h2>

      <div className="border border-border bg-card">
        <ul className="divide-y divide-border">
          {PLACEHOLDER_ACTIVITY.map((item) => (
            <li className="flex items-center gap-3 p-3" key={item.id}>
              <span className="flex size-9 shrink-0 items-center justify-center border border-primary/50 bg-secondary text-xs font-semibold text-primary">
                {getInitials(item.user)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-muted-foreground">
                  <span className="font-medium text-primary">
                    @{item.user}
                  </span>{" "}
                  {item.action}{" "}
                  <span className="font-medium text-foreground">
                    {item.game}
                  </span>
                </p>
                <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  {item.rating ? (
                    <span className="inline-flex items-center gap-0.5 text-primary">
                      <Star
                        aria-hidden="true"
                        className="size-3 fill-primary text-primary"
                      />
                      {item.rating}/5
                    </span>
                  ) : (
                    <Gamepad2 aria-hidden="true" className="size-3" />
                  )}
                  {item.timeAgo}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <p className="border-t border-border p-3 text-center text-xs text-muted-foreground">
          Лента друзей появится здесь, когда вы добавите друзей.
        </p>
      </div>
    </section>
  )
}
