import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

export default function AboutLanding() {
  const links = [
    { label: "About T.B. Lulla", to: "/about-tb-lulla" },
    { label: "About Kishor Lulla", to: "/about-kishor-lulla" },
  ];

  return (
    <Layout>
      <section className="container-max py-10">
        <h1 className="text-3xl font-bold mb-6">About Us</h1>
        <p className="text-muted-foreground mb-6">
          Learn more about our founders and inspirations:
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="block rounded border p-4 hover:border-orange-400 hover:text-orange-500 transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}
