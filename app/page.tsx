import { BlogPosts } from 'app/components/posts'

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        My Portfolio
      </h1>
      <p className="mb-4">
        {`I'm a ML Engineer, community builder, entrepeneur and statistics enthusiast, sharing personal views on AI
        ML, tech, experiment meta-analysis and more.
        `}
      </p>
      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  )
}
