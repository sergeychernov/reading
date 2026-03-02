import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

export default function Home(): ReactNode {
  return (
    <Layout title="Reading Docs" description="Architecture and development plans">
      <main className="container margin-vert--xl">
        <h1>Reading documentation</h1>
        <p>Current project structure and planned development work.</p>
        <ul>
          <li>
            <Link to="/docs/architecture">Architecture</Link>
          </li>
          <li>
            <Link to="/docs/roles">Roles</Link>
          </li>
        </ul>
      </main>
    </Layout>
  );
}
