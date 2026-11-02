import { Link } from 'react-router';

export function NotFound() {
  return (
    <div className="page">
      <h1>Page not found</h1>
      <p>
        That page does not exist. <Link to="/">Back to the dashboard</Link>
      </p>
    </div>
  );
}
