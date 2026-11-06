export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-lg text-muted-foreground mb-6">
        Page Not Found
      </p>
      <a
        href="/"
        className="px-4 py-2 bg-primary text-white rounded-lg"
      >
        Go Back Home
      </a>
    </div>
  )
}