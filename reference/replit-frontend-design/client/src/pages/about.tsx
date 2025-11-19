import { Link } from "wouter";

export default function About() {
  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-3xl mx-auto space-y-12">
        <div className="text-center">
          <Link href="/">
            <a className="text-4xl font-bold uppercase hover:underline" data-testid="link-home">
              In The Epstein Files?
            </a>
          </Link>
        </div>

        <div className="space-y-8 text-base">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold uppercase">About This Site</h2>
            <p>
              This website allows you to search publicly available court documents, depositions, 
              and flight logs related to Jeffrey Epstein. The goal is to provide clear, factual 
              information about who appears in these documents.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold uppercase">Sources</h2>
            <p>All information comes from publicly released court documents including:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <a 
                  href="https://www.documentcloud.org/documents/6250471-Epstein-Docs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                  data-testid="link-source-1"
                >
                  Giuffre v. Maxwell depositions and court filings
                </a>
              </li>
              <li>
                <a 
                  href="https://www.documentcloud.org/documents/1507315-epstein-flight-manifests" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                  data-testid="link-source-2"
                >
                  Flight logs and passenger manifests
                </a>
              </li>
              <li>
                <a 
                  href="https://www.documentcloud.org/documents/1508273-jeffrey-epsteins-little-black-book-redacted" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                  data-testid="link-source-3"
                >
                  Contact lists and address books
                </a>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold uppercase">Important Legal Notes</h2>
            <p className="font-bold">
              Being named in these documents does NOT mean someone committed a crime or was aware 
              of illegal activities.
            </p>
            <p>
              Many people appear in flight logs, address books, or depositions simply because they 
              had social, business, or philanthropic connections to Epstein. Some individuals have 
              denied wrongdoing or were never accused of any misconduct.
            </p>
            <p>
              This site presents only what appears in public court documents. It does not make 
              claims about guilt, innocence, or involvement in illegal activities.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold uppercase">Disclaimer</h2>
            <p>
              This website is for informational purposes only. All documents referenced are 
              publicly available court records. If you believe any information is inaccurate, 
              please contact us.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold uppercase">Contact</h2>
            <p>
              Created by{" "}
              <a 
                href="https://twitter.com/jessicasuarez" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
                data-testid="link-contact"
              >
                @jessicasuarez
              </a>
            </p>
          </section>
        </div>

        <div className="text-center pt-8 border-t">
          <Link href="/">
            <a className="text-sm uppercase hover:underline" data-testid="link-back-home">
              ← Back to search
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
