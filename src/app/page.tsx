import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-white text-slate-900">
      <section className="mx-auto max-w-6xl px-4 py-20">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-600">
          Discover destinations like a local
        </p>
        <h1 className="mt-3 text-4xl font-bold md:text-5xl">
          Find trusted local guides for real, personal travel experiences
        </h1>
        <p className="mt-5 max-w-2xl text-slate-600">
          From hidden food streets to cultural stories and city photography
          walks, Local Guide helps you connect with passionate locals.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/explore"
            className="rounded-md bg-sky-600 px-5 py-3 font-medium text-white hover:bg-sky-700"
          >
            Explore Tours
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-slate-300 px-5 py-3 font-medium hover:bg-slate-50"
          >
            Become a Guide
          </Link>
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 md:grid-cols-3">
          {["Dhaka", "Sylhet", "Chattogram"].map((city) => (
            <div key={city} className="rounded-lg border bg-white p-5">
              <h3 className="text-lg font-semibold">{city}</h3>
              <p className="mt-2 text-sm text-slate-600">
                Top-rated local guides and unique tours available.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            "Search tours by city and category",
            "Request a booking from a local guide",
            "Pay securely and enjoy your trip",
          ].map((item) => (
            <div key={item} className="rounded-lg border p-5 text-slate-700">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-semibold">Top-rated guides</h2>
          <p className="mt-2 text-slate-600">
            Guide cards will be loaded from your backend users endpoint.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-semibold">Why choose us</h2>
        <ul className="mt-4 grid gap-3 text-slate-700 md:grid-cols-2">
          <li className="rounded border p-4">Verified guide profiles</li>
          <li className="rounded border p-4">Flexible booking requests</li>
          <li className="rounded border p-4">Real traveler reviews</li>
          <li className="rounded border p-4">Secure online payments</li>
        </ul>
      </section>

      <section className="bg-sky-600 py-14 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-semibold">Ready for your next journey?</h2>
          <p className="mt-2 text-sky-100">
            Sign up and start discovering authentic local experiences.
          </p>
        </div>
      </section>
    </div>
  );
}
